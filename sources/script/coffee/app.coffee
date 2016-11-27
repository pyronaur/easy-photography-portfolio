###
    Dependencies
###
Hooks = require( "wp_hooks" )
Core = require( './class/Core' )
Portfolio = require( './class/Portfolio' )


# Keep track of App State
new Core()

# Initialize Portfolio
Hooks.addAction 'pp.core.ready', ( -> new Portfolio() ), 50

# Initialize Masonry Layout
require './masonry'

# Initialize Popup Gallery
require './portfolio/popup'

