
Package.describe({
    summary: 'Cubesat: framework for Meteor in coffeescript.',
    version: '0.4.0',
    documentation: null
});

Package.on_use( function (api) {
    api.use('jquery@1.0.1');
    api.use('iron:router@1.0.7');
    //api.use('isaac:elements@0.1.13');
    //api.use('isaac:sets@0.0.1')
    //api.use('isaac:intl-tel-input@0.1.3');
    //api.use('isaac:masonry@0.0.1');
    //api.use('isaac:absurd@0.0.2');
    //api.use('isaac:route@0.1.2');
    //api.use('isaac:moment@0.0.1');
    //api.use('isaac:x@0.3.10');
    api.add_files( 'settings.js',  ['client', 'server'] );
    api.add_files( 'elements.js',  ['client', 'server'] );
    api.add_files( 'x.js',         ['client', 'server'] );
    api.add_files( 'x_client.js',   'client'            );
    //api.add_files( 'methods.js',   ['client', 'server'] );
    api.add_files( 'route.js',                'server'  );
    api.add_files( 'satellite.js', ['client', 'server'] );

    api.export( 'x',        ['client', 'server'] );    
    api.export( 'db',       ['client', 'server'] );
    api.export( 'Settings', ['client', 'server'] );
    api.export( 'Modules',  ['client', 'server'] );
    api.export( 'exports',  ['client', 'server'] );
});
