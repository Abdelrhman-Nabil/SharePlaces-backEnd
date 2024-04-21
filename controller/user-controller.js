const HttpError = require("../modal/httpError");
const { validationResult } = require("express-validator");
const User = require("../modal/users");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken")

const getUsers = async(req, res, next) => {
  let users;
  try{ 
    users= await User.find({},'-password')
  }catch(err){
    const error=new HttpError("couldn't find the user .please try again",500);
    return next(error)
  }
  res.json({users:users.map(user=>user.toObject({getters:true}))})
};

const signUp = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed ,please check your data", 422)
    );
  }
  const { name, email, password,} = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email }); 
  } catch (err) {
    const error = new HttpError("SignUp FAILED ,please try again later", 500);
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError(
      "User exist already ,please login insted,",
      422
    );
    return next(error);
  }
   let hashPassword;
   try{
    hashPassword=await bcrypt.hash(password,12);
   }catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );

    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    image:req.file.path,
    password:hashPassword,
    places:[],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Sign Up  failed, please try again.", 500);
    return next(error);
  }

  let token;
   try{
    token=jwt.sign({userId:createdUser.id, email:createdUser.email},'superBoka',{expiresIn:'2h'})
   } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
  res
  .status(201)
  .json({ userId: createdUser.id, email: createdUser.email, token: token });
};


const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("SignUp FAILED ,please try again later", 500);
    return next(error);
  }
  if(!existingUser){
    const error=new HttpError("Couldn't log in ,Please check your credentials and try again",400)
    return next(error)
  }
  let isValidPassword = false;
  try{
    isValidPassword=await bcrypt.compare(password,existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }
  let token;
  try{
   token=jwt.sign({userId:existingUser.id, email:existingUser.email},'superBoka',{expiresIn:'2h'})
  } catch (err) {
   const error = new HttpError(
     'Loging In failed, please try again later.',
     500
   );
   return next(error);
 }  
 res.json({userId:existingUser.id, email:existingUser.email,token:token}) 
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;




// yarn add bcryptjs
// This is a notorious library that helps us create secure passwords or not create passwords, but hash

// npm install --save jsonwebtoken
// the generate a token in back end 