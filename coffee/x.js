// Generated by CoffeeScript 1.6.2
var NotPxDefaultProperties, localTags, tideEventKey, valid, __idClassKey,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

if (typeof x === "undefined" || x === null) {
  global.x = {
    $: {}
  };
}

if (typeof Meteor === "undefined" || Meteor === null) {
  exports.x = x;
}

x.require = function(m) {
  return Npm.require(m);
};

x.keys = function(obj) {
  return Object.keys(obj);
};

x.isUndefined = function(v) {
  return 'undefined' === typeof v;
};

x.isFunction = function(v) {
  return 'function' === typeof v;
};

x.isString = function(v) {
  return 'string' === typeof v;
};

x.isNumber = function(v) {
  return 'number' === typeof v;
};

x.isScalar = function(v) {
  return x.isNumber(v) || x.isString(v);
};

x.isDigit = function(v) {
  return /^[0-9]+$/.test(v);
};

x.isArray = function(o) {
  if ('[object Array]' === Object.prototype.toString.call(o)) {
    return true;
  } else {
    return false;
  }
};

x.isObject = function(o) {
  if ('[object Object]' === Object.prototype.toString.call(o)) {
    return true;
  } else {
    return false;
  }
};

x.isEmptyArray = function(a) {
  return a.length === 0;
};

x.isEmptyObject = function(obj) {
  return x.isEmptyArray(x.keys(obj));
};

x.isEmpty = function(obj) {
  switch (false) {
    case obj !== (void 0) && obj !== null && obj !== '':
      return true;
    case !x.isArray(obj):
      return x.isEmptyArray(obj);
    case !x.isObject(obj):
      return x.isEmptyObject(obj);
    default:
      return false;
  }
};

x.isVisible = function(v) {
  if ('function' === typeof v) {
    return v();
  } else if (false === v) {
    return false;
  } else {
    return true;
  }
};

x.timeout = function(time, func) {
  return Meteor.setTimeout(func, time);
};

x.reduceKeys = function(obj, o, f) {
  return x.keys(obj).reduce(f, o);
};

x.__isPortableKey = function(v) {
  return /^[a-z]+$/i.test(v);
};

x.__isValue = function(v) {
  if (x.isScalar(v)) {
    return v;
  } else {
    return false;
  }
};

valid = {
  name: /^[a-zA-Z0-9._-]+$/,
  email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
};

x.valid = function(kind, v) {
  return valid[kind].test(v);
};

x.capitalize = function(str) {
  return str[0].toUpperCase() + str.slice(1);
};

x.camelize = function(str) {
  return str.replace(/-([a-z])/g, function(_, $1) {
    return $1.toUpperCase();
  }).replace(/\-/g, '$');
};

x.dasherize = function(str) {
  return str.replace(/\$/g, '-').replace(/([A-Z])/g, function($1) {
    return '-' + $1.toLowerCase();
  });
};

x.__dasherize = function(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
};

x.__toObject = function(a) {
  var v;

  if (void 0 === a) {
    return {};
  } else if (x.isObject(a)) {
    return a;
  } else if (x.isString(a)) {
    return ((v = {})[a] = '') || v;
  } else if (x.isArray(a)) {
    return a.reduce((function(o, v) {
      o[v[0]] = v[1];
      return o;
    }), {});
  } else {
    return {};
  }
};

x.toArray = function(str) {
  if (x.isArray(str)) {
    return str;
  } else if (x.isString(str)) {
    return str.split(' ');
  } else if (void 0 === str) {
    return [];
  } else {
    return str;
  }
};

x.__interpolate = function(str, o) {
  return str.replace(/{([^{}]*)}/g, function(a, b) {
    return x.isValue(o[b]) || a;
  });
};

x.__interpolateObj = function(o, data) {
  x.keys(o).map(function(k) {
    return o[k] = x.interpolate(o[k], data);
  });
  return o;
};

x.__interpolateOO = function(options, data) {
  x.isEmpty(data) || x.keys(options).map(function(m) {
    return options[m] = x.interpolateObj(options[m], data);
  });
  return options;
};

x["return"] = function(func, _this_) {
  if (x.isFunction(func)) {
    return func.call(_this_);
  } else {
    return func;
  }
};

x.assign = function(object, properties) {
  var key, val;

  for (key in properties) {
    val = properties[key];
    object[key] = val;
  }
  return object;
};

