
__collections = if (s = Meteor.settings) and s.public then s.public.collections else {}
mongo = connected:[]

mongoServer = (cs) -> __.keys(cs).filter((c) => c not in mongo.connected).map (k) =>
    mongo.connected.push k
    db[k] = new Mongo.Collection k
    db[k].allow __.return.call(@, cs[k].allow) or
        insert: (doc) -> false
        update: (userId, doc, fields, modifier) -> false
        remove: (userId, doc) -> false
    db[k].deny __.return.call(@, cs[k].deny) or {}
    Meteor.publish k, if cs[k].publish then => cs[k].publish.call(@) else -> db[k].find {}
    cs[k].collections and mongoServer.call @, cs[k].collections

mongoClient = (cs) -> __.keys(cs).filter((c) => c not in mongo.connected).map (k) =>
    mongo.connected.push k
    db[k] = new Mongo.Collection k
    # Meteor.subscribe k, if __.isObject(cb = cs[k].callback) then => cb.call @ else => __.return.call @, cb
    Meteor.subscribe k, if cs[k].callback then cs[k].callback.bind @ else (->)
    cs[k].collections and mongoClient.call @, cs[k].collections


Meteor.startup ->
    #Parts   = __.return exports.Parts
    #Modules = __.return exports.Modules
    #__.eachKeys exports, (k) -> __.isLower(k) and __.assign Modules, __.return exports[k].Modules
    #__.keys(@Modules = Modules).map (n) -> __.module.call @, n, Modules[n] = __.return Modules[n], __.return Modules[n]
    if Meteor.isServer
        #__.isEmpty(collections) or mongoServer collections
        __.keys(Sat.module).map (n) ->
            #_ = __.return Modules[n], __.return Modules[n]
            _ = Sat.module[n]
            _.method     and Meteor.methods _.method
            _.collection and mongoServer.call _, _.collection
            _.onServer   and _.onServer.call _

    else if Meteor.isClient
        cube.installParts()
        #__.isEmpty(collections) or mongoClient collections
        __.keys(Sat.module).map (n) -> # _.$Ready and $ ($) -> _.$Ready.call _ onStartup $ ($) ->_.router and Router.map -> @route n, __.return _.router
            _ = Sat.module[n]
            _.collection    and mongoClient.call _, _.collection
            _.onstartup     and _.onstartup.call _
            _.property.path and Router.route n, path: _.property.path  #Router.route _.path#, name: n, template: n
            _.style         and cube.Style _
            _.template()    and (console.log('Template.' + n, _.template()) or Template[n] = new Template 'Template.' + n, _.template()) # template() returns _template
            _.event         and (console.log(n, _, Template[n]) or Template[n].events __.tideEventKey _.event, __.key2id.bind _) #_[__.f.id]
            _.helper        and Template[n].helpers _.helper    # @data context
            'onCreated onRendered onDestroyed'.split(' ').forEach (d) -> _[d.toLowerCase()] and Template[n][d] _[d.toLowerCase()]
        Router.configure layoutTemplate: 'layout'
        #$ ($) -> $.fn[k] = __.$[k] for k of __.$
###
https://www.facebook.com/connect/ping?client_id=839822572732286&domain=localhost&origin=1&redirect_uri=
'http://static.ak.facebook.com/connect/xd_arbiter/ZokAubRWdt6.js?
version=41#cb=f238146f44&
domain=localhost&
origin=http%3A%2F%2Flocalhost%3A3300%2Ff36fa83014& # 'http://localhost:3300/f36fa83014'
relation=parent&response_type=token,signed_request,code&sdk=joey:1'

"http%3A%2F%2Fstatic.ak.facebook.com%2Fconnect%2Fxd_arbiter%2FZokAubRWdt6.js%3Fversion%3D41%23cb%3Df238146f44%26domain%3Dlocalhost%26origin%3Dhttp%253A%252F%252Flocalhost@253A3300%252Ff36fa83014%26relation%3Dparent&response_type=token%2Csigned_request%2Ccode&sdk=joey:1"
        __.keys(Modules).map (n) -> # _.$Ready      and $ ($) -> _.$Ready.call _ onStartup $ ($) ->_.router and Router.map -> @route n, __.return _.router
            _ = __.return Modules[n], __.return Modules[n]
            _.collections and mongoClient.call @, __.return.call _, _.collections
            _.onStartup   and _.onStartup.call _
            _.path        and Router.route n, __.return path: _.path #Router.route _.path#, name: n, template: n
            _.style       and cube.Style _
            #_.onDeviceReady and document.addEventListener 'deviceready', _.onDeviceReady
            _.template    and Template[n] = new Template 'Template.' + n, _.template
            _.events      and Template[n].events __.tideEventKey __.return(_.events, _), __.key2id.bind _ #_[__.f.id]
            _.helpers     and Template[n].helpers __.return _.helpers, _     # @data context
            ('onCreated onRendered onDestroyed'.split ' ').forEach (d) -> _[d] and Template[n][d] -> _[d].call _
###
