/*global module:false*/
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    lint: {
      files: ['*.js']
    },

    watch: {
      files: ['<config:jasmine.specs>', '*js'],
      tasks: 'jasmine'
    },

    jshint: {
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
        onecase: true,
        quotmark: 'single',
        regexp: true,
        strict: true,
        sub: true,
        trailing: true,
        undef: true,
        unused: true,
        white: false
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

  grunt.loadNpmTasks('grunt-jasmine-runner');

  // Default task
  grunt.registerTask('default', 'lint jasmine');

  // Travis-CI task
  grunt.registerTask('travis', 'lint');
};