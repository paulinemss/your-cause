const express = require('express');
const router  = express.Router();
const Event = require('../models/Event.model');
const Parser = require('rss-parser');
const parser = new Parser();

const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

const topic = {
  environment: 'CAAqBwgKMKeh0wEw-sE1',
  women: 'CAAqIQgKIhtDQkFTRGdvSUwyMHZNREpmYURBU0FtVnVLQUFQAQ'
}

const { getOnlyInterestingEvents,
removeOldEvents,
sortEvents,
findEventsCreatedByUser,
findEventsUserIsAttending } = require('../helpers-function/events');

/* MAIN HOME PAGE, ACCESSIBLE BY ANYONE */
router.get('/', (req, res, next) => {
  const { user } = req.session; 

  res.render('index', { user });
});

/* DASHBOARD, ACCESSIBLE BY USERS ONLY */ 
router.get('/dash', isLoggedIn, (req, res, next) => {
  const { user } = req.session; 

  const events = Event.find();
  const news = parser.parseURL(`https://news.google.com/rss/topics/${topic[user.interest]}?hl=en-US&gl=US&ceid=US:en`); 

  Promise.all([events, news])
    .then(values => {
      const [foundEvents, foundNews] = values; 

      /* sorting the array of found events */ 
      const withoutOldEvents = removeOldEvents(foundEvents);
      const sortedEvents = sortEvents(withoutOldEvents);

      /* finding all events for the main feed */ 
      const mainEvents = getOnlyInterestingEvents(sortedEvents, user.interest);

      /* slicing the events array to only show the first 5 */
      const events = mainEvents.slice(0, 5);

      /* slicing the news array to only show the first 5 */
      const news = foundNews.items.slice(0, 5);

      res.render('dash', { user, events, news });
    })
    .catch(err => {
      console.log('error finding databases on dash page', err); 
    })
});

module.exports = router;
