const router = require('express').Router();
const uploader = require('../config/cloudinary.config.js');

// ? Package to will handle encryption of password
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Requiring the User model in order to interact with the database
const User = require('../models/User.model');

// Requiring necessary middlewares in order to control access to specific routes
const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

router.get('/signup', shouldNotBeLoggedIn, (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', shouldNotBeLoggedIn, uploader.single('profilePic'), (req, res) => {
  const { username, 
    email, 
    interest, 
    newPassword,
    confirmPassword 
  } = req.body;

  let profilePic = "https://res.cloudinary.com/dffhi2onp/image/upload/v1606127208/Sans_titre_3_cfj8uo.png";

  if (req.file) {
    profilePic = req.file.path; 
  }

  if (newPassword.length < 8) {
    return res.status(400).render('auth/signup', {
      errorMessage: 'Your password needs to be at least 8 characters'
    });
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(newPassword)) {
    return res.status(400).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).render('auth/signup', {
      errorMessage: 'You have not entered the same password.'
    });
  }

  // Search the database for a user with the username submitted in the form
  User.findOne({ username }).then(found => {
    if (found) {
      return res.status(400).render('auth/signup', { errorMessage: 'Username already taken' });
    }
    return bcrypt
      .genSalt(saltRounds)
      .then(salt => bcrypt.hash(confirmPassword, salt))
      .then(hashedPassword => {
        return User.create({
          username,
          email,
          interest,
          profilePic,
          password: hashedPassword
        });
      })
      .then(user => {
        // binds the user to the session object
        req.session.user = user;
        res.redirect('/dash');
      })
      .catch(error => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).render('auth/signup', { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).render('auth/signup', {
            errorMessage: 'Username need to be unique. THe username you chose is already in used.'
          });
        }
        return res.status(500).render('auth/signup', { errorMessage: error.message });
      });
  });
});

router.get('/login', shouldNotBeLoggedIn, (req, res) => {
  res.render('auth/login');
});

router.post('/login', shouldNotBeLoggedIn, (req, res) => {
  const { username, password } = req.body;

  if (password.length < 8) {
    return res.status(400).render('auth/login', {
      errorMessage: 'Your password needs to be at least 8 characters'
    });
  }

  User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.status(400).render('auth/login', { errorMessage: 'Wrong credentials' });
      }

      bcrypt.compare(password, user.password).then(isSamePassword => {
        if (!isSamePassword) {
          return res.status(400).render('auth/login', { errorMessage: 'Wrong credentials' });
        }
        req.session.user = user;
        return res.redirect('/dash');
      })

    })
    .catch(err => {
      console.log(err);
      return res.status(500).render("auth/login", { errorMessage: err.message });
    });
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).render('auth/logout', { errorMessage: err.message });
    }
    res.redirect('/');
  });
});

module.exports = router;
