#!/usr/bin/env node

// Settings should be in lib/settings.js
// so you don't need to generate settings.json

const fs       = require('fs')
const path     = require('path')
const dotenv   = require('dotenv')
const ref      = require('child_process'), spawn = ref.spawn, exec = ref.exec
const __       = require('cubesat')
const in$      = require('incredibles')

let command      = process.argv[2]
const argv         = require('minimist')(process.argv.slice(3))
const add          = path.join
const home         = in$(process.env.HOME)
const cwd          = process.cwd()
const coffee_ext   = '.coffee'
const index_js     = 'index.js'
const package_js   = 'package.js'
const package_json = 'package.json'
const lib_dir      = 'lib'
const client_dir   = 'client'
const public_dir   = 'public'
const packages_dir = 'packages'

let taskBook = in$({})
class Task {
    constructor (name, fn, options) {
        this._name = name
        this._fn = fn
        this._ = options || {}
        taskBook[name] = in$(this) }  }

findDir = d => in$(process.cwd().split('/')).concat('')
    .reduce( ( (a,v,i,ar) => a.insert(i, ar.slice(0, -i - 1) ) ), in$([]) )
    .firstValue( v => fs.existsSync( add(v.join('/'), d) ) )
    .typeof('array', v => in$(v.join('/')), v => v)

const dot_sat      = '.sat'
const dot_cubesat  = '.cubesat'
const dot_env      = '.env'
const site_path    = findDir(dot_sat)    .is(false, '', v => v)
const dot_sat_path = site_path.path(dot_sat)
const cubesat_path = findDir(dot_cubesat).is(false, home, v => v)
const dot_cubesat_path = cubesat_path.path(dot_cubesat)  // should be error? .cubesat doesn't exist?
const settings_path    = dot_cubesat_path.path('settings.js')
const node_modules = process.env.NODE_MODULES || findDir('node_modules') || home
const paths2test   = 'client server lib public private resources'.split(' ')
const dot_env_path = in$( [home, cubesat_path, dot_cubesat_path, site_path, dot_sat_path] )
    .firstValue( v => fs.existsSync( v.path(dot_env) ) )
dot_env_path && dotenv.config( {path: dot_env_path} )

let tasks, options
__.require = f => delete require.cache[f] && require(f)

main()

if (! command) command = 'help'  // empty command means 'sat help'
const task_command = tasks[__.camelize(command)]
const arg0 = argv._[0]

const error = e => e && (console.error(e) || true)
const error_quit = e => {
  console.error(e)
  process.exit(1) }

task_command || error_quit(`fatal: Unknown command "${command}"`)
task_command.dotsat && (site_path || error_quit(`fatal: You must run it in .sat working directory or its subdirectory.`))
task_command.arg0   && (arg0      || error_quit(`error: You need to specify app or package name for the third argument.`))

const test_dir = task_command.test && arg0 ? arg0 : 'test'
const test_path = cubesat_path.path(test_dir)
task_command.test   && (fs.existsSync(test_path) || error_quit(`fatal: test path "${test_path}" does not exist. `))

if (test_path) {
  test_client_path     = test_path.path(client_dir)
  test_lib_path        = test_path.path(lib_dir)
  test_public_path     = test_path.path(public_dir)
  test_packages_path   = test_path.path(packages_dir)
  cubesat_package_path = test_packages_path.path('isaac:cubesat')
  jqx_package_path     = test_packages_path.path("isaac:jquery-x")
  sq_package_path      = test_packages_path.path("isaac:style-query")
  u2_package_path      = test_packages_path.path('isaac:underscore2') }

const path_info = in$( pathInfo() )
// const package_paths = __.keys(path_info).filter(k => 'package' === path_info[k].type).map(k => path_info[k].path)

let site_js, index_js_path, mobile_config_js, settings_json, client_path, lib_path
let f, r, s

const loadSettings  = f => (fs.existsSync(f) && __.return(r = __.require(f).setting, __.return(r))) || {}

if (site_path) {
  // build_path    = site_path
  // site_js       = fs.readdirSync(site_path).filter(f => '.js' === path.extname(f))
  index_js_path    = site_path.path(index_js)
  mobile_config_js = site_path.path('mobile-config.js')
  settings_json    = site_path.path('.settings.json')
  client_path      = site_path.path(client_dir)
  lib_path         = site_path.path(lib_dir)

  init_settings = () => __.assign(Settings = loadSettings(settings_path), loadSettings(index_js_path))
  task_command.settings && init_settings() }

