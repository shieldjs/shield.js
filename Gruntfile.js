/*global module:false*/
module.exports = function(grunt) {
  'use strict';

  var pkg = grunt.file.readJSON('package.json');

  function banner(buildName) {
    return '/*! \n * ' + [
      pkg.name + ' v' + pkg.version + ' - ' + pkg.description,
      pkg.url,
      '',
      'Copyright (c) ' + grunt.template.today('yyyy') + ' ' + pkg.name + ' contributors',
      pkg.licenses + ' Licensed',
      '',
      'Released: ' + grunt.template.today('yyyy-mm-dd'),
      '',
    ].join('\n * ') + '\n' +

    //in /* */ comment due to IE's conditional compilaton comments
    '//@ sourceMappingURL=Shield.' + buildName + '.map\n' +
    ' */\n';
  }

  grunt.initConfig({
    pkg: pkg,

    jshint: {
      files: ['src/**/*.js'],
      options: {
        bitwise: true,
        boss: true,
        browser: true,
        curly: true,
        devel: true,
        eqeqeq: true,
        eqnull: true,
        es5: true,
        immed: true,
        indent: 2,
        latedef: true,
        maxdepth: 9,
        maxerr: 20,
        maxparams: 6,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        quotmark: 'single',
        regexp: true,
        strict: true,
        sub: true,
        trailing: true,
        undef: true,
        unused: true,
        white: false,
        globals: {
          ActiveXObject: false
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },

    lodash: {
      //it'd be nice to see this configurable at some point
      modifier: 'legacy',

      //not sure on the best place to put this.. src/ makes it transparent/clear for a contributor though
      dest: 'lib/lodash.custom.js',
      include: ['isArray', 'isString', 'isFunction', 'each']
    },

    'closure-compiler': (function (map) {
      var baseFiles = [
        'lib/lodash.custom.js',
        'node_modules/extend-function/extendFunction.js',
        'src/Shield.js'
      ];
      var closureHash = {};
      for (var build in map) {
        if (map.hasOwnProperty(build)) {
          closureHash[build] = {
            js: baseFiles.concat(map[build]),
            jsOutputFile: 'dist/' + build + '.min.js',
            maxBuffer: 500,
            options: {
              compilation_level: 'SIMPLE_OPTIMIZATIONS',
              language_in: 'ECMASCRIPT3',
              output_wrapper: banner(build) + '%output%',
              source_map_format: 'V3', // || V1 || V2 || DEFAULT
              create_source_map: 'dist/' + build + '.min.map'
            }
          };
        }
      }
      return closureHash;
    })({
      base: [], //just use base files
      historicalConsole: ['node_modules/historical-console/historicalConsole.js']
    }),

    jasmine: {
      src: '*.js',
      specs: 'spec/**/*Spec.js',
      timeout: 10000,
      junit: {
        output: 'junit/'
      }
    },

    watch: {
      files: ['Gruntfile.js', 'package.json', 'src/**/*.js', 'test/**/*.js'],
      tasks: ['default']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lodashbuilder');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task
  grunt.registerTask('default', ['jshint', 'lodash', 'closure-compiler', 'jasmine', 'watch']);

  // Travis-CI task
  grunt.registerTask('travis', ['jshint']);
};