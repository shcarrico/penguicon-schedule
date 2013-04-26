steal('can', 'can/view/mustache', function () {


	var Controller = can.Control({
		//static properties accessible via this.constructor
		defaults: {
			//defaults for this control
			name: 'eventz',
			data: {
				events: []
			}
		}
	}, {
		//prototype properties
		/**
		 * Init is called every time this controller object is
		 * instantiated with the "new" keyword
		 * @param options object passed to control, extended with defaults above ala $.extend(defaults,object)
		 */
		init: function (options) {
			var self;
			self = this;
			//this.element will resolve to $("#target") passed in below.
			this.element.html(can.view('myTemplate.mustache', this.options.data, {
				getName: function () {
					return self.options.name;
				}
			}));
		}

	});

	//create an instance of this controller
	//first argument is selector for element to bind the controller to
	var myController = new Controller("#target", {
		name: 'Events',
		data: {
			events: [
				{ name: 'event1', description: 'event description'}
			]
		}
	});

	return Controller;

})

