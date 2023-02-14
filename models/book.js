const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookSchema = new Schema({
    
    code : {type:String ,required:true},
    title : {type:String  ,required:true},
    author : {type:String  ,required:true},
    stock : {type:Number  ,required:true},
    
});

module.exports= mongoose.model("Book",BookSchema);