const express = require('express');
const router = express();
const userController = require('../controller/user.controller');
const {authorization} = require('../middleware/auth')

router.post('/login', userController.login);
router.post('/register', userController.signup);
router.get('/allUser',authorization, userController.allUser);
router.get('/getFullChat/:id', authorization, userController.getFullChat);
router.post('/sendMessages', authorization, userController.sendMessages);
router.get('/getUser/:id', authorization, userController.getUser);
router.post('/logout',authorization,userController.logout)
module.exports = router