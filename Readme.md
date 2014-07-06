
# model

  Simple, framework-agnostic, immutable models for the browser.

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

<a name="api_model_attr">#</a> model.<b>attr</b>(<i>name</i> [, <i>schema</i>])

Define attribute `name` with given `schema` object. The schema can specify 
a default value (`default`), a data type (`type`), and whether or not the
attribute is read-only (`readOnly`).

<a name="api_model_cast">#</a> model.<b>cast</b>(<i>type</i>, <i>function</i>)

Define a custom conversion function for the specified `type`. Built-in casts
are provided for the seven core JSON Schema types, but these can be overriden
and extended. The main use-case is converting (often string) values from view
input elements into a canonical representation.

For instance:

```js
  model.attr('tags', { type: 'comma-delim' })
       .cast('comma-delim', function(s){ return String(s).split(','); })
```

<a name="api_instance">#</a> var instance = <b>model</b>([<i>object</i>])

Construct an instance of the model by calling the model as a function. If 
`object` is passed, it extends the default.

<a name="api_instance_value">#</a> instance.<b>value</b>()

Get the current value (plain object) of the instance. All attributes are
casted if their type has been specified. Attributes on the original object
that are not specified in the model are passed through unchanged.

<a name="api_instance_changes">#</a> instance.<b>changes</b>()

Get an object representing the changes made to attributes. Useful for 
`PATCH`-style updates.

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
any event observers on the instance are maintained. Dispatches a 'reset' 
event. 


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

Note that events are fired _before_ state changes, so you can check existing
state in an event handler:

```js
  model.on('set', function(instance,attr,val){
    var oldval = instance.get(attr);
    // do something comparing oldval with val 
  })

  instance.on('reset', function(obj){
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


