/*global module:false*/
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Simple config to re-run `grunt` any time a file is added, changed or deleted
    watch: {
      files: ['Gruntfile.js', 'package.json', 'src/**/*.js', 'test/**/*.js'],
      tasks: ['default']
    },

    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
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

    jasmine: {
      src: '*.js',
      specs: 'spec/**/*Spec.js',
      timeout: 10000,
      junit: {
        output: 'junit/'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task
  grunt.registerTask('default', ['jshint', 'jasmine', 'watch']);

  // Travis-CI task
  grunt.registerTask('travis', ['jshint']);
};