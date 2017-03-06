
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var tsify = require('tsify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var gutil = require("gulp-util");
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
		'src/main/html/**/*.html',
		'src/main/html/**/*.css',
		'src/main/resources/**'
	]
};

//var tsProject = ts.createProject("tsconfig.json");

gulp.task('pre-test', function () {
/*
  return gulp.src(['src/main/ * * / *.ts'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
*/
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['src/test/typescript/**/*.ts'])
    .pipe(mocha({
		//globals: ['console']
		compilers: "ts:ts-node/register,tsx:ts-node/register"
	}))
    // Creating the reports after tests ran
//    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
//    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('copyStaticResources', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest(paths.distsDir));
});

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
				let c = gutil.colors;
				//let c = chalk;
				if (err.fileName) {
					// regular error
					gutil.log(
						c.red(err.name)
						+': '+ c.yellow(err.fileName.replace('src/main/', ''))
						+'['
						+c.magenta(err.lineNumber || err.line) +':'+ c.magenta(err.columnNumber || err.column)
						+']: '+ c.blue((err.description || err.message).replace(new RegExp(rescape(err.fileName) + "\\([0-9,]+\\):\\s*"), ''))
					)
				} else {
					// browserify error..
					gutil.log(c.red(err.name) +': '+ c.yellow(err.message))
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
		browserified.on("log", gutil.log);
	}

	return rv;
}

gulp.task('bundle', bundle(false));

gulp.task('build', ['copyStaticResources', 'bundle', 'typedoc']);

gulp.task('default', ['build']);

gulp.task("watchHelper", ["build"], function() {
	process.stdout.write("\n---\n\n");
});

gulp.task("watch", function() {
	gulp.watch([ "src/**/*.*", "tsconfig.json" ], ['watchHelper']);
});

gulp.task("typedoc", ['bundle'], function() {
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
});