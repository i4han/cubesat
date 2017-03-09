#!/usr/bin/env node

const fs     = require('fs')
const path   = require('path')
const dotenv = require('dotenv')
const in$    = require('incredibles')
const argv   = require('minimist')(process.argv.slice(3))
const {spawn, exec} = require('child_process')   // , spawn = ref.spawn, exec = ref.exec
const dot_env       = '.env'
const package_js    = 'package.js'
const package_json  = 'package.json'
const packages_dir  = 'packages'

require.main !== module && ( () => {
    const gulp  = require('gulp')
    const valve = (v, ...o) => require(v)(...o)
    paths = {
        src: "./src/*.js"
      , doc: "./doc"  }
    gulp.task( 'doc', () => {
        gulp.src(paths.src)
        .pipe( valve("gulp-markdox") )
        .pipe( gulp.dest(paths.doc) ) })  })()

findDir = d => process.cwd().split('/').concat('').into$
    .reduce( ( (a,v,i,ar) => a.insert( i, ar.slice(0, -i - 1) ) ), [].into$ )
    .find$( v => fs.existsSync( v.join('/').into$.path(d).__ ) )
    .if( v => v.typeof('array') ).then( v => v.join('/').into$ )
    .else( ''.into$ ).result

const home          = process.env.HOME.into$
home.path(dot_env).if( v => fs.existsSync( v.__ ) ).then( v => dotenv.config( {path: v.__} ) )
const site_path     = findDir( '.sat' )
const dot_sat_path  = site_path.path( '.sat' )
const mobile_config = site_path.path( 'mobile-config.js' )
const dot_cubesat   = '.cubesat'
const cubesat_path  = findDir( dot_cubesat ).if( v => v.is('') ).then(home).else(v => v).result
const site_settings = site_path.path( 'lib', 'settings.js' ).__
const deploy_settings = site_path.path( '.settings.json' ).__
const global_settings = cubesat_path.path( dot_cubesat, 'settings.js' )
const workspace     = ( process.env.WORKSPACE || home.path('workspace') ).into$
const test_path     = workspace.path( 'test' )
const packages_path = test_path.path( packages_dir )
const node_modules  = process.env.NODE_MODULES || findDir( 'node_modules' ) || home // NODE_MODULES is not standard. but
const paths2test    = 'client server lib public private resources'.split(' ')       // NODE_PATH may create confusion so don't use it.

let taskBook = in$.from({}), path_info, paths
let tasks, options

class Task {
    constructor (name, fn, options) {
        this.name = name
        this.fn = fn
        this.options = options || {}
        taskBook.set(name, this) }  }

let Settings = in$.from({})
__.Settings = obj => in$.from(obj)
    .if(   v => v.typeof('function') )
    .then( v => v.prop( 0, in$.from({}).assign(Settings, obj({})) ) )
    .then( v => Settings.assign( in$.from( obj(v.prop(0)) ).invokeProperties(v.prop(0)) ) )
    .else_if( v => v.typeof('object') )
    .then( v => Settings.assign(v.invokeProperties( in$.from({}).assign(Settings, v.__) )) )

const isCommand = f => require.main === module && f()

isCommand( main )
let command = process.argv[2] || 'help'
// console.log(command, taskBook.val, 0, taskBook.get('help').get('fn'))
const taskTogo = taskBook.get(command).into$
const arg0 = argv._[0]
const error = e => e && (console.error(e) || true)
const error_quit = e =>  console.error(e) || process.exit(1)

isCommand( handleErrors )

const cd = d => process.chdir(d.valueOf())
const mkdir = (dir, path, f) => cd(path) && fs.mkdir(dir, e => e || f(dir, path))
const cp = (s, t) => fs.createReadStream(s).pipe(fs.createWriteStream(t))
const spawn_command = (bin, command, args, path) => {
    [' ', bin, command].concat(args).join(' ').into$.log()
    path && ( cd(path) || path.log(' ') )
    return spawn(bin, [command].concat(args), {stdio: 'inherit'}) }

