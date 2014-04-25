steal(
	"./navbar.mustache",
	"can",
	function (template) {
		"use strict";

		return can.Control({

			init: function () {
				var $el;

				$el = this.element;
				$el.append('<div id="NavBar"></div>');

                $el.find('#NavBar').append(template({nodes:[
                    {
                        name: 'Friday',
                        route: 'day/friday'
                    },
                    {
                        name: 'Saturday',
                        route: 'day/saturday'
                    },
                    {
                        name: 'Sunday',
                        route: 'day/sunday'
                    }
                ]}));
			}

		});
	});