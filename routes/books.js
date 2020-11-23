const router = require('express').Router();
const Book = require('../models/Book.model')

// TODO
// 1. See if user is loggedin
// 2. check users preferences
// 3. Need the first 10 books of today


/* GET feed page */
router.get('/', (req,res,next) => {
  // category from user sessions
  Book
  .find({ category: 'women' }) 
  .then(books => {
    console.log('Books from db: ',books);
    res.render('books/feed', {books: books});
  })
  .catch(err => console.log(err))
})

/// BOOK PAGE /// 
router.get('/:id', (req,res,next) => {
  const { id } = req.params;
  console.log(id)

  res.render('books/book-page')
})

module.exports = router
