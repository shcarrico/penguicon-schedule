steal(
	"app/model/events",
	"can",
	'lodash',
	function (Events) {

        var def;

        def = $.Deferred();

        Events.findAll().then(function (events) {

            var days, day, data, names;

            names = {'5/2/2014': 'friday', '5/3/2014': 'saturday', '5/4/2014': 'sunday'};

            events = _.forEach(events, function (node) {
                if (node.hasOwnProperty('book_description')) {
                    node.attr('description', node.attr('book_description'));
                }
                if (node['location'] == '') {
                    node.attr('location', '\uFEFFEverywhere');
                }
            });

            days = _.groupBy(events.attr(), 'start_date');

            data = {
                day: {}
            };

            _.forEach(days,function(events,day){
                data.day[day] = {};
                data.day[day].events = events;
                data.day[day].byLocation = _.groupBy(events, "location");
                data.day[day].byTrack = _.groupBy(events, "track");
                data.day[day].byTime = _.groupBy(events, "start_time");
                data.day[day].name = names[day];
            });

            data.days = _.keys(data.day);
            data.names = names;
            data.locations = _.unique(_.map(events, "location")).sort();
            data.tracks = _.unique(_.map(events, "track")).sort();
            data.startTimes = _.unique(_.map(events.attr(), function (evt) {
                return evt.start_date + " " + evt.start_time
            })).sort();
            data.byStartTime = _.groupBy(events.attr(), function (evt) {
                return evt.start_date + " " + evt.start_time
            });


            def.resolve(events, data);
        });

        return def.promise();
	});