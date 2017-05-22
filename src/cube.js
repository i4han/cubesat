'use strict'

cube     = {}

__._Modules   = {}
__._Settings  = {}
__._Parts     = {}
__._AttrParts = {}

if (Meteor.isServer) {
	// Settings = Meteor.settings ? Meteor.settings : {}
} else if (Meteor.isClient) {
	// Settings = {}
	Meteor.settings = Meteor.settings || {}
	'public' in Meteor.settings && (Settings = Meteor.settings.public)
}

class Module {
    constructor(name) {
       if (name in __._Modules) return __._Modules[name]
       else __._Modules[name] = this
       this._    = this._    || {}
       this.user = this.user || {}
       this.user.name  = this._.name  = name
       this.user.label = this._.label = __.capitalize(name)  }
    name() { return this._.name }
    local(id) {
       let uniqueName = this.name() + (this._.hash ? '-' + this._.hash : '-local')
       return id[0] === '#' ? '#' + uniqueName + '-' + id.slice(1) : uniqueName + '-' + id }
    template(t) {
       if (!t) return this._.template
       return __.object(this, '_.template', t)  }
    templat_ (t) { return this }
    init(f) {
       this._init = f
       return this  }
    assign(k, o) {
        if (__.isUndefined(o)) return this
        __.object(this[k], __.return(o, this))
        return this  }
    properties (o) {
        if (!o && this.user.Module) return this
        this.user.Db        = __._db
        this.user.Settings  = __._Settings
        this.user.Parts     = __._Parts
        this.user.AttrParts = __._AttrParts
        this.user.Modules   = __._Modules
        this.user.Public    = Meteor.settings.public
        if (!o) return this
        __.isFunction(o) && (o = o(this.user))
        __.assign(this.user, o)
        return this }
    mongo      (o) {
        __.isArray(o) && (o = __.object({}, o, Array(o.length).fill({})))
        return __.object(this, '_.mongo', o) }
    head       (o) {
        __.isFunction(o) && (o = o(this.properties().user))
        return __.object(this, '_.head',    o) }
    body       (o) { return __.object(this, '_.body',    o) }
    router     (o) { return __.object(this, '_.router',  o) }
    helpers    (o) {
        __.isFunction(o) && (o = o(this.properties().user))
        return __.object(this, '_.helpers', o) }
    events     (o) { return __.object(this, '_.events',  o) }
    script     (o) { return __.object(this, '_.script',  o) }
    methods    (o) { return __.object(this, '_.methods', o) }
    style      (o) { return __.object(this, '_.style',   o) }
    onStartup  (f) { return __.object(this, '_.onStartup',   f(this.properties().user)) }
    onServer   (f) { return __.object(this, '_.onServer',    f(this.properties().user)) }
    onRendered (f) { return __.object(this, '_.onRendered',  f(this.properties().user)) }
    onDestroyed(f) { return __.object(this, '_.onDestroyed', f(this.properties().user)) }
    onCreated  (f) { return __.object(this, '_.onCreated',   f(this.properties().user)) }
    fn(o) {
        __.eachKeys(o, k => this[k] = o[k].bind(this))
     return this  }
   $ (v) { return $(this.local(v)) }
   build(name) {
      name && (name !== this.name()) && console.error('Created module name and close name doesn\'t match', name, this.name())
      'style helper event method collection'.split(' ').forEach(p => this.assign(p, this['_' + p + 's']))
      this.assign('property', this._properties)
      this._init && this._init.call(this)
      return this } }

class Parts {
   constructor(parts) {
      this.part = this.part || {}
      this.attrPart = this.attrPart || {}
      parts = __.return(parts, __.return(parts))
      __.eachKeys(parts, k => {
         __.isFunctionPartKey(k) && (this.part[k] = parts[k])
         __.isAttrPartKey(k)     && (this.attrPart[k] = parts[k]) })
     __.assign(__._Parts, this.part)
     __.assign(__._AttrParts, this.attrPart)
     } }

class Settings {
    constructor(settings) {
        if (__.isFunction(settings)) {
            let _set = __.object({}, __._Settings)
            __.object(_set, settings({}))
            __.object( __._Settings,  __.fnValue( settings(_set), _set )  )  }
        else if (__.isObject(settings))
            __.object( __._Settings,  __.fnValue( settings, __.assign( {}, __._Settings, settings ) ) )
    }  }

class Cube {
    constructor() {
        this.module  = {}
        this.part    = {}
        this.setting = {} }
    add(...args) {
        args.forEach( i =>
            i instanceof Module   ? (this.module[i.name()] = i)   :
            i instanceof Parts    ? __.assign(this.part, i.part)  :
            i instanceof Settings ? __.assign(this.setting, i.setting) : undefined )
        return this }
    finish() { return this } }

class View {
    constructor(view) {
        this.view = view
        __.keys(__._Parts).forEach(k => this[k] = __._Parts[k].bind(__._Parts, view))  }  }

__.Cube     = ()        =>  new Cube()
__.Parts    = parts     =>  new Parts(parts)
__.Settings = settings  =>  new Settings(settings)
__.View     = view      => [new View(view), __.module(view)]
__.Template = (...args) => args.slice(1)
__.Module   = (...args) => {
    if ( args.length === 1 )
        return new Module(args[0])
    else if ( args.length === 2 )
        return new Module(args[0]).body(args[1]).build()
    else if ( args.length === 4 )
        return new new Module(args[0]).router(args[1]).body(args[2]).script(args[3]).build()
    else if ( args.length === 3 )
        if ('object' === typeof args[1])
            return new Module(args[0]).router(args[1]).body(args[2]).build()
        else
            return new Module(args[0]).body(args[1]).script(args[2]).build()
}

