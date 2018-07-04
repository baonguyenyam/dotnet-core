var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-csso');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var config = {
	production: !!util.env.production
};

gulp.task('clean', function () {
	return gulp.src([
			'public/css',
			'public/js'
		])
		.pipe(clean({
			force: true
		}))
		.pipe(gulp.dest('public'));
});

gulp.task('sass', function () {
	return gulp.src('server/styles/*.sass')
		.pipe(!config.production ? sourcemaps.init({
			loadMaps: true
		}) : minifyCSS())
		.pipe(sass())
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('public/css'))
});

gulp.task('babel', function () {
	return gulp.src('server/javascript/*.js')
		.pipe(!config.production ? sourcemaps.init({
			loadMaps: true
		}) : uglify())
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('public/js'))
});

gulp.task('concat:js', function () {
	return gulp.src([
			// 'node_modules/react/umd/react.production.min.js',
			// 'node_modules/react-dom/umd/react-dom.production.min.js',
			"node_modules/jquery/dist/jquery.js",
			"node_modules/popper.js/dist/umd/popper.js",
			"node_modules/bootstrap/dist/js/bootstrap.js",
		])
		.pipe(!config.production ? sourcemaps.init({
			loadMaps: true
		}) : uglify())
		.pipe(concat('core.js'))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('public/js'))
});
gulp.task('concat:css', function () {
	return gulp.src([
			"node_modules/@fortawesome/fontawesome-free-webfonts/css/fa-solid.css",
			"node_modules/@fortawesome/fontawesome-free-webfonts/css/fa-regular.css",
			"node_modules/@fortawesome/fontawesome-free-webfonts/css/fa-brands.css",
			"node_modules/@fortawesome/fontawesome-free-webfonts/css/fontawesome.css",
		])
		.pipe(!config.production ? sourcemaps.init({
			loadMaps: true
		}) : minifyCSS())
		.pipe(concat('core.css'))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('public/css'))
});

gulp.task('watch', function () {
	gulp.watch('server/javascript/*.js', ['babel']);
	gulp.watch('server/styles/*.sass', ['sass']);
});

gulp.task('default', function (callback) {
	runSequence(
		'clean',
		'concat:js',
		'concat:css',
		'sass',
		'babel',
		'watch',
		callback);
});
