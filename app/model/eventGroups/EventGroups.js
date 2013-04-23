steal(
    "app/model/events",
    "can",
    'lodash',
    function (Events) {

        return function () {
            var def, byLocation, byTrack;

            def = $.Deferred();
            Events.findAll().then(function (events) {

                var dayev,days,day,data;

                events = _.forEach(events,function(node){
                    if(node.hasOwnProperty('book description')){
                        node.attr('description',node.attr('book description'));
                    }
                });

                days = _.groupBy(events.attr(),'date');

                data = {
                    day : {}
                };

                for(day in days){
                    data.day[day] = {};
                    data.day[day].events = days[day];
                    data.day[day].byLocation = _.groupBy(days[day], "location");
                    data.day[day].byTrack = _.groupBy(days[day], "track");
                }

                data.days = _.keys(data.day);
                data.locations = _.unique(_.map(events,"location"));
                data.tracks = _.unique(_.map(events,"track"));

                def.resolve(events, data);
            });

            return def;
        }
    });