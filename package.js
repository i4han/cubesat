
Package.describe({
    summary: 'Cubesat: framework for Meteor.',
    "version": "0.6.96",
    git: 'https://github.com/i4han/cubesat.git',
    documentation: 'README.md'
});

Package.on_use( function (api) {
    var lang = 'coffee'
    lang === 'coffee' && api.use('coffeescript@1.2.6')
    api.use('ecmascript@0.6.3')
    api.use('jquery@1.11.10')
    api.use('iron:router@1.1.1')
    api.use('isaac:underscore2@0.5.93')
    // api.use('isaac:incredibles@0.0.19')
    api.use('isaac:jquery-x@0.0.10')
    api.use('isaac:style-query@0.0.14')
    // api.add_files( 'src/settings.js', ['client', 'server'] )
    //api.add_files( lang + '/cubesat.'  + lang,  ['client', 'server'] )
    api.add_files( lang + '/route.'    + lang,   'server'  )
    // api.add_files( lang + '/cube.'     + lang,  ['client', 'server'] )
    api.add_files( 'src/cube.js',     ['client', 'server'])
    api.add_files( 'src/material.js',  'client' )
    // api.add_files( 'src/cubesat.js',  ['client', 'server'])
    api.export( '__',       ['client', 'server'] )
//    api.export( 'db',       ['client', 'server'] )
    api.export( 'cube',     ['client', 'server'] )
    // api.export( 'Sat',      ['client', 'server'] )
//    api.export( 'Settings', ['client', 'server'] )
//    api.export( 'Parts',    ['client', 'server'] )
//    api.export( 'Modules',  ['client', 'server'] )
//    api.export( 'exports',  ['client', 'server'] )
//    api.export( 'module',   ['client', 'server'] )
})
