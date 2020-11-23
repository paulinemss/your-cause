const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const eventSchema = new Schema({
  title: String, 
  organiser: String, 
  startDate: Date,
  startTime: String, 
  endDate: Date, 
  endTime: String, 
  description: String,
  link: String,
  image: String,
  // PUTTING THE PROPERTY BELOW IN COMMENTS FOR NOW

  // author: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }, 
  // --> TODO: setup relationships between users & events

  category: {
    type: String,
    enum: ['environment', 'women']
  }
});

const Event = model("Event", eventSchema);

module.exports = Event;