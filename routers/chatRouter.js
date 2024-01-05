const express=require('express');
const route=express.Router();
const auth=require('../middleware/auth');
const chatController=require('../controllers/chatController');

route.get("/get-chat/:receiver_id",auth.authenticationToken,chatController.getChats);
route.post(`/sendMessage`,auth.authenticationToken,chatController.addChat);

module.exports=route;