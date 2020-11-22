const express = require('express');
const { format } = require('morgan');
const router  = express.Router();
const uploader = require('../config/cloudinary.config.js');
const Event = require('../models/Event.model');

// --> TODO: add middleware to check if user is logged in (otherwise, user should not be able to access any of these routes)

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
router.get('/', (req, res, next) => {
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
router.get('/create-event', (req, res, next) => {
  res.render('events/create-event');
});

/* POST receive elements from create event form */
router.post('/create-event', uploader.single('imageUrl'), (req, res, next) => {
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
router.get('/edit-event/:id', (req, res, next) => {
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
router.post('/edit-event/:id', uploader.single('imageUrl'), (req, res, next) => {
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
router.get('/delete-event/:id', (req, res, next) => {
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

module.exports = router;