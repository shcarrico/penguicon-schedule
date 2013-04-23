steal(
    "app/model/eventGroups",
    "./eventlist.mustache",
    "./viewby.mustache",
    "./event.mustache",
    "lodash",
    "can",
    "moment",
    function (EventGroups, eventListTpl, viewByTpl, eventTpl) {

        can.Mustache.registerHelper("fmtTime",function(timeStr){
            return moment(timeStr,"HH:mm").format("hh:mma");
        });

        return can.Control({
            init: function () {
                var self;

                self = this;

                EventGroups().then(function (events, data) {

                    var day, days, dayStr, locations, tracks;

                    day = data.day;
                    days = data.days;
                    locations = data.locations;
                    tracks = data.tracks;

                    var viewBy = "track";

                    var frag = eventListTpl(data, {
                        getViewBy: function (dayStr) {
                            dayStr = String(dayStr);
                            return viewByTpl.render({view: data[viewBy + 's']}, {
                                getEvent: function (key) {
                                    key = String(key);
                                    return eventTpl.render({evt: day[dayStr]["by"+can.capitalize(viewBy)][key]})
                                }
                            });
                        }
                    });

                    self.element.html(frag);
                });
            }
        });
    });