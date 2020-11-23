const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
  email: String, 
  profilePic: String, 
  interest: {
    type: String,
    enum: ['environment', 'women']
  },
  eventsCreated: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  ],
  eventsAttended: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  ],
  savedBooks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }
  ],
  readBooks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }
  ]
});

const User = model("User", userSchema);

module.exports = User;
