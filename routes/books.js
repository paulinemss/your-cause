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

  //const savedBooks = [];
  //const readBooks = [];

  User
  .findById(user._id)
  .populate('savedBooks')
  .populate('readBooks')
  .then(foundUser => {
    console.log('Userdata: ', foundUser)

    // Show all book data
    Book
    .find({ category: user.interest }) 
    .then(books => {
      console.log('Books from db: ' ,books)
      //console.log('readBooks: ', foundUser.readBooks)

      //const userIsAttending = foundEvent.attendees.some(e => {
      //  return e.equals(user._id);
      books.forEach(bk => {
        bk
        
      })

      res.render('books/feed', {
        books: books, 
        savedBooks: foundUser.savedBooks, 
        readBooks: foundUser.readBooks
      });
    });
  })
  .catch(err => console.log(err))
})




  // User
  // .findById(user._id)
  // .populate('savedBooks')
  // .populate('readBooks')
  // .then(response => {
  //   savedBooks = response.savedBooks; 
  //   readBooks = response.readBooks;
  //   console.log(savedBooks)
  //   console.log(readBooks)
  // })
  
  

  // Book
  // .find({ category: user.interest }) 
  // .then(books => {
  //   // console.log('Books from db: ',books);
    
  //   const modifiedBooksList = [];
    
  //   books.forEach(book => {

  //       // // if in saved books 
  //       // const isInSavedBooks = savedBooks.find(e => e._id === book._id )
  //       // // if in read books 
  //       // const isInReadBooks = readBooks.find(e => e._id === book._id )
  //       // modifiedBooksList.push({
  //       //   ...book,
  //       //   isInSavedBooks,
  //       //   isInReadBooks
  //       // })
  //   })

  //   res.render('books/feed', {books: books});
  // })
  // .catch(err => console.log(err))

//})

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


// When book is added to likes render page again with the new likes 
router.get('/like-book/:id', isLoggedIn, (req, res) => {
  const { user } = req.session;
  const { id } = req.params; 
  
  User
    .findByIdAndUpdate(user._id, 
      {
         $addToSet: { savedBooks: id }
      },
      { new: true }
    )
    .then(updatedUser => {
      console.log('updatedUser: ', updatedUser);
    
      res.redirect(`/books`);
  })
})

// When book is added to reading list render page again with the reading list
router.get('/read-book/:id', isLoggedIn, (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  User
    .findByIdAndUpdate(user._id, 
      {
         $addToSet: { readBooks: id }
      },
      { new: true }
    )
    .then(updatedUser => {
      console.log('updatedUser: ', updatedUser);

      res.redirect(`/books`);
    })
})


module.exports = router
