#!/usr/bin/env node

//const nconf    = require('nconf')
// Settings should be in lib/settings.js
// so you don't need to generate settings.json

const fs       = require('fs')
const path     = require('path')
const dotenv   = require('dotenv')
const ref      = require('child_process'), spawn = ref.spawn, exec = ref.exec
const __       = require('cubesat')
const in$      = require('incredibles')

let command      = process.argv[2]
const argv         = require('minimist')(process.argv.slice(3))
const add          = path.join
const home         = process.env.HOME
const cwd          = process.cwd()
const coffee_ext   = '.coffee'
const index_js     = 'index.js'
const package_js   = 'package.js'
const package_json = 'package.json'
const lib_dir      = 'lib'
const client_dir   = 'client'
const public_dir   = 'public'
const packages_dir = 'packages'

let taskBook = in$({})

class Task {
    constructor (name, fn, options) {
        this._name = name
        this._fn = fn
        this._ = options || {}
        taskBook[name] = in$(this) }
}

findRoot = d => {
  let dir_list = process.cwd().split('/')
  while ( dir_list.length && ! fs.existsSync( add(dir_list.join('/'), d) ) )
    dir_list.pop()
  return dir_list.join('/')  }

__.require = f => delete require.cache[f] && require(f)

const dot_sat      = '.sat'
const dot_cubesat  = '.cubesat'
const dot_env      = '.env'
const site_path    = findRoot(dot_sat)
const dot_sat_path = add(site_path, dot_sat)
const cubesat_path = findRoot(dot_cubesat)
const dot_cubesat_path = add(cubesat_path || home, dot_cubesat) // should be error? .cubesat doesn't exist?
const settings_path    = add(dot_cubesat_path, 'settings.js')
const node_modules = process.env.NODE_MODULES || findRoot('node_modules') || home
const paths2test   = 'client server lib public private resources'.split(' ')
const paths2watch  = [home, cubesat_path, dot_cubesat_path, site_path, dot_sat_path, node_modules] // the order is significant
// third command

let tasks, options
main()

if (! command) command = 'help'  // empty command means 'sat help'
const task_command = tasks[__.camelize(command)]
const arg0 = argv._[0]

const error = e => e && (console.error(e) || true)
const error_quit = e => {
  console.error(e)
  process.exit(1) }

task_command || error_quit(`fatal: Unknown command "${command}"`)
task_command.dotsat && (site_path || error_quit(`fatal: You must run it in .sat working directory or its subdirectory.`))
task_command.arg0   && (arg0      || error_quit(`error: You need to specify app or package name for the third argument.`))

const test_dir = task_command.test && arg0 ? arg0 : 'test'
const test_path = add(cubesat_path, test_dir)
task_command.test   && (fs.existsSync(test_path) || error_quit(`fatal: test path "${test_path}" does not exist. `))

if (test_path) {
  test_client_path     = add(test_path, client_dir)
  test_lib_path        = add(test_path, lib_dir)
  test_public_path     = add(test_path, public_dir)
  test_packages_path   = add(test_path, packages_dir)
  cubesat_package_path = add(test_packages_path, 'isaac:cubesat')
  jqx_package_path     = add(test_packages_path, "isaac:jquery-x")
  sq_package_path      = add(test_packages_path, "isaac:style-query")
  u2_package_path      = add(test_packages_path, 'isaac:underscore2') }

const path_info = in$( pathInfo() )
const package_paths = __.keys(path_info).filter(k => 'package' === path_info[k].type).map(k => path_info[k].path)
// const publish_paths = __.keys(path_info).filter(k => path_info[k].publish).map(k => path_info[k].path)

const dotenv_conf = () => {
    let last_path, paths = paths2watch
    while (paths.length && ! fs.existsSync(add(last_path = paths.shift(), '.env'))) {}
    last_path.length && dotenv.config({path: last_path}) }   // dotenv has not used yet.

let build_path, site_js, index_js_path, mobile_config_js, settings_json, client_path, lib_path
let f, r, s

const loadSettings  = f => (fs.existsSync(f) && __.return(r = __.require(f).setting, __.return(r))) || {}

