###
    Dependencies
###
Hooks = require( "wp_hooks" )
Portfolio_Event_Manager = require( './Portfolio_Event_Manager' )

# Portfolio manager will trigger portfolio events when necessary
Portfolio = new Portfolio_Event_Manager()

# Start Portfolio
Hooks.addAction 'pp.core.ready', Portfolio.prepare, 50
Hooks.addAction 'pp.core.loaded', Portfolio.create, 50
