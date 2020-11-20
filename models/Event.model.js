const { Schema, model } = require("mongoose");

const eventSchema = new Schema({
  title: String, 
  organiser: String, 
  date: Date, 
  description: String,
  time: String,
  link: String,
  image: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }, 
  category: {
    enum: ['environment', 'women']
  }
});

const Event = model("Event", eventSchema);

module.exports = Event;