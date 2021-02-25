const { series, parallel, src, dest } = require('gulp')

// 构建浏览器可以运行的环境
const browserify = require("browserify");
// 访问 typescript 编译器的能力， 是 Browserify 的插件，就像 gulp-typescript
const tsify = require("tsify");
// 调整 browserify 输出格式能被 gulp 流式访问
const source = require("vinyl-source-stream");

// 引入 watch 
const watch = require("gulp-watch");

// 压缩 js 使用
const uglify = require("gulp-uglify");
// 生成代码映射
const sourcemaps = require("gulp-sourcemaps");
// 生成 buffer
const buffer = require("vinyl-buffer");

// 观察 js 变化自动更新
const watchify = require("watchify");
// log
const fancy_log = require("fancy-log");

const rename = require("gulp-rename")

// 启动一个 http 服务
const browserSync = require("browser-sync").create()
const reload = browserSync.reload

const config = {
  entries: './src/core/index.ts',
  output_dir: 'lib',
  output_name: 'tinydb.js',
  index_dir: './',
  skin: {
    entry: './src/skin/index.css',
    output_dir: 'lib'
  }
}

// gulp 任务流程
const typescript = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: [config.entries],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
  .transform('babelify', {
    presets: ["es2015"],
    extensions: [".ts"],
  })
)

typescript.on("update", bundle);
typescript.on("log", fancy_log);

function bundle() {
  return typescript
  .bundle()
  .on("error", fancy_log)
  .pipe(source(config.output_name))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write("./"))
  .pipe(dest(config.output_dir))
  .pipe(reload({stream:true}))
}


function build() {
  return src('./lib/tinydb.js')
  .pipe(uglify())
  .pipe(rename({
    suffix:'.min'
  }))
  .pipe(dest('./lib/'))
}

function devServer() {
  browserSync.init({
    server: {
      baseDir: config.index_dir,
      tunnel: true
    }
  })
}

function watch_file() {
  watch('./src/skin/**/*.css', () => {
    css()
    reload()
  })
  watch('./*.html', () => {
    reload()
  })
}

function css() {
  return src(config.skin.entry)
  .pipe(dest(config.skin.output_dir))
  .pipe(reload({stream:true}))
}

exports.default = parallel(bundle, css, devServer, watch_file)
exports.build = series(build)
