#!/usr/bin/env coffee

global.x  = {$:{}} if !x? # 
exports.x = x if !Meteor? # for npm

x.require = (m) -> Npm.require m

x.keys   = (obj) -> Object.keys obj
x.isUndefined = (v) -> 'undefined' is typeof v
x.isFunction  = (v) -> 'function'  is typeof v
x.isString    = (v) -> 'string'    is typeof v   # and v.length > 0
x.isNumber    = (v) -> 'number'    is typeof v
x.isScalar    = (v) -> x.isNumber(v) or x.isString(v)

x.isDigit = (v) -> /^[0-9]+$/.test v

x.isArray  = (o) -> if '[object Array]'  == Object.prototype.toString.call(o) then true else false
x.isObject = (o) -> if '[object Object]' == Object.prototype.toString.call(o) then true else false

x.isEmptyArray  = (a) -> a.length is 0
x.isEmptyObject = (obj) -> x.isEmptyArray x.keys obj
x.isEmpty = (obj) -> switch
    when obj in [undefined, null, ''] then true
    when x.isArray(obj)  then x.isEmptyArray obj
    when x.isObject(obj) then x.isEmptyObject obj
    else false

x.isVisible = (v) -> if 'function' == typeof v then v() else if false is v then false else true
x.timeout = (time, func) -> Meteor.setTimeout func, time

x.reduce     = (a,   o, f) -> a.reduce f, o
x.reduceKeys = (obj, o, f) -> x.keys(obj).reduce(f, o)

x.__isPortableKey = (v) -> /^[a-z]+$/i.test v  # . or '#' # remove this.
x.__isValue  = (v) -> if x.isScalar v then v else false  # deprecated.


valid =
    name: /^[a-zA-Z0-9._-]+$/
    email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
    attribute: /^[a-zA-Z]+$/
x.valid = (kind, v) -> valid[kind].test v


x.capitalize = (str) -> str[0].toUpperCase() + str[1..]
x.camelize  = (str) ->  str.replace(/-([a-z])/g, (_, $1) -> $1.toUpperCase()).replace /\-/g, '$' 
x.dasherize = (str) ->  str.replace(/\$/g, '-').replace /([A-Z])/g, ($1) -> '-' + $1.toLowerCase()

x.__dasherize =  (str) -> str.replace(/([A-Z])/g, "-$1").toLowerCase()   #.replace(/[-_\s]+/g, "-")    
x.__toObject = (a) ->
    if    undefined == a then {}
    else if x.isObject a then a
    else if x.isString a then ((v = {})[a] = '') or v 
    else if x.isArray  a then a.reduce ((o, v) -> o[v[0]] = v[1]; o), {}
    else {}

x.toArray = (str) -> 
    if x.isArray str then str 
    else if x.isString str then str.split ' ' 
    else if undefined == str then []         ##
    else str

x.__interpolate = (str, o) -> str.replace /{([^{}]*)}/g, (a, b) -> x.isValue(o[b]) or a
x.__interpolateObj = (o, data) -> 
    x.keys(o).map (k) -> o[k] = x.interpolate o[k], data
    o
x.__interpolateOO = (options, data) ->
    x.isEmpty(data) or x.keys(options).map (m) -> options[m] = x.interpolateObj options[m], data
    options

x.return = (func, _this_) -> if x.isFunction func then func.call _this_ else func

x.__assign = (obj, properties) -> obj[key] = val for key, val of properties; obj # o1, o2, o3 has not implemented.
x.assign = (obj) ->  
    (args = [].slice.call arguments).length > 1 and args[1..].forEach (o) -> obj[k] = v for k, v of o
    obj

x.extend = x.assign                 # deprecated.
x.remove = (obj, key) -> delete obj[key] ; obj
x.object = (obj) ->  # implemented ([[k1, v1], [k2, v2], [k3, v3]]) but not ([k1, k2, k3], [v1, v2, v3])
    args = [].slice.call arguments
    switch
        when x.isObject obj then obj[args[1]] = args[2] ; obj
        when x.isArray obj  then obj.reduce ((o, a) -> o[a[0]] = a[1]; o), {}

x.__addProperty = (obj, key, value) -> x.object obj, key, value   # deprecated.

x.__value = (value) ->
    if      'number'   == typeof value then value.toString() + 'px'
    else if 'string'   == typeof value then value # (value = value.replace v,k for k,v of repcode()).pop()
    else if 'function' == typeof value then value() else value

x.__indentStyle = (obj, depth=1) ->
    return obj unless x.isObject obj 
    x.keys(obj).map((key) ->
        value = obj[key]
        key = if x.isPortableKey(key) then x.dasherize(key) else key
        (Array(depth).join '    ') + switch 
            when x.isObject value then [key, x.indentStyle(value, depth + 1)].join '\n'
            when '' is value      then key
            when '' is key        then x.value value
            else key + ' ' + x.value value
    ).join '\n'


