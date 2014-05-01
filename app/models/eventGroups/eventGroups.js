var Events = require("models/events/events.js");
var def = $.Deferred();
var moment = require('moment');

Events.done(function (events) {

	var days, data, names;

	names = {'5/2/2014': 'friday', '5/3/2014': 'saturday', '5/4/2014': 'sunday'};

    var id = 0;

	events = _.forEach(events, function (node) {
		if (node.hasOwnProperty('book_description')) {
			node['description'] = node['book_description'];
		}
		if (node['location'] == '') {
			node['location'] = '\uFEFFEverywhere';
		}
        node.id = id++;
        node.starred = false;
	});

	days = _.groupBy(events, 'start_date');

	data = {
		day: {}
	};

    data.startTimes = {};

    function timeSort(a,b){
        var dateFormat = "M/D/YYYY H:mm Z";
        var am = moment(a + " -0400",dateFormat);
        var bm = moment(b + " -0400",dateFormat);

        return am.isBefore(bm) ? -1 : 1;
    }

    function getTrackGroupBy (events){

        var grouped = {};

        _.forEach(events,function(event){

            var tracks = event.track.split(',');

            _.forEach(tracks,function(track){
                if(!grouped[track]){
                    grouped[track] = [];
                }
                grouped[track].push(event);
            });

        });

        return grouped;
    }


	_.forEach(days, function (events, day) {
		data.day[day] = {};
		data.day[day].events = events;
		data.day[day].byLocation = _.groupBy(events, "location");
		data.day[day].byTrack = getTrackGroupBy(events);
		data.day[day].byStartTime = _.groupBy(events, "start_time");
		data.day[day].name = names[day];
        data.day[day].tracks = _.keys(data.day[day].byTrack).sort();
        data.day[day].locations = _.keys(data.day[day].byLocation).sort();
        data.day[day].startTimes =  _.unique(_.map(events, function (evt) {
            return evt.start_date + " " + evt.start_time
        })).sort(timeSort);
	});

	data.days = _.keys(data.day);
	data.names = names;
	data.allStartTimes = _.unique(_.map(events, function (evt) {
		return evt.start_date + " " + evt.start_time
	})).sort(timeSort);

	data.byStartTime = _.groupBy(events, function (evt) {
		return evt.start_date + " " + evt.start_time
	});


	def.resolve(events, data);
});

module.exports = def.promise();