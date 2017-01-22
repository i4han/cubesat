#!/usr/bin/env coffee

path     =  require 'path'
ps       =  require 'ps-node'
cs       =  require 'coffee-script'
md5      =  require 'md5'
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
{__}     =  require 'underscore2'

cs.register()
command  =  process.argv[2]
argv     =  require('minimist') process.argv[3..]

add  = path.join
home = process.env.HOME
cwd  = process.cwd()

#build_dir      = 'build'
_index_        = 'index'
coffee_ext     = '.coffee'
index_coffee   = _index_ + coffee_ext
package_js     = 'package.js'
package_json   = 'package.json'

lib_dir      = 'lib'
client_dir   = 'client'
public_dir   = 'public'
packages_dir = 'packages'
cubesat_name = 'isaac:cubesat'

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
   ok:            call: (-> ok()             ), dotsat: 0, test: 0, description: ''
   test:          call: (-> test()           ), dotsat: 1, test: 0, description: 'Test environment.'
   init:          call: (-> init()           ), dotsat: 0, test: 0, description: 'Init .cubesat. (Not implemented yet)'
   help:          call: (-> help()           ), dotsat: 0, test: 0, description: 'Help message.'
   create:        call: (-> create()         ), dotsat: 0, test: 0, description: 'Create a project.' # --repo
   run:           call: (-> run()            ), dotsat: 1, test: 0, description: 'Run meteor server.'
   deploy:        call: (-> deploy()         ), dotsat: 1, test: 0, description: 'Deploy to meteor.com.'
   build:         call: (-> build()          ), dotsat: 1, test: 0, description: 'Build meteor client files.'
   settings:      call: (-> settings()       ), dotsat: 1, test: 0, description: 'Settings'
   version:       call: (-> version()        ), dotsat: 0, test: 0, description: 'Print sat version'
   publish:       call: (-> publish()        ), dotsat: 0, test: 0, description: 'Publish Meteor packages.'
   coffee:        call: (-> coffee_compile() ), dotsat: 1, test: 0, description: 'Watching coffee files to complie.'
   mobileConfig:  call: (-> mobile_config()  ), dotsat: 0, test: 1, description: 'Create mobile-config.js'
   updateAll:     call: (-> update_all()     ), dotsat: 0, test: 0, description: 'Update most recent npm and meteor package.'
   createTest:    call: (-> create_test()    ), dotsat: 0, test: 1, description: 'Create test directory.'
   installMobile: call: (-> install_mobile() ), dotsat: 0, test: 1, description: 'Install mobile sdk and platform.'
   npmRefresh:    call: (-> npm_refresh()    ), dotsat: 0, test: 1, description: 'Publish and update npm cubesat packages.'
   npmUpdate:     call: (-> npm_update()     ), dotsat: 0, test: 0, description: 'Update most recent cubesat npm package.'
   npmPublish:    call: (-> npm_publish()    ), dotsat: 0, test: 1, description: 'Publish cubesat to npm'
   npmInstall:    call: (-> npm_install()    ), dotsat: 0, test: 1, description: 'Install local cubesat'
   meteorRefresh: call: (-> meteor_refresh() ), dotsat: 1, test: 1, description: 'Publish and update meteor cubesat packages.'
   meteorUpdate:  call: (-> meteor_update()  ), dotsat: 1, test: 0, description: 'Update most recent meteor cubesat packages.'
   meteorPublish: call: (-> meteor_publish() ), dotsat: 0, test: 1, description: 'Publish cubesat to meteor'

options =
   t: full: 'with-test', command: ['run', 'coffee', 'install-mobile'], description: 'Excute with test.'
   T: full: 'for-test',  command: ['run', 'coffee', 'install-mobile'], description: 'Excute for test.'

if site_path is '' and tasks[command]?.dotsat
   console.log 'fatal: "sat ' + command + '" must run in .sat working directory or its subdirectory.'
   process.exit 1

