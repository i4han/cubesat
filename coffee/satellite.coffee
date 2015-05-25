

collections = if (s = Meteor.settings) and s.public then s.public.mongo else {}
connected = []

mongoServer = (mongo) -> x.keys(mongo).filter((c) -> c not in connected).map (k) ->
    connected.push k
    db[k] = new Meteor.Collection k
    db[k].allow x.func(mongo[k].allow, mongo[k]) or
        insert: (doc) -> true
        update: (userId, doc, fields, modifier) -> false 
        remove: (userId, doc) -> false
    db[k].deny x.func(mongo[k].deny  , mongo[k]) or
        remove: (userId, doc) -> true
    Meteor.publish k, mongo[k].publish or -> db[k].find {}

mongoClient = (mongo) -> x.keys(mongo).filter((c) -> c not in connected).map (k) ->
    connected.push k
    db[k] = new Meteor.Collection k
    Meteor.subscribe k

Meteor.startup ->
    Modules = x.func exports.Modules
    x.keys(exports).filter((k) -> 'a' <= k[0] <= 'z' )
        .map((file) -> x.extend Modules, x.func exports[file].Modules)
    x.keys(@Modules = Modules).map (n) -> x.module.call @, n, Modules[n]
    if Meteor.isServer
        x.isEmpty(collections) or mongoServer collections
        x.keys(Modules).map (name) ->
            _ = x.func Modules[name], x.func Modules[name]
            _.methods     and Meteor.methods _.methods
            _.mongo       and mongoServer _.mongo
            _.onServerStartup and _.onServerStartup.call _
    else if Meteor.isClient
        x.isEmpty(collections) or mongoClient collections
        Router.configure layoutTemplate: 'layout'
        x.keys(Modules).map (name) ->
            _ = x.func Modules[name], x.func Modules[name]
            _.mongo       and mongoClient _.mongo
            _.onStartup   and _.onStartup.call(_)
            _.router      and console.log('O') or Router.map -> @route name, x.extend _.router #, data: -> Session.set 'params', @params
            _.events      and Template[name].events x.tideEventKey x.func(_.events, _), _.id
            _.helpers     and Template[name].helpers x.func _.helpers, _
            _.on$Ready    and $ ($) -> _.on$Ready.call _
            ('onCreated onRendered onDestroyed'.split ' ').forEach (d) -> 
                _[d] and Template[name][d] -> _[d].call _
        $ ($) -> 
            o.$.map (f) -> f()
            $.fn[k] = x.$[k] for k of x.$

