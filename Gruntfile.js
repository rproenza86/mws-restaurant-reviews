module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      small: {
        options: {
          engine: 'im',
          sizes: [{
            width: 350,
            suffix: '_small_1x',
            quality: 20
          },
          {
            width: 500,
            suffix: '_small_2x',
            quality: 30
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img_src',
          dest: 'client/images/small'
        }]
      },

      medium: {
        options: {
          engine: 'im',
          sizes: [{
            width: 800,
            suffix: '_medium_1x',
            quality: 40
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img_src',
          dest: 'client/images/medium'
        }]
      },

      large: {
        options: {
          engine: 'im',
          sizes: [{
            width: 1600,
            suffix: '_large_2x',
            quality: 60
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img_src',
          dest: 'client/images/large'
        }]
      }
    },

    cwebp: {
      '30%': {
        options: {
          q: 50
        },
        files: [{
          expand: true,
          cwd: 'img_src/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'client/images/webp/30'
        }]
      },
      '50%': {
        options: {
          q: 50
        },
        files: [{
          expand: true,
          cwd: 'img_src/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'client/images/webp/50'
        }]
      },
      '70%': {
        options: {
          q: 70
        },
        files: [{
          expand: true,
          cwd: 'img_src/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'client/images/webp/70'
        }]
      }
    },

    /* Clear out the images directory if it exists */
    clean: {
      dev: {
        src: ['images'],
      },
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['client/images/opt']
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-cwebp');


  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', ['responsive_images', 'cwebp']);

};
