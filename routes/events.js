const express = require('express');
const { format } = require('morgan');
const router  = express.Router();
const uploader = require('../config/cloudinary.config.js');
const Event = require('../models/Event.model');

/* Importing middlewares */ 
const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

/* Importing helper functions */
const { formatDate,
getOnlyInterestingEvents,
removeOldEvents,
sortEvents,
findEventsCreatedByUser,
findEventsUserIsAttending,
getDateString } = require('../helpers-function/events');

/* GET main events page - feed of all events */ 
router.get('/', isLoggedIn, (req, res, next) => {
  const { user } = req.session; 

  Event
    .find()
    .populate('attendees')
    .populate('author')
    .then(foundEvents => {

      /* sorting the array of found events */ 
      const withoutOldEvents = removeOldEvents(foundEvents);
      const sortedEvents = sortEvents(withoutOldEvents);

      /* finding all events for the main feed */ 
      const mainEvents = getOnlyInterestingEvents(sortedEvents, user.interest);

      /* finding all events the user is attending */ 
      const eventsAttending = findEventsUserIsAttending(sortedEvents, user._id);
  
      /* finding all events the user has created */ 
      const eventsCreated = findEventsCreatedByUser(sortedEvents, user._id);

      res.render('events/feed', { mainEvents, eventsAttending, eventsCreated });
    })
    .catch(err => {
      console.log('error finding all events', err); 
    })
});

/* GET create event page */
router.get('/create-event', isLoggedIn, (req, res, next) => {
  res.render('events/create-event');
});

/* POST receive elements from create event form */
router.post('/create-event', isLoggedIn, uploader.single('imageUrl'), (req, res, next) => {
  const { title, 
    organiser, 
    description,
    startDate,
    startTime,
    endDate,
    endTime,  
    link, 
    category 
  } = req.body; 
  const { user } = req.session;
  const eventImg = req.file; 
  const dateString = getDateString(req.body);

  // TODO : STORE SHORT DESCRIPTION TO SHOW IN MAIN EVENTS FEED

  /* error handling if the user made mistakes with dates */
  const now = new Date(); 
  const start = new Date(startDate); 
  const end = new Date(endDate); 

  if (start < now && start.toDateString() !== now.toDateString()) {
    return res.render('events/create-event', { 
      prefilledEvent: req.body, 
      errorMessage: 'Your start date cannot be in the past.'
    });
  }

  if (start > end) {
    return res.render('events/create-event', { 
      prefilledEvent: req.body, 
      errorMessage: 'Your end date must be after the start date, or on the same day.'
    });
  }

  if (start.toDateString() === end.toDateString() && startTime > endTime) {
    return res.render('events/create-event', { 
      prefilledEvent: req.body, 
      errorMessage: 'Your end time must be after the start time.'
    });
  }

  /* error handling if the user did not add an image */ 
  if (!eventImg) {
    return res.render('events/create-event', { 
      prefilledEvent: req.body, 
      errorMessage: 'You need to add an image.'
    });
  }

  Event
    .create({
      title,
      organiser,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      link,
      dateString,
      author: user._id,
      image: eventImg.path,
      category
    })
    .then(createdEvent => {
      console.log('createdEvent:', createdEvent);
      res.redirect('/events/');
    })
    .catch(err => {
      console.log('error creating new event', err);
    })
});

