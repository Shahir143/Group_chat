const Group=require('../model/group')
const GroupMember=require('../model/groupMember');

const User=require('../model/user');
const {Op}=require('sequelize');
const sequelize=require('../util/database');

exports.createGroup = async(req,res)=>{
    const t = await sequelize.transaction();
    try {
        const {group_name, group_description,profile_picture}=req.body;
        const {user}=req;
        
        const group=await Group.create({
            group_name:group_name,
            group_description:group_description,
            profile_picture:profile_picture,
            createdByUserId:user.id,
        },{transaction:t})


        await GroupMember.create({
            userId:group.createdByUserId,
            groupId:group.id,
            is_admin:true,
        },{
            transaction:t
        })
        await t.commit();
        res.status(200).json({success:true,message:"successfully created",data:group})
    }catch(e){
        await t.rollback();
        res.status(500).json({success:false,message:"INTERNAL FAILED"},e);}
}
exports.getgroups=async(req,res)=>{
    try{
        const{user}=req;
        const groupMembers=await GroupMember.findAll({
            where:{
                userId:user.id,
            }
        })
        

        const groupIds=groupMembers.map((group)=>group.groupId);
        const groups=await Group.findAll({where :{id:groupIds}});

        res.status(200).json({success:true,data:groups});
    }catch(e){res.status(500).json({success:false,message:"INTERNAL FAILED"});}

}
exports.inviteMember=async(req,res)=>{
    try{
        const {user}=req;
        const {group_id}=req.params;
        const user_ids=req.body.user_ids;

        const group=await Group.findByPk(group_id);

        if(!group){
            res.status(404).json({message:"Group not found"});
        }
        user_ids.forEach(async(user_id)=>{
            await GroupMember.create({
                groupId:group_id,
                userId:user_id,
                is_admin:false
            })
        })
        res.status(200).json({success:true,message:`Successfully invited`})
    }catch(e){
        console.log(e);res.status(500).json({success:false,message:"INTERNAL FAILED IN INVITE"});}
}

exports.isAdmin=async (req,res)=>{
    try {
		const { group_id } = req.params;
		const { user } = req;

		const groupMember = await GroupMember.findOne({
			where: {
				groupId: group_id,
				is_admin: true,
                userId: user.id
			},
		});
        console.log(user.id);
		const isAdmin = groupMember && groupMember.userId === user.id;

		res.status(200).json({ success: true,isAdmin });
    }catch(e){
        console.log(e);res.status(500).json({success:false,message:"INTERNAL FAILED IN ADMIN"});}
}

exports.getContacts=async(req,res)=>{
    try{
        const { group_id } = req.params;
		const { user } = req;

		const existingMembers = await GroupMember.findAll({
			where: {
				groupId: group_id,
				userId: {
					[Op.ne]: user.id, // Exclude members with userId equal to user.id
				},
			},
			attributes: ["userId", "is_admin"],
		});

		const existingMembersIds = existingMembers.map((existingMember) => {
			return existingMember.userId;
		});

		existingMembersIds.push(user.id);

		const nonExistingUsers = await User.findAll({
			where: { id: { [Op.notIn]: existingMembersIds } },
			attributes: ["username", "id"],
		});
		existingMembersIds.pop();

		const existingUsers = await User.findAll({
			where: { id: { [Op.in]: existingMembersIds } },
			attributes: ["username", "id"],
		});

		const nonAdminMembers = await GroupMember.findAll({
			where: {
				groupId: group_id,
				is_admin: false,
			},
		});
		const nonAdminIds = nonAdminMembers.map((nonAdminUser) => {
			return nonAdminUser.userId;
		});
		const nonAdminUsers = await User.findAll({
			where: { id: { [Op.in]: nonAdminIds } },
			attributes: ["username", "id"],
		});

		const data = {
			nonExistingUsers: nonExistingUsers,
			existingUsers: existingUsers,
			nonAdminUsers: nonAdminUsers,
		};

		res.status(200).json({ success: true, data: data });

    }catch(e){
        console.log(e);
        res.status(500).json({success:false,message:"INTERNAL FAILED IN GEETING CONTACTS"});} 
}

exports.deleteMembers=async(req,res)=>{
    try{
        const {user_ids}=req.body;
        const {user}=req;
        const {group_id}=req.params;

        if(!Array.isArray(user_ids)){
            return res.status(400).json({success: false, message:"user_ids must be an array"})
        }

        if(user_ids.length===0){
            return res.status(400).json({success: false, message:"user_ids cannot be empty"})
        }

        const deleteUsers=await GroupMember.destroy({
            where:{
                [Op.and]:{
                    groupId:group_id,
                    userId:{[Op.in]:user_ids}
                }
            }
        })

        if(deleteUsers>0){
            res.status(200).json({success:true,message:"members deleted successfully"});
        }else{
            res.status(200).json({success:true,message:"No members were deleted"});
        }
    }catch(e){
        if (error.name === "SequelizeDatabaseError") {
			// Handle database-specific errors
			res.status(500).json({ success: false, error: "Database error" });
		} else {
			// Handle general errors
			res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
}
exports.ismakeAdmin=async(req,res)=>{
    try{
        const { user } = req;
		const { user_ids } = req.body;
		const { group_id } = req.params;

		if (!Array.isArray(user_ids)) {
			return res.status(400).json({ success: false, error: "user_ids must be an array" });
		}

		if (user_ids.length === 0) {
			return res.status(400).json({ success: false, error: "user_ids cannot be empty" });
		}

		const updateAdmin = await GroupMember.update(
			{ is_admin: true },
			{
				where: {
					[Op.and]: {
						groupId: group_id,
						userId: { [Op.in]: user_ids },
					},
				},
			},
		);

		if (updateAdmin[0] > 0) {
			// If any users were updated, send a success response
			res.status(200).json({ success: true, message: "Admins updated successfully" });
		} else {
			// If no users were updated, send a response indicating no changes
			res.status(200).json({ success: true, message: "No admins were updated" });
		}
    }catch(e){
        if (error.name === "SequelizeDatabaseError") {
			// Handle database-specific errors
			res.status(500).json({ success: false, error: "Database error" });
		} else {
			// Handle general errors
			res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
}