let json
const settings = () =>
    init_settings() && fs.readFile(settings_json, 'utf-8', (e, data) =>
        (data === (json = JSON.stringify(Settings, '', 4) + '\n')) ||
            fs.writeFile(settings_json, json, e => console.log(new Date() + ' Settings are written.')) )

const cd = d => process.chdir(d.valueOf())
const mkdir = (dir, path, f) => cd(path) && fs.mkdir(dir, e => e || f(dir, path))
const cp = (s, t) => fs.createReadStream(s).pipe(fs.createWriteStream(t))

const spawn_command = (bin, command, args, path) => {
  console.log('  ', ([bin, command].concat(args)).join(' '))
  path && ( cd(path) || console.log('  ', path.valueOf()) )
  return spawn(bin, [command].concat(args), {stdio: 'inherit'}) }

// var indexOf = [].indexOf

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
  __.check('name', site = argv._[0]) || console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) || process.exit(1);
  return (spawn_command('git', 'clone', [github_url(argv.repo || 'i4han/sat-spark'), site])).on('exit', function(code) {
    return code && (console.error('error: Git exited with an error.') || process.exit(1));
  });
};



meteor_refresh = function() {
  return meteor_publish().on('exit', function(code) {
    return code || meteor_update();
  });
};


deploy = () =>  spawn_command('meteor', 'deploy', [argv._[0] || Settings.deploy.name, '--settings', settings_json], site_path)

__create_test = function() {
  (test_path = argv._[0]) || console.error("error: Test directory name is missing.") || process.exit(1);
  if (fs.existsSync(test_path)) {
    return console.error("error: Directory already exist.");
  } else {
    return meteor_create(test_path, function() {
      return mkdir(packages_dir, null, function() {
        return mkdir(cubesat_name, packages_dir, function() {
          return (spawn_command('git', 'clone', [github_url('i4han/cubesat'), '.'], cubesat_name)).on('exit', function() {
            return console.info("info: cubesat package directory:", process.cwd());
          });
        });
      });
    });
  }
};

install_mobile = () => {
  let wt
  !site_path && !((wt = argv['with-test']) && test_path) && console.error("error: Run in .sat working directory or specify valid test name." || process.exit(1));
  ;(['install-sdk', 'add-platform'].reduce(((f, c) =>
    () => spawn_command('meteor', c, ['ios'], wt ? test_path : site_path).on('exit', f)),
    () => console.log(new Date()) ))()
}



