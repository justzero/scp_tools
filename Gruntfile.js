// @fileOverview: Gruntfile.js
// Date: 2013- 7-31
// Time: 16:06
// @description: Gruntfile
// @author: gongbing

/*jshint browser: true, nomen: true, indent: 4, maxlen: 80, strict: true, curly: true */

module.exports = function(grunt) {
    'use strict';

    var conf =  grunt.file.readJSON('./conf.json');

    grunt.initConfig({

        pkg: conf,

        //  监听模块得创建修改删除状态，触发pack任务
        watch: {

            js: {
                files: [
                    '<%= pkg.src %>/**/*.js',
                    '<%= pkg.src %>/**/*.css',
                    '<%= pkg.src %>/**/*.vm'
                ],
                //tasks: ['zspack:locate'],
                options: {
                    nospawn: true,
                    interrupt: true,
                    event: ['added', 'changed'],
                }
            },

        },


        //  上传文件到测试服务器上
        //  相关参数在/conf.json中配置
        scp: {
            options: {
                port: 22,
                host: '<%= pkg.remote.host %>',
                username: '<%= pkg.remote.username %>',
                privateKey: grunt.file.read(conf.remote.privateKeySrc),
                src: '<%= pkg.src %>',
                dest: '<%= pkg.remote.dest %>'
            },
            js: {
                filter: function (filepath) {
                    return filepath.replace(/WEB-INF\/velocity/g, 'scripts');
                }
            },
            css: {
                filter: function (filepath) {
                    return filepath.replace(/WEB-INF\/velocity/g, 'css');
                }
            },
            vm: {
                filter: function (filepath) {
                    return filepath;
                }
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadTasks('./tasks/');

    //  监听文件改变
    //  利用scp任务将文件上传到测试服务器
    grunt.event.on('watch', function(action, filepath, target) {
        if (/\.vm$/g.test(filepath)) {
            grunt.task.run("scp:vm:" + filepath);
        }
        else if (/\.js$/g.test(filepath)) {
            grunt.task.run("scp:js:" + filepath);
        }
        else if (/\.css$/g.test(filepath)) {
            grunt.task.run("scp:css:" + filepath);
        }
    });

    //  启动文件监听文件改变或创建
    //  >> grunt &
    grunt.registerTask('default',['watch']);

};