x.extend = x.assign;

x.remove = function(obj, key) {
  delete obj[key];
  return obj;
};

x.object = function(obj) {
  var args;

  args = [].slice.call(arguments);
  switch (false) {
    case !x.isObject(obj):
      obj[args[1]] = args[2];
      return obj;
    case !x.isArray(obj):
      return obj.reduce((function(o, a) {
        o[a[0]] = a[1];
        return o;
      }), {});
  }
};

x.__addProperty = function(obj, key, value) {
  return x.object(obj, key, value);
};

x.__value = function(value) {
  if ('number' === typeof value) {
    return value.toString() + 'px';
  } else if ('string' === typeof value) {
    return value;
  } else if ('function' === typeof value) {
    return value();
  } else {
    return value;
  }
};

x.__indentStyle = function(obj, depth) {
  if (depth == null) {
    depth = 1;
  }
  if (!x.isObject(obj)) {
    return obj;
  }
  return x.keys(obj).map(function(key) {
    var value;

    value = obj[key];
    key = x.isPortableKey(key) ? x.dasherize(key) : key;
    return (Array(depth).join('    ')) + (function() {
      switch (false) {
        case !x.isObject(value):
          return [key, x.indentStyle(value, depth + 1)].join('\n');
        case '' !== value:
          return key;
        case '' !== key:
          return x.value(value);
        default:
          return key + ' ' + x.value(value);
      }
    })();
  }).join('\n');
};

x.hash = function() {
  return ((Iron.Location.get().hash.slice(1).split('&')).map(function(a) {
    return a.split('=');
  })).reduce((function(p, c) {
    p[c[0]] = c[1];
    return p;
  }), {});
};

x.indentString = Array(3 + 1).join(' ');

x.indent = function(b, i, str) {
  if (i) {
    return b.replace(/^/gm, Array(i + 1).join(str || x.indentString));
  } else {
    return b;
  }
};

x.repeat = function(str, times) {
  return Array(times + 1).join(str);
};

x.__saveMustache = function(str) {
  return x.decode(x.decode(str, '{', 2), '}', 2);
};

x.__trim = function(str) {
  if (str != null) {
    return str.trim();
  } else {
    return null;
  }
};

x.__prettyJSON = function(obj) {
  return JSON.stringify(obj, null, 4);
};

x.__getValue = function(id) {
  var element;

  if (element = document.getElementById(id)) {
    return element.value;
  } else {
    return null;
  }
};

x.__trimmedValue = function(id) {
  var element;

  if (element = document.getElementById(id)) {
    return element.value.trim();
  } else {
    return null;
  }
};

x["__slice"] = function(str, tab, indent) {
  if (tab == null) {
    tab = 1;
  }
  if (indent == null) {
    indent = '    ';
  }
  return (((str.replace(/~\s+/g, '')).split('|')).map(function(s) {
    return s = 0 === s.search(/^(<+)/) ? s.replace(/^(<+)/, Array(tab = Math.max(tab - RegExp.$1.length, 1)).join(indent)) : 0 === s.search(/^>/) ? s.replace(/^>/, Array(++tab).join(indent)) : s.replace(/^/, Array(tab).join(indent));
  })).join('\n');
};

x.insertTemplate = function(page, id, data) {
  if (data == null) {
    data = {};
  }
  $('#' + id).empty();
  return Blaze.renderWithData(Template[page], Object.keys(data).length ? data : Template[page].helpers, document.getElementById(id));
};

x.currentRoute = function() {
  return Router.current().route.getName();
};

x.render = function(page) {
  return Template[page].renderFunction().value;
};

x.__renameKeys = function(obj, keyObject) {
  return _.each(_.keys(keyObject, function(key) {
    return x.reKey(obj, key, keyObject[key]);
  }));
};

x.rekey = function(obj, oldName, newName) {
  if (obj.hasOwnProperty(oldName)) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
  }
  return this;
};

x.__repeat = function(pattern, count) {
  var result;

  if (count < 1) {
    return '';
  }
  result = '';
  while (count > 0) {
    if (count & 1) {
      result += pattern;
    }
    count >>= 1;
    pattern += pattern;
  }
  return result;
};

