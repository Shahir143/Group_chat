const {DataTypes}=require('sequelize');
const sequelize=require('../util/database');

const groupMember=sequelize.define('GroupMember',{
    is_admin:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
     },
});
module.exports=groupMember;