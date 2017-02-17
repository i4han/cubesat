#!/usr/bin/env coffee

global.__  = {$:{}} if !__? #
exports.__ = __ if !Meteor? # for npm

__.keys      = (obj) -> Object.keys obj
__.isUndefined = (v) -> 'undefined' is typeof v
__.isFunction  = (v) -> 'function'  is typeof v
__.isString    = (v) -> 'string'    is typeof v
__.isNumber    = (v) -> 'number'    is typeof v
__.isBoolean   = (v) -> 'boolean'   is typeof v

__.isScalar = (v) -> __.isNumber(v) or __.isString(v) or __.isBoolean(v)
__.isNull   = (o) -> o is null
__.isArray     = (o) -> '[object Array]'     == Object.prototype.toString.call(o)
__.isObject    = (o) -> '[object Object]'    == Object.prototype.toString.call(o)
__.isArguments = (o) -> '[object Arguments]' == Object.prototype.toString.call(o)
__.isClient = -> 'object' is typeof window

__.hasJQueryLoaded = -> 'function' is typeof $ and $() instanceof jQuery
__.hasDOMLoaded    = (o) -> document.readyState is 'complete' or document.readyState is 'interactive'

__.isLower  = (v) -> __.isString(v) and __.check 'lower', v
__.isUpper  = (v) -> __.isString(v) and __.check 'upper', v
__.isJQuery = (o) -> __.isClient()  and 'undefined' isnt typeof $ and o instanceof $

__.isElement      = (o) -> 'undefined' isnt typeof HTMLElement and o instanceof HTMLElement
__.isHTMLTag      = (o) -> 'undefined' isnt typeof HTML.Tag    and o instanceof HTML.Tag
__.isStyleDeclaration  = (o) -> 'undefined' isnt typeof CSSStyleDeclaration and o instanceof CSSStyleDeclaration
__.__isDeclaration  = __.isStyleDeclaration
__.isMeteor = () -> 'undefined' isnt typeof Meteor

__.isMeteorServer = () -> __.isMeteor() and Meteor.isServer
__.isMeteorServer = () -> __.isMeteor() and Meteor.isClient

__.isBlazeView    = (o) -> 'undefined' isnt typeof Blaze.View  and o instanceof Blaze.View
__.isBlazeElement = (o) -> __.isHTMLTag(o) or __.isBlazeView(o) or __.isString(o)
__.isBlazeTemplateInstance = (o) -> 'undefined' isnt typeof Blaze.TemplateInstance and o instanceof Blaze.TemplateInstance
__.isLookup          = (o) -> __.isObject(o) and __.isString(o.name) and o.name[..6] is 'lookup:'
__.isBlazeAttr       = (o) -> __.isObject(o) and not __.isLookup(o) and not __.isBlazeElement o
__.isAttrPartKey     = (k) -> __.isString(k) and '$' is k[0]
__.isFunctionPartKey = (k) -> __.isString(k) and __.check 'alpha', k[0]
__.maybeMustache     = (v) -> __.isString(v) and v.indexOf('{') isnt -1 and v.indexOf('}') isnt -1
__.maybeHtmlEntity   = (v) -> __.isString(v) and v.indexOf '&#' > -1 and v.indexOf ';' > -1
__.nameBlazeView     = (o) -> __.isBlazeView(o) and 'name' of o and o.name[9..]  # Template.(profile)
__.classOf = Function.prototype.call.bind Object.prototype.toString

__.isEmptyArray  = (a)   -> a.length is 0
__.isEmptyObject = (obj) -> __.isEmptyArray __.keys obj
__.isEmpty = (obj) -> switch
   when not obj then true #in [false, null, 0, '', undefined, NaN] then true # false, null, 0, "", undefined and NaN
   when __.isJQuery(obj) then __.isEmptyArray  obj
   when __.isArray(obj)  then __.isEmptyArray  obj
   when __.isObject(obj) then __.isEmptyObject obj
   else false

__.on = (e, f) -> document.addEventListener e, f

