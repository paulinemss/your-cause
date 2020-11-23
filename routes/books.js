const router = require('express').Router();
const Book = require('../models/Book.model');
const User = require('../models/User.model')

// TODO
// 1. See if user is loggedin
// 2. check users preferences
// 3. Need the first 10 books of today


/* Middlewares */ 
const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

/* GET feed page */
router.get('/', isLoggedIn, (req,res,next) => {
  const { user } = req.session;

  // User
  // .findById(user._id)
  // .populate(savedBooks)
  // .populate(readBooks)
  // .then()

  Book
  .find({ category: user.interest }) 
  .then(books => {
    //console.log('Books from db: ',books);
    res.render('books/feed', {books: books});
  })
  .catch(err => console.log(err))
})

/// BOOK PAGE /// 
router.get('/:id', isLoggedIn, (req,res,next) => {
  const { user } = req.session;
  const { id } = req.params;

  Book
  .findById(id)
  .then(foundBook => {
    console.log('Book found: ', foundBook);
    res.render('books/book-page', { book: foundBook,  })
  })
  .catch(err => {
    console.log('error finding the event to edit', err);
  })
})

module.exports = router
