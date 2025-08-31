const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const imagemin = require("gulp-imagemin");

// Скрипты
function scripts() {
  return src([
    "node_modules/jquery/dist/jquery.js", // ✅ исправлено
    "app/js/main.js",
  ])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

// Стили
function styles() {
  return src("app/scss/style.scss")
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        cascade: false,
      })
    )
    .pipe(concat("style.min.css"))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

// Картинки
function images() {
  return src("app/images/**/*.*").pipe(
    imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo({
        plugins: [
          {
            name: "removeViewBox",
            active: true,
          },
          {
            name: "cleanupIDs",
            active: false,
          },
        ],
      }),
    ])
  );
}

// Слежка
function watching() {
  watch(["app/scss/style.scss"], styles);
  watch(["app/js/main.js"], scripts);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

// Сервер
function brousersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}

// Очистка
function cleanDist() {
  return src("dist").pipe(clean());
}

// Сборка
function building() {
  return src(["app/css/style.min.css", "app/js/main.min.js", "app/**/*.html"], {
    base: "app",
  }).pipe(dest("dist"));
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.brousersync = brousersync;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, brousersync, watching);
