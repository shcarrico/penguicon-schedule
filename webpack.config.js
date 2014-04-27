var webpack = require("webpack");

module.exports = {
	//cache generated modules when watching (improves refresh performance)
	cache: true,
	//the source path for the entry points
	context: __dirname + "/app",
	//"entry" point, IE the seed file for this application
	entry: { index: ["index.js"] },
	resolve: {
		//setup aliases for bower modules
		//NOTE: Bower modules do not need aliases if you require the full path past bower_components ie
		// if i added module "foo" via bower, it would auto resolve foo/index.js if you require "foo", or you could
		// require('foo/foo.js').
		alias: {
			"lodash": "lodash/dist/lodash.js",
			"jquery": "jquery/dist/jquery.js",
			"can": "canjs/amd/can",
			"moment": "moment/moment.js"
		},
		//lookup modules in the following directories
		modulesDirectories: ["bower_components", "node_modules", "app"]
	},
	plugins: [
		//rewrite module internal references looking for the source regex to the replace target
		new webpack.ContextReplacementPlugin(/canjs[\/\\]amd/, /^$/),
		//these items will be available in all modules that use them internally w/o having to require them explicitly
		new webpack.ProvidePlugin({
			"_": "lodash",
			$: "jquery",
			jQuery: "jquery",
			can: "can"
		})
	],
	stats: {
		// Configure console output
		colors: true,
		modules: true,
		reasons: true
	},
	failOnError: false, // don't report error to grunt if webpack find errors,
	module: {
		//some custom CanJS loaders, courtesy of https://github.com/sykopomp
		loaders: [
			{
				test: /\.ejs/,
				loader: "transform/cacheable?can.viewify"
			},
			{
				test: /\.mustache/,
				loader: "transform/cacheable?can.viewify"
			}
		]
	}
};
