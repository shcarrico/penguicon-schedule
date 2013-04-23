steal(
	'app/control/root',

	//return global namespaces or modify existing ones
	'can',
	'app/bootstrap.js',
	'app/plugins',
	function (RootController) {
		"use strict";

		var rootController;

		rootController = new RootController("body");

	});