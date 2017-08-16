var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var path = require('path');
var browserSync = require('browser-sync').create();
var notify = require("gulp-notify");
var lazypipe = require("lazypipe");
var runSequence = require('run-sequence');
var nunjucksRender = require('gulp-nunjucks-render');
var faker = require('faker');
var clean = require('gulp-clean');
var cssnano = require('cssnano');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

/* to enable prod mode type 'gulp SOME-TASK --production' */
var isProd = argv.production;

var postCssPlugins = [
    autoprefixer({browsers: 'last 10 versions'}),
];

if (isProd) {
    postCssPlugins.push(cssnano());
}

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

var TEMPLATES_DIR = 'src/templates';
var nunjucksOptions = {
    path: TEMPLATES_DIR,
    data: {
        f: faker,
        randint: (min,max) => {
        	var range = max - min;
        	var rand = Math.floor(Math.random() * (range + 1));
        	return min + rand;
        }
    }
};
nunjucksRender.nunjucks.installJinjaCompat();

/* reusable pipe. note that we all pipes are functions that return, e.g. gulp.dest() */
var processNunjucks = lazypipe()
    .pipe(() => nunjucksRender(nunjucksOptions))
    .pipe(() => gulp.dest('dist/html')) // or .pipe(gulp.dest, 'dist/html')
    .pipe(() => browserSync.reload({stream: true}));

gulp.task('clean-dist-dir', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('build-css', function(){
    gulp.src('src/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', notifyError))
        .pipe(postcss(postCssPlugins))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(notify(notifyFileProcessedOptions))
        .pipe(browserSync.stream())
});

gulp.task('_build-html', function() {
    // ignore partials like _*.njk
    return gulp.src([TEMPLATES_DIR + '/**/*.njk', '!' + TEMPLATES_DIR + '/**/_*.njk'])
        .pipe(processNunjucks().on('error', notifyError))
});

/* Just notify after all HTML processed */
gulp.task('build-html', ['_build-html'], function() {
    // fake gulp.src. it's needed only to use notify in pipe below
    return gulp.src(__dirname, {read: false})
        .pipe(notify('All HTML processed'));
});

gulp.task('browsersync', function() {
    /* see https://webref.ru/dev/automate-with-gulp/live-reloading */
    browserSync.init({
      server: "./",
      open: false,
    });
});

gulp.task('build', runSequence('clean-dist-dir', ['build-css', 'build-html']));

gulp.task('watch', ['build'], function() {
    gulp.watch('src/scss/*.scss', ['build-css']);
    // watch template files (excluding partials _*.njk)
    watch([TEMPLATES_DIR + '/**/*.njk', '!' + TEMPLATES_DIR + '/**/_*.njk'], function (file) {
        gulp.src(TEMPLATES_DIR + '/' + file.relative)
            .pipe(processNunjucks().on('error', notifyError))
            .pipe(notify(notifyFileProcessedOptions))
    });
    // when some partial is changed, recompile ALL HTML
    gulp.watch(TEMPLATES_DIR + '/**/_*.njk', ['build-html']);
});

gulp.task('serve', ['browsersync', 'watch']);
gulp.task('default', ['serve']);
