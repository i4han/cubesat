// Generated by CoffeeScript 1.6.2
var methods;

if (Meteor.isServer) {
  methods = {};
  false && x.keys(Settings).map(function(k) {
    return x.isObject(Settings[k]) && x.keys(Settings[k]).map(function(l) {
      var Skl;

      Skl = Settings[k][l];
      return x.isString(Skl.meteor_method) && (methods[Skl.meteor_method] = function(o) {
        return HTTP.call(Skl.method, Skl.url, x.interpolateOO(Skl.options, o));
      });
    });
  });
  Meteor.methods(methods);
} else if (Meteor.isClient) {
  false && (typeof Settings !== "undefined" && Settings !== null ? Settings["public"] : void 0) && Settings["public"].meteor_methods.map(function(m) {
    return call[m] = function(options) {
      return Meteor.call(m, options.options, function(e, result) {
        Session.set(m, result);
        return options.db && db[options.db].insert(result.data);
      });
    };
  });
}