let mongo = {connected:[]}
__._db = {}

const mongoServer = (m, cs) => {
  __.isArray(cs) && (cs = __.object({}, cs, Array(cs.length).fill({})))
  __.keys(cs).filter(k => ! mongo.connected.includes(k)).map(k => {
      mongo.connected.push(k)
      __._db[k] = new Mongo.Collection(k)
      __._db[k].allow(__.return.call(m, cs[k].allow) || {
        insert: doc => false,
        update: (userId, doc, fields, modifier) => false,
        remove: (userId, doc) => false })
      __._db[k].deny(__.return.call(m, cs[k].deny) || {})
    //   console.log('', k, __._db[k].find({}).count(), 'documents.' )
      Meteor.publish(k, cs[k].publish ? () => cs[k].publish(m) : () => __._db[k].find({}))
      cs[k].collections && mongoServer(m, cs[k].collections) }) }
      //__.serverMongoConnected(k)

const subscribe   = (m, k) => {
    // console.log(k, __._db[k].subscribes)
    __._db[k].subscribes.filter(f => __.isFunction(f)).map(f => f(m, __._db[k])) }

const mongoClient = (m, cs) => { // cs: collections. ex: 'Depth'
  __.isArray(cs) && (cs = __.object({}, cs, Array(cs.length).fill({})))
  __.keys(cs).filter(k => ! mongo.connected.includes(k)).map(k => {
      mongo.connected.push(k)
      __._db[k] = new Mongo.Collection(k)
      __._db[k].subscribes = []
      cs[k].subscribe && __._db[k].subscribes.push( () => cs[k].subscribe(m)) // m is not that m
      __._db[k].handle = Meteor.subscribe(k, () => subscribe(m, k))
      cs[k].collections && mongoClient(m, cs[k].collections) }) // shoud be in subscribe()
      m.collection = cs} // ???

const head = o => __.eachKeys(  o, k => {
    __.isArray(  o[k]
      , () => o[k].forEach( v => $('head').append(HTML.toHTML( HTML[ k.toUpperCase() ](v) )) )
      , () => $('head').append(HTML.toHTML( HTML[ k.toUpperCase() ](o[k]) ))  )  })

const _toScript = f => f.toString().replace( /\s*function\s*\(\s*\)\s*\{([^]*)\}\s*/, '$1') // firefox toString: () => {}
const script = f => $('html').append( HTML.toHTML(HTML.SCRIPT( _toScript(f) )) )
const router = (o, m) => {
    // console.log('Router', o, )
    o.defaultLayout && (Router.configure({layoutTemplate: m._.name}), __.pop('defaultLayout'))
    o.layout        && __.reKey(o, 'layout', 'layoutTemplate')
    __.isEmpty(o)   || Router.route(m._.name, o)
}


Meteor.startup(() => {
  let v, _
  if (Meteor.isServer) {
    __.keys(__._Modules).map(n => {
      _ = __._Modules[n]
      ;(v = _._.methods)     &&  Meteor.methods(v)
      ;(v = _._.mongo)       &&  mongoServer(_, v)
      ;(v = _._.onServer)    &&  v.call(_) }) }
  else if (Meteor.isClient) {
    cube.installParts()
    __.keys(__._Modules).map(n => {
      _ = __._Modules[n]
      _._.style              &&  cube.Style(_._)
      ;(v = _._.head)        &&  head(v)
      ;(v = _._.script)      &&  script(v)
      ;(v = _._.router)      && (__.isEmpty(v) || router(v, _))
      ;(v = _._.mongo)       &&  mongoClient(_.user, v)
      ;(v = _._.onStartup)   &&  v.call(_, _)
      //;(v = _.property.path) &&  Router.route(n, {path: v, layoutTemplate: _.property.layout || 'layout'})
      ;(v = _._.template)    && (Template[n] = new Template('Template.' + n, v))
      ;(v = _._.body)        && (Template[n] = new Template('Template.' + n,
            ((v, name) => function () { return v(in$.template(this, name)) })(v, _.name()) ))
      ;(v = _._.events)      &&  Template[n] && Template[n].events(__.tideEventKey(v, __.key2id.bind(_)))
      ;(v = _._.helpers)     &&  Template[n] && Template[n].helpers(v) // __.function(v)
      ;(v = _._.onRendered)  &&  Template[n].onRendered(v) // __.function(v)
      ;(v = _._.onStartup)   &&  v()
      'onCreated onRendered onDestroyed'.split(' ').forEach(d => _._[d] && Template[n][d](_._[d])) }) }
    __.runMeteorStartup()
})
Router.route('/-/:shorten', (function() {
  this.response.writeHead(301, {
    Location: (() => {
      switch (this.params.shorten) {
        case 'flags.png':    return '/packages/isaac_intl-tel-input/intl-tel-input/build/img/flags.png'
        case 'flags@2x.png': return '/packages/isaac_intl-tel-input/intl-tel-input/build/img/flags@2x.png'
        default:
          return Meteor.settings.shortens[this.params.shorten] || 'path-not-found' }
    }) + (this.params.query ? __.addQuery(this.params.query) : '')
  })
  this.response.end()
}), {where: 'server'})
