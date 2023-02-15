const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    
    code : {type:String ,required:true},
    name : {type:String  ,required:true},
    penalized : {type:Boolean , default: false},
    penalized_date : {type:Date },
    borrowed_book :{  type: Array , default:[]},
    number_of_book_borrowed: {type:Number , default: 0},
    
});

module.exports= mongoose.model("Member",MemberSchema);