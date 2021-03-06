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
        .pipe( gulp.dest(paths.doc) ) }) })()

in$.ductMethod('pj', 'thru', path.join)

let findDir = d => in$( process.cwd().split('/').concat('')
    .map( (v,i,a) => a.slice(0, -i-1).join('/') )
    .find( v=>in$(v).pj(d).thru(fs.existsSync).value )  ) // must be in site path

const home          = in$(process.env.HOME).cut()
home.pj(dot_env).if(fs.existsSync).then( v => dotenv.config( {path: v.value} ) )
const site_path     = findDir('.sat').cut().is(undefined).elseSelf(v=>v
    .pj('lib', 'settings.js').let('site_settings')
    .from(v).pj('.settings.json').let('deploy_settings')
)
const dot_cubesat   = '.cubesat'
const cubesat_path  = findDir(dot_cubesat).is('').then(v=>home).else(v=>v).self(v=>v.result).pj(dot_cubesat).cut()
const global_settings = cubesat_path.pj('settings.js').cut()
const workspace     = in$(process.env.WORKSPACE || '~/workspace').cut() 
const test_path     = workspace.pj('test').cut()
const packages_path = test_path.pj(packages_dir).cut()
const node_modules  = in$(process.env.NODE_MODULES) || findDir('node_modules') || home // NODE_MODULES is not standard. but
const paths2test    = 'client server imports lib public private resources'.split(' ')       // NODE_PATH may create confusion so don't use it.
// const site_settings = site_path.pj('lib', 'settings.js').value
// const deploy_settings = site_path.pj('.settings.json').value

let taskBook = in$({})
let tasks, options

class Task {
    constructor (name, fn, options) {
        this.name = name
        this.fn = fn
        this.options = options || {}
        taskBook.set(name, this) }  }

let Settings = in$({}), prop
__.Settings = obj => in$(obj).type()
    .case('function')
    .then( v=>prop = in$({}).assign( Settings, obj({}) ).value )
    .then( v=>Settings.assign( in$(obj(prop)).invokeProperties(prop) ) )
    .case('object')
    .then( v=> Settings.assign( v.invokeProperties( in$({}).assign(Settings, v.value) )) )

const isCommand = f => require.main === module && f()

isCommand( main )
let command = process.argv[2] || 'help'
// console.log(command, taskBook.val, 0, taskBook.get('help').get('fn'))
const taskTogo = in$(taskBook.get(command))
const arg0 = argv._[0]
const error = e => e && (console.error(e) || true)
const error_quit = e =>  console.error(e) || process.exit(1)

isCommand( handleErrors )

