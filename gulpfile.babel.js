// 걸프로 만드는 프론트엔드 워크플로우, 짱 좋음.

import gulp from "gulp";
import gpug from "gulp-pug"; // 이 모듈의 기능은 파이프에 연결되어 퍼그 파일을 HTML파일로서 변환시키는 것이다.
import del from "del"; // 파일이나 폴더를 지우는 용도이다.
import ws from "gulp-webserver"; // 이 모듈은 걸프를 이용하여 웹서버를 구현하는 것이다. 실제로 루트 디렉토리로 지정한 경로의 index.html파일이 홈페이지로 표시된다.
import gimage from "gulp-image"; // 홈페이지에서 사용할 이미지 파일들의 크기를 최적화한다.
import gulpSass from "gulp-sass";
// 위는 태스크 내부에서 scss파일을을 css파일로 컴파일 하기 위해 사용된다. 또한, 컴파일러에 로드시킬 node-sass 모듈이 필요.
import autoprefixer from "gulp-autoprefixer"; // css코드를 더 다른 브라우져에서도 사용이 가능하도록 컴파일 해준다.
import csso from "gulp-csso"; // 이 모듈은 css의 빈칸, 빈줄을 없애서 css가 더 빨리 로드될수 있도록 돕는다.

//아래의 두 모듈은 서로 연계가 있다. bro는 자바스크립트를 브라우져에서도 사용할수 있게 하지만, 우리는 require가 아닌 import
// 즉 최신 자바스크립트를 사용하고 싶기 때문에 바벨을 연결해줄 필요가 있다. 따라서 파이프에 gulp-bro를 연결하고
//그 변환 옵션으로서 babelify를 설정해줄 필요가 있다. 참고로 밑의 어글리어글리파이? 이 새끼는 따로 임포트할 필요는 없다.
// 이 세가지 모듈을 사용하는 이유는 우리의 브라우져는 자바스크립트의 모듈 시스템을 이해하지 못한다. 따라서 변환을 해줘야 한다.
import bro from "gulp-bro";
import babelify from "babelify";
import uglifyify from "uglifyify";

//마지막으로 걸프를 이용해 깃허브의 gh-page에 배포하는 것이 가능하다. 놀랍다...
import ghPages from "gulp-gh-pages";

gulpSass.compiler = require("node-sass");
// 위 코드는 최신식 자바스크립트로 바꿀수 없다. 정해져 있는 부분이니, 이렇게 사용해야 한다.
// node-sass를 gulpsass의 컴파일러에 연결시키는 작업이다.

//모든 태스크는 함수로서 작동해야한다.

//경로를 만들때는 잘 생각해야 한다. 무슨 이야기냐면, 모든 파일들을 컴파일하여 하나의 파잃에 넣을것인지, 파일들을 그대로 옮길것인지.
// 목적에 맞게 경로를 설정해야 한다.
const routes = {
  pug: {
    src: "src/*.pug", // src 파일의 index.pug 파일을 가리킴.
    dest: "build",
    watch: "src/**/*.pug", // src파일의 내부에 있는 모든 디렉토리의 pug파일을 가리팀.
  },
  image: {
    src: "src/img/*",
    dest: "build/img",
  },
  css: {
    src: "src/scss/style.scss",
    dest: "build/css",
    watch: "src/scss/**/*.scss",
  },
  js: {
    src: "src/js/main.js",
    dest: "build/js",
    watch: "src/js/**/*.js",
  },
};

const pugi = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

//아래의 태스크 후보는 배열안에 옵션으로 지정된 폴더를 지우는 모듈이다.
const clean = () => del(["build/", ".publish/"]);

const webServer = () => {
  return gulp.src("build").pipe(
    ws({
      livereload: true, // 파일을 저장하면 서버를 새로고침 해주는 것.
      open: true,
    })
  );
}; // 이 태스크를 실행시킴으로서 우리는 http://localhost:8000 번의 웹 서버를 가지게 되며, src()로 지정한 build 폴더에 있는 파일이 기본 페이지로서 작동한다. 허나, 퍼그 파일을 수정해도 그 수정된 사항은 지금 페이지에 반영이 되질 않는다. 그 이유는 퍼그파일을 html파일로 전환하는 태스크는 이미 종료했기 때문이다. 따라서 우리는 감시 기능을 구현할 필요가 있다.

