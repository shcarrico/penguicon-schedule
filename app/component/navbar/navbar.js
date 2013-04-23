steal(
	"./model/model.js",
	"./navbar.mustache",
	"can",
	function (model, template) {
		"use strict";

		return can.Control({

			init: function () {
				var $el;

				$el = this.element;
				$el.append('<div id="NavBar"></div>');

				model.findAll()
					.then(function (nodes) {
						$el.find('#NavBar').append(template({nodes:nodes}));
					})
					.fail(function () {
						$el.find('#NavBar').append("Failed to load navigation nodes");
					});
			}

		});
	});