x.hash  = -> 
    ((Iron.Location.get().hash[1..].split '&').map (a) -> a.split '=').reduce ((p, c) ->  p[c[0]] = c[1]; p), {}

x.indentString = Array(3 + 1).join ' ' 
x.indent = (b, i, str) -> if i then b.replace /^/gm, Array(i + 1).join(str or x.indentString) else b
x.repeat = (str, times) -> Array(times + 1).join str
x.__saveMustache = (str) -> x.decode( x.decode( str, '{', 2 ), '}', 2 )
x.__trim = (str) -> if str? then str.trim() else null
x.__prettyJSON = (obj) -> JSON.stringify obj, null, 4
x.__getValue     = (id) -> if element = document.getElementById(id) then element.value else null
x.__trimmedValue = (id) -> if element = document.getElementById(id) then element.value.trim() else null


x.__slice = (str, tab=1, indent='    ') -> (((str.replace /~\s+/g, '').split '|').map (s) ->
    s = if 0 == s.search /^(<+)/ then s.replace /^(<+)/, Array(tab = Math.max tab - RegExp.$1.length, 1).join indent 
    else if 0 == s.search /^>/ then s.replace /^>/, Array(++tab).join indent 
    else s.replace /^/, Array(tab).join indent).join '\n'

x.insertTemplate = (page, id, data={}) ->
    $('#' + id).empty()
    Blaze.renderWithData(
        Template[page], 
        if Object.keys(data).length then data else Template[page].helpers 
        document.getElementById id  )

x.currentRoute = -> Router.current().route.getName()
x.render = (page) -> Template[page].renderFunction().value

x.__renameKeys = (obj, keyObject) ->
    _.each _.keys keyObject, (key) -> x.reKey obj, key, keyObject[key]

x.rekey = (obj, oldName, newName) ->
    if obj.hasOwnProperty(oldName)
        obj[newName] = obj[oldName]
        delete obj[oldName]
    @

x.__repeat = (pattern, count) ->
    return '' if count < 1
    result = ''
    while count > 0
        result += pattern if count & 1
        count >>= 1
        pattern += pattern
    result

x.__deepExtend = (target, source) ->
    for prop of source
        if prop of target
            x.deepExtend target[prop], source[prop]
        else
            target[prop] = source[prop]
    target


x.flatten = (obj, chained_keys) ->
    toReturn = {}       
    for i in obj
        if typeof obj[i] == 'object'
            flatObject = x.flatten obj[i]
            for j in flatObject
                if chained_keys
                    toReturn[i+'_'+j] = flatObject[j]
                else
                    toReturn[j] = flatObject[j]
        else
            toReturn[i] = obj[i]
    toReturn

x.position = (obj) ->
    Meteor.setTimeout ->
        $('#'+obj.parentId+' .'+obj.class).css top:obj.top, left:obj.left, position:'absolute'
    , 200


x.scrollSpy = (obj) ->
    $$ = $ '.scrollspy'
    $$.scrollSpy()
    ['enter', 'exit'].forEach (a) ->
        $$.on 'scrollSpy:' + a, -> obj[a][$(@).attr 'id']() if obj[a]?

x.calendar = (fym, id_ym, items, top, bottom) ->
    action = if moment().format(fym) > id_ym then 'prepend' else 'append'
    $(items)[action](DIV class:'month', id:id_ym)
    moment_ym = moment(id_ym, fym)
    top = $(window).scrollTop()

    ($id = $ '#' + id_ym).append H2 id:id_ym, moment_ym.format 'MMMM YYYY'    
    [1..parseInt moment_ym.startOf('month').format 'd'].forEach (i) ->
        $id.append DIV class:'everyday empty', style:'visibility:hidden'
    [1..parseInt moment_ym  .endOf('month').format 'D'].forEach (i) ->        
        $id.append DIV class:'everyday', id:id = id_ym + ('0' + i)[-2..]
        x.insertTemplate 'day', id, id:id
        x.contentEditable id, (_id) ->
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
        x.timeout 10, -> $(window).scrollTop top + $id.outerHeight()
        $(top   ).data id:id_ym
    else
        $(bottom).data id:id_ym

x.windowFit = (options) ->
    #console.log options.style
    if  options.style and (window_width = $(window).width()) / (window_height = $(window).height()) > options.ratio
        options.style.remove('height').set 'width', '100%'               
        options.selector.css('margin-left','').css 'margin-top', px (window_height - options.selector.height())/2
    else if options.style
        options.style.remove('width').set 'height', '100%'
        options.selector.css('margin-top','').css 'margin-left', px (window_width  - options.selector.width() )/2

x.query = -> Iron.Location.get().queryObject
x.addQuery = (obj) ->
    return '' if (! obj?) or x.isEmpty obj
    if (result = x.queryString obj).length > 0 then '?' + result else ''
