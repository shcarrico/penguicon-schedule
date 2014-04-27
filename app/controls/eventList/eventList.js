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
		},
		day: "friday"
	}
}, {
	init: function () {

		this.options.viewBy = can.compute('startTime');
		this.options.day = can.compute('friday');

		this.on();

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
							if (self.options.viewBy() == 'location') {
								return '<button data-location="' + location + '" class="btn btn-mini btn-info showmap">Map</button>';
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
											return '<td class="location nowrap"><button data-location="' + location + '" class="showmap btn btn-small btn-info">' + location + '</button></td>';
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

	/**
	 * Event Handlers
	 */

	//observable object handlers
	"{viewBy} change": "updateView",
	"{day} change": "updateView",

	"input[name=viewBy] change": function (el, ev) {

		var val = el.val();
		console.log('viewByChange', val)
		this.options.viewBy(val);
	},

	"button.showmap click": function (el) {
		$('#hotelmap').modal();
		this.highlightMap(el.data().location);
	},

	//route observable handlers
	"{state} change": function (state, ev, property, operation, newVal) {
		if (property === "day") {
			console.log('day change', newVal)
			this.options.day(newVal);
		}
	}

});
