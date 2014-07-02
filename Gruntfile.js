module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    handlebars: {
      options: {
        namespace: 'Templates'
      },
      all: {
        files: {
          "public/assets/js/templates.js": ["public/templates/**/*.hbs"]
        }
      }
    },
    'http-server': {

      'dev': {

        // the server root directory
        root: 'public/',

        port: 8000,

        host: "127.0.0.1",

        showDir : true,
        autoIndex: true,
        defaultExt: "html",

        // run in parallel with other tasks
        runInBackground: true
      }
    },
    watch: {
      files: ['public/**/*.hbs'],
      tasks: ['handlebars'],
    }

  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.registerTask('default', ['http-server', 'watch']);
};