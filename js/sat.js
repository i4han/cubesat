#!/usr/bin/env node
var indexOf = [].indexOf

const path     = require('path')
const ps       = require('ps-node')
const cs       = require('coffee-script')
const md5      = require('md5')
const eco      = require('eco')
const chokidar = require('chokidar')
const https    = require('https')
const jade     = require('jade')
const stylus   = require('stylus')
const async    = require('async')
const dotenv   = require('dotenv')
const nconf    = require('nconf')
const api      = require('absurd')()
const ref      = require('child_process'), spawn = ref.spawn, exec = ref.exec
const __       = require('underscore2').__

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
const cubesat_name = 'isaac:cubesat'

findRoot = d => {
  let dir_list = process.cwd().split('/')
  while (dir_list.length && ! fs.existsSync(add(dir_list.join('/'), d)))
    dir_list.pop()
  return dir_list.join('/')
}

const dot_sat      = '.sat'
const dot_cubesat  = '.cubesat'
const site_path    = findRoot(dot_sat)
const dot_sat_path = add(site_path, dot_sat)
const cubesat_path = findRoot(dot_cubesat)
const dot_cubesat_path = add(cubesat_path || home, dot_cubesat) // should be error? .cubesat doesn't exist?
const node_modules = process.env.NODE_MODULES || findRoot('node_modules') || home
const paths2watch  = [home, cubesat_path, dot_cubesat_path, site_path, dot_sat_path, node_modules]
const tasks = {
  ok:       { call: () => ok(),       dotsat: 0, test: 0, description: 'ok' },
  test:     { call: () => test(),     dotsat: 1, test: 0, description: 'Test environment.' },
  init:     { call: () => init(),     dotsat: 0, test: 0, description: 'Init .cubesat. (Not implemented yet)' },
  help:     { call: () => help(),     dotsat: 0, test: 0, description: 'Help message.' },
  create:   { call: () => create(),   dotsat: 0, test: 0, description: 'Create a project.' },
  run:      { call: () => run(),      dotsat: 1, test: 0, description: 'Run meteor server.' },
  deploy:   { call: () => deploy(),   dotsat: 1, test: 0, description: 'Deploy to meteor.com.' },
  //build:    { call: () => build(),    dotsat: 1, test: 0, description: 'Build meteor client files.' },
  settings: { call: () => settings(), dotsat: 1, test: 0, description: 'Settings' },
  version:  { call: () => version(),  dotsat: 0, test: 0, description: 'Print sat version' },
  publish:  { call: () => publish(),  dotsat: 0, test: 0, description: 'Publish Meteor packages.' },
  coffee:   { call: () => coffee_compile(),      dotsat: 1, test: 0, description: 'Watching coffee files to complie.' },
  mobileConfig:  { call: () => mobile_config(),  dotsat: 0, test: 1, description: 'Create mobile-config.js' },
  updateAll:     { call: () => update_all(),     dotsat: 0, test: 0, description: 'Update most recent npm and meteor package.' },
  createTest:    { call: () => create_test(),    dotsat: 0, test: 1, description: 'Create test directory.' },
  installMobile: { call: () => install_mobile(), dotsat: 0, test: 1, description: 'Install mobile sdk and platform.' },
  npmRefresh:    { call: () => npm_refresh(),    dotsat: 0, test: 1, description: 'Publish and update npm cubesat packages.' },
  npmUpdate:     { call: () => npm_update(),     dotsat: 0, test: 0, description: 'Update most recent cubesat npm package.' },
  npmPublish:    { call: () => npm_publish(),    dotsat: 0, test: 1, description: 'Publish cubesat to npm' },
  npmInstall:    { call: () => npm_install(),    dotsat: 0, test: 1, description: 'Install local cubesat' },
  meteorRefresh: { call: () => meteor_refresh(), dotsat: 1, test: 1, description: 'Publish and update meteor cubesat packages.' },
  meteorUpdate:  { call: () => meteor_update(),  dotsat: 1, test: 0, description: 'Update most recent meteor cubesat packages.' },
  meteorPublish: { call: () => meteor_publish(), dotsat: 0, test: 1, description: 'Publish cubesat to meteor' }
}

