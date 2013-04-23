steal.config({

	map : {
		"*" : {
			"can" : "lib/canjs",
			"jquery/jquery.js" : "lib/jquery-1.9.1-dev.js"
		}
	},
	paths: {
		"lodash": "lib/lodash.compat-dev.js",
		"jquery": "lib/jquery-1.9.1-dev.js",
		"can" : "lib/canjs/can.js"
	},
	shim: {
		jquery: {
			exports: "jQuery"
		}
	},
	ext: {
		js: "js",
		css: "css",
		less: "steal/less/less.js",
		mustache: "lib/canjs/view/mustache/mustache.js"
	},

	fixtures: true
})
