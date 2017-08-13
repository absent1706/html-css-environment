/* test module that duplicates code of gulp-nunjucks-render */
const through = require("through2");
const nunjucks = require('nunjucks');
const gutil = require("gulp-util");

module.exports = function(templatesDir) {

    var nj = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatesDir, {noCache: true}));

    return through.obj(function (file, enc, callback) {
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
    });
};