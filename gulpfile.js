"use strict";

let fs = require('fs');
let path = require('path');

let gulp = require('gulp');
let browserify = require('browserify');
let source = require('vinyl-source-stream');
let watchify = require("watchify");
let tsify = require('tsify');
let terser = require('gulp-terser');
let sourcemaps = require('gulp-sourcemaps');
let buffer = require('vinyl-buffer');
let log = require("fancy-log");
let colors = require("ansi-colors");
let rescape = require("escape-string-regexp");
let typedoc = require("gulp-typedoc");
let istanbul = require('gulp-istanbul');
let mocha = require('gulp-mocha');
let jsonMerger = require('json-merger');
let through = require('through2');


let buildDir = path.join(".", "build")
let reportsDirName = "reports";
let testReportDirName = "tests";
let testResultsDirName = "test-results";
let libDirName = "libs";
let distsDirName = "distributions";
let docsDirName = "docs";
let dependencyCacheDirName = "dependency-cache";

let paths = {
	buildDir: process.env.GIS_BUILD_DIR,
	reportsDir: path.join(buildDir, reportsDirName),
	testReportDir: path.join(buildDir, reportsDirName, testReportDirName),
	testResultsDir: path.join(buildDir, testResultsDirName),
	libDir: path.join(buildDir, libDirName),
	distsDir: path.join(buildDir, distsDirName),
	docsDir: path.join(buildDir, docsDirName),
	dependencyCacheDir: path.join(buildDir, dependencyCacheDirName),

	jsonSources: [
		'src/main/json/*.json'
	],

	pages: [
		'src/main/html/**/*.*',
		'src/main/font/AlternateRealityTheDungeon.woff',
		'src/main/resources/**',
		'node_modules/jquery/dist/jquery.min.*',
		'node_modules/jquery/dist/jquery.js'
	]
};

//let tsProject = ts.createProject("tsconfig.json");

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

gulp.task('mergeJson', function() {
	// Process each matched JSON file through json-merger and write to the dest
	return gulp.src(paths.jsonSources)
		.pipe(through.obj(
			function (file, encoding, callback) {
				try {
					let json = jsonMerger.mergeFile(
						file.path,
						{
							"cwd": file.dirname,
							"errorOnFileNotFound": true,
							"errorOnRefNotFound": true
						}
					);

					let newFile = file.clone();
					// Remove the null,2 below to not pretty-print the output JSON...
					newFile.contents = Buffer.from(JSON.stringify(json, null, 2));

					this.push(newFile);
					callback();
				} catch (err) {
					callback(err);
				}
			}
		))
		.pipe(gulp.dest(paths.distsDir));
})

gulp.task('copyStaticResourceFiles', function() {
	return gulp.src(paths.pages).pipe(gulp.dest(paths.distsDir));
});

gulp.task(
		'copyStaticResources',
		gulp.series(
			'copyStaticResourceFiles',
			'mergeJson',
			function(done) {
				// Adds a source mapping URL to the jquery lib if it's not already there.
				let jQueryMinFile = path.join(paths.distsDir, 'jquery.min.js');
				if (!fileContainsString(jQueryMinFile, 'sourceMappingURL=')) {
					log(colors.yellow("Adding sourceMappingURL to "+ jQueryMinFile));
					fs.appendFile(
						jQueryMinFile,
						'\n//# sourceMappingURL=jquery.min.map\n',
						function(err) {
							done(err);
						}
					);
				} else
					done();
			}
		)
);

function bundle(watch) {
	let browserified = browserify({
		basedir: '.',
		debug: true,
		//hasExports: true, // this causes the module to define a require() function for accessing exported objects
		standalone: 'arjs',	// The module defines a global var with this name when loaded
		entries: ['src/main/typescript/main.ts'],
		cache: {},
		packageCache: {}
	}).plugin(tsify);

	let rv = function() {
		return browserified
/*
			// Transpile to different output JS version
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
			// Minify the code
//			.pipe(terser())
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

gulp.task("typedoc", function() {
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
		.src(tsconfig.include)
		.pipe(typedoc(config))
		.on('error', function(err) {
			this.emit('end');
		});
});

gulp.task('build', gulp.series('copyStaticResources', 'bundle', 'typedoc'));

gulp.task('default', gulp.series('build'));

gulp.task("watch", function(done) {
	gulp.watch([ "src/**/*.*", "tsconfig.json" ], gulp.series("build", function(done) {
		process.stdout.write("\n---\n\n");
		done();
	}));
	done();
});
