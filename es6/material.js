'use strict'

window.blaze = {}
window.cube  = {}
window.html  = {}
window.part  = {}

cube.lookup       = (_, v) => Spacebars.call(_.lookup(v))
cube.lookupInView = (_, v) => Blaze.View('lookup:' + v, () => Spacebars.mustache(_.lookup(v)))
cube.lookupInAttr = (_, v) => Spacebars.mustache(_.lookup(v))

const htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.toUpperCase().split(' ')
let attributeClass = (key, value) => __.isString(value) ? value.replace(/\*/g, __.key2class(key)) : __.key2class(key)

const htmlEntities = { '123': '{', '125': '}' }

let displayValue = (v) =>
  __.maybeHtmlEntity(v) ? v.replace(/&#([0-9]{3});/g, (m, $1) => $1 in htmlEntities ? htmlEntities[$1] : m) : v

let mustacheAttr = (v, f) =>
  __.isEmpty(v) ? '' :
  __.isArray(v) ? () => v :
  __.maybeMustache(v) ? v.split(/[{}]/).map( (v, i) => i % 2 === 1 ? f(v) : displayValue(v) ).filter( (v) => v ) :
    displayValue(v)

let blazeAttr = (_, obj) => {
  let f  = cube.lookupInAttr.bind(null, _)
  let fo = __.fixup.call({ part: Sat.attrPart }, obj)
  let o  = __.reduceKeys(fo, {}, (o, k) =>
      __.check('class', k) && fo[k].indexOf('*') > -1 ?
        __.object(o, 'class', mustacheAttr(attributeClass(k, fo[k]), f)) :
      'local' === k ?
        __.object(o, 'id', __.isBlazeView(_) ? __.key2id.call(__.module(_), fo[k]) : mustacheAttr(fo[k], f)) :
        __.object(o, k, mustacheAttr(fo[k], f)))
  return __.keys(o).length === 1 && o[__.theKey(o)] === '' ? __.theKey(o) : o }

let mustache = (_, a) => {
  let f = cube.lookupInView.bind(null, _)
  return __.isArray(a) ? __.reduce(a, [], (o, v) => __.array(o, mustacheAttr(v, f))) : mustacheAttr(a, f) }

cube.installParts = () => __.eachKeys(Sat.part, (k) => part[k] = Sat.part[k])

htmlTags.forEach(tag =>
  html[tag] = (_, ...obj) =>
    __.isBlazeAttr(obj[0]) ?
      obj.length === 1 ? HTML[tag](blazeAttr(_, obj[0])) :
                         HTML[tag](blazeAttr(_, obj[0]), mustache(_, obj.slice(1))) :
      obj.length === 0 ? HTML[tag]() :
                         HTML[tag](mustache(_, obj)))

cube.Head = (...a) => a.slice(1).forEach((v) => $('head').append(HTML.toHTML(v)))

cube.Switch = function(_) {
  var args, condition, len;
  args = [].slice.call(arguments);
  args[2] && (__.isString(args[1]) ? condition = (function() {
    return Spacebars.call(_.lookup(args[1]));
  }) : condition = function() {
    return args[1];
  });
  switch (false) {
    case (len = args.length) !== 2:
      return args[1]();
    case len !== 3:
      return Blaze.If(condition, args[2], function() {
        return [];
      });
    case !(len > 3):
      return Blaze.If(condition, args[2], function() {
        return [cube.Switch.apply(null, [_].concat(args.slice(3)))];
      });
  }
};

cube.include      = (_, name)        => Spacebars.include(_.lookupTemplate(name))
cube.includeBlock = (_, name, block) => Spacebars.include(_.lookupTemplate(name), block)

cube.includeAttrBlock = (_, name, attr, block) => Blaze._TemplateWith(
  () => blazeAttr(_, attr),
  () => Spacebars.include(_.lookupTemplate(name), block))

cube.includeAttr      = (_, name, attr)        => Blaze._TemplateWith(
  () => blazeAttr(_, attr),
  () => Spacebars.include(_.lookupTemplate(name)))

blaze.Include = (_, name, ...a) =>
  __.isUndefined(a) ? cube.include(_, name) :
  a.length === 1 && __.isBlazeElement(a[0]) ? cube.includeBlock(_, name, () => a) :
  a.length > 1 ? cube.includeAttrBlock(_, name, a[0], () => a.slice(1)) :
    cube.includeAttr(_, name, a[0])

;['Each', 'With'].forEach(tag => blaze[tag] = (_, lookup, func) => Blaze[tag](() => cube.lookup(_, lookup), func))
;['If'].forEach(tag => blaze[tag] = (_, lookup, f_then, f_else) => Blaze[tag](() => cube.lookup(_, lookup), f_then, f_else))

let idclassKey = function(k) {  // don't use arrow function 'this'
  switch (false) {
    case !__.check('local', k):
      return '#' + __.key2id.call(this, __.getLocal(k));
    case !__.check('class', k):
      return '.' + __.key2class(k);
    default:
      return k;
  }
};

let styleMediaQuery = k => k
let styleLoop = function(obj) {
  return __.reduceKeys(obj, {}, (function(_this) {
    return function(o, k) {
      var idk;
      switch (false) {
        case k[0] !== '@':
          return __.object(o, styleMediaQuery(k), styleLoop.call(_this, obj[k]));
        case k === (idk = idclassKey.call(_this, k)):
          return __.object(o, idk, obj[k]);
        default:
          return __.object(o, k, obj[k]);
      }
    };
  })(this));
};

cube.Style = function(_) {
  var obj;
  _.part = Sat.attrPart;
  return style$(__.reduceKeys((obj = __.fixup.call(_, _.style)), {}, (function(_this) {
    return function(o, k) {
      return __.object(o, idclassKey.call(_, k), styleLoop.call(_, obj[k]));
    };
  })(this)));
};
