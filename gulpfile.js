// requirements
var gulp     = require("gulp"),
    del      = require("del"),
    connect  = require("gulp-connect"),
    settings = {
    		dev: "src/",
    		dist: "webapp/"
    };


// task functions
function serve () {
	var cors = require('cors'),
		open = require("open");

	gulp.watch(settings.dev + "scss/*", ["scss"]);
	gulp.watch(settings.dev + "img/*", ["files"]);
	gulp.watch(settings.dev + "js/*", ["files"]);
	gulp.watch(settings.dev + "assets/*", ["files"]);
	gulp.watch(settings.dev + "*.html", ["files"]);

	connect.server({
		port: 9000,
		root: settings.dist,
		livereload: true,
		middleware: function() {
			return [cors()];
		}
	});
	open("http://localhost:9000/index.html");
}

// tasks
gulp.task("clean", function () {
	del.sync(["webapp/"]);
});

gulp.task("files", function() {
	gulp.src(settings.dev + "*.html")
		.pipe(gulp.dest(settings.dist));
	gulp.src(settings.dev + "img/*")
		.pipe(gulp.dest(settings.dist + "img/"));
	gulp.src(settings.dev + "js/*")
		.pipe(gulp.dest(settings.dist + "js/"));
	gulp.src(settings.dev + "assets/*")
		.pipe(gulp.dest(settings.dist + "assets/"));
	gulp.src("node_modules/font-awesome/fonts/*")
		.pipe(gulp.dest(settings.dist + "fonts/"));
});

gulp.task('scss', function() {
	var sass = require('gulp-ruby-sass'),
		options = {
			container: "ruby-sass-ctnr"+Date.now(),
			attr: {
				loadPath: [settings.dev + "scss/"],
				lineNumbers: true,
				stopOnError: true
			}
		};

	return sass(options.attr.loadPath[0], options.attr)
		.on('error', function error(error) { 
			console.log('\nscss error: %s\n', error.message);
		})
		.pipe(gulp.dest(settings.dist + "style/"))
		.pipe(connect.reload());
});

gulp.task("default", [
	"clean",
	"scss",
	"files"
]);

gulp.task("serve", ["default"], serve);