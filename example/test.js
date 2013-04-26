steal("jquery")
	.then('example/Control.js', 'funcunit/qunit',

	function (Controller) {

		module('penguicon controller example', {

			setup: function () {


				//create an instance of this controller
				//first argument is selector for element to bind the controller to
				var myController = new Controller("#qunit-test-area", {
					name: 'Events',
					data: {
						events: [
							{ name: 'event1', description: 'event description'}
						]
					}
				});
			},
			teardown: function () {
				//$("#target").empty();
			}

		});

		test("passed data changes the default title", function () {
			equal($("#qunit-test-area h2").text(), "Events")
		});


	});
