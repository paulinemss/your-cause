const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const eventSchema = new Schema({
  title: String, 
  organiser: String, 
  startDate: Date,
  startTime: String, 
  endDate: Date, 
  endTime: String, 
  dateString: String,
  description: String,
  link: String,
  image: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  category: {
    type: String,
    enum: ['environment', 'women']
  }
});

const Event = model("Event", eventSchema);

module.exports = Event;