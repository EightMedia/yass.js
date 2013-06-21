module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    # meta options
    meta:
      banner: '
/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n
 * <%= pkg.homepage %>\n
 *\n
 * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.author.email %>>;\n
 * Licensed under the <%= _.pluck(pkg.licenses, "type").join(", ") %> license */\n'

    # watch files
    watch:
      all:
        files: ['yass.js']
        tasks: ['uglify']

    # uglify
    uglify:
      options:
        banner: '<%= meta.banner %>'
        report: 'gzip'
        compress:
          dead_code: true
      main:
        files:
          'yass.min.js': ['yass.js']

  # task
  grunt.registerTask('default', ['watch'])