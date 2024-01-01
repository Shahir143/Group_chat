const user=require('../model/user');

exports.getContacts=async function(req, res){
    try{
        const {id}=req.user;
        const allContacts = await user.findByPk(id);
        res.status(200).json({success:true,message:"successfully retrived contacts",data:allContacts})
    }catch(err){
        console.log('ERROR IN Getting contacts', err)
        res.status(500).json({ success: false, message: 'ERROR IN GETTING CONTACTS'});
    }
}

exports.getChats=async function(req,res){
    try{
        const {id}=req.params;
        const user=await user.findByPk(id);
        if(!user){
            res.status(404).json({success: false, message: 'user not found'});
        }else{
            res.status(200).json({success:true, message: 'retrivedchat',user});
        }
    }catch(err){
        console.log('ERROR IN Getting contacts', err)
        res.status(500).json({ success: false, message: 'ERROR IN GETTING CONTACTS'});   
    }
}