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


                _.defer($.proxy(this.updateView,this));

                this.options.places = {
                    "salon_a": "Salon A",
                    "salon_b": "Salon B",
                    "salon_c": "Salon C",
                    "salon_d": "Salon D",
                    "salon_e": "Salon E",
                    "oakland_ballroom": "Oakland Ballroom",
                    "auburn": "Auburn",
                    "centerpoint": "Centerpoint",
                    "baldwin": "Baldwin",
                    "wisner": "Wisner",
                    "perry": "Perry",
                    "featherstone": "Featherstone",
                    "ottawa_ballroom": "Ottawa Ballroom",
                    "fountain_terrace": "Fountain Terrace",
                    "boardroom": "Boardroom"
                };

                this.options.animState = {
                    id: null,
                    obj: null,
                    started: false,
                    progress: 0,
                    fillColors: [jQuery.Color("rgba(0,124,250,0.28)"), jQuery.Color("rgba(185,231,81,0.58)")]
                };

            },

            setLoading : function(){
                this.element.addClass('loading');
                this.element.find('.list').empty();
            },

            updateView : function(){
                var self = this;
                this.setLoading();

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
                                showMap : function(location){
                                    if (self.options.viewBy() == 'location') {
                                        return '<button data-location="'+location+'" class="btn btn-mini btn-info showmap">Map</button>';
                                    }
                                },
                                getEvent: function (key) {
                                    key = String(key);
                                    var events = day[dayStr]["by"+can.capitalize(viewBy)][key];
                                    if(typeof events === "undefined"){
                                        events = [];
                                    }
                                    return eventTpl.render({evt: events},
                                        {
                                            showLocationHeader: function() {
                                                if (self.options.viewBy() != 'location') {
                                                    return '<td class="head">Location</td>';
                                                }
                                            },
                                            showLocation: function(location) {
                                                if (self.options.viewBy() != 'location') {
                                                    return '<td class="location nowrap"><button data-location="'+location+'" class="showmap btn btn-small btn-info">'+location+'</button></td>';
                                                }
                                            },
                                            showTrackHeader: function() {
                                                if (self.options.viewBy() != 'track') {
                                                    return '<td class="head">Track</td>';
                                                }
                                            },
                                            showTrack: function(track) {
                                                if (self.options.viewBy() != 'track') {
                                                    return '<td class="nowrap">'+track+'</td>';
                                                }
                                            },
                                            getPresenters : function(){
                                                return this.presenters;
                                            },
                                            getDescription : function(){
                                                return this.description
                                            }

                                        })
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

            highlightMap : function(id){

                var map = _.invert(this.options.places);

                var animstate = this.options.animState;

                function fadeUpdate() {
                    var value = this['value'];
                    animstate.progress = value;
                    if (animstate.id != null && animstate.obj != null) {
                        var color = animstate.fillColors[0].transition(animstate.fillColors[1], value);
                        animstate.obj.css('fill', color.toHexString(false));
                        animstate.obj.css('fill-opacity', color.alpha());
                    }
                }
                function fadeUp() {
                    jQuery({value:0.65}).animate({value:1.0}, {
                        duration: 750,
                        easing: 'swing',
                        step: fadeUpdate,
                        complete: fadeDown
                    });
                }
                function fadeDown() {
                    jQuery({value:1.0}).animate({value:0.65}, {
                        duration: 750,
                        easing: 'swing',
                        step: fadeUpdate,
                        complete: fadeUp
                    });
                }

                function highlight(id) {
                    if (animstate.obj != null) {
                        var color = animstate.fillColors[0];
                        animstate.obj.css('fill', color.toHexString(false));
                        animstate.obj.css('fill-opacity', color.alpha());
                    }
                    animstate.id = id;
                    var svg = $('svg')[0];
                    animstate.obj = jQuery(svg.getElementById(id));
                    if (! animstate.started) {
                        animstate.started = true;
                        fadeDown();
                    }
                }

                highlight(map[id]);

            },

            /**
             * Event Handlers
             */

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
            },
            "button.showmap click" : function(el){
                $('#hotelmap').modal();
                this.highlightMap(el.data().location);
            }
        });
    });