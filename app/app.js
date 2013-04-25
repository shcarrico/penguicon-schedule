steal("jquery")

    .then(
    "lib/bootstrap.min.js",
    "css/bootstrap.min.css")

    .then(
	'app/control/root',
	'can',
	'app/bootstrap.js',
	'app/plugins',
	function (RootController) {
		"use strict";

		var rootController;

		rootController = new RootController("body");

	});