__.isVisible = (v) -> if 'function' == typeof v then v() else if false is v then false else true
__.delay = (time, func) ->
   if Meteor? then Meteor.setTimeout func, time
   else setTimeout func, time
__.timeout = __.delay

__.reduce     = (a,   o, f) -> a.reduce f, o
__.reduceKeys = (obj, o, f) -> __.keys(obj).reduce(f, o)
__.eachKeys   = (obj, f)    -> __.keys(obj).forEach f

__.__isPortableKey = (v) -> /^[a-z]+$/i.test v  # . or '#' # remove this.
__.__isValue  = (v) -> if __.isScalar v then v else false  # deprecated.

__.module  = (_) -> switch
   when __.isBlazeTemplateInstance _ then Sat.module[__.nameBlazeView _.view]
   when __.isBlazeView _             then Sat.module[__.nameBlazeView _]

__.getLocal   = (v) -> v[6..]

checkTable =
   alpha:      (v) -> /^[a-zA-Z]+$/.test v
   lower:      (v) -> /^[a-z]+$/.test v
   upper:      (v) -> /^[A-Z]+$/.test v
   name:       (v) -> /^[a-zA-Z0-9._-]+$/.test v
   email:      (v) -> /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test v
   attribute:  (v) -> /^[a-zA-Z]+$/.test v
   id:         (v) -> /^[a-z]+[0-9]+$/.test(v) and ! /^h[1-6]$/.test v
   class:      (v) -> /^_[a-z]+[a-zA-Z0-9$]*$/.test v
   'id&class': (v) -> /^[a-zA-Z0-9_$]+$/.test(v) and /_/.test v
   digit:      (v) -> /^[0-9]+$/.test v
   local:      (v) -> /^local_/.test v

__.check = ->
   args = [].slice.call arguments
   i = 0
   while i < args.length - 1
      return args[i - 1] if checkTable[args[i++]] args[-1..][0]
   false

__.checkEventKey = (e, code) -> code is (e.KeyCode or e.which)

__.capitalize = (str) -> __.isString(str) and str[0].toUpperCase() + str[1..]
__.camelize   = (str) -> __.isString(str) and str.replace(/-([a-z])/g, (_, $1) -> $1.toUpperCase()).replace /\-/g, '$'
__.dasherize  = (str) -> __.isString(str) and str.replace(/\$/g, '-').replace /([A-Z])/g, ($1) -> '-' + $1.toLowerCase()

__.__dasherize =  (str) -> str.replace(/([A-Z])/g, "-$1").toLowerCase()   #.replace(/[-_\s]+/g, "-")
__.__toObject = (a) ->
   if    undefined == a then {}
   else if __.isObject a then a
   else if __.isString a then ((v = {})[a] = '') or v
   else if __.isArray  a then a.reduce ((o, v) -> o[v[0]] = v[1]; o), {}
   else {}

__.toArray = (str) ->
   if __.isArray str then str
   else if __.isString str then str.split ' '
   else if undefined == str then []         ##
   else str

__.__interpolate = (str, o) -> str.replace /{([^{}]*)}/g, (a, b) -> __.isValue(o[b]) or a
__.__interpolateObj = (o, data) ->
   __.keys(o).map (k) -> o[k] = __.interpolate o[k], data
   o
__.__interpolateOO = (options, data) ->
   __.isEmpty(data) or __.keys(options).map (m) -> options[m] = __.interpolateObj options[m], data
   options

__.return = (func, _this) ->
   _this = _this or @
   if __.isFunction func then func.call _this else func

__.__assign = (obj, properties) -> obj[key] = val for key, val of properties; obj # o1, o2, o3 has not implemented.
__.assign = (obj) ->
   (args = [].slice.call arguments).length > 1 and args[1..].forEach (o) -> obj[k] = v for k, v of o
   obj

__.compare = (obj, properties, except) -> __.reduceKeys properties, {}, (o, k) ->
   if except and (k in except) then o
   else
      if __.isObject(obj[k]) and __.isObject properties[k] then __.object o, k, __.compare obj[k], properties[k], except
      else (if obj[k] isnt properties[k] then __.object o, k, properties[k] else o)


