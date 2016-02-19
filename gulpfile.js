var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var jade          = require('gulp-jade');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jade', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/css/main.scss')
        .pipe(sass({
            includePaths: ['css'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

/**
 *  Jade gulp task
 */
gulp.task('jade', function(){
  gulp.src('_jadefiles/*.jade')
      .pipe(jade())
      .pipe(gulp.dest(''));
  gulp.src('_jadefiles/blog/*.jade')
      .pipe(jade())
      .pipe(gulp.dest('blog'));
  gulp.src('_jadefiles/includes/*.jade')
      .pipe(jade())
      .pipe(gulp.dest('_includes'));
  return gulp.src('_jadefiles/layouts/*.jade')
      .pipe(jade())
      .pipe(gulp.dest('_layouts'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(['assets/css/*.scss'], ['sass']);
    gulp.watch(['_jadefiles/blog/*.jade','_jadefiles/layouts/*.jade','_jadefiles/includes/*.jade','_jadefiles/*.jade'], ['jade']);
    gulp.watch(['_config.yml', '*.html', '_includes/*', '_layouts/*.html', '_posts/*','blog/*.html'], ['jekyll-rebuild']);
});
//
/**
 * Default task, running just `gulp` will compile the sass, jade
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
