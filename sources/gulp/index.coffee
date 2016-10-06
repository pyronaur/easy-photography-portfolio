fs 				= require("fs")
onlyScripts 	= require("./util/scriptFilter")
tasks 			= fs.readdirSync("./sources/gulp/tasks/").filter(onlyScripts)

# Auto Production / Development Modes
require "./util/dynamic_production"
require "./config"

tasks.forEach (task) ->
	require "./tasks/" + task
	return





