module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'shield.js']
    },

    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
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
        maxerr: 20
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
    }
  });

  // Default task
  grunt.registerTask('default', 'lint watch');

  // Travis-CI task
  grunt.registerTask('travis', 'lint');
};