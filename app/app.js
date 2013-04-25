steal("jquery")

    .then(
    "app/penguicon.less",
    "lib/jquery.color-2.1.0.min.js",
    "lib/jquery.svg.min.js",
    "lib/bootstrap.min.js")

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