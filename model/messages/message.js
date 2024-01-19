const {DataTypes}=require('sequelize');
const sequelize=require('../../util/database');

const Message=sequelize.define('Messages',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    content:{
        type:DataTypes.TEXT,
    },
    conservation_type:{
        type:DataTypes.ENUM('USER','GROUP'),
        allowNull:false,
        defaultValue:'USER',
    },
    timeStamp:{
        type:DataTypes.DATE,
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
module.exports=Message;