if site_path isnt ''
   site_coffees = fs.readdirSync(site_path).filter (f) -> coffee_ext is path.extname f
   [home, cubesat_path, dot_cubesat_path, site_path].forEach (_path) ->
      fs.existsSync(dotenv_path = add _path, '.env') and dotenv.config path:dotenv_path
   build_path        = site_path
   index_coffee_path = add site_path, index_coffee
   build_path and mobile_config_js = add build_path, 'mobile-config.js'

   env  = (v) -> (_path = process.env[v]) and _path.replace /^~\//, home + '/'  # read process.env, no use

   nocacheRequire = (f) -> delete require.cache[f] and require f
   loadSettings   = (f) -> (fs.existsSync(f) and __.return s = (nocacheRequire f).Settings, __.return s) or {}
   indexSettings  = (f) -> (fs.existsSync(f) and __.return s = (nocacheRequire f).setting, __.return s) or {}
   Settings = loadSettings settings_path = add dot_cubesat_path, 'settings.coffee'                                 # remove?
   (f = (o) -> __.keys(o).forEach (k) -> if __.isObject o[k] then o[k] = f o[k] else o[k] = __.return o[k])(Settings)

   settings_json =  add site_path,    '.settings.json'
   nconf.file file: add dot_sat_path, 'config.json'

   @Theme = @Modules = global.Parts = {}

   func2val = (f, _) ->
      if __.isObject f
         __.keys(f).forEach (k) -> f[k] = func2val f[k], _
         f
      else if __.isFunction f then __.return f, _
      else f

   init_settings = ->
      Settings = loadSettings settings_path
      __.assign Settings, indexSettings index_coffee_path
      func2val Settings, Settings
      (site = Settings.site) and (local = Settings.local) and local[site] and __.assign Settings, local[site]
      @Settings = Settings

   init_settings() # check if command, .sat and index_coffee

   client_path    = add site_path, client_dir
   lib_path       = add site_path, lib_dir

   style_path   = add site_path, 'style' # where to use? additonal style file

   lib_files    = __.toArray Settings.lib_files
   my_packages  = __.toArray Settings.packages
   public_files = __.toArray Settings.public_files

test_dir = switch
   when with_test = argv['with-test'] and __.isString with_test then with_test
   when tasks[command]?.test and argv._[0] then argv._[0]
   else 'test'
test_path  = if fs.existsSync(test_path = add cubesat_path, test_dir) then test_path else undefined

if test_path
   test_client_path   = add test_path, client_dir
   test_lib_path      = add test_path, lib_dir
   test_public_path   = add test_path, public_dir
   test_packages_path = add test_path, packages_dir
   cubesat_package_path   = add test_packages_path, cubesat_name
   #package_paths = my_packages.map (p) -> add test_packages_path, p

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
   __.return f
   dir

mkdir = (dir, _path, f) ->
   _path and process.chdir _path
   dir and fs.readdir dir, (e, l) -> e and fs.mkdir dir, (e) -> e or __.return f #__.isFunction(f) and f()

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

fix_later__coffee_compile = ->
   mkdir lib_path
   coffee_dir = [] #[site_path]
   js_dir     = [] #[lib_path]
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

mc_obj = (o) -> '\n' + __.keys(o).map((k) -> '   ' + k + ': "' + o[k] + '"').join (',\n')

mcTable =
   setPreference:   list: true
   configurePlugin: list: true

strOrObj = (o) ->
   if __.isObject(o) then '{\n' + __.keys(o).map((k) -> '   ' + k + ': "' + o[k] + '"').join(',\n') + '\n}'
   else '"' + o + '"'

mobile_config = ->
   settings()
   init_settings()
   data = __.keys(o = Settings.app).map((k) ->
      if mcTable[k]?.list then __.keys(o[k]).map((l) -> 'App.' + k + '("' + l + '", ' + strOrObj(o[k][l]) + ');').join('\n') + '\n\n'
      else if __.isArray(o[k]) then o[k].map((l) -> 'App.' + k + '("' + l + '");').join('\n') + '\n\n'
      else 'App.' + k + '({' + (mcTable[k]?.f or mc_obj)(o[k]) + '\n});\n\n'
   ).join('')
   fs.readFile mobile_config_js, 'utf-8', (e, d) ->
      d is data or fs.writeFile mobile_config_js, data, (e) -> console.log new Date() + ' ' + mobile_config_js + ' is written.'

