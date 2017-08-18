# Modern HTML/CSS coding environment

Use it as a start point for new HTML/CSS projects.

# Features:

 * SASS => CSS compile and watch
 * [nunjucks](https://mozilla.github.io/nunjucks/) -> HTML compile and watch
 * sourcemaps
 * live reload ([browsersync](https://browsersync.io/))
 * notifications (`gulp-notify`)
 * postCSS: 
   + [autoprefixer](https://github.com/postcss/autoprefixer)
   + SCSS [stylelint](https://stylelint.io/)
   + warnings about browser CSS support ([doiuse](https://github.com/anandthakker/doiuse))
   + css minification with [cssnano](http://cssnano.co/) (only in prod mode)

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
