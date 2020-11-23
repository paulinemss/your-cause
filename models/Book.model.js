const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const bookSchema = new Schema({
  title: String, 
  category: {
    type: String,
    enum: ['environment', 'women']
  },
  authors: [String],
  publisher: String,
  publishedDate: String,
  description: String,
  pageCount: Number,
  imageUrl: String,
  googleID: String
});

const Book = model("Book", bookSchema);

module.exports = Book;