function main () {

let v
const getVersion = path => __.require(path.valueOf()).version
const addVersion = s => (v = s.split('.'), v.map((a, i) => (i != v.length - 1) ? a : (parseInt(a) + 1).toString()).join('.'))
const version = () => console.log(getVersion(add(path_info[argv._[0]].path, package_json)))
const increaseVersion = (file, data) =>
    data.replace(new RegExp('"version":\\s*"' + (v = getVersion(file)) + '"'), '"version": "' + addVersion(v) + '"')
const gitPush = (commit, paths) => {
    let p = paths.shift()
    spawn_command('git', 'add', ['.'], p).on(  'exit', code =>
        spawn_command('git', 'commit', ['-m', commit], p).on(  'exit', code =>
            code ? paths.length ? gitPush( commit, paths ) : undefined
                 : spawn_command('git', 'push', [], paths[0]).on(  'exit', code =>
                   paths.length ? gitPush( commit, paths ) : undefined  )  )  )  }
const editFile = (file, func, action) =>
    fs.readFile(file.valueOf(), 'utf8', (e, data) => error(e) ||
        fs.writeFile(file.valueOf(), data = func(file, data), 'utf8', e => error(e) || (action && __.isFunction(action, action(file, data)))))
const npmPublish    = (path, after) => (spawn_command('npm', 'publish', ['.'], path)).on('exit', __.isFunction(after) ? after : () => {} )
const meteorPublish = (path, after) => (spawn_command('meteor', 'publish', [], path)).on('exit', __.isFunction(after) ? after : () => {} )
const publish = paths => {
    let v = paths.shift(), path = in$(v.path)
    editFile(  path.path( v.meteor ? package_js : package_json ),
        (f, d) => increaseVersion( path.path(package_json), d ), (f, d) =>
        v.meteor ? meteorPublish(  path, () =>
                v.npm ? editFile(  path.path(package_json), increaseVersion, (f, d) =>
                        npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )
                      : paths.length ? publish(paths) : {}  )
                 : npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )  }
const meteorRun     = (path, port)  => spawn_command( 'meteor', 'run', argv._.concat(['--port', port || '3000']), path || site_path )
const npmUpdate = npms => {
    if (!npms.length) return
    let v = npms.shift()
    spawn_command(    'npm', 'remove', [v.name, '--save',  '--prefix', v.prefix], v.path ).on(  'exit', () =>
        spawn_command('npm', 'install', [v.name, '--save', '--prefix', v.prefix], v.path )  ).on(  'exit', () =>
            npmUpdate(npms)  )  }
const meteorUpdate = (npms, meteors) => {
    if (!meteors.length)
        return npms.length ? npmUpdate(npms) : undefined
    let v = meteors.shift()
    spawn_command(  'meteor', 'update', [v.name], v.path).on('exit',
        meteors.length ? () => meteorUpdate(npms, meteors) : () => npmUpdate(npms)  )  }
const npmArray = arr => arr.reduce(  (  (a,v,i) =>
    a.concat( v.npm.map( w => ({name:v.npmName || v.name, prefix:w, path:v.path }) ) )  ), []  )
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
const jasmine = (a, fn) => {
    if (!a.length) return
    spawn_command( 'jasmine', a.shift() ).on(  'exit', code =>
        code === 0 ? a.length !== 0 ? jasmine(a, fn) : __.isFunction(fn) ? fn : () => {} : () => {}  )  }
const jasmineSpecs = key =>
    key ? [] :
        path_info.keys().map( k => path_info[k] ).filter( v => v.jasmine ).reduce(  (  (a,v) =>
            a.concat( fs.readdirSync( add(v.path, 'spec') ).filter( w => w.match(/[sS]pec\.js$/) )
                .map(vv => add(v.path, 'spec', vv)   )  )  ), []  )

let ops = argv._
new Task(  'env',  () =>
    fs.readFile(  home.path(dot_env), 'utf8', (e, data) => error(e) ||
        data.replace(  /^\s*([a-zA-Z_]{1}[a-zA-Z0-9_]*).*/mg, (m, p1) =>
            console.log( `  $${__.padLeft(22, p1)} = ` + process.env[p1] )  )  ),
    { dotsat: 0, test: 0, description: 'Show arguments and environment variables.' } )
new Task(  'paths', () =>
    path_info.keys().map(  k =>
        console.log( '  ', __.padLeft(15, k), __.padLeft(8, path_info[k].type), path_info[k].path.valueOf() )  ),
    { dotsat: 0, test: 0, description: 'Show working paths.' } )
new Task(  'args', () =>
    console.log('   arguments:   ', argv) ||
    options.keys().map(  k =>
        console.log( '  ', __.padLeft(15, `-${k}, --${options[k].full}`), __.padLeft(40, options[k].command), options[k].description )  ),
    { dotsat: 0, test: 0, description: 'Show arguments.' }  )
new Task(  'help', () =>
    tasks.keys().map(  k =>
        console.log( '  ', __.padLeft(15, __.dasherize(k)), (tasks[k].description || taskBook[__.dasherize(k)]._.description) )  ),
    { dotsat: 0, test: 0, description: 'Help message.' }  )
new Task(  'add-version', () => {
    let path = path_info[argv._[0]].path
    editFile( add(path, package_js), (f, d) => increaseVersion(add(path, package_json), d), () =>
        editFile( add(path, package_json), increaseVersion, () => version() )) },
    { dotsat: 0, test: 0, description: 'Increase version in pakage.json.', arg0: 1 }  )
new Task(  'version', () => version(),
    { dotsat: 0, test: 0, description: 'Print sat version.' }  )
new Task(  'jasmine', () => jasmine( jasmineSpecs() ),
    { dotsat: 0, test: 0, description: 'Jasmine test framework.' }  )
new Task(  'update', () =>
    ops.length ? update( ops.map(k => path_info[k]) )
               : update( path_info.keys().filter(k => path_info[k].npm || path_info[k].meteor).map(k => path_info[k]) ),
    { dotsat: 0, test: 0, description: 'Update packages.', thirdCommand: 1 }  )
new Task(  'npm-update', () =>
    ops.length ? npmUpdate( npmArray( ops.map(k => path_info[k]) ) )
               : npmUpdate( npmArray( path_info.keys().filter( k => path_info[k].npm ).map( k => path_info[k] ) ) ),
    { dotsat: 0, test: 0, description: 'Update npm modules.', thirdCommand: 1 })
new Task(  'npm-install', () =>
    ops.length ? npmInstall( npmArray( ops.map(k => path_info[k]) ) )
               : npmInstall( npmArray( path_info.keys().filter( k => path_info[k].npm ).map( k => path_info[k] ) ) ),
    { dotsat: 0, test: 0, description: 'Update local npm modules.', thirdCommand: 1 }  )
new Task(  'dot-env', () =>
    fs.readFile(  home.path(dot_env).valueOf(), 'utf8', (e, data) => error(e) ||
        console.log( data.replace(/^\s*([a-zA-Z])/mg, "export $1") )  ),
    { dotsat: 0, test: 0, description: 'Print export .env $. <(sat dot-env)' }  )
new Task(  'git-push', () =>
    gitPush( arg0, path_info.keys().filter( k => path_info[k].git ).map( k => path_info[k].path ) ),
    { dotsat: 1, test: 0, description: 'Git push.', arg0: 1 })
new Task(  'run', () => meteorRun(),
    { dotsat: 1, test: 0, description: 'Run meteor server.', settings: 1 })
new Task(  'test', () => {
    paths2test.forEach( d => {
        let target, source
        fs.unlink(  target = add(test_path, d), () =>
            fs.existsSync( source = add(site_path, d) ) && fs.symlink(  source, target, () =>
                console.log(new Date(), source)  )  )  })
    fs.readdir(  test_path, (e, list) => {
        e || list.forEach( f => path.extname(f) === '.js' && fs.unlink(add(test_path, f)) )
        fs.readdir(  site_path, (e, list) =>
            e || list.forEach( f => path.extname(f) === '.js' && fs.link( add(site_path, f), add(test_path, f), () => console.log(new Date(), f) ) )  )  })
    meteorRun(test_path, '3300') },
    { dotsat: 1, test: 0, description: 'Test environment.', settings: 1 })
new Task(  'publish', () => {
    if ( argv._.length ) publish( argv._.map(k => path_info[k]) )
    else publish( path_info.keys().filter(k => path_info[k].npm || path_info[k].meteor).map(k => path_info[k]) )  },
    { dotsat: 0, test: 0, description: 'Publish Meteor packages.' })

tasks = in$({
  env:        { dotsat: 0, test: 0 },
  paths:      { dotsat: 0, test: 0 },
  args:       { dotsat: 0, test: 0 },
  test:       { dotsat: 1, test: 0, settings: 1 },
  update:     { dotsat: 1, test: 0, thirdCommand: 1 },
  npmUpdate:  { dotsat: 1, test: 0},
  npmInstall: { dotsat: 1, test: 0},
  help:       { dotsat: 0, test: 0 },
  run:        { dotsat: 1, test: 0, settings: 1 },
  gitPush:    { dotsat: 1, test: 0, arg0: 1 },
  dotEnv:     { dotsat: 0, test: 0 },
  version:    { dotsat: 0, test: 0, arg0: 1 },
  publish:    { dotsat: 0, test: 0 },
  jasmine:    { dotsat: 0, test: 0 },
  addVersion: { dotsat: 0, test: 0, arg0: 1 },
  create:     { call: () => create(),     dotsat: 0, test: 0, description: 'Create a project.' },
  settings:   { call: () => settings(),   dotsat: 1, test: 0, description: 'Settings', settings: 1 },
  deploy:     { call: () => deploy(),     dotsat: 1, test: 0, description: 'Deploy to meteor.com.' },
  mobileConfig:  { call: () => mobile_config(),    dotsat: 0, test: 1, description: 'Create mobile-config.js' },
  createTest:    { call: () => create_test(),      dotsat: 0, test: 1, description: 'Create test directory.' },
  installMobile: { call: () => install_mobile(),   dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' }
})

options = in$({
  t: { full: 'with-test', command: ['run', 'coffee', 'install-mobile'], description: 'Excute with test.' },
  T: { full: 'for-test',  command: ['run', 'coffee', 'install-mobile'], description: 'Excute for test.'  }  })  }

function pathInfo () {  return {
    sat:      { type: "sat",     name: "sat",               path: cubesat_path },
    module:   { type: "module",  name: "module",            path: node_modules },
    site:     { type: "site",    name: "site",              git: 1, path: site_path },
    test:     { type: "test",    name: "test",              path: test_path },
    cubesat:  { type: "package", name: "isaac:cubesat",     git: 1, path: cubesat_package_path,
                npm:[node_modules], meteor:[site_path], npmName: 'cubesat' },
    jqx:      { type: "package", name: "isaac:jquery-x",    git: 1, path: jqx_package_path },
    sq:       { type: "package", name: "isaac:style-query", git: 1, path: sq_package_path },
    in:       { type: "package", name: "incredibles", git: 1, path: test_packages_path.path('incredibles'),
                npm:[node_modules, site_path, test_path],   jasmine:1 },
    u2:       { type: "package", name: "isaac:underscore2", git: 1, path: u2_package_path,
                npm:[node_modules], meteor:[site_path],     npmName: 'underscore2', jasmine:1 }  }  }


taskBook[command] ? taskBook[command]._fn() : task_command.call()
