'use strict'

let mongo = {connected:[]}
__._db = {}

const mongoServer = (m, cs) => {
  __.isArray(cs) && (console.log('array') || (cs = __.object({}, cs, Array(cs.length).fill({}))))
  __.keys(cs).filter(k => ! mongo.connected.includes(k)).map(k => {
      mongo.connected.push(k)
      __._db[k] = new Mongo.Collection(k)
      __._db[k].allow(__.return.call(m, cs[k].allow) || {
        insert: doc => false,
        update: (userId, doc, fields, modifier) => false,
        remove: (userId, doc) => false })
      __._db[k].deny(__.return.call(m, cs[k].deny) || {})
      console.log('', k, __._db[k].find({}).count(), 'documents.' )
      Meteor.publish(k, cs[k].publish ? () => cs[k].publish(m) : () => __._db[k].find({}))
      cs[k].collections && mongoServer(m, cs[k].collections) }) }
      //__.serverMongoConnected(k)


const mongoClient = (m, cs) => {
  __.isArray(cs) && (console.log('array') || (cs = __.object({}, cs, Array(cs.length).fill({}))))
  __.keys(cs).filter(k => ! mongo.connected.includes(k)).map(k => {
      mongo.connected.push(k)
      __._db[k] = new Mongo.Collection(k)
      Meteor.subscribe(k, cs[k].callback ? cs[k].callback.bind(m, m) : () => {})
      cs[k].collections && mongoClient(m, cs[k].collections) })
      m.collection = cs}

const head = o => __.eachKeys(o, k => $('head').append(HTML.toHTML(HTML[k.toUpperCase()](o[k]))))

const router = (o, m) => {
    // console.log('Router', o, )
    o.defaultLayout && (Router.configure({layoutTemplate: m._.name}), __.pop('defaultLayout'))
    o.layout        && __.reKey(o, 'layout', 'layoutTemplate')
    __.isEmpty(o)   || Router.route(m._.name, o)
}


Meteor.startup(() => {
  let v, _
  if (Meteor.isServer) {
    __.keys(Sat.module).map(n => {
      _ = Sat.module[n]
      ;(v = _._.methods)     &&  Meteor.methods(v)
      ;(v = _._.mongo)       &&  mongoServer(_, v)
      ;(v = _._.onServer)    &&  v.call(_) }) }
  else if (Meteor.isClient) {
    cube.installParts()
    __.keys(Sat.module).map(n => {
      _ = Sat.module[n]
      _._.style              &&  cube.Style(_._)
      ;(v = _._.head)        &&  head(v)
      ;(v = _._.router)      && (__.isEmpty(v) || router(v, _))
      ;(v = _._.mongo)       &&  mongoClient(_, v)
      ;(v = _._.onStartup)   &&  v.call(_, _)
      ;(v = _.property.path) &&  Router.route(n, {path: v, layoutTemplate: _.property.layout || 'layout'})
      ;(v = _.template())    && (Template[n] = new Template('Template.' + n, v))
      ;(v = _._.events)      &&  Template[n] && Template[n].events(__.tideEventKey(v, __.key2id.bind(_)))
      ;(v = _._.helpers)     &&  Template[n] && Template[n].helpers(v) // __.function(v)
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
