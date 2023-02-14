const express = require('express');
const router = express.Router();
const Book = require('../models/book');

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

module.exports = router;
