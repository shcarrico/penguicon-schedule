var eventGroups = require("models/eventGroups/eventGroups.js");
var eventListTpl = require("./eventlist.mustache");
var viewByTpl = require("./viewby.mustache");
var eventTpl = require("./event.mustache");
var moment = require("moment");

function getStarStorage() {
    function supportsStorage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    function getStarred() {
        return JSON.parse(localStorage.getItem('starred'));
    }

    if (supportsStorage()) {
        return {
            get: function (id) {
                var starred = getStarred();
                if (starred) {
                    return starred.indexOf(id) !== -1
                }
            },
            put: function (id) {
                var starred = getStarred();
                if (starred && (starred.indexOf(id) !== -1)) {
                    starred.push(id);
                    return true;
                }
            },
            del: function (id) {
                var starred = getStarred();
                if (starred && (starred.indexOf(id) !== -1)) {
                    starred.splice(starred.indexOf(id), 1);
                    return true;
                }
            }
        }
    } else {
        return {
            get: function () {
                //noop
            },
            put: function () {
                //noop
            },
            del: function () {
                //noop
            }
        }
    }

}

can.Mustache.registerHelper("fmtTime", function (timeStr) {
    if (timeStr == '') {
        return 'All Day';
    } else {
        return moment(timeStr, "HH:mm").format("hh:mma");
    }
});

