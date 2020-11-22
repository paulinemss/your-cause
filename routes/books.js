const router = require('express').Router();
const axios = require('axios');

// TODO
// 1. See if user is loggedin
// 2. check users preferences

// GET GOOGLE BOOKS API
const subject = 'feminism'; // this should come from user
//const subject = 'climate+change' 
const startIndex = 0;
const maxResults = 6;
const urlGoogleBooks = `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.BOOKS_KEY}`


router.get('/', (req,res,next) => {
  //console.log(urlGoogleBooks)
  axios.get(urlGoogleBooks)
  .then( data => {
    const books = data.data.items;
   // console.log(books)
    res.render('books/feed', {books: books})
  })
  .catch(err => console.log(err))
})

module.exports = router;


