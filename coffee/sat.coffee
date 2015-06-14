#!/usr/bin/env coffee

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
   init:     call: (-> init()          ), dotsat: 0, test: 0, description: 'Init .cubesat. (Not implemented yet)'
   help:     call: (-> help()          ), dotsat: 0, test: 0, description: 'Help message.'
   create:   call: (-> create()        ), dotsat: 0, test: 0, description: 'Create a project.' # --repo
   run:      call: (-> run()           ), dotsat: 1, test: 0, description: 'Run meteor server.'
   deploy:   call: (-> deploy()        ), dotsat: 1, test: 0, description: 'Deploy to meteor.com.'
   build:    call: (-> build()         ), dotsat: 1, test: 0, description: 'Build meteor client files.'
   settings: call: (-> settings()      ), dotsat: 1, test: 0, description: 'Settings'
   version:  call: (-> version()       ), dotsat: 0, test: 0, description: 'Print sat version'
   publish:  call: (-> publish()       ), dotsat: 0, test: 0, description: 'Publish Meteor packages.'
   coffee:   call: (-> coffee_compile()), dotsat: 1, test: 0, description: 'Watching coffee files to complie.'
   'mobile-config':  call: (-> mobile_config()  ), dotsat: 0, test: 1, description: 'Create mobile-config.js'
   'update-all':     call: (-> update_all()     ), dotsat: 0, test: 0, description: 'Update most recent npm and meteor package.' 
   'create-test':    call: (-> create_test()    ), dotsat: 0, test: 1, description: 'Create test directory.' 
   'install-mobile': call: (-> install_mobile() ), dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' 
   'npm-refresh':    call: (-> npm_refresh()    ), dotsat: 0, test: 1, description: 'Publish and update npm cubesat packages.'    
   'npm-update':     call: (-> npm_update()     ), dotsat: 0, test: 0, description: 'Update most recent cubesat npm package.'
   'npm-publish':    call: (-> npm_publish()    ), dotsat: 0, test: 1, description: 'Publish cubesat to npm'
   'npm-install':    call: (-> npm_install()    ), dotsat: 0, test: 1, description: 'Install local cubesat'
   'meteor-refresh': call: (-> meteor_refresh() ), dotsat: 1, test: 1, description: 'Publish and update meteor cubesat packages.'
   'meteor-update':  call: (-> meteor_update()  ), dotsat: 1, test: 0, description: 'Update most recent meteor cubesat packages.'
   'meteor-publish': call: (-> meteor_publish() ), dotsat: 0, test: 1, description: 'Publish cubesat to meteor'

options =
   t: full: 'with-test', command: ['run', 'coffee', 'install-mobile'], description: 'Excute with test.'
   T: full: 'for-test',  command: ['run', 'coffee', 'install-mobile'], description: 'Excute for test.'

if site_path is '' and tasks[command]?.dotsat
   console.log 'fatal: "sat' + command + '" must run in .sat working directory or its subdirectory.'
   process.exit 1
site_path and site_coffees = fs.readdirSync(site_path).filter (f) -> coffee_ext is path.extname f
[home, cubesat_path, dot_cubesat_path, site_path].forEach (_path) ->
   fs.existsSync(dotenv_path = add _path, '.env') and dotenv.config path:dotenv_path
build_path        = add site_path, build_dir
index_coffee_path = add site_path, index_coffee
build_path and mobile_config_js = add build_path, 'mobile-config.js'

env  = (v) -> (_path = process.env[v]) and _path.replace /^~\//, home + '/'  # read process.env, no use
test_dir = switch 
   when with_test = argv['with-test'] and x.isString with_test then with_test 
   when tasks[command]?.test and argv._[0] then argv._[0] 
   else 'test'
test_path  = if fs.existsSync(test_path = add cubesat_path, test_dir) then test_path else undefined

nocacheRequire = (f) -> delete require.cache[f] and require f
loadSettings   = (f) -> (fs.existsSync(f) and x.return s = (nocacheRequire f).Settings, x.return s) or {}
Settings = loadSettings settings_path = add dot_cubesat_path, 'settings.coffee'
(f = (o) -> x.keys(o).forEach (k) -> if x.isObject o[k] then o[k] = f o[k] else o[k] = x.return o[k])(Settings)
settings_json =  add build_path,   'settings.json'
nconf.file file: add dot_sat_path, 'config.json'

@Theme = @Modules = {}

func2val = (f, _) -> 
   if x.isObject f
      x.keys(f).forEach (k) -> f[k] = func2val f[k], _
      f
   else if x.isFunction f then x.return f, _ 
   else f