module.exports = can.Control({
    defaults: {
        places: {
            "Algonquin A": "algonquin_a",
            "Algonquin B/C": "algonquin_bc",
            "Algonquin D": "algonquin_d",
            "Baldwin Board Room": "baldwin_boardroom",
            "Board of Governors": "board_governors",
            "Board of Regents": "board_regents",
            "Board of Trustees": "board_trustees",
            "Charlevoix A": "charlevoix_a",
            "Charlevoix B": "charlevoix_b",
            "Charlevoix C": "charlevoix_c",
            "Gaming (Restaurant)": "tc_linguinis",
            "Hamlin": "hamlin",
            "Montcalm": "montcalm",
            "Nicolet": "nicolet",
            "Portage Auditorium": "portage_auditorium",
            "Windover": "windover"
        },
        mapLoaded: can.Deferred(),
        day: "friday"
    }
}, {
    init: function () {
        var self = this;
        this.options.viewBy = can.compute('startTime');
        this.options.day = can.compute('friday');

        this.on();

        $('#hotelmap').load('penguicon_2014.svg', null, function () {
            self.options.mapLoaded.resolve($('svg')[0]);
        });

        $('body').click(function (ev, el) {
            if (!$(ev.target).parents('svg').length) {
                if ($(this).hasClass('mapopen')) {
                    $('body').removeClass('mapopen');
                }
            }
        });

        this.updateView();
    },

    setLoading: function () {
        this.element.addClass('loading');
        this.element.find('.list').css('visibility', 'hidden');
    },

    clearLoading: function () {
        this.element.removeClass('loading');
        this.element.find('.list').css('visibility', 'visible');
    },

    updateView: function () {
        var self = this;
        this.setLoading();

        eventGroups.done(function (events, data) {

            var day, dateMap, viewBy, dayMap, appDay;

            day = data.day;
            dateMap = data.names;
            dayMap = _.invert(dateMap);

            viewBy = self.options.viewBy();
            appDay = dayMap[self.options.day()];


            var frag = eventListTpl({date: [appDay]}, {

                getHeading: function (dayStr) {
                    dayStr = String(dayStr);
                    var dayName = can.capitalize(dateMap[dayStr]);
                    var heading = '';
                    if (viewBy == 'now') {
                        heading = "What's happening now";
                    } else if (viewBy == 'startTime') {
                        heading = 'Events for ' + dayName + ' by Timeslot';
                    } else {
                        heading = "Events for " + dayName + ' by ' + can.capitalize(viewBy);
                    }
                    return heading;
                },


                getViewBy: function (dayStr) {
                    dayStr = String(dayStr);

                    var accordionIdx = 0;
                    var lastSection = "";
                    var viewByData, nowMoment;
                    var dateFormat = "M/D/YYYY H:mm Z";
                    var firstMoment;

                    if (viewBy == 'now') {
                        //nowMoment = moment('5/2/2014 16:00 -0500',dateFormat);
                        nowMoment = moment();
                        firstMoment = moment(data.day[dayStr].startTimes[0] + " -0400", dateFormat);
                        viewByData = _.filter(data.day[dayStr].startTimes, function (groupTime) {
                            var groupTimeMoment = moment(groupTime + " -0400", dateFormat);
                            return nowMoment.isAfter(firstMoment) && groupTimeMoment.diff(nowMoment, 'minutes') >= -50;
                        });
                        viewByData.length = Math.min(viewByData.length, 3);

                    }
                    else {
                        viewByData = data.day[dayStr][viewBy + 's'];
                    }

                    return viewByTpl.render({view: viewByData}, {
                        getAccordionId: function (section) {
                            if (section !== lastSection) {
                                accordionIdx++;
                                lastSection = section;
                            }
                            return "_accordion" + accordionIdx;
                        },
                        getSectionName: function (section) {
                            if ((viewBy == 'startTime') || (viewBy == 'now')) {
                                var sectionMoment = moment(section + ' -0400', dateFormat);
                                return sectionMoment.format("dddd hh:mma");
                            }
                            return section;
                        },
                        showMap: function (location) {
                            if (self.options.viewBy() == 'location' && self.options.places.hasOwnProperty(location)) {
                                return '<button data-location="' + location + '" class="btn btn-sm btn-info showmap byLocation">Map</button>';
                            }
                        },
                        getEvent: function (key) {

                            key = String(key);
                            var events = [];

                            if ((viewBy == 'startTime') || (viewBy == 'now')) {
                                key = key.split(' ')[1];
                                events = day[dayStr]["by" + can.capitalize('startTime')][key];

                            } else {
                                events = day[dayStr]["by" + can.capitalize(viewBy)][key];
                            }

                            return eventTpl.render({evt: events},
                                {
                                    showLocationHeader: function () {
                                        if (viewBy != 'location') {
                                            return '<td class="head">Location</td>';
                                        }
                                    },
                                    showLocation: function (location) {
                                        if (viewBy != 'location') {
                                            if (self.options.places.hasOwnProperty(location)) {
                                                return '<td class="location nowrap"><button data-location="' + location + '" class="showmap btn btn-xs btn-info">' + location + '</button></td>';
                                            } else {
                                                return '<td class="location nowrap">' + location + '</td>';
                                            }
                                        }
                                    },
                                    showTrackHeader: function () {
                                        if (viewBy != 'track') {
                                            return '<td class="head">Track</td>';
                                        }
                                    },
                                    showTrack: function (track) {
                                        if (viewBy != 'track') {
                                            return '<td class="nowrap">' + track + '</td>';
                                        }
                                    },
                                    getStarred: function () {

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
            self.clearLoading();

            if (viewBy == "startTime") {
                self.element.find('.accordion-toggle:first').click();
            }

        });
    },

    highlightMap: function (name) {
        var id = this.options.places[name];
        if (id) {
            this.options.mapLoaded.then(function (svg) {
                window.select_room(id);
            });
        }
    },

    /**
     * Event Handlers
     */

    //observable object handlers
    "{viewBy} change": "updateView",
    "{day} change": "updateView",

    "button.showmap click": function (el) {
        $('body').addClass('mapopen');
        this.highlightMap(el.data().location);
        return false;
    },

    "{state} change": function (state, ev, property, operation, newVal) {
        switch (property) {
            case "day":
                this.options.day(newVal);
                break;
            case "viewBy":
                this.options.viewBy(newVal);
                break;
        }
    },

    ".panel-group shown.bs.collapse": function (el, ev) {
        var $tgt = $(ev.target);
        var scrolltgt = $tgt.offset();
        var scrollPos = (scrolltgt.top || 0) - 96;
        $("html, body").animate({
            scrollTop: scrollPos
        });
    },

    ".star click": function (el) {
        var data = el.data();

    }

});
