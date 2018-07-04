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
	return gulp.src('client/styles/*.sass')
		.pipe(!config.production ? sourcemaps.init({
			loadMaps: true
		}) : minifyCSS())
		.pipe(sass())
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('public/css'))
});

gulp.task('babel', function () {
	return gulp.src('client/javascript/*.js')
		.pipe(!config.production ? sourcemaps.init({
			loadMaps: true
		}) : uglify())
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('public/js'))
});

gulp.task('concat', function () {
	return gulp.src([
			'node_modules/react/umd/react.production.min.js',
			'node_modules/react-dom/umd/react-dom.production.min.js',
			'node_modules/jquery/dist/jquery.min.js'
		])
		.pipe(!config.production ? sourcemaps.init({
			loadMaps: true
		}) : uglify())
		.pipe(concat('core.js'))
		.pipe(sourcemaps.write(''))
		.pipe(gulp.dest('public/js'))
});

gulp.task('watch', function () {
	gulp.watch('client/javascript/*.js', ['babel']);
	gulp.watch('client/styles/*.sass', ['sass']);
});

gulp.task('default', function (callback) {
	runSequence(
		'clean',
		'concat',
		'sass',
		'babel',
		'watch',
		callback);
});