if (site_path) {
  build_path    = site_path
  site_js       = fs.readdirSync(site_path).filter(f => '.js' === path.extname(f))
  index_js_path    = add(site_path, index_js)
  mobile_config_js = add(site_path, 'mobile-config.js')
  settings_json    = add(site_path, '.settings.json')
  client_path      = add(site_path, client_dir)
  lib_path         = add(site_path, lib_dir)

  init_settings = () => __.assign(Settings = loadSettings(settings_path), loadSettings(index_js_path))
  task_command.settings && init_settings() }

let json
const settings = () =>
    init_settings() && fs.readFile(settings_json, 'utf-8', (e, data) =>
        (data === (json = JSON.stringify(Settings, '', 4) + '\n')) ||
            fs.writeFile(settings_json, json, e => console.log(new Date() + ' Settings are written.')) )

const cd = d => process.chdir(d)
const mkdir = (dir, path, f) => cd(path) && fs.mkdir(dir, e => e || f(dir, path))
const cp = (s, t) => fs.createReadStream(s).pipe(fs.createWriteStream(t))

const spawn_command = (bin, command, args, path) => {
  console.log('  ', ([bin, command].concat(args)).join(' '))
  path && ( cd(path) || console.log('  ', path) )
  return spawn(bin, [command].concat(args), {stdio: 'inherit'}) }

// var Settings, __RmCoffee_paths, __commands, __func, __rmdir, __start_up, _tagLine
// var addAttribute, attributeBracket, attributeClass, attributeParse, attributes, baseUnits, block, build
// var codeLine, codeStr, coffee, coffee_clean, create, create_test, cssDefaults, cubesat_package_path
// var deploy, directives, env, findRoot, fix_later__coffee_compile, fixup
// var github_url, gitpass, htmlAttributes, htmlNoEndTags
// var idClassKey, includeAttributes, indentStyle, indexSettings, init_settings, install_mobile, ionAttributes, isHtmlAttribute
// var mcTable, mc_obj, meteor_create , meteor_publish, meteor_refresh, meteor_update
// var mobile_config, my_packages
// var newTab, npm_install, npm_publish, npm_refresh, npm_update, rePublish, readWrite, ref1, run
// var seperators, strOrObj, styleLoop, styleMediaQuery
// var tagLine, task, test, test_client_path, test_lib_path, test_packages_path, test_public_path, toStyle
// var update_all, with_test, writeBuild

var indexOf = [].indexOf

mobile_config = function() {
  var data, o;
  settings();
  init_settings();
  data = __.keys(o = Settings.app).map(function(k) {
    var ref2, ref3;
    if ((ref2 = mcTable[k]) != null ? ref2.list : void 0) {
      return __.keys(o[k]).map(function(l) {
        return 'App.' + k + '("' + l + '", ' + strOrObj(o[k][l]) + ');';
      }).join('\n') + '\n\n';
    } else if (__.isArray(o[k])) {
      return o[k].map(function(l) {
        return 'App.' + k + '("' + l + '");';
      }).join('\n') + '\n\n';
    } else {
      return 'App.' + k + '({' + (((ref3 = mcTable[k]) != null ? ref3.f : void 0) || mc_obj)(o[k]) + '\n});\n\n';
    }
  }).join('');
  return fs.readFile(mobile_config_js, 'utf-8', function(e, d) {
    return d === data || fs.writeFile(mobile_config_js, data, function(e) {
      return console.log(new Date() + ' ' + mobile_config_js + ' is written.')
    })
  })
}