init_settings = ->
   Settings = loadSettings settings_path
   x.assign Settings, loadSettings index_coffee_path
   func2val Settings, Settings
   (site = Settings.site) and (local = Settings.local) and local[site] and x.assign Settings, local[site]
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

__RmCoffee_paths = -> fs.readdirSync(site_path).filter((f) -> coffee_ext is path.extname f).map (f) -> add site_path, f

error  = (e) -> e and (console.error(e) or 1)
isType = (file, type) -> path.extname(file) is '.' + type  # move to x?

collectExt = (dir, ext) ->
   (fs.existsSync(dir) or '') and ((fs.readdirSync dir).map (file) -> 
      if isType(file, ext) then fs.readFileSync add dir, file else '').join '\n'

cd = (dir) -> process.chdir dir
__func = (f) -> if 'function' == typeof f then f() else true

__rmdir = (dir, f) ->
   if fs.existsSync dir
      fs.readdirSync(dir).forEach (file, index) ->
         if fs.lstatSync(curPath = add dir, file).isDirectory() then rmdir curPath else fs.unlinkSync curPath
      fs.rmdirSync dir
   x.return f
   dir

mkdir = (dir, _path, f) -> 
   _path and process.chdir _path
   dir and fs.readdir dir, (e, l) -> e and fs.mkdir dir, (e) -> e or x.return f #x.isFunction(f) and f()

compare_file = (source, target) -> false

cp = (source, target) ->
   ! compare_file(source, target) and fs.readFile source, (e, data) -> 
      error(e) or fs.readFile target, (e, data_t) ->
         e or (data.length > 0 and data.toString() != data_t.toString()) and fs.writeFile target, data, ->
            # console.log new Date(), target   

cpdir = (source, target) ->
   fs.readdir source, (e, list) -> list.map (f) ->
      if  f.match /^\./ then ''
      else if (fs.lstatSync _path = add source, f).isDirectory() then mkdir (t_f = add target, f), null, -> cpdir _path, t_f 
      else cp _path, add target, f

coffee_clean = ->
   ps.lookup command: 'node',   psargs: 'ux', (e, a) -> a.map (p) -> 
      '-wbc' == p.arguments?[3] and process.kill p.pid, 'SIGKILL'

coffee_watch = (c, js) -> spawn 'coffee', ['-o', js, '-wbc', c], stdio:'inherit'

coffee_compile = ->
   mkdir build_lib_path
   coffee_dir = [] #[site_path] 
   js_dir     = [] #[build_lib_path]
   package_paths and package_paths.map (p) ->
      coffee_dir.push add p, 'coffee'
      js_dir    .push add p, 'js'
   ps.lookup command: 'node',   psargs: 'ux', (e, a) -> a.map (p, i) -> 
      if '-wbc' == p.arguments?[3] and (c = p.arguments[4])?
         if (i = coffee_dir.indexOf(c)) <  0 then process.kill p.pid, 'SIGKILL'
         else [coffee_dir.splice(i, 1), js_dir.splice(i, 1)]
      a.length - 1 == i and coffee_dir.map (c, j) -> coffee_watch c, js_dir[j]


spawn_command = (bin, command, args, _path) -> 
   _path and cd _path
   console.log bin, command, args.join ' '
   spawn bin, [command].concat(args), stdio:'inherit'


meteor_packages_removed = 'autopublish insecure'.split ' '
meteor_packages = "service-configuration accounts-password fortawesome:fontawesome http iron:router #{cubesat_name} jquery mizzao:bootstrap-3 mizzao:jquery-ui mquandalle:jade stylus".split ' '
mobile_packages = [] #mobile meteor package

settings = ->
   init_settings()
   fs.readFile settings_json, 'utf-8', (e, data) ->
      (data is json = JSON.stringify(Settings, '', 4) + '\n') or fs.writeFile settings_json, json, (e) -> 
         console.log new Date() + ' Settings are written.'

mc_obj = (o) -> '\n' + x.keys(o).map((k) -> '   ' + k + ': "' + o[k] + '"').join (',\n') 

mcTable =
   setPreference:   list: true
   configurePlugin: list: true

strOrObj = (o) -> 
   if x.isObject(o) then '{\n' + x.keys(o).map((k) -> '   ' + k + ': "' + o[k] + '"').join(',\n') + '\n}'
   else '"' + o + '"'

