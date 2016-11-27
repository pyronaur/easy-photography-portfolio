###
    Dependencies
###
Hooks = require( "wp_hooks" )
Portfolio_Manager = require( './../class/Portfolio_Manager' )

# Portfolio manager will trigger portfolio events when necessary
Portfolio = new Portfolio_Manager()

# Includes
require './lazy'
require './masonry'
require './popup'



# Start Portfolio
Hooks.addAction 'pp.core.ready', Portfolio.prepare, 50
Hooks.addAction 'pp.core.loaded', Portfolio.create, 50
