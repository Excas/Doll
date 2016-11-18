'use strict';

var path = require("path");
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var csscomb = require('gulp-csscomb');
var cssbeautify = require('gulp-cssbeautify');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var notify = require("gulp-notify");
var foreach = require("gulp-foreach");
var sass = require("gulp-sass");
var replace = require('gulp-replace');
var changed = require('gulp-changed');

//错误捕获
var plumber = require('gulp-plumber');

// 设置相关路径
var paths = {
    wxml: 'src/html',
    wxss: 'src/styles',
    js: 'src/scripts',
    img: 'src/images'
};
var dot = '.'

gulp.task('wxml', function() {
    var src = [paths.wxml + '/**/*.html'];
    return gulp.src(src)
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(foreach(function(stream, file) {
            return stream.pipe(rename(file.relative.replace(/\.html/gi, '.wxml')));
        }))
        .pipe(gulp.dest(function(file){
            return '../Bin/pages/' + file.relative.substr(0,file.relative.indexOf(dot));
        }))
        .pipe(notify({
            onLast: true,
            message: "transform wxml success!"
        }));
});

gulp.task('wxjs', function() {
    var src = [paths.js + '/**/*.js'];
    return gulp.src(src)
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(gulp.dest(function(file){
            return '../Bin/pages/' + file.relative.substr(0,file.relative.indexOf(dot));
        }))
        .pipe(notify({
            onLast: true,
            message: "transform wxjs success!"
        }))
});

gulp.task('wxss', function() {
    var src = [paths.wxss + '/**/*!(_).scss'];
    return gulp.src(src)
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(path.extname(file.relative) == '.less' ? less() : sass().on('error', sass.logError));
        }))
        .pipe(csscomb())
        .pipe(minifycss({
            aggressiveMerging: false,
            advanced: false,
            compatibility: 'ie7',
            keepBreaks: true
        }))
        .pipe(cssbeautify({
            autosemicolon: true
        }))
        .pipe(foreach(function(stream, file) {
            return stream.pipe(rename(file.relative.replace(/\.css/gi, '.wxss')));
        }))
        .pipe(gulp.dest(function(file){
            return '../Bin/pages/' + file.relative.substr(0,file.relative.indexOf(dot));
        }))
        .pipe(notify({
            onLast: true,
            message: "browser reload for css"
        }));
});

gulp.task('watch', function() { //监听文件改变触发相应任务
    gulp.watch([paths.wxml + '/**/*.html'], ['wxml']);
    gulp.watch([paths.js + '/**/*.js'], ['wxjs']);
    gulp.watch([paths.wxss + '/**/*.scss'], ['wxss']);
});

gulp.task('default', ['watch']);


function handleError(err) {
    gutil.beep();
    gutil.log(err.toString());
    notify.onError("Error: <%= error.message %>")(err);
    this.emit('end');
}
