
Package.describe({
    summary: 'Cubesat: framework for Meteor in coffeescript.',
    version: '0.4.22',
    documentation: null
});

Package.on_use( function (api) {
    api.use('jquery@1.0.1');
    api.use('iron:router@1.0.7');
    api.add_files( 'src/settings.js',  ['client', 'server'] );
    api.add_files( 'js/x.js',          ['client', 'server'] );    
    api.add_files( 'js/elements.js',   ['client', 'server'] );
    api.add_files( 'src/x_client.js',   'client'            );
    api.add_files( 'js/route.js',                 'server'  );
    api.add_files( 'js/satellite.js',  ['client', 'server'] );

    api.export( 'x',        ['client', 'server'] );    
    api.export( 'db',       ['client', 'server'] );
    api.export( 'Settings', ['client', 'server'] );
    api.export( 'Modules',  ['client', 'server'] );
    api.export( 'exports',  ['client', 'server'] );
});

Cordova.depends({
    "org.apache.cordova.camera": "0.3.0"
});