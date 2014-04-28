var _ = require("lodash");
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");
var webpackDevMiddleware = require("webpack-dev-middleware");

var dev_compiler = webpack(_.extend({}, webpackConfig, {
	output: {
		path: __dirname + "build/", //it is important to begin relative paths with the __dirname builtin
		filename: "index.js",
		sourceMapFilename: "[file].source.map" //the [file] reference pulls the output filename
	},
	devtool: "#source-map" //the # sign controls the source map pragma prefix. # is more compatible than the default @,
}));

//define the middleware by passing the dev compiler options to the middleware function
//the second argument is configuration for the connect middleware, not the webpack compiler
var devServerMiddleware = webpackDevMiddleware(dev_compiler, {
	noInfo: true,
	quiet: false,

	lazy: false,
	publicPath: "/build/", //this is the middleware matcher path

	watchDelay: 300,

	stats: {
		colors: true
	}
});

module.exports = function (grunt) {
	grunt.initConfig({
		webpack: {
			options: webpackConfig,
			prod: {
				output: {
					path: "build/",
					filename: "[name].js"
				},
				 plugins: webpackConfig.plugins.concat(
				 new webpack.DefinePlugin({
				 "process.env": {
				 "NODE_ENV": JSON.stringify("production")
				 }
				 }),
				 //this will remove duplicate imports in the final artifact, and eliminate
				 //unused artifacts from the output file that were included aggressively, IE 'require('everything') instead of
				 //a deeper seed file
				 new webpack.optimize.DedupePlugin(),
				 //this runs the output through uglifyJs to minify the output
				 //note that by default, banners in the source files are preserved
				 new webpack.optimize.UglifyJsPlugin()
				 )
			}
		},
		less: {
			dev: {
				options: {
					ieCompat: false, //this prevents errors due to IE8 and lower compatibility requirements for url size
					sourceMap: true,
					sourceMapFilename: "build/less.source.map",
					sourceMapUrl: "/build/less.source.map", //Override the default url that points to the sourcemap from the compiled css file.
					sourceMapBasepath: "/resources/less", //Sets the base path for the less file paths in the source map.
					sourceMapRootpath: "/" //Adds this path onto the less file paths in the source map.
				},
				files: {
					"build/index.css": "app/less/*.less"
				}
			},
			prod: {
				options: {
					ieCompat: false,
					compress: true, //remove whitespace
					cleancss: true //compress CSS output
				},
				files: {
					"build/index.css": "app/less/*.less"
				}
			}
		},
		watch: {
			less: {
				files: ['app/less/*.less', '*.svg', 'resources/bootstrap/less/**/*.less'],
				tasks: ['less:dev'] //run this task when any of the matched files change
			},
			options: {
				atBegin: true, //run the watcher tasks once to begin with, instead of waiting for a change
				spawn: true //spawn a child process for this watcher. Not necessary for the tasks in this file
			}
		},
		//connect, provides HTTP server and allows middleware to handle special case routes
		//we are using connect here to both serve static files and recompile the main JS resource
		connect: {
			server: {
				options: {
					//add the webpack dev middleware to the already defined middleware for connect.
					// NOTE if you specify these as an array, it will not function to load static files
					// unless you re-declare the static middleware. This method looks messier but is l
					// ess re-implementation of the default options
					middleware: function (connect, options, middlewares) {
						middlewares.push(devServerMiddleware);
						return middlewares;
					},
					hostname: "localhost",
					port: "8000"
				}
			},
			prodserver: {
				options: {
					hostname: "localhost",
					port: "8000",
					keepalive: true
				}
			}
		},
		//the clean task ensures stale artifacts don't hang around
		clean: ['build']
	});

	//these are repository tasks we are using above
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');

	//these are custom tasks that use specific repo tasks
	grunt.registerTask('default', ['clean', 'webpack:prod', 'less:prod']);
	grunt.registerTask('server', ['clean', 'connect:server', 'watch'])
	grunt.registerTask('prodserver', ['connect:prodserver'])

};