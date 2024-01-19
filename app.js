const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./util/database');
const path =require('path');
const http=require('http');
const cron = require("node-cron");// schedules defined using the cron syntax. Perfect for tasks like data backups

const userRoute = require('./route/user-route');
const chatRoute = require('./route/chat-router');
const GrpRoute= require('./route/group-route')

const User = require('./model/user');
const Message = require('./model/message');
const Contact = require('./model/contactModel');
const Group=require('./model/group');
const GroupMember=require('./model/groupMember');
const archived=require('./model/archivedmsgs');

const authSocket=require('./middleware/socketauth');
const chatController=require("./controllers/chatController");

const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server);

Contact.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Contact.belongsTo(User, { as: 'contact', foreignKey: 'contactId' });

Group.belongsTo(User, { as:"creater", foreignKey:"createdByUserId"});

GroupMember.belongsTo(User, { as:"user", foreignKey:"userId"});
GroupMember.belongsTo(Group, { as:"group", foreignKey:"groupId"});

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'user', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'group', foreignKey: 'groupId' });

cron.schedule("0 0 * * *", async () => {
    try{
        //Find the old Messages and Archive
        const oneDayAgo=new Date();
        oneDayAgo.setDate(oneDayAgo.getDate()-1);

        const oldMsg=await Message.findAll({
            where:{
                timeStamp:{
                    [Op.lt]:oneDayAgo,//lt=less than
                }
            }
        })
        await archived.bulkCreate(oldMsg.map((message)=>message.toJSON()))

        await Message.destroy({
            where:{
                timeStamp:{
                    [Op.lt]:oneDayAgo,
                }
            }
        });
        console.log("Chat messages archived and deleted successfully.");
    }catch(error){
        console.log("Error in achiveing deleting chats.");
    }
})
app.use(bodyParser.json());
app.use(cors({
	origin: ["http://localhost:4000","http://127.0.0.1:4000", "http://13.233.123.136:4000", "http://13.233.123.136"],
}));

app.use('/user', userRoute);
app.use('/chat',chatRoute); 
app.use("/groups", GrpRoute); 

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
	let url = req.url;
	if (req.url.charAt(req.url.length - 1) == "?") {
		url = req.url.slice(0, -1);
	}

	res.sendFile(path.join(__dirname, `/public/html/${url}`));
});
//handle the webSockets
io.on('connection',(socket)=>{  // initialize the connection between the client and server, and to send and receive messages.
    authSocket.authenticateSocket(socket,(err)=>{
        if(err){
            console.log("Authentication Error ", err.Message);
            socket.disconnect(true);
        }else{
            console.log("Authentication Success");
            socket.on("send-message",(message)=>{  //This method is responsible for listening for incoming messages.Triggers the provided callback function when a matching event is received.
                chatController.addChat(socket,message);
                console.log("message Sent");
            })
            socket.on("get-message",(message)=>{
                chatController.getMessage(socket,message);
                console.log("get message")
            })
            socket.on("send-group-message",(message)=>{
                console.log('socket');
                chatController.sendGroupChats(socket,message);
                console.log(" group message Sent");
            })            
        }
    })
})
// Sync models with the database
sequelize.sync().then(() => {
    console.log('Server started on port 4000');
    server.listen(4000);
}).catch(err => {
    console.error('Error syncing with database:', err);
});

