
# model

  Simple, framework-agnostic, persistent models for the browser.

  * Declarative attributes based on [JSON Schema][jsonschema]
  * Defaults
  * Customizable type casting
  * Observable `set` and `reset`
  * No sync layer

## Installation

  Install with [component(1)](http://component.io):

    $ component install ericgj/model

<a name="api"></a>
## API

<a name="api_model">#</a> var model = <b>require('model')</b>()

Model constructor.

<a name="api_model_attr">#</a><br/> 
model.<b>attr</b>(<i>name</i> [, <i>schema</i>])<br/>
model.<b>attr</b>(<i>object</i>)

Define attribute `name` with given `schema` object. The schema can specify 
a default value (`default`), a data type (`type`), and whether or not the
attribute is read-only (`readOnly`).

The single-argument form allows you to specify multiple attributes by passing
an object whose keys are attribute names and whose values are schemas.

<a name="api_model_cast">#</a><br/>
model.<b>cast</b>(<i>name</i>, <i>function</i>)<br/>
model.<b>cast</b>(<i>object</i>)

Define a custom conversion function for the specified attribute `name`. When
`type` is specified for an attribute, the attribute is cast using build-in cast
functions. Specifying `cast` overrides this default casting.  

Typically, `cast` is used in converting string values (from CSV data or view
input elements, for instance), into a useful representation.

For instance:

```js
  model.attr('tags',  { type: 'string' })
       .attr('count', { type: 'number' })
       .cast('tags',  function(s){ return String(s).split(','); }) 
       .cast('count', function(s){ return +s; }) 
```

The single-argument form allows you to specify multiple casts by passing
an object whose keys are attribute names and whose values are cast functions.

<a name="api_model_calc">#</a><br/> 
model.<b>calc</b>(<i>name</i>, <i>function</i>)<br/>
model.<b>calc</b>(<i>object</i>)

Define a calculated attribute `name` using the specified `function`. Note the
function is called on the _casted_ current value, not the raw value.

The single-argument form allows you to specify multiple calculations by passing
an object whose keys are attribute names and whose values are calc functions.


<a name="api_instance">#</a> var instance = <b>model</b>([<i>object</i>])

Construct an instance of the model by calling the model as a function. If 
`object` is passed, it extends the default.

<a name="api_instance_value">#</a> instance.<b>value</b>()

Get the current value (plain object) of the instance. Attributes are casted
if their type or an explicit cast has been specified. Attributes on the
original object that are not specified in the model are passed through
unchanged. Calculated attributes are also included.

<a name="api_instance_changedValue">#</a> instance.<b>changedValue</b>()

Get the _changed_ value (plain object) of the instance. All specified,
non-read-only attributes with a current value are included. Read-only and
unspecified attributes are _not_ included, nor are calculated attributes.

<a name="api_instance_change">#</a> instance.<b>change</b>()

Get an object representing the applied changes made to attributes. Useful for
`PATCH`-style updates.

<a name="api_instance_changes">#</a> instance.<b>changes</b>()

Get an array of all changes as `[attribute, value]` pairs.

<a name="api_instance_dirty">#</a> instance.<b>dirty</b>()

Sugar for `instance.changes().length > 0` .

<a name="api_instance_get">#</a> instance.<b>get</b>(<i>attribute</i>)

Get the current (casted) value of the attribute.

<a name="api_instance_set">#</a><br/>
instance.<b>set</b>(<i>attribute</i>, <i>value</i>) <br/>
instance.<b>set</b>(<i>object</i>)

Set an attribute (or attributes if an object is passed). If the attribute is 
`readOnly`, or attribute is not specified in the model, `set` has no effect.

Dispatches a 'set' event with the attribute and value as parameters. See
below, [Events](#events).

<a name="api_instance_reset">#</a> instance.<b>reset</b>([<i>object</i>])

Resets internal state of the instance without losing event observers. In
other words, it's equivalent to creating a new model instance, except that 
any event observers on the instance are maintained. If no <i>object</i> is 
passed, then it simply clears the changes but does not change the underlying
base object passed in the constructor. Dispatches a 'reset' event. 


<a name="events"></a>
## Events

Events can be observed either at the _model_ or _instance_ level. The callback
signature is the same, except the model events have the instance as the first
parameter. If you have used [component/model][compmodel] or [modella][modella], 
this should seem familiar. 

<a name="api_events_set">#</a><br/>
model.on(<b>'set'</b>, <i>handler</i>) <br/>
instance.on(<b>'set'</b>, <i>handler</i>)

Fired on `instance.set`, calling the handler with the passed attribute and
value. Note `set(object)` calls result in multiple `set` events, one per
attribute-value pair.

<a name="api_events_reset">#</a><br/>
model.on(<b>'reset'</b>, <i>handler</i>) <br/>
instance.on(<b>'reset'</b>, <i>handler</i>)

Fired on `instance.reset`, calling the handler with the passed object.
Note this is the "raw" passed object, not the `model.value()`.

<a name="api_events_setting">#</a><br/>
model.on(<b>'setting'</b>, <i>handler</i>) <br/>
instance.on(<b>'setting'</b>, <i>handler</i>)

Same as `set`, but fired _before_ state changes.

<a name="api_events_resetting">#</a><br/>
model.on(<b>'resetting'</b>, <i>handler</i>) <br/>
instance.on(<b>'resetting'</b>, <i>handler</i>)

Same as `reset`, but fired _before_ state changes.

Note that `setting` and `resetting` events can be used to check existing
state in an event handler:

```js
  model.on('setting', function(instance,attr,val){
    var oldval = instance.get(attr);
    // do something comparing oldval with val 
  })

  instance.on('resetting', function(obj){
    var oldobj = instance.value()
    // do something comparing oldobj with obj
  })

```

## TODO

  * metadata
  * validation
  * model construction directly via JSON Schema


## License

  The MIT License (MIT)

  Copyright (c) 2014 Eric Gjertsen `<ericgj72@gmail.com>`

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.


[jsonschema]: http://json-schema.org
[compmodel]:  https://github.com/component/model
[modella]:    https://github.com/modella/modella


