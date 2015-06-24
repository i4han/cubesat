
window.blaze  = {}
window.ionic  = {}
window.cube   = {}
window.html   = {}
window.part   = {}
cube.lookup = (_, v) -> -> Spacebars.call _.lookup v
cube.viewLookup = (_, v) -> Blaze.View 'lookup:' + v, -> Spacebars.mustache _.lookup v
cube.attrLookup = (_, v) -> Spacebars.mustache _.lookup v

htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.toUpperCase().split(' ');

attributeClass = (key, value) -> if x.isString(value) then value.replace /\*/g, x.key2class key else x.key2class key

htmlEntities =
   '123': '{'
   '125': '}'

escapeCode = (v) -> 
   if x.maybeHtmlEntity v then (v.replace /&#([0-9]{3});/g, (m, $1) -> if $1 of htmlEntities then htmlEntities[$1] else m)
   else v

mustacheAttr = (v, f) -> 
   if x.maybeMustache v then v.split(/[{}]/).map((v, i) -> if i % 2 is 1 then f v else escapeCode v).filter (v) -> v 
   else escapeCode v 

blazeAttr = (_, obj) ->
   f = cube.attrLookup.bind null, _
   o = x.reduceKeys (fo = x.fixup obj), {}, (o, k) -> switch
      when x.check('class', k) and fo[k].indexOf('*') > -1 then x.object o, 'class', mustacheAttr attributeClass(k, fo[k]), f
      else x.object o, k, mustacheAttr fo[k], f
   if x.keys(o).length is 1 and o[x.theKey o] is '' then x.theKey o else o

mustache = (_, a) -> 
   f = cube.viewLookup.bind null, _
   if not x.isArray a then a else x.reduce a, [], (o, v) -> x.array o, mustacheAttr v, f

exports.Functions.installParts = (_) -> x.eachKeys _, (k) -> x.isFunctionPartKey(k) and part[k] = _[k]

htmlTags.forEach (tag) -> html[tag] = (_, obj, str) ->
   args = [].slice.call arguments
   if x.isBlazeAttr obj then (if args.length is 2 then HTML[tag] blazeAttr _, obj else HTML[tag] blazeAttr(_, obj), mustache _, args[2..])
   else                      (if args.length is 1 then HTML[tag]()                else HTML[tag]                    mustache _, args[1..])
['Each', 'With'].forEach (tag) -> blaze[tag]  = (_, lookup, func) -> 
   Blaze[tag] (-> Spacebars.call _.lookup lookup), func
blaze.Include = (_, name, o) ->
   args = [].slice.call arguments
   switch 
      when (l = args.length) is 2 then                            Spacebars.include _.lookupTemplate(name)
      when l is 3 and x.isBlazeElement o then                     Spacebars.include _.lookupTemplate(name), -> args[2..]
      when l > 3 then Blaze._TemplateWith (-> blazeAttr _, o), -> Spacebars.include _.lookupTemplate(name), -> args[3..]
      else            Blaze._TemplateWith (-> blazeAttr _, o), -> Spacebars.include _.lookupTemplate name

ionTags = 'Body Content FooterBar HeaderBar Icon Item List Modal NavBackButton NavBar NavView Pane Popover Popup Radio SideMenu SideMenuContent SideMenus Slide SlideBox SubfooterBar SubheaderBar Tab Tabs View'.split ' '
ionTags.forEach (tag) -> ionic[tag] = (_, o) ->
   args = [].slice.call arguments
   iTag = 'ion' + tag
   switch
      when (l = args.length) is 1 then                            Spacebars.include _.lookupTemplate(iTag)
      when x.isBlazeElement o then                                Spacebars.include _.lookupTemplate(iTag), -> args[1..]
      when l > 2 then Blaze._TemplateWith (-> blazeAttr _, o), -> Spacebars.include _.lookupTemplate(iTag), -> args[2..]
      else            Blaze._TemplateWith (-> blazeAttr _, o), -> Spacebars.include _.lookupTemplate iTag
      

###
   ['contentFor']  .forEach (tag) -> router[tag] = (_, obj) -> Blaze._TemplateWith (-> key = x.theKey obj), (-> Spacebars.include _.lookupTemplate tag), -> x.array obj[key]
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