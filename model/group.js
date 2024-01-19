const {DataTypes}=require('sequelize');
const sequelize=require('../util/database');

const group=sequelize.define('Group',{
    profile_picture:{
        type:DataTypes.STRING,
    },
    group_name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    group_description:{
        type:DataTypes.STRING,
    }
});
module.exports=group;
