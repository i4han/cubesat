#!/usr/bin/env coffee

fs       =  require 'fs'
path     =  require 'path'
ps       =  require 'ps-node'
cs       =  require 'coffee-script'
eco      =  require 'eco'
chokidar =  require 'chokidar'
https    =  require 'https'
jade     =  require 'jade'
stylus   =  require 'stylus'
async    =  require 'async'
dotenv   =  require 'dotenv'
nconf    =  require 'nconf'
api      =  require('absurd')()
{spawn, exec} = require 'child_process'
{x}      =  require 'cubesat'

cs.register()
command  =  process.argv[2]
argv     =  require('minimist') process.argv[3..]

add  = path.join
home = process.env.HOME
cwd  = process.cwd()

build_dir      = 'build'
index_basename = 'index' 
coffee_ext     = '.coffee'
index_coffee   = index_basename + coffee_ext
package_js     = 'package.js'
package_json   = 'package.json'

findRoot = (d) ->
    dir_list = process.cwd().split('/').concat [true]
    while dir_list.pop()
        break if fs.existsSync add dir_list.join('/'), d
    dir_list.join '/'

dot_sat     = '.sat'
dot_cubesat = '.cubesat'
site_path        = findRoot dot_sat
dot_sat_path     = add site_path, dot_sat
cubesat_path     = findRoot dot_cubesat
dot_cubesat_path = add cubesat_path or home, dot_cubesat
node_modules     = findRoot('node_modules') or home

tasks =
    ok:       call: (-> ok()            ), dotsat: 0, test: 0, description: ''
    test:     call: (-> test()          ), dotsat: 1, test: 0, description: 'Test environment.'
    init:     call: (-> init()          ), dotsat: 0, test: 0, description: 'Init .cubesat.'
    help:     call: (-> help()          ), dotsat: 0, test: 0, description: 'Help message.'
    create:   call: (-> create()        ), dotsat: 0, test: 0, description: 'Create a project.' # --repo
    run:      call: (-> run()           ), dotsat: 1, test: 0, description: 'Run meteor server.'
    build:    call: (-> build()         ), dotsat: 1, test: 0, description: 'Build meteor client files.'
    settings: call: (-> settings()      ), dotsat: 1, test: 0, description: 'Settings'
    version:  call: (-> version()       ), dotsat: 0, test: 0, description: 'Print sat version'
    publish:  call: (-> publish()       ), dotsat: 0, test: 0, description: 'Publish Meteor packages.'
    coffee:   call: (-> coffee_compile()), dotsat: 1, test: 0, description: 'Watching coffee files to complie.'
    'create-test':    call: (-> create_test()    ), dotsat: 0, test: 1, description: 'Create test directory.' 
    'install-mobile': call: (-> install_mobile() ), dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' 
    'npm-update':     call: (-> npm_update()     ), dotsat: 0, test: 1, description: 'Publish and install npm cubesat packages.'    
    'npm-install':    call: (-> npm_install()    ), dotsat: 0, test: 0, description: 'Install cubesat npm package'
    'npm-publish':    call: (-> npm_publish()    ), dotsat: 0, test: 1, description: 'Publish cubesat to npm'
    'meteor-update':  call: (-> meteor_update()  ), dotsat: 1, test: 1, description: 'Publish and install meteor cubesat packages.'
    'meteor-install': call: (-> meteor_install() ), dotsat: 1, test: 0, description: 'Install meteor cubesat packages.'
    'meteor-publish': call: (-> meteor_publish() ), dotsat: 0, test: 1, description: 'Publish cubesat to meteor'

options =
    t: full: 'with-test', command: ['run', 'coffee', 'install-mobile'], description: 'Excute with test.'

if site_path is '' and tasks[command]?.dotsat
    console.log 'fatal: "sat' + command + '" must run in .sat working directory or its subdirectory.'
    process.exit 1
[home, cubesat_path, dot_cubesat_path, site_path].forEach (_path) ->
    fs.existsSync(dotenv_path = add _path, '.env') and dotenv.config path:dotenv_path
build_path        = add site_path, build_dir
index_coffee_path = add site_path, index_coffee
env  = (v) -> (_path = process.env[v]) and _path.replace /^~\//, home + '/'  # read process.env, no use
test_dir = switch 
    when with_test = argv['with-test'] and x.isString with_test then with_test 
    when tasks[command]?.test and argv._[0] then argv._[0] 
    else 'test'
test_path  = if fs.existsSync(test_path = add cubesat_path, test_dir) then test_path else undefined

