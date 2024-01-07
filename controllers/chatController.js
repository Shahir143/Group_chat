const Chat=require('../model/messages');
const User=require('../model/user');
const { Op } = require('sequelize');

exports.addChat=async(req,res)=>{
    try{
        const user=req.user;
        const {content,receiver,conservationType,timeStamp}=req.body;
        const newchatMesage=await Chat.create({
            content:content,
            timeStamp:timeStamp,
            conservation_type:conservationType,
            senderId:user.id,
            receiverId:receiver
        })
        const receiverDetails=await User.findByPk(receiver);
        
        const newMessage={
            ...newchatMesage.dataValues,
            messageStatus:'received',
            profile_picture:receiverDetails.dataValues.profile_picture
        }
        
        res.status(200).json({success:true,messageStatus:"successfully saved",data:newMessage,user:user})
    }catch(err){
        console.log(err);
        res.status(500).json({success:false, messageStatus:"Internal server Error.Error in get chats",err})
    }
}
exports.sendGroupChats = async(req,res) => {
	try {
		const { user } = req;
		const { content, receiver, conversation_type, timeStamp } = req.body;

		const newGroupMessage = await Chat.create({
			content: content,
			timeStamp: timeStamp,
			senderId: user.id,
			groupId: receiver,
			conversation_type: conversation_type,
		});
		
        const receiverDetails=await User.findByPk(receiver);
		const newMessage = {
			...newGroupMessage.dataValues,
			messageStatus: "received",
		};
		
        res.status(200).json({success:true,messageStatus:"successfully saved",data:{newMessage,details:user,user:receiverDetails}})
	} catch (error) {
		console.error("Error sending group chat:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
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
        let offset=dbMessages<=100?0:dbMessages-limit;
        const response=await Chat.findAll({
            where:{
                [Op.or]:[
                    {senderId:id,receiverId:receiver_id},
                    {senderId:receiver_id,receiverId:id}
                ],
                conservation_type:"user",
            },
            order:[['timestamp', 'ASC']],
            offset:offset,
            limit:limit,
        })

        const reciverDetails=await User.findByPk(receiver_id)
        const messages=response.map((obj)=>({
            ...obj.dataValues,
            messageStatus:obj.dataValues.senderId==id?'sent':'received',
            prevMessages:offset>0?true:false,
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
			prevMessages: offset > 0 ? true : false,
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