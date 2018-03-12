const fs = require('graceful-fs');
const gulp = require('gulp');
const cheerio = require('cheerio');
const pug = require('pug');

const sass = require('gulp-sass');
const gpug = require('gulp-pug');

const concat = require('gulp-concat');
const cheerioGulp = require('gulp-cheerio');
const through = require('gulp-through');

const browserSync = require('browser-sync').create();
const SGManager = require('./system/system');
const sg = new SGManager({
  root: __dirname,
});



const settings = require('./settings.json');



const errorHandler = function (name) {
  return function (err) {
    console.error('########### ERROR ' + name.toUpperCase() + ' ############');
    // err.showStack = true;
    err.showProperties = true;
    console.error(err.toString());
    console.error('########### ERROR ' + name.toUpperCase() + ' ############');
    this.emit('end')
  };
};

gulp.task('sass', function () {
  return gulp.src(settings.paths.sass.files)
    .pipe(sass())
    .on('error', errorHandler('sass'))
    .pipe(gulp.dest(settings.paths.sass.dest))
    .pipe(browserSync.stream());
});

gulp.task('pug', function () {
  var indexes = [];


  return gulp.src(settings.paths.pug.files)
    .pipe(gpug({
      basedir: __dirname + '/components',
    }))
    .on('error', errorHandler('pug'))
    .pipe(through('rewite', function (file, config) {
      const template = sg.getTemplate('component');
      const rendered = pug.render(template.content, {
        title: 'Component - item-a',
        scripts: ['hallo/shdsff.js'],
        styles: ['hallo/shdsff.css'],
        body: file.contents.toString(),
        filename: './system/' + template.filename,
      });
      indexes.push(file.path);
      file.contents = new Buffer(rendered);
      /*
      const categories = file.relative.split('/');
      const name = categories.pop().split('.')[0];
      const script = file.base + categories.join('/') + '/' + name + '.js';
      const style = file.base + categories.join('/') + '/' + name + '.sass';
      const item = $('.' + name);

      if (fs.existsSync(script)) {
        const data = eval(fs.readFileSync(script).toString());
        const buffer = [];

        for (const index in data) {
          buffer.push('<div id="' + name + '___' + index + '">');
          buffer.push(file.contents.toString());
          buffer.push('</div>');
        }
        item.replaceWith(buffer.join(''));
      }

      done();
      */
    })())
    .pipe(gulp.dest(settings.paths.pug.dest))
    .on('finish', function () {
      console.log(indexes);
    });
});

gulp.task('lib', function () {
  return gulp.src(settings.paths.lib.files)
    .pipe(gulp.dest(settings.paths.lib.dest));
});

gulp.task('build', ['sass', 'pug', 'lib']);

gulp.task('watch', ['sass', 'pug', 'lib'], function () {
  browserSync.init({
    proxy: 'localhost:' + settings.server.port,
  });

  gulp.watch(settings.paths.sass.watch, ['sass']);
  gulp.watch(settings.paths.pug.watch, ['pug']);
  gulp.watch('web/**/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['watch']);
