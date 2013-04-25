steal("jquery")

    .then(
    "lib/jquery.color-2.1.0.min.js",
    "lib/jquery.svg.min.js",
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