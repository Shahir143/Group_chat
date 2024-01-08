const express=require('express');
const route=express.Router();
const auth=require('../middleware/auth');
const logincontroller=require('../controllers/loginController');
const userController=require('../controllers/users');



route.get('/signup',logincontroller.main);
route.post('/signup',logincontroller.signup);
route.post('/login',logincontroller.login);

route.get(`/contacts`,auth.authenticationToken,userController.getContacts);
route.get(`/getchat/:id`,auth.authenticationToken,userController.getChats)
route.get(`/friends`,auth.authenticationToken,userController.getFriends)
route.get(`/contacts`,auth.authenticationToken,userController.getContacts);
route.post(`/addContact`,auth.authenticationToken,userController.addContact);
route.get(`/getRequests`,auth.authenticationToken,userController.getRequest);
route.post(`/addUser`,auth.authenticationToken,userController.acceptRequest);
route.get("/self", auth.authenticationToken, userController.getSelfDetails);
route.get('/getGroupchat/:id',auth.authenticationToken,userController.getGroupChat);
route.get(`/details/:reciverid`,auth.authenticationToken,userController.reciverDetails)
module.exports=route;