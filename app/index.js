require("bootstrap/dist/js/bootstrap.js");
var properties = require("properties.js");
var state = require('state');

//setup namespace
window.PS = {};
window.PS.properties = properties;

var Navigation = require("controls/navbar/navbar.js");
var EventList = require("controls/eventList/eventList.js");

var nav, eventList;

nav = new Navigation("#NavBar", {
	state: state
});
eventList = new EventList("#EventList", {
	state: state
});