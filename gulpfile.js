var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
// var util = require("gulp-util");
const notifier = require('node-notifier');
var path = require('path');
var combiner = require('stream-combiner2');
var browserSync = require('browser-sync').create();
const nunjucks = require('nunjucks');
const shell = require('gulp-shell');
var through = require("through2");
var gutil = require("gulp-util");
var notify = require("gulp-notify");
var lazypipe = require("lazypipe");

var notifyFileProcessedOptions = {
    sound: false,
    message: "<%= file.relative %>",
    title: "File processed"
};

var notifyError = notify.onError({
    sound: true,
    message: "<%= error.message %>",
    title: "Compile error"
});

var nj = new nunjucks.Environment(new nunjucks.FileSystemLoader('src/templates', {noCache: true}));
// var processNunjucks = lazypipe()
    // .pipe(function() {
    //     return through.obj(function (file, enc, callback) {
    //         var html = nj.render(file.path);
    //
    //         file.contents = new Buffer(html);
    //         file.path = gutil.replaceExtension(file.path, '.html');
    //         callback(null, file)
    //     });
    // })
    // .pipe(gulp.dest, 'dist/html');

gulp.task('scss', function(){
    gulp.src('src/scss/main.scss')
        .pipe(sass().on('error', notifyError))
        .pipe(gulp.dest('dist/css'))
        .pipe(notify(notifyFileProcessedOptions))
        .pipe(browserSync.stream({match: '**/*.css'}))
});

gulp.task('serve', ['scss'], function() {
    /* see https://webref.ru/dev/automate-with-gulp/live-reloading */
    browserSync.init({
      server: {
        baseDir: "./"
      },
      open: false,
    });
    gulp.src('**/*.css').pipe(browserSync.reload({stream: true}));
    
    gulp.watch('src/scss/*.scss', ['scss']);
    watch('src/templates/**/*.njk', function (file) {
        gulp.src('src/templates/' + file.relative)
            .pipe(through.obj(function (file, enc, callback) {
                // taken from gulp-nunjucks-render
                var self = this;
                try {
                    var data = {};
                    nj.render(file.relative, data, function (err, html) {
                        if (err) {
                            self.emit('error', err);
                            return callback();
                        }
                        file.contents = new Buffer(html);
                        file.path = gutil.replaceExtension(file.path, '.html');

                        self.push(file);
                        callback();
                    });
                } catch (err) {
                    self.emit('error', err);
                    callback();
                }
            }).on('error', notifyError))
            .pipe(gulp.dest('dist/html'))
            .pipe(notify(notifyFileProcessedOptions))
            .pipe(browserSync.reload({stream: true}))
    });
});

gulp.task('default', [ 'serve' ]);
