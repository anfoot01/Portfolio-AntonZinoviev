const gulp = require('gulp');

// HTML
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');
const webpHTML = require('gulp-webp-html');

// SASS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const webpCss = require('gulp-webp-css');

const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const changed = require('gulp-changed');

// Images
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');


gulp.task('clean:prod', function (done) {
	if (fs.existsSync('./prod/')) {
		return gulp
			.src('./prod/', { read: false })
			.pipe(clean({ force: true }));
	}
	done();
});

const fileIncludeSetting = {
	prefix: '@@',
	basepath: '@file',
};

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

gulp.task('html:prod', function () {
	return gulp
		.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
		.pipe(changed('./prod/'))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude(fileIncludeSetting))
		.pipe(webpHTML())
		.pipe(htmlclean())
		.pipe(gulp.dest('./prod/'));
});

gulp.task('sass:prod', function () {
	return gulp
		.src('./src/scss/*.scss')
		.pipe(changed('./prod/css/'))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(autoprefixer())
		.pipe(sassGlob())
		.pipe(webpCss())
		.pipe(groupMedia())
		.pipe(sass())
		.pipe(csso())
		.pipe(sourceMaps.write())
		.pipe(gulp.dest('./prod/css/'));
});

gulp.task('images:prod', function () {
	return gulp
		.src('./src/img/**/*')
		.pipe(changed('./prod/img/'))
		.pipe(webp())
		.pipe(gulp.dest('./prod/img/'))
		.pipe(gulp.src('./src/img/**/*'))
		.pipe(changed('./prod/img/'))
		.pipe(imagemin({ verbose: true }))
		.pipe(gulp.dest('./prod/img/'));
});

gulp.task('fonts:prod', function () {
	return gulp
		.src('./src/fonts/**/*')
		.pipe(changed('./prod/fonts/'))
		.pipe(gulp.dest('./prod/fonts/'));
});

gulp.task('files:prod', function () {
	return gulp
		.src('./src/files/**/*')
		.pipe(changed('./prod/files/'))
		.pipe(gulp.dest('./prod/files/'));
});

gulp.task('js:prod', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./prod/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(babel())
		.pipe(webpack(require('../webpack.config.js')))
		.pipe(gulp.dest('./prod/js/'));
});

const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:prod', function () {
	return gulp.src('./prod/').pipe(server(serverOptions));
});
