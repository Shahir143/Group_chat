const express=require('express');
const route=express.Router();
const auth=require('../middleware/auth');
const chatController=require('../controllers/chatController');

route.get("/get-chat/:receiver_id",auth.authenticationToken,chatController.getChats);

route.post(`/send-message`,auth.authenticationToken,chatController.addChat);

route.get(`/getGroupchat/:id`,auth.authenticationToken, chatController.getGroupChats);

route.post("/send-group-message", auth.authenticationToken, chatController.sendGroupChats);

module.exports=route;