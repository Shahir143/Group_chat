const {DataTypes}=require('sequelize');
const sequelize=require('../util/database');

const Contact =sequelize.define("Contact",{
    requestStatus:{
        type:DataTypes.ENUM('Pending','Accepted'),
        allowNull:false,
        defaultValue:"Pending",
    },
    sentBy:{
        type:DataTypes.INTEGER,
        allowNull:false,
    }
});

module.exports=Contact;