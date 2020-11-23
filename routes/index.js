const express = require('express');
const router  = express.Router();

const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

/* MAIN HOME PAGE, ACCESSIBLE BY ANYONE */
router.get('/', (req, res, next) => {
  const { user } = req.session; 

  res.render('index', { user });
});

/* DASHBOARD, ACCESSIBLE BY USERS ONLY */ 
router.get('/dash', isLoggedIn, (req, res, next) => {
  const { user } = req.session; 

  res.render('dash', { user });
});

module.exports = router;
