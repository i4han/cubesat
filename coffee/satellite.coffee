

collections = if (s = Meteor.settings) and s.public then s.public.collections else {}
mongo = connected:[]

mongoServer = (cs, that) -> x.keys(cs).filter((c) -> c not in mongo.connected).map (k) ->
    mongo.connected.push k
    db[k] = new Mongo.Collection k
    db[k].allow x.func(cs[k].allow, that) or
        insert: (doc) -> false
        update: (userId, doc, fields, modifier) -> false 
        remove: (userId, doc) -> false
    db[k].deny x.func(cs[k].deny,   that) or {}
    Meteor.publish k, if cs[k].publish then -> cs[k].publish.call(that) else -> db[k].find {}
    cs[k].collections and mongoServer cs[k].collections, that

mongoClient = (cs, that) -> x.keys(cs).filter((c) -> c not in mongo.connected).map (k) ->
    mongo.connected.push k
    db[k] = new Mongo.Collection k
    Meteor.subscribe k, if x.isObject(cb = cs[k].callback) then -> cb.call that else -> x.func cb, that
    cs[k].collections and mongoClient cs[k].collections, that

Meteor.startup ->
    Modules = x.func exports.Modules
    x.keys(exports).filter((k) -> /[a-z]/.test k[0]).map((f) -> x.extend Modules, x.func exports[f].Modules)
    x.keys(@Modules = Modules).map (n) -> x.module.call @, n, Modules[n] = x.func Modules[n], x.func Modules[n]
    if Meteor.isServer
        x.isEmpty(collections) or mongoServer collections
        x.keys(Modules).map (n) ->
            _ = x.func Modules[n], x.func Modules[n]
            _.methods     and Meteor.methods x.func _.methods, _
            _.collections and mongoServer x.func(_.collections, _), _
            _.onServerStartup and _.onServerStartup.call _
    else if Meteor.isClient
        x.isEmpty(collections) or mongoClient collections
        Router.configure layoutTemplate: 'layout'
        x.keys(Modules).map (n) ->
            _ = x.func Modules[n], x.func Modules[n]
            _.collections and mongoClient x.func(_.collections, _), _
            _.onStartup   and _.onStartup.call _
            _.router      and Router.map -> @route n, x.extend _.router #, data: -> Session.set 'params', @params
            _.events      and Template[n].events x.tideEventKey x.func(_.events, _), _[x.f.id]
            _.helpers     and Template[n].helpers x.func _.helpers, _  # @data context
            _.on$Ready    and $ ($) -> _.on$Ready.call _
            _.onDeviceReady and document.addEventListener 'deviceready', _.onDeviceReady
            ('onCreated onRendered onDestroyed'.split ' ').forEach (d) -> 
                _[d] and Template[n][d] -> _[d].call _
        $ ($) -> 
            o.$.map (f) -> f()
            $.fn[k] = x.$[k] for k of x.$