__.extend = __.assign                 # deprecated.
__.remove = (obj, key) -> delete obj[key] ; obj
__.pop    = (obj, key) -> ret = obj[key]; delete obj[key]; ret
__.array  = (a, v) ->
   args = [].slice.call(arguments)
   a =  if __.isArray a then a
   else if __.isArguments(a) or __.isStyleDeclaration(a) then [].slice.call a
   else (console.log('.array error',a)) or [a]
   if v
      a = a.concat switch
         when __.isArray v then (isHeadArray = true) and v
         when __.isArguments(v) or __.isStyleDeclaration(v) then (isHeadArray = true) and [].slice.call v
         else (isHeadArray = false) or [v]
      if args.length > 2
         args[2..].reduce ((o, v) -> if isHeadArray then o.concat v else o.concat [v]), a
      else a
   else a
__.object = (obj) ->  # implemented ([[k1, v1], [k2, v2], [k3, v3]]) but not ([k1, k2, k3], [v1, v2, v3])
   args = [].slice.call arguments
   switch
      when __.isObject(obj) and __.isString args[1] then obj[args[1]] = args[2] ; obj
      when __.isObject(obj) and __.isArray  args[1] then args[1..].forEach((a) -> obj[a[0]] = a[1]) ; obj
      when __.isArray obj  then obj.reduce ((o, a) -> o[a[0]] = a[1]; o), {}

__.theKey = (obj) -> __.keys(obj)[0]

__.fixup = (v) -> switch
   when !v? then {}
   when __.isString   v then __.object {}, v, ''
   when __.isFunction v then (if __.isScalar(r = __.return.call @, v) then r else __.fixup.call @, r)
   when __.isArray    v then v.reduce ((o, w) -> __.assign o, __.fixup.call @, w), {}
   when __.isObject   v then __.reduceKeys v, {}, (o, k) =>
      if @part and '$' is k[0] and k of @part then __.assign o, __.fixup.call @, @part[k].call @, v[k]
      else __.object o, k, (if __.isScalar(r = v[k]) then r else __.fixup.call @, r)


__.__addProperty = (obj, key, value) -> __.object obj, key, value   # deprecated.

__.__value = (value) ->
   if      'number'   == typeof value then value.toString() + 'px'
   else if 'string'   == typeof value then value # (value = value.replace v,k for k,v of repcode()).pop()
   else if 'function' == typeof value then value() else value

__.__indentStyle = (obj, depth=1) ->
   return obj unless __.isObject obj
   __.keys(obj).map((key) ->
      value = obj[key]
      key = if __.isPortableKey(key) then __.dasherize(key) else key
      (Array(depth).join '    ') + switch
         when __.isObject value then [key, __.indentStyle(value, depth + 1)].join '\n'
         when '' is value      then key
         when '' is key        then __.__value value
         else key + ' ' + __.__value value
   ).join '\n'


__.hash  = ->
   ((Iron.Location.get().hash[1..].split '&').map (a) -> a.split '=').reduce ((p, c) ->  p[c[0]] = c[1]; p), {}

__.indentString = Array(3 + 1).join ' '
__.indent = (b, i=1, str) -> if i then b.replace /^/gm, Array(i + 1).join(str or __.indentString) else b
__.repeat = (str, times) -> Array(times + 1).join str
__.__saveMustache = (str) -> __.decode( __.decode( str, '{', 2 ), '}', 2 )
__.__trim = (str) -> if str? then str.trim() else null
__.__prettyJSON = (obj) -> JSON.stringify obj, null, 4
__.__getValue     = (id) -> if element = document.getElementById(id) then element.value else null
__.__trimmedValue = (id) -> if element = document.getElementById(id) then element.value.trim() else null


__.__slice = (str, tab=1, indent='    ') -> (((str.replace /~\s+/g, '').split '|').map (s) ->
   s = if 0 == s.search /^(<+)/ then s.replace /^(<+)/, Array(tab = Math.max tab - RegExp.$1.length, 1).join indent
   else if 0 == s.search /^>/ then s.replace /^>/, Array(++tab).join indent
   else s.replace /^/, Array(tab).join indent).join '\n'

