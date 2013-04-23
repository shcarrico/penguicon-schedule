steal.config({

	map : {
		"*" : {
			"can" : "lib/canjs",
			"jquery/jquery.js" : "jquery",
            "lodash/lodash.js" : "lodash",
            "moment/moment.js" : "moment"
		}
	},
	paths: {
		"lodash": "lib/lodash.compat-dev.js",
		"jquery": "lib/jquery-1.9.1-dev.js",
		"can" : "lib/canjs/can.js",
        "moment" : "lib/moment.min.js"
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
