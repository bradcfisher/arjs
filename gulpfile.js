
var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var tsify = require('tsify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var log = require("fancy-log");
var colors = require("ansi-colors");
var rescape = require("escape-string-regexp");
var typedoc = require("gulp-typedoc");
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');


var paths = {
	buildDir: process.env.GIS_BUILD_DIR,
	reportsDir: process.env.GIS_REPORTS_DIR,
	testReportDir: process.env.GIS_TEST_REPORT_DIR,
	testResultsDir: process.env.GIS_TEST_RESULTS_DIR,
	libDir: process.env.GIS_LIB_DIR,
	distsDir: process.env.GIS_DISTS_DIR,
	docsDir: process.env.GIS_DOCS_DIR,
	dependencyCacheDir: process.env.GIS_DEPENDENCY_CACHE_DIR,
	docsDir: process.env.GIS_DOCS_DIR,

    pages: [
		'src/main/html/**/*.*',
		'src/main/font/AlternateRealityTheDungeon.woff',
		'src/main/resources/**',
		'node_modules/jquery/dist/jquery.min.*'
	]
};

//var tsProject = ts.createProject("tsconfig.json");

gulp.task('pre-test', function (done) {
/*
  return gulp.src(['src/main/ * * / *.ts'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
*/
  done();
});

gulp.task('test', gulp.series('pre-test', function () {
  return gulp.src(['src/test/typescript/**/*.ts'])
    .pipe(mocha({
		//globals: ['console']
		compilers: "ts:ts-node/register,tsx:ts-node/register"
	}))
    // Creating the reports after tests ran
//    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
//    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
}));

/**
 * Tests whether a text file contains a specific string or matches a regex pattern.
 *
 * @param	file	The file name or descriptor of the file to test.
 * @param	pattern	The literal string to search for, or a RegExp instance to match.
 *
 * @return	True if a match is found, false otherwise.
 */
function fileContainsString(file, pattern) {
	fs.readFile(file, (err, data) => {
		if (err) throw err;
		if (!(pattern instanceof RegExp))
			pattern = new RegExp(rescape(pattern));
		return pattern.test(data);
	});
}

gulp.task('copyStaticResourceFiles', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest(paths.distsDir));
});

gulp.task('copyStaticResources', gulp.series('copyStaticResourceFiles', function(done) {
	// Adds a source mapping URL to the jquery lib if it's not already there.
	var jQueryMinFile = path.join(paths.distsDir, 'jquery.min.js');
	if (!fileContainsString(jQueryMinFile, 'sourceMappingURL=')) {
		log(colors.yellow("Adding sourceMappingURL to "+ jQueryMinFile));
		fs.appendFile(jQueryMinFile, '\n//# sourceMappingURL=jquery.min.map\n', function(err) {
      done(err);
    });
	} else
    done();
}));

function bundle(watch) {
	var browserified = browserify({
		basedir: '.',
		debug: true,
		//hasExports: true, // this causes the module to define a require() function for accessing exported objects
		standalone: 'arjs',	// The module defines a global var with this name when loaded
		entries: ['src/main/typescript/main.ts'],
		cache: {},
		packageCache: {}
	}).plugin(tsify);

	var rv = function() {
		return browserified
/*
			.transform('babelify', {
				presets: ['es2015'],
				extensions: ['.ts']
			})
//*/
			.bundle()
			.on('error', function(err) {
				if (err.fileName) {
					// regular error
					log(
						colors.red(err.name)
						+': '+ colors.yellow(err.fileName.replace('src/main/', ''))
						+'['
						+colors.magenta(err.lineNumber || err.line) +':'+ colors.magenta(err.columnNumber || err.column)
						+']: '+ colors.blue((err.description || err.message).replace(new RegExp(rescape(err.fileName) + "\\([0-9,]+\\):\\s*"), ''))
					)
				} else {
					// browserify error..
					log(colors.red(err.name) +': '+ colors.yellow(err.message))
				}

				this.emit('end');
			})
			.pipe(source('arjs.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			//.pipe(uglify())
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(paths.distsDir));
	};

	if (watch) {
		browserified = watchify(browserified);
		browserified.on("update", rv);
		browserified.on("log", log);
	}

	return rv;
}

gulp.task('bundle', bundle(false));

gulp.task("typedoc", gulp.series('bundle', function() {
	let tsconfig = require("./tsconfig.json");

	let config = tsconfig.compilerOptions;
	let m = {
		name: "arjs - Alternate Reality for the web",

		out: paths.docsDir +"/typedoc",
		//json: "output/to/file.json",

		includeDeclarations: true,
		excludeExternals: true,
		ignoreCompilerErrors: false,

		//readme: "README.md",

		//version: true,
		//theme: "/path/to/my/theme",
		//plugins: ["my", "plugins"],
	};
	for (let p in m) if (m.hasOwnProperty(p))
		config[p] = m[p];

	return gulp
		.src(tsconfig.files)
		.pipe(typedoc(config))
		.on('error', function(err) {
			this.emit('end');
		});
}));

gulp.task('build', gulp.series('copyStaticResources', 'bundle', 'typedoc'));

gulp.task('default', gulp.series('build'));

/*
gulp.task("watchHelper", gulp.series("build", function() {
	process.stdout.write("\n---\n\n");
}));

gulp.task("watch", function() {
	gulp.watch([ "src/**
/*.*", "tsconfig.json" ], ['watchHelper']);
});
*/

gulp.task("watch", function(done) {
	gulp.watch([ "src/**/*.*", "tsconfig.json" ], gulp.series("build", function(done) {
    process.stdout.write("\n---\n\n");
    done();
  }));
  done();
});