/*
mc_obj = function(o) {
  return '\n' + __.keys(o).map(function(k) {
    return '   ' + k + ': "' + o[k] + '"';
  }).join(',\n');
};

mcTable = {
  setPreference:   { list: true },
  configurePlugin: { list: true }
}

strOrObj = function(o) {
  if (__.isObject(o)) {
    return '{\n' + __.keys(o).map(function(k) {
      return '   ' + k + ': "' + o[k] + '"';
    }).join(',\n') + '\n}';
  } else {
    return '"' + o + '"';
  }
};

writeBuild = function(it, data) {
  var fwrite;
  if (__.isUndefined(data) || (__.isString(data) && data.length === 0)) {
    return fs.unlink(add(client_path, it.file), function(e) {
      return e || console.log((new Date) + ' ' + it.file + ' has removed');
    });
  } else {
    return fs.readFile(fwrite = add(client_path, it.file), 'utf8', function(err, d) {
      data = (it.header || '') + data + (it.footer || '');
      return ((d == null) || data !== d) && fs.writeFile(fwrite, data, function(e) {
        return console.log(new Date(), fwrite);
      });
    });
  }
};

fixup = function(v) {
  var r;
  switch (false) {
    case !(v == null):
      return {};
    case !__.isString(v):
      return __.object({}, v, '');
    case !__.isFunction(v):
      if (__.isScalar(r = __["return"](v, this))) {
        return r;
      } else {
        return fixup.call(this, r);
      }
    case !__.isArray(v):
      return v.reduce((function(o, w) {
        return __.assign(o, fixup.call(this, w));
      }), {});
    case !__.isObject(v):
      return __.reduceKeys(v, {}, (function(_this) {
        return function(o, k) {
          if ('$' === k[0] && k in Parts) {
            return __.assign(o, fixup.call(_this, Parts[k].call(_this, v[k])));
          } else {
            return __.object(o, k, (__.isScalar(r = v[k]) ? r : fixup.call(_this, r)));
          }
        };
      })(this));
  }
};

seperators = {
  jade: '',
  jade$: ''
};

baseUnits = {
  zIndex: '',
  fontWeight: ''
};

newTab = '_';

cssDefaults = function(obj) {
  if (!__.isObject(obj)) {
    return obj;
  }
  __.keys(obj).forEach(function(k) {
    var ok;
    return obj[k] = (function() {
      switch (false) {
        case 0 !== (ok = obj[k]):
          return '0';
        case !__.isObject(ok):
          return cssDefaults(ok);
        case !__.isNumber(ok):
          return String(ok) + (k in baseUnits ? baseUnits[k] : 'px');
        default:
          return ok;
      }
    })();
  });
  return obj;
};

idClassKey = function(key, s) {
  var r;
  if (s == null) {
    s = '';
  }
  while ((r = new RegExp(/\[(#?[a-z]+[0-9]+)\]/)).test(key)) {
    key = key.replace(r, (function(_this) {
      return function(m, $1) {
        return __.key2id.call(_this, $1);
      };
    })(this));
  }
  switch (false) {
    case !__.check('id', key):
      return '#' + __.key2id.call(this, key);
    case !__.check('class', key):
      return '.' + __.key2class(key);
    case !__.check('id&class', key):
      return key.split('_').map((function(_this) {
        return function(a, i) {
          switch (false) {
            case '' !== a:
              return null;
            case !__.check('id', a):
              return '#' + __.key2id.call(_this, a);
            case !__.check('class', '_' + a):
              return '.' + __.key2class(a);
            default:
              return console.error('Unknown ID or class:', a);
          }
        };
      })(this)).filter(function(f) {
        return f;
      }).join(s);
    default:
      return key;
  }
};

styleMediaQuery = function(k) {
  return k;
};

styleLoop = function(obj) {
  return __.reduceKeys(obj, {}, (function(_this) {
    return function(o, k) {
      var idk;
      switch (false) {
        case k[0] !== '@':
          return __.object(o, styleMediaQuery(k), styleLoop.call(_this, obj[k]));
        case !(k in Parts):
          return __.assign(o, Parts[k].call(_this, obj[k]));
        case k === (idk = idClassKey.call(_this, k)):
          return __.object(o, idk, obj[k]);
        default:
          return __.object(o, k, obj[k]);
      }
    };
  })(this));
};

toStyle = function(d) {
  var obj;
  return cssDefaults(__.reduceKeys((obj = fixup.call(this, this[d])), {}, (function(_this) {
    return function(o, k) {
      return __.object(o, idClassKey.call(_this, k, ' '), styleLoop.call(_this, obj[k]));
    };
  })(this)));
};

indentStyle = function(obj, depth) {
  if (depth == null) {
    depth = 1;
  }
  if (!__.isObject(obj)) {
    return obj;
  }
  return __.keys(obj).map(function(key) {
    var value;
    return Array(depth).join(__.indentString || '  ') + (__.isObject(value = obj[key]) ? [key, indentStyle(value, depth + 1)].join('\n') : key + ' ' + value);
  }).join('\n');
};

attributeClass = function(key, value) {
  if (value) {
    return value.replace(/\/g, __.key2class(key));
  } else {
    return __.key2class(key);
  }
};

addAttribute = function(o, attr, value, seperator) {
  if (seperator == null) {
    seperator = ' ';
  }
  return __.object(o, attr, o[attr] && o[attr].length > 0 ? o[attr] + seperator + value : value);
};

attributeParse = function(obj, seperator, fixKeys) {
  var p;
  if (fixKeys == null) {
    fixKeys = true;
  }
  return __.keys(p = __.reduceKeys(obj, {}, function(o, k) {
    switch (false) {
      case !__.check('class', k):
        return addAttribute(o, 'class', attributeClass(k, obj[k]));
      case !('id' === k && __.check('id', obj[k]) && __.isModule(this)):
        return __.object(o, 'id', __.key2id.call(this, obj[k]));
      case k !== 'class':
        return addAttribute(o, 'class', obj[k]);
      default:
        return __.object(o, (fixKeys ? __.key2attribute(k) : k), obj[k]);
    }
  })).map(function(k) {
    switch (false) {
      case '' !== p[k]:
        return k;
      case !__.isBoolean(p[k]):
        return k + '=' + p[k];
      default:
        return k + '="' + __.parseValue(p[k]) + '"';
    }
  }).filter(function(v) {
    return v;
  }).join(seperator || ' ');
};

attributeBracket = function(obj) {
  var o;
  delete (o = __.assign({}, obj))[newTab];
  if (__.isEmpty(o)) {
    return '';
  } else {
    return '(' + attributeParse.call(this, o) + ')';
  }
};

codeLine = function(o, tag, obj) {
  var _class;
  __.check('class', _class = __.theKey(obj)) && __.isObject(obj[_class]) && __.remove(__.assign(__.object(obj, 'class', __.key2class(_class)), obj[_class]), _class);
  return __.object(o, tag + attributeBracket.call(this, obj), newTab in obj ? __.parseValue(obj[newTab]) : '');
};

attributes = function(obj) {
  var o;
  delete (o = __.assign({}, obj))[newTab];
  if (__.isEmpty(o)) {
    return '';
  } else {
    return ' ' + attributeParse.call(this, o);
  }
};

ionAttributes = function(o) {
  if (__.isEmpty(o)) {
    return '';
  } else {
    return ' ' + attributeParse(o, ' ', false);
  }
};

htmlNoEndTags = 'area base br col command embed hr img input link meta param source'.split(' ');

codeStr = function(tag, obj) {
  var _class;
  __.check('class', _class = __.theKey(obj)) && __.isObject(obj[_class]) && __.remove(__.assign(__.object(obj, 'class', __.key2class(_class)), obj[_class]), _class);
  return '<' + tag + attributes.call(this, obj) + '>' + (newTab in obj ? '\n' + __.indent(__.parseValue(obj[newTab])) + '\n' : '') + (indexOf.call(htmlNoEndTags, tag) >= 0 ? '' : '</' + tag + '>') + '';
};

htmlAttributes = 'id class style src height width href size name'.split(' ');

isHtmlAttribute = function(obj) {
  var ref2;
  return __.isObject(obj) && (ref2 = __.theKey(obj), indexOf.call(htmlAttributes, ref2) >= 0);
};

tagLine = function(tag, obj, str) {
  var args, k, keys;
  __.isObject(obj) && (obj = fixup.call(this, obj));
  args = ([].slice.call(arguments)).slice(2);
  str && __.object(obj, newTab, args.length === 1 ? args[0] : args.join('\n'));
  switch (false) {
    case !__.isString(obj):
      return codeStr.call(this, tag, __.object({}, newTab, __.parseValue(obj)));
    case !__.isNumber(obj):
      return console.error('NUMBER?');
    case !__.isArray(obj):
      return console.error('ARRAY?');
    case !(__.check('attribute', k = (keys = __.keys(obj))[0]) || __.check('class', k)):
      return codeStr.call(this, tag, obj);
    case !(__.check('id', k) && indexOf.call(keys, newTab) >= 0):
      return codeStr.call(this, tag, __.object(obj[k], ['id', __.key2id.call(this, k)], [newTab, obj[newTab]]));
    case !__.check('id', k):
      __.keys(obj[k]).forEach(function(kk) {
        return __.check('id', kk) && __.object(obj, kk, __.pop(obj[k][kk]));
      });
      return __.reduceKeys(obj, '', (function(_this) {
        return function(o, v) {
          return o + codeStr.call(_this, tag, __.object(obj[v], 'id', __.key2id.call(_this, v)));
        };
      })(this));
    default:
      return console.error('Unknown TAG', tag, obj);
  }
};


global.blaze = {}
global.ionic = {}
global.sat   = {}
global.html  = {}

block = function(obj) {
  return __.indent(indentStyle(fixup(obj)));
};

site_path && (function() {
  var htmlTags, ionBlockTags, ionInsertTags;
  htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');
  htmlTags.forEach(function(tag) {
    return html[tag.toUpperCase()] = function() {
      var args;
      return tagLine.apply((args = [].slice.call(arguments))[0], [tag].concat(args.slice(1)));
    };
  });
  ['Each', 'With'].forEach(function(tag) {
    return blaze[tag] = function(_, obj) {
      var key;
      return '{{#' + tag + ' ' + (key = __.theKey(obj)) + '}}\n' + block(obj[key]) + '\n{{/' + tag + '}}';
    };
  });
  ['If', 'Unless'].forEach(function(tag) {
    return blaze[tag] = function(_, obj) {
      var key;
      return '{{#' + tag + ' ' + (key = __.theKey(obj)) + '}}\n' + block(obj[key]) + '';
    };
  });
  ['Else'].forEach(function(tag) {
    return blaze[tag] = function(_, obj) {
      return '{{#' + tag + '}}';
    };
  });
  ionBlockTags = 'Body Content FooterBar HeaderBar Item List Modal NavView Pane Popover Radio SideMenu SideMenuContent SideMenus Slide SlideBox SubfooterBar SubheaderBar Tabs View'.split(' ');
  ionBlockTags.forEach(function(tag) {
    return ionic[tag] = function(_, obj) {
      var args;
      args = [].slice.call(arguments);
      switch (false) {
        case !__.isObject(obj):
          return '{{#' + 'ion' + tag + attributes(obj) + '}}\n' + __.indent(args.slice(2).join('\n')) + '\n{{/' + 'ion' + tag + '}}';
        default:
          return '{{#' + 'ion' + tag + '}}\n' + __.indent(args.slice(1).join('\n')) + '\n{{/' + 'ion' + tag + '}}';
      }
    };
  });
  ionInsertTags = 'Icon NavBar NavBackButton Popup Tab'.split(' ');
  ionInsertTags.forEach(function(tag) {
    return ionic[tag] = function(_, obj) {
      switch (false) {
        case !__.isObject(obj):
          return '{{> ' + 'ion' + tag + ionAttributes(obj) + '}}';
        default:
          return '{{> ' + 'ion' + tag + '}}';
      }
    };
  });
  sat.Each = function(_, obj) {
    var key;
    return _.helpers[key = __.theKey(obj)]().map(function(a) {
      return obj[key].replace(/_\[(\w+)\]/g, function(m, $1) {
        return a[$1];
      });
    }).join('\n');
  };
  return blaze.Include = function(_, obj) {
    var args, k;
    args = [].slice.call(arguments);
    switch (false) {
      case !__.isObject(obj):
        return '{{> ' + (k = __.theKey(obj)) + includeAttributes(obj[k]) + '}}';
      case !__.isString(obj):
        return '{{> ' + obj + '}}';
      default:
        return console.error('Invalid `include` objuments', obj, args);
    }
  };
})();

includeAttributes = function(obj) {
  return ' ' + __.keys(obj).map(function(k) {
    return k + '="' + __.parseValue(obj[k]) + '"';
  }).join(' ');
};
*/
gitpass = function() {
  prompt.message = 'github';
  prompt.start();
  return prompt.get({
    name: 'password',
    hidden: true
  }, function(err, result) {
    fs.writeFileSync(add(home, '/.netrc'), "machine github.com\n   login i4han\n   password " + result.password, {
      flag: 'w+'
    });
    return Config.quit(process.exit(1));
  });
};


