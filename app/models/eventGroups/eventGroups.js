var Events = require("models/events/events.js");
var def = $.Deferred();

Events.done(function (events) {

	var days, data, names;

	names = {'5/2/2014': 'friday', '5/3/2014': 'saturday', '5/4/2014': 'sunday'};

	events = _.forEach(events, function (node) {
		if (node.hasOwnProperty('book_description')) {
			node['description'] = node['book_description'];
		}
		if (node['location'] == '') {
			node['location'] = '\uFEFFEverywhere';
		}
	});

	days = _.groupBy(events, 'start_date');

	data = {
		day: {}
	};

    data.startTimes = {};

	_.forEach(days, function (events, day) {
		data.day[day] = {};
		data.day[day].events = events;
		data.day[day].byLocation = _.groupBy(events, "location");
		data.day[day].byTrack = _.groupBy(events, "track");
		data.day[day].byStartTime = _.groupBy(events, "start_time");
		data.day[day].name = names[day];
        data.startTimes[day] =  _.unique(_.map(events, function (evt) {
            return evt.start_date + " " + evt.start_time
        })).sort();
	});

	data.days = _.keys(data.day);
	data.names = names;
	data.locations = _.unique(_.map(events, "location")).sort();
	data.tracks = _.unique(_.map(events, "track")).sort();
	data.allStartTimes = _.unique(_.map(events, function (evt) {
		return evt.start_date + " " + evt.start_time
	})).sort();

	data.byStartTime = _.groupBy(events, function (evt) {
		return evt.start_date + " " + evt.start_time
	});


	def.resolve(events, data);
});

module.exports = def.promise();