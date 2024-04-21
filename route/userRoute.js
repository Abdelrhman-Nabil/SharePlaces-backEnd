const express = require('express');

const usersController = require('../controller/user-controller');
const { check } = require('express-validator');
const fileUpload=require('../middleWare/file-upload')
const router = express.Router();

router.get('/', usersController.getUsers);
router.post( '/signup', fileUpload.single('image'),
   [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min:6})
],usersController.signUp);

router.post('/login', usersController.logIn);

module.exports = router;
