module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  grunt.initConfig
    # watch files
    watch:
      all:
        files: ['yass.js']
        tasks: ['uglify']

    # uglify
    uglify:
      main:
        files:
          'yass.min.js': ['yass.js']

  # task
  grunt.registerTask('default', ['watch'])