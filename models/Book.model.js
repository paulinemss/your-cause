const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const bookSchema = new Schema({
  title: String, 
  category: {
    type: String,
    enum: ['environment', 'women']
  }
});

const Book = model("Book", bookSchema);

module.exports = Book;