github_url = function(repo) {
  return 'https://github.com/' + repo + '.git' }


create = function() {
  var site;
  __.check('name', site = argv._[0]) || console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) || process.exit(1);
  return (spawn_command('git', 'clone', [github_url(argv.repo || 'i4han/sat-spark'), site])).on('exit', function(code) {
    return code && (console.error('error: Git exited with an error.') || process.exit(1));
  });
};



meteor_refresh = function() {
  return meteor_publish().on('exit', function(code) {
    return code || meteor_update();
  });
};


deploy = () =>  spawn_command('meteor', 'deploy', [argv._[0] || Settings.deploy.name, '--settings', settings_json], build_path)

__create_test = function() {
  (test_path = argv._[0]) || console.error("error: Test directory name is missing.") || process.exit(1);
  if (fs.existsSync(test_path)) {
    return console.error("error: Directory already exist.");
  } else {
    return meteor_create(test_path, function() {
      return mkdir(packages_dir, null, function() {
        return mkdir(cubesat_name, packages_dir, function() {
          return (spawn_command('git', 'clone', [github_url('i4han/cubesat'), '.'], cubesat_name)).on('exit', function() {
            return console.info("info: cubesat package directory:", process.cwd());
          });
        });
      });
    });
  }
};

install_mobile = () => {
  let wt
  !site_path && !((wt = argv['with-test']) && test_path) && console.error("error: Run in .sat working directory or specify valid test name." || process.exit(1));
  ;(['install-sdk', 'add-platform'].reduce(((f, c) =>
    () => spawn_command('meteor', c, ['ios'], wt ? test_path : build_path).on('exit', f)),
    () => console.log(new Date()) ))()
}



