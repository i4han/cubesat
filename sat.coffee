#!/usr/bin/env coffee

fs       =  require 'fs'
path     =  require 'path'
ps       =  require 'ps-node'
cs       =  require 'coffee-script'
eco      =  require 'eco'
chokidar =  require 'chokidar'
{ncp}    =  require 'ncp'
path     =  require 'path'
https    =  require 'https'
jade     =  require 'jade'
stylus   =  require 'stylus'
async    =  require 'async'
cson     =  require 'CSON'
dotenv   =  require 'dotenv'
nconf    =  require 'nconf'
api      =  require('absurd')()
{spawn, exec} = require 'child_process'
{x}      =  require 'cubesat'

command  =  process.argv[2]
argv     =  require('minimist') process.argv[3..]

add  = path.join
home = process.env.HOME
cwd  = process.cwd()

mongo_port = 27017
mongo_url  = "mongodb://localhost:#{mongo_port}/meteor"
# mongo_url in config

build_dir      = 'build'
index_basename = 'index' 
coffee_ext     = '.coffee'
index_coffee   = index_basename + coffee_ext

dir_list = (cwd.split '/').concat [true]
sat_dir = '.sat'
while dir_list.pop()
    if fs.existsSync sat_path = add dir_list.join('/'), sat_dir
        break
site_path = dir_list.join '/'
fs.existsSync(dotenv_path = add home,      '.env') and dotenv.config path:dotenv_path
fs.existsSync(dotenv_path = add site_path, '.env') and dotenv.config path:dotenv_path
build_path = add site_path, build_dir
index_coffee_path = add site_path, index_coffee
env = (v) -> (_path = process.env[v]) and _path.replace /^~\//, home + '/'
satellite_path = env('SATELLITE_PATH') or add home, '.satellite'
settings_path  = env('SETTINGS_PATH')  or add satellite_path, 'settings.coffee'

nocacheRequire = (f) -> delete require.cache[f] and require f
loadSettings   = (f) -> (fs.existsSync(f) and x.func (nocacheRequire f).Settings) or {}
Settings = loadSettings settings_path
(f = (o) -> x.keys(o).forEach (k) -> if x.isObject o[k] then o[k] = f o[k] else o[k] = x.func o[k])(Settings)
settings_json =  add build_path, 'settings.json'
nconf.file file: add sat_path, 'config.json'

@Theme = @Modules = {}
theme_cson = ''

init_settings = ->
    Settings = loadSettings settings_path
    x.extend Settings, loadSettings index_coffee_path
    (site = Settings.site) and (local = Settings.local) and local[site] and x.extend Settings, local[site]
    @Settings = Settings
init_settings()

lib_dir    = 'lib'
client_dir = 'client'
public_dir = 'public'

build_client_path    = add build_path, client_dir
build_lib_path       = add build_path, lib_dir
build_public_path    = add build_path, public_dir

style_path  = env('STYLE_PATH') or add site_path, 'style'


lib_files    = x.toArray Settings.lib_files
my_packages  = x.toArray Settings.packages
public_files = x.toArray Settings.public_files
if test_path = env('TEST_PATH') or Settings.test_path
    test_client_path  = add test_path, client_dir
    test_lib_path     = add test_path, lib_dir
    test_public_path  = add test_path, public_dir
    test_packages_path = add test_path, 'packages'
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

mkdir = (dir, f) -> 
    dir and fs.readdir dir, (e, l) -> e and fs.mkdir dir, (e) -> e or (f and f())

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
        else if (fs.lstatSync _path = add source, f).isDirectory() then mkdir (t_f = add target, f), -> cpdir _path, t_f 
        else cp _path, add target, f

clean_up = ->
    rmdir build_client_path 
    rmdir build_lib_path 

daemon = ->
    ps.lookup command: 'node',   psargs: 'ux', (e, a) -> 
        node_ps = a.map (p) -> (p.arguments?[0]?.match /\/(log\.io-[a-z]+)$/)?[1]
        'log.io-server'    in node_ps or spawn 'log.io-server',    [], stdio:'inherit'
        'log.io-harvester' in node_ps or setTimeout( ( -> spawn 'log.io-harvester', [], stdio:'inherit' ), 100 )

coffee_watch = (o, f) -> spawn 'coffee', ['-o', o, '-wbc', f], stdio:'inherit'
coffee_clean = ->
    ps.lookup command: 'node',   psargs: 'ux', (e, a) -> a.map (p) -> 
        '-wbc' == p.arguments?[3] and process.kill p.pid, 'SIGKILL'

