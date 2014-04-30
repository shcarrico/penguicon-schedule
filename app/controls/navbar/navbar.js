var template = require("./navbar.mustache");

module.exports = can.Control.extend({

	init: function () {
		var state = this.options.state;
		this.element.html(template({state : state, nodes: [
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
			isActive: function () {
                //console.log(this.route,this.route === state.attr('day') ? "active" : "")
				return this.route === state.day ? "active" : "";
			}
		}));
	},

	"input[name=day] change": function (el, ev) {
		var day = el.val();
		this.options.state.attr('day', day);
	},


    "input[name=viewBy] change": function (el, ev) {
        var val = el.val();
        this.options.state.attr('viewBy',val);
    }

});