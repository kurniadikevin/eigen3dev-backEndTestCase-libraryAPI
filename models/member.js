const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    
    code : {type:String ,required:true},
    name : {type:String  ,required:true},
    penalized : {type:Boolean , default: false},
    borrowed_book :{  type: Schema.Types.ObjectId, ref : "Book"},
    number_of_book_borrowed: {type:Number , default: 0},
    oldest_borrowed_book :{type: Date }
});

module.exports= mongoose.model("Member",MemberSchema);