nocacheRequire = (f) -> delete require.cache[f] and require f
loadSettings   = (f) -> (fs.existsSync(f) and x.func (nocacheRequire f).Settings) or {}
Settings = loadSettings settings_path = add dot_cubesat_path, 'settings.coffee'
(f = (o) -> x.keys(o).forEach (k) -> if x.isObject o[k] then o[k] = f o[k] else o[k] = x.func o[k])(Settings)
settings_json =  add build_path,   'settings.json'
nconf.file file: add dot_sat_path, 'config.json'

@Theme = @Modules = {}

init_settings = ->
    Settings = loadSettings settings_path
    x.extend Settings, loadSettings index_coffee_path
    (site = Settings.site) and (local = Settings.local) and local[site] and x.extend Settings, local[site]
    @Settings = Settings
init_settings() # check if command, .sat and index_coffee

lib_dir      = 'lib'
client_dir   = 'client'
public_dir   = 'public'
packages_dir = 'packages'

build_client_path    = add build_path, client_dir
build_lib_path       = add build_path, lib_dir
build_public_path    = add build_path, public_dir

style_path   = add site_path, 'style' # where to use?

cubesat_name = 'isaac:cubesat'
lib_files    = x.toArray Settings.lib_files
my_packages  = x.toArray Settings.packages
public_files = x.toArray Settings.public_files

if test_path
    test_client_path   = add test_path, client_dir
    test_lib_path      = add test_path, lib_dir
    test_public_path   = add test_path, public_dir
    test_packages_path = add test_path, packages_dir
    cubesat_package_path   = add test_packages_path, cubesat_name
    package_paths = my_packages.map (p) -> add test_packages_path, p

coffee_paths = -> (fs.readdirSync site_path).filter((f) -> coffee_ext is path.extname f).map((f) -> add site_path, f)

updated = 'updated time'

log = ->
    # node-logentries
    arguments? and ([].slice.call(arguments)).forEach (str) ->
        fs.appendFile home + '/.log.io/cake', str, (err) -> console.log err if err

error = (e) -> e and (console.error(e) or 1)

isType = (file, type) -> path.extname(file) is '.' + type  # move to x?

collectExt = (dir, ext) ->
    (fs.existsSync(dir) or '') and ((fs.readdirSync dir).map (file) -> 
        if isType(file, ext) then fs.readFileSync add dir, file else '').join '\n'

cd   = (dir) -> process.chdir dir

func = (f) -> if 'function' == typeof f then f() else true

rmdir = (dir, f) ->
    if fs.existsSync dir
        fs.readdirSync(dir).forEach (file, index) ->
            if fs.lstatSync(curPath = add dir, file).isDirectory() then rmdir curPath
            else fs.unlinkSync curPath
        fs.rmdirSync dir
    func(f)
    dir

mkdir = (dir, _path, f) -> 
    _path and process.chdir _path
    dir and fs.readdir dir, (e, l) -> e and fs.mkdir dir, (e) -> e or x.isFunction(f) and f()

compare_file = (source, target) -> false

cp = (source, target) ->
    ! compare_file(source, target) and fs.readFile source, (e, data) -> 
        # console.log source, target
        error(e) or fs.readFile target, (e, data_t) ->
            e or (data.length > 0 and data.toString() != data_t.toString()) and fs.writeFile target, data, ->
                # console.log new Date(), target   

cpdir = (source, target) ->
    fs.readdir source, (e, list) -> list.map (f) ->
        if  f.match /^\./ then ''
        else if (fs.lstatSync _path = add source, f).isDirectory() then mkdir (t_f = add target, f), null, -> cpdir _path, t_f 
        else cp _path, add target, f

__clean_up = ->
    rmdir build_client_path 
    rmdir build_lib_path 

__daemon = ->
    ps.lookup command: 'node',   psargs: 'ux', (e, a) -> 
        node_ps = a.map (p) -> (p.arguments?[0]?.match /\/(log\.io-[a-z]+)$/)?[1]
        'log.io-server'    in node_ps or spawn 'log.io-server',    [], stdio:'inherit'
        'log.io-harvester' in node_ps or setTimeout( ( -> spawn 'log.io-harvester', [], stdio:'inherit' ), 100 )

coffee_clean = ->
    ps.lookup command: 'node',   psargs: 'ux', (e, a) -> a.map (p) -> 
        '-wbc' == p.arguments?[3] and process.kill p.pid, 'SIGKILL'

coffee_watch = (c, js) -> spawn 'coffee', ['-o', js, '-wbc', c], stdio:'inherit'

