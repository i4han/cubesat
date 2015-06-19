// Generated by CoffeeScript 1.6.2
var Parts, Settings, add, addAttribute, api, argv, async, attributeBracket, attributeClass, attributeParse, baseUnits, blazeTags, build, build_client_path, build_dir, build_lib_path, build_path, build_public_path, cd, chokidar, client_dir, codeLine, coffee, coffee_clean, coffee_compile, coffee_ext, coffee_watch, collectExt, command, compare_file, cp, cpdir, create, create_test, cs, cssDefaults, cubesat_name, cubesat_package_path, cubesat_path, cwd, deploy, directives, dot_cubesat, dot_cubesat_path, dot_sat, dot_sat_path, dotenv, eco, env, error, exec, f, findRoot, fixup, func2val, getVersion, github_file, github_url, gitpass, help, home, htmlAttributes, htmlTags, https, idClassKey, incVersion, includeAttributes, indentStyle, index_coffee, index_coffee_path, init, init_settings, install_mobile, isHtmlAttribute, isType, jade, lib_dir, lib_files, loadSettings, mcTable, mc_obj, meteor_create, meteor_packages, meteor_packages_removed, meteor_publish, meteor_refresh, meteor_update, mkdir, mobile_config, mobile_config_js, mobile_packages, my_packages, nconf, newTab, nocacheRequire, node_modules, npm_install, npm_publish, npm_refresh, npm_update, ok, options, package_js, package_json, package_paths, packages_dir, path, ps, public_dir, public_files, rePublish, readExports, readWrite, run, seperators, settings, settings_json, settings_path, site_coffees, site_path, spawn, spawn_command, strOrObj, styleLoop, styleMediaQuery, style_path, stylus, tagLine, task, tasks, test, test_client_path, test_dir, test_lib_path, test_packages_path, test_path, test_public_path, toStyle, toTemplate, toTemplateLoop, update_all, version, with_test, writeBuild, x, __RmCoffee_paths, __commands, __func, __rmdir, __start_up, _index_, _meteor_run, _publish, _ref, _ref1, _tag,
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

_index_ = 'index';

coffee_ext = '.coffee';

index_coffee = _index_ + coffee_ext;

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

