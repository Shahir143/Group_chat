const express=require('express');
const route=express.Router();
const logincontroller=require('../controllers/loginController');
const userController=require('../controllers/users');
const auth=require('../middleware/auth')
route.get('/signup',logincontroller.main);
route.post('/signup',logincontroller.signup);
route.post('/login',logincontroller.login)
route.get(`/contacts`,auth.authenticationToken,userController.getContacts);
route.get(`/getchat/:id`,auth.authenticationToken,userController.getChats)
module.exports=route;