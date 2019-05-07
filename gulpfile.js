"use strict";

let gulp = require("gulp"),
    sass = require("gulp-sass"),
    plumber = require("gulp-plumber"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    minify = require("gulp-csso"),
    rename = require("gulp-rename"),
    server = require("browser-sync").create(),
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp"),
    svgstore = require("gulp-svgstore"),
    posthtml = require("gulp-posthtml"),
    include = require("posthtml-include"),
    run = require("run-sequence"),
    del = require("del"),
    jsminify = require("gulp-uglify"),
    sourcemaps = require("gulp-sourcemaps"),
    pug = require('gulp-pug');

gulp.task('pug', function () {
  return gulp.src('source/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest("build/"));
});

gulp.task("style", function() {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("js", function() {
  gulp.src("source/js/**/*.js")
    .pipe(plumber())
    .pipe((sourcemaps.init()))
    .pipe(gulp.dest("build/js"))
    .pipe(jsminify())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/img/**/*.{gif,png,jpg,svg,webp}", ["copy"]);
  gulp.watch("source/img/sprite/icon-*.svg", ["sprite"]);
  gulp.watch("source/sass/**/*.scss", ["style"]);
  // gulp.watch("source/*.html", ["html"]).on("change", server.reload);
  gulp.watch("source/**/*.pug", ["pug"]).on("change", server.reload);
  gulp.watch("source/js/**/*.js", ["js"]);
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{gif,png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img/"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img/webp"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/sprite/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img/sprite"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{ttf,woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", function (done) {
  run(
    "clean",
    "sprite",
    "copy",
    "style",
    "html",
    "js",
    "pug",
    done
  );
});
