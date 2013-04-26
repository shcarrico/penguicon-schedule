steal(
	"app/model/events",
	"can",
	'lodash',
	function (Events) {

		return function () {
			var def, byLocation, byTrack;

			def = $.Deferred();
			Events.findAll().then(function (events) {

				var dayev, days, day, data, names;

				names = {'Apr-26': 'friday', 'Apr-27': 'saturday', 'Apr-28': 'sunday'};

				events = _.forEach(events, function (node) {
					if (node.hasOwnProperty('book description')) {
						node.attr('description', node.attr('book description'));
					}
				});

				days = _.groupBy(events.attr(), 'date');

				data = {
					day: {}
				};

				for (day in days) {
					data.day[day] = {};
					data.day[day].events = days[day];
					data.day[day].byLocation = _.groupBy(days[day], "location");
					data.day[day].byTrack = _.groupBy(days[day], "track");
					data.day[day].byTime = _.groupBy(days[day], "start");
					data.day[day].name = names[day];
				}

				data.days = _.keys(data.day);
				data.names = names;
				data.locations = _.unique(_.map(events, "location")).sort();
				data.tracks = _.unique(_.map(events, "track")).sort();
				data.startTimes = _.unique(_.map(events.attr(), function (evt) {
					return evt.date + " " + evt.start
				})).sort();
				data.byStartTime = _.groupBy(events.attr(), function (evt) {
					return evt.date + " " + evt.start
				});


				def.resolve(events, data);
			});

			return def;
		}
	});