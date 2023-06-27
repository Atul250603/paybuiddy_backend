const mongoose = require('mongoose');
const mongooseURI=process.env.MONGOURI;
const connectToMongo=()=>{
    mongoose.connect(mongooseURI,()=>{
        console.log("Connected to the database successfully");
    });
}
module.exports=connectToMongo;