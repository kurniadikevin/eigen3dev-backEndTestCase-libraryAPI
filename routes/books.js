const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Member = require('../models/member');

let book_list_available ;

/* GET all book available listing. */
router.get('/books', function(req, res, next) {
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

  
    // check if book stock is not zero before input to member borrowed book
    Book.find({code : req.body.book_code},{_id: 0})
    .exec(function (err, book_info) {
      if (err) {
        return next(err);
      }
      else  if (book_info[0].stock !== 0) {
        console.log(book_info[0])
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
        console.log('member info updated for borrowing book');
        Book.findOneAndUpdate ({code: req.body.book_code , stock : {$gt : 0}},{
          $inc : { stock : -1 }, $push: {borrowed_by : req.body.member_code}
        },
          { returnNewDocument: true},
          (err)=>{
            if(err){
              return next(err);
            }
            console.log('book borrowed');
          })
      })
    }
      res
        .send('Member info and book stock updated')
        .status(200)
        .end()
    })
//})
})



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
        },
        /*
          RETURN
        if borrowed_book - > book_ code date now - date borrowed more than 7 days 
            -set penalized to true
            - set penalized_date to Date now
            
            BORROW
          - if penalized_date > 3 days set penalized to false and penalized date to null
        */
      },
      { returnNewDocument: true},
      (err)=>{
        if(err){
          return next(err);
        } 
        console.log('member info updated for returning book');

     /*    //penalized after 7 days
        Member.findOneAndUpdate({ code : req.body.member_code, "borrowed_book.book_code" : {
          $in : [req.body.book_code]
        }},{
          penalized : {
            $cond: { if: { $eq: [ "$borrowed_book.book_code", req.body.book_code ] }, then: 30, else: 20 }
          } 
        }
        ) */

      })
      res
        .status(200)
        .end()
    })
})



module.exports = router;
