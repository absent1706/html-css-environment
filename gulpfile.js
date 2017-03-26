var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
// var util = require("gulp-util");
const notifier = require('node-notifier');
var path = require('path');
var combiner = require('stream-combiner2');
var browserSync = require('browser-sync').create();

gulp.task('_less', function(){
    var combined = combiner.obj([
        gulp.src('src/less/*.less'),
        less(),
        gulp.dest('dist/css/'),
        browserSync.stream({match: '**/*.css'})
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
    gulp.watch("*.html").on("change", browserSync.reload);
    // var paths = ['*.html'];
    // gulp.src(paths)
    //     .pipe(watch(paths))
    //     .pipe(browserSync.reload());
});

gulp.task('watch', function() {
  gulp.watch('src/less/*.less', ['less']);
});

/* see https://webref.ru/dev/automate-with-gulp/live-reloading */
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    port: 3000,
    open: true,
  });
});

gulp.task('default', [ 'less' ]);
gulp.task('serve', [ 'less', 'browserSync', 'watch', 'livereload' ]);
