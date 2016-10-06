notify = require("gulp-notify")
util = require 'gulp-util'
module.exports = (error) ->
	
	# util.log error.toString()
	# util.log error
 
	#  'toString',
	# 'code',
	# 'filename',
	# 'name',
	# 'message',
	# 'stack',
	# 'showStack',
	# 'showProperties',
	# 'plugin' 
	

	if error.filename
		file_name = error.filename.replace(/^.*[\\\/]/, '')
	else
		file_name = error.name
	
	console.log ""
	util.log util.colors.red "[Error]"
	util.log "[#{error.plugin}]" + " in file: " + util.colors.cyan( file_name )
	util.log error.stack
	

	# Send error to notification center with gulp-notify
	notify.onError(
		title: "Error: #{file_name}"
		message: "<%= error.message %>"
	).apply this, arguments
	
	console.log ""
	# Keep gulp from hanging on this task
	@emit "end"
	return
