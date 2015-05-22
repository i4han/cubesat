

collections = if (s = Meteor.settings) and s.public then x.toArray s.public.collections else []
connected = []

dbServer = (c) -> c.filter((c) -> ! c in connected).map (collection) ->
    connected.push collection
    db[collection] = new Meteor.Collection collection
    db[collection].allow
        insert: (doc) -> true
        update: (userId, doc, fields, modifier) -> true 
        remove: (userId, doc) -> true
    db[collection].deny
        update: (userId, doc, fields, modifier) -> false
        remove: (userId, doc) -> false
    Meteor.publish collection, -> db[collection].find {}

dbClient = (c) -> c.filter((c) -> ! c in connected).map (collection) ->
    connected.push collection
    db[collection] = new Meteor.Collection collection
    Meteor.subscribe collection

Meteor.startup ->
    Modules = x.func exports.Modules
    x.keys(exports).filter((k) -> 'a' <= k[0] <= 'z' )
        .map((file) -> x.extend Modules, x.func exports[file].Modules)
    x.keys(@Modules = Modules).map (n) -> x.module.call @, n, Modules[n]
    if Meteor.isServer
        collections.length and dbServer collections
        x.keys(Modules).map (name) ->
            _ = x.func Modules[name], x.func Modules[name]
            _.methods     and Meteor.methods _.methods
            _.collections and dbServer x.toArray _.collections
            _.onServerStartup and _.onServerStartup.call _
    else if Meteor.isClient
        collections.length and dbClient collections
        Router.configure layoutTemplate: 'layout'
        x.keys(Modules).map (name) ->
            _ = x.func Modules[name], x.func Modules[name]
            _.collections and dbClient x.toArray _.collections
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