coffee_compile = ->
    mkdir build_lib_path
    watched_coffee = coffee_paths()
    package_paths and package_paths.map (p) -> (fs.readdirSync p).map (f) -> 
        isType(f, 'coffee') and watched_coffee.push add p, f
    ps.lookup command: 'node',   psargs: 'ux', (e, a) -> a.map (p, i) -> 
        if '-wbc' == p.arguments?[3] and (c = p.arguments[4])?
            if (i = watched_coffee.indexOf(c)) <  0 then process.kill p.pid, 'SIGKILL'
            else watched_coffee.splice(i, 1)
        if a.length - 1 == i
            watched_coffee.map (c) -> 
                if c.match /\/packages\// then coffee_watch path.dirname(c), c
                else coffee_watch build_lib_path, c

meteor = (dir, port='3000') ->
    cd dir
    spawn 'meteor', ['--port', port, '--settings', settings_json], stdio:'inherit'

stop_meteor = (func) ->
    ps.lookup psargs: 'ux', (err, a) -> a.map (p, i) ->
        ['3000', '3300'].map (port) -> 
            if '--port' == p.arguments?[1] and port == p.arguments?[2]
                process.kill p.pid, 'SIGKILL'
        a.length - 1 == i and func? and func()

meteor_update = ->
    cd site_meteor_path
    spawn 'meteor', ['update'], stdio:'inherit'

meteor_publish = -> spawn 'meteor', ['publish'], stdio:'inherit'
meteor_command = (command, argument, path) -> 
    cd path
    console.log 'meteor', command, argument
    spawn 'meteor', [command, argument], stdio:'inherit'

start_meteor = ->
    stop_meteor -> 
        meteor test_path, '3300'
        #meteor site_meteor_path

hold_watch = (sec) -> updated = process.hrtime()[0] + sec

start_up = ->
    coffee_alone()
    chokidar.watch(settings_cson).on 'change', -> settings()
    #chokidar.watch(test_lib_path).on 'change', (d) -> buid() # cp d, add build_lib_path, path.basename d
    lib_paths.concat([index_coffee_path, theme_cson]).map (f) -> 
        chokidar.watch(f).on 'change', -> build()
    hold_watch(2)
    package_paths.map (p) ->
        chokidar.watch(p).on 'change', (f) ->
            if updated < process.hrtime()[0]
                nconf.set 'updated_packages', (((nconf.get 'updated_packages') or [])
                    .concat([dir_f = path.dirname f]).filter((v, i, a) -> a.indexOf(v) == i))
                console.log new Date(), 'Changed', f
    commands()

commands = ->
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
meteor_packages = 'service-configuration accounts-password fortawesome:fontawesome http iron:router isaac:satellite jquery mizzao:bootstrap-3 mizzao:jquery-ui mquandalle:jade stylus underscore'.split ' '
mobile_packages = []

meteor_run_ios  = -> meteor_command 'run', 'ios', mobile_path
add_packages    = -> (meteor_packages.concat(mobile_packages).reduce ((f, p) -> -> (meteor_command 'add',    p, mobile_path).on 'exit', f), meteor_run_ios)()
remove_packages = -> (meteor_packages_removed                .reduce ((f, p) -> -> (meteor_command 'remove', p, mobile_path).on 'exit', f), add_packages  )()
prepare_mobile  = ->
    'client lib public resources'.split(' ').map (d) -> ncp add(test_path, d), add mobile_path, d
    'mobile.html mobile.css mobile.js'.split(' ').map (f) -> fs.unlink add(mobile_path, f), (e) -> error e
    (['install-sdk', 'add-platform'].reduce ((f, c) -> -> (meteor_command c, 'ios', mobile_path).on 'exit', f), remove_packages)()
update_mobile = ->
    rmdir mobile_path, -> (meteor_command 'create', mobile_path, work).on 'exit', prepare_mobile


settings = ->
    init_settings()
    delete Settings.local
    console.log settings_json
    fs.writeFile settings_json, JSON.stringify(Settings, '', 4) + '\n', (e, data) -> 
        console.log new Date(), 'Settings'

