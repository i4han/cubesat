
window.blaze  = {}
window.cube   = {}
window.html   = {}
window.part   = {}

cube.lookup       = (_, v) -> Spacebars.call _.lookup v
cube.lookupInView = (_, v) -> Blaze.View 'lookup:' + v, -> Spacebars.mustache _.lookup v
cube.lookupInAttr = (_, v) -> Spacebars.mustache _.lookup v

htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.toUpperCase().split(' ');

attributeClass = (key, value) -> if __.isString(value) then value.replace /\*/g, __.key2class key else __.key2class key

htmlEntities =
   '123': '{'
   '125': '}'

displayValue = (v) ->
   if __.maybeHtmlEntity v then (v.replace /&#([0-9]{3});/g, (m, $1) -> if $1 of htmlEntities then htmlEntities[$1] else m)
   else v

mustacheAttr = (v, f) -> switch
   when __.isEmpty v then ''
   when __.isArray v then -> v
   when __.maybeMustache v then v.split(/[{}]/).map((v, i) -> if i % 2 is 1 then f v else displayValue v).filter (v) -> v
   else displayValue v

blazeAttr = (_, obj) ->
   f = cube.lookupInAttr.bind null, _
   o = __.reduceKeys (fo = __.fixup.call part: Sat.attrPart, obj), {}, (o, k) -> switch
      when __.check('class', k) and fo[k].indexOf('*') > -1 then __.object o, 'class', mustacheAttr attributeClass(k, fo[k]), f
      when 'local' is k
         __.object o, 'id', if __.isBlazeView _ then __.key2id.call __.module(_), fo[k] else  mustacheAttr fo[k], f
      else __.object o, k, mustacheAttr fo[k], f
   if __.keys(o).length is 1 and o[__.theKey o] is '' then __.theKey o else o

mustache = (_, a) ->
   f = cube.lookupInView.bind null, _
   if not __.isArray a then mustacheAttr a, f else __.reduce a, [], (o, v) -> __.array o, mustacheAttr v, f

cube.installParts = -> __.eachKeys Sat.part, (k) -> part[k] = Sat.part[k]

htmlTags.forEach (tag) -> html[tag] = (_, obj, str) ->
   args = [].slice.call arguments
   if __.isBlazeAttr obj then (if args.length is 2 then HTML[tag] blazeAttr _, obj else HTML[tag] blazeAttr(_, obj), mustache _, args[2..])
   else                       (if args.length is 1 then HTML[tag]()                else HTML[tag]                    mustache _, args[1..])

cube.Head = (_) -> ([].slice.call arguments)[1..].forEach (v) -> $('head').append HTML.toHTML v

cube.Switch = (_) ->
   args = [].slice.call arguments
   args[2] and if __.isString args[1] then condition = (-> Spacebars.call _.lookup args[1]) else condition = -> args[1] # console.log 'bool', args[1], _.lookup(args[1]), Spacebars.call _.lookup args[1]
   switch
      when (len = args.length) is 2 then args[1]()
      when len is 3 then Blaze.If condition, args[2], -> []
      when len > 3  then Blaze.If condition, args[2], -> [cube.Switch.apply null, [_].concat args[3..]]

cube.include          = (_, name) ->              Spacebars.include _.lookupTemplate(name)
cube.includeBlock     = (_, name, block) ->       Spacebars.include _.lookupTemplate(name), block
cube.includeAttrBlock = (_, name, attr, block)->
   Blaze._TemplateWith (-> blazeAttr _, attr), -> Spacebars.include _.lookupTemplate(name), block
cube.includeAttr      = (_, name, attr) ->
   Blaze._TemplateWith (-> blazeAttr _, attr), -> Spacebars.include _.lookupTemplate name

blaze.Include = (_, name, o) ->
   args = __.array arguments
   switch
      when (l = args.length) is 2 then         cube.include      _, name
      when l is 3 and __.isBlazeElement o then cube.includeBlock _, name, -> args[2..]
      when l > 3 then                          cube.includeAttrBlock _, name, o, -> args[3..]
      else                                     cube.includeAttr  _, name, o
['Each', 'With'].forEach (tag) -> blaze[tag]  = (_, lookup, func)           -> Blaze[tag] (-> cube.lookup _, lookup), func
['If']          .forEach (tag) -> blaze[tag]  = (_, lookup, f_then, f_else) -> Blaze[tag] (-> cube.lookup _, lookup), f_then, f_else

###
blaze.Include = (_, name, o) ->
   args = [].slice.call arguments
   #console.log _.lookupTemplate(name)
   switch
      when (l = args.length) is 2 then                            Spacebars.include _.lookupTemplate(name)
      when l is 3 and __.isBlazeElement o then                    Spacebars.include _.lookupTemplate(name), -> args[2..]
      when l > 3 then Blaze._TemplateWith (-> blazeAttr _, o), -> Spacebars.include _.lookupTemplate(name), -> args[3..]
      else            Blaze._TemplateWith (-> blazeAttr _, o), -> Spacebars.include _.lookupTemplate name
###
idclassKey = (k) -> switch
   when __.check 'local', k then '#' + __.key2id.call @, __.getLocal k
   when __.check 'class', k then '.' + __.key2class(k)
   else k

styleMediaQuery = (k) -> k

styleLoop = (obj) -> __.reduceKeys obj, {}, (o, k) => switch
   when k[0] is '@' then __.object o, styleMediaQuery(k), styleLoop.call @, obj[k]
   #when k of window.Parts then __.assign o, window.Parts[k].call @, obj[k]
   when k isnt (idk = idclassKey.call @, k) then __.object o, idk, obj[k]
   else __.object o, k, obj[k]

cube.Style = (_) ->
   _.part = Sat.attrPart
   style$ __.reduceKeys (obj = __.fixup.call _, _.style), {}, (o, k) =>
      __.object o, idclassKey.call(_, k), styleLoop.call _, obj[k]
#$ ($) -> $('head').append '<style type="text/css">' + style + '</style>'


###
['contentFor']  .forEach (tag) -> router[tag] = (_, obj) -> Blaze._TemplateWith (-> key = __.theKey obj), (-> Spacebars.include _.lookupTemplate tag), -> __.array obj[key]
Template['layout'] = new Template 'Template.layout', ->
   Spacebars.include @lookupTemplate('ionBody'), -> [
      Blaze._TemplateWith (-> class: Spacebars.call 'bar-royal'), ->
         Spacebars.include @lookupTemplate 'ionNavBar'
      Spacebars.include @lookupTemplate('ionNavView'), ->
         [Spacebars.include @lookupTemplate 'yield']
      Spacebars.include @lookupTemplate 'tabs'
   ]

Template['tabs'] = new Template 'Template.tabs', ->
   Blaze._TemplateWith (-> class: Spacebars.call 'tabs-icon-top'), ->
      Spacebars.include @lookupTemplate('ionTabs'), -> [
         Blaze._TemplateWith (->
            title: Spacebars.call 'Chat'
            path: Spacebars.call 'chat'
            iconOff: Spacebars.call 'chatbubbles'
            iconOn: Spacebars.call 'chatbubbles'
         ), -> Spacebars.include @lookupTemplate 'ionTab'
         Blaze._TemplateWith (->
            title: Spacebars.call 'Camera'
            path: Spacebars.call 'camera'
            iconOff: Spacebars.call 'camera'
            iconOn: Spacebars.call 'camera'
         ), -> Spacebars.include @lookupTemplate 'ionTab'
         Blaze._TemplateWith (->
            title: Spacebars.call('Spark')
            path: Spacebars.call('spark')
            iconOff: Spacebars.call('flash')
            iconOn: Spacebars.call('flash')
         ), -> Spacebars.include @lookupTemplate 'ionTab'
         Blaze._TemplateWith (->
            title: Spacebars.call('Settings')
            path: Spacebars.call('settings')
            iconOff: Spacebars.call('gear-a')
            iconOn: Spacebars.call('gear-a')
         ), -> Spacebars.include @lookupTemplate 'ionTab'
         Blaze._TemplateWith (->
            title: Spacebars.call('Profile')
            path: Spacebars.call('profile')
            iconOff: Spacebars.call('person')
            iconOn: Spacebars.call('person')
         ), -> Spacebars.include @lookupTemplate 'ionTab'
      ]
Template['profile'] = new Template 'Template.profile', ->
   [
      Blaze._TemplateWith (-> 'headerTitle'), ->
         Spacebars.include @lookupTemplate('contentFor'), -> [HTML.H1 class: 'title', 'profile']
      Spacebars.include @lookupTemplate('ionContent'), -> [
         Blaze._TemplateWith (->
            class: Spacebars.call 'profile'), ->
               Spacebars.include @lookupTemplate('ionList'), -> [
                  Blaze.Each (-> Spacebars.call @lookup 'items'), -> [
                     Blaze._TemplateWith (-> 'button-right': Spacebars.call true), ->
                        Spacebars.include @lookupTemplate('ionItem'), -> [
                           HTML.H2 Blaze.View 'lookup:title',   -> Spacebars.mustache @lookup 'title'
                           HTML.P  Blaze.View 'lookup:content', -> Spacebars.mustache @lookup 'content'
                           HTML.BUTTON class: 'button button-positive',
                              Blaze._TemplateWith (-> icon: Spacebars.call 'ios-telephone'), ->
                                 Spacebars.include @lookupTemplate 'ionIcon'
                        ]
                  ]
               ]
      ]
      Spacebars.include @lookupTemplate('ionSubfooterBar'), -> [
         HTML.BUTTON(
            class: 'button button-block'
            id: 'facebook'
            'login with facebook')
      ]
   ]

Template['settings'] = new Template 'Template.settings', -> [
   Blaze._TemplateWith (-> 'headerTitle'), ->
      Spacebars.include @lookupTemplate('contentFor'), -> [HTML.H1 class: 'title', 'Settings']
   Spacebars.include @lookupTemplate('ionView'), -> [
      Spacebars.include @lookupTemplate('ionContent'), -> [HTML.P 'hello world!']
   ]
   Spacebars.include @lookupTemplate('ionSubfooterBar'), -> [
      HTML.BUTTON class: 'button button-block', id: 'logout', 'logout'
   ]
]
Template['chat'] = new Template 'Template.chat', -> [
   Blaze._TemplateWith (-> 'headerTitle'), ->
      Spacebars.include @lookupTemplate('contentFor'), -> [
         HTML.H1 class: 'title', 'Chat'
      ]
   HTML.DIV class: 'content',
      HTML.DIV class: 'content-padded',
         Blaze.Each (-> Spacebars.call @lookup 'chats'), -> [
            HTML.DIV
               id: -> Spacebars.mustache @lookup('id')
               class: -> ['chat chat-', Spacebars.mustache @lookup 'side']
               Blaze.View('lookup:text', -> Spacebars.mustache @lookup 'text')
         ]
   Spacebars.include @lookupTemplate('ionSubfooterBar'), -> [
      HTML.INPUT type: 'text', id: 'chat-input0'
   ]
]
Template['spark'] = new Template 'Template.spark', -> [
   Blaze._TemplateWith (-> 'headerTitle'), ->
      Spacebars.include @lookupTemplate('contentFor'), -> [
         HTML.H1 class: 'title', 'Spark'
      ]
   HTML.Raw '<div class="content"><img class="photo photo-back" id="photo-0" src="spark0.jpg"></div>'
]
Template['camera'] = new Template 'Template.camera', -> [
   Blaze._TemplateWith (-> 'headerTitle'), ->
      Spacebars.include @lookupTemplate('contentFor'), -> [
         HTML.H1 'class': 'title', 'Camera'
      ]
   HTML.Raw '<img id="camera-photo" style="width:100%;">'
]
Template['chosenbox'] = new Template 'Template.chosenbox', ->
   HTML.DIV
      class: 'chosen-container'
      id:    -> ['chosen-', Spacebars.mustache @lookup 'id']
      style: -> ['left:',   Spacebars.mustache(@lookup 'left'), 'px;']
      HTML.IMG id: -> ['chosen-box-', Spacebars.mustache @lookup 'id']
Template['chosen'] = new Template 'Template.chosen', ->
   HTML.DIV
      id: 'chosen'
      Blaze.Each (-> Spacebars.call @lookup 'chosen'), -> [
         Spacebars.include @lookupTemplate 'chosenbox'
      ]
###