/* GET edit event page */
router.get('/edit-event/:id', isLoggedIn, (req, res, next) => {
  const eventID = req.params.id; 

  Event
    .findById(eventID)
    .then(foundEvent => {
      console.log('foundEvent', foundEvent);

      const formattedStartDate = formatDate(foundEvent.startDate);
      const formattedEndDate = formatDate(foundEvent.endDate);
      const formattedDates = {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
      
      res.render('events/edit-event', { event: foundEvent, dates: formattedDates });
    })
    .catch(err => {
      console.log('error finding the event to edit', err);
    })
});

/* POST receive elements from edit event form */
router.post('/edit-event/:id', isLoggedIn, uploader.single('imageUrl'), (req, res, next) => {
  const eventID = req.params.id; 
  const { title, 
    organiser, 
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    link, 
    category 
  } = req.body; 
  const { user } = req.session;
  const eventImg = req.file; 
  const dateString = getDateString(req.body);

  /* error handling if the user made mistakes with dates */
  const now = new Date(); 
  const start = new Date(startDate); 
  const end = new Date(endDate); 

  if (start < now && start.toDateString() !== now.toDateString()) {
    return res.render('events/create-event', { 
      prefilledEvent: req.body, 
      errorMessage: 'Your start date cannot be in the past.'
    });
  }

  if (start > end) {
    return res.render('events/create-event', { 
      prefilledEvent: req.body, 
      errorMessage: 'Your end date must be after the start date, or on the same day.'
    });
  }

  if (start.toDateString() === end.toDateString() && startTime > endTime) {
    return res.render('events/create-event', { 
      prefilledEvent: req.body, 
      errorMessage: 'Your end time must be after the start time.'
    });
  }

  /* error handling if the user did not add an image */ 
  if (!eventImg) {
    Event
    .findByIdAndUpdate(eventID, {
      title,
      organiser,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      link,
      dateString,
      author: user._id,
      category
    }, { new: true })
    .then(updatedEvent => {
      console.log('updatedEvent:', updatedEvent);
      res.redirect('/events/');
    })
    .catch(err => {
      console.log('error updating event', err);
    })
  } else {
    Event
    .findByIdAndUpdate(eventID, {
      title,
      organiser,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      link,
      dateString,
      author: user._id,
      image: eventImg.path,
      category
    }, { new: true })
    .then(updatedEvent => {
      console.log('updatedEvent:', updatedEvent);
      res.redirect('/events/');
    })
    .catch(err => {
      console.log('error updating event', err);
    })
  }
});

/* GET delete event */
router.get('/delete-event/:id', isLoggedIn, (req, res, next) => {
  const eventID = req.params.id; 

  Event
    .findByIdAndRemove(eventID)
    .then(() => {
      res.redirect('/events/');
    })
    .catch(err => {
      console.log('error finding the event to edit', err);
    })
});

/* GET register to event */ 
router.get('/attending/:id', isLoggedIn, (req, res, next) => {
  const eventID = req.params.id; 
  const { user } = req.session; 

  Event
    .findByIdAndUpdate(eventID,
      {
        $addToSet: { attendees: user._id }
      },
      { new: true }
    )
    .then(updatedEvent => {
      console.log('updatedEvent', updatedEvent);
      res.redirect(`/events/${updatedEvent._id}`);
    })
    .catch(err => {
      console.log('error adding user to attendees', err);
    })
});

/* GET unregister from event */
router.get('/not-attending/:id', isLoggedIn, (req, res, next) => {
  const eventID = req.params.id; 
  const { user } = req.session; 

  Event
    .findByIdAndUpdate(eventID,
      {
        $pull: { attendees: user._id }
      },
      { new: true }
    )
    .then(updatedEvent => {
      console.log('updatedEvent', updatedEvent);
      res.redirect(`/events/${updatedEvent._id}`);
    })
    .catch(err => {
      console.log('error adding user to attendees', err);
    })
});

/* GET specific event page */
router.get('/:id', isLoggedIn, (req, res, next) => {
  const { user } = req.session; 
  const { id } = req.params; 

  Event
    .findById(id)
    .populate('attendees')
    .then(foundEvent => {
      const userIsAuthor = foundEvent.author._id.equals(user._id); 
      const userIsAttending = foundEvent.attendees.some(e => {
        return e.equals(user._id); 
      }); 

      res.render('events/event-page', { 
        event: foundEvent, 
        userIsAuthor,
        userIsAttending,
        attendees: foundEvent.attendees
      });
    })
    .catch(err => {
      console.log('error finding one event', err); 
    })
});

module.exports = router;