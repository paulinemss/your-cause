const router = require('express').Router();
const mongoose = require('mongoose')
const Book = require('../models/Book.model');
const User = require('../models/User.model')


// TODO
// 1. See if user is loggedin ✅ 
// 2. check users preferences
// 3. Need the first 10 books of today


/* Middlewares */ 
const isLoggedIn = require('../middlewares/isLoggedIn');

/* GET feed page */
router.get('/', isLoggedIn, (req,res,next) => {
  // Get user information from cookie
  const { user } = req.session;
  //console.log(user)

  User
  .findById(user._id)
  .populate('savedBooks')
  .populate('readBooks')
  .then(foundUser => {
    //console.log('Userdata: ', foundUser)

    // Show all book data
    Book
    .find({ category: user.interest }) 
    .then(books => {
      const { savedBooks, readBooks } = user;

      console.log(savedBooks)
      console.log(readBooks)

      let modifiedBooks = []
      books.forEach(book => {
        const bookIsSavedBook = savedBooks.filter(el => el.equals(book._id))
        const bookIsReadBook = readBooks.filter(el => el.equals(book._id))
        const isInSavedBooks =  bookIsSavedBook.length != 0 ? true : false;
        const isInReadBooks = bookIsReadBook.length != 0 ? true : false;

        modifiedBooks.push({
          book,
          isInSavedBooks,
          isInReadBooks
        })
      })
      console.log('New books: ', modifiedBooks)

      res.render('books/feed', {
        books: modifiedBooks, 
        savedBooks: foundUser.savedBooks, 
        readBooks: foundUser.readBooks
      });
    });
  })
  .catch(err => console.log(err))
})

router.get('/:id/like-book', isLoggedIn, (req,res,next) => {
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


// When book is added to likes -> render page again with the new likes 
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
      req.session.user = updatedUser;
      res.redirect(`/books`);
    })
    .catch(err => {
      console.log('error liking book ', err);
    })
})

// When book is deleted from likes -> render page again with the updated likes 
router.get('/unlike-book/:id', isLoggedIn, (req, res) => {
  const { user } = req.session;
  const { id } = req.params; 
  
  User
    .findByIdAndUpdate(user._id, 
      {
         $pull: { savedBooks: id }
      },
      { new: true }
    )
    .then(updatedUser => {
      console.log('updatedUser: ', updatedUser);
      req.session.user = updatedUser;
      res.redirect(`/books`);
    })
    .catch(err => {
      console.log('There has been an error while unliking a book ', err);
    })
});


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
      req.session.user = updatedUser;
      res.redirect(`/books`);
    })
    .catch(err => {
      console.log("There has been an error while adding book to read book ", err);
    })
});

// When book is deleted from reading list -> render page again with the reading list
router.get('/unread-book/:id', isLoggedIn, (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  User
    .findByIdAndUpdate(user._id, 
      {
         $pull: { readBooks: id }
      },
      { new: true }
    )
    .then(updatedUser => {
      console.log('updatedUser: ', updatedUser);
      req.session.user = updatedUser;
      res.redirect(`/books`);
    })
    .catch(err => {
      console.log("There has been an error while deleting book to read book ", err);
    })
});

// When book is added to reading list render page again with the reading list
router.get('/book-page/like-book/:id', isLoggedIn, (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  console.log(user)
  console.log(id)
  res.redirect('/books');

  // User
  //   .findByIdAndUpdate(user._id, 
  //     {
  //        $addToSet: { readBooks: id }
  //     },
  //     { new: true }
  //   )
  //   .then(updatedUser => {
  //     console.log('updatedUser: ', updatedUser);
  //     req.session.user = updatedUser;
  //     res.redirect(`/books`);
  //   })
  //   .catch(err => {
  //     console.log("There has been an error while adding book to read book ", err);
  //   })
})

module.exports = router