coffee_compile = ->
    mkdir build_lib_path
    coffee_dir = [site_path] 
    js_dir     = [build_lib_path]
    package_paths and package_paths.map (p) ->
        coffee_dir.push add p, 'coffee'
        js_dir    .push add p, 'js'
    ps.lookup command: 'node',   psargs: 'ux', (e, a) -> a.map (p, i) -> 
        if '-wbc' == p.arguments?[3] and (c = p.arguments[4])?
            if (i = coffee_dir.indexOf(c)) <  0 then process.kill p.pid, 'SIGKILL'
            else [coffee_dir.splice(i, 1), js_dir.splice(i, 1)]
        a.length - 1 == i and coffee_dir.map (c, j) -> coffee_watch c, js_dir[j]

meteor = (dir, port='3000') ->
    cd dir
    spawn 'meteor', ['--port', port, '--settings', settings_json], stdio:'inherit'

__stop_meteor = (func) ->
    ps.lookup psargs: 'ux', (err, a) -> a.map (p, i) ->
        ['3000', '3300'].map (port) -> 
            if '--port' == p.arguments?[1] and port == p.arguments?[2]
                process.kill p.pid, 'SIGKILL'
        a.length - 1 == i and func? and func()

__meteor_update = ->
    cd site_meteor_path
    spawn 'meteor', ['update'], stdio:'inherit'

__meteor_publish_command = -> spawn 'meteor', ['publish'], stdio:'inherit'
__meteor_command = (command, argument, path) -> 
    cd path
    console.log 'meteor', command, argument
    spawn 'meteor', [command, argument], stdio:'inherit'

spawn_command = (bin, command, args, _path) -> 
    _path and cd _path
    console.log bin, command, args.join ' '
    spawn bin, [command].concat(args), stdio:'inherit'

__start_meteor = ->
    stop_meteor -> 
        meteor test_path, '3300'
        #meteor site_meteor_path

__hold_watch = (sec) -> updated = process.hrtime()[0] + sec

__start_up = ->
    coffee_alone()
    #chokidar.watch(settings_cson).on 'change', -> settings()
    #chokidar.watch(test_lib_path).on 'change', (d) -> buid() # cp d, add build_lib_path, path.basename d
    lib_paths.concat([index_coffee_path]).map (f) -> 
        chokidar.watch(f).on 'change', -> build()
    hold_watch(2)
    package_paths.map (p) ->
        chokidar.watch(p).on 'change', (f) ->
            if updated < process.hrtime()[0]
                nconf.set 'updated_packages', (((nconf.get 'updated_packages') or [])
                    .concat([dir_f = path.dirname f]).filter((v, i, a) -> a.indexOf(v) == i))
                console.log new Date(), 'Changed', f
    commands()

__commands = ->
    rl = require('readline').createInterface process.stdin, process.stdout
    rl.setPrompt ''
    rl.on('line', (line) ->        
        switch (line = line.replace(/\s{2,}/g,' ').trim().split ' ')[0]
            when '.'        then console.log 'hi'
            when 'build'    then build()
            when 'time'     then console.log new Date()
            when 'publish'  then publish()
            when 'update'   then meteor_update()
            when 'settings' then settings()
            when 'coffee'   then switch line[1] 
                when 'alone' then coffee_alone() 
                when 'clean' then coffee_clean() 
            when 'meteor'   then start_meteor()
            when 'packages' then console.log nconf.get 'updated_packages'; nconf.save()
            when 'get'      then console.log nconf.get line[1]
            when 'set'      then nconf.set line[1], line[2]
            when 'stop'     then 'meteor' == line[1] and stop_meteor()
            when '' then ''
            else console.log '?'
    ).on 'close', ->
        console.log 'bye!'
        coffee_clean()
        nconf.save()
        rl.close()
        process.exit 1

meteor_packages_removed = 'autopublish insecure'.split ' '
meteor_packages = "service-configuration accounts-password fortawesome:fontawesome http iron:router #{cubesat_name} jquery mizzao:bootstrap-3 mizzao:jquery-ui mquandalle:jade stylus".split ' '
mobile_packages = [] #mobile meteor package

settings = ->
    init_settings()
    delete Settings.local
    console.log settings_json
    fs.writeFile settings_json, JSON.stringify(Settings, '', 4) + '\n', (e, data) -> 
        console.log new Date() + ' Settings are written.'


coffee = (data) -> cs.compile '#!/usr/bin/env node\n' + data, bare:true

