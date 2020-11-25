/* Helper function to slice data database */ 


// /* Helper function to update URL */ 
// exports.updateUrl = function(startIndex) {
//   const maxResults = 10;

//   // women
//   const women = 'feminism'; 
//   let urlGoogleBooksWomen = `https://www.googleapis.com/books/v1/volumes?q=subject:${women}&startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.BOOKS_KEY}`

//   // climate
//   const climate = 'climate+change';
//   let urlGoogleBooksClimate = `https://www.googleapis.com/books/v1/volumes?q=subject:${climate}&startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.BOOKS_KEY}`

//   return { urlWomen: urlGoogleBooksWomen, urlClimate: urlGoogleBooksClimate }
// }


// /* Helper function to do an API call (on a new date) */ 
// exports.storeDataInDB = async function(date_today, url, cat) {
//   try {
//     const axios = require('axios');
//     const Book = require('../models/Book.model');

//     const data = await axios.get(url);
//     const books = data.data.items;
//       // for each book in the books array
//     for (const book of books) {
//       const { title, authors, publisher, publishedDate, description, pageCount, imageLinks: {thumbnail} }  = book.volumeInfo;
//       // Check if book is not already stored  in db
//       const result = await Book.findOne({ googleID: book.id })
//       // if result is null
//       if(!result){
//         // Create new book in db
//         const newAddedBook = await Book.create({
//           title,
//           category: cat,
//           authors,
//           publisher,
//           publishedDate,
//           description,
//           pageCount,
//           imageUrl: thumbnail,
//           googleID: book.id,
//           storedDate: date_today
//         })

//         //console.log(newAddedBook); 
//       }       
//     }
//     console.log("ALL BOOKS HAVE BEEN ADDED");
//   } catch (error) {
//     console.log('error storing books in database', error);
//   }
// }