// Generated by CoffeeScript 1.6.2
var Settings, add, addAttribute, api, argv, async, attributeBracket, attributeClass, attributeParse, attributes, baseUnits, blazeTags, build, build_client_path, build_dir, build_lib_path, build_path, build_public_path, cd, chokidar, client_dir, codeLine, coffee, coffee_clean, coffee_compile, coffee_ext, coffee_watch, collectExt, command, compare_file, cp, cpdir, create, create_test, cs, cssDefaults, cubesat_name, cubesat_package_path, cubesat_path, cwd, deploy, directives, dot_cubesat, dot_cubesat_path, dot_sat, dot_sat_path, dotenv, eco, env, error, exec, f, findRoot, fixup, func2val, getVersion, github_file, github_url, gitpass, help, home, htmlTags, https, idClassKey, incVersion, includeAttributes, indentStyle, index_basename, index_coffee, index_coffee_path, init, init_settings, install_mobile, isAttribute, isClass, isId, isIdClass, isType, jade, key2class, lib_dir, lib_files, loadSettings, mcTable, mc_obj, meteor_create, meteor_packages, meteor_packages_removed, meteor_publish, meteor_refresh, meteor_update, mkdir, mobile_config, mobile_config_js, mobile_packages, my_packages, nconf, nocacheRequire, node_modules, npm_install, npm_publish, npm_refresh, npm_update, ok, options, package_js, package_json, package_paths, packages_dir, parseValue, path, ps, public_dir, public_files, rePublish, readExports, readWrite, run, seperators, setAttribute, settings, settings_json, settings_path, site_coffees, site_path, spawn, spawn_command, strOrObj, styleKey, style_path, stylus, tagLine, task, tasks, templateKey, test, test_client_path, test_dir, test_lib_path, test_packages_path, test_path, test_public_path, toStyle, toTemplate, update_all, version, with_test, writeBuild, x, __RmCoffee_paths, __func, __rmdir, _meteor_run, _publish, _ref, _ref1,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

path = require('path');

ps = require('ps-node');

cs = require('coffee-script');

eco = require('eco');

chokidar = require('chokidar');

https = require('https');

jade = require('jade');

stylus = require('stylus');

async = require('async');

dotenv = require('dotenv');

nconf = require('nconf');

api = require('absurd')();

_ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;

x = require('cubesat').x;

cs.register();

command = process.argv[2];

argv = require('minimist')(process.argv.slice(3));

add = path.join;

home = process.env.HOME;

cwd = process.cwd();

build_dir = 'build';

index_basename = 'index';

coffee_ext = '.coffee';

index_coffee = index_basename + coffee_ext;

package_js = 'package.js';

package_json = 'package.json';

findRoot = function(d) {
  var dir_list;

  dir_list = process.cwd().split('/').concat([true]);
  while (dir_list.pop()) {
    if (fs.existsSync(add(dir_list.join('/'), d))) {
      break;
    }
  }
  return dir_list.join('/');
};

dot_sat = '.sat';

dot_cubesat = '.cubesat';

site_path = findRoot(dot_sat);

dot_sat_path = add(site_path, dot_sat);

cubesat_path = findRoot(dot_cubesat);

dot_cubesat_path = add(cubesat_path || home, dot_cubesat);

node_modules = findRoot('node_modules') || home;