directives =
    jade:
        file: '1.jade'
        f: (n, b) -> b = x.indent(b, 1); "template(name='#{n}')\n#{b}\n\n"
    jade$:
        file: '2.html'
        f: (n, b) -> b = x.indent(b, 1); jade.compile( "template(name='#{n}')\n#{b}\n\n", null )()  
    HTML:
        file: '3.html'
        f: (n, b) -> b = x.indent(b, 1); "<template name=\"#{n}\">\n#{b}\n</template>\n"
    head:
        file: '0.jade'
        header: -> 'head\n'    #  'doctype html\n' has not yet suppored
        f: (n, b) -> x.indent(b, 1) + '\n'
    less:
        file: '7.less'
        f: (n, b) -> b + '\n'
    css:
        file: '5.css'
        header: -> collectExt(style_path, 'css') + '\n'
        f: (n, b) -> b + '\n'
    styl:
        file: '4.styl'
        f: (n, b) -> b + '\n\n'
    styl$:
        file: '6.css'
        f: (n, b) -> stylus(b).render() + '\n'

write_build = (file, data) ->
    data.length > 0 and fs.readFile fwrite = add(build_client_path, file), 'utf8', (err, d) ->
        (!d? or data != d) and fs.writeFile fwrite, data, (e) -> console.log new Date(), fwrite
            # fs.writeFile add(mobile_client_path, file), data

toObject = (v) ->
    if !v? then {}
    else if x.isFunction v then (if x.isScalar(r = v.call @) then r else toObject r)
    else if x.isArray  v then v.reduce ((o, w) -> x.extend o, toObject w), {}
    else if x.isObject v then x.keys(v).reduce ((o, k) -> 
        o[k] = if x.isScalar(r = v[k]) then r else toObject r
        o), {}
    else if x.isString v then ((o = {})[v] = '') or o

no_seperator = 'jade jade$'.split ' '

toTidy = (v, d) -> 
    if x.isString v[d] then v[d] 
    else x.tideValue x.tideKey toObject(v[d]), v.id, if d in no_seperator then '' else ' '

toString = (v, d) ->
    if x.isString v[d]
        str = v[d]
    else
        v[d] = toObject v[d]
        str = x.indentStyle toTidy v, d
    if x.isEmpty data = toObject v.eco then str
    else eco.render str, toObject data

readExports = (f, kind) -> 
    x.func if index_basename is base = path.basename f, coffee_ext then (nocacheRequire f)[kind]
    else (updateRequire f)[base][kind]

build = () ->
    settings()
    spawn_command 'coffee', '-bc', ['-o', build_lib_path, site_path]
    init_settings()
    mkdir build_client_path
    @Modules = coffee_paths().reduce ((o, f) -> x.extend o, readExports f, 'Modules'), {}
    x.keys(@Modules).map (n) -> x.module n, @Modules[n] = x.func @Modules[n], x.func @Modules[n]
    x.keys(directives).map (d) -> 
        write_build (it = directives[d]).file, (x.func(it.header) || '') + 
            x.keys(@Modules).map((n) -> (b = toString(@Modules[n], d)) and it.f.call @, n, b).filter((o) -> o?).join ''
    x.keys(@Modules).map((n, i) -> @Modules[n].style and api.add toTidy @Modules[n], 'style')
        .concat([write_build 'absurd.css', api.compile()])

gitpass = ->
    prompt.message = 'github'
    prompt.start()
    prompt.get {name:'password', hidden: true}, (err, result) ->
        fs.writeFileSync add(home, '/.netrc'), """
            machine github.com
                login i4han
                password #{result.password}
            """, flag: 'w+'
        Config.quit(process.exit 1)

# fatal: error: warn: info:
github_file = (file) ->
    req = https.request
        host: 'raw.githubusercontent.com', port: 443, method: 'GET'
        path: add '/', argv.user or 'i4han', argv.repo or 'sat-init', argv.branch or 'master', path.basename file
        (res) ->
            res.setEncoding 'utf8'
            res.on 'data', (b) -> fs.writeFile file, b, 'utf8', (e) -> console.log 'written:', file
    req.end()
    req.on 'error', (e) -> console.log 'problem with request: ' + e.message

github_url = (repo) -> 'https://github.com/' + repo + '.git'

meteor_create = (dir, fn) ->
    (spawn_command 'meteor', 'create', [dir], site_path = process.cwd()).on 'exit', ->
        build_path = add site_path, dir
        (meteor_packages_removed.reduce ((f, p) -> -> (spawn_command 'meteor', 'remove', [p], build_path).on 'exit', f), ->
            (meteor_packages.concat(mobile_packages).reduce ((f, p) -> -> (spawn_command 'meteor', 'add', [p], build_path).on 'exit', f), ->
                '.html .css .js'.split(' ').map (f) -> fs.unlink add(build_path, dir + f), (e) -> error e
                x.isFunction(fn) and fn()
            )()
        )()

