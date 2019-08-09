const path = require('path')
const gulp = require('gulp')
const pump = require('pump')
const del = require('del')
const less = require('gulp-less')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript')
const watch = require('gulp-watch')
const browserSync = require("browser-sync").create(),reload=browserSync.reload;


const cleanLibDir = () => {
  return del(['./lib'])
}
const build_css = done => {
  pump([
    gulp.src('./src/skin/Main.less'),
    less(),
    gulp.dest('./lib/skin'),
    reload({ stream: true })
  ],done)
}
/**
 * 
 * @param { string } entry  必须 
 * @param { string } outDir 必须
 * @param { string } moduleName 必须
 */
const rollup_build_task = (entry,outDir,moduleName) => {
  return  rollup.rollup({
    input: entry,
    plugins: [
      rollupTypescript()
    ]
  }).then( bundle => {
    return bundle.write({
      file: outDir,
      format:'es',
      name: moduleName,
      sourcemap: true
    })
  })
}

const build_ts = (done) => {
    rollup_build_task('./src/core/Main.ts','./lib/core/tinydb.js','tinydb'),
    reload({ stream: true })
    done();
}

const build_html = done => {
  pump([
    gulp.src('./*.html'),
    gulp.dest('./lib/core'),
    reload({ stream: true })
  ],done)
}
const watch_css = done => {
  pump([
    gulp.src('./src/skin/**/*.less'),
    reload({ stream: true })
  ],done)
}
const watch_js = done => {
  pump([
    gulp.src('./src/**/*.ts'),
    reload({ stream: true })
  ],done)
}

const browserServer = () => {
  browserSync.init({
    server: {
      baseDir: "./",
      tunnel: true  
    }
  })
  watch('./src/skin/**/*.less',gulp.series(build_css,watch_css))
  watch('./src/**/*.ts',gulp.series(build_ts,watch_js))
  watch('./*.html',gulp.series(build_html))
}
gulp.task('default',gulp.series(cleanLibDir,build_css,build_ts,browserServer))