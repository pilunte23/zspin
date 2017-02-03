'use strict';

const argv       = require('argv');
const cp         = require('child_process');
const electron   = require('electron-prebuilt');
const fs         = require('fs');
const gulp       = require('gulp');
const gu_concat  = require('gulp-concat');
const gu_dl      = require('gulp-download');
const gu_if      = require('gulp-if');
const gu_install = require('gulp-install');
const gu_jedit   = require("gulp-json-editor");
const gu_lr      = require('gulp-livereload');
const gu_minify  = require('gulp-clean-css');
const gu_rm      = require('gulp-rm');
const gu_sass    = require('gulp-sass');
const gu_tpls    = require('gulp-angular-templatecache');
const gu_uglify  = require('gulp-uglify');
const gu_util    = require('gulp-util');
const gu_zip     = require('gulp-zip');
const packager   = require('electron-packager');
const unzip      = require('unzip');

const pjson      = require('./package.json');

var args = argv.option([
  {name: 'platform', short: 'p', type: 'string', description: 'target platform for build'},
  {name: 'debug', short: 'd', type: 'boolean'},
]).run().options;

var appName = pjson.name;
var appCc = pjson.license;
var appVersion = pjson.version;
var libFile = 'libs-'+appVersion+'.zip';
var libUrl = 'http://zspin.vik.io/libraries/'+libFile;
var platform, electronPlatform, targetArch = null;
var electronVersion = pjson.devDependencies['electron-prebuilt'];
var task = process.argv[2];
var debug = args.debug;
var watch = (task === 'watch');

/*************************** Platform detection ******************************/

// if -p parameter undefined, platform = current platform
// else platform = -p parameter value
// same for architecture
if (args.platform === undefined) {
  electronPlatform = process.platform;
  targetArch = process.arch;
  if (process.platform === 'darwin') {
    platform = process.arch === 'x64' ? 'osx64' : 'osx32';
  } else if (process.platform === 'win32') {
    platform = (process.arch === 'x64' ||
      process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) ? 'win64' : 'win32';
  } else if (process.platform === 'linux') {
    platform = process.arch === 'x64' ? 'linux64' : 'linux32';
  } else {
    throw new gu_util.PluginError('platform_detection', 'Unknown platform, aborting.');
  }
} else {
  platform = args.platform;
  if (platform.slice(-2) === '32') {
    targetArch = 'ia32';
  } else if (platform.slice(-2) === '64') {
    targetArch = 'x64';
  } else if (platform.slice(-3) === 'arm') {
    targetArch = 'armv7l';
  } else {
    throw new gu_util.PluginError('platform_detection', 'Unknown platform, aborting.');
  }
  var tmpP = platform.slice(0, 3);
  if (tmpP === 'win') {
    electronPlatform = 'win32';
  } else if (tmpP === 'lin') {
    electronPlatform = 'linux';
  } else if (tmpP === 'osx') {
    electronPlatform = 'darwin';
  }
}

var releaseBin = appName+'-'+appVersion+'-'+platform+'.zip';
var releaseFolder = 'releases/'+appName+'-'+electronPlatform+'-'+targetArch;

/************************************ Vendors ********************************/

var vendors = {
  'scripts': [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/jswheel/jswheel.js',
    'bower_components/lodash/lodash.js',
    'bower_components/angular/angular.js',
    'bower_components/ng-load/ng-load.js',
    'bower_components/ng-resize/ngresize.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-piwik/dist/angular-piwik.js',
    'bower_components/angular-animate/angular-animate.js',
    // 'bower_components/angular-gamepad/dist/angular-gamepad.js', // Fixme
    'bower_components/angular-hotkeys/build/hotkeys.js',
    'bower_components/angular-translate/angular-translate.js',
    'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
    'bower_components/gsap/src/uncompressed/TweenLite.js',
    'bower_components/gsap/src/uncompressed/plugins/CSSPlugin.js',
    'bower_components/gsap/src/uncompressed/jquery.gsap.js',
    'bower_components/json-formatter/dist/json-formatter.js',
    'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
    'bower_components/jplayer/dist/jplayer/jquery.jplayer.js'
  ],
  'styles': [
    'bower_components/skeleton/css/normalize.css',
    'bower_components/json-formatter/dist/json-formatter.css',
    'bower_components/angular-toastr/dist/angular-toastr.css',
  ],
  'fonts': [

   'app_statics/*.ttf',
  ]
};

