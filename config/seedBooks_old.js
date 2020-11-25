const mongoose = require('mongoose')
const axios = require('axios')
const Book = require('../models/Book.model')
require("dotenv").config();


// FUNCTION FOR STORE BOOKS FROM API IN DB
function storeDataInDB(url, cat){
  // get date today
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()-1}`

  // STORE BOOKS FROM API IN DB
  axios.get(url)
  .then(data => {
    const books = data.data.items;
    // for each book in the books array
    books.forEach(book => {
      const { title, authors, publisher, publishedDate, description, pageCount, imageLinks: {thumbnail} }  = book.volumeInfo;
      // Check if book is not already stored  in db
      Book.findOne({ googleID: book.id })
      .then(result => {
        // if result is null
        if(!result){
          // Create new book in db
          Book.create({
            title,
            category: cat,
            authors,
            publisher,
            publishedDate,
            description,
            pageCount,
            imageUrl: thumbnail,
            googleID: book.id,
            storedDate: todayFormatted
          })
          .then(newAddedBook => {
            //console.log(newAddedBook)
          })
        }       
      })
    })
  })
  .catch(err => console.log(err));
}

// SETTINGS FOR API
//const startIndex = 0;
//const maxResults = 10;

const women = 'feminism'; 
const urlGoogleBooksWomen = `https://www.googleapis.com/books/v1/volumes?q=subject:${women}&key=${process.env.BOOKS_KEY}`

const climate = 'climate+change';
const urlGoogleBooksClimate = `https://www.googleapis.com/books/v1/volumes?q=subject:${climate}&key=${process.env.BOOKS_KEY}`


//MONGOOSE CONNECTION
mongoose.connect(`mongodb://localhost/ironhack-project2`, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// STORE BOOKS FROM API IN DB
storeDataInDB(urlGoogleBooksWomen, 'women');
//storeDataInDB(urlGoogleBooksClimate, 'environment');

// mongoose.connection.close(); // do we need this?