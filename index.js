'use strict';

var extend = require('extend')
  , dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')
  , has      = hasOwnProperty

// Note: JSON Schema types

var CASTFNS = {
  'array'  : Array,
  'boolean': Boolean,
  'integer': parseInt,
  'number' : Number,
  'null'   : function(){ return null; },
  'object' : Object,
  'string' : String
}

module.exports = function(){

  var attrs = {}
    , defaults = {}
    , casts  = {}
    , castfns = extend({}, CASTFNS)

  model.cast = function(name,fn){
    castfns[name] = fn; return this;
  }
  
  model.attr = function(_,schema){
    schema = schema || {}
    attrs[_] = !schema.readOnly;
    if (schema.default)  defaults[_] = defaultfn(schema.default);
    if (schema.type)     casts[_]    = castfn(schema.type, castfns);
    return this;
  }

  function model(obj){

    var changes = []
      , self = {}
      , dispatcher = dispatch('set','reset')

    // a bit expensive, not recommended
    self.get = function(attr){
      return this.value()[attr];
    }

    self.set = function(attr,val){
      if (arguments.length == 1 && 'object' == typeof attr){
        for (var k in attr) this.set(k,attr[k]);
        return this;
      }
      if (attrs[attr]) {
        changes.push([attr,val]);
        dispatcher.set(attr, val);
      }
      return this;
    }

    self.value = function(){
      var raw = changeObj( applyObj(obj, defaults), changes);
      return applyUpdateObj( raw, casts );
    }

    self.changes = function(){
      var raw = changeObj( {}, changes );
      return applyUpdateObj( raw, casts );
    }

    self.reset = function(_){
      changes = [];
      obj = Object(_);
      dispatcher.reset();
      return this;
    }

    obj = obj || {};
    rebind(self, dispatcher, 'on');

    return self.reset(obj);
  }

  return model;
}


function defaultfn(defval){
  return function(val){
    if (undefined === val) return defval;
    return val;
  }
}

function castfn(type, fns){
  fns = fns || {};
  type = type || function(v){ return v; };
  return function(val){
    if (undefined === val) return val;
    if ('function' === typeof type) return type(val);
    if (!has.call(fns,type)) throw new TypeError("Unable to cast to unknown type: " + type);
    return fns[type](val);
  }
}

// add + update values
function changeObj(obj, chgs){
  var ret = extend({},obj);
  for (var i=0; i<chgs.length; ++i){
    ret[ chgs[i][0] ] = chgs[i][1];
  }
  return ret;
}

// add + update values
function applyObj(obj, attrfn){
  var ret = extend({},obj);
  for (var k in attrfn){
    ret[k] = attrfn[k](obj[k]);
  }
  return ret;
}

// update values
function applyUpdateObj(obj, attrfn){
  var ret = extend({},obj);
  for (var k in obj){
    if (has.call(attrfn,k)) ret[k] = attrfn[k](obj[k]);
  }
  return ret;
}

