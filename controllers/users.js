const User = require('../model/user');
const Contact = require('../model/contactModel');
const { Op } = require('sequelize');

exports.getContacts = async (req, res) => {
  try {
    const { id } = req.user;
    const allContacts = await User.findAll({
      where: {
        id: {
          [Op.not]: id,
        },
      },
    });
    res.status(200).json({ success: true, message: "Successfully retrieved contacts", data: allContacts });
  } catch (err) {
    console.log('ERROR IN Getting contacts', err);
    res.status(500).json({ success: false, message: 'ERROR IN GETTING CONTACTS' });
  }
};
exports.getFriends=async (req,res)=>{
  try{
    const {id}=req.user
    const friends=await Contact.findAll({
      where:{
        [Op.or]:[
          {userId:id,requestStatus:"Accepted"},
          {contactId:id,requestStatus:"Accepted"},
        ]
      }
    })
    let userIds=[];
    let contactIds=[];
    for(let i=0 ; i<friends.length; i++) {
      userIds[i]=friends[i].dataValues.userId;
      contactIds[i]=friends[i].dataValues.contactId;
    }
    const response= await User.findAll({
      where:{id:[...userIds,...contactIds]},
    })

    const AllFriends=response.map((contact)=>{
      contact.dataValues.userId=req.user.id;
      return contact;
    })

    res.status(200).json({success: true, message:"success",data:AllFriends})
  }catch(err){
    console.log(err);
    res.status(500).json({ success: false, message: 'ERROR IN GETTING FRIENDS' });
  }
}
exports.getChats = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
    } else {
      res.status(200).json({ success: true, message: 'Retrieved chat', user });
    }
  } catch (err) {
    console.log('ERROR IN Getting contacts', err);
    res.status(500).json({ success: false, message: 'ERROR IN GETTING CONTACTS' });
  }
};

exports.addContact = async (req, res) => {
  const { id } = req.user;
  const { contactId } = req.body;
  try {
    const currentUser = await User.findByPk(id);
    const contact = await Contact.findByPk(contactId);
    console.log("currentUser",currentUser);
    console.log("contactId",contact);
    if (!currentUser) {
      return res.status(404).send({ message: "User or contact not found" });
    }

    const existingContact = await Contact.findOne({
      where: {
        [Op.or]: [
          {
            userId: id,
            contactId: contactId,
          },
          {
            userId: contactId,
            contactId: id,
          },
        ],
      },
    });

    if (existingContact) {
      return res.status(203).json({ message: "Contact already added" });
    }

    await Contact.create({
      requestStatus: "pending",
      userId: id,
      contactId: contactId,
      sentBy: id,
    });

    res.status(200).json({ message: "Contact added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server error" });
  }
};
exports.getRequest =async (req,res)=>{
  const { id } = req.user;
	try {
		const friends = await Contact.findAll({
			where: {
				[Op.or]: [
					{ userId: id, requestStatus: "pending" },
					{ contactId: id, requestStatus: "pending" },
				],
				sentBy: {
					[Op.not]: id,
				},
			},
		});
    console.log(friends)
		const contactIds = friends.map((friend) => friend.dataValues.sentBy);
		const allRequests = await User.findAll({ where: { id: contactIds } });

		res.status(200).json({ success: true, message: "Success", data: allRequests });
    }catch(err){
    console.log(err);
    res.status(500).json({ message: "Internal Server error in GetRequest",error:err});
    }
}
exports.acceptRequest=async(req,res)=>{
    try{
        const {
            user,body:{contactId},
        }=req;
        const [updatedCount]=await Contact.update({
            requestStatus:"Accepted"},
            {
                where:{
                    contactId:user.id,
                    requestStatus:"pending",
                    sentBy:contactId
                }
        })
        if(updatedCount===1){
            res.status(200).json({ success: true, message: 'User updated and accepted' });
        }else{
            res.status(404).json({ success: false, message: 'User not accepted' }); 
        }
    }catch(err){
        console.log('ERROR IN accepting Request', err);
        res.status(500).json({ success: false, message: 'Error in accept request' });       
    }
}
exports.getSelfDetails=async (req,res)=>{
    try{
        const {user}=req;
        const details = await User.findByPk(user.id);
        res.status(200).json({message:"user details found",data:details})
    }catch(err){
        res.status(500).json({ message: "getting self details"});
    }
}