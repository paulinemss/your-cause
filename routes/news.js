const express = require('express');
const router  = express.Router();

const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

router.get('/', isLoggedIn, (req, res, next) => {
  res.render('news/feed');
});

module.exports = router;
