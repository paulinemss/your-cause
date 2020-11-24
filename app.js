// ℹ️ To get access to environment
require("dotenv").config();

// ℹ️ Connect to the database
require("./db");

const express = require("express");
const hbs = require("hbs");

hbs.registerHelper('isSelected', function (savedValue, selectedValue) {
  return savedValue === selectedValue; 
});
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerPartials(__dirname + '/views/partials');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require("./config")(app);

const projectName = "ironhack-project2";
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with IronGenerator`;
// default value for title local

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const eventsRoutes = require("./routes/events");
app.use("/events", eventsRoutes); 

const booksRoutes = require("./routes/books");
app.use("/books", booksRoutes); 

const newsRoutes = require("./routes/news");
app.use("/news", newsRoutes); 

const settingsRoutes = require("./routes/settings");
app.use("/settings", settingsRoutes); 

// ❗ To handle errors. Routes that dont exist or errors that you handle in specfic routes
require("./error-handling")(app);

module.exports = app;
