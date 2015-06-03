

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
    Meteor.subscribe k, if x.isObject(cb = cs[k].callback) then cb else -> x.func cb, that
    cs[k].collections and mongoClient cs[k].collections, that

Meteor.startup ->
    Modules = x.func exports.Modules
    x.keys(exports).filter((k) -> 'a' <= k[0] <= 'z' )
        .map((file) -> x.extend Modules, x.func exports[file].Modules)
    x.keys(@Modules = Modules).map (n) -> x.module.call @, n, Modules[n]
    if Meteor.isServer
        x.isEmpty(collections) or mongoServer collections
        x.keys(Modules).map (name) ->
            _ = x.func Modules[name], x.func Modules[name]
            _.methods     and Meteor.methods -> _.methods.call _
            _.collections and mongoServer _.collections, _
            _.onServerStartup and _.onServerStartup.call _
    else if Meteor.isClient
        x.isEmpty(collections) or mongoClient collections
        Router.configure layoutTemplate: 'layout'
        x.keys(Modules).map (name) ->
            _ = x.func Modules[name], x.func Modules[name]
            _.collections and mongoClient _.collections, _
            _.onStartup   and _.onStartup.call _
            _.router      and Router.map -> @route name, x.extend _.router #, data: -> Session.set 'params', @params
            _.events      and Template[name].events x.tideEventKey x.func(_.events, _), _.id
            _.helpers     and Template[name].helpers x.func _.helpers, _
            _.on$Ready    and $ ($) -> _.on$Ready.call _
            ('onCreated onRendered onDestroyed'.split ' ').forEach (d) -> 
                _[d] and Template[name][d] -> _[d].call _
        $ ($) -> 
            o.$.map (f) -> f()
            $.fn[k] = x.$[k] for k of x.$