mobile_config = ->
   settings()
   init_settings()
   data = x.keys(o = Settings.app).map((k) ->
      if mcTable[k]?.list then x.keys(o[k]).map((l) -> 'App.' + k + '("' + l + '", ' + strOrObj(o[k][l]) + ');').join('\n') + '\n\n'
      else if x.isArray(o[k]) then o[k].map((l) -> 'App.' + k + '("' + l + '");').join('\n') + '\n\n'
      else 'App.' + k + '({' + (mcTable[k]?.f or mc_obj)(o[k]) + '\n});\n\n'
   ).join('')
   fs.readFile mobile_config_js, 'utf-8', (e, d) ->
      d is data or fs.writeFile mobile_config_js, data, (e) -> console.log new Date() + ' ' + mobile_config_js + ' is written.'

coffee = (data) -> cs.compile '#!/usr/bin/env node\n' + data, bare:true

directives =
   jade:
      file: '1.jade'
      f: (n, b) -> b = x.indent(b, 1); "template(name='#{n}')\n#{b}\n\n"
   jade$:
      file: '2.html'
      f: (n, b) -> b = x.indent(b, 1); jade.compile( "template(name='#{n}')\n#{b}\n\n", null )()
   template:
      file: 'template.jade'
      f: (n, b) -> b = x.indent(b, 1); "template(name='#{n}')\n#{b}\n\n"
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

writeBuild = (file, data) ->
   data.length > 0 and fs.readFile fwrite = add(build_client_path, file), 'utf8', (err, d) ->
      (!d? or data != d) and fs.writeFile fwrite, data, (e) -> console.log new Date(), fwrite

fixup = (v) -> switch
   when !v? then {}
   when x.isString v then ((o = {})[v] = '') or o
   when x.isFunction v then (if x.isScalar(r = x.return v, @) then r else fixup.call @, r)
   when x.isArray  v then v.reduce ((o, w) -> x.assign o, fixup.call @, w), {}
   when x.isObject v then x.reduceKeys v, {}, (o, k) -> x.object o, k, (if x.isScalar(r = v[k]) then r else fixup.call @, r)

seperators = 
   jade:  ''
   jade$: ''

baseUnits = 
   zIndex:     ''
   fontWeight: ''

cssDefaults = (obj) ->
   return obj unless x.isObject obj
   x.keys(obj).forEach (o, k) -> o[k] = switch
      when 0 == ok then '0'
      when x.isObject(ok = obj[k]) then cssDefaults ok
      when x.isNumber ok then String(ok) + (if k of baseUnits then baseUnits[k] else 'px')
      else ok

isId    = (str) -> /^[a-z]+[0-9]+$/.test(str) and ! /^h[1-6]$/.test str
isClass = (str) -> /^_[a-z]+[a-zA-Z0-9$]*$/.test str
isIdClass = (str) -> /^[a-zA-Z0-9_$]+$/.test(str) and /_/.test str

