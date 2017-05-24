var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
// var util = require("gulp-util");
const notifier = require('node-notifier');
var path = require('path');
var combiner = require('stream-combiner2');
var browserSync = require('browser-sync').create();
const shell = require('gulp-shell');

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

gulp.task('serve', ['less'], function() {
    /* see https://webref.ru/dev/automate-with-gulp/live-reloading */
    browserSync.init({
      server: {
        baseDir: "./"
      },
      open: true,
    });
    gulp.src('**/*.css').pipe(browserSync.reload({stream: true}));
    
    gulp.watch('src/less/*.less', ['less']);
    gulp.watch('*.*').on("change", (obj) => {
        gulp.src(obj.path)
        .pipe(shell([
            'echo Hey, you changed <%= file.path %>'
        ]))        
    });
    gulp.watch("*.html").on("change", browserSync.reload);
});

// gulp.task('example', () => {
//   return gulp.src('*.html', {read: false})
//     .pipe(shell([
//         'echo <%= file.path %>'
//     ]))
// })

// gulp.task('watch-html', () => {
//     return watch('*.html', function () {
//         gulp.src('css/**/*.css')
//             .pipe(gulp.dest('build'));    
// });

gulp.task('default', [ 'serve' ]);
