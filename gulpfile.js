const fs = require('graceful-fs');
const gulp = require('gulp');
const cheerio = require('cheerio');

const sass = require('gulp-sass');
const pug = require('gulp-pug');

const concat = require('gulp-concat');
const cheerioGulp = require('gulp-cheerio');
const through = require('gulp-through');

const browserSync = require('browser-sync').create();

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

const paths = {
  sass: {
    watch: 'components/**/*.sass',
    files: ['components/**/*.sass', '!components/**/_*.sass'],
    dest: 'web/src/css',
  },
  pug: {
    watch: 'components/**/*.pug',
    files: ['components/**/*.pug', '!components/**/_*.pug'],
    dest: 'web',
  },
  lib: {
    files: 'lib/**/*.*',
    dest: 'web/src/lib',
  },
};

gulp.task('sass', function () {
  return gulp.src(paths.sass.files)
    .pipe(sass())
    .on('error', errorHandler('sass'))
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(browserSync.stream());
});

gulp.task('pug', function () {
  return gulp.src(paths.pug.files)
    .pipe(pug({
      basedir: __dirname + '/components',
    }))
    .on('error', errorHandler('pug'))
    .pipe(throughs(function (file, config) {
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
    }))
    .pipe(gulp.dest(paths.pug.dest));
});

gulp.task('lib', function () {
  return gulp.src(paths.lib.files)
    .pipe(gulp.dest(paths.lib.dest));
});

gulp.task('build', ['sass', 'pug', 'lib']);

gulp.task('watch', ['sass', 'pug', 'lib'], function () {
  browserSync.init({
    proxy: 'localhost:' + settings.server.port,
  });

  gulp.watch(paths.sass.watch, ['sass']);
  gulp.watch(paths.pug.watch, ['pug']);
  gulp.watch('web/**/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['watch']);