coffee = (data) -> cs.compile '#!/usr/bin/env node\n' + data, bare:true

directives =
   jade:
      file: '1.jade'
      f: (n, b) -> b = __.indent(b, 1); "template(name='#{n}')\n#{b}\n\n"
   jade$:
      file: '2.html'
      f: (n, b) -> b = __.indent(b, 1); jade.compile( "template(name='#{n}')\n#{b}\n\n", null )()
   template$:
      file: 'template.html'
      f: (n, b) -> b = __.indent(b, 1); "<template name=\"#{n}\">\n#{b}\n</template>\n\n\n"
   HTML:
      file: '3.html'
      f: (n, b) -> b = __.indent(b, 1); "<template name=\"#{n}\">\n#{b}\n</template>\n"
   head:
      file: 'head.html'
      header: -> '<head>\n'     #  'doctype html\n' has not yet suppored
      footer: -> '</head>\n'    #  'doctype html\n' has not yet suppored
      f: (n, b) -> __.indent(b, 1) + '\n'
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


writeBuild = (it, data) ->
   if __.isUndefined(data) or (__.isString(data) and data.length is 0)
      fs.unlink add(client_path, it.file), (e) -> e or console.log (new Date) + ' ' + it.file + ' has removed'
   else fs.readFile fwrite = add(client_path, it.file), 'utf8', (err, d) ->
      data = (it.header || '') + data + (it.footer || '')
      (!d? or data != d) and fs.writeFile fwrite, data, (e) -> console.log new Date(), fwrite

fixup = (v) -> switch
   when !v? then {}
   when __.isString   v then __.object {}, v, ''
   when __.isFunction v then (if __.isScalar(r = __.return v, @) then r else fixup.call @, r)
   when __.isArray    v then v.reduce ((o, w) -> __.assign o, fixup.call @, w), {}
   when __.isObject   v then __.reduceKeys v, {}, (o, k) =>
      if '$' is k[0] and k of Parts then __.assign o, fixup.call @, Parts[k].call @, v[k]
      else __.object o, k, (if __.isScalar(r = v[k]) then r else fixup.call @, r)

seperators =
   jade:  ''
   jade$: ''

baseUnits =
   zIndex:     ''
   fontWeight: ''

newTab = '_'

cssDefaults = (obj) ->
   return obj unless __.isObject obj
   __.keys(obj).forEach (k) -> obj[k] = switch
      when 0 is ok = obj[k] then '0'
      when __.isObject ok then cssDefaults ok
      when __.isNumber ok then String(ok) + (if k of baseUnits then baseUnits[k] else 'px')
      else ok
   obj

