###
    Dependencies
###
Hooks = require( "wp_hooks" )
Portfolio = require( './class/Portfolio' )
State_Manager = require( './class/State_Manager' )

# Keep track of App State
App_State = new State_Manager()


# Initialize Portfolio
Hooks.addAction 'pp.loaded', ->
	portfolio = new Portfolio()

# Initialize Masonry Layout
require './masonry'

# Initialize Popup Gallery
require './portfolio/popup'