
Package.describe({
    summary: 'Cubesat: framework for Meteor in coffeescript.',
    version: '0.4.54',
    git: 'https://github.com/i4han/cubesat.git',
    documentation: 'README.md'
});

Package.on_use( function (api) {
    var lang = 'coffee'
    lang === 'coffee' && api.use('coffeescript@1.0.6');
    api.use('jquery@1.0.1');
    api.use('iron:router@1.0.7');
    api.add_files( 'src/settings.js',            ['client', 'server'] );
    api.add_files( lang + '/x.'        + lang,   ['client', 'server'] );    
    api.add_files( lang + '/elements.' + lang,    'client'  );
    api.add_files( 'src/x_client.js',             'client'  );
    api.add_files( lang + '/route.'    + lang,    'server'  );
    api.add_files( lang + '/cube.'     + lang,   ['client', 'server'] );

    api.export( 'x',        ['client', 'server'] );    
    api.export( 'db',       ['client', 'server'] );
    api.export( 'Settings', ['client', 'server'] );
    api.export( 'Parts',    ['client', 'server'] );
    api.export( 'Modules',  ['client', 'server'] );
    api.export( 'exports',  ['client', 'server'] );
});

Npm.depends({
    busboy:     "0.2.9",
    cloudinary: "1.2.1"
});

Cordova.depends({
    'org.apache.cordova.camera': '0.3.0'
});