publish = ->
    version = {}
    updated_packages = nconf.get 'updated_packages'
    my_packages.map (v, i) ->
        package_dir = add test_packages_path, v
        package_js  = add package_dir, 'package.js'
        isLast = my_packages.length - 1 == i
        (true or isLast or -1 < updated_packages.indexOf(package_dir)) and fs.readFile package_js, 'utf8', (e, data) ->
            data.match /version:\s*['"]([0-9.]+)['"]\s*,/m
            version[v] = ((RegExp.$1.split '.').map (w, j) -> if j == 2 then String(Number(w) + 1) else w).join '.'
            data = data.replace /(version:\s*['"])[0-9.]+(['"])/m, "$1#{version[v]}$2"
            if ! isLast
                hold_watch(1)
                fs.writeFile package_js, data, 'utf8', (e) -> e and console.log new Date, e
            else 
                async.map x.keys(version), (p) -> # only async
                    data = data.replace((new RegExp("api\.use\\('#{p}.+$", 'm')), "api.use('#{p}@#{version[p]}');")
                hold_watch(1)
                fs.writeFile package_js, data, 'utf8', (e) ->
                    nconf.set 'updated_packages', []
                    nconf.save()
                    e or x.keys(version).concat([my_packages[my_packages.length - 1]])
                    .filter((v, i, a) -> a.indexOf(v) == i).map (d) ->
                        console.log new Date, 'Publishing', d 
                        cd add test_packages_path, d
                        meteor_publish()


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
    data.length > 0 and fs.readFile f = add(build_client_path, file), 'utf8', (err, d) ->
        (!d? or data != d) and fs.writeFile f, data, (e) ->
            console.log new Date(), f
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

read = (f, kind) -> 
    x.func if index_basename is base = path.basename f, coffee_ext then (nocacheRequire f)[kind]
    else (updateRequire f)[base][kind]

build = () ->
    console.log new Date()
    init_settings()
    mkdir build_client_path
    @Modules = coffee_paths().reduce ((o, f) -> x.extend o, read f, 'Modules'), {}
    x.keys(@Modules).map (name) -> x.module name, @Modules[name]
    x.keys(directives).map (d) -> 
        write_build (it = directives[d]).file, (x.func(it.header) || '') + 
            x.keys(@Modules).map((n) -> (b = toString(@Modules[n], d)) and it.f.call @, n, b).filter((o) -> o?).join ''
    x.keys(@Modules).map((n, i) -> @Modules[n].absurd and api.add toTidy @Modules[n], 'absurd')
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

github_file = (file) ->
    req = https.request
        host: 'raw.githubusercontent.com', port: 443, method: 'GET'
        path: add '/', argv.user or 'i4han', argv.repo or 'sat-init', argv.branch or 'master', path.basename file
        (res) ->
            res.setEncoding 'utf8'
            res.on 'data', (b) -> fs.writeFile file, b, 'utf8', (e) -> console.log 'written:', file
    req.end()
    req.on 'error', (e) -> console.log 'problem with request: ' + e.message

create = ->
    site = argv._[0]
    site.length > 0 or console.error "Can not create", site
    fs.mkdir site, (e) ->
        e and (console.log("Can not create", site, "\nAlready exists?") or process.exit 1)
        cwd = process.cwd()
        mkdir add (site_path = add cwd, site), sat_dir 
        (meteor_command 'create', build_dir, site_path).on 'exit', ->
            build_path = add cwd, site, build_dir
            (meteor_packages_removed.reduce ((f, p) -> -> (meteor_command 'remove', p, build_path).on 'exit', f), ->
                (meteor_packages.concat(mobile_packages).reduce ((f, p) -> -> (meteor_command 'add', p, build_path).on 'exit', f), ->
                    '.html .css .js'.split(' ').map (f) -> fs.unlink add(build_path, build_dir + f), (e) -> error e 
                    [index_coffee, '.gitignore'].forEach (f) -> github_file add site_path, f          
                )()
            )()

test = ->
    console.log 'Arguments', argv
version = ->
    console.log 'sat version:', '0.4.1'
tasks =
    test:     call: (-> test()          ), description: 'test'
    create:   call: (-> create()        ), description: 'Create a project.'
    build:    call: (-> build()         ), description: 'Build meteor client files.'
    settings: call: (-> settings()      ), description: 'Settings'
    version:  call: (-> version()       ), description: 'Print version'
    publish:  call: (-> publish()       ), description: 'Publish Meteor packages.'
    coffee:   call: (-> coffee_compile()), description: 'Watching coffee files to complie.'

(task = tasks[command]) and task.call()
task or x.keys(tasks).map (k) -> 
    console.log '  ', (k + Array(15).join ' ')[..15], tasks[k].description

