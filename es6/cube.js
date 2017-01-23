'use strict'

let mongo = {connected:[]}

const mongoServer = cs =>
  __.keys(cs).filter(c => ! mongo.connected.includes(c)).map(k => {
      mongo.connected.push(k)
      db[k] = new Mongo.Collection(k)
      db[k].allow(__.return.call(this, cs[k].allow) || {
        insert: doc => false,
        update: (userId, doc, fields, modifier) => false,
        remove: (userId, doc) => false })
      db[k].deny(__.return.call(this, cs[k].deny) || {})
      Meteor.publish(k, cs[k].publish ? () => cs[k].publish.call(this) : () => db[k].find({}))
      cs[k].collections && mongoServer.call(this, cs[k].collections) })

const mongoClient = cs =>
  __.keys(cs).filter(c => ! mongo.connected.includes(c)).map(k => {
      mongo.connected.push(k)
      db[k] = new Mongo.Collection(k)
      Meteor.subscribe(k, cs[k].callback ? cs[k].callback.bind(this) : () => {})
      cs[k].collections && mongoClient.call(this, cs[k].collections) })

Meteor.startup(() => {
  let v, _
  if (Meteor.isServer) {
    __.keys(Sat.module).map(n => {
      _ = Sat.module[n]
      ;(v = _.method)        &&  Meteor.methods(v)
      ;(v = _.collection)    &&  mongoServer.call(_, v)
      ;(v = _.onServer)      &&  v.call(_) }) }
  else if (Meteor.isClient) {
    cube.installParts()
    __.keys(Sat.module).map(n => {
      _ = Sat.module[n]
      _.style                &&  cube.Style(_)
      ;(v = _.collection)    &&  mongoClient.call(_, v)
      ;(v = _.onstartup)     &&  v.call(_)
      ;(v = _.property.path) &&  Router.route(n, {path: v})
      ;(v = _.template())    && (Template[n] = new Template('Template.' + n, v))
      ;(v = _.event)         &&  Template[n].events(__.tideEventKey(v, __.key2id.bind(_)))
      ;(v = _.helper)        &&  Template[n].helpers(v)
      'onCreated onRendered onDestroyed'.split(' ').forEach(d => _[d.toLowerCase()] && Template[n][d](_[d.toLowerCase()])) })
    Router.configure({layoutTemplate: 'layout'}) } })

Router.route('/-/:shorten', (function() {
  this.response.writeHead(301, {
    Location: (() => {
      switch (this.params.shorten) {
        case 'flags.png':
          return '/packages/isaac_intl-tel-input/intl-tel-input/build/img/flags.png'
        case 'flags@2x.png':
          return '/packages/isaac_intl-tel-input/intl-tel-input/build/img/flags@2x.png'
        default:
          return Meteor.settings.shortens[this.params.shorten] || 'path-not-found' }
    }) + (this.params.query ? __.addQuery(this.params.query) : '')
  })
  this.response.end()
}), {where: 'server'})