const cd = d => process.chdir(d)
const mkdir = (dir, path, f) => cd(path) && fs.mkdir(dir, e => e || f(dir, path))
const cp = (s, t) => fs.createReadStream(s).pipe(fs.createWriteStream(t))
const spawn_command = (bin, command, args, path) => {
    in$([' ', bin, command]).append(args).join(' ').log()
    ;(path = in$.strip(path)) && ( cd(path) || console.log(' ', path) )
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
isCommand( taskBook.get(command, 'fn') )    // task_command.call()

function handleErrors () {
    taskTogo.value || error_quit(`fatal: Unknown command "${command}"`)
    taskTogo.at('options.dotsat')   && (site_path.value || error_quit(`fatal: You must run it in .sat working directory or its subdirectory.`))
    taskTogo.at('options.arg0')     && (arg0      || error_quit(`error: You need to specify app or package name for the third argument.`))
    taskTogo.at('options.test')     && (fs.existsSync(test_path) || error_quit(`fatal: test path "${test_path}" does not exist. `))
    taskTogo.at('options.settings') && require( site_settings )  }

function main () {

paths = in$({
    home:      { type: "user",    name: "home",      path: home }
  , cubesat:   { type: "user",    name: "cubesat",   path: cubesat_path,      cd:1 }
  , module:    { type: "user",    name: "module",    path: node_modules,      cd:1 }
  , settings:  { type: "user",    name: "settings",  path: global_settings }
  , ws:        { type: "user",    name: "workspace", path: workspace,         cd:1 }
  , site:      { type: "site",    name: "site",      path: site_path, git: 1, cd:0 }
  , test:      { type: "site",    name: "test",      path: test_path,         cd:1, npmLink: 'incredibles' }
  , package:   { type: "package", name: "packages",  path: packages_path }
  , jq:        { type: "package", name: "isaac:jquery-x",    git: 0,  cd:1 }
  , sq:        { type: "package", name: "isaac:style-query", git: 1,  cd:1, meteor:[site_path] }
  , cs:        { type: "package", name: "isaac:cubesat",     git: 1,  cd:1
               , npm:[node_modules], meteor:[site_path],     npmName: 'cubesat',    npmLink: 'incredibles', npmEnv:1 }
  , in:        { type: "package", name: "isaac:incredibles", git: 1,  cd:1
               , npm:[node_modules,  site_path, test_path],  npmName: 'incredibles', jasmine:1, npmTest: 1, npmEnv:1 }
  , u2:        { type: "package", name: "isaac:underscore2", git: 1,  cd:1
               , npm:[node_modules], meteor:[site_path],     npmName: 'underscore2', jasmine:1 }  })
.forEach( v=> v.path || (v.path = packages_path.pj(v.name).cut()) )

let v, param = argv._[0]

const getVersion = p => in$(p).thru(require).value.version
const version = () => paths.pickAt(param, 'path').pj('package.json').thru(getVersion).value
const addVersionNumber = s => s.split('.').map( (v,i,a)=>(i != a.length - 1) ? v : (parseInt(v) + 1).toString() ).join('.')
const addVersion = (file, data) =>
    data.replace(new RegExp('"version":\\s*"' + (v = getVersion(file)) + '"'), '"version": "' + addVersionNumber(v) + '"')

const gitPush = (commit, _path) => {
    let p = _path.shift()
    spawn_command('git', 'add', ['.'], p).on(  'exit', code =>
        spawn_command('git', 'commit', ['-m', commit], p).on(  'exit', code =>
            code ? _path.length ? gitPush( commit, _path ) : undefined
                 : spawn_command('git', 'push', [], p).on(  'exit', code =>
                   _path.length ? gitPush( commit, _path ) : undefined  )  )  )  }

const editFile = (file, func, action) =>
    fs.readFile(  file.value, 'utf8', (e, data) => error(e) ||
        fs.writeFile( file.value, data = func(file, data), 'utf8', e => error(e) || ( action && action(file, data) ) )  )
const npmPublish    = (path, after) => (spawn_command('npm', 'publish', ['.'], path)).on('exit', after ? after : () => {} )
const meteorPublish = (path, after) => (spawn_command('meteor', 'publish', [], path)).on('exit', after ? after : () => {} )

const publish = paths => {
    let v = paths.shift(), path = v.path.cut()
    editFile(  path.pj( v.meteor ? package_js : package_json ),
        (f, d) => addVersion( path.pj(package_json), d ), (f, d) =>
        v.meteor ? meteorPublish(  path, () =>
                v.npm ? editFile(  path.pj(package_json), addVersion, (f, d) =>
                        npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )
                      : paths.length ? publish(paths) : {}  )
                 : npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )  }
const meteorRun     = (path, port)  => spawn_command( 'meteor', 'run', argv._.concat(['--port', port || '3000', '--settings', deploy_settings]), path || site_path )

const npmUpdate = (npms, install) => {
    if (!npms.size()) return
    console.log(npms)
    let v = npms.shift().result
    let name = install ? '.' : v.name
    spawn_command(    'npm', 'remove',  [v.name, '--save', '--prefix', v.prefix], v.path ).on(  'exit', () =>
        spawn_command('npm', 'install', [name,   '--save', '--prefix', v.prefix], v.path )  ).on(  'exit', () =>
            npmUpdate(npms, install)  )  }

const meteorUpdate = (npms, meteors) => {
    console.log(1, npms, 2, meteors)
    if (!meteors.length)
        return npms.length ? npmUpdate(npms) : undefined
    let v = meteors.shift()
    console.log(3, v, 4, meteors)
    spawn_command(  'meteor', 'update', [v.name], v.path).on('exit',
        meteors.length ? () => meteorUpdate(npms, meteors) : () => npmUpdate(npms)  )  }

const npmList = arr => arr.reduce( (a,v) =>
    a.append( v.npm.map( w => ({name: v.npmName || v.name, prefix:w.value, path:v.path.value }) ) ), in$([])  )

const update = paths => meteorUpdate(
    select('npm').self(npmList),
    select('meteor')
        .reduce( ((a,v,i) => a.concat( v.meteor.map( w => ({name:v.name, path:w}) ) )), [] )  )

const npmLink = npms => {
    if (!npms.object.size()) return
    let v = in$(npms.object.shift()).values()[0]
    spawn_command(     'npm', 'remove', [v.npmLink, '--save'], v.path ).on(  'exit', () =>
        spawn_command( 'npm', 'link',   [v.npmLink, '--save'], v.path )  ).on(  'exit', () => npmLink(npms)  ) }

const jasmine = (a, fn) => {
    if (a.length === 0) return
    spawn_command( 'jasmine', a.shift() ).on(  'exit', code =>
        code === 0 ? a.length !== 0 ? jasmine(a, fn) : fn === undefined ? {} : fn() : {}  )  }

const jasmineSpecs = () =>
    paths.filter(v=>v.jasmine).map(v=>v.path).reduce(  (a,v) =>
        a.concat(
            fs.readdirSync( v.pj('spec').value )
            .filter( w => w.match(/[sS]pec\.js$/) )
            .map( x => v.pj('spec', x).value )  ), []  )

new Task(  'env',  () =>
    fs.readFile(  home.pj(dot_env).value, 'utf8', (e, data) => error(e) ||
        data.replace(  /^\s*([a-zA-Z_]{1}[a-zA-Z0-9_]*).*/mg, (m, p1) =>
            console.log( `  $${p1.padEnd(22)} = ` + process.env[p1] )  )  )
  , { dotsat: 0, test: 0, description: 'Show arguments and environment variables.' } )

new Task(  'paths', () =>
    paths.map( (v, k) => in$('  ', k.padEnd(16), v.type.padEnd(8), v.path.value).print() )
  , { dotsat: 0, test: 0, description: 'Show working paths.' } )

new Task(  'args', () =>
    console.log('   arguments:   ', argv)
  , { dotsat: 0, test: 0, description: 'Show arguments.' }  )

new Task(  'help', () =>
    taskBook.forEach( (v, k) => in$('  ', k.padEnd(16), v.options.description).print() )
  , { dotsat: 0, test: 0, description: 'Help message.' }  )

new Task(  'add-version', () => {
    let p = paths.pickAt(param, 'path').cut()
    editFile( p.pj(package_js), (f, d) => addVersion( p.pj(package_json).value, d), () =>
        editFile( p.pj(package_json), addVersion, version)) }
  , { dotsat: 0, test: 0, description: 'Increase version in pakage.json.', arg0: 1 }  )

new Task(  'version', () => console.log(version())
  , { dotsat: 0, test: 0, description: 'Print sat version.', arg0: 1 }  )

new Task(  'jasmine', () => {
    jasmine( jasmineSpecs() )
    spawn_command( 'node', 'geo.js', [], workspace.pj('dev') ).on('exit', () =>
        spawn_command( 'diff', 'out.kml', ['out2.kml'], workspace.pj('dev') )  )  }
  , { dotsat: 0, test: 0, description: 'Run Jasmine test framework.' }  )

const npmMeteor = () => paths.filter( v=>v.npm || v.meteor ).map(v=>v).into$
const select = p => paths.filter( v=>v[p] )  //.map(v=>v)

new Task(  'update', () => paths.filter( v=>v.npm || v.meteor ).self(update)
  , { dotsat: 1, test: 0, description: 'Update packages.', thirdCommand: 1 }  )


new Task(  'npm-update', () =>
    select('npm').self([npmList, npmUpdate])
  , { dotsat: 1, test: 0, description: 'Update npm modules.', thirdCommand: 1 })

new Task(  'npm-install', () =>
    param ? in$([paths.pickAt(param)]).self([npmList, npmUpdate]) :
        select('npm').self([npmList, npmUpdate])
  , { dotsat: 1, test: 0, description: 'Install local npm modules.', thirdCommand: 1 }  )

new Task(  'npm-link', () =>
    select('npmLink').over(npmLink)
  , { dotsat: 0, test: 0, description: 'Link local npm modules.' }  )

const testList = a => a.map(  v =>
    ({name: v.npmName || v.name, prefix: test_path.value, path: v.path.value})  ).into$
new Task(  'npm-test-install', () =>
    select('npmTest').carry(testList).carry(npmUpdate, true)
  , { dotsat: 0, test: 0, description: 'Install local npm modules for test site.', thirdCommand: 1 }  )

const alias = () => {
    fs.readFile(  home.pj('.alias').value, 'utf8', (e, data) => error(e) || in$(data).log() )
    paths.filter( v=>v.cd ).forEach( (v,k)=> `alias cd-${k}='cd ${v.path.value}'`.into$.log() )  }

new Task(  'alias', alias,
    { dotsat: 0, test: 0, description: 'Print alias' }  )

new Task(  'script', () => {
    alias()
    home.pj(dot_env).thru(fs.readFile, 'utf8', (e, data) => error(e) ||
        data.replace(/^\s*([a-zA-Z])/mg, "export $1").into$.log())
    global_settings.thru([require, JSON.stringify]).log(v => `export GLOBAL_SETTINGS='${v.value}'`)
    paths.filter( v=>v.npmEnv).forEach( v=> (`export ${v.npmName.toUpperCase()}_PATH=` + v.path.value).into$.log() ) }
  , { dotsat: 0, test: 0, description: 'Print export .env $. <(sat script)' }  )

new Task(  'git-push', () =>
    gitPush( arg0, paths.filter(v => v.git).map(v => v.path.value) )
  , { dotsat: 1, test: 0, description: 'Git push.', arg0: 1 })

new Task(  'run', () => meteorRun()
  , { dotsat: 1, test: 0, description: 'Run meteor server.', settings: 1 })

new Task(  'test', () => {
    paths2test.forEach( d => {
        let target, source
        fs.unlink(  target = test_path.pj(d).value, () =>
            fs.existsSync( source = site_path.pj(d).value )   &&
            fs.symlink(  source, target, () =>
                console.log(new Date(), source)  )  )  })
    fs.readdir(  test_path.value, (e, list) => {
        e || list.forEach( f => path.extname(f) === '.js'    &&
        fs.unlink( test_path.pj(f).value ) )
        fs.readdir(  site_path.value, (e, list) =>
            e || list.forEach( f => path.extname(f) === '.js' &&
            fs.link( site_path.pj(f).value, test_path.pj(f).value, () =>
                console.log(new Date(), f) ) )  )  })
    meteorRun(test_path, '3300') }
  , { dotsat: 1, test: 0, description: 'Test environment.', settings: 1 })

new Task(  'publish', () => npmMeteor().carry(publish)
  , { dotsat: 0, test: 0, description: 'Publish Meteor packages.' })

new Task(  'api-url', () => {
    __._Settings = Settings.value
    in$.meteor.queryString(__._Settings.google.maps.options).log() }
  , {dotsat: 0, test: 0, description: 'Settings', settings: 1})

new Task(  'settings', () => Settings.log()
  , {dotsat: 1, test: 0, description: 'Settings', settings: 1})

new Task(  'settings.json', () =>
    fs.readFile(  site_settings, 'utf-8', (e, data) =>  // search for process.env.ENVIRONMENT_VARIABLES
        in$({
            public: JSON.parse(process.env.GLOBAL_SETTINGS).public
          , "galaxy.meteor.com": { env: data.match(/process\.env\.[A-Z0-9_]+/mg)
                .map(v => v.slice(12)).reduce( (a,v) => a.set(v, process.env[v]), in$({}) ).value  }
        }).thru(JSON.stringify, null, 4).log() )
  , {dotsat: 1, test: 0, description: 'Settings', settings: 1})

new Task(  'global-settings', () =>
    in$(process.env.GLOBAL_SETTINGS).thru(JSON.parse).log()
  , {dotsat: 1, test: 0, description: 'Settings', settings: 1})

new Task(  'deploy', () =>
    spawn_command( 'meteor', 'deploy', ['--settings', '.settings.json', process.env.DEPLOY_URL], site_path )
  , {dotsat: 1, test: 0, description: 'Deploy meteor', settings: 1})

new Task(  'geo', () =>
    spawn_command( 'node', 'geo.js', [], workspace.pj('dev') )
  , {dotsat: 0, test: 0, description: 'Deploy meteor', settings: 0})


//meteor deploy --settings settings.json map.meteorapp.com
//meteor deploy --settings settings.json map.meteorapp.com
tasks = in$({
    create:     { call: () => create(),     dotsat: 0, test: 0, description: 'Create a project.' },
    deploy:     { call: () => deploy(),     dotsat: 1, test: 0, description: 'Deploy to meteor.com.' },
    mobileConfig:  { call: () => mobile_config(),    dotsat: 0, test: 1, description: 'Create mobile-config.js' },
    createTest:    { call: () => create_test(),      dotsat: 0, test: 1, description: 'Create test directory.' },
    installMobile: { call: () => install_mobile(),   dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' }  })

options = in$({})
}
