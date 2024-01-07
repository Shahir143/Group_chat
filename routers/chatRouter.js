const express=require('express');
const route=express.Router();
const auth=require('../middleware/auth');
const chatController=require('../controllers/chatController');

route.get("/get-chat/:receiver_id",auth.authenticationToken,chatController.getChats);

route.post(`/sendMessage`,auth.authenticationToken,chatController.addChat);

route.get(`/getGroupchat/:id`,auth.authenticationToken, chatController.getGroupChats);

route.post("/sendGroupChat", auth.authenticationToken, chatController.sendGroupChats);

module.exports=route;