const options = {
  t: { full: 'with-test', command: ['run', 'coffee', 'install-mobile'], description: 'Excute with test.' },
  T: { full: 'for-test',  command: ['run', 'coffee', 'install-mobile'], description: 'Excute for test.' }
}

const error_quit = error => {
  console.log(error)
  process.exit(1)
}

if (! command) command = 'help'  // empty command means 'sat help'
const task_command = tasks[__.camelize(command)]

// error handling
task_command || error_quit(`fatal: Unknown command "${command}"`)
! site_path.length && task_command.dotsat &&  error_quit(`fatal: You must run it in .sat working directory or its subdirectory.`)

var Settings, __RmCoffee_paths, __commands, __func, __rmdir, __start_up, _meteor_run, _publish, _tagLine
var addAttribute, attributeBracket, attributeClass, attributeParse, attributes
var baseUnits, block, build
var cd, client_path, codeLine, codeStr, coffee, coffee_clean, coffee_watch, collectExt
var compare_file, cp, cpdir, create, create_test, cssDefaults, cubesat_package_path
var deploy, directives, env, error
var f, findRoot, fix_later__coffee_compile, fixup, func2val
var github_file, github_url, gitpass
var help, htmlAttributes, htmlNoEndTags
var idClassKey, incVersion, includeAttributes, indentStyle, indexSettings, init, init_settings, install_mobile, ionAttributes, isHtmlAttribute, isType
var lib_files, lib_path, loadSettings
var mcTable, mc_obj, meteor_create, meteor_packages, meteor_packages_removed, meteor_publish, meteor_refresh, meteor_update
var mkdir, mobile_config, mobile_config_js, mobile_packages, my_packages
var newTab, nocacheRequire, npm_install, npm_publish, npm_refresh, npm_update
var ok, public_files
var rePublish, readWrite, ref1, run
var seperators, settings, settings_json, settings_path, spawn_command, strOrObj, styleLoop, styleMediaQuery, style_path
var tagLine, task, test, test_client_path, test_dir, test_lib_path, test_packages_path, test_path, test_public_path, toStyle
var update_all, version, with_test, writeBuild

let build_path, index_js_path, a_path, a_module