idClassKey = (key, s='') ->
   (key = key.replace r, (m, $1) => __.key2id.call @, $1) while (r=new RegExp /\[(#?[a-z]+[0-9]+)\]/).test key
   switch
      when __.check 'id', key    then '#' + __.key2id.call @, key
      when __.check 'class', key then '.' + __.key2class key
      when __.check 'id&class', key then key.split('_').map((a, i) => switch
            when '' is a   then null
            when __.check 'id', a    then '#' + __.key2id.call @, a
            when __.check 'class', '_' + a then '.' + __.key2class a
            else console.error 'Unknown ID or class:', a
         ).filter((f) -> f).join s
      else key

styleMediaQuery = (k) -> k

styleLoop = (obj) -> __.reduceKeys obj, {}, (o, k) => switch
   when k[0] is '@' then __.object o, styleMediaQuery(k), styleLoop.call @, obj[k]
   when k of Parts then __.assign o, Parts[k].call @, obj[k]
   when k isnt idk = idClassKey.call(@, k) then __.object o, idk, obj[k]
   else __.object o, k, obj[k]


toStyle = (d) -> cssDefaults __.reduceKeys (obj = fixup.call @, @[d]), {}, (o, k) =>
   __.object o, idClassKey.call(@, k, ' '),  styleLoop.call @, obj[k]

indentStyle = (obj, depth=1) ->
   return obj unless __.isObject obj
   __.keys(obj).map((key) -> Array(depth).join(__.indentString || '  ') +
      if __.isObject value = obj[key] then [key, indentStyle(value, depth + 1)].join '\n' else key + ' ' + value
   ).join '\n'

attributeClass = (key, value) -> if value then value.replace /\*/g, __.key2class key else __.key2class key

addAttribute = (o, attr, value, seperator=' ') ->
   __.object o, attr, if o[attr] and o[attr].length > 0 then o[attr] + seperator + value else value

attributeParse = (obj, seperator, fixKeys=true) ->
   __.keys(p = __.reduceKeys obj, {}, (o, k) -> switch
      when __.check 'class', k  then addAttribute o, 'class', attributeClass k, obj[k]
      when 'id' is k and __.check('id', obj[k]) and __.isModule(@) then __.object o, 'id', __.key2id.call @, obj[k]
      when k is 'class' then addAttribute o, 'class', obj[k]
      else __.object o, (if fixKeys then __.key2attribute(k) else k), obj[k]
   ).map((k) -> switch
      when '' is p[k] then k
      when __.isBoolean p[k] then k + '=' + p[k]
      else k + '="' + __.parseValue(p[k]) + '"'
   ).filter((v) -> v).join(seperator or ' ')

attributeBracket = (obj) ->
   delete (o = __.assign {}, obj)[newTab]
   if __.isEmpty(o) then '' else '(' + attributeParse.call(@, o) + ')'


codeLine = (o, tag, obj) ->
   __.check('class',_class = __.theKey obj) and __.isObject(obj[_class]) and __.remove __.assign(__.object(obj, 'class', __.key2class _class), obj[_class]), _class
   __.object o, tag + attributeBracket.call(@, obj), if newTab of obj then __.parseValue obj[newTab] else ''


attributes = (obj) ->
   delete (o = __.assign {}, obj)[newTab]
   if __.isEmpty(o) then '' else ' ' + attributeParse.call(@, o)

ionAttributes = (o) -> if __.isEmpty(o) then '' else ' ' + attributeParse(o, ' ', false)

htmlNoEndTags = 'area base br col command embed hr img input link meta param source'.split(' ')

codeStr = (tag, obj) ->
   __.check('class',_class = __.theKey obj) and __.isObject(obj[_class]) and __.remove __.assign(__.object(obj, 'class', __.key2class _class), obj[_class]), _class
   '<' + tag + attributes.call(@, obj) + '>' + (if newTab of obj then '\n' + __.indent(__.parseValue obj[newTab]) + '\n' else '') + (if tag in htmlNoEndTags then '' else '</' + tag + '>') + ''

htmlAttributes = 'id class style src height width href size name'.split ' '
isHtmlAttribute = (obj) -> __.isObject(obj) and __.theKey(obj) in htmlAttributes

tagLine = (tag, obj, str) ->
   __.isObject(obj) and obj = fixup.call @, obj
   args = ([].slice.call arguments)[2..]
   str and __.object obj, newTab, if args.length is 1 then args[0] else args.join '\n'
   switch
      when __.isString obj  then codeStr.call @, tag, __.object {}, newTab, __.parseValue obj
      when __.isNumber obj  then console.error 'NUMBER?'
      when __.isArray obj   then console.error 'ARRAY?'
      when __.check('attribute', k = (keys = __.keys obj)[0]) or __.check 'class', k then codeStr.call @, tag, obj
      when __.check('id', k) and newTab in keys then codeStr.call @, tag, __.object obj[k], ['id', __.key2id.call @, k], [newTab, obj[newTab]]
      when __.check 'id', k
         __.keys(obj[k]).forEach (kk) -> __.check('id', kk) and __.object obj, kk, __.pop obj[k][kk]
         __.reduceKeys obj, '', (o, v) => o + codeStr.call @, tag, __.object obj[v], 'id', __.key2id.call @, v
      else console.error 'Unknown TAG', tag, obj #__.object {}, tag, obj

_tagLine = (tag, obj, str) ->
   __.isObject(obj) and obj = fixup.call @, obj
   args = ([].slice.call arguments)[2..]
   str and __.object obj, newTab, if args.length is 1 then args[0] else args
   switch
      when __.isString obj  then codeLine.call @, {}, tag, __.object {}, newTab, __.parseValue obj
      when __.isNumber obj  then console.error 'NUMBER?'
      when __.isArray obj   then console.error 'ARRAY?'
      when __.check('attribute', k = (keys = __.keys obj)[0]) or __.check 'class', k then codeLine.call @, {}, tag, obj
      when __.check('id', k) and newTab in keys then codeLine.call @, {}, tag, __.object obj[k], ['id', __.key2id.call @, k], [newTab, obj[newTab]]
      when __.check 'id', k
         __.keys(obj[k]).forEach (kk) -> __.check('id', kk) and __.object obj, kk, __.pop obj[k][kk]
         __.reduceKeys obj, {}, (o, v) => codeLine.call @, o, tag, __.object obj[v], 'id', __.key2id.call @, v
      else console.error 'Unknown TAG', tag, obj #__.object {}, tag, obj

global.blaze  = {}
global.ionic  = {}
global.sat    = {}
global.html   = {}

block = (obj) -> __.indent indentStyle fixup obj

site_path and do ->
   htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');

   htmlTags.forEach (tag) ->  html[tag.toUpperCase()] = ->
      tagLine.apply (args = [].slice.call arguments)[0], [tag].concat args[1..]

   #['contentFor']  .forEach (tag) -> router[tag] = (_, obj) -> '{{#' + tag + ' "' + (key = __.theKey obj) + '"}}\n' + block(obj[key]) + '\n{{/' + tag + '}}'
   ['Each', 'With'].forEach (tag) -> blaze[tag]  = (_, obj) -> '{{#' + tag + ' '  + (key = __.theKey obj) + '}}\n'  + block(obj[key]) + '\n{{/' + tag + '}}'
   ['If', 'Unless'].forEach (tag) -> blaze[tag]  = (_, obj) -> '{{#' + tag + ' '  + (key = __.theKey obj) + '}}\n'  + block(obj[key]) + ''
   ['Else']        .forEach (tag) -> blaze[tag]  = (_, obj) -> '{{#' + tag + '}}'
   ionBlockTags = 'Body Content FooterBar HeaderBar Item List Modal NavView Pane Popover Radio SideMenu SideMenuContent SideMenus Slide SlideBox SubfooterBar SubheaderBar Tabs View'.split ' '
   ionBlockTags.forEach (tag) -> ionic[tag] = (_, obj) ->
      args = [].slice.call arguments
      switch
         when __.isObject obj then '{{#' + 'ion' + tag + attributes(obj) + '}}\n' + __.indent(args[2..].join '\n') + '\n{{/' + 'ion' + tag + '}}'
         else '{{#' + 'ion' + tag + '}}\n' + __.indent(args[1..].join '\n') + '\n{{/' + 'ion' + tag + '}}'
   ionInsertTags = 'Icon NavBar NavBackButton Popup Tab'.split ' '
   ionInsertTags.forEach (tag) -> ionic[tag] = (_, obj) ->
      switch
         when __.isObject    obj then '{{> ' + 'ion' + tag + ionAttributes(obj) + '}}'
         else '{{> ' + 'ion' + tag + '}}'

   sat.Each = (_, obj) ->
      _.helpers[key = __.theKey obj]().map((a) -> obj[key].replace /_\[(\w+)\]/g, (m, $1) -> a[$1]).join('\n')

   blaze.Include = (_, obj) ->
      args = [].slice.call arguments
      switch
         when __.isObject obj then '{{> ' + (k = __.theKey obj) + includeAttributes(obj[k]) + '}}'
         when __.isString obj then '{{> ' + obj + '}}'
         else console.error 'Invalid `include` objuments', obj, args


includeAttributes = (obj) -> ' ' + __.keys(obj).map((k) ->  k + '="' + __.parseValue(obj[k]) + '"').join(' ')

toTemplateLoop = (obj) ->
   if __.isObject obj then __.reduceKeys obj, {}, (o, k) => switch
      when __.check('id', 'class', k) and isHtmlAttribute obj[k] then __.assign o, toTemplateLoop.call @, tagLine.call @, idClassKey.call(@, k), obj[k]
      when __.check 'id', 'class', k then __.object o, idClassKey.call(@, k),      toTemplateLoop.call @, obj[k]
      else __.object o, k, toTemplateLoop.call @, obj[k]
   else __.parseValue(obj)

eco = (str) -> if __.isEmpty data = fixup.call @, @.eco then str else eco.render str, data

toTemplate = (d) -> switch
   when __.isEmpty @[d]  then null
   when __.isString @[d] then eco.call @, @[d]
   when __.isObject(@[d]) or __.isArray @[d] then eco.call @, indentStyle toTemplateLoop.call @, fixup.call(@, @[d])
   else console.error "Unknown type", @[d]

readExports = (f) -> if _index_ is base = path.basename f, coffee_ext then nocacheRequire f else (nocacheRequire f)[base]

build = () ->
   settings()
   return
   #spawn_command 'coffee', (if command in ['build', 'deploy'] then '-bc' else '-bcw'), ['-o', lib_path, site_coffees.join ' '], site_path
   mkdir client_path
   @Parts = global.Parts = __.return (source = site_coffees.reduce ((o, f) -> __.assign o, readExports add site_path, f), {})['Parts']
   @Modules = __.return source['Modules']
   (mkeys = __.keys @Modules).map (n) -> __.module n, @Modules[n] = __.return @Modules[n], __.return @Modules[n]
   __.keys(directives).map (d) ->
      writeBuild (it = directives[d]),
         mkeys.map((n) ->
            @Modules[n][d] = __.return @Modules[n][d], @Modules[n]
            (b = toTemplate.call(@Modules[n], d)) and it.f.call @, n, b
         ).filter((o) -> o?).join ''
   count = 0
   mkeys.forEach (n) ->
      @Modules[n][key = 'style$'] and api.add toStyle.call @Modules[n], key
      ++count is mkeys.length and writeBuild file: 'absurd.css', api.compile()

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
            __.return fn
         )()
      )()

create = ->
   __.check('name', site = argv._[0]) or console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) or process.exit 1
   (spawn_command 'git', 'clone', [github_url(argv.repo or 'i4han/sat-init'), site]).on 'exit', (code) ->
      code and (console.error('error: Git exited with an error.') or process.exit 1)

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
   console.log test_path
   test_path or console.error('error: Can not find cubesat home.') or process.exit 1
   'client server lib public private resources'.split(' ').forEach (d) ->
      fs.unlink target = add(test_path, d), ->
         fs.existsSync(source = add build_path, d) and fs.symlink source, target, 'dir', -> console.log new Date(), source
   fs.readdir test_path, (e, list) ->
      e or list.forEach (f) -> path.extname(f) in ['.coffee', '.js'] and fs.unlink add(test_path, f)
      fs.readdir site_path, (e, list) ->
         e or list.forEach (f) -> path.extname(f) in ['.coffee'] and fs.link add(site_path, f), add(test_path, f), -> console.log new Date(), f
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
help = -> __.keys(tasks).map (k) -> console.log '  ', (__.dasherize(k) + Array(15).join ' ')[..15], tasks[k].description
init = -> ''                         # Create .cubesat $CUBESAT_PATH or ~/.cubesat. Do we NEED this?
ok   = -> console.log argv


(task = tasks[__.camelize command]) and task.call()
task or help()



__start_up = ->
   coffee_alone()
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
