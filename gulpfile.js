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
var doiuse = require('doiuse');
const gutil = require("gulp-util");
const stylelint = require("stylelint");
var postcssReporter = require('postcss-reporter');
var syntax_scss = require('postcss-scss');
var gulpIgnore = require('gulp-ignore');

/* to enable prod mode type 'gulp SOME-TASK --production' */
var isProd = argv.production;

/*
 * See docs https://github.com/ai/browserslist
 * See exact browser list at http://browserl.ist
 */
const SUPPORTED_BROWSERS = '> 1%, last 2 versions, ie >= 8';

var postcssPlugins = [
    autoprefixer({browsers: SUPPORTED_BROWSERS}),
    doiuse({
        browsers: SUPPORTED_BROWSERS,
        ignore: ['flexbox'], // an optional array of features to ignore
        onFeatureUsage: function (usageInfo) {
            // gutil.log(gutil.colors.yellow('Incompatible CSS: ') + usageInfo.message)
        }
    }),
    postcssReporter(postcssReporterOptions),
];

if (isProd) {
    postcssPlugins.push(cssnano());
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

var postcssReporterOptions = {clearAllMessages: true};

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
        .pipe(postcss([stylelint(), postcssReporter(postcssReporterOptions)], {syntax: syntax_scss}))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', notifyError))
        .pipe(postcss(postcssPlugins).on('error', gutil.log))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream())
        // .pipe(gulpIgnore.exclude('*.css.map'))
        // .pipe(notify(notifyFileProcessedOptions))
});

gulp.task('build-html', function() {
    // ignore partials like _*.njk
    return gulp.src([TEMPLATES_DIR + '/**/*.njk', '!' + TEMPLATES_DIR + '/**/_*.njk'])
        .pipe(processNunjucks().on('error', notifyError))
});


gulp.task('browsersync', function() {
    /* see https://webref.ru/dev/automate-with-gulp/live-reloading */
    browserSync.init({
      server: "./dist",
      open: false,
    });
});

gulp.task('build', function(callback) {
    runSequence('clean-dist-dir', ['build-css', 'build-html'], callback)
});

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

/* Just notify */
gulp.task('notify-all-done', function() {
    // fake gulp.src. it's needed only to use notify in pipe below
    return gulp.src(__dirname, {read: false})
        .pipe(notify({title: 'All is ready', message: 'Go to http://127.0.0.1:3000/html/ and test it!', sound: false}));
});

gulp.task('serve', function () {
    runSequence(['browsersync', 'watch'], 'notify-all-done')
});
gulp.task('default', ['serve']);
