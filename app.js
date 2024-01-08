const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./util/database');
const path =require('path');
const http=require('http');

const userRoute = require('./routers/userRoute');
const chatRoute = require('./routers/chatRouter');
const GrpRoute= require('./routers/groupRoute')

const User = require('./model/user');
const Message = require('./model/messages');
const Contact = require('./model/contactModel');
const Group=require('./model/groupModel');
const GroupMember=require('./model/groupMember');

const authSocket=require('./middleware/socketauth');
const chatController=require("./controllers/chatController");

const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const { start } = require('repl');
const io = socketIo(server);

Contact.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Contact.belongsTo(User, { as: 'contact', foreignKey: 'contactId' });

Group.belongsTo(User, { as:"creater", foreignKey:"createdByUserId"});

GroupMember.belongsTo(User, { as:"user", foreignKey:"userId"});
GroupMember.belongsTo(Group, { as:"group", foreignKey:"groupId"});

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'user', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'group', foreignKey: 'groupId' });

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

	res.sendFile(path.join(__dirname, `/Front-End/Html/${url}`));
});
//handle the webSockets
io.on('connection',(socket)=>{
    authSocket.authenticateSocket(socket,(err)=>{
        if(err){
            console.log("Authentication Error ", err.Message);
            socket.disconnect(true);
        }else{
            console.log("Authentication Success");
            socket.on("send-message",(message)=>{
                chatController.addChat(socket,message);
                console.log("message Sent");
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

