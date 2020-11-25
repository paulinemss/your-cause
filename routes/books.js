const router = require('express').Router();
const mongoose = require('mongoose')
const Book = require('../models/Book.model');
const User = require('../models/User.model')


// TODO
// 1. See if user is loggedin ✅ 
// 2. check users preferences ✅ 
// 3. links should be updated ✅ 
// 4. Need the first 10 books of today
// 5. Write function for checking books in readArray/likeArray 

/* Middlewares */ 
const isLoggedIn = require('../middlewares/isLoggedIn');

/* Importing helper functions */
const { storeDataInDB, updateUrl } = require('../helpers-function/books');
  

/* URLS, startindex for API */
// startindex
let startIndex = 0;
// const maxResults = 10;

// // women
// const women = 'feminism'; 
// let urlGoogleBooksWomen = `https://www.googleapis.com/books/v1/volumes?q=subject:${women}&startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.BOOKS_KEY}`

// // climate
// const climate = 'climate+change';
// let urlGoogleBooksClimate = `https://www.googleapis.com/books/v1/volumes?q=subject:${climate}&startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.BOOKS_KEY}`





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

    // Create date for today:
    const today = new Date();
    //const todayFormatted = `${today.getFullYear()}-${today.getMonth()}-${(today.getDate()-1)}`;
    const todayFormatted = `${today.getFullYear()}-${today.getMonth()}-${(today.getDate())}`;
    //console.log('date', todayFormatted)

    // Show all book data
    Book
    .find({ storedDate: todayFormatted})
    .then( response => {
      console.log('Response db',response)
      // if response is empty array, do running db
      if(!response.length){
        console.log('run db ')
        startIndex =+ 10;
        const { urlWomen, urlClimate }  = updateUrl(startIndex)
        const women = storeDataInDB(todayFormatted, urlWomen, 'women');
        const environment = storeDataInDB(todayFormatted, urlClimate, 'environment');
        //console.log(women)
        //console.log(environment)
        //console.log(startIndex)

        Book
        .find({ $and:[{ storedDate: todayFormatted },{ category:user.interst }] })
        .then(books => {
          const { savedBooks, readBooks } = user;
          let modifiedBooks = [];

          books.forEach(book => {
            // WRITE FUNCTION FOR THIS
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
         res.render('books/feed', {
           books: modifiedBooks, 
           savedBooks: foundUser.savedBooks, 
           readBooks: foundUser.readBooks
         });
        })
        .catch(err => console.log(err));
      }
      else {
        console.log('Getting data')
        Book
        .find({ storedDate: todayFormatted})
        .find({ category: user.interest })
        //.find({ $and:[{ storedDate: {$eq: todayFormatted }} ,{ category:{ $eq: user.interst} }] })
        .then(books => {
          const { savedBooks, readBooks } = user;
          let modifiedBooks = [];

          books.forEach(book => {
            // WRITE FUNCTION FOR THIS
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
         res.render('books/feed', {
           books: modifiedBooks, 
           savedBooks: foundUser.savedBooks, 
           readBooks: foundUser.readBooks
         });
        })
        .catch(err => console.log(err));
      }
    })
    .catch(err => console.log('No books', err))
  })
})


/// BOOK PAGE /// 
router.get('/:id', isLoggedIn, (req,res,next) => {
  const { user } = req.session;
  const { id } = req.params;

  const { savedBooks, readBooks } = user;

  Book
  .findById(id)
  .then(foundBook => {
    console.log('Book found: ', foundBook);

    const bookIsSavedBook = savedBooks.filter(el => el.equals(foundBook._id))
    const bookIsReadBook = readBooks.filter(el => el.equals(foundBook._id))
    const isInSavedBooks =  bookIsSavedBook.length != 0 ? true : false;
    const isInReadBooks = bookIsReadBook.length != 0 ? true : false;

    res.render('books/book-page', { 
      book: foundBook, 
      isInSavedBooks: isInSavedBooks, 
      isInReadBooks: isInReadBooks})
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

// When you add a book to the savedBooks in book-page
router.get('/book-page/like-book/:id', isLoggedIn, (req, res) => {
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
      console.log("There has been an error while liking a book to read book ", err);
    })
});

// When you delete a book from the savedBooks in book-page
router.get('/book-page/unlike-book/:id', isLoggedIn, (req, res) => {
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
      console.log("There has been an error while liking a book to read book ", err);
    })
});

// When you add a book to the readBooks in book-page
router.get('/book-page/read-book/:id', isLoggedIn, (req, res) => {
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
      console.log("There has been an error while adding a book to the readArray", err);
    })
});

// When you delete a book from the readBooks in book-page
router.get('/book-page/unread-book/:id', isLoggedIn, (req, res) => {
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
      console.log("There has been an error while deleting a book from the readArray", err);
    })
});


module.exports = router
