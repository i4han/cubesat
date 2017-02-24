'use strict'

// Sat -> __.__.web.name() __._part. __._settings. __._attrPart.
// this variables -> this._
// properties -> router
// collections -> mongo
// const in$ = require('incredibles')
// if (typeof Meteor === "undefined") {
//     global.cube = {}
//     global.__  = require('underscore2')  }

__._Modules   = {}
__._Settings  = {}
__._Parts     = {}
__._AttrParts = {}

class Module {
   constructor(name) {
      if (typeof Sat !== 'undefined')
         if (name in Sat.module)
            return Sat.module[name]
         else Sat.module[name] = this
      __._Modules[name] = this
      this._    = this._    || {}
      this.user = this.user || {}
      this.user.name  = this._.name  = name
      this.user.label = this._.label = __.capitalize(name)
  }
   name() { return this._.name }
   local(id) {
      let uniqueName = this.name() + (this._.hash ? '-' + this._.hash : '-local')
      return id[0] === '#' ? '#' + uniqueName + '-' + id.slice(1) : uniqueName + '-' + id }
   template(t) {
    //   console.log(this._.name + ' from template')
      if (!t) return this._.template
      return __.object(this, '_.template', t)
   }
   init(f) {
     this._init = f
     return this }
   assign(k, o) {
     if (__.isUndefined(o)) return this
     __.object(this[k], __.return(o, this))
     return this }
   properties (o) {
       if (!o && this.user.Module) return this
       this.user.Db        = __._db
       if ('undefined' !== typeof Sat && Sat) { // error
           // this.user.Settings  = __._Settings // has not loaded yet!
           this.user.Settings  = __._Settings // Meteor.settings
           this.user.Parts     = __._Parts
           this.user.AttrParts = __._AttrParts
           this.user.Modules   = __._Modules
       }
       // add local and $
       if (!o) return this
       __.isFunction(o) && console.log(0, this.user, 1, o, 2, __.isFunction(o), typeof o, 3, o(this.user) )
       __.isFunction(o) && (o = o(this.user))
       __.assign(this.user, o)
       return this }
   mongo      (o) {
        __.isArray(o) && (o = __.object({}, o, Array(o.length).fill({})))
        return __.object(this, '_.mongo', o) }
   head       (o) {
       __.isFunction(o) && (o = o(this.properties().user))
       return __.object(this, '_.head',    o) }
   router     (o) { return __.object(this, '_.router',  o) }
   helpers    (o) {
       __.isFunction(o) && (o = o(this.properties().user))
       return __.object(this, '_.helpers', o) }
   events     (o) { return __.object(this, '_.events',  o) }
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
      if (typeof Sat !== 'undefined') {
         __.assign(Sat.part, this.part)
         __.assign(Sat.attrPart, this.attrPart) }
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
__.Module   = name      =>  new Module(name)
__.Parts    = parts     =>  new Parts(parts)
__.Settings = settings  =>  new Settings(settings)
__.View     = view      => [new View(view), __.module(view)]
__.Template = (...args) => args.slice(1)

typeof Meteor === "undefined" && (module.exports = __)
