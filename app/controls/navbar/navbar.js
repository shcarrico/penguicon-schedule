var template = require("./navbar.mustache");

module.exports = can.Control.extend({

	init: function () {
		var state = this.options.state;
		this.element.html(template({nodes: [
			{
				name: 'Friday',
				route: 'friday'
			},
			{
				name: 'Saturday',
				route: 'saturday'
			},
			{
				name: 'Sunday',
				route: 'sunday'
			}
		]}, {
			isActive: function (day) {
				return day === state.attr('day') ? "active" : "";
			}
		}));
	},

	".day click": function (el, ev) {
		ev.preventDefault();
		var day = el.attr('href').split('#')[1];
		this.options.state.attr('day', day);
	}

});