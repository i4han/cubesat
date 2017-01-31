'use strict'
// Sat -> __.__.web.name() __._part. __._settings. __._attrPart.
// this variables -> this._
// properties -> router
// collections -> mongo

typeof Meteor === "undefined" && (global.cube = {}, global.__ = require('underscore2'))

class Module {
   constructor(name) {
      if (typeof Sat !== 'undefined')
         if (name in Sat.module)
            return Sat.module[name]
         else Sat.module[name] = this
      this._    = this._    || {}
      this.user = this.user || {}
      this._.router = {}
      this.property = {}
      this._.head   = {}
      this.style    = {}
      this.helper   = {}
      this.event    = {}
      this._.methods   = {}
      this._.mongo  = {}
      this._.name  = this.user.name  = name
      this._.label = this.user.label = __.capitalize(name) }
   name() { return this._.name }
   local(id) {
      let uniqueName = this.name() + (this._.hash ? '-' + this._.hash : '-local')
      return id[0] === '#' ? '#' + uniqueName + '-' + id.slice(1) : uniqueName + '-' + id }
   template(t) {
      console.log(this._.name + ' from template')
      return typeof t === 'undefined' ? this._template : __.object(this, '_template', t)
   }
   init(f) {
     this._init = f
     return this }
   assign(k, o) {
     if (__.isUndefined(o)) return this
     __.object(this[k], __.return(o, this))
     return this }
   head       (o) { this._.head       = o; return this}
   router     (o) { this._.router     = o; return this}
   properties (o) { this._properties  = o; return this.assign('property',   o) }
   style      (o) { return __.object(this, '_.style',   o) }
   helpers    (o) { return __.object(this, '_.helpers', o) }
   events     (o) { return __.object(this, '_.events',  o) }
   methods    (o) { return __.object(this, '_.methods', o) }
   mongo      (o) {
        __.isArray(o) && (o = __.object({}, o, Array(o.length).fill({})))
        return __.object(this, '_.mongo', o) }
   onStartup  (f) { return __.object(this, '_.onStartup',   f) }
   onServer   (f) { return __.object(this, '_.onServer',    f) }
   onRendered (f) { return __.object(this, '_.onRendered',  f) }
   onDestroyed(f) { return __.object(this, '_.onDestroyed', f) }
   onCreated  (f) { return __.object(this, '_.onCreated',   f) }
   fn(o) {
     __.eachKeys(o, k => this[k] = o[k].bind(this))
     return this }
   $ (v) { return $(this.local(v)) }
   build(name) {
      name && (name !== this.name()) && console.error('Created module name and close name doesn\'t match', name, this.name())
      'style helper event method collection'.split(' ').forEach(p => this.assign(p, this['_' + p + 's']))
      this.assign('property', this._properties)
      this._init && this._init.call(this)
      return this } }

class Parts {
   constructor(parts) {
      console.log(parts)
      this.part = this.part || {}
      this.attrPart = this.attrPart || {}
      parts = __.return(parts, __.return(parts))
      __.eachKeys(parts, k => {
         __.isFunctionPartKey(k) && (this.part[k] = parts[k])
         __.isAttrPartKey(k)     && (this.attrPart[k] = parts[k]) })
      if (typeof Sat !== 'undefined') {
         __.assign(Sat.part, this.part)
         __.assign(Sat.attrPart, this.attrPart) } } }

class Settings {
   constructor(settings) {
      let f
//      if (__.isMeteorServer()) {
      if (! __.isMeteorClient()) {
         settings = __.return(settings, __.return(settings))
         ;(f = o => __.keys(o).forEach(k => {
            __.isObject(o[k]) && f(o[k])
            __.isFunction(o[k]) && (o[k] = __.return(o[k], settings)) })
         )(settings)
         this.setting = settings
         typeof Sat !== 'undefined' && (Sat.setting = settings) }
      else if (__.isEmpty(Sat.settings))
        Sat.setting = Meteor.settings } }


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
      __.keys(Sat.part).forEach(k => this[k] = Sat.part[k].bind(Sat.part, view)) } }

__.Cube     = ()        => new Cube()
__.Module   = name      => new Module(name)
__.Parts    = parts     => new Parts(parts)
__.Settings = settings  => new Settings(settings)
__.View     = view      => [new View(view), __.module(view)]
__.Template = (...args) => args.slice(1)

typeof Meteor === "undefined" && (module.exports = __)
