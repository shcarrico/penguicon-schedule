var template = require("./navbar.mustache");

module.exports = can.Control.extend({

	init: function () {
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
		]}));
	},

	".day click": function (el, ev) {
		ev.preventDefault();
		var day = el.attr('href').split('#')[1];
		this.options.state.attr('day', day);
	}

});