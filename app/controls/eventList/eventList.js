var eventGroups = require("models/eventGroups/eventGroups.js");
var eventListTpl = require("./eventlist.mustache");
var viewByTpl = require("./viewby.mustache");
var eventTpl = require("./event.mustache");
var moment = require("moment");

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
			if (! $(ev.target).parents('svg').length) {
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

			var day, days, viewBy, dayStr, locations, tracks;

			day = data.day;
			days = data.days;
			locations = data.locations;
			tracks = data.tracks;
			dateMap = data.names;
			dayMap = _.invert(dateMap);

			viewBy = self.options.viewBy();
			appDay = dayMap[self.options.day()];

			var frag = eventListTpl({date: [appDay]}, {

				getHeading: function (dayStr) {
					dayStr = String(dayStr);
					var dayName = can.capitalize(dateMap[dayStr]);
					if (viewBy == 'startTime') {
						return "What's happening now";
					}
					return "Events for " + dayName;
				},

				getViewBy: function (dayStr) {
					dayStr = String(dayStr);
					accordionIdx = 0;
					lastSection = "";
					var viewByData = data[viewBy + 's'];
					if (viewBy == 'startTime') {
						nowMoment = moment();
						viewByData = _.filter(data.startTimes, function (groupTime) {
							var groupTimeMoment = moment("2014 " + groupTime + " -0400", "YYYY MMM-DD HH:mm Z");
							return groupTimeMoment.diff(nowMoment, 'minutes') >= -50;
						});
						viewByData.length = Math.min(viewByData.length, 3);
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
							if (viewBy == 'startTime') {
								var sectionMoment = moment(section, "MMM-DD HH:mm");
								return sectionMoment.format("hh:mma");
							}
							return section;
						},
						showMap: function (location) {
							if (self.options.viewBy() == 'location' && self.options.places.hasOwnProperty(location)) {
								return '<button data-location="' + location + '" class="btn btn-xs btn-info showmap">Map</button>';
							}
						},
						getEvent: function (key) {
							key = String(key);
							if (viewBy == 'startTime') {
								var events = data["by" + can.capitalize(viewBy)][key];
								events = _.sortBy(events, 'location');
							} else {
								var events = day[dayStr]["by" + can.capitalize(viewBy)][key];
							}
							if (typeof events === "undefined") {
								events = [];
							}
							return eventTpl.render({evt: events},
								{
									showLocationHeader: function () {
										if (self.options.viewBy() != 'location') {
											return '<td class="head">Location</td>';
										}
									},
									showLocation: function (location) {
										if (self.options.viewBy() != 'location') {
											return '<td class="location nowrap"><button data-location="' + location + '" class="showmap btn btn-xs btn-info">' + location + '</button></td>';
										}
									},
									showTrackHeader: function () {
										if (self.options.viewBy() != 'track') {
											return '<td class="head">Track</td>';
										}
									},
									showTrack: function (track) {
										if (self.options.viewBy() != 'track') {
											return '<td class="nowrap">' + track + '</td>';
										}
									},
									getPresenters: function () {
										return this.presenters;
									},
									getDescription: function () {
										return this.description;
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

			self.element.find('.accordion').on('shown', function () {
				var selected = $(this).find(".accordion-group > .in")
				var body = $("html > body");
				if (body.scrollTop() > selected.offset().top) {
					$("html, body").animate({scrollTop: (selected.offset().top) - 50}, 300);
				}
			});

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

	"input[name=viewBy] change": function (el, ev) {

		var val = el.val();
		this.options.viewBy(val);
	},

	"button.showmap click": function (el) {
		$('body').addClass('mapopen');
		this.highlightMap(el.data().location);
		return false;
	},

	//route observable handlers
	"{state} change": function (state, ev, property, operation, newVal) {
		if (property === "day") {
			//console.log('day change', newVal)
			this.options.day(newVal);
		}
	}

});
