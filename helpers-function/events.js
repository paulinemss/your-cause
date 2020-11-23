/* Helper function to format correctly the date objects in forms */ 
exports.formatDate = function(date) {
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

/* Helper function to format correctly the date objects in interface */ 
exports.getDateString = function(data) {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate); 

  const weekdays = ['Sun.', 'Mon.', 'Tue.', 'Wed', 'Thu.', 'Fri.', 'Sat.']; 
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const startWeekday = weekdays[startDate.getDay()];
  const startDay = startDate.getDate();
  const startMonth = months[startDate.getMonth()]; 

  const endWeekday = weekdays[endDate.getDay()];
  const endDay = endDate.getDate();
  const endMonth = months[endDate.getMonth()]; 

  if (startDate.toDateString() === endDate.toDateString()) {
    return `On ${startWeekday} ${startDay} ${startMonth} from ${data.startTime} to ${data.endTime}`; 
  } else {
    return `From ${startWeekday} ${startDay} ${startMonth} at ${data.startTime} to ${endWeekday} ${endDay} ${endMonth} at ${data.endTime}`; 
  }
}

/* Helper function to filter events based on the user's interest */ 
exports.getOnlyInterestingEvents = function(arr, interest) {
  return arr.filter(event => {
    return event.category === interest; 
  })
}

/* Helper function to filter outdated events from events array */ 
exports.removeOldEvents = function(arr) {
  return arr.filter(event => {
    let now = new Date();
    let eventStart = new Date(event.startDate); 
    return eventStart >= now; 
  })
}

/* Helper function to sort events array by date */ 
exports.sortEvents = function(arr) {
  return arr.sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });
}

/* Helper function to find all events created by the user */ 
exports.findEventsCreatedByUser = function(events, userID) {
  return events.filter(event => {
    return event.author.equals(userID);
  })
} 

/* Helper function to find all events the user is attending */ 
exports.findEventsUserIsAttending = function(events, userID) {
  return events.filter(event => {
    return event.attendees.some(e => e.equals(userID));
  })
}