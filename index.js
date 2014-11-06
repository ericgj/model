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
    , castfns = extend({}, CASTFNS)  // probably don't need to extend since not mutating any more
    , calcs = {}

  var modelDispatcher = dispatch('setting', 'set', 'resetting', 'reset');

  model.cast = function(_,fn){
    if (arguments.length == 1 && 'object' == typeof _){
      for (var k in _) this.cast(k,_[k]);
      return this;
    }
    casts[_] = castfn(fn); 
    return this;
  }

  model.calc = function(_,fn){
    if (arguments.length == 1 && 'object' == typeof _){
      for (var k in _) this.calc(k,_[k]);
      return this;
    }
    calcs[_] = fn; 
    return this;
  }
  
  model.attr = function(_,schema){
    if (arguments.length == 1 && 'object' == typeof _){
      for (var k in _) this.attr(k,_[k]);
      return this;
    }
    schema = schema || {}
    attrs[_] = !schema.readOnly;
    if (has.call(schema,'default'))  
      defaults[_] = defaultfn(schema.default);
    if (has.call(schema,'type'))
      casts[_]    = casts[_] || castfn(schema.type, castfns);  // default cast by type
    return this;
  }

  function model(obj){

    var changes = []
      , self = {}
      , dispatcher = dispatch('setting', 'set', 'resetting', 'reset')

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
        modelDispatcher.setting(this, attr, val);
        dispatcher.setting(attr, val);
        
        changes.push([attr,val]);

        modelDispatcher.set(this, attr, val);
        dispatcher.set(attr, val);
      }
      return this;
    }

    self.value = function(){
      var raw = changeObj( applyObj(obj, defaults), changes);
      return applyObjCalc( applyUpdateObj( raw, casts ), calcs );
    }

    self.changedValue = function(){
      return filterObj( self.value(),
                        function(attr){ return !!attrs[attr]; } 
                      );
    }

    self.changes = function(){
      return changes;
    }

    self.dirty = function(){
      return changes.length > 0;
    }

    self.change = function(){
      var raw = changeObj( {}, changes );
      return applyUpdateObj( raw, casts );
    }

    self.reset = function(_){
      modelDispatcher.resetting(this,_);
      dispatcher.resetting(_);
      
      changes = [];
      if (arguments.length > 0) obj = Object(_);
      
      modelDispatcher.reset(this,_);
      dispatcher.reset(_);
      
      return this;
    }

    obj = obj || {};

    rebind(self, dispatcher, 'on');
    return self.reset(obj);
  }

  rebind(model, modelDispatcher, 'on');
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
  for (var k in attrfn){
    if (has.call(obj,k)) ret[k] = attrfn[k](obj[k]);
  }
  return ret;
}

// add + update values according to functions of entire object (calcs)
function applyObjCalc(obj, attrfn){
  var ret = extend({},obj);
  for (var k in attrfn){
    ret[k] = attrfn[k](obj);
  }
  return ret;
}

// remove keys
function filterObj(obj, fn){
  var ret = {};
  for (var k in obj){
    if (has.call(obj,k) && !!fn(k)) ret[k] = obj[k];
  }
  return ret;
}

