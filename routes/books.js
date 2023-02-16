const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Member = require('../models/member');

//let book_list_available ;

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



//clearing penalized after 3 days 
const clearingPenalized =(req,res,next)=>{
  Member.find({code : req.body.member_code},{_id:0})
  .exec(function(err, member_info){
   const penalizedDateInSeconds = member_info[0].penalized_date / 1000;
   console.log(penalizedDateInSeconds);
   const currentDateInSeconds= new Date() / 1000;
   const timeDifferentInSeconds = currentDateInSeconds - penalizedDateInSeconds;
   
   if(err){
    return next(err);

    //should be 3 days 
   } else if( timeDifferentInSeconds > 30){
   
    Member.findOneAndUpdate ({ code : req.body.member_code},{
      penalized : false, penalized_date : null
    },{ returnNewDocument: true},
    (err)=>{
      if(err){
        return next(err);
      }
      console.log('member penalized removed');
      next()
    })
   } 
   else{
      console.log('member still in penalized period');
     res.send('member still in penalized period')
    //next();
   }
  

   //res.send('200')
  })
}

router.post('/test',function(req,res){
  clearingPenalized(req,res)
});

//borrow book
router.post('/borrow-book',clearingPenalized ,function(req,res,next){
  
    // check if book stock is not zero before input to member borrowed book
    Book.find({code : req.body.book_code},{_id: 0})
    .exec(function (err, book_info) {
      if (err) {
        return next(err);
      }
      else  if (book_info[0].stock !== 0) {
        console.log(book_info[0]);
    
    // increase number of book borrowed on member then push book code and date on borrowed book property on member
      Member.findOneAndUpdate ({code: req.body.member_code, number_of_book_borrowed : {$lt : 2},
        penalized : false},{
        $inc : {number_of_book_borrowed : 1}, $push : { 
          borrowed_book : {book_code : req.body.book_code, date : new Date()}
        }
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


const checkForPenalized =(req,res,next)=>{
  Member.find({code : req.body.member_code},{_id: 0})
  .exec(function (err, member_info) {
   // console.log(member_info)
    const member_borrowed_book_date_arr = member_info.map((item)=>{
      return item.borrowed_book;
    })
    //console.log( member_borrowed_book_date_arr[0][0].date)
    const oldest_date_borrowed = member_borrowed_book_date_arr[0][0].date;
    const oldest_date_borrowed_in_seconds= oldest_date_borrowed /1000 ;
    console.log(oldest_date_borrowed_in_seconds);

    const current_date_in_seconds= new Date() / 1000;
    console.log(current_date_in_seconds);

    const timeDifferentInSeconds = current_date_in_seconds - oldest_date_borrowed_in_seconds;
    if (err) {
      return next(err);
    }
    else if(
      // should be 7 days
      timeDifferentInSeconds > 5
    ){
    console.log('more than 5s ago');
    Member.findOneAndUpdate ({ code : req.body.member_code},{
      penalized : true, penalized_date : new Date()
    },{ returnNewDocument: true},
    (err)=>{
      if(err){
        return next(err);
      }
      console.log('member penalized');
      next();
    })
    
     }
  else{
    console.log('less than 5s ago')
    next();

  }})
} 




//return book
router.post('/return-book',checkForPenalized,function(req,res,next){

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