__.insertTemplate = (page, id, data={}) ->
   $('#' + id).empty()
   Blaze.renderWithData(
      Template[page],
      if __.isEmpty data then Template[page].helpers else data
      document.getElementById id  )

__.currentRoute = -> Router.current().route.getName()
__.render = (page) -> Template[page].renderFunction().value

__.__renameKeys = (obj, keyObject) ->
   _.each _.keys keyObject, (key) -> __.reKey obj, key, keyObject[key]

__.rekey = (obj, oldName, newName) ->
   if obj.hasOwnProperty(oldName)
      obj[newName] = obj[oldName]
      delete obj[oldName]
   @

__.__repeat = (pattern, count) ->
   return '' if count < 1
   result = ''
   while count > 0
      result += pattern if count & 1
      count >>= 1
      pattern += pattern
   result

__.__deepExtend = (target, source) ->
   for prop of source
      if prop of target
         __.deepExtend target[prop], source[prop]
      else
         target[prop] = source[prop]
   target


__.flatten = (obj, chained_keys) ->
   toReturn = {}
   for i in obj
      if typeof obj[i] == 'object'
         flatObject = __.flatten obj[i]
         for j in flatObject
            if chained_keys
               toReturn[i+'_'+j] = flatObject[j]
            else
               toReturn[j] = flatObject[j]
      else
         toReturn[i] = obj[i]
   toReturn


__.flattenArray = (a) -> # not yet working
   __.reduce a, [], (o, v) ->
      __.array o, v, if __.isArray v then  else v

__.flattenObj = (obj, chained_keys='') ->
   __.reduceKeys obj, {}, (o, k) ->
      k = chained_key + k
      __.object o, k, if __.isObject o[k] then __.flattenObj(o[k], k) else o[k]


__.position = (obj) ->
   Meteor.setTimeout ->
      $('#'+obj.parentId+' .'+obj.class).css top:obj.top, left:obj.left, position:'absolute'
   , 200


__.scrollSpy = (obj) ->
   $$ = $ '.scrollspy'
   $$.scrollSpy()
   ['enter', 'exit'].forEach (a) ->
      $$.on 'scrollSpy:' + a, -> obj[a][$(@).attr 'id']() if obj[a]?

__.calendar = (fym, id_ym, items, top, bottom) ->
   action = if moment().format(fym) > id_ym then 'prepend' else 'append'
   $(items)[action](DIV class:'month', id:id_ym)
   moment_ym = moment(id_ym, fym)
   top = $(window).scrollTop()

   ($id = $ '#' + id_ym).append H2 id:id_ym, moment_ym.format 'MMMM YYYY'
   [1..parseInt moment_ym.startOf('month').format 'd'].forEach (i) ->
      $id.append DIV class:'everyday empty', style:'visibility:hidden'
   [1..parseInt moment_ym  .endOf('month').format 'D'].forEach (i) ->
      $id.append DIV class:'everyday', id:id = id_ym + ('0' + i)[-2..]
      __.insertTemplate 'day', id, id:id
      __.contentEditable id, (_id) ->
         id = $(_id).parent().attr 'id'
         content = $(_id).html()
         switch $(_id).attr 'class'
            when 'title'
               console.log 'title', id, content
               if doc = db.Calendar.findOne({id:id})
                  db.Calendar.update(_id:doc._id, $set:{title:content, event:doc.event})
               else
                  db.Calendar.insert id:id, title:content
            when 'event'
               console.log 'event', id, content
               if doc = db.Calendar.findOne({id:id})
                  db.Calendar.update(_id:doc._id, $set:{title:doc.title, event:content})
               else
                  db.Calendar.insert id:id, event:content
      #['title','event'].forEach (s) -> $("##{id} > .#{s}").attr 'contenteditable', 'true'
   if 'prepend' is action
      __.timeout 10, -> $(window).scrollTop top + $id.outerHeight()
      $(top   ).data id:id_ym
   else
      $(bottom).data id:id_ym

