# Gulp ready-to-go environment

Features:

 * SASS => CSS compile and watch
 * [`nunjucks`](https://mozilla.github.io/nunjucks/) -> HTML compile and watch
 * sourcemaps
 * live reload (`browsersync`)
 * notifications (gulp-notify)
 * postCSS: 
   + autoprefixer
   + SCSS lint (`stylelint`)
   + warnings about browser CSS support (`doiuse`)
   + css minification with `cssnano` (only in prod mode)

# Installation

```
npm install gulp-cli -g
npm install
```

For developing, type

```
gulp
```

For production build, type

```
gulp build --production
```