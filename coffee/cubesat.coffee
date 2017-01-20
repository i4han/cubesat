if !Meteor?
   global.cube = {}
   global.__ = require('underscore2').__


class Module
   constructor: (name) ->
      if Sat?
         if name of Sat.module
            return Sat.module[name]
         else Sat.module[name] = @
      @property = {}
      @style    = {}
      @helper   = {}
      @event    = {}
      @method   = {}
      @collection  = {}
      @property.name = name
      @property.label = __.capitalize name
   name: ->  @property.name
   local: (id) ->
      uniqueName = @name() + if @property.hash then '-' + @property.hash else ''
      if id[0] is '#' then '#' + uniqueName + '-' + id[1..] else uniqueName + '-' + id
   template: (template) ->
      if arguments.length is 0 then @_template
      else __.object @, '_template', template
   init: (f) -> @_init = f; @
   assign: (k, o) -> __.assign @[k], __.return.call @, o ; @
   properties:  (o) -> @_properties  = o ; @assign 'property',   o
   styles:      (o) -> @_styles      = o ; @assign 'style',      o
   helpers:     (o) -> @_helpers     = o ; @assign 'helper',     o
   events:      (o) -> @_events      = o ; @assign 'event',      o
   methods:     (o) -> @_methods     = o ; @assign 'method',     o
   collections: (o) -> @_collections = o ; @assign 'collection', o
   onStartup:   (f) -> __.object @, 'onstartup',   f
   onServer:    (f) -> __.object @, 'onserver',    f
   onRendered:  (f) -> __.object @, 'onrendered',  f
   onDestroyed: (f) -> __.object @, 'ondestroyed', f
   onCreated:   (f) -> __.object @, 'oncreated',   f
   fn: (o) -> __.eachKeys o, ((k) => console.log(k) or  @[k] = o[k].bind @) ; @
   $:  (v) -> $ @local v
   close: (name) ->
      name and (name isnt @name()) and console.error 'Created module name and close name doesn\'t match', name, @name()
      'style helper event method collection'.split(' ').forEach (p) => @assign p, @['_' + p + 's']
      @assign 'property', @_properties
      @_init and @_init.call @
      @
class Parts
   constructor: (parts) ->
      console.log parts
      @part = @part or {}
      @attrPart = @attrPart or {}
      parts = __.return.call __.return(parts), parts
      __.eachKeys parts, (k) =>
         __.isFunctionPartKey(k) and @part[k] = parts[k]
         __.isAttrPartKey(k)     and @attrPart[k] = parts[k]
      if Sat?
         __.assign Sat.part, @part
         __.assign Sat.attrPart, @attrPart

class Settings
   constructor: (settings) ->
      if !Meteor? or Meteor.isServer
         settings = __.return.call __.return(settings), settings
         (f = (o) -> __.keys(o).forEach (k) -> switch
            when __.isObject   o[k] then f o[k]
            when __.isFunction o[k] then o[k] = __.return.call settings, o[k]
         )(settings)
         @setting    = settings
         Sat.setting = settings if Sat?
      else if __.isEmpty Sat.settings then Sat.setting = Meteor.settings

class Cube
   constructor: ->
      @module  = {}
      @part    = {}
      @setting = {}
   add: (i) ->
      switch
         when i instanceof Module   then @module[i.name()] = i
         when i instanceof Parts    then __.assign @part,    i.part
         when i instanceof Settings then __.assign @setting, i.setting
      @

   finish: -> @

class View
   constructor: (view) ->
      @view = view
      __.keys(Sat.part).forEach (k) =>
         @[k] = Sat.part[k].bind Sat.part, view

cube.Cube     =            -> new Cube()
cube.Module   = (name)     -> new Module name
cube.Parts    = (parts)    -> new Parts  parts
cube.Settings = (settings) -> new Settings settings
cube.View     = (view)     -> [new View(view), __.module view]

###
cube.Template = (view) ->
   args = [].slice.call arguments
   args[1..]
###

module.exports = cube if !Meteor?