/*
mobile_config = function() {
  var data, o
  settings()
  init_settings()
  data = __.keys(o = Settings.app).map(function(k) {
    var ref2, ref3
    if ((ref2 = mcTable[k]) != null ? ref2.list : void 0)
      return __.keys(o[k]).map( l => 'App.' + k + '("' + l + '", ' + strOrObj(o[k][l]) + ');' ).join('\n') + '\n\n'
    else if (__.isArray(o[k])
      return o[k].map( l => 'App.' + k + '("' + l + '");' ).join('\n') + '\n\n'
    else
      return 'App.' + k + '({' + (((ref3 = mcTable[k]) != null ? ref3.f : void 0) || mc_obj)(o[k]) + '\n});\n\n'
  }).join('')
  fs.readFile(  mobile_config_js, 'utf-8', (e, d) =>
      d === data || fs.writeFile( mobile_config_js, data, e =>
          console.log( new Date() + ' ' + mobile_config_js + ' is written.' )  )  )  }
*/

github_url = function(repo) {
  return 'https://github.com/' + repo + '.git' }

create = function() {
  var site;
  //__.check('name', site = argv._[0]) || console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) || process.exit(1);
  return (spawn_command('git', 'clone', [github_url(argv.repo || 'i4han/sat-spark'), site])).on('exit', function(code) {
    return code && (console.error('error: Git exited with an error.') || process.exit(1)); }); };

deploy = () =>  spawn_command('meteor', 'deploy', [argv._[0] || Settings.deploy.name], site_path)

__create_test = function() {
  (test_path = argv._[0]) || console.error("error: Test directory name is missing.") || process.exit(1);
  if (fs.existsSync(test_path)) {
    return console.error("error: Directory already exist.");
  } else {
    return meteor_create(test_path, function() {
      return mkdir(packages_dir, null, function() {
        return mkdir(cubesat_name, packages_dir, function() {
          return (spawn_command('git', 'clone', [github_url('i4han/cubesat'), '.'], cubesat_name)).on('exit', function() {
            return console.info("info: cubesat package directory:", process.cwd()); }); }); }); }); } };

install_mobile = () => {
  let wt
  !site_path && !((wt = argv['with-test']) && test_path) && console.error("error: Run in .sat working directory or specify valid test name." || process.exit(1));
  ;(['install-sdk', 'add-platform'].reduce(((f, c) =>
    () => spawn_command('meteor', c, ['ios'], wt ? test_path : site_path).on('exit', f)),
    () => console.log(new Date()) ))()  }

// console.log(0, taskBook.val, 1, taskBook.get(command).val, 2, taskBook.get(command, 'fn'))
isCommand( () => taskBook.get(command, 'fn')() )    // task_command.call()

function handleErrors () {
    taskTogo.__ || error_quit(`fatal: Unknown command "${command}"`)
    taskTogo.at('options.dotsat')   && (site_path.__ || error_quit(`fatal: You must run it in .sat working directory or its subdirectory.`))
    taskTogo.at('options.arg0')     && (arg0      || error_quit(`error: You need to specify app or package name for the third argument.`))
    taskTogo.at('options.test')     && (fs.existsSync(test_path) || error_quit(`fatal: test path "${test_path}" does not exist. `))
    taskTogo.at('options.settings') && require( site_settings )  }

