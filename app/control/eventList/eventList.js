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

                this.options.viewBy = can.compute('track');
                this.options.day = can.compute('friday');

                this.on();

                this.setLoading();
                _.defer($.proxy(this.updateView,this));
                this.updateView();

            },

            setLoading : function(){
                this.element.addClass('loading');
            },

            updateView : function(){
                var self = this;

                EventGroups().then(function (events, data) {

                    var day, days, viewBy, dayStr, locations, tracks;

                    day = data.day;
                    days = data.days;
                    locations = data.locations;
                    tracks = data.tracks;
                    dateMap = data.names;
                    dayMap = _.invert(dateMap);

                    viewBy = self.options.viewBy();
                    appDay = dayMap[self.options.day()];

                    var frag = eventListTpl({date:[appDay]}, {

                        getViewBy: function (dayStr) {
                            dayStr = String(dayStr);
                            accordionIdx = 0;
                            lastSection = "";
                            return viewByTpl.render({view: data[viewBy + 's']}, {
                                getAccordionId : function(section){
                                    if(section !== lastSection){
                                        accordionIdx++;
                                        lastSection = section;
                                    }
                                    return "_accordion" + accordionIdx;
                                },
                                getEvent: function (key) {
                                    key = String(key);
                                    var events = day[dayStr]["by"+can.capitalize(viewBy)][key];
                                    if(typeof events === "undefined"){
                                        events = [];
                                    }
                                    return eventTpl.render({evt: events})
                                }
                            });
                        },

                        getDayName: function (dayStr) {
                            dayStr = String(dayStr);

                            return can.capitalize(dateMap[dayStr]);
                        }
                    });

                    self.element.find('.list').html(frag);
                    self.element.removeClass('loading');
                });
            },

            "{viewBy} change" : function(){
                _.defer($.proxy(this.updateView,this))
            },

            "{day} change" : function(){
                _.defer($.proxy(this.updateView,this))
            },

            "#btnBylocation click" : function(){
                this.options.viewBy('location')
            },
            "#btnBytrack click" : function(){
                this.options.viewBy('track')
            },
            "day/:day route" : function(day){
                this.options.day(day['day']);
            }
        });
    });