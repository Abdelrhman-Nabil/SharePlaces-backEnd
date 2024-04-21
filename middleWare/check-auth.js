const jwt = require('jsonwebtoken');
const HttpError=require('../modal/httpError')

const CheckAuth=(req,res,next)=>{
  if(req.method==='OPTIONS'){
    next();
  }
  try{
    const token=req.headers.authorization.split(' ')[1];  // Authorization: 'Bearer TOKEN'
    if(!token){
        throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token,'superBoka');
    req.userData={userId:decodedToken.userId}
    next();
  }catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};

module.exports=CheckAuth
