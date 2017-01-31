#!/usr/bin/env node
var indexOf = [].indexOf

//const nconf    = require('nconf')
const fs       = require('fs')
const path     = require('path')
const ps       = require('ps-node')
const cs       = require('coffee-script')
const dotenv   = require('dotenv')
const ref      = require('child_process'), spawn = ref.spawn, exec = ref.exec
const __       = require('cubesat')

cs.register()
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

findRoot = d => {
  let dir_list = process.cwd().split('/')
  while (dir_list.length && ! fs.existsSync(add(dir_list.join('/'), d)))
    dir_list.pop()
  return dir_list.join('/')
}

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
const tasks = {
  env:      { call: () => show_env(),   dotsat: 0, test: 0, description: 'Show arguments and environment variables.' },
  updateEnv: { call: () => update_env(),   dotsat: 0, test: 0, description: 'Update environment variables from .env file.' },
  paths:    { call: () => show_paths(), dotsat: 0, test: 0, description: 'Show working paths.' },
  args:     { call: () => show_args(),  dotsat: 0, test: 0, description: 'Show arguments.' },
  test:     { call: () => test(),       dotsat: 1, test: 0, description: 'Test environment.', settings: 1},
  init:     { call: () => init(),       dotsat: 0, test: 0, description: 'Init .cubesat. (Not implemented yet)' },
  update:   { call: () => update(),     dotsat: 0, test: 0, description: 'Update cubesat', thirdCommand: 1 },
  help:     { call: () => help(),       dotsat: 0, test: 0, description: 'Help message.' },
  create:   { call: () => create(),     dotsat: 0, test: 0, description: 'Create a project.' },
  run:      { call: () => meteor_run(), dotsat: 1, test: 0, description: 'Run meteor server.', settings: 1},
  gitPush:  { call: () => git_push(),   dotsat: 1, test: 0, description: 'Git push.', arg0: 1},
  dotEnv:   { call: () => export_dot_env(), dotsat: 1, test: 0, description: 'Export .env $. <(sat dot-env)'},
  deploy:   { call: () => deploy(),     dotsat: 1, test: 0, description: 'Deploy to meteor.com.' },
  //build:    { call: () => build(),    dotsat: 1, test: 0, description: 'Build meteor client files.' },
  settings: { call: () => settings(),   dotsat: 1, test: 0, description: 'Settings', settings: 1},
  version:  { call: () => version(),    dotsat: 0, test: 0, description: 'Print sat version', arg0: 1 },
  publish:  { call: () => publish(),    dotsat: 0, test: 0, description: 'Publish Meteor packages.' },
  coffee:   { call: () => coffee_compile(),       dotsat: 1, test: 0, description: 'Watching coffee files to complie.' },
  mobileConfig:  { call: () => mobile_config(),   dotsat: 0, test: 1, description: 'Create mobile-config.js' },
  updateAll:     { call: () => update_all(),      dotsat: 0, test: 0, description: 'Update most recent npm and meteor package.' },
  createTest:    { call: () => create_test(),     dotsat: 0, test: 1, description: 'Create test directory.' },
  installMobile: { call: () => install_mobile(),  dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' },
  addVersion:    { call: () => add_version(),     dotsat: 0, test: 0, description: 'Increase version in pakage.json.', arg0: 1 },
  npmRefresh:    { call: () => npm_refresh(),     dotsat: 0, test: 1, description: 'Publish and update npm cubesat packages.' },
  npmUpdate:     { call: () => npm_update(),      dotsat: 0, test: 0, description: 'Update most recent cubesat npm package.' },
  npmPublish:    { call: () => npm_publish(),     dotsat: 0, test: 1, description: 'Publish cubesat to npm' },
  npmInstall:    { call: () => npm_install(),     dotsat: 0, test: 1, description: 'Install local cubesat' },
  meteorRefresh: { call: () => meteor_refresh(),  dotsat: 1, test: 1, description: 'Publish and update meteor cubesat packages.' },
  meteorUpdate:  { call: () => meteor_update(),   dotsat: 1, test: 0, description: 'Update most recent meteor cubesat packages.' },
  meteorPublish: { call: () => meteor_publish(),  dotsat: 0, test: 1, description: 'Publish cubesat to meteor' }
}

const options = {
  t: { full: 'with-test', command: ['run', 'coffee', 'install-mobile'], description: 'Excute with test.' },
  T: { full: 'for-test',  command: ['run', 'coffee', 'install-mobile'], description: 'Excute for test.' } }

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
fs.existsSync(test_path) || error_quit(`fatal: test path "${test_path}" does not exist. `)

if (test_path) {
  test_client_path     = add(test_path, client_dir)
  test_lib_path        = add(test_path, lib_dir)
  test_public_path     = add(test_path, public_dir)
  test_packages_path   = add(test_path, packages_dir)
  cubesat_package_path = add(test_packages_path, 'isaac:cubesat')
  jqx_package_path     = add(test_packages_path, "isaac:jquery-x")
  sq_package_path      = add(test_packages_path, "isaac:style-query")
  u2_package_path      = add(test_packages_path, 'isaac:underscore2') }

const path_info = {
    site:     { type: "site",    name: "site",        git: 1, path: site_path },
    test:     { type: "test",    name: "test",        git: 0, path: test_path },
    cubesat:  { type: "package", name: "cubesat",     git: 1, path: cubesat_package_path, publish: 1 },
    jqx:      { type: "package", name: "jquery-x",    git: 1, path: jqx_package_path },
    sq:       { type: "package", name: "style-query", git: 1, path: sq_package_path },
    u2:       { type: "package", name: "underscore2", git: 1, path: u2_package_path, publish: 1 } }

const package_paths = __.keys(path_info).filter(k => 'package' === path_info[k].type).map(k => path_info[k].path)
const publish_paths = __.keys(path_info).filter(k => path_info[k].publish).map(k => path_info[k].path)

const dotenv_conf = () => {
    let last_path, paths = paths2watch
    while (paths.length && ! fs.existsSync(add(last_path = paths.shift(), '.env'))) {}
    last_path.length && dotenv.config({path: last_path}) }   // dotenv has not used yet.

let build_path, site_js, index_js_path, mobile_config_js, settings_json, client_path, lib_path
let f, r, s

__.require = f => delete require.cache[f] && require(f)

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
  path && cd(path)
  console.log('  ', ([bin, command].concat(args)).join(' '))
  console.log('  ', path)
  return spawn(bin, [command].concat(args), {stdio: 'inherit'}) }

