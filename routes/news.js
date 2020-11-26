const express = require('express');
const router  = express.Router();
const Parser = require('rss-parser');
const parser = new Parser();

const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

const topic = {
  environment: 'CAAqBwgKMKeh0wEw-sE1',
  women: 'CAAqIQgKIhtDQkFTRGdvSUwyMHZNREpmYURBU0FtVnVLQUFQAQ'
}

router.get('/', isLoggedIn, (req, res, next) => {
  const { user } = req.session;

  parser
    .parseURL(`https://news.google.com/rss/topics/${topic[user.interest]}?hl=en-US&gl=US&ceid=US:en`)
    .then(data => {
      res.set('Cache-control', 'public, max-age=300')
      res.render('news/feed', { user, data: data.items.slice(0, 20) });
    })
    .catch(err => {
      console.log('error retrieving google rss data', err);
    })
});

module.exports = router;
