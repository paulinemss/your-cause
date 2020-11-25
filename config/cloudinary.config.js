const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { Router } = require('express');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  folder: "ironhack-project2",
  allowedFormats: ["jpg", "png"],
  filname: function (req, res, cb) {
    cb(null, res.originalname); 
  }
})

module.exports = multer({storage}); 