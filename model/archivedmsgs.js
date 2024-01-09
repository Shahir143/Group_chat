const {DataTypes}=require('sequelize');
const sequelize=require('../util/database');

const archivedMsgs=sequelize.define('archivedMsgs',{
    content:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    conservation_type:{
        type:DataTypes.ENUM('user','group'),
        allowNull:false,
        defaultValue:'user',
    },
    timeStamp:{
        type:DataTypes.DATE,
        allowNull:false
    },
    isAttachment:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
    },
    fileLocation:{
        type:DataTypes.TEXT
    }
})

//EXPORT THE MESSAGE MODEL
module.exports=archivedMsgs;