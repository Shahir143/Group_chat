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
        defaultValue: 'https://i.pinimg.com/236x/fd/14/a4/fd14a484f8e558209f0c2a94bc36b855.jpg',
      },
    bio:{
        type:DataTypes.TEXT,
        defaultValue:'No Calls Direct Msgs'
    },
})

module.exports=user;