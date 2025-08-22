'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var minify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

let autoprefixBrowsers = ['> 1%', 'last 2 versions', 'firefox >= 4', 'safari 7', 'safari 8', 'IE 8', 'IE 9', 'IE 10', 'IE 11'];

sass.compiler = require('node-sass');

gulp.task('sass', function () {
    return gulp.src('./sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({ overrideBrowserslist: autoprefixBrowsers }))
        .pipe(minify())
        .pipe(gulp.dest('../public/css'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./sass/*.scss', gulp.series('sass'));
});