function main () {

let v
const getVersion = path => require(path.valueOf()).version
const addVersion = s => (v = s.split('.'), v.map( (a, i) => (i != v.length - 1) ? a : (parseInt(a) + 1).toString() ).join('.'))
const version = () => path_info.get(argv._[0], 'path').path(package_json).invoke$(getVersion).log()
const increaseVersion = (file, data) =>
    data.replace(new RegExp('"version":\\s*"' + (v = getVersion(file)) + '"'), '"version": "' + addVersion(v) + '"')

const gitPush = (commit, paths) => {
    let p = paths.shift()
    spawn_command('git', 'add', ['.'], p).on(  'exit', code =>
        spawn_command('git', 'commit', ['-m', commit], p).on(  'exit', code =>
            code ? paths.length ? gitPush( commit, paths ) : undefined
                 : spawn_command('git', 'push', [], p).on(  'exit', code =>
                   paths.length ? gitPush( commit, paths ) : undefined  )  )  )  }

const editFile = (file, func, action) =>
    fs.readFile(  file.__, 'utf8', (e, data) => error(e) ||
        fs.writeFile( file.__, data = func(file, data), 'utf8', e => error(e) || ( action && action(file, data) ) )  )
const npmPublish    = (path, after) => (spawn_command('npm', 'publish', ['.'], path)).on('exit', after ? after : () => {} )
const meteorPublish = (path, after) => (spawn_command('meteor', 'publish', [], path)).on('exit', after ? after : () => {} )

const publish = paths => {
    let v = paths.shift(), path = v.path.into$
    editFile(  path.path( v.meteor ? package_js : package_json ),
        (f, d) => increaseVersion( path.path(package_json), d ), (f, d) =>
        v.meteor ? meteorPublish(  path, () =>
                v.npm ? editFile(  path.path(package_json), increaseVersion, (f, d) =>
                        npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )
                      : paths.length ? publish(paths) : {}  )
                 : npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )  }
const meteorRun     = (path, port)  => spawn_command( 'meteor', 'run', argv._.concat(['--port', port || '3000', '--settings', deploy_settings]), path || site_path )

const npmUpdate = npms => {
    if (!npms.length) return
    let v = npms.shift()
    spawn_command(    'npm', 'remove',  [v.name, '--save', '--prefix', v.prefix], v.path ).on(  'exit', () =>
        spawn_command('npm', 'install', [v.name, '--save', '--prefix', v.prefix], v.path )  ).on(  'exit', () =>
            npmUpdate(npms)  )  }

const meteorUpdate = (npms, meteors) => {
    if (!meteors.length)
        return npms.length ? npmUpdate(npms) : undefined
    let v = meteors.shift()
    spawn_command(  'meteor', 'update', [v.name], v.path).on('exit',
        meteors.length ? () => meteorUpdate(npms, meteors) : () => npmUpdate(npms)  )  }

const npmArray = arr => arr.reduce(  (  (a,v,i) =>
    a.concat( v.npm.map( w => ({name: v.npmName || v.name, prefix:w, path:v.path }) ) )  ), []  )

const update = paths => {
    meteorUpdate(
        npmArray( paths.filter(v => v.npm) ),
        paths.filter(v => v.meteor).reduce( ((a,v,i) => a.concat( v.meteor.map( w => ({name:v.name, path:w}) ) )), [] )  )  }

const npmInstall = npms => {
    if (!npms.length) return
    let v = npms.shift()
    spawn_command(     'npm', 'remove', [v.name, '--save', '--prefix', v.prefix], v.path ).on(  'exit', () =>
        spawn_command( 'npm', 'install',   ['.', '--save', '--prefix', v.prefix], v.path )  ).on(  'exit', () =>
            npmInstall(npms)  ) }

const npmLink = npms => {
    if (!npms.size()) return
    let v = npms.shift().into$.values()[0]//.into$.log()
    spawn_command(     'npm', 'remove', [v.npmLink, '--save'], v.path ).on(  'exit', () =>
        spawn_command( 'npm', 'link',   [v.npmLink, '--save'], v.path )  ).on(  'exit', () => npmLink(npms)  ) }

const jasmine = (a, fn) => {
    if (a.length === 0) return
    spawn_command( 'jasmine', a.shift() ).on(  'exit', code =>
        code === 0 ? a.length !== 0 ? jasmine(a, fn) : fn === undefined ? {} : fn() : {}  )  }

const jasmineSpecs = key =>
    key ? [] :
        path_info.keys().map( k => path_info.get(k) ).filter( v => v.jasmine ).reduce(  (  (a,v) =>
            a.concat(  fs.readdirSync( v.path.into$.path('spec').__ ).filter( w => w.match(/[sS]pec\.js$/) )
                .map( x => v.path.into$.path('spec', x) )  )  ), []   )

let ops = argv._
new Task(  'env',  () =>
    fs.readFile(  home.path(dot_env).__, 'utf8', (e, data) => error(e) ||
        data.replace(  /^\s*([a-zA-Z_]{1}[a-zA-Z0-9_]*).*/mg, (m, p1) =>
            console.log( `  $${p1.padEnd(22)} = ` + process.env[p1] )  )  ),
    { dotsat: 0, test: 0, description: 'Show arguments and environment variables.' } )

new Task(  'paths', () =>
    path_info.keys().map(  k =>
        console.log( '  ', k.padEnd(16), path_info.get(k).type.padEnd(8), path_info.get(k).path.valueOf() )  ),
    { dotsat: 0, test: 0, description: 'Show working paths.' } )

new Task(  'args', () =>
    console.log('   arguments:   ', argv) ||
    options.keys().map(  k =>
        console.log( '  ', `-${k}, --${options[k].full}`.padEnd(15), options[k].command.padEnd(40), options[k].description )  ),
    { dotsat: 0, test: 0, description: 'Show arguments.' }  )

new Task(  'help', () =>
    taskBook.keys().map(  k =>
        console.log( '  ', k.padEnd(16), taskBook.get(k).options.description )  ),
    { dotsat: 0, test: 0, description: 'Help message.' }  )

new Task(  'add-version', () => {
    let p = in$.from(path_info.get(argv._[0], 'path'))
    editFile( p.path(package_js), (f, d) => increaseVersion( p.path(package_json).__, d), () =>
        editFile( p.path(package_json), increaseVersion, () => version() )) },
    { dotsat: 0, test: 0, description: 'Increase version in pakage.json.', arg0: 1 }  )

new Task(  'version', () => version(),
    { dotsat: 0, test: 0, description: 'Print sat version.', arg0: 1 }  )

new Task(  'jasmine', () => jasmine( jasmineSpecs() ),
    { dotsat: 0, test: 0, description: 'Run Jasmine test framework.' }  )
const npmOrMeteor = () => path_info.keys().filter(k => path_info.get(k, 'npm') || path_info.get(k, 'meteor'))
new Task(  'update', () =>
    ops.length ? update( pathInfos(ops) )
               : update( npmOrMeteor().map(k => path_info.get(k)) ),
    { dotsat: 1, test: 0, description: 'Update packages.', thirdCommand: 1 }  )

const filter = p => path_info.keys().filter( k => path_info.get(k, p) )
const pathInfos = a => a.map(k => path_info.get(k))

new Task(  'npm-update', () =>
    ops.length ? npmUpdate(  npmArray( ops.map(k => path_info.get(k)) ) )
               : npmUpdate(  npmArray( filter('npm').map( k => path_info.get(k) ) ) ),
    { dotsat: 1, test: 0, description: 'Update npm modules.', thirdCommand: 1 })

new Task(  'npm-install', () =>
    ops.length ? npmInstall( npmArray( pathInfos(ops) ) )
               : npmInstall( npmArray( filter('npm').map( k => path_info.get(k) ) ) ),
    { dotsat: 1, test: 0, description: 'Install local npm modules.', thirdCommand: 1 }  )

new Task(  'npm-link', () => paths.filter(v => v.npmLink).carry(npmLink),
    { dotsat: 0, test: 0, description: 'Link local npm modules.' }  )

const testArray = a => a.map(v => ({name: v.name, prefix: test_path, path: v.path}))
new Task(  'npm-test-install', () =>
    ops.length ? npmInstall( testArray( pathInfos(ops) ) )
               : npmInstall( testArray( pathInfos( filter('npmTest') ) ) ),
    { dotsat: 0, test: 0, description: 'Install local npm modules for test site.', thirdCommand: 1 }  )

new Task(  'script', () => {
    fs.readFile(  home.path(dot_env).valueOf(), 'utf8', (e, data) => error(e) ||
        data.replace(/^\s*([a-zA-Z])/mg, "export $1").into$.log() )
    path_info.keys().filter( (v,i,a) => path_info.get(v, 'cd') ).forEach( v =>
            console.log( `alias cd-${v}='cd`, path_info.get(v, 'path') + "'" )  )
    global_settings.require$().stringify$().log(v => `export GLOBAL_SETTINGS='${v}'`)  },
    { dotsat: 0, test: 0, description: 'Print export .env $. <(sat script)' }  )

new Task(  'git-push', () =>
    gitPush( arg0, filter('git').map( k => path_info.get(k, 'path') ) ),
    { dotsat: 1, test: 0, description: 'Git push.', arg0: 1 })

new Task(  'run', () => meteorRun(),
    { dotsat: 1, test: 0, description: 'Run meteor server.', settings: 1 })

new Task(  'test', () => {
    paths2test.forEach( d => {
        let target, source
        fs.unlink(  target = test_path.path(d).__, () =>
            fs.existsSync( source = site_path.path(d).__ )   &&
            fs.symlink(  source, target, () =>
                console.log(new Date(), source)  )  )  })
    fs.readdir(  test_path.__, (e, list) => {
        e || list.forEach( f => path.extname(f) === '.js'    &&
        fs.unlink( test_path.path(f).__ ) )
        fs.readdir(  site_path.__, (e, list) =>
            e || list.forEach( f => path.extname(f) === '.js' &&
            fs.link( site_path.path(f).__, test_path.path(f).__, () =>
                console.log(new Date(), f) ) )  )  })
    meteorRun(test_path, '3300') },
    { dotsat: 1, test: 0, description: 'Test environment.', settings: 1 })

new Task(  'publish', () => {
    if ( argv._.length ) publish( pathInfos(argv._) )
    else publish( pathInfos( npmOrMeteor() ) )  },
    { dotsat: 0, test: 0, description: 'Publish Meteor packages.' })

new Task(  'api-url', () => {
    __._Settings = Settings.__
    in$.meteor.queryString(__._Settings.google.maps.options).into$.log() },
    {dotsat: 0, test: 0, description: 'Settings', settings: 1})

new Task(  'settings', () => Settings.log(),
    {dotsat: 1, test: 0, description: 'Settings', settings: 1})

let settings_json =
new Task(  'settings.json', () =>
    fs.readFile(site_settings, 'utf-8', (e, data) =>
        in$.object({
            public: JSON.parse(process.env.GLOBAL_SETTINGS).public
          , "galaxy.meteor.com": { env: data.match(/process\.env\.[A-Z0-9_]+/mg).into$
                .map(v => v.slice(12)).reduce( (a,v) => a.set(v, process.env[v]), in$.object() ).__
        }  }).stringify$(null, 4).log()/*.carry( v => fs.writeFile(deploy_settings, v.__, () => {})) */  )
  , {dotsat: 1, test: 0, description: 'Settings', settings: 1})

new Task(  'global-settings', () =>
    process.env.GLOBAL_SETTINGS.into$.parseJson$().log()
  , {dotsat: 1, test: 0, description: 'Settings', settings: 1})

new Task(  'deploy', () =>
    spawn_command( 'meteor', 'deploy', ['--settings', '.settings.json', process.env.DEPLOY_URL], site_path )
  , {dotsat: 1, test: 0, description: 'Deploy meteor', settings: 1})

new Task(  'geo', () =>
    spawn_command( 'node', 'geo.js', [], workspace.path('dev') )
  , {dotsat: 0, test: 0, description: 'Deploy meteor', settings: 0})


//meteor deploy --settings settings.json map.meteorapp.com
//meteor deploy --settings settings.json map.meteorapp.com
tasks = in$.from({
    create:     { call: () => create(),     dotsat: 0, test: 0, description: 'Create a project.' },
    deploy:     { call: () => deploy(),     dotsat: 1, test: 0, description: 'Deploy to meteor.com.' },
    mobileConfig:  { call: () => mobile_config(),    dotsat: 0, test: 1, description: 'Create mobile-config.js' },
    createTest:    { call: () => create_test(),      dotsat: 0, test: 1, description: 'Create test directory.' },
    installMobile: { call: () => install_mobile(),   dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' }  })

options = in$.from({})

path_info = in$.from({
    home:      { type: "user",    name: "home",              path: home },
    cubesat:   { type: "user",    name: "cubesat",           path: cubesat_path, cd:1 },
    module:    { type: "user",    name: "module",            path: node_modules, cd:1 },
    settings:  { type: "user",    name: "settings",          path: global_settings },
    ws:        { type: "user",    name: "workspace",         path: workspace,         cd:1 },
    site:      { type: "site",    name: "site",              git: 1, path: site_path, cd:0 },
    test:      { type: "site",    name: "test",              path: test_path,         cd:1, npmLink: 'incredibles' },
    cs:        { type: "package", name: "isaac:cubesat",     git: 1, path: packages_path.path("isaac:cubesat"),     cd:1,
                 npm:[node_modules], meteor:[site_path],     npmName: 'cubesat', npmLink: 'incredibles' },
    jq:        { type: "package", name: "isaac:jquery-x",    git: 1, path: packages_path.path("isaac:jquery-x"),    cd:1 },
    sq:        { type: "package", name: "isaac:style-query", git: 1, path: packages_path.path("isaac:style-query"), cd:1 },
    in:        { type: "package", name: "isaac:incredibles", git: 1, path: packages_path.path("isaac:incredibles"), cd:1,
                 npm:[node_modules, site_path, test_path],   npmName: 'incredibles', jasmine:1, npmTest: 1 },
    u2:        { type: "package", name: "isaac:underscore2", git: 1, path: packages_path.path("isaac:underscore2"), cd:1,
                 npm:[node_modules], meteor:[site_path],     npmName: 'underscore2', jasmine:1 }  })
paths = path_info  }