x.queryString = (obj, delimeter='&') ->
    (encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]) for i of obj).join delimeter
x.decode = (str, code, repeat) -> 
    decode = encodeURIComponent code
    str.replace( new RegExp("(?:#{decode}){#{repeat}}(?!#{decode})", 'g'), x.repeat(code, repeat))
x.urlWithQuery = (obj) -> obj.url + x.addQuery obj.options.query

x.oauth = (obj) ->
    x.isString(obj) and obj = Settings[obj].oauth
    x.urlWithQuery obj


x.__list = (what) -> # add id
    ((what = if 'string' == typeof what then what.split ' ' 
    else if Array.isArray(what) then what else [])
        .map (a) -> ".#{a} {{#{a}}}").join '\n'

x.sidebar = (list, id='sidebar_menu') ->
    list: list
    jade: 'each items': '+menu_list': ''
    helpers: items: -> list.map (a) -> { name:a, id:id } # ̵̵̵correct - id must unique.

x.assignPopover = (o, v) -> 
    x.assign o, 'focus input#' + v, -> 
        $('input#'+v)
            .attr('data-content', x.render 'popover_'+v)
            .popover 'show' 

x.popover = (list) -> list.reduce ((o, v) -> x.assignPopover o, v), {}


x.log = ->
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
        else '.' + x.dasherize a
    ).filter((f) -> f).join seperator

x.__tideKey = (obj, fid, seperator) ->
    return obj unless x.isObject obj
    x.keys(obj).reduce ((o, k) -> switch
        when '$' == k[0] then commandKey o, k
        when /^[A-Z]+$/.test(k) or /^H[1-6]$/.test k then htmlKey o, k
        else 
            o[idClassKey k, fid, seperator] = if x.isObject(ok = obj[k]) then x.tideKey ok, fid, seperator else ok
            o
    ), {}


tideEventKey = (key, fid) ->
    key = (key.replace re, (m, $1, $2, $3) -> $1+fid($2)+$3) while (re = new RegExp /(\s+)\[(#[a-z_]+[0-9]+)\](,|\s+|$)/).test key
    key

x.tideEventKey = (obj, fid) -> x.keys(obj).reduce ((o, k) -> x.object o, tideEventKey(k, fid), obj[k]), {}


NotPxDefaultProperties = 'zIndex fontWeight'.split ' '

x.__tideValue = (obj) ->                 # cssDefaults, move to sat.coffee
    return obj unless x.isObject obj
    x.keys(obj).reduce ((o, k) ->
        o[k] = switch
            when x.isObject(ok = obj[k]) then x.tideValue ok
            when 0 == ok then '0'
            when 'number' == typeof ok then String(ok) + 
                (if k in NotPxDefaultProperties then '' else 'px')
            else ok
        o), {}
"""
class x.Module
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

x.f = id: 'Id'

x.module = (name, m) -> #(i = new x.Module(name))._instance i
    m.name  = name
    m.label = m.label or x.capitalize name
    m.block = m.block or 'x'
    (m.fn = x.return m.fn, m) and x.keys(m.fn).forEach (f) -> m[f] = m.fn[f] 
    m[x.f.id] = m.fn and m.fn[x.f.id] or (id) -> if id[0] is '#' then '#' + name + '-' + id[1..] else name + '-' + id
    #m.template and localTags m.template, m

x.isModule = (m) -> x.isObject(m) and x.f.id of m and 'label' of m

class x.Style
    constructor: (selector) ->
        @selector = selector
        @rules = @style = null 
        [0..(sheets = document.styleSheets).length - 1].forEach (i) => 
            sheets?[i]?.cssRules? and [0..(rules = sheets[i].cssRules).length - 1].forEach (j) =>
                if rules[j] and rules[j].selectorText == selector
                    @rules = rules[j]
                    @style = rules[j].style
    set:    (property, value) -> @style.setProperty(property, value); @instance
    get:    (property)        -> @style[property]
    remove: (property)        -> @style[property] and @style.removeProperty(property) ; @instance
    _instance: (i)            -> @instance = i

x.style = (name) -> (i = new x.Style(name))._instance i

x.removeRule = (selector, property) -> 
    [0..(sheets = document.styleSheets).length - 1].forEach (i) -> 
        sheets?[i]?.cssRules? and [0..(rules = sheets[i].cssRules).length - 1].forEach (j) ->
            if rules[j] and rules[j].selectorText == selector
                if x.isArray(property)
                    property.map (p) -> rules[j].style.removeProperty p
                else
                    rules[j].style.removeProperty property
x.removeRules = (obj) -> x.isObject(obj) and x.keys(obj).forEach (k) -> x.removeRule(k, obj[k])
x.insertRule = (rule) ->
    if o.stylesheet.insertRule then o.stylesheet.insertRule rule else o.stylesheet.addRule rule
