const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Member = require('../models/member');

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


//borrow book
router.post('/borrow-book',function(req,res,next){
  Book.findOneAndUpdate({code: req.body.book_code},{
    $inc : { stock : -1 }, $push: {borrowed_by : req.body.member_code}},
    { returnNewDocument: true},
    (err)=>{
      if(err){
        return next(err);
      }
      console.log('book borrowed');

      Member.findOneAndUpdate({code: req.body.member_code},{
        $inc : {number_of_book_borrowed : 1}, $push : { 
          borrowed_book : [req.body.book_code, new Date()]
         ,oldest_borrowed_book : new Date()}
      },
      { returnNewDocument: true},
      (err)=>{
        if(err){
          return next(err);
        } 
        console.log('member info updated')
      })
      res
        .status(200)
        .end()
    })
})


//return book



module.exports = router;
