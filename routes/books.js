const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Member = require('../models/member');


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

   } else if( member_info[0].penalized === false){
    console.log('member not penalized');
    next()
   }
    //should be 3 days (259200 seconds)
    else if( timeDifferentInSeconds > 259200){
   
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
  })
}

//update penalized manually
router.post('/update-penalized',function(req,res){
  clearingPenalized(req,res)
});


//borrow book
router.post('/borrow-book',clearingPenalized ,function(req,res,next){
  
    // check if book stock is not zero before input to member borrowed book
    Member.find({code : req.body.member_code},{_id: 0})
    .exec(function (err, member_info) {
      if (err) {
        return next(err);
      }
      else  if ( member_info[0].number_of_book_borrowed < 2) {
        console.log(member_info[0]);

  //check if number of book borrowed by member for maximum 2 book
        Book.find ({code: req.body.book_code},{_id : 0})
        .exec(function(err,book_info){
          if(err){
            return next(err);
          } else if((book_info[0].stock > 0)) {
      
    // increase number of book borrowed on member then push book code and date on borrowed book property on member
      Member.findOneAndUpdate ({code: req.body.member_code, number_of_book_borrowed : {$lt : 2},
        penalized : false},{
        $inc : {number_of_book_borrowed : 1}, $push : { 
          borrowed_book : {book_code : req.body.book_code, date : new Date()}
        }
      },{ returnNewDocument: true},
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
        //}
      })
      }
    })
    }
      res
        .send('Member info and book stock updated for borrowing case')
        .status(200)
        .end()
    })
})


//check for penalized middleware
const checkForPenalized =(req,res,next)=>{
  Member.find({code : req.body.member_code},{_id: 0})
  .exec(function (err, member_info) {

    const member_borrowed_book_date_arr = member_info.map((item)=>{
      return item.borrowed_book;
    })
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
      // should be 7 days in seconds
      timeDifferentInSeconds > 604800
    ){
    console.log('more than 7 days ago');
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
    console.log('less than 7 days ago')
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
      },
      { returnNewDocument: true},
      (err)=>{
        if(err){
          return next(err);
        } 
        console.log('member info updated for returning book');
      })
      res
        .send('Member info and book stock updated for returning case')
        .status(200)
        .end()
    })
})




module.exports = router;
