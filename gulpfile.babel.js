import gulp from "gulp"; // plugin 설치 및 가져오기
import gpug from "gulp-pug";
import del from "delete";
import ws from "gulp-webserver";
import image from "gulp-image";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer"; // 구형 브라우저 호환
import miniCSS from "gulp-csso"; // css 압축
import bro from "gulp-bro"; //  browserify의 신 버전(import, export와 같은 문법은 브라우저가 해석할 수 없기에 해석할 수 있도록 도와줌)
import babelify from "babelify"; // babel 사용

const routes = {
  pug: {
    watch: "src/**/*.pug", // src 폴더 안에 모든 파일을 지켜봄
    src: "src/*.pug", // 해당 경로의 png로 끝나는 파일들(/**/은 폴더 내부까지 포함한단 의미)
    dest: "build", // 뿌려줄 경로(폴더, 목적지)
  },
  img: {
    src: "src/img/*", // src/img 안의 모든 파일(확장자 지정 ex- src/img/*.png)
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

const pug = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build"]); // 시리즈 추가, 괄호 안에 확장자나 폴더 이름 적어주기

// 웹 서버 설정
const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true })); // 서버에서 보여주고 싶은 폴더 지정

const sass = gulpSass(dartSass);

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError)) // scss용 에러 설정
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"], // 구형 브라우저 호환 버전 설정
      })
    )
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }), // 원하는 프리셋 추가
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.src, js);
};

const img = () =>
  gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest));

const prepare = gulp.series([clean, img]); // dev 준비 과정에서 발생
// *ERR_REQUIRE_ESM 오류 발생시
// gulp-image 6.2.1버전으로 낮춰주면 됨
// -> npm install gulp-image@6.2.1 --save-dev

const assets = gulp.series([pug, styles, js]);

const live = gulp.parallel([webserver, watch]); // 두가지 task를 병행할땐 parallel()로 사용

export const dev = gulp.series([prepare, assets, live]); // task들의 seires
// export는 package.json에서 쓸 명령어에만 사용하면 됨
// export X -> console이나 package.json에서 사용하지 못함
