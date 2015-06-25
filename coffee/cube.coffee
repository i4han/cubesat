
collections = if (s = Meteor.settings) and s.public then s.public.collections else {}
mongo = connected:[]

mongoServer = (cs, that) -> x.keys(cs).filter((c) -> c not in mongo.connected).map (k) ->
    mongo.connected.push k
    db[k] = new Mongo.Collection k
    db[k].allow x.return(cs[k].allow, that) or
        insert: (doc) -> false
        update: (userId, doc, fields, modifier) -> false 
        remove: (userId, doc) -> false
    db[k].deny x.return(cs[k].deny,   that) or {}
    Meteor.publish k, if cs[k].publish then -> cs[k].publish.call(that) else -> db[k].find {}
    cs[k].collections and mongoServer cs[k].collections, that

mongoClient = (cs, that) -> x.keys(cs).filter((c) -> c not in mongo.connected).map (k) ->
    mongo.connected.push k
    db[k] = new Mongo.Collection k
    Meteor.subscribe k, if x.isObject(cb = cs[k].callback) then -> cb.call that else -> x.return cb, that
    cs[k].collections and mongoClient cs[k].collections, that


Meteor.startup ->
    Parts   = x.return exports.Parts
    Modules = x.return exports.Modules
    x.eachKeys exports, (k) -> x.isLower(k) and x.assign Modules, x.return exports[k].Modules
    x.keys(@Modules = Modules).map (n) -> x.module.call @, n, Modules[n] = x.return Modules[n], x.return Modules[n]
    if Meteor.isServer
        x.isEmpty(collections) or mongoServer collections
        x.keys(Modules).map (n) ->
            _ = x.return Modules[n], x.return Modules[n]
            _.methods     and Meteor.methods x.return _.methods, _
            _.collections and mongoServer x.return(_.collections, _), _
            _.onServer    and _.onServer.call _

    else if Meteor.isClient
        exports.Functions.installParts Parts
        x.isEmpty(collections) or mongoClient collections
        x.keys(Modules).map (n) ->
            _ = x.return Modules[n], x.return Modules[n]
            _.collections and mongoClient x.return(_.collections, _), _
            _.onStartup   and _.onStartup.call _
            _.path        and Router.route n, x.return path: _.path #Router.route _.path#, name: n, template: n
            _.style       and cube.Style _
            _.on$Ready    and $ ($) -> _.on$Ready.call _
            _.onDeviceReady and document.addEventListener 'deviceready', _.onDeviceReady
            _.template    and Template[n] = new Template 'Template.' + n, _.template
            _.events      and Template[n].events x.tideEventKey x.return(_.events, _), x.key2id.bind _ #_[x.f.id]
            _.helpers     and Template[n].helpers x.return _.helpers, _     # @data context
            ('onCreated onRendered onDestroyed'.split ' ').forEach (d) -> _[d] and Template[n][d] -> _[d].call _
        Router.configure layoutTemplate: 'layout'

                #_.router      and Router.map -> @route n, x.return _.router        #, data: -> Session.set 'params', @params
        $ ($) -> 
            o.$.map (f) -> f()
            $.fn[k] = x.$[k] for k of x.$