function main () {

let v
const getVersion = path => __.require(path).version
const addVersion = s => (v = s.split('.'), v.map((a, i) => (i != v.length - 1) ? a : (parseInt(a) + 1).toString()).join('.'))
const version = () => console.log(getVersion(add(path_info[argv._[0]].path, package_json)))
const increaseVersion = (file, data) =>
    data.replace(new RegExp('"version":\\s*"' + (v = getVersion(file)) + '"'), '"version": "' + addVersion(v) + '"')
const gitPush = (commit, paths) => {
    let p = paths.shift()
    spawn_command('git', 'add', ['.'], p).on(  'exit', code =>
        spawn_command('git', 'commit', ['-m', commit], p).on(  'exit', code =>
            code ? paths.length ? gitPush( commit, paths ) : undefined
                 : spawn_command('git', 'push', [], paths[0]).on(  'exit', code =>
                   paths.length ? gitPush( commit, paths ) : undefined  )  )  )  }
const editFile = (file, func, action) =>
    fs.readFile(file, 'utf8', (e, data) => error(e) ||
        fs.writeFile(file, data = func(file, data), 'utf8', e => error(e) || (action && __.isFunction(action, action(file, data)))))
const npmPublish    = (path, after) => (spawn_command('npm', 'publish', ['.'], path)).on('exit', __.isFunction(after) ? after : () => {} )
const meteorPublish = (path, after) => (spawn_command('meteor', 'publish', [], path)).on('exit', __.isFunction(after) ? after : () => {} )
const publish = paths => {
    let v = paths.shift(), path = v.path
    editFile(  add( path, v.meteor? package_js : package_json ),
        (f, d) => increaseVersion( add(path, package_json), d ), (f, d) =>
        v.meteor ? meteorPublish(  path, () =>
                v.npm ? editFile(  add(path, package_json), increaseVersion, (f, d) =>
                        npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )
                      : paths.length ? publish(paths) : {}  )
                 : npmPublish( path, paths.length ? () => publish(paths) : () => {} )  )  }
const meteorRun     = (path, port)  => spawn_command( 'meteor', 'run', argv._.concat(['--settings', settings_json, '--port', port || '3000']), path || site_path )
const npmUpdate = npms => {
    if (!npms.length) return
    let v = npms.shift()
    spawn_command(    'npm', 'remove', [v.name, '--save',  '--prefix', v.prefix], v.path ).on(  'exit', () =>
        spawn_command('npm', 'install', [v.name, '--save', '--prefix', v.prefix], v.path )  ).on(  'exit', () =>
            npmUpdate(npms)  )  }
const meteorUpdate = (npms, meteors) => {
    if (!meteors.length)
        return npms.length ? npmUpdate(npms) : undefined
    let v = meteors.shift()
    spawn_command(  'meteor', 'update', [v.name], v.path).on('exit',
        meteors.length ? () => meteorUpdate(npms, meteors) : () => npmUpdate(npms)  )  }
const npmArray = arr => arr.reduce(  (  (a,v,i) =>
    a.concat( v.npm.map( w => ({name:v.npmName || v.name, prefix:w, path:v.path }) ) )  ), []  )
const update = paths => {
    meteorUpdate(
        npmArray( paths.filter(v => v.npm) ),
        paths.filter(v => v.meteor).reduce( ((a,v,i) => a.concat( v.meteor.map( w => ({name:v.name, path:w}) ) )), [] )  )  }
const npmInstall = npms => {
    if (!npms.length) return
    let v = npms.shift()
    spawn_command(     'npm', 'remove', [v.name, '--save', '--prefix', v.prefix], v.path ).on(  'exit', () =>
        spawn_command( 'npm', 'install',   ['.', '--save', '--prefix', v.prefix], v.path )  ).on(  'exit', () =>
            npmInstall(npms)  ) }
const jasmine = (a, fn) => {
    if (!a.length) return
    spawn_command( 'jasmine', a.shift() ).on(  'exit', code =>
        code === 0 ? a.length !== 0 ? jasmine(a, fn) : __.isFunction(fn) ? fn : () => {} : () => {}  )  }
const jasmineSpecs = key =>
    key ? [] :
        path_info.keys().map( k => path_info[k] ).filter( v => v.jasmine ).reduce(  (  (a,v) =>
            a.concat( fs.readdirSync( add(v.path, 'spec') ).filter( w => w.match(/[sS]pec\.js$/) )
                .map(vv => add(v.path, 'spec', vv)   )  )  ), []  )

let ops = argv._
new Task(  'env',  () =>
    fs.readFile(  add(home, dot_env), 'utf8', (e, data) => error(e) ||
        data.replace(  /^\s*([a-zA-Z_]{1}[a-zA-Z0-9_]*).*/mg, (m, p1) =>
            console.log( `  $${__.padLeft(22, p1)} = ` + process.env[p1] )  )  ),
    { dotsat: 0, test: 0, description: 'Show arguments and environment variables.' } )
new Task(  'paths', () =>
    path_info.keys().map(  k =>
        console.log( '  ', __.padLeft(15, k), __.padLeft(8, path_info[k].type), path_info[k].path )  ),
    { dotsat: 0, test: 0, description: 'Show working paths.' } )
new Task(  'args', () =>
    console.log('   arguments:   ', argv) ||
    options.keys().map(  k =>
        console.log( '  ', __.padLeft(15, `-${k}, --${options[k].full}`), __.padLeft(40, options[k].command), options[k].description )  ),
    { dotsat: 0, test: 0, description: 'Show arguments.' }  )
new Task(  'help', () =>
    tasks.keys().map(  k =>
        console.log( '  ', __.padLeft(15, __.dasherize(k)), (tasks[k].description || taskBook[__.dasherize(k)]._.description) )  ),
    { dotsat: 0, test: 0, description: 'Help message.' }  )
new Task(  'add-version', () => {
    let path = path_info[argv._[0]].path
    editFile( add(path, package_js), (f, d) => increaseVersion(add(path, package_json), d), () =>
        editFile( add(path, package_json), increaseVersion, () => version() )) },
    { dotsat: 0, test: 0, description: 'Increase version in pakage.json.', arg0: 1 }  )
new Task(  'version', () => version(),
    { dotsat: 0, test: 0, description: 'Print sat version.' }  )
new Task(  'jasmine', () => jasmine( jasmineSpecs() ),
    { dotsat: 0, test: 0, description: 'Jasmine test framework.' }  )
new Task(  'update', () =>
    ops.length ? update( ops.map(k => path_info[k]) )
               : update( path_info.keys().filter(k => path_info[k].npm || path_info[k].meteor).map(k => path_info[k]) ),
    { dotsat: 0, test: 0, description: 'Update packages.', thirdCommand: 1 }  )
new Task(  'npm-update', () =>
    ops.length ? npmUpdate( npmArray( ops.map(k => path_info[k]) ) )
               : npmUpdate( npmArray( path_info.keys().filter( k => path_info[k].npm ).map( k => path_info[k] ) ) ),
    { dotsat: 0, test: 0, description: 'Update npm modules.', thirdCommand: 1 })
new Task(  'npm-install', () =>
    ops.length ? npmInstall( npmArray( ops.map(k => path_info[k]) ) )
               : npmInstall( npmArray( path_info.keys().filter( k => path_info[k].npm ).map( k => path_info[k] ) ) ),
    { dotsat: 0, test: 0, description: 'Update local npm modules.', thirdCommand: 1 }  )
new Task(  'dot-env', () =>
    fs.readFile(  add(home, dot_env), 'utf8', (e, data) => error(e) ||
        console.log( data.replace(/^\s*([a-zA-Z])/mg, "export $1") )  ),
    { dotsat: 0, test: 0, description: 'Print export .env $. <(sat dot-env)' }  )
new Task(  'git-push', () =>
    gitPush( arg0, path_info.keys().filter( k => path_info[k].git ).map( k => path_info[k].path ) ),
    { dotsat: 1, test: 0, description: 'Git push.', arg0: 1 })
new Task(  'run', () => meteorRun(),
    { dotsat: 1, test: 0, description: 'Run meteor server.', settings: 1 })
new Task(  'test', () => {
    paths2test.forEach( d => {
        let target, source
        fs.unlink(  target = add(test_path, d), () =>
            fs.existsSync( source = add(site_path, d) ) && fs.symlink(  source, target, () =>
                console.log(new Date(), source)  )  )  })
    fs.readdir(  test_path, (e, list) => {
        e || list.forEach( f => path.extname(f) === '.js' && fs.unlink(add(test_path, f)) )
        fs.readdir(  site_path, (e, list) =>
            e || list.forEach( f => path.extname(f) === '.js' && fs.link( add(site_path, f), add(test_path, f), () => console.log(new Date(), f) ) )  )  })
    meteorRun(test_path, '3300') },
    { dotsat: 1, test: 0, description: 'Test environment.', settings: 1 })
new Task(  'publish', () => {
    if ( argv._.length ) publish( argv._.map(k => path_info[k]) )
    else publish( path_info.keys().filter(k => path_info[k].npm || path_info[k].meteor).map(k => path_info[k]) )  },
    { dotsat: 0, test: 0, description: 'Publish Meteor packages.' })

tasks = in$({
  env:        { dotsat: 0, test: 0 },
  paths:      { dotsat: 0, test: 0 },
  args:       { dotsat: 0, test: 0 },
  test:       { dotsat: 1, test: 0, settings: 1 },
  update:     { dotsat: 1, test: 0, thirdCommand: 1 },
  npmUpdate:  { dotsat: 1, test: 0},
  npmInstall: { dotsat: 1, test: 0},
  help:       { dotsat: 0, test: 0 },
  run:        { dotsat: 1, test: 0, settings: 1 },
  gitPush:    { dotsat: 1, test: 0, arg0: 1 },
  dotEnv:     { dotsat: 0, test: 0 },
  version:    { dotsat: 0, test: 0, arg0: 1 },
  publish:    { dotsat: 0, test: 0 },
  jasmine:    { dotsat: 0, test: 0 },
  addVersion: { dotsat: 0, test: 0, arg0: 1 },
  create:     { call: () => create(),     dotsat: 0, test: 0, description: 'Create a project.' },
  settings:   { call: () => settings(),   dotsat: 1, test: 0, description: 'Settings', settings: 1 },
  deploy:     { call: () => deploy(),     dotsat: 1, test: 0, description: 'Deploy to meteor.com.' },
  mobileConfig:  { call: () => mobile_config(),    dotsat: 0, test: 1, description: 'Create mobile-config.js' },
  createTest:    { call: () => create_test(),      dotsat: 0, test: 1, description: 'Create test directory.' },
  installMobile: { call: () => install_mobile(),   dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' }
})

options = in$({
  t: { full: 'with-test', command: ['run', 'coffee', 'install-mobile'], description: 'Excute with test.' },
  T: { full: 'for-test',  command: ['run', 'coffee', 'install-mobile'], description: 'Excute for test.'  }  })  }

function pathInfo () {  return {
    sat:      { type: "sat",     name: "sat",               path: cubesat_path },
    module:   { type: "module",  name: "module",            path: node_modules },
    site:     { type: "site",    name: "site",              git: 1, path: site_path },
    test:     { type: "test",    name: "test",              path: test_path },
    cubesat:  { type: "package", name: "isaac:cubesat",     git: 1, path: cubesat_package_path,
                npm:[node_modules], meteor:[site_path], npmName: 'cubesat' },
    jqx:      { type: "package", name: "isaac:jquery-x",    git: 1, path: jqx_package_path },
    sq:       { type: "package", name: "isaac:style-query", git: 1, path: sq_package_path },
    in:       { type: "package", name: "incredibles", git: 1, path: add(test_packages_path, 'incredibles'),
                npm:[node_modules, site_path, test_path],   jasmine:1 },
    u2:       { type: "package", name: "isaac:underscore2", git: 1, path: u2_package_path,
                npm:[node_modules], meteor:[site_path],     npmName: 'underscore2', jasmine:1 }  }  }


taskBook[command] ? taskBook[command]._fn() : task_command.call()