idClassKey = (key, s='') ->
   key = (key.replace r, (m, $1) => @[x.f.id] $1) while (r=new RegExp /\[(#?[a-z_]+[0-9]+)\]/).test key
   switch
      when isId key    then ['#' + @[x.f.id] key]
      when isClass key then ['.' + x.dasherize key[1..]]
      when isIdClass key then key.split('_').map((a, i) => switch
         when '' is a   then null
         when isId a    then '#' + @[x.f.id] a
         when isClass '_' + a then '.' + x.dasherize a
         else console.error 'Unknown ID or class:', a
      ).filter((f) -> f).join s


styleKey = (obj) ->
   x.reduceKeys obj, {}, (o, k) =>
      x.object o, idClassKey.call(@, k, ' '), if x.isObject ok = obj[k] then styleKey.call @, ok else ok

toStyle = (d) -> cssDefaults styleKey.call @, fixup.call(@, @[d])

indentStyle = (obj, depth=1) ->
   return obj unless x.isObject obj 
   x.keys(obj).map((key) -> Array(depth).join(x.indentString || '  ') +  
      if x.isObject value = obj[key] then [key, indentStyle(value, depth + 1)].join '\n' else key + ' ' + value
   ).join '\n'

parseValue = (str) -> 
   return str unless x.isString str
   str.replace(/(^|[^{])\{([^{}]+)\}($|[^}])/g, (m, $1, $2, $3) ->  $1 + '{{' + $2 + '}}' + $3 ) # double quote?

key2class = (k) -> x.dasherize k[1..]

attributeClass = (key, value) ->
   if value then (value.split ' ').reverse().map((k) -> k and key2class(key) + '-' +  k).concat(key[1..]).reverse().filter((v) -> v).join ' '
   else key2class(key)
   
addAttribute = (o, attr, value, seperator=' ') ->
   x.object o, attr, if o[attr] and o[attr].length > 0 then o[attr] = [o[attr], value].join seperator else value

setAttribute = (o, attr, value) -> x.object o, attr, value

attributeParse = (obj) ->
   x.keys(p = x.reduceKeys obj, {}, (o, k) -> switch
      when isClass k    then addAttribute o, 'class', attributeClass k, obj[k]
      when 'id' is k and isId(obj[k]) and x.f.id of @ then setAttribute o, k, @[x.f.id] obj[k]
      when k is 'class' then addAttribute o, 'class', obj[k]
      else setAttribute o, k, obj[k]
   ).map((k) ->  k + '="' + parseValue(p[k]) + '"').join(' ')

attributeBracket = (obj) ->
   delete (o = x.assign {}, obj).$
   if x.isEmpty(o) then '' else '(' + attributeParse.call(@, o) + ')'

codeLine = (o, tag, obj) -> 
   isClass(_class = x.keys(obj)[0]) and x.isObject(obj[_class]) and x.remove x.assign(x.object(obj, 'class', key2class _class), obj[_class]), _class
   x.object o, tag + attributeBracket.call(@, obj), if '$' of obj then parseValue obj['$'] else ''

attributes = 'id class style src height width href size name'.split ' '
isAttribute = (obj) -> x.isObject(obj) and x.keys(obj)[0] in attributes

tagLine = (tag, obj) -> switch
   when x.isString obj  then codeLine.call @, {}, tag, $: parseValue obj
   when x.isNumber obj  then console.error 'NUMBER?'
   when x.isArray obj   then console.error 'ARRAY?'
   when isAttribute obj then codeLine.call @, {}, tag, obj
   when isClass _class = (x.keys obj)[0] then  codeLine.call @, {}, tag, obj
   when isId (keys = x.keys obj)[0] 
      keys.reduce ((o, v) => codeLine.call @, o, tag, x.object obj[v], 'id', @[x.f.id] v), {}
   else x.object {}, tag, obj

htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');
htmlTags.forEach (tag) ->  global[tag.toUpperCase()] = -> tagLine.call @, tag, arguments[0]

blazeTags = 'each if with unless'.split ' '
blazeTags.forEach (tag) -> global[tag] = -> switch 
   when x.isObject obj = arguments[0] then (o={})[tag + ' ' + (key = x.keys(obj)[0])] = obj[key]; o 
   when x.isString str = arguments[0] and x.isObject obj = arguments[1] and '$' of obj then (o={})[tag + ' ' + str] = obj.$; o
   else console.error 'Tag arguments are not (name: obj) or ("name", $: obj)'

includeAttributes = (obj) -> x.keys(obj).map((k) ->  k + '="' + parseValue(obj[k]) + '"').join(' ')

global.include = -> switch                  
   when x.isObject obj = arguments[0] then x.object {}, '+' + (k = x.keys(obj)[0]) + '(' + includeAttributes(obj[k]) + ')', ''
   when x.isString str = arguments[0]
      if (args = Array.prototype.slice.call arguments).length > 1 then args.reduce ((o, k) -> x.object o, '+' + k, ''), {}
      else x.object {}, '+' + str, ''


templateKey = (obj) ->
   return obj unless x.isObject obj
   x.reduceKeys obj, {}, (o, k) => switch
      when (isId(k) or isClass k) and isAttribute obj[k]
         x.assign o, templateKey.call @, tagLine.call @, idClassKey.call(@, k), obj[k]
      when isId(k) or isClass(k) or isIdClass k
         x.object o, idClassKey.call(@, k), if x.isObject obj[k] then templateKey.call @, obj[k] else parseValue obj[k]
      else x.object o, k, templateKey.call @, obj[k]

toTemplate = (d) ->
   return null if x.isEmpty @[d]
   str = if x.isString @[d] then @[d] else indentStyle templateKey.call @, fixup.call(@, @[d]), @[x.f.id]
   if x.isEmpty data = fixup.call @, @.eco then str else eco.render str, data

readExports = (f, kind) -> 
   x.return if index_basename is base = path.basename f, coffee_ext then (nocacheRequire f)[kind]
   else (updateRequire f)[base][kind]

build = () ->
   settings()
   spawn_command 'coffee', (if command in ['build', 'deploy'] then '-bc' else '-bcw'), ['-o', build_lib_path, site_coffees.join ' '], site_path
   mkdir build_client_path
   @Modules = site_coffees.reduce ((o, f) -> x.assign o, readExports add(site_path, f), 'Modules'), {}
   x.keys(@Modules).map (n) -> x.module n, @Modules[n] = x.return @Modules[n], x.return @Modules[n]
   x.keys(directives).map (d) -> 
      writeBuild (it = directives[d]).file, (x.return(it.header) || '') + 
         x.keys(@Modules).map((n) -> 
            @Modules[n][d] = x.return @Modules[n][d], @Modules[n]
            (b = toTemplate.call(@Modules[n], d)) and it.f.call @, n, b
         ).filter((o) -> o?).join ''
   x.keys(@Modules).map((n, i) -> @Modules[n].style and api.add toStyle.call @Modules[n], 'style')
      .concat([writeBuild 'absurd.css', api.compile()])

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

github_url = (repo) -> 'https://github.com/' + repo + '.git'

meteor_create = (dir, fn) ->
   (spawn_command 'meteor', 'create', [dir], site_path = process.cwd()).on 'exit', ->
      build_path = add site_path, dir
      (meteor_packages_removed.reduce ((f, p) -> -> (spawn_command 'meteor', 'remove', [p], build_path).on 'exit', f), ->
         (meteor_packages.concat(mobile_packages).reduce ((f, p) -> -> (spawn_command 'meteor', 'add', [p], build_path).on 'exit', f), ->
            '.html .css .js'.split(' ').map (f) -> fs.unlink add(build_path, dir + f), (e) -> error e
            x.return fn
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

meteor_update  = -> spawn_command 'meteor', 'update', [cubesat_name], build_path
npm_update     = -> spawn_command 'npm',    'update', ['--prefix', node_modules, 'cubesat']
npm_install    = -> spawn_command 'npm',    'install', ['--prefix', node_modules, '.'], cubesat_package_path
update_all     = -> meteor_update(); npm_update()
npm_refresh    = -> npm_publish()   .on 'exit', (code) -> code or npm_update()  
meteor_refresh = -> meteor_publish().on 'exit', (code) -> code or meteor_update() 

_meteor_run = (dir, port) ->     
   spawn_command 'meteor', 'run', argv._.concat(['--settings', settings_json, '--port', port or '3000']), dir or build_path

coffee_watch = (c, js) -> spawn 'coffee', ['-o', js, '-wbc', c], stdio:'inherit'


run = ->
   build()
   _meteor_run()
   argv['with-test'] and test()

deploy = ->
   build()
   spawn_command 'meteor', 'deploy', [argv._[0] or Settings.deploy.name, '--settings', settings_json], build_path

test = ->
   build()
   test_path or console.error('error: Can not find cubesat home.') or process.exit 1
   'client server lib public private resources'.split(' ').forEach (d) ->
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

install_mobile = ->
   ! site_path and ! ((wt = argv['with-test']) and test_path) and console.error "error: Run in .sat working directory or specify valid test name." or process.exit 1
   (['install-sdk', 'add-platform'].reduce ((f, c) -> 
      -> (spawn_command 'meteor', c, ['ios'], if wt then test_path else build_path).on 'exit', f), -> console.log new Date()
   )()

version = -> console.log 'version: ' + getVersion add(node_modules, 'node_modules', 'cubesat', 'package.json'), rePublish.npm
help = -> x.keys(tasks).map (k) -> console.log '  ', (k + Array(15).join ' ')[..15], tasks[k].description
init = -> ''                         # Create .cubesat $CUBESAT_PATH or ~/.cubesat. Do we NEED this?
ok   = -> console.log argv


(task = tasks[command]) and task.call()
task or help()


###
__RmLog = ->
   # node-logentries
   arguments? and ([].slice.call(arguments)).forEach (str) ->
      fs.appendFile home + '/.log.io/cake', str, (err) -> console.log err if err
__RmUpdated = 'updated time'
__RmMeteor_update = ->
   spawn_command 'meteor', 'add', [
      cubesat_name + '@' + getVersion add(cubesat_package_path, package_js), rePublish.meteor
   ], build_path 


__clean_up = ->
   rmdir build_client_path 
   rmdir build_lib_path 

__daemon = ->
   ps.lookup command: 'node',   psargs: 'ux', (e, a) -> 
      node_ps = a.map (p) -> (p.arguments?[0]?.match /\/(log\.io-[a-z]+)$/)?[1]
      'log.io-server'    in node_ps or spawn 'log.io-server',    [], stdio:'inherit'
      'log.io-harvester' in node_ps or setTimeout( ( -> spawn 'log.io-harvester', [], stdio:'inherit' ), 100 )


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

__meteor = (dir, port='3000') ->
   cd dir
   spawn 'meteor', ['--port', port, '--settings', settings_json], stdio:'inherit'
###
