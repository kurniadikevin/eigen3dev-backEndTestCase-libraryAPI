const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Member = require('../models/member');

let book_list_available ;

/* GET all book available listing. */
router.get('/', function(req, res, next) {
  Book.find({ 'stock': {$gt : 0}},{_id: 0})
  .exec(function (err, book_list) {
    if (err) {
      return next(err);
    }
    //Successful
   res.send(book_list);  
  });
});


// 0 stock book should not be borrowed
// penalized system

//borrow book
router.post('/borrow-book',function(req,res,next){
  Book.findOneAndUpdate({code: req.body.book_code , stock : {$gt : 0}},{
    $inc : { stock : -1 }, $push: {borrowed_by : req.body.member_code}
  },
    { returnNewDocument: true},
    (err)=>{
      if(err){
        return next(err);
      }
      console.log('book borrowed');

      Member.findOneAndUpdate({code: req.body.member_code, number_of_book_borrowed : {$lt : 2}},{
        $inc : {number_of_book_borrowed : 1}, $push : { 
          borrowed_book : {book_code : req.body.book_code, date : new Date()}
         ,oldest_borrowed_book : new Date()}
      },
      { returnNewDocument: true},
      (err)=>{
        if(err){
          return next(err);
        } 
        console.log('member info updated for borrowing book')
      })
      res
        .status(200)
        .end()
    })
})


// return book that has been in member borrowed book and book borrowed by 

const mapArrBookCode =(arr)=>{ arr.map(function(x) { return x.book_code } )};

//return book
router.post('/return-book',function(req,res,next){

  Book.findOneAndUpdate({code: req.body.book_code, borrowed_by : {$in : [req.body.member_code]} },{
    $inc : { stock : 1 }, $pull: {borrowed_by : req.body.member_code}},
    { returnNewDocument: true},
    (err)=>{
      if(err){
        return next(err);
      }
      console.log('book returned');

      Member.findOneAndUpdate({code: req.body.member_code, "borrowed_book.book_code" : {
        $in : [req.body.book_code]
      }},{
        $inc : {number_of_book_borrowed : -1}, $pull : { 
          borrowed_book : {book_code : req.body.book_code}
        }
      },
      { returnNewDocument: true},
      (err)=>{
        if(err){
          return next(err);
        } 
        console.log('member info updated for returning book')
      })
      res
        .status(200)
        .end()
    })
})



module.exports = router;