tasks = {
  ok: {
    call: (function() {
      return ok();
    }),
    dotsat: 0,
    test: 0,
    description: ''
  },
  test: {
    call: (function() {
      return test();
    }),
    dotsat: 1,
    test: 0,
    description: 'Test environment.'
  },
  init: {
    call: (function() {
      return init();
    }),
    dotsat: 0,
    test: 0,
    description: 'Init .cubesat. (Not implemented yet)'
  },
  help: {
    call: (function() {
      return help();
    }),
    dotsat: 0,
    test: 0,
    description: 'Help message.'
  },
  create: {
    call: (function() {
      return create();
    }),
    dotsat: 0,
    test: 0,
    description: 'Create a project.'
  },
  run: {
    call: (function() {
      return run();
    }),
    dotsat: 1,
    test: 0,
    description: 'Run meteor server.'
  },
  deploy: {
    call: (function() {
      return deploy();
    }),
    dotsat: 1,
    test: 0,
    description: 'Deploy to meteor.com.'
  },
  build: {
    call: (function() {
      return build();
    }),
    dotsat: 1,
    test: 0,
    description: 'Build meteor client files.'
  },
  settings: {
    call: (function() {
      return settings();
    }),
    dotsat: 1,
    test: 0,
    description: 'Settings'
  },
  version: {
    call: (function() {
      return version();
    }),
    dotsat: 0,
    test: 0,
    description: 'Print sat version'
  },
  publish: {
    call: (function() {
      return publish();
    }),
    dotsat: 0,
    test: 0,
    description: 'Publish Meteor packages.'
  },
  coffee: {
    call: (function() {
      return coffee_compile();
    }),
    dotsat: 1,
    test: 0,
    description: 'Watching coffee files to complie.'
  },
  'mobile-config': {
    call: (function() {
      return mobile_config();
    }),
    dotsat: 0,
    test: 1,
    description: 'Create mobile-config.js'
  },
  'update-all': {
    call: (function() {
      return update_all();
    }),
    dotsat: 0,
    test: 0,
    description: 'Update most recent npm and meteor package.'
  },
  'create-test': {
    call: (function() {
      return create_test();
    }),
    dotsat: 0,
    test: 1,
    description: 'Create test directory.'
  },
  'install-mobile': {
    call: (function() {
      return install_mobile();
    }),
    dotsat: 0,
    test: 1,
    description: 'Install mobile sdk and platform.'
  },
  'npm-refresh': {
    call: (function() {
      return npm_refresh();
    }),
    dotsat: 0,
    test: 1,
    description: 'Publish and update npm cubesat packages.'
  },
  'npm-update': {
    call: (function() {
      return npm_update();
    }),
    dotsat: 0,
    test: 0,
    description: 'Update most recent cubesat npm package.'
  },
  'npm-publish': {
    call: (function() {
      return npm_publish();
    }),
    dotsat: 0,
    test: 1,
    description: 'Publish cubesat to npm'
  },
  'npm-install': {
    call: (function() {
      return npm_install();
    }),
    dotsat: 0,
    test: 1,
    description: 'Install local cubesat'
  },
  'meteor-refresh': {
    call: (function() {
      return meteor_refresh();
    }),
    dotsat: 1,
    test: 1,
    description: 'Publish and update meteor cubesat packages.'
  },
  'meteor-update': {
    call: (function() {
      return meteor_update();
    }),
    dotsat: 1,
    test: 0,
    description: 'Update most recent meteor cubesat packages.'
  },
  'meteor-publish': {
    call: (function() {
      return meteor_publish();
    }),
    dotsat: 0,
    test: 1,
    description: 'Publish cubesat to meteor'
  }
};

options = {
  t: {
    full: 'with-test',
    command: ['run', 'coffee', 'install-mobile'],
    description: 'Excute with test.'
  },
  T: {
    full: 'for-test',
    command: ['run', 'coffee', 'install-mobile'],
    description: 'Excute for test.'
  }
};

if (site_path === '' && ((_ref1 = tasks[command]) != null ? _ref1.dotsat : void 0)) {
  console.log('fatal: "sat' + command + '" must run in .sat working directory or its subdirectory.');
  process.exit(1);
}

site_path && (site_coffees = fs.readdirSync(site_path).filter(function(f) {
  return coffee_ext === path.extname(f);
}));

[home, cubesat_path, dot_cubesat_path, site_path].forEach(function(_path) {
  var dotenv_path;

  return fs.existsSync(dotenv_path = add(_path, '.env')) && dotenv.config({
    path: dotenv_path
  });
});

build_path = add(site_path, build_dir);

index_coffee_path = add(site_path, index_coffee);

build_path && (mobile_config_js = add(build_path, 'mobile-config.js'));

