const express = require('express');
const router  = express.Router();
const Event = require('../models/Event.model');

const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

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

  Event
    .find()
    .then(foundEvents => {

      /* sorting the array of found events */ 
      const withoutOldEvents = removeOldEvents(foundEvents);
      const sortedEvents = sortEvents(withoutOldEvents);

      /* finding all events for the main feed */ 
      const mainEvents = getOnlyInterestingEvents(sortedEvents, user.interest);

      /* slicing the events array to only show the first one */
      const events = mainEvents.slice(0, 5);

      res.render('dash', { user, events });
    })
    .catch(err => {
      console.log('error finding events on dash page', err); 
    })
});

module.exports = router;
