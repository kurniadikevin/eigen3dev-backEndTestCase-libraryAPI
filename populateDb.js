#! /usr/bin/env node

console.log('This script populates some test books and member to your database. Specified database as argument - e.g.: populateDb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

const async= require('async');
const Book = require('./models/book');
const Member = require('./models/member');


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let books=[]; 
let members=[];



function memberCreate(code,name, cb) {
    memberDetail = {code: code ,name: name }
    let member = new Member(memberDetail);
         
    member.save(function (err) {
      if (err) {
        cb(err, null)
        return
      }
      console.log('New Member: ' + member);
      members.push(member)
      cb(null, member)
    }  );
}

function bookCreate(code,title,author,stock, cb) {
    bookDetail = {code: code ,title: title, author: author,
    stock: stock}
    let book = new Book(bookDetail);
         
    book.save(function (err) {
      if (err) {
        cb(err, null)
        return
      }
      console.log('New Book: ' + book);
      books.push(book)
      cb(null, book)
    }  );
}

function populateMember(cb) {
    async.series([
        function(callback) {
            memberCreate( "M001", "Angga", callback);
          },
        function(callback) {
            memberCreate( "M002", "Ferry", callback);
          },
        function(callback) {
            memberCreate( "M003", "Putri", callback);
          },
        ],
        // optional callback
        cb);
}

function populateBook(cb) {
    async.series([
          function(callback) {
            bookCreate( "JK-45", "Harry Potter","J.K Rowling",1, callback);
          },
          function(callback) {
            bookCreate( "SHR-1", "A Study in Scarlet", "Arthur Conan Doyle",1, callback);
          },
          function(callback) {
            bookCreate( "TW-11", "Twilight", "Stephenie Meyer",1, callback);
          },
          function(callback) {
            bookCreate( "HOB-83", "The Hobbit, or There and Back Again","J.R.R. Tolkien",1, callback);
          },
          function(callback) {
            bookCreate( "NRN-7", "The Lion, the Witch and the Wardrobe","C.S. Lewis",1, callback);
          },
        ],
        // optional callback
        cb);
}

async.series([
    
    populateBook,
    populateMember
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('populate mock data success');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});


