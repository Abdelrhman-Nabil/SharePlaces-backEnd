const fs=require('fs')
const express= require("express");
const path = require('path');
const bodyParser=require("body-parser")
const placesRoutes=require("./route/placeRoute")
const UserRoutes=require("./route/userRoute")
const HttpError=require("./modal/httpError")
const mongoose=require('mongoose')
const app=express();

app.use(bodyParser.json())
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req,res,next)=>{
    // the three lines are use to stop defult errors in the browser
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type ,Accept ,Authorization');
    res.setHeader('Access-Control-Allow-Methods',' GET, POST, PATCH, DELETE')

    next();
});
app.use('/api/places', placesRoutes); // => /api/places...
app.use('/api/users', UserRoutes); // => /api/places...

app.use((req,res,next)=>{
    const error=new HttpError("couldn't find this route",404);
    throw error 
})
app.use((error,req,res,next)=>{
    if(req.file){
      fs.unlink(req.file.path,err=>{console.log(err)})
    }
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message:error.message || 'An unkown error eccurred'})
})

const url=`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tzhikgh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
mongoose.connect(url).then(() => {
    app.listen(5000)
    console.log('Connected to database!')
}).catch((error) => {
 
  console.log('Connection failed!')
});