var Settings, __RmCoffee_paths, __commands, __func, __rmdir, __start_up, _tagLine
var addAttribute, attributeBracket, attributeClass, attributeParse, attributes, baseUnits, block, build
var codeLine, codeStr, coffee, coffee_clean, create, create_test, cssDefaults, cubesat_package_path
var deploy, directives, env, findRoot, fix_later__coffee_compile, fixup
var github_url, gitpass, htmlAttributes, htmlNoEndTags
var idClassKey, includeAttributes, indentStyle, indexSettings, init_settings, install_mobile, ionAttributes, isHtmlAttribute
var mcTable, mc_obj, meteor_create , meteor_publish, meteor_refresh, meteor_update
var mobile_config, my_packages
var newTab, npm_install, npm_publish, npm_refresh, npm_update, rePublish, readWrite, ref1, run
var seperators, strOrObj, styleLoop, styleMediaQuery
var tagLine, task, test, test_client_path, test_lib_path, test_packages_path, test_public_path, toStyle
var update_all, with_test, writeBuild

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
      return console.log(new Date() + ' ' + mobile_config_js + ' is written.');
    });
  });
};

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
    return value.replace(/\*/g, __.key2class(key));
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

_tagLine = function(tag, obj, str) {
  var args, k, keys;
  __.isObject(obj) && (obj = fixup.call(this, obj));
  args = ([].slice.call(arguments)).slice(2);
  str && __.object(obj, newTab, args.length === 1 ? args[0] : args);
  switch (false) {
    case !__.isString(obj):
      return codeLine.call(this, {}, tag, __.object({}, newTab, __.parseValue(obj)));
    case !__.isNumber(obj):
      return console.error('NUMBER?');
    case !__.isArray(obj):
      return console.error('ARRAY?');
    case !(__.check('attribute', k = (keys = __.keys(obj))[0]) || __.check('class', k)):
      return codeLine.call(this, {}, tag, obj);
    case !(__.check('id', k) && indexOf.call(keys, newTab) >= 0):
      return codeLine.call(this, {}, tag, __.object(obj[k], ['id', __.key2id.call(this, k)], [newTab, obj[newTab]]));
    case !__.check('id', k):
      __.keys(obj[k]).forEach(function(kk) {
        return __.check('id', kk) && __.object(obj, kk, __.pop(obj[k][kk]));
      });
      return __.reduceKeys(obj, {}, (function(_this) {
        return function(o, v) {
          return codeLine.call(_this, o, tag, __.object(obj[v], 'id', __.key2id.call(_this, v)));
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

// github_file = function(file) {
//   var req;
//   req = https.request({
//     host: 'raw.githubusercontent.com',
//     port: 443,
//     method: 'GET',
//     path: add('/', argv.user || 'i4han', argv.repo || 'sat-init', argv.branch || 'master', path.basename(file))
//   }, function(res) {
//     res.setEncoding('utf8');
//     return res.on('data', function(b) {
//       return fs.writeFile(file, b, 'utf8', function(e) {
//         return console.log('written:', file);
//       });
//     });
//   });
//   req.end();
//   return req.on('error', function(e) {
//     return console.log('problem with request: ' + e.message);
//   });
// };

github_url = function(repo) {
  return 'https://github.com/' + repo + '.git';
};

/*
meteor_create = function(dir, fn) {
  return (spawn_command('meteor', 'create', [dir], site_path = process.cwd())).on('exit', function() {
    build_path = add(site_path, dir);
    return (meteor_packages_removed.reduce((function(f, p) {
      return function() {
        return (spawn_command('meteor', 'remove', [p], build_path)).on('exit', f);
      };
    }), function() {
      return (meteor_packages.concat(mobile_packages).reduce((function(f, p) {
        return function() {
          return (spawn_command('meteor', 'add', [p], build_path)).on('exit', f);
        };
      }), function() {
        '.html .css .js'.split(' ').map(function(f) {
          return fs.unlink(add(build_path, dir + f), function(e) {
            return error(e);
          });
        });
        return __["return"](fn);
      }))();
    }))();
  });
};
*/

create = function() {
  var site;
  __.check('name', site = argv._[0]) || console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) || process.exit(1);
  return (spawn_command('git', 'clone', [github_url(argv.repo || 'i4han/sat-spark'), site])).on('exit', function(code) {
    return code && (console.error('error: Git exited with an error.') || process.exit(1));
  });
};


__npm_publish = function() {
  _publish(package_json, rePublish.npm);
  return spawn_command('npm', 'publish', ['.'], cubesat_package_path);
};

meteor_publish = function() {
  _publish(package_js, rePublish.meteor);
  return spawn_command('meteor', 'publish', [], cubesat_package_path);
};

__meteor_update = function() {
  return spawn_command('meteor', 'update', [cubesat_name], build_path);
};

npm_update = function() {
  return spawn_command('npm', 'update', ['--prefix', node_modules, 'cubesat']);
};

npm_install = function() {
  return spawn_command('npm', 'install', ['--prefix', node_modules, '.'], cubesat_package_path);
};

update_all = function() {
  meteor_update()
  npm_update()
}

npm_refresh = function() {
  return npm_publish().on('exit', function(code) {
    return code || npm_update();
  });
};

meteor_refresh = function() {
  return meteor_publish().on('exit', function(code) {
    return code || meteor_update();
  });
};

const meteor_run = (path, port) => spawn_command('meteor', 'run', argv._.concat(['--settings', settings_json, '--port', port || '3000']), path || site_path);

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
    () => (spawn_command('meteor', c, ['ios'], wt ? test_path : build_path)).on('exit', f)),
    () => console.log(new Date()) ))()
}

test   = () => {
  test_path || error_quit('error: Can not find test_path.')
  console.log(test_path)
  paths2test.forEach(d => {
    var target;
    return fs.unlink(target = add(test_path, d), function() {
      var source;
      return fs.existsSync(source = add(build_path, d)) && fs.symlink(source, target, () =>
        console.log(new Date(), source) )
    });
  });
  fs.readdir(test_path, function(e, list) {
    e || list.forEach(function(f) {
      var ref2;
      return ((ref2 = path.extname(f)) === '.coffee' || ref2 === '.js') && fs.unlink(add(test_path, f))
    })
    return fs.readdir(site_path, function(e, list) {
      return e || list.forEach(function(f) {
        var ref2;
        return ((ref2 = path.extname(f)) === '.js') && fs.link(add(site_path, f), add(test_path, f), function() {
          return console.log(new Date(), f);
        });
      });
    });
  });
  meteor_run(test_path, '3300')
}

const _git_push = (commit, ...paths) =>
    (spawn_command('git', 'add', ['.'], paths[0])).on('exit', () =>
        (spawn_command('git', 'commit', ['-m', commit], paths[0])).on('exit', () =>
            (spawn_command('git', 'push', [], paths[0])).on('exit', () =>
                paths[1] && _git_push.apply({}, [commit].concat(paths.slice(1))) ) ) )

const _npm_publish_    = (path, after) => (spawn_command('npm', 'publish', ['.'], path)).on('exit', __.isFunction(after) ? after : () => {} )
const _meteor_publish_ = (path, after) => (spawn_command('meteor', 'publish', [], path)).on('exit', __.isFunction(after) ? after : () => {} )
const getVersion = path => __.require(path).version
const incVersion = s => (v = s.split('.'), v.map((a, i) => (i != v.length - 1) ? a : (parseInt(a) + 1).toString()).join('.'))
const editFile = (file, func, action) =>
    fs.readFile(file, 'utf8', (e, data) => error(e) ||
        fs.writeFile(file, data = func(file, data), 'utf8', e => error(e) || (action && __.isFunction(action, action(file, data)))))
let ver
const _incVersionInPackageFile_ = (file, data) =>
    data.replace(new RegExp('"version":\\s*"' + (ver = getVersion(file)) + '"'), '"version": "' + incVersion(ver) + '"')

const _publish = (path, path2) => {
  editFile(add(path, package_js),
    (f, d) => _incVersionInPackageFile_(add(path, package_json), d),
    (f, d) => _meteor_publish_(path, () =>
      editFile(add(path, package_json),
        _incVersionInPackageFile_,
        (f, d) => _npm_publish_(path,
          __.isString(path2) ? () => _publish(path2) : () => {} )) )) }

const export_dot_env = () => {
    fs.readFile(add(home, dot_env), 'utf8', (e, data) => error(e) ||
        console.log(data.replace(/^\s*([a-zA-Z])/mg, "export $1")) )}
const _add_version = (path) => {
    editFile(add(path, package_js),
      (f, d) => _incVersionInPackageFile_(add(path, package_json), d),
      () => editFile(add(path, package_json), _incVersionInPackageFile_, () => version() )) }

const update      = () => spawn_command('npm', 'install', ['.',  '--prefix', node_modules], cubesat_package_path)
const git_push    = () => _git_push.apply({}, [arg0].concat(__.keys(path_info).filter(k => path_info[k].git) .map(k => path_info[k].path)))
const publish     = () =>  _publish.apply({}, publish_paths)
const version     = () => console.log(getVersion(add(path_info[argv._[0]].path, package_json)))
const add_version = () => _add_version(path_info[argv._[0]].path)
const help        = () =>
    __.keys(tasks)    .map(k => console.log('  ', __.padLeft(15, __.dasherize(k)), tasks[k].description))
const init = () => ''

const show_args  = () => {
    console.log('   arguments:   ', argv)
    __.keys(options)  .map(k => console.log('  ', __.padLeft(15, `-${k}, --${options[k].full}`), __.padLeft(40, options[k].command), options[k].description)) }
const show_paths = () =>
    __.keys(path_info).map(k => console.log('  ', __.padLeft(15, k), __.padLeft(8, path_info[k].type), path_info[k].path))
const show_env = () =>
    'MONGO_URL MAIL_URL NODE_MODULES PATH'.split(' ').map(k => console.log(`   $${__.padLeft(12, k)} = ` + process.env[k]))

task_command.call()