const watch = () => {
  // watch API의 기능은 지정된 디렉토리를 감시하고, 무언가 변경점이 발생하면 그 다음 옵션에 설정된 태스크를 실행하는 것이다.
  gulp.watch(routes.pug.watch, pugi);
  gulp.watch(routes.image.src, image);
  gulp.watch(routes.css.watch, style);
  gulp.watch(routes.js.watch, js);
};
const image = () =>
  gulp.src(routes.image.src).pipe(gimage()).pipe(gulp.dest(routes.image.dest));

const style = () =>
  gulp
    .src(routes.css.src)
    .pipe(gulpSass().on("error", gulpSass.logError)) // 옆의 코드는 공홈에 나와있는 그대로 사용해야 한다.
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(gulp.dest(routes.css.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({
            presets: ["@babel/preset-env"], // 이 부분에는 우리가 이미 babel.config.json에서 설정한 프리셋 설정을 적어야 한다
          }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const upload = () => gulp.src("build/**/*").pipe(ghPages());

const prepare = gulp.series([clean, image, style, js]);
// 이 태스크 후보는 먼저 파일들을 지우고, 이미지 파일을 옵티마이즈 한다음, css파일을 컴파일링 한다.

const assets = gulp.series([pugi]); // 이 태스크 후보는 퍼그 파일을 HTML파일로 컴파일링 한다.

const live = gulp.series([webServer, watch]); // 웹서버를 실행하고 감시를 실행한다.
//왜인지는 모르겠지만 series()가 작동하지 않기 떼문에 parallel을 사용하였다.
//했지만 원인은 pipe()를 사용하는 코드들에 return을 부여하니 잘 작동되기 시작했다....흠....

export const build = gulp.series([prepare, assets]); // 이 태스크는 소스로부터 파일을 만들고, 수정하고, 컴파일한다.

export const dev = gulp.series([build, live]); //이 태스크는 파일을 만들고, 수정하고, 컴파일하고, 서버에 올려서, 감시

export const deploy = gulp.series([build, upload, clean]);
// 이 태스크는 파일을 만들고, 수정, 컴파일후, 배포를 한다. 그리고 배포가 완료 된후, 폴더들을 지운다.

// export const test = gulp.series([style]);
//사용하려는 태스크는 반드시 export 정의를 해야 한다. 그 이유는 무엇인가?
//실제로 yarn gulp --task 를 쳐보면, 사용할수 있는 테스크가 표시된다. 이유가 뭘까? export를 지정하는 것에 무슨 의미가??
//공홈에 보면 어쨌든, exporting을 통한 태스크의 실행을 강조하고 있다. 또한 두가지의 컨셉 public과 private 가 있는데
//한마디로 정의하면 태스크의 캡슐화와 관계가 되어 있는 것 같다.
//public, 즉 export 정의가 되어 있는 함수로 된 단독실행이 가능한 태스크이다. 이것들은 gulp명령어로 단독 실행이 가능하다.
//만약 여러개의 태스크를 묶음으로서 실행하려 한다면? 물론 그 묶음안에서만 실행이 가능하도록 할수도 있다.
//쉽게 이야기 하면, 태스크를 정의하고 export정의를 하지 않는다면 그 태스크를 실행할 방법은 오직, series로 묶어서 실행시키는 방법 뿐이다.
//물론 이 경우, 그 실행 주체가 되는 태스크는 export가 되어 있어야 할 것이다.
// 저 위의 pug함수는 실로 여러가지의 태스크가 들어 있지만, export정의가 되어 있지 않기 때문에 단독으로 실행은 불가능 하다.
// 명심하자. 태스크를 만드는 것 -> 파일을 처리 하고 싶다면 먼저 gulp.src()를 이용하여 원본경로를 지정한 뒤, pipe() 를 꼽아서 플러그인을 사용하던지, 무언가의 처리를 해 준뒤, 반드시 gulp.dest()최종 도착경로를 지정해야 한다는 것.
// 기본 gulp.task명령어 대신 export를 사용함으로서 태스크를 다룰수 있다.
