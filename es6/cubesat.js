'use strict'

typeof Meteor === "undefined" && (global.cube = {}, global.__ = require('underscore2').__)

class Module {
   constructor(name) {
      if (typeof Sat !== 'undefined')
         if (name in Sat.module)
            return Sat.module[name]
         else Sat.module[name] = this
      this.property = {}
      this.style    = {}
      this.helper   = {}
      this.event    = {}
      this.method   = {}
      this.collection  = {}
      this.property.name  = name
      this.property.label = __.capitalize(name) }
   name() { return this.property.name }
   local(id) {
      let uniqueName = this.name() + (this.property.hash ? '-' + this.property.hash : '')
      return id[0] === '#' ? '#' + uniqueName + '-' + id.slice(1) : uniqueName + '-' + id }
   template(template) {
      return typeof template === 'undefined' ? this._template : __.object(this, '_template', template) }
   init(f) {
     this._init = f
     return this }
   assign(k, o) {
     __.assign(this[k], __.return.call(this, o))
     return this }
   properties (o) { this._properties  = o; return this.assign('property',   o) }
   styles     (o) { this._styles      = o; return this.assign('style',      o) }
   helpers    (o) { this._helpers     = o; return this.assign('helper',     o) }
   events     (o) { this._events      = o; return this.assign('event',      o) }
   methods    (o) { this._methods     = o; return this.assign('method',     o) }
   collections(o) { this._collections = o; return this.assign('collection', o) }
   onStartup  (f) { return __.object(this, 'onstartup',   f) }
   onServer   (f) { return __.object(this, 'onserver',    f) }
   onRendered (f) { return __.object(this, 'onrendered',  f) }
   onDestroyed(f) { return __.object(this, 'ondestroyed', f) }
   onCreated  (f) { return __.object(this, 'oncreated',   f) }
   fn(o) {
     __.eachKeys(o, k => this[k] = o[k].bind(this))
     return this }
   $ (v) { return $(this.local(v)) }
   close(name) {
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
      parts = __.return.call(__.return(parts), parts)
      __.eachKeys(parts, k => {
         __.isFunctionPartKey(k) && (this.part[k] = parts[k])
         __.isAttrPartKey(k)     && (this.attrPart[k] = parts[k]) })
      if (typeof Sat !== 'undefined') {
         __.assign(Sat.part, this.part)
         __.assign(Sat.attrPart, this.attrPart) } } }

class Settings {
   constructor(settings) {
      let f
      if (__.isMeteorServer()) {
         settings = __.return.call(__.return(settings), settings)
         ;(f = o => __.keys(o).forEach(k => {
            __.isObject(o[k]) && f(o[k])
            __.isFunction(o[k]) && (o[k] = __.return.call(settings, o[k])) })
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
   add(i) {
      i instanceof Module   ? (this.module[i.name()] = i)   :
      i instanceof Parts    ? __.assign(this.part, i.part)  :
      i instanceof Settings ? __.assign(this.setting, i.setting) : undefined
      return this }
   finish() { return this } }

class View {
   constructor(view) {
      this.view = view
      __.keys(Sat.part).forEach(k => this[k] = Sat.part[k].bind(Sat.part, view)) } }

cube.Cube     = ()        => new Cube()
cube.Module   = name      => new Module(name)
cube.Parts    = parts     => new Parts(parts)
cube.Settings = settings  => new Settings(settings)
cube.View     = view      => [new View(view), __.module(view)]
cube.Template = (...args) => args.slice(1)

typeof Meteor === "undefined" && (module.exports = cube)
