module.exports = (grunt) => {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			build: {
				src: ['src/jquery-3.1.1.js', 'src/main.js',],
				dest: 'build/bundle.js',
			},
		},
		uglify: {
			build: {
				src: ['build/bundle.js'],
				dest: 'build/bundle.min.js'
			}
		},
		eslint: {
			options: {
				configFile: '.eslintrc.json',
			},
			target: ['app.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-eslint');

	grunt.registerTask('default', ['eslint', 'concat', 'uglify']);
};
