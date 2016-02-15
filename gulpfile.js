var gulp        = require('gulp'),
	shell       = require('gulp-shell');

//Cmds:
var gitMaster           = 'git checkout master',
	gitMergeSource      = 'git merde source',
	hexoClean           = 'hexo clean',
	hexoDeploy          = 'hexo deploy -g', //生成加部署
	gitSyncRemoteMaster = 'git pull origin master && git push origin master';

gulp.task('publish', shell.task([gitMaster, gitMergeSource, hexoClean, hexoDeploy, gitSyncRemoteMaster]));