env = function(v) {
  var _path;

  return (_path = process.env[v]) && _path.replace(/^~\//, home + '/');
};

test_dir = (function() {
  var _ref2;

  switch (false) {
    case !(with_test = argv['with-test'] && x.isString(with_test)):
      return with_test;
    case !(((_ref2 = tasks[command]) != null ? _ref2.test : void 0) && argv._[0]):
      return argv._[0];
    default:
      return 'test';
  }
})();

test_path = fs.existsSync(test_path = add(cubesat_path, test_dir)) ? test_path : void 0;

nocacheRequire = function(f) {
  return delete require.cache[f] && require(f);
};

loadSettings = function(f) {
  var s;

  return (fs.existsSync(f) && x["return"](s = (nocacheRequire(f)).Settings, x["return"](s))) || {};
};

Settings = loadSettings(settings_path = add(dot_cubesat_path, 'settings.coffee'));

(f = function(o) {
  return x.keys(o).forEach(function(k) {
    if (x.isObject(o[k])) {
      return o[k] = f(o[k]);
    } else {
      return o[k] = x["return"](o[k]);
    }
  });
})(Settings);

settings_json = add(build_path, 'settings.json');

nconf.file({
  file: add(dot_sat_path, 'config.json')
});

this.Theme = this.Modules = {};

func2val = function(f, _) {
  if (x.isObject(f)) {
    x.keys(f).forEach(function(k) {
      return f[k] = func2val(f[k], _);
    });
    return f;
  } else if (x.isFunction(f)) {
    return x["return"](f, _);
  } else {
    return f;
  }
};

init_settings = function() {
  var local, site;

  Settings = loadSettings(settings_path);
  x.assign(Settings, loadSettings(index_coffee_path));
  func2val(Settings, Settings);
  (site = Settings.site) && (local = Settings.local) && local[site] && x.assign(Settings, local[site]);
  return this.Settings = Settings;
};

init_settings();

lib_dir = 'lib';

client_dir = 'client';

public_dir = 'public';

packages_dir = 'packages';

build_client_path = add(build_path, client_dir);

build_lib_path = add(build_path, lib_dir);

build_public_path = add(build_path, public_dir);

style_path = add(site_path, 'style');

cubesat_name = 'isaac:cubesat';

lib_files = x.toArray(Settings.lib_files);

my_packages = x.toArray(Settings.packages);

public_files = x.toArray(Settings.public_files);

if (test_path) {
  test_client_path = add(test_path, client_dir);
  test_lib_path = add(test_path, lib_dir);
  test_public_path = add(test_path, public_dir);
  test_packages_path = add(test_path, packages_dir);
  cubesat_package_path = add(test_packages_path, cubesat_name);
  package_paths = my_packages.map(function(p) {
    return add(test_packages_path, p);
  });
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
  x["return"](f);
  return dir;
};

mkdir = function(dir, _path, f) {
  _path && process.chdir(_path);
  return dir && fs.readdir(dir, function(e, l) {
    return e && fs.mkdir(dir, function(e) {
      return e || x["return"](f);
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
      var t_f, _path;

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
      var _ref2;

      return '-wbc' === ((_ref2 = p["arguments"]) != null ? _ref2[3] : void 0) && process.kill(p.pid, 'SIGKILL');
    });
  });
};

coffee_watch = function(c, js) {
  return spawn('coffee', ['-o', js, '-wbc', c], {
    stdio: 'inherit'
  });
};

coffee_compile = function() {
  var coffee_dir, js_dir;

  mkdir(build_lib_path);
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
      var c, _ref2;

      if ('-wbc' === ((_ref2 = p["arguments"]) != null ? _ref2[3] : void 0) && ((c = p["arguments"][4]) != null)) {
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
  return '\n' + x.keys(o).map(function(k) {
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
  if (x.isObject(o)) {
    return '{\n' + x.keys(o).map(function(k) {
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
  data = x.keys(o = Settings.app).map(function(k) {
    var _ref2, _ref3;

    if ((_ref2 = mcTable[k]) != null ? _ref2.list : void 0) {
      return x.keys(o[k]).map(function(l) {
        return 'App.' + k + '("' + l + '", ' + strOrObj(o[k][l]) + ');';
      }).join('\n') + '\n\n';
    } else if (x.isArray(o[k])) {
      return o[k].map(function(l) {
        return 'App.' + k + '("' + l + '");';
      }).join('\n') + '\n\n';
    } else {
      return 'App.' + k + '({' + (((_ref3 = mcTable[k]) != null ? _ref3.f : void 0) || mc_obj)(o[k]) + '\n});\n\n';
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
      b = x.indent(b, 1);
      return "template(name='" + n + "')\n" + b + "\n\n";
    }
  },
  jade$: {
    file: '2.html',
    f: function(n, b) {
      b = x.indent(b, 1);
      return jade.compile("template(name='" + n + "')\n" + b + "\n\n", null)();
    }
  },
  template: {
    file: 'template.jade',
    f: function(n, b) {
      b = x.indent(b, 1);
      return "template(name='" + n + "')\n" + b + "\n\n";
    }
  },
  HTML: {
    file: '3.html',
    f: function(n, b) {
      b = x.indent(b, 1);
      return "<template name=\"" + n + "\">\n" + b + "\n</template>\n";
    }
  },
  head: {
    file: '0.jade',
    header: function() {
      return 'head\n';
    },
    f: function(n, b) {
      return x.indent(b, 1) + '\n';
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

writeBuild = function(file, data) {
  var fwrite;

  return data.length > 0 && fs.readFile(fwrite = add(build_client_path, file), 'utf8', function(err, d) {
    return ((d == null) || data !== d) && fs.writeFile(fwrite, data, function(e) {
      return console.log(new Date(), fwrite);
    });
  });
};

fixup = function(v) {
  var o, r;

  switch (false) {
    case !(v == null):
      return {};
    case !x.isString(v):
      return ((o = {})[v] = '') || o;
    case !x.isFunction(v):
      if (x.isScalar(r = x["return"](v, this))) {
        return r;
      } else {
        return fixup.call(this, r);
      }
    case !x.isArray(v):
      return v.reduce((function(o, w) {
        return x.assign(o, fixup.call(this, w));
      }), {});
    case !x.isObject(v):
      return x.reduceKeys(v, {}, function(o, k) {
        return x.object(o, k, (x.isScalar(r = v[k]) ? r : fixup.call(this, r)));
      });
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

cssDefaults = function(obj) {
  if (!x.isObject(obj)) {
    return obj;
  }
  return x.keys(obj).forEach(function(o, k) {
    var ok;

    return o[k] = (function() {
      switch (false) {
        case 0 !== ok:
          return '0';
        case !x.isObject(ok = obj[k]):
          return cssDefaults(ok);
        case !x.isNumber(ok):
          return String(ok) + (k in baseUnits ? baseUnits[k] : 'px');
        default:
          return ok;
      }
    })();
  });
};

isId = function(str) {
  return /^[a-z]+[0-9]+$/.test(str) && !/^h[1-6]$/.test(str);
};

isClass = function(str) {
  return /^_[a-z]+[a-zA-Z0-9$]*$/.test(str);
};

isIdClass = function(str) {
  return /^[a-zA-Z0-9_$]+$/.test(str) && /_/.test(str);
};

idClassKey = function(key, s) {
  var r,
    _this = this;

  if (s == null) {
    s = '';
  }
  while ((r = new RegExp(/\[(#?[a-z_]+[0-9]+)\]/)).test(key)) {
    key = key.replace(r, function(m, $1) {
      return _this[x.f.id]($1);
    });
  }
  switch (false) {
    case !isId(key):
      return ['#' + this[x.f.id](key)];
    case !isClass(key):
      return ['.' + x.dasherize(key.slice(1))];
    case !isIdClass(key):
      return key.split('_').map(function(a, i) {
        switch (false) {
          case '' !== a:
            return null;
          case !isId(a):
            return '#' + _this[x.f.id](a);
          case !isClass('_' + a):
            return '.' + x.dasherize(a);
          default:
            return console.error('Unknown ID or class:', a);
        }
      }).filter(function(f) {
        return f;
      }).join(s);
  }
};

styleKey = function(obj) {
  var _this = this;

  return x.reduceKeys(obj, {}, function(o, k) {
    var ok;

    return x.object(o, idClassKey.call(_this, k, ' '), x.isObject(ok = obj[k]) ? styleKey.call(_this, ok) : ok);
  });
};

toStyle = function(d) {
  return cssDefaults(styleKey.call(this, fixup.call(this, this[d])));
};

indentStyle = function(obj, depth) {
  if (depth == null) {
    depth = 1;
  }
  if (!x.isObject(obj)) {
    return obj;
  }
  return x.keys(obj).map(function(key) {
    var value;

    return Array(depth).join(x.indentString || '  ') + (x.isObject(value = obj[key]) ? [key, indentStyle(value, depth + 1)].join('\n') : key + ' ' + value);
  }).join('\n');
};

parseValue = function(str) {
  if (!x.isString(str)) {
    return str;
  }
  return str.replace(/(^|[^{])\{([^{}]+)\}($|[^}])/g, function(m, $1, $2, $3) {
    return $1 + '{{' + $2 + '}}' + $3;
  });
};

key2class = function(k) {
  return x.dasherize(k.slice(1));
};

attributeClass = function(key, value) {
  if (value) {
    return (value.split(' ')).reverse().map(function(k) {
      return k && key2class(key) + '-' + k;
    }).concat(key.slice(1)).reverse().filter(function(v) {
      return v;
    }).join(' ');
  } else {
    return key2class(key);
  }
};

addAttribute = function(o, attr, value, seperator) {
  if (seperator == null) {
    seperator = ' ';
  }
  return x.object(o, attr, o[attr] && o[attr].length > 0 ? o[attr] = [o[attr], value].join(seperator) : value);
};

setAttribute = function(o, attr, value) {
  return x.object(o, attr, value);
};

attributeParse = function(obj) {
  var p;

  return x.keys(p = x.reduceKeys(obj, {}, function(o, k) {
    switch (false) {
      case !isClass(k):
        return addAttribute(o, 'class', attributeClass(k, obj[k]));
      case !('id' === k && isId(obj[k]) && x.f.id in this):
        return setAttribute(o, k, this[x.f.id](obj[k]));
      case k !== 'class':
        return addAttribute(o, 'class', obj[k]);
      default:
        return setAttribute(o, k, obj[k]);
    }
  })).map(function(k) {
    return k + '="' + parseValue(p[k]) + '"';
  }).join(' ');
};

attributeBracket = function(obj) {
  var o;

  delete (o = x.assign({}, obj)).$;
  if (x.isEmpty(o)) {
    return '';
  } else {
    return '(' + attributeParse.call(this, o) + ')';
  }
};

codeLine = function(o, tag, obj) {
  var _class;

  isClass(_class = x.keys(obj)[0]) && x.isObject(obj[_class]) && x.remove(x.assign(x.object(obj, 'class', key2class(_class)), obj[_class]), _class);
  return x.object(o, tag + attributeBracket.call(this, obj), '$' in obj ? parseValue(obj['$']) : '');
};

attributes = 'id class style src height width href size name'.split(' ');

isAttribute = function(obj) {
  var _ref2;

  return x.isObject(obj) && (_ref2 = x.keys(obj)[0], __indexOf.call(attributes, _ref2) >= 0);
};

tagLine = function(tag, obj) {
  var keys, _class,
    _this = this;

  switch (false) {
    case !x.isString(obj):
      return codeLine.call(this, {}, tag, {
        $: parseValue(obj)
      });
    case !x.isNumber(obj):
      return console.error('NUMBER?');
    case !x.isArray(obj):
      return console.error('ARRAY?');
    case !isAttribute(obj):
      return codeLine.call(this, {}, tag, obj);
    case !isClass(_class = (x.keys(obj))[0]):
      return codeLine.call(this, {}, tag, obj);
    case !isId((keys = x.keys(obj))[0]):
      return keys.reduce((function(o, v) {
        return codeLine.call(_this, o, tag, x.object(obj[v], 'id', _this[x.f.id](v)));
      }), {});
    default:
      return x.object({}, tag, obj);
  }
};

htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');

htmlTags.forEach(function(tag) {
  return global[tag.toUpperCase()] = function() {
    return tagLine.call(this, tag, arguments[0]);
  };
});

blazeTags = 'each if with unless'.split(' ');

blazeTags.forEach(function(tag) {
  return global[tag] = function() {
    var key, o, obj, str;

    switch (false) {
      case !x.isObject(obj = arguments[0]):
        (o = {})[tag + ' ' + (key = x.keys(obj)[0])] = obj[key];
        return o;
      case !x.isString(str = arguments[0] && x.isObject(obj = arguments[1] && '$' in obj)):
        (o = {})[tag + ' ' + str] = obj.$;
        return o;
      default:
        return console.error('Tag arguments are not (name: obj) or ("name", $: obj)');
    }
  };
});

includeAttributes = function(obj) {
  return x.keys(obj).map(function(k) {
    return k + '="' + parseValue(obj[k]) + '"';
  }).join(' ');
};

global.include = function() {
  var args, k, obj, str;

  switch (false) {
    case !x.isObject(obj = arguments[0]):
      return x.object({}, '+' + (k = x.keys(obj)[0]) + '(' + includeAttributes(obj[k]) + ')', '');
    case !x.isString(str = arguments[0]):
      if ((args = Array.prototype.slice.call(arguments)).length > 1) {
        return args.reduce((function(o, k) {
          return x.object(o, '+' + k, '');
        }), {});
      } else {
        return x.object({}, '+' + str, '');
      }
  }
};

templateKey = function(obj) {
  var _this = this;

  if (!x.isObject(obj)) {
    return obj;
  }
  return x.reduceKeys(obj, {}, function(o, k) {
    switch (false) {
      case !((isId(k) || isClass(k)) && isAttribute(obj[k])):
        return x.assign(o, templateKey.call(_this, tagLine.call(_this, idClassKey.call(_this, k), obj[k])));
      case !(isId(k) || isClass(k) || isIdClass(k)):
        return x.object(o, idClassKey.call(_this, k), x.isObject(obj[k]) ? templateKey.call(_this, obj[k]) : parseValue(obj[k]));
      default:
        return x.object(o, k, templateKey.call(_this, obj[k]));
    }
  });
};

toTemplate = function(d) {
  var data, str;

  if (x.isEmpty(this[d])) {
    return null;
  }
  str = x.isString(this[d]) ? this[d] : indentStyle(templateKey.call(this, fixup.call(this, this[d]), this[x.f.id]));
  if (x.isEmpty(data = fixup.call(this, this.eco))) {
    return str;
  } else {
    return eco.render(str, data);
  }
};

readExports = function(f, kind) {
  var base;

  return x["return"](index_basename === (base = path.basename(f, coffee_ext)) ? (nocacheRequire(f))[kind] : (updateRequire(f))[base][kind]);
};

build = function() {
  settings();
  spawn_command('coffee', (command === 'build' || command === 'deploy' ? '-bc' : '-bcw'), ['-o', build_lib_path, site_coffees.join(' ')], site_path);
  mkdir(build_client_path);
  this.Modules = site_coffees.reduce((function(o, f) {
    return x.assign(o, readExports(add(site_path, f), 'Modules'));
  }), {});
  x.keys(this.Modules).map(function(n) {
    return x.module(n, this.Modules[n] = x["return"](this.Modules[n], x["return"](this.Modules[n])));
  });
  x.keys(directives).map(function(d) {
    var it;

    return writeBuild((it = directives[d]).file, (x["return"](it.header) || '') + x.keys(this.Modules).map(function(n) {
      var b;

      this.Modules[n][d] = x["return"](this.Modules[n][d], this.Modules[n]);
      return (b = toTemplate.call(this.Modules[n], d)) && it.f.call(this, n, b);
    }).filter(function(o) {
      return o != null;
    }).join(''));
  });
  return x.keys(this.Modules).map(function(n, i) {
    return this.Modules[n].style && api.add(toStyle.call(this.Modules[n], 'style'));
  }).concat([writeBuild('absurd.css', api.compile())]);
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
        return x["return"](fn);
      }))();
    }))();
  });
};

create = function() {
  var site;

  x.valid('name', site = argv._[0]) || console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) || process.exit(1);
  return fs.mkdir(site, function(e) {
    e && (console.error("error: Can not create", site) || process.exit(1));
    return (spawn_command('git', 'clone', [github_url(argv.repo || 'i4han/sat-init'), '.'], site)).on('exit', function(code) {
      code && (console.error('error: Git exited with an error.') || process.exit(1));
      return fs.existsSync('./build/.meteor') || meteor_create(build_dir);
    });
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

getVersion = function(file, re) {
  return fs.readFileSync(file, 'utf8').match(re)[2];
};

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
  npm: /("version"\s*:\s*['"])([0-9.]+)(['"]\s*,)/m,
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
  build();
  _meteor_run();
  return argv['with-test'] && test();
};

deploy = function() {
  build();
  return spawn_command('meteor', 'deploy', [argv._[0] || Settings.deploy.name, '--settings', settings_json], build_path);
};

test = function() {
  build();
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

version = function() {
  return console.log('version: ' + getVersion(add(node_modules, 'node_modules', 'cubesat', 'package.json'), rePublish.npm));
};

help = function() {
  return x.keys(tasks).map(function(k) {
    return console.log('  ', (k + Array(15).join(' ')).slice(0, 16), tasks[k].description);
  });
};

init = function() {
  return '';
};

ok = function() {
  return console.log(argv);
};

(task = tasks[command]) && task.call();

task || help();

/*
__RmLog = ->
   # node-logentries
   arguments? and ([].slice.call(arguments)).forEach (str) ->
      fs.appendFile home + '/.log.io/cake', str, (err) -> console.log err if err
__RmUpdated = 'updated time'
__RmMeteor_update = ->
   spawn_command 'meteor', 'add', [
      cubesat_name + '@' + getVersion add(cubesat_package_path, package_js), rePublish.meteor
   ], build_path 


__clean_up = ->
   rmdir build_client_path 
   rmdir build_lib_path 

__daemon = ->
   ps.lookup command: 'node',   psargs: 'ux', (e, a) -> 
      node_ps = a.map (p) -> (p.arguments?[0]?.match /\/(log\.io-[a-z]+)$/)?[1]
      'log.io-server'    in node_ps or spawn 'log.io-server',    [], stdio:'inherit'
      'log.io-harvester' in node_ps or setTimeout( ( -> spawn 'log.io-harvester', [], stdio:'inherit' ), 100 )


__stop_meteor = (func) ->
   ps.lookup psargs: 'ux', (err, a) -> a.map (p, i) ->
      ['3000', '3300'].map (port) -> 
         if '--port' == p.arguments?[1] and port == p.arguments?[2]
            process.kill p.pid, 'SIGKILL'
      a.length - 1 == i and func? and func()

__meteor_update = ->
   cd site_meteor_path
   spawn 'meteor', ['update'], stdio:'inherit'

__meteor_publish_command = -> spawn 'meteor', ['publish'], stdio:'inherit'
__meteor_command = (command, argument, path) -> 
   cd path
   console.log 'meteor', command, argument
   spawn 'meteor', [command, argument], stdio:'inherit'
__start_meteor = ->
   stop_meteor -> 
      meteor test_path, '3300'
      #meteor site_meteor_path

__hold_watch = (sec) -> updated = process.hrtime()[0] + sec

__start_up = ->
   coffee_alone()
   #chokidar.watch(settings_cson).on 'change', -> settings()
   #chokidar.watch(test_lib_path).on 'change', (d) -> buid() # cp d, add build_lib_path, path.basename d
   lib_paths.concat([index_coffee_path]).map (f) -> 
      chokidar.watch(f).on 'change', -> build()
   hold_watch(2)
   package_paths.map (p) ->
      chokidar.watch(p).on 'change', (f) ->
         if updated < process.hrtime()[0]
            nconf.set 'updated_packages', (((nconf.get 'updated_packages') or [])
               .concat([dir_f = path.dirname f]).filter((v, i, a) -> a.indexOf(v) == i))
            console.log new Date(), 'Changed', f
   commands()

__commands = ->
   rl = require('readline').createInterface process.stdin, process.stdout
   rl.setPrompt ''
   rl.on('line', (line) ->        
      switch (line = line.replace(/\s{2,}/g,' ').trim().split ' ')[0]
         when '.'        then console.log 'hi'
         when 'build'    then build()
         when 'time'     then console.log new Date()
         when 'publish'  then publish()
         when 'update'   then meteor_update()
         when 'settings' then settings()
         when 'coffee'   then switch line[1] 
            when 'alone' then coffee_alone() 
            when 'clean' then coffee_clean() 
         when 'meteor'   then start_meteor()
         when 'packages' then console.log nconf.get 'updated_packages'; nconf.save()
         when 'get'      then console.log nconf.get line[1]
         when 'set'      then nconf.set line[1], line[2]
         when 'stop'     then 'meteor' == line[1] and stop_meteor()
         when '' then ''
         else console.log '?'
   ).on 'close', ->
      console.log 'bye!'
      coffee_clean()
      nconf.save()
      rl.close()
      process.exit 1

__meteor = (dir, port='3000') ->
   cd dir
   spawn 'meteor', ['--port', port, '--settings', settings_json], stdio:'inherit'
*/
