
Package.describe({
    summary: 'Cubesat: framework for Meteor in coffeescript.',
    version: '0.4.104',
    git: 'https://github.com/i4han/cubesat.git',
    documentation: 'README.md'
});

Package.on_use( function (api) {
    var lang = 'coffee'
    lang === 'coffee' && api.use('coffeescript@1.0.6')
    api.use('ecmascript@0.1.6')
    api.use('jquery@1.0.1')
    api.use('iron:router@1.1.1')
    api.use('isaac:underscore2@0.4.14')
    api.use('isaac:jquery-x@0.0.5')
    api.use('isaac:style-query@0.0.3')
    api.add_files( 'es6/settings.js',           ['client', 'server'] )
    //api.add_files( lang + '/cubesat.'  + lang,  ['client', 'server'] )
    api.add_files( lang + '/route.'    + lang,   'server'  )
    // api.add_files( lang + '/cube.'     + lang,  ['client', 'server'] )
    api.add_files( 'es6/cube.js',    ['client', 'server'])
    api.add_files( 'es6/cubesat.js', ['client', 'server'])
    api.add_files( 'es6/material.js', 'client' )
    api.export( '__',       ['client', 'server'] )
    api.export( 'db',       ['client', 'server'] )
    api.export( 'cube',     ['client', 'server'] )
    api.export( 'Sat',      ['client', 'server'] )
    api.export( 'Settings', ['client', 'server'] )
    api.export( 'Parts',    ['client', 'server'] )
    api.export( 'Modules',  ['client', 'server'] )
    api.export( 'exports',  ['client', 'server'] )
})