gulp.task('vendors:scripts', function() {
  return gulp.src(vendors.scripts)
    .pipe(gu_concat('vendors.js'))
    // .pipe(gu_if(!debug, gu_uglify()))
    .pipe(gulp.dest('build/js'));
});

gulp.task('vendors:styles', function() {
  return gulp.src(vendors.styles)
    .pipe(gu_concat('vendors.css'))
    .pipe(gu_minify())
    .pipe(gulp.dest('build/css'));
});

gulp.task('vendors:fonts', function() {
  return gulp.src(vendors.fonts)
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('vendors', ['vendors:scripts', 'vendors:styles' ,'vendors:fonts']);

/************************************ App ************************************/

//TODO: mirror target folder tree in app_statics & /build

var app = {
  'statics': [
    'app_statics/**/*',
    '!app_statics/package.json',
    '!app_statics/themeframe.js',
    '!app_statics/blank_datafolder.zip',
  ],
  'scripts': [
    'app_sources/**/*.js',
    'app_sources/index.js',
  ],
  'styles': [
    'app_sources/**/*.scss',
  ],
  'flash': [
    'bower_components/jplayer/dist/jplayer/jquery.jplayer.swf',
  ],
  'templates': [
    'app_sources/templates/*.html',
    'app_sources/**/*.html',
  ],
  'assets': [
    'app_statics/blank_datafolder.zip',
  ]
};

gulp.task('app:statics', function() {
  return gulp.src(app.statics)
    .pipe(gulp.dest('build'))
    // .pipe(gu_install())
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('app:packagefile', ['app:statics'], function() {
  // if param -d (debug) update json accordingly
  return gulp.src('app_statics/package.json')
    .pipe(gu_if(debug, gu_jedit(function (json) {
      json.debug = true;
      return json;
    })))
    .pipe(gulp.dest('build'))
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('app:scripts', function() {
  return gulp.src(app.scripts)
    .pipe(gu_concat('app.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('app:styles', function() {
  return gulp.src(app.styles)
    .pipe(gu_sass({
      errLogToConsole: true,
      sourceComments: 'map',
      sourceMap: 'sass'
    }))
    .pipe(gu_concat('app.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('app:flash', function() {
  return gulp.src(app.flash)
    .pipe(gulp.dest('build/swf'))
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('app:assets', function() {
  return gulp.src(app.assets)
    .pipe(gulp.dest('build/assets'))
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('app:templates', function() {
  return gulp.src(app.templates)
    .pipe(gu_tpls({standalone: true}))
    .pipe(gu_concat('app.tpls.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('app', ['app:statics', 'app:assets', 'app:scripts', 'app:styles',
  'app:flash', 'app:templates', 'app:packagefile']);

/******************************* Theme Frame *********************************/

var themeframe = {
  'scripts': [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/jplayer/dist/jplayer/jquery.jplayer.min.js',
    'app_statics/themeframe.js',
  ],
};

gulp.task('themeframe:scripts', function() {
  return gulp.src(themeframe.scripts)
    .pipe(gulp.dest('build/js'))
    .pipe(gu_if(watch, gu_lr()));
});

gulp.task('themeframe', ['themeframe:scripts']);

/******************************** Libraries **********************************/

gulp.task('libraries:download', function() {
  if (fs.existsSync('cache/'+libFile)) {
    return;
  } else {
    return gu_dl(libUrl)
      .pipe(gulp.dest('cache'));
  }
});

gulp.task('libraries:unzip', ['libraries:download'], function() {
  // FIXME
  if (fs.existsSync('libraries/win64')) {
    return;
  } else {
    // gulp-unzip is not ready yet; see:
    // https://github.com/suisho/gulp-unzip/issues/13
    return fs.createReadStream('cache/'+libFile)
      .pipe(unzip.Extract({path: 'libraries'}));
  }
});

gulp.task('libraries:clean', function() {
  return gulp.src('build/plugins/**/*', {read: false})
    .pipe(gu_rm());
});

gulp.task('libraries:flashplayer', ['libraries:unzip', 'libraries:clean'], function() {
  return gulp.src('libraries/'+platform+'/flashplayer/**')
    .pipe(gulp.dest('build/plugins'));
});

// gulp.task('libraries', ['libraries:ffmpeg', 'libraries:flashplayer']);
gulp.task('libraries', ['libraries:flashplayer']);

/********************************** Releases *********************************/

gulp.task('release:check-platform', function() {
  if (platform === undefined) {
    throw new gu_util.PluginError(
      'release',
      'Undefined platform !\nUse -p [win32,win64,osx32,osx64,linux32,linux64,linuxarm]\n'
    );
  }
});

gulp.task('release:package', ['release:check-platform', 'vendors', 'app', 'themeframe'], function(cb) {

  gu_util.log(gu_util.colors.yellow("Releasing Zspin ("+releaseBin+") ..."));
  return packager({
    dir: "build/",
    'app-version': appVersion,
    'app-copyright': appCc,
    'build-version': appVersion,
    name: appName,
    platform: electronPlatform,
    arch: targetArch,
    version: electronVersion,
    icon: 'assets/256.ico',
    out: 'releases/',
    overwrite: true,
    asar: true,
    'version-string': {
      CompanyName: appName,
      FileDescription: appName,
      OriginalFilename: appName,
      ProductName: appName,
      InternalName: appName,
    }
  }, function done(err, appPath) {
    cb(err);
  });
});

gulp.task('release:clean', ['release:package'], function() {
  return gulp.src([
      releaseFolder+'/LICENSE',
      releaseFolder+'/LICENSES.chromium.html',
      releaseFolder+'/version',
      releaseFolder+'/pdf.dll',
      releaseFolder+'/pdf.so',
    ])
    .pipe(gu_rm());
});

gulp.task('release:copy-license', ['release:package', 'release:clean'], function() {
  return gulp.src('LICENSE.txt')
    .pipe(gulp.dest(releaseFolder));
});

// special task because we don't want to put the file in asar package
gulp.task('release:flashlib', ['libraries:unzip', 'libraries:clean', 'release:package'], function() {
  return gulp.src('libraries/'+platform+'/flashplayer/**')
    .pipe(gu_if(electronPlatform == 'darwin', gulp.dest(releaseFolder+'/'+appName+'.app/Contents/Resources/')))
    .pipe(gu_if(electronPlatform != 'darwin', gulp.dest(releaseFolder+'/resources/')));
});

gulp.task('release:zip', ['release:package', 'release:copy-license', 'release:flashlib'], function() {
  return gulp.src(releaseFolder+'/**/*')
    .pipe(gu_zip(releaseBin))
    .pipe(gulp.dest('releases'));
});

gulp.task('release', ['release:zip']);

/*********************************** Watch ***********************************/

gulp.task('watch', ['default'], function() {
  gulp.watch(app.statics, ['app:statics']);
  gulp.watch(app.styles, ['app:styles']);
  gulp.watch(app.scripts, ['app:scripts']);
  gulp.watch(app.templates, ['app:templates']);
  gulp.watch('app_statics/package.json', ['app:packagefile']);
  gulp.watch(themeframe.scripts, ['themeframe:scripts']);
  gu_util.log(gu_util.colors.green("Ready, execute 'make run' in another terminal"));
});

/************************************ Run ************************************/

gulp.task('run', function() {
  gu_util.log(gu_util.colors.green("Running Zspin..."));
  return cp.spawn(electron, ['build', '--debug'], {stdio: 'inherit'});
});

/*********************************** Clean ***********************************/

gulp.task('clean', function() {
  return gulp.src(['bower_components/**/*', 'node_modules/**/*'], {read: false})
    .pipe(gu_rm());
});

gulp.task('fclean', function() {
  return gulp.src(['build/**/*'], {read: false})
    .pipe(gu_rm());
});

/********************************** Default **********************************/

gulp.task('default', ['vendors', 'app', 'themeframe', 'libraries']);