__.windowFit = (options) ->
   #console.log options.style
   if  options.style and (window_width = $(window).width()) / (window_height = $(window).height()) > options.ratio
      options.style.remove('height').set 'width', '100%'
      options.selector.css('margin-left','').css 'margin-top', px (window_height - options.selector.height())/2
   else if options.style
      options.style.remove('width').set 'height', '100%'
      options.selector.css('margin-top','').css 'margin-left', px (window_width  - options.selector.width() )/2

__.query = -> Iron.Location.get().queryObject
__.addQuery = (obj) ->
   return '' if (! obj?) or __.isEmpty obj
   if (result = __.queryString obj).length > 0 then '?' + result else ''
__.queryString = (obj, delimeter='&') ->
   (encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]) for i of obj).join delimeter
__.decode = (str, code, repeat) ->
   decode = encodeURIComponent code
   str.replace( new RegExp("(?:#{decode}){#{repeat}}(?!#{decode})", 'g'), __.repeat(code, repeat))
__.urlWithQuery = (obj) -> obj.url + __.addQuery obj.options.query

__.oauth = (obj) ->
   __.isString(obj) and obj = Settings[obj].oauth
   __.urlWithQuery obj


__.__list = (what) -> # add id
   ((what = if 'string' == typeof what then what.split ' '
   else if Array.isArray(what) then what else [])
      .map (a) -> ".#{a} {{#{a}}}").join '\n'

__.sidebar = (list, id='sidebar_menu') ->
   list: list
   jade: 'each items': '+menu_list': ''
   helpers: items: -> list.map (a) -> { name:a, id:id } # ̵̵̵correct - id must unique.

__.assignPopover = (o, v) ->
   __.assign o, 'focus input#' + v, ->
      $('input#'+v)
         .attr('data-content', __.render 'popover_'+v)
         .popover 'show'

__.popover = (list) -> list.reduce ((o, v) -> __.assignPopover o, v), {}


__.log = ->
   (arguments != null) and ([].slice.call(arguments)).concat(['\n']).map (str) ->
      if Meteor.isServer then fs.appendFileSync Config.log_file, str + ' ' # fs? server?
      else console.log str


