const mongoose = require('mongoose')
const axios = require('axios')
const Book = require('../models/Book.model')
require("dotenv").config();

function storeDataInDB(url, cat){
  // get date today
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // STORE BOOKS FROM API IN DB
  axios.get(url)
  .then(data => {
    console.log(data)
    const books = data.data.items;
    // for each book in the books array
    books.forEach(book => {
      console.log(book)
      const { title, authors, publisher, publishedDate, description, pageCount, imageLinks: {thumbnail} }  = book.volumeInfo;
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
        storedDate: todayFormatted,
        state: 0
      })
      .then(storedBook => {
        console.log('Stored book in db ', storedBook);
      })
    })
  })
  .catch(err => console.log('there has occurrend an error while adding books to db', err))
}

// URLS FOR API
const women = 'feminism'; 
const urlGoogleBooksWomen = `https://www.googleapis.com/books/v1/volumes?q=subject:${women}&maxResults=40&key=${process.env.BOOKS_KEY}`

const climate = 'environment';
const urlGoogleBooksClimate = `https://www.googleapis.com/books/v1/volumes?q=subject:${climate}&maxResults=40&key=${process.env.BOOKS_KEY}`

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/ironhack-project2";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((x) => {
    console.log('Connected to Mongo! Database name');
    storeDataInDB(urlGoogleBooksWomen, 'women')
    storeDataInDB(urlGoogleBooksClimate, 'environment')
  })
  .catch((err) => {
    console.error("Error connecting to mongo", err);
  });



// //Make a request for a user with a given ID
// axios.get(urlGoogleBooksClimate)
// .then(data =>{
//     console.log(data.data.items.length)
// })
// .catch(err => console.log(err))