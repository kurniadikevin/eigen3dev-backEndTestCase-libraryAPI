var express = require('express');
var router = express.Router();
const Member= require('../models/member');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Member.find({ },{_id: 0})
  .exec(function (err, member_list) {
    if (err) {
      return next(err);
    }
    //Successful
   res.send(member_list);  
  });
});
module.exports = router;
