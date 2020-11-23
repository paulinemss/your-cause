const express = require('express');
const router  = express.Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const uploader = require('../config/cloudinary.config.js');

const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

router.get('/', isLoggedIn, (req, res, next) => {
  const { user } = req.session;

  res.render('settings/main', { user });
});

router.get('/update-profile', isLoggedIn, (req, res, next) => {
  const { user } = req.session;

  res.render('settings/update-profile', { user });
});

router.post('/update-profile', isLoggedIn, uploader.single('profilePic'), (req, res, next) => {
  const { username,
    email,
    interest 
  } = req.body; 
  const { user } = req.session; 
  let profilePic = user.profilePic; 

  if (req.file) {
    profilePic = req.file.path; 
  }

  User.findOne({ username }).then(found => {
    if (found && !found._id.equals(user._id)) {
      console.log("found", found);
      console.log('user', user);
      return res.status(400).render('settings/update-profile', { errorMessage: 'Username already taken' });
    }
    return User.findByIdAndUpdate(
      user._id,
      {
        username,
        email,
        profilePic,
        interest
      },
      { new: true }
    );
  })
  .then(newUpdatedUser => {
    req.session.user = newUpdatedUser; 
    res.render('settings/update-profile', { user: newUpdatedUser, message: "Profile successfully updated" });
  })
  .catch(err => {
    console.log("error updating profile", err);
  })
})

router.get('/update-password', isLoggedIn, (req, res) => {
  res.render('settings/update-password'); 
});

router.post('/update-password', isLoggedIn, (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body; 

  if (newPassword !== confirmPassword) {
    return res.status(400).render('settings/update-password', {
      errorMessage: 'You have not entered the same password.'
    });
  }

  const isSamePassword = bcrypt.compareSync(
    oldPassword,
    req.session.user.password
  );

  if (!isSamePassword) {
    return res.status(400).render('settings/update-password', {
      errorMessage: 'You have entered the wrong password.'
    });
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(newPassword)) {
    return res.status(400).render('settings/update-password', {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }

  const hashingAlgorithm = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, hashingAlgorithm);

  User.findByIdAndUpdate(
    req.session.user._id,
    { password: hashedPassword },
    { new: true }
  ).then((newAndUpdatedUser) => {
    req.session.user = newAndUpdatedUser;
    res.render("settings/update-password", {
      message: "All good, successful, move away",
    });
  });

});

router.get('/delete-account', isLoggedIn, (req, res) => {
  const { user } = req.session;

  res.render('settings/main', {
    user,
    messageDelete: true
  }); 
});

router.post('/delete-account', isLoggedIn, (req, res) => {
  const { user } = req.session;
  User.findByIdAndDelete(user._id).then(() => {
    req.session.destroy((err) => {
    if (err) {
      console.log('error deleting user', err);
    }
    res.redirect("/");
  });
  })
})

module.exports = router;