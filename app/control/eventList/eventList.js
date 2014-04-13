steal(
	"app/model/eventGroups",
	"./eventlist.mustache",
	"./viewby.mustache",
	"./event.mustache",
	"lodash",
	"can",
	"moment",
	function (EventGroups, eventListTpl, viewByTpl, eventTpl) {

		can.Mustache.registerHelper("fmtTime", function (timeStr) {
			if (timeStr == '') {
				return 'All Day';
			} else {
				return moment(timeStr, "HH:mm").format("hh:mma");
			}
		});

		return can.Control({
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
				animState: {
					id: null,
					obj: null,
					started: false,
					progress: 0,
					fillColors: [jQuery.Color("rgba(0,124,250,0.28)"), jQuery.Color("rgba(185,231,81,0.58)")]
				}

			}
		}, {
			init: function () {
				var self = this;

				this.options.viewBy = can.compute('startTime');
				this.options.day = can.compute('friday');

				this.on();

				_.defer($.proxy(this.updateView, this));

				$('#hotelmapcontainer').load('penguicon_2014.svg', null, function() {
					self.options.mapLoaded.resolve($('svg')[0]);
				});
			},

			setLoading: function () {
				this.element.addClass('loading');
				this.element.find('.list').empty();
			},

			updateView: function () {
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
					self.element.removeClass('loading');

					self.element.find('.accordion').on('shown', function () {
						var selected = $(this).find(".accordion-group > .in")
						var body = $("html > body");
						if (body.scrollTop() > selected.offset().top) {
							$("html, body").animate({scrollTop: (selected.offset().top) - 50}, 300);
						}
					});

					var viewBy = self.options.viewBy();
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
			"{viewBy} change": function () {
				_.defer($.proxy(this.updateView, this))
			},

			"{day} change": function () {
				_.defer($.proxy(this.updateView, this))
			},

			//DOM element handlers
			"#btnBylocation click": function () {
				this.options.viewBy('location')
			},

			"#btnBytrack click": function () {
				this.options.viewBy('track')
			},

			"button.showmap click": function (el) {
				$('#hotelmap').modal();
				this.highlightMap(el.data().location);
			},

			"#btnBystartTime click": function () {
				this.options.viewBy('startTime')
			},

			//route observable handlers
			"day/:day route": function (day) {
				this.options.day(day['day']);
			}

		});
	});