create = ->
    x.valid('name', site = argv._[0]) or console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) or process.exit 1
    fs.mkdir site, (e) ->
        e and (console.error("error: Can not create", site) or process.exit 1)
        (spawn_command 'git', 'clone', [github_url(argv.repo or 'i4han/sat-init'), '.'], site).on 'exit', (code) ->
            code and (console.error('error: Git exited with an error.') or process.exit 1)
            fs.existsSync('./build/.meteor') or meteor_create build_dir

incVersion = (data, re) ->
    data.match re
    console.log 'verion:', version = RegExp.$2.split('.').map((w, j) -> if j == 2 then String +w + 1 else w).join '.'
    data.replace re, "$1#{version}$3"

getVersion = (file, re) -> fs.readFileSync(file, 'utf8').match(re)[2]

readWrite = (file, func) ->
    fs.readFile file, 'utf8', (e, data) ->
        error(e) or fs.writeFile file, func data, 'utf8', (err) -> error(err) 


_publish = (file, re) ->
    console.log('TEST_PATH is null') or process.exit 0 unless test_path
    readWrite add(cubesat_package_path, file), (data) -> incVersion data, re

rePublish = 
    npm:    /("version"\s*:\s*['"])([0-9.]+)(['"]\s*,)/m
    meteor: /(version\s*:\s*['"])([0-9.]+)(['"]\s*,)/m

npm_publish = -> 
    _publish package_json, rePublish.npm
    spawn_command 'npm', 'publish', ['.'], cubesat_package_path

meteor_publish = ->
    _publish package_js,   rePublish.meteor
    spawn_command 'meteor', 'publish', [], cubesat_package_path

meteor_install = ->
    spawn_command 'meteor', 'add', [
        cubesat_name + '@' + getVersion add(cubesat_package_path, package_js), rePublish.meteor
    ], build_path 

npm_install = -> 
    spawn_command 'npm', 'install', ['--prefix', node_modules, 'cubesat'], process.cwd()

npm_update    = -> npm_publish()   .on 'exit', (code) -> code or npm_install() 
meteor_update = -> meteor_publish().on 'exit', (code) -> code or meteor_install() 

_meteor_run = (dir, port) ->     
    spawn_command 'meteor', 'run', argv._.concat(['--settings', settings_json, '--port', port or '3000']), dir or build_path

coffee_watch = (c, js) -> spawn 'coffee', ['-o', js, '-wbc', c], stdio:'inherit'


run = ->
    build()
    _meteor_run()
    argv['with-test'] and test()

test = ->
    build()
    test_path or console.error('error: Can not find cubesat home.') or process.exit 1
    'client server lib public private'.split(' ').forEach (d) ->
        fs.unlink target = add(test_path, d), ->
            fs.existsSync(source = add build_path, d) and fs.symlink source, target, 'dir', -> console.log new Date(), source
    _meteor_run test_path, '3300'

create_test = ->
    (test_path = argv._[0]) or console.error("error: Test directory name is missing.") or process.exit 1
    if fs.existsSync(test_path)
        console.error "error: Directory already exist." 
    else 
        meteor_create test_path, -> mkdir packages_dir, null, -> mkdir cubesat_name, packages_dir, ->
            (spawn_command 'git', 'clone', [github_url('i4han/cubesat'), '.'], cubesat_name).on 'exit', ->
                console.info "info: cubesat package directory:", process.cwd()

_install_mobile = (dir, fn) ->
    (['install-sdk', 'add-platform'].reduce ((f, c) -> -> (spawn_command 'meteor', c, ['ios'], dir).on 'exit', f), fn)()

install_mobile = ->
    ! site_path and ! ((wt = argv['with-test']) and test_path) and console.error "error: Run in .sat working directory or specify valid test name." or process.exit 1
    _install_mobile (if wt then test_path else build_path), -> console.log new Date()

version = -> console.log 'version: ' + getVersion add(node_modules, 'node_modules', 'cubesat', 'package.json'), rePublish.npm
help = -> x.keys(tasks).map (k) -> console.log '  ', (k + Array(15).join ' ')[..15], tasks[k].description
init = -> ''# Create .cubesat $CUBESAT_PATH or ~/.cubesat. Do we NEED this?
ok   = -> console.log argv


(task = tasks[command]) and task.call()
task or help()