__idClassKey = (key, fid, seperator) ->
   key = (key.replace r, (m, $1) -> fid $1) while (r=new RegExp /\[(#?[a-z_]+[0-9]+)\]/).test key
   return key unless (/^[a-zA-Z0-9_$]+$/.test(key) and /[0-9_$]+/.test key)
   key.split('_').map((a, i) -> switch
      when ''  == a    then null
      when /^[a-z_]+[0-9]+$/.test a then '#' + fid a
      when 0 == i  then a  # if not id then HTML
      else '.' + __.dasherize a
   ).filter((f) -> f).join seperator

__.__tideKey = (obj, fid, seperator) ->
   return obj unless __.isObject obj
   __.keys(obj).reduce ((o, k) -> switch
      when '$' == k[0] then commandKey o, k
      when /^[A-Z]+$/.test(k) or /^H[1-6]$/.test k then htmlKey o, k
      else
         o[idClassKey k, fid, seperator] = if __.isObject(ok = obj[k]) then __.tideKey ok, fid, seperator else ok
         o
   ), {}


__tideEventKey = (key, fid) ->
   key = (key.replace re, (m, $1, $2, $3) -> $1+fid($2)+$3) while (re = new RegExp /(\s+)_\[(#[a-z_]+[0-9]+)\](,|\s+|$)/).test key
   key

__.tideEventKey = (obj, fid) -> __.reduceKeys obj, {}, (o, k) ->
   __.object o, k.replace(/(\s+)\{\s*local\s+(#?)([a-z_]+[0-9]+)\s*\}(,|\s+|$)/g, (m, $1, $2, $3, $4) -> $1 + $2 + fid($3) + $4), obj[k]


__NotPxDefaultProperties = 'zIndex fontWeight'.split ' '

__.__tideValue = (obj) ->                 # cssDefaults, move to sat.coffee
   return obj unless __.isObject obj
   __.keys(obj).reduce ((o, k) ->
      o[k] = switch
         when __.isObject(ok = obj[k]) then __.tideValue ok
         when 0 == ok then '0'
         when 'number' == typeof ok then String(ok) +
            (if k in NotPxDefaultProperties then '' else 'px')
         else ok
      o), {}
"""
class __.Module
   constructor: (name) ->
      @name = name
   id: (str) ->
      if str.indexOf(' ') > -1 then str.split(' ').map (s) =>
         '#' + window.Module[@name].block + '-' + @name + '-' + s
      else '#' + window.Module[@name].block + '-' + @name + '-' + str
   _instance: (i) -> @instance = i
"""
__localTags = (f, m) ->
   (tags = f.toString().match /(this\.H[1-6]|this\.[A-Z]+)[^\w]/g) and
   tags.map((tag) -> tag.match(/[A-Z]+[1-6]?/)[0]).forEach (tag) ->  m[tag] = global[tag].bind(m)

__.parseValue = (str) ->
   return str unless __.isString str
   str.replace(/(^|[^{])\{([^{}]+)\}($|[^}])/g, (m, $1, $2, $3) ->  $1 + '{{' + $2 + '}}' + $3 ) # escape double quote?


__.key2class = (k) -> __.dasherize k[1..]
__.key2id    = (k) -> if k and 'local' of @ then @local k else ''
__.key2attribute = (k) -> __.dasherize k

__.__module = (name, m) -> #(i = new __.Module(name))._instance i
   m.name  = name
   m.title = m.label = m.label or m.title or __.capitalize name
   m.block = m.block or 'x'
   (m.fn = __.return m.fn, m) and __.keys(m.fn).forEach (f) -> m[f] = m.fn[f]

   m.local = m.fn and m.fn.local or (id) ->
      uniqueName = name + if m.hash then '-' + m.hash else ''
      if id[0] is '#' then '#' + uniqueName + '-' + id[1..] else uniqueName + '-' + id

__.isModule = (m) -> __.isObject(m) and 'local' of m and 'label' of m


baseUnits =
   zIndex:     ''
   fontWeight: ''

__.cssValue = (k, v) -> switch
   when 0 is v then '0'
   when __.isNumber v then String(v) + (if v of baseUnits then baseUnits[k] else 'px')
   else v

###
class __.Style
   constructor: (selector) ->
      @selector = selector
      @rules = @style = null
      [0..(sheets = document.styleSheets).length - 1].forEach (i) =>
         sheets?[i]?.cssRules? and [0..(rules = sheets[i].cssRules).length - 1].forEach (j) =>
            if rules[j] and rules[j].selectorText == selector
               @rules = rules[j]
               @style = rules[j].style
   get: (property)        -> @style[property]
   set: (property, value) ->
      if __.isObject property then __.eachKeys property, (k) => @set k, property[k]
      else
         console.log property, value
         value = __.cssValue property, value
         if value is '' then (@style[property] and @style.removeProperty property)
         else @style.setProperty(property, value)
      @
###
__.removeRule = (selector, property) ->
   [0..(sheets = document.styleSheets).length - 1].forEach (i) ->
      sheets?[i]?.cssRules? and [0..(rules = sheets[i].cssRules).length - 1].forEach (j) ->
         if rules[j] and rules[j].selectorText == selector
            if __.isArray(property)
               property.map (p) -> rules[j].style.removeProperty p
            else
               rules[j].style.removeProperty property
__.insertRule  = (rule, index = 0) ->
   console.log window.cube.stylesheet
   if window.cube.stylesheet.insertRule then window.cube.stylesheet.insertRule rule, index else window.cube.stylesheet.addRule rule

__.removeMultipleRules = (obj) ->
   __.isObject(obj) and __.keys(obj).forEach (k) ->
      if __.isArray obj[k] then obj[k].forEach (p) -> __.removeRule k, p
      else __.removeRule k, obj[k]
