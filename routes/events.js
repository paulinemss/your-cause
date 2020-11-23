const express = require('express');
const { format } = require('morgan');
const router  = express.Router();
const uploader = require('../config/cloudinary.config.js');
const Event = require('../models/Event.model');

/* Middlewares */ 
const shouldNotBeLoggedIn = require('../middlewares/shouldNotBeLoggedIn');
const isLoggedIn = require('../middlewares/isLoggedIn');

/* Helper function to format correctly the date objects */ 
function formatDate(date) {
  const d = new Date(date);
  let month = d.getMonth() + 1;
  let day = d.getDate(); 
  if (month.toString().length < 2) {
    month = `0${month}`; 
  }
  if (day.toString().length < 2) {
    day = `0${day}`; 
  }
  return `${d.getFullYear()}-${month}-${day}`;
}

/* GET main events page - feed of all events */ 
router.get('/', isLoggedIn, (req, res, next) => {
  Event
    .find()
    .then(foundEvents => {
      res.render('events/feed', { events: foundEvents });
    })
    .catch(err => {
      console.log('error finding events', err); 
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
 
  // --> TODO: VERIFY FORM INPUT BEFORE CREATING EVENT
  // For instance, event cannot be in the past,
  // endDate must be after startDate,
  // endTime must be after startTime, etc. 

  // if (write condition) {
  //   res.redirect('/events/feed', { prefilledEvent: req.body });
  // }

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
      author: user._id,
      image: req.file.path,
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

  // --> TODO: VERIFY FORM INPUT BEFORE UPDATING EVENT
  // For instance, event cannot be in the past,
  // endDate must be after startDate,
  // endTime must be after startTime, etc. 

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
      author: user._id,
      image: req.file.path,
      category
    }, { new: true })
    .then(updatedEvent => {
      console.log('updatedEvent:', updatedEvent);
      res.redirect('/events/');
    })
    .catch(err => {
      console.log('error updating event', err);
    })
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