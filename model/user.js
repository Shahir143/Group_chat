const {DataTypes}=require('sequelize');
const sequelize=require('../util/database');

const user=sequelize.define('users',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phoneNumber:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    lastseen:{
        type:DataTypes.DATE,
        DefaultValue:new Date()
    },profile_picture: {
        type: DataTypes.STRING,
      },
    bio:{
        type:DataTypes.TEXT,
    },
})

module.exports=user;