x.__deepExtend = function(target, source) {
  var prop;

  for (prop in source) {
    if (prop in target) {
      x.deepExtend(target[prop], source[prop]);
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
};

x.flatten = function(obj, chained_keys) {
  var flatObject, i, j, toReturn, _i, _j, _len, _len1;

  toReturn = {};
  for (_i = 0, _len = obj.length; _i < _len; _i++) {
    i = obj[_i];
    if (typeof obj[i] === 'object') {
      flatObject = x.flatten(obj[i]);
      for (_j = 0, _len1 = flatObject.length; _j < _len1; _j++) {
        j = flatObject[_j];
        if (chained_keys) {
          toReturn[i + '_' + j] = flatObject[j];
        } else {
          toReturn[j] = flatObject[j];
        }
      }
    } else {
      toReturn[i] = obj[i];
    }
  }
  return toReturn;
};

x.position = function(obj) {
  return Meteor.setTimeout(function() {
    return $('#' + obj.parentId + ' .' + obj["class"]).css({
      top: obj.top,
      left: obj.left,
      position: 'absolute'
    });
  }, 200);
};

x.scrollSpy = function(obj) {
  var $$;

  $$ = $('.scrollspy');
  $$.scrollSpy();
  return ['enter', 'exit'].forEach(function(a) {
    return $$.on('scrollSpy:' + a, function() {
      if (obj[a] != null) {
        return obj[a][$(this).attr('id')]();
      }
    });
  });
};

x.calendar = function(fym, id_ym, items, top, bottom) {
  var $id, action, moment_ym, _i, _j, _ref, _ref1, _results, _results1;

  action = moment().format(fym) > id_ym ? 'prepend' : 'append';
  $(items)[action](DIV({
    "class": 'month',
    id: id_ym
  }));
  moment_ym = moment(id_ym, fym);
  top = $(window).scrollTop();
  ($id = $('#' + id_ym)).append(H2({
    id: id_ym
  }, moment_ym.format('MMMM YYYY')));
  (function() {
    _results = [];
    for (var _i = 1, _ref = parseInt(moment_ym.startOf('month').format('d')); 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).forEach(function(i) {
    return $id.append(DIV({
      "class": 'everyday empty',
      style: 'visibility:hidden'
    }));
  });
  (function() {
    _results1 = [];
    for (var _j = 1, _ref1 = parseInt(moment_ym.endOf('month').format('D')); 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; 1 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
    return _results1;
  }).apply(this).forEach(function(i) {
    var id;

    $id.append(DIV({
      "class": 'everyday',
      id: id = id_ym + ('0' + i).slice(-2)
    }));
    x.insertTemplate('day', id, {
      id: id
    });
    return x.contentEditable(id, function(_id) {
      var content, doc;

      id = $(_id).parent().attr('id');
      content = $(_id).html();
      switch ($(_id).attr('class')) {
        case 'title':
          console.log('title', id, content);
          if (doc = db.Calendar.findOne({
            id: id
          })) {
            return db.Calendar.update({
              _id: doc._id,
              $set: {
                title: content,
                event: doc.event
              }
            });
          } else {
            return db.Calendar.insert({
              id: id,
              title: content
            });
          }
          break;
        case 'event':
          console.log('event', id, content);
          if (doc = db.Calendar.findOne({
            id: id
          })) {
            return db.Calendar.update({
              _id: doc._id,
              $set: {
                title: doc.title,
                event: content
              }
            });
          } else {
            return db.Calendar.insert({
              id: id,
              event: content
            });
          }
      }
    });
  });
  if ('prepend' === action) {
    x.timeout(10, function() {
      return $(window).scrollTop(top + $id.outerHeight());
    });
    return $(top).data({
      id: id_ym
    });
  } else {
    return $(bottom).data({
      id: id_ym
    });
  }
};

x.windowFit = function(options) {
  var window_height, window_width;

  if (options.style && (window_width = $(window).width()) / (window_height = $(window).height()) > options.ratio) {
    options.style.remove('height').set('width', '100%');
    return options.selector.css('margin-left', '').css('margin-top', px((window_height - options.selector.height()) / 2));
  } else if (options.style) {
    options.style.remove('width').set('height', '100%');
    return options.selector.css('margin-top', '').css('margin-left', px((window_width - options.selector.width()) / 2));
  }
};

x.query = function() {
  return Iron.Location.get().queryObject;
};

x.addQuery = function(obj) {
  var result;

  if ((obj == null) || x.isEmpty(obj)) {
    return '';
  }
  if ((result = x.queryString(obj)).length > 0) {
    return '?' + result;
  } else {
    return '';
  }
};

x.queryString = function(obj, delimeter) {
  var i;

  if (delimeter == null) {
    delimeter = '&';
  }
  return ((function() {
    var _results;

    _results = [];
    for (i in obj) {
      _results.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
    }
    return _results;
  })()).join(delimeter);
};

x.decode = function(str, code, repeat) {
  var decode;

  decode = encodeURIComponent(code);
  return str.replace(new RegExp("(?:" + decode + "){" + repeat + "}(?!" + decode + ")", 'g'), x.repeat(code, repeat));
};

x.urlWithQuery = function(obj) {
  return obj.url + x.addQuery(obj.options.query);
};

x.oauth = function(obj) {
  x.isString(obj) && (obj = Settings[obj].oauth);
  return x.urlWithQuery(obj);
};

x.__list = function(what) {
  return ((what = 'string' === typeof what ? what.split(' ') : Array.isArray(what) ? what : []).map(function(a) {
    return "." + a + " {{" + a + "}}";
  })).join('\n');
};

x.sidebar = function(list, id) {
  if (id == null) {
    id = 'sidebar_menu';
  }
  return {
    list: list,
    jade: {
      'each items': {
        '+menu_list': ''
      }
    },
    helpers: {
      items: function() {
        return list.map(function(a) {
          return {
            name: a,
            id: id
          };
        });
      }
    }
  };
};

x.assignPopover = function(o, v) {
  return x.assign(o, 'focus input#' + v, function() {
    return $('input#' + v).attr('data-content', x.render('popover_' + v)).popover('show');
  });
};

x.popover = function(list) {
  return list.reduce((function(o, v) {
    return x.assignPopover(o, v);
  }), {});
};

x.log = function() {
  return (arguments !== null) && ([].slice.call(arguments)).concat(['\n']).map(function(str) {
    if (Meteor.isServer) {
      return fs.appendFileSync(Config.log_file, str + ' ');
    } else {
      return console.log(str);
    }
  });
};

__idClassKey = function(key, fid, seperator) {
  var r;

  while ((r = new RegExp(/\[(#?[a-z_]+[0-9]+)\]/)).test(key)) {
    key = key.replace(r, function(m, $1) {
      return fid($1);
    });
  }
  if (!(/^[a-zA-Z0-9_$]+$/.test(key) && /[0-9_$]+/.test(key))) {
    return key;
  }
  return key.split('_').map(function(a, i) {
    switch (false) {
      case '' !== a:
        return null;
      case !/^[a-z_]+[0-9]+$/.test(a):
        return '#' + fid(a);
      case 0 !== i:
        return a;
      default:
        return '.' + x.dasherize(a);
    }
  }).filter(function(f) {
    return f;
  }).join(seperator);
};

x.__tideKey = function(obj, fid, seperator) {
  if (!x.isObject(obj)) {
    return obj;
  }
  return x.keys(obj).reduce((function(o, k) {
    var ok;

    switch (false) {
      case '$' !== k[0]:
        return commandKey(o, k);
      case !(/^[A-Z]+$/.test(k) || /^H[1-6]$/.test(k)):
        return htmlKey(o, k);
      default:
        o[idClassKey(k, fid, seperator)] = x.isObject(ok = obj[k]) ? x.tideKey(ok, fid, seperator) : ok;
        return o;
    }
  }), {});
};

tideEventKey = function(key, fid) {
  var re;

  while ((re = new RegExp(/(\s+)\[(#[a-z_]+[0-9]+)\](,|\s+|$)/)).test(key)) {
    key = key.replace(re, function(m, $1, $2, $3) {
      return $1 + fid($2) + $3;
    });
  }
  return key;
};

x.tideEventKey = function(obj, fid) {
  return x.keys(obj).reduce((function(o, k) {
    return x.object(o, tideEventKey(k, fid), obj[k]);
  }), {});
};

NotPxDefaultProperties = 'zIndex fontWeight'.split(' ');

x.__tideValue = function(obj) {
  if (!x.isObject(obj)) {
    return obj;
  }
  return x.keys(obj).reduce((function(o, k) {
    var ok;

    o[k] = (function() {
      switch (false) {
        case !x.isObject(ok = obj[k]):
          return x.tideValue(ok);
        case 0 !== ok:
          return '0';
        case 'number' !== typeof ok:
          return String(ok) + (__indexOf.call(NotPxDefaultProperties, k) >= 0 ? '' : 'px');
        default:
          return ok;
      }
    })();
    return o;
  }), {});
};

"class x.Module\n    constructor: (name) ->\n        @name = name\n    id: (str) ->\n        if str.indexOf(' ') > -1 then str.split(' ').map (s) => \n            '#' + window.Module[@name].block + '-' + @name + '-' + s\n        else '#' + window.Module[@name].block + '-' + @name + '-' + str    \n    _instance: (i) -> @instance = i";

localTags = function(f, m) {
  var tags;

  return (tags = f.toString().match(/(this\.H[1-6]|this\.[A-Z]+)[^\w]/g)) && tags.map(function(tag) {
    return tag.match(/[A-Z]+[1-6]?/)[0];
  }).forEach(function(tag) {
    return m[tag] = global[tag].bind(m);
  });
};

x.f = {
  id: 'Id'
};

x.module = function(name, m) {
  m.name = name;
  m.label = m.label || x.capitalize(name);
  m.block = m.block || 'x';
  (m.fn = x["return"](m.fn, m)) && x.keys(m.fn).forEach(function(f) {
    return m[f] = m.fn[f];
  });
  m[x.f.id] = m.fn && m.fn[x.f.id] || function(id) {
    if (id[0] === '#') {
      return '#' + name + '-' + id.slice(1);
    } else {
      return name + '-' + id;
    }
  };
  return m.template && localTags(m.template, m);
};

x.Style = (function() {
  function Style(selector) {
    var sheets, _i, _ref, _results,
      _this = this;

    this.selector = selector;
    this.rules = this.style = null;
    (function() {
      _results = [];
      for (var _i = 0, _ref = (sheets = document.styleSheets).length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).forEach(function(i) {
      var rules, _i, _ref, _ref1, _results;

      return ((typeof sheets !== "undefined" && sheets !== null ? (_ref = sheets[i]) != null ? _ref.cssRules : void 0 : void 0) != null) && (function() {
        _results = [];
        for (var _i = 0, _ref1 = (rules = sheets[i].cssRules).length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).forEach(function(j) {
        if (rules[j] && rules[j].selectorText === selector) {
          _this.rules = rules[j];
          return _this.style = rules[j].style;
        }
      });
    });
  }

  Style.prototype.set = function(property, value) {
    this.style.setProperty(property, value);
    return this.instance;
  };

  Style.prototype.get = function(property) {
    return this.style[property];
  };

  Style.prototype.remove = function(property) {
    this.style[property] && this.style.removeProperty(property);
    return this.instance;
  };

  Style.prototype._instance = function(i) {
    return this.instance = i;
  };

  return Style;

})();

x.style = function(name) {
  var i;

  return (i = new x.Style(name))._instance(i);
};

x.removeRule = function(selector, property) {
  var sheets, _i, _ref, _results;

  return (function() {
    _results = [];
    for (var _i = 0, _ref = (sheets = document.styleSheets).length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).forEach(function(i) {
    var rules, _i, _ref, _ref1, _results;

    return ((typeof sheets !== "undefined" && sheets !== null ? (_ref = sheets[i]) != null ? _ref.cssRules : void 0 : void 0) != null) && (function() {
      _results = [];
      for (var _i = 0, _ref1 = (rules = sheets[i].cssRules).length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).forEach(function(j) {
      if (rules[j] && rules[j].selectorText === selector) {
        if (x.isArray(property)) {
          return property.map(function(p) {
            return rules[j].style.removeProperty(p);
          });
        } else {
          return rules[j].style.removeProperty(property);
        }
      }
    });
  });
};

x.removeRules = function(obj) {
  return x.isObject(obj) && x.keys(obj).forEach(function(k) {
    return x.removeRule(k, obj[k]);
  });
};

x.insertRule = function(rule) {
  if (o.stylesheet.insertRule) {
    return o.stylesheet.insertRule(rule);
  } else {
    return o.stylesheet.addRule(rule);
  }
};