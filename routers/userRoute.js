const express=require('express');
const route=express.Router();
const controllerUser=require('../controllers/userController');

route.get('/signup',controllerUser.main);
route.post('/signup',controllerUser.signup);
route.post('/login',controllerUser.login)

module.exports=route;