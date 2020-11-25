const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
  email: String, 
  profilePic: {
    type: String,
    default: "https://res.cloudinary.com/dffhi2onp/image/upload/v1606127208/Sans_titre_3_cfj8uo.png"
  }, 
  interest: {
    type: String,
    enum: ['environment', 'women']
  },
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
