const Chat=require('../model/messages/message');
const User=require('../model/user');

//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
const multer = require("multer"); // For handling file uploads
const AWS = require("aws-sdk"); // For working with AWS S3
const { Op } = require('sequelize');


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1",  // Use the region code, 
});


const s3 = new AWS.S3();

// Configure Multer for file uploads
const storage = multer.memoryStorage();//implementation configured to store files in memory as Buffer objects
const upload = multer({ storage });//responsible for processing files uploaded via Multer


exports.sendAttachment = async (req, res) => {
	const { user } = req;
	const { receiverId } = req.params;

	// Use upload.single('file') middleware to process the file upload
	upload.single("file")(req, res, async (err) => {
		if (err) {

			// Handle the multer error (e.g., file too large, unsupported file type)
			console.error("Multer error:", err);
			return res.status(400).json({ success: false, error: "File upload failed." });
		}

		// Ensure that a file was uploaded
		if (!req.file) {
			return res.status(400).json({ success: false, error: "No file uploaded." });
		}

		// Prepare a unique file name
		const fileName = `${req.file.originalname}_${user.id}_${new Date().toISOString()}.jpg`;

		// Define parameters for the S3 upload
		const s3Params = {
			Bucket: process.env.BUCKET_NAME,
			Key: fileName,  // Specify the key under which the file will be stored
			Body: req.file.buffer,   // File content
			ACL: process.env.AWS_BUCKET_ACCESS,
		};

		// Upload the file to S3
		try {
			const data = await s3.upload(s3Params).promise();

			// The file has been successfully uploaded to S3, and data.Location contains the S3 URL
			const s3FileLocation = data.Location;

			// Save file details to the database
			const saveFileToDb = await Chat.create({
				content: req.file.originalname,
				conversation_type: "user",
				timeStamp: new Date(),
				senderId: user.id,
				receiverId,
				fileLocation: s3FileLocation,
				isAttachment: true,
			});

			res.status(200).json({ success: true, data:saveFileToDb });
		} catch (err) {
			console.error("S3 upload error:", err);
			res.status(500).json({ success: false, error: "Error uploading file to S3." });
		}
	});
};
exports.getMessage=async(socket,message)=>{
	try{
		const {id,receiverId}=message;
		const msgDetails=await Chat.findByPk(id);

		const receiverDetails=await User.findByPk(receiverId);
        
        const newMessage={
            ...msgDetails.dataValues,
            messageStatus:'received',
            profile_picture:receiverDetails.dataValues.profile_picture
        }
		socket.broadcast.emit("receive-message",newMessage);
		console.log("send broadcast");
		
	}catch(err){
        console.log(err);
        res.status(500).json({success:false, messageStatus:"Internal server Error.Error in get chats",err})
    }
}
exports.addChat=async(socket,message)=>{
    try{
        const {user}=socket;
        const {content,receiver,conservation_type,timeStamp}=message;
        const newchatMesage=await Chat.create({
            content:content,
            timeStamp:timeStamp,
            conservation_type:conservation_type,
            senderId:user.id,
            receiverId:receiver
        })
        const receiverDetails=await User.findByPk(receiver);
        
        const newMessage={
            ...newchatMesage.dataValues,
            messageStatus:'received',
            profile_picture:receiverDetails.dataValues.profile_picture
        }
        socket.broadcast.emit("receive-message",newMessage);
		console.log("send broadcast");
		
	}catch(err){
        console.log(err);
        res.status(500).json({success:false, messageStatus:"Internal server Error.Error in get chats",err})
    }
}
exports.sendGroupChats = async(socket,message) => {
	try {
		const { user } = socket;
		const { content, receiver, conversation_type, timeStamp } = message;

		const newGroupMessage = await Chat.create({
			content: content,
			timeStamp: timeStamp,
			senderId: user.id,
			groupId: receiver,
			conversation_type: conversation_type,
		});
		const newMessage = {
			...newGroupMessage.dataValues,
			messageStatus: "received",
		};
		socket.broadcast.emit("group-message",newMessage);
		console.log("send group broadcast");
    } catch (error) {
		console.error("Error sending group chat:", error);
	}
};
exports.getChats=async(req,res)=>{
    const limit=100;
    try{
        const user=req.user;
        const {id}=req.user;
        const {receiver_id}=req.params;

        console.log("reciver",receiver_id);
        console.log(id);
        const dbMessages = await Chat.count({
			where: {
				[Op.or]: [
					{ senderId: id, receiverId: receiver_id },
					{ senderId: receiver_id, receiverId: id },
				],
				conservation_type: "user",
			},
		});
        console.log("dbmessgaes",dbMessages)
        let offset=dbMessages<=100?0:dbMessages-limit;//set the offset of the page dbmessages < limit(100)
        const response=await Chat.findAll({
            where:{
                [Op.or]:[
                    {senderId:id,receiverId:receiver_id},
                    {senderId:receiver_id,receiverId:id}
                ],
                conservation_type:"user",
            },
            order:[['timeStamp', 'ASC']],
            offset:offset,// skips the offset rows before beginning to return the rows.
            limit:limit,//the number of rows (row_count) returned by the query
        })

        const reciverDetails=await User.findByPk(receiver_id)
        const messages=response.map((obj)=>({
            ...obj.dataValues,
            messageStatus:obj.dataValues.senderId==id?'sent':'received',
        }))
        
        res.status(200).json({success:true, messageStatus:"Retrieved all Chats",data:{messages,user:user,details:reciverDetails}})
    }catch(err){
        console.log(err);
        res.status(500).json({success:false, messageStatus:"Internal server Error.Error in get chats",err})
    }
}
exports.getGroupChats = async (req, res) => {
	try {
		console.log('req.params',req.params)
		const limit = 100;
		const { id } = req.params;
		const { user } = req;
		const dbMessages = await Chat.count({
			where: {
				groupId: id,
			},
		});

		let offset = dbMessages <= 100 ? 0 : dbMessages - limit;
		const response = await Chat.findAll({
			where: {
				groupId: id,
			},
			order: [["timestamp", "ASC"]],
			offset: offset,
			limit: limit,
		});

		const messages = response.map((obj) => ({
			...obj.dataValues,
			messageStatus: obj.dataValues.senderId == user.id ? "sent" : "received",
		}));

		res.status(200).json({
			success: true,
			message: "Retrieved All Chats",
			data: messages,
		});
	} catch (error) {
		console.error("Error getting group chats:", error);
		res.status(500).json({
			success: false,
			message: "Internal Server Error. Error Getting Chats",
		});
	}
};