if (site_path.length) {
  // site_coffees = fs.readdirSync(site_path).filter(f => coffee_ext === path.extname(f))
  site_js = fs.readdirSync(site_path).filter(f => '.js' === path.extname(f))
  let paths = paths2watch
  let last_path
  while (paths.length && ! fs.existsSync(add(last_path = paths.shift(), '.env'))) {}
  last_path.length && dotenv.config({path: last_path}) // dotenv has not used yet.

  build_path = site_path
  index_js_path = add(site_path, index_js);
  build_path && (mobile_config_js = add(build_path, 'mobile-config.js'));
  env = v => (a_path = process.env[v]) && a_path.replace(/^~\//, home + '/')
  nocacheRequire = f => delete require.cache[f] && require(f)
  loadSettings   = f =>
    (fs.existsSync(f) && __.return(a_module = (nocacheRequire(f)).Settings, __.return(a_module))) || {}
  indexSettings = function(f) {
    var s;
    return (fs.existsSync(f) && __["return"](s = (nocacheRequire(f)).setting, __["return"](s))) || {};
  };
  Settings = loadSettings(settings_path = add(dot_cubesat_path, 'settings.coffee'));
  (f = function(o) {
    return __.keys(o).forEach(function(k) {
      if (__.isObject(o[k])) {
        return o[k] = f(o[k]);
      } else {
        return o[k] = __["return"](o[k]);
      }
    });
  })(Settings);
  settings_json = add(site_path, '.settings.json');
  nconf.file({
    file: add(dot_sat_path, 'config.json')
  });
  this.Theme = this.Modules = global.Parts = {};
  func2val = function(f, _) {
    if (__.isObject(f)) {
      __.keys(f).forEach(function(k) {
        return f[k] = func2val(f[k], _);
      });
      return f;
    } else if (__.isFunction(f)) {
      return __["return"](f, _);
    } else {
      return f;
    }
  };
  init_settings = function() {
    var local, site;
    Settings = loadSettings(settings_path);
    __.assign(Settings, indexSettings(index_js_path));
    func2val(Settings, Settings);
    (site = Settings.site) && (local = Settings.local) && local[site] && __.assign(Settings, local[site]);
    return this.Settings = Settings;
  };
  init_settings();
  client_path = add(site_path, client_dir);
  lib_path = add(site_path, lib_dir);
  style_path = add(site_path, 'style');
  lib_files = __.toArray(Settings.lib_files);
  my_packages = __.toArray(Settings.packages);
  public_files = __.toArray(Settings.public_files);
}

test_dir = (function() {
  var ref2;
  switch (false) {
    case !(with_test = argv['with-test'] && __.isString(with_test)):
      return with_test;
    case !(((ref2 = tasks[command]) != null ? ref2.test : void 0) && argv._[0]):
      return argv._[0];
    default:
      return 'test';
  }
})();

test_path = fs.existsSync(test_path = add(cubesat_path, test_dir)) ? test_path : void 0;

if (test_path) {
  test_client_path = add(test_path, client_dir);
  test_lib_path = add(test_path, lib_dir);
  test_public_path = add(test_path, public_dir);
  test_packages_path = add(test_path, packages_dir);
  cubesat_package_path = add(test_packages_path, cubesat_name);
}

__RmCoffee_paths = function() {
  return fs.readdirSync(site_path).filter(function(f) {
    return coffee_ext === path.extname(f);
  }).map(function(f) {
    return add(site_path, f);
  });
};

error = function(e) {
  return e && (console.error(e) || 1);
};

isType = function(file, type) {
  return path.extname(file) === '.' + type;
};

collectExt = function(dir, ext) {
  return (fs.existsSync(dir) || '') && ((fs.readdirSync(dir)).map(function(file) {
    if (isType(file, ext)) {
      return fs.readFileSync(add(dir, file));
    } else {
      return '';
    }
  })).join('\n');
};

cd = function(dir) {
  return process.chdir(dir);
};

__func = function(f) {
  if ('function' === typeof f) {
    return f();
  } else {
    return true;
  }
};

__rmdir = function(dir, f) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function(file, index) {
      var curPath;
      if (fs.lstatSync(curPath = add(dir, file)).isDirectory()) {
        return rmdir(curPath);
      } else {
        return fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
  __["return"](f);
  return dir;
};

mkdir = function(dir, _path, f) {
  _path && process.chdir(_path);
  return dir && fs.readdir(dir, function(e, l) {
    return e && fs.mkdir(dir, function(e) {
      return e || __["return"](f);
    });
  });
};

compare_file = function(source, target) {
  return false;
};

cp = function(source, target) {
  return !compare_file(source, target) && fs.readFile(source, function(e, data) {
    return error(e) || fs.readFile(target, function(e, data_t) {
      return e || (data.length > 0 && data.toString() !== data_t.toString()) && fs.writeFile(target, data, function() {});
    });
  });
};

cpdir = function(source, target) {
  return fs.readdir(source, function(e, list) {
    return list.map(function(f) {
      var _path, t_f;
      if (f.match(/^\./)) {
        return '';
      } else if ((fs.lstatSync(_path = add(source, f))).isDirectory()) {
        return mkdir((t_f = add(target, f)), null, function() {
          return cpdir(_path, t_f);
        });
      } else {
        return cp(_path, add(target, f));
      }
    });
  });
};

coffee_clean = function() {
  return ps.lookup({
    command: 'node',
    psargs: 'ux'
  }, function(e, a) {
    return a.map(function(p) {
      var ref2;
      return '-wbc' === ((ref2 = p["arguments"]) != null ? ref2[3] : void 0) && process.kill(p.pid, 'SIGKILL');
    });
  });
};

coffee_watch = function(c, js) {
  return spawn('coffee', ['-o', js, '-wbc', c], {
    stdio: 'inherit'
  });
};

fix_later__coffee_compile = function() {
  var coffee_dir, js_dir;
  mkdir(lib_path);
  coffee_dir = [];
  js_dir = [];
  package_paths && package_paths.map(function(p) {
    coffee_dir.push(add(p, 'coffee'));
    return js_dir.push(add(p, 'js'));
  });
  return ps.lookup({
    command: 'node',
    psargs: 'ux'
  }, function(e, a) {
    return a.map(function(p, i) {
      var c, ref2;
      if ('-wbc' === ((ref2 = p["arguments"]) != null ? ref2[3] : void 0) && ((c = p["arguments"][4]) != null)) {
        if ((i = coffee_dir.indexOf(c)) < 0) {
          process.kill(p.pid, 'SIGKILL');
        } else {
          [coffee_dir.splice(i, 1), js_dir.splice(i, 1)];
        }
      }
      return a.length - 1 === i && coffee_dir.map(function(c, j) {
        return coffee_watch(c, js_dir[j]);
      });
    });
  });
};

spawn_command = function(bin, command, args, _path) {
  _path && cd(_path);
  console.log(bin, command, args.join(' '));
  return spawn(bin, [command].concat(args), {
    stdio: 'inherit'
  });
};

meteor_packages_removed = 'autopublish insecure'.split(' ');

meteor_packages = ("service-configuration accounts-password fortawesome:fontawesome http iron:router " + cubesat_name + " jquery mizzao:bootstrap-3 mizzao:jquery-ui mquandalle:jade stylus").split(' ');

mobile_packages = [];

settings = function() {
  init_settings();
  return fs.readFile(settings_json, 'utf-8', function(e, data) {
    var json;
    return (data === (json = JSON.stringify(Settings, '', 4) + '\n')) || fs.writeFile(settings_json, json, function(e) {
      return console.log(new Date() + ' Settings are written.');
    });
  });
};

mc_obj = function(o) {
  return '\n' + __.keys(o).map(function(k) {
    return '   ' + k + ': "' + o[k] + '"';
  }).join(',\n');
};

mcTable = {
  setPreference: {
    list: true
  },
  configurePlugin: {
    list: true
  }
};

strOrObj = function(o) {
  if (__.isObject(o)) {
    return '{\n' + __.keys(o).map(function(k) {
      return '   ' + k + ': "' + o[k] + '"';
    }).join(',\n') + '\n}';
  } else {
    return '"' + o + '"';
  }
};

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

coffee = function(data) {
  return cs.compile('#!/usr/bin/env node\n' + data, {
    bare: true
  });
};

directives = {
  jade: {
    file: '1.jade',
    f: function(n, b) {
      b = __.indent(b, 1);
      return "template(name='" + n + "')\n" + b + "\n\n";
    }
  },
  jade$: {
    file: '2.html',
    f: function(n, b) {
      b = __.indent(b, 1);
      return jade.compile("template(name='" + n + "')\n" + b + "\n\n", null)();
    }
  },
  template$: {
    file: 'template.html',
    f: function(n, b) {
      b = __.indent(b, 1);
      return "<template name=\"" + n + "\">\n" + b + "\n</template>\n\n\n";
    }
  },
  HTML: {
    file: '3.html',
    f: function(n, b) {
      b = __.indent(b, 1);
      return "<template name=\"" + n + "\">\n" + b + "\n</template>\n";
    }
  },
  head: {
    file: 'head.html',
    header: function() {
      return '<head>\n';
    },
    footer: function() {
      return '</head>\n';
    },
    f: function(n, b) {
      return __.indent(b, 1) + '\n';
    }
  },
  less: {
    file: '7.less',
    f: function(n, b) {
      return b + '\n';
    }
  },
  css: {
    file: '5.css',
    header: function() {
      return collectExt(style_path, 'css') + '\n';
    },
    f: function(n, b) {
      return b + '\n';
    }
  },
  styl: {
    file: '4.styl',
    f: function(n, b) {
      return b + '\n\n';
    }
  },
  styl$: {
    file: '6.css',
    f: function(n, b) {
      return stylus(b).render() + '\n';
    }
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

global.blaze = {};

global.ionic = {};

global.sat = {};

global.html = {};

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
/*
toTemplateLoop = function(obj) {
  if (__.isObject(obj)) {
    return __.reduceKeys(obj, {}, (function(_this) {
      return function(o, k) {
        switch (false) {
          case !(__.check('id', 'class', k) && isHtmlAttribute(obj[k])):
            return __.assign(o, toTemplateLoop.call(_this, tagLine.call(_this, idClassKey.call(_this, k), obj[k])));
          case !__.check('id', 'class', k):
            return __.object(o, idClassKey.call(_this, k), toTemplateLoop.call(_this, obj[k]));
          default:
            return __.object(o, k, toTemplateLoop.call(_this, obj[k]));
        }
      };
    })(this));
  } else {
    return __.parseValue(obj);
  }
};

const _eco = function(str) {
  var data;
  if (__.isEmpty(data = fixup.call(this, this.eco))) {
    return str;
  } else {
    return eco.render(str, data);
  }
};

toTemplate = function(d) {
  switch (false) {
    case !__.isEmpty(this[d]):
      return null;
    case !__.isString(this[d]):
      return _eco.call(this, this[d]);
    case !(__.isObject(this[d]) || __.isArray(this[d])):
      return _eco.call(this, indentStyle(toTemplateLoop.call(this, fixup.call(this, this[d]))));
    default:
      return console.error("Unknown type", this[d]);
  }
};

readExports = function(f) {
  var base;
  if (_index_ === (base = path.basename(f, coffee_ext))) {
    return nocacheRequire(f);
  } else {
    return (nocacheRequire(f))[base];
  }
};

build = function() {
  var count, mkeys, source;
  settings();
  return;
  mkdir(client_path);
  this.Parts = global.Parts = __["return"]((source = site_coffees.reduce((function(o, f) {
    return __.assign(o, readExports(add(site_path, f)));
  }), {}))['Parts']);
  this.Modules = __["return"](source['Modules']);
  (mkeys = __.keys(this.Modules)).map(function(n) {
    return __.module(n, this.Modules[n] = __["return"](this.Modules[n], __["return"](this.Modules[n])));
  });
  __.keys(directives).map(function(d) {
    var it;
    return writeBuild((it = directives[d]), mkeys.map(function(n) {
      var b;
      this.Modules[n][d] = __["return"](this.Modules[n][d], this.Modules[n]);
      return (b = toTemplate.call(this.Modules[n], d)) && it.f.call(this, n, b);
    }).filter(function(o) {
      return o != null;
    }).join(''));
  });
  count = 0;
  return mkeys.forEach(function(n) {
    var key;
    this.Modules[n][key = 'style$'] && api.add(toStyle.call(this.Modules[n], key));
    return ++count === mkeys.length && writeBuild({
      file: 'absurd.css'
    }, api.compile());
  });
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

github_file = function(file) {
  var req;
  req = https.request({
    host: 'raw.githubusercontent.com',
    port: 443,
    method: 'GET',
    path: add('/', argv.user || 'i4han', argv.repo || 'sat-init', argv.branch || 'master', path.basename(file))
  }, function(res) {
    res.setEncoding('utf8');
    return res.on('data', function(b) {
      return fs.writeFile(file, b, 'utf8', function(e) {
        return console.log('written:', file);
      });
    });
  });
  req.end();
  return req.on('error', function(e) {
    return console.log('problem with request: ' + e.message);
  });
};

github_url = function(repo) {
  return 'https://github.com/' + repo + '.git';
};

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

create = function() {
  var site;
  __.check('name', site = argv._[0]) || console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) || process.exit(1);
  return (spawn_command('git', 'clone', [github_url(argv.repo || 'i4han/sat-init'), site])).on('exit', function(code) {
    return code && (console.error('error: Git exited with an error.') || process.exit(1));
  });
};

incVersion = function(data, re) {
  var version;
  data.match(re);
  console.log('verion:', version = RegExp.$2.split('.').map(function(w, j) {
    if (j === 2) {
      return String(+w + 1);
    } else {
      return w;
    }
  }).join('.'));
  return data.replace(re, "$1" + version + "$3");
};

const getVersion = (file, re) => fs.readFileSync(file, 'utf8').match(re)[2]

readWrite = function(file, func) {
  return fs.readFile(file, 'utf8', function(e, data) {
    return error(e) || fs.writeFile(file, func(data, 'utf8', function(err) {
      return error(err);
    }));
  });
};

_publish = function(file, re) {
  if (!test_path) {
    console.log('TEST_PATH is null') || process.exit(0);
  }
  return readWrite(add(cubesat_package_path, file), function(data) {
    return incVersion(data, re);
  });
};

rePublish = {
  npm:    /("version"\s*:\s*['"])([0-9.]+)(['"]\s*,)/m,
  meteor: /(version\s*:\s*['"])([0-9.]+)(['"]\s*,)/m
};

npm_publish = function() {
  _publish(package_json, rePublish.npm);
  return spawn_command('npm', 'publish', ['.'], cubesat_package_path);
};

meteor_publish = function() {
  _publish(package_js, rePublish.meteor);
  return spawn_command('meteor', 'publish', [], cubesat_package_path);
};

meteor_update = function() {
  return spawn_command('meteor', 'update', [cubesat_name], build_path);
};

npm_update = function() {
  return spawn_command('npm', 'update', ['--prefix', node_modules, 'cubesat']);
};

npm_install = function() {
  return spawn_command('npm', 'install', ['--prefix', node_modules, '.'], cubesat_package_path);
};

update_all = function() {
  meteor_update();
  return npm_update();
};

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

_meteor_run = function(dir, port) {
  return spawn_command('meteor', 'run', argv._.concat(['--settings', settings_json, '--port', port || '3000']), dir || build_path);
};

coffee_watch = function(c, js) {
  return spawn('coffee', ['-o', js, '-wbc', c], {
    stdio: 'inherit'
  });
};

run = function() {
  // build();
  _meteor_run()
  argv['with-test'] && test()
};

deploy = function() {
  // build();
  return spawn_command('meteor', 'deploy', [argv._[0] || Settings.deploy.name, '--settings', settings_json], build_path);
};

test = function() {
  //build();
  console.log(test_path);
  test_path || console.error('error: Can not find cubesat home.') || process.exit(1);
  'client server lib public private resources'.split(' ').forEach(function(d) {
    var target;
    return fs.unlink(target = add(test_path, d), function() {
      var source;
      return fs.existsSync(source = add(build_path, d)) && fs.symlink(source, target, 'dir', function() {
        return console.log(new Date(), source);
      });
    });
  });
  fs.readdir(test_path, function(e, list) {
    e || list.forEach(function(f) {
      var ref2;
      return ((ref2 = path.extname(f)) === '.coffee' || ref2 === '.js') && fs.unlink(add(test_path, f));
    });
    return fs.readdir(site_path, function(e, list) {
      return e || list.forEach(function(f) {
        var ref2;
        return ((ref2 = path.extname(f)) === '.coffee') && fs.link(add(site_path, f), add(test_path, f), function() {
          return console.log(new Date(), f);
        });
      });
    });
  });
  return _meteor_run(test_path, '3300');
};

create_test = function() {
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

install_mobile = function() {
  var wt;
  !site_path && !((wt = argv['with-test']) && test_path) && console.error("error: Run in .sat working directory or specify valid test name." || process.exit(1));
  return (['install-sdk', 'add-platform'].reduce((function(f, c) {
    return function() {
      return (spawn_command('meteor', c, ['ios'], wt ? test_path : build_path)).on('exit', f);
    };
  }), function() {
    return console.log(new Date());
  }))();
};

version = () =>
    console.log('version: ' + getVersion(add(node_modules, 'node_modules', 'cubesat', 'package.json'), rePublish.npm))

help = () => __.keys(tasks).map(k =>
    console.log('  ', (__.dasherize(k) + Array(15).join(' ')).slice(0, 16), tasks[k].description))

init = () => ''
ok   = () => console.log(argv)

task_command.call()
