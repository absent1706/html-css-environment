var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
// var util = require("gulp-util");
const notifier = require('node-notifier');
var path = require('path');
var combiner = require('stream-combiner2');
var connect = require('gulp-connect');

gulp.task('_less', function(){
    var combined = combiner.obj([
        gulp.src('src/less/*.less'),
        less(),
        gulp.dest('dist/css/'),
        connect.reload()
    ]);
    combined.on('error',function(e){
        notifier.notify({
            title: 'Less error',
            message: e.message,
            sound: false,
            time: 2000,
            icon: path.join(__dirname, '.dev', 'error.png'),
        })
    });
    return combined;
});

gulp.task('less', [ '_less' ], function () {
    notifier.notify({
        title: 'Less compiled',
        "message": "less compiled successfully!",
        "sound": false,
        time: 1000,
        icon: path.join(__dirname, '.dev', 'success.png'),
    });
});

gulp.task('livereload', function() {
    var paths = ['src/less/*.less', '*.html'];
    gulp.src(paths)
        .pipe(watch(paths))
        .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('src/less/*.less', ['less']);
});

gulp.task('connect', function() {
  connect.server({
    root: '.',
    livereload: true,
    port: 8888
  });
});

gulp.task('default', [ 'less', 'connect', 'watch', 'livereload' ]);