this.Theme = this.Modules = Parts = {};

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
  var r,
    _this = this;

  switch (false) {
    case !(v == null):
      return {};
    case !x.isString(v):
      return x.object({}, v, '');
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
        if (Parts && k in Parts) {
          x.assign(o, fixup.call(_this, Parts[k].call(_this, v[k])));
        } else {
          x.object(o, k, (x.isScalar(r = v[k]) ? r : fixup.call(_this, r)));
        }
        return o;
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

newTab = '_';

cssDefaults = function(obj) {
  if (!x.isObject(obj)) {
    return obj;
  }
  x.keys(obj).forEach(function(k) {
    var ok;

    return obj[k] = (function() {
      switch (false) {
        case 0 !== (ok = obj[k]):
          return '0';
        case !x.isObject(ok):
          return cssDefaults(ok);
        case !x.isNumber(ok):
          return String(ok) + (k in baseUnits ? baseUnits[k] : 'px');
        default:
          return ok;
      }
    })();
  });
  return obj;
};

idClassKey = function(key, s) {
  var r,
    _this = this;

  if (s == null) {
    s = '';
  }
  while ((r = new RegExp(/\[(#?[a-z]+[0-9]+)\]/)).test(key)) {
    key = key.replace(r, function(m, $1) {
      return x.key2id.call(_this, $1);
    });
  }
  switch (false) {
    case !x.check('id', key):
      return '#' + x.key2id.call(this, key);
    case !x.check('class', key):
      return '.' + x.key2class(key);
    case !x.check('id&class', key):
      return key.split('_').map(function(a, i) {
        switch (false) {
          case '' !== a:
            return null;
          case !x.check('id', a):
            return '#' + x.key2id.call(_this, a);
          case !x.check('class', '_' + a):
            return '.' + x.key2class(a);
          default:
            return console.error('Unknown ID or class:', a);
        }
      }).filter(function(f) {
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
  var _this = this;

  return x.reduceKeys(obj, {}, function(o, k) {
    var idk;

    switch (false) {
      case k[0] !== '@':
        return x.object(o, styleMediaQuery(k), styleLoop.call(_this, obj[k]));
      case !(k in Parts):
        return x.assign(o, Parts[k].call(_this, obj[k]));
      case k === (idk = idClassKey.call(_this, k)):
        return x.object(o, idk, obj[k]);
      default:
        return x.object(o, k, obj[k]);
    }
  });
};

toStyle = function(d) {
  var obj,
    _this = this;

  return cssDefaults(x.reduceKeys((obj = fixup.call(this, this[d])), {}, function(o, k) {
    return x.object(o, idClassKey.call(_this, k, ' '), styleLoop.call(_this, obj[k]));
  }));
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

attributeClass = function(key, value) {
  if (value) {
    return value.replace(/\*/g, x.key2class(key));
  } else {
    return x.key2class(key);
  }
};

addAttribute = function(o, attr, value, seperator) {
  if (seperator == null) {
    seperator = ' ';
  }
  return x.object(o, attr, o[attr] && o[attr].length > 0 ? o[attr] + seperator + value : value);
};

attributeParse = function(obj) {
  var p;

  return x.keys(p = x.reduceKeys(obj, {}, function(o, k) {
    switch (false) {
      case !x.check('class', k):
        return addAttribute(o, 'class', attributeClass(k, obj[k]));
      case !('id' === k && x.check('id', obj[k]) && x.isModule(this)):
        return x.object(o, x.key2attribute(k), x.key2id.call(this, obj[k]));
      case k !== 'class':
        return addAttribute(o, 'class', obj[k]);
      default:
        return x.object(o, x.key2attribute(k), obj[k]);
    }
  })).map(function(k) {
    switch (p[k]) {
      case '':
        return k;
      default:
        return k + '="' + x.parseValue(p[k]) + '"';
    }
  }).filter(function(v) {
    return v;
  }).join(' ');
};

attributeBracket = function(obj) {
  var o;

  delete (o = x.assign({}, obj))[newTab];
  if (x.isEmpty(o)) {
    return '';
  } else {
    return '(' + attributeParse.call(this, o) + ')';
  }
};

codeLine = function(o, tag, obj) {
  var _class;

  x.check('class', _class = x.keys(obj)[0]) && x.isObject(obj[_class]) && x.remove(x.assign(x.object(obj, 'class', x.key2class(_class)), obj[_class]), _class);
  return x.object(o, tag + attributeBracket.call(this, obj), newTab in obj ? x.parseValue(obj[newTab]) : '');
};

htmlAttributes = 'id class style src height width href size name'.split(' ');

isHtmlAttribute = function(obj) {
  var _ref2;

  return x.isObject(obj) && (_ref2 = x.keys(obj)[0], __indexOf.call(htmlAttributes, _ref2) >= 0);
};

tagLine = function(tag, obj, str) {
  var args, k, keys,
    _this = this;

  x.isObject(obj) && (obj = fixup.call(this, obj));
  args = ([].slice.call(arguments)).slice(2);
  str && x.object(obj, newTab, args.length === 1 ? args[0] : args);
  switch (false) {
    case !x.isString(obj):
      return codeLine.call(this, {}, tag, x.object({}, newTab, x.parseValue(obj)));
    case !x.isNumber(obj):
      return console.error('NUMBER?');
    case !x.isArray(obj):
      return console.error('ARRAY?');
    case !(x.check('attribute', k = (keys = x.keys(obj))[0]) || x.check('class', k)):
      return codeLine.call(this, {}, tag, obj);
    case !(x.check('id', k) && __indexOf.call(keys, newTab) >= 0):
      return codeLine.call(this, {}, tag, x.object(obj[k], ['id', x.key2id.call(this, k)], [newTab, obj[newTab]]));
    case !x.check('id', k):
      x.keys(obj[k]).forEach(function(kk) {
        return x.check('id', kk) && x.object(obj, kk, x.pop(obj[k][kk]));
      });
      return x.keys(obj).reduce((function(o, v) {
        return codeLine.call(_this, o, tag, x.object(obj[v], 'id', x.key2id.call(_this, v)));
      }), {});
    default:
      return console.error('Unknown TAG', tag, obj);
  }
};

htmlTags = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');

htmlTags.forEach(function(tag) {
  return global[tag.toUpperCase()] = function() {
    var args;

    if (x.isModule((args = [].slice.call(arguments))[0])) {
      if (args.length === 1) {
        return tagLine.bind(args[0], tag);
      } else {
        return tagLine.apply(args[0], [tag].concat(args.slice(1)));
      }
    } else {
      return tagLine.apply(null, [tag].concat(args));
    }
  };
});

_tag = function(tag) {
  return (tag === 'elif' ? 'else if' : tag) + ' ';
};

blazeTags = 'each with unless if elif else'.split(' ');

blazeTags.forEach(function(tag) {
  return global[tag] = function() {
    var key, o, obj, str;

    switch (false) {
      case !x.isObject(obj = arguments[0]):
        (o = {})[_tag(tag) + (key = x.keys(obj)[0])] = obj[key];
        return o;
      case !x.isString(str = arguments[0] && x.isObject(obj = arguments[1]) && newTab in obj):
        return x.object({}, _tag(tag) + str, obj[newTab]);
      default:
        return console.error('Tag arguments are not (name: obj) or ("name", $: obj)');
    }
  };
});

includeAttributes = function(obj) {
  return x.keys(obj).map(function(k) {
    return k + '="' + x.parseValue(obj[k]) + '"';
  }).join(' ');
};

global.include = function() {
  var args;

  return (args = [].slice.call(arguments)).reduce((function(o, arg) {
    var k;

    switch (false) {
      case !x.isObject(arg):
        return x.object(o, '+' + (k = x.keys(arg)[0]) + '(' + includeAttributes(arg[k]) + ')', '');
      case !x.isString(arg):
        return x.object(o, '+' + arg, '');
      default:
        return console.err({
          'Invalid `include` arguments': args[0]
        }, arg);
    }
  }), {});
};

toTemplateLoop = function(obj) {
  var _this = this;

  if (x.isObject(obj)) {
    return x.reduceKeys(obj, {}, function(o, k) {
      switch (false) {
        case !(x.check('id', 'class', k) && isHtmlAttribute(obj[k])):
          return x.assign(o, toTemplateLoop.call(_this, tagLine.call(_this, idClassKey.call(_this, k), obj[k])));
        case !x.check('id', 'class', k):
          return x.object(o, idClassKey.call(_this, k), toTemplateLoop.call(_this, obj[k]));
        default:
          return x.object(o, k, toTemplateLoop.call(_this, obj[k]));
      }
    });
  } else {
    return x.parseValue(obj);
  }
};

eco = function(str) {
  var data;

  if (x.isEmpty(data = fixup.call(this, this.eco))) {
    return str;
  } else {
    return eco.render(str, data);
  }
};

toTemplate = function(d) {
  switch (false) {
    case !x.isEmpty(this[d]):
      return null;
    case !x.isString(this[d]):
      return eco.call(this, this[d]);
    case !(x.isObject(this[d]) || x.isArray(this[d])):
      return eco.call(this, indentStyle(toTemplateLoop.call(this, fixup.call(this, this[d]))));
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
  spawn_command('coffee', (command === 'build' || command === 'deploy' ? '-bc' : '-bcw'), ['-o', build_lib_path, site_coffees.join(' ')], site_path);
  mkdir(build_client_path);
  this.Parts = Parts = x["return"]((source = site_coffees.reduce((function(o, f) {
    return x.assign(o, readExports(add(site_path, f)));
  }), {}))['Parts']);
  this.Modules = x["return"](source['Modules']);
  (mkeys = x.keys(this.Modules)).map(function(n) {
    return x.module(n, this.Modules[n] = x["return"](this.Modules[n], x["return"](this.Modules[n])));
  });
  x.keys(directives).map(function(d) {
    var it;

    return writeBuild((it = directives[d]).file, (x["return"](it.header) || '') + mkeys.map(function(n) {
      var b;

      this.Modules[n][d] = x["return"](this.Modules[n][d], this.Modules[n]);
      return (b = toTemplate.call(this.Modules[n], d)) && it.f.call(this, n, b);
    }).filter(function(o) {
      return o != null;
    }).join(''));
  });
  count = 0;
  return mkeys.forEach(function(n) {
    this.Modules[n].style && api.add(toStyle.call(this.Modules[n], 'style'));
    return ++count === mkeys.length && writeBuild('absurd.css', api.compile());
  });
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

  x.check('name', site = argv._[0]) || console.error("error: Not a vaild name to create. Use alphanumeric and '.', '_', '-'.", site) || process.exit(1);
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

__start_up = function() {
  coffee_alone();
  lib_paths.concat([index_coffee_path]).map(function(f) {
    return chokidar.watch(f).on('change', function() {
      return build();
    });
  });
  hold_watch(2);
  package_paths.map(function(p) {
    return chokidar.watch(p).on('change', function(f) {
      var dir_f;

      if (updated < process.hrtime()[0]) {
        nconf.set('updated_packages', ((nconf.get('updated_packages')) || []).concat([dir_f = path.dirname(f)]).filter(function(v, i, a) {
          return a.indexOf(v) === i;
        }));
        return console.log(new Date(), 'Changed', f);
      }
    });
  });
  return commands();
};

__commands = function() {
  var rl;

  rl = require('readline').createInterface(process.stdin, process.stdout);
  rl.setPrompt('');
  return rl.on('line', function(line) {
    switch ((line = line.replace(/\s{2,}/g, ' ').trim().split(' '))[0]) {
      case '.':
        return console.log('hi');
      case 'build':
        return build();
      case 'time':
        return console.log(new Date());
      case 'publish':
        return publish();
      case 'update':
        return meteor_update();
      case 'settings':
        return settings();
      case 'coffee':
        switch (line[1]) {
          case 'alone':
            return coffee_alone();
          case 'clean':
            return coffee_clean();
        }
        break;
      case 'meteor':
        return start_meteor();
      case 'packages':
        console.log(nconf.get('updated_packages'));
        return nconf.save();
      case 'get':
        return console.log(nconf.get(line[1]));
      case 'set':
        return nconf.set(line[1], line[2]);
      case 'stop':
        return 'meteor' === line[1] && stop_meteor();
      case '':
        return '';
      default:
        return console.log('?');
    }
  }).on('close', function() {
    console.log('bye!');
    coffee_clean();
    nconf.save();
    rl.close();
    return process.exit(1);
  });
};
