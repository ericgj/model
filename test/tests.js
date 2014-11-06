
var model = require('model')
  , assert = require('assert')
  , has = hasOwnProperty

describe('defaults', function(){

  var subject = 
    model().attr('A', { default: 'default' } )
           .attr('B', { default: [] } )
           .attr('C')
           .attr('D', { default: null })

  it('sets defaults on empty object', function(){
    var actual = subject().value();
    console.log('model: defaults: empty object: %o', actual);
    assert.equal( actual.A, 'default' );
    assert.deepEqual( actual.B, [] );
  })

  it('does not set default on empty object for attribute with no default defined', function(){
    var actual = subject().value();
    assert(!has.call(actual,'C'));
  })

  it('sets defaults on non-empty object for attributes not set', function(){
    var actual = subject({ A: "nondefault" }).value();
    console.log('model: defaults: non-empty object: %o', actual);
    assert.equal( actual.A, "nondefault" );
    assert.deepEqual( actual.B, []);
  })

  it('passes through attributes that have not been defined', function(){
    var actual = subject({ B: [1,2], X: "something new"}).value();
    console.log('model: defaults: undefined attributes: %o', actual);
    assert.equal( actual.A, "default" );
    assert.deepEqual( actual.B, [1,2]);
    assert.equal( actual.X, "something new" );
  })

  it('set null defaults', function(){
    var actual = subject().value();
    console.log('model: defaults: null default: %o', actual);
    assert( actual.D === null );
  })

})

describe('default casts', function(){

  var subject =
    model().attr('string',  { type: 'string' })
           .attr('boolean', { type: 'boolean' })
           .attr('number',  { type: 'number' })
           .attr('integer', { type: 'integer' })
           .attr('null',    { type: 'null' })
           .attr('array',   { type: 'array' })
           .attr('object',  { type: 'object' })
           .attr('notype')

  it('casts not applied to empty object', function(){
    var actual = subject().value();
    console.log('model: casts: empty object: %o', actual);
    assert.deepEqual( actual, {});
  })
  
  it('passes through attributes that have not been defined', function(){
    var actual = subject({ 'boolean': 'yes', 'foo': '42' }).value();
    console.log('model: casts: undefined attributes: %o', actual);
    assert.equal( actual.foo, '42' );
  })

  it('default casts applied to string values', function(){
    var actual = subject({
      'string': '1', 
      'boolean': '2', 
      'number': '3',
      'integer': '4',
      'null': '5',
      'array': '6',
      'object': '7',
      'notype': '9'
    }).value()

    console.log('model: casts: applied to string values: %o', actual);
    assert.equal( typeof actual['string'], 'string' );
    assert.equal( typeof actual['boolean'], 'boolean' );
    assert.equal( typeof actual['number'], 'number' );
    assert.equal( typeof actual['integer'], 'number' );
    assert.equal( actual['null'], null );
    assert( actual['array'] instanceof Array );
    assert.equal( typeof actual['object'], 'object' );
    assert.equal( actual['notype'], '9' );
  })

})

describe('explicit casts', function(){

  var subject =
    model().cast('uppercase', function(raw){ return String(raw).toUpperCase(); })
           .cast('simpleint', function(raw){ return +raw; })
           .attr('uppercase',  { type: 'string' })
           .attr('simpleint')
 
  it('should apply the explicit cast when no default', function(){
    var actual = subject({'simpleint': '-123'}).value();
    console.log('model: explicit casts: when no default: %o', actual);
    assert.equal( actual['simpleint'], -123 );
  })

  it('should apply the explicit cast instead of the default', function(){ 
    var actual = subject({'uppercase': 'heeelllo'}).value();
    console.log('model: explicit casts: when default: %o', actual);
    assert.equal( actual['uppercase'], 'HEEELLLO' );
  })

  it('should allow casts to be specified as an object', function(){
    var subject = model().attr('uppercase', { type: 'string' })
                         .attr('simpleint')
                         .cast({ 
                           'uppercase': function(raw){ return String(raw).toUpperCase(); },
                           'simpleint': function(raw){ return +raw; } 
                         })
    var actual = subject({'simpleint': '-123', 'uppercase': 'heeelllo'}).value();
    console.log('model: explicit casts: specified as object: %o', actual);
    assert.equal( actual['simpleint'], -123 );
    assert.equal( actual['uppercase'], 'HEEELLLO' );
  })

})

describe('changes', function(){
  
  var subject = model().attr('a', { default: 'A' })
                       .attr('b', { default: 'B' })
                       .attr('c', { type: 'number'})
                       .attr('d', { default: true, type: 'boolean' })
                       .attr('e')

  it('value includes all changes applied to default object', function(){
    var actual = subject()
                   .set('e', 1)
                   .set('d', 1)
                   .set('c', '1')
                   .set('b', 'BB')
                   .set('d', '')
                   .set('a', 'AA').value();
    
    console.log('model: changes: value, default object: %o', actual);
    assert.equal( actual.a, 'AA'  );
    assert.equal( actual.b, 'BB'  );
    assert.equal( actual.c, 1     );
    assert.equal( actual.d, false );
    assert.equal( actual.e, 1     );
  })

  it('value includes all changes applied to passed object', function(){
    var actual = subject( { 'a': 'AA', 'b': 'BB' } )
                   .set('b', 'BBB')
                   .set('b', 'BBBB').value();

    console.log('model: changes: value, passed object: %o', actual);
    assert.equal( actual.a, 'AA' );
    assert.equal( actual.b, 'BBBB');
  })

  it('should allow attrs to be specified as an object', function(){
    var subject =  model().attr( {
                     'a': { default: 'A' },
                     'b': { default: 'B' },
                     'c': { type: 'number'},
                     'd': { default: true, type: 'boolean' },
                     'e': {}
                   })
    var actual = subject( { 'a': 'AA', 'b': 'BB' } )
                   .set('b', 'BBB')
                   .set('b', 'BBBB').value();

    console.log('model: changes: value, attrs specified as object: %o', actual);
    assert.equal( actual.a, 'AA' );
    assert.equal( actual.b, 'BBBB');
  })

  it('change includes all and only changed attributes', function(){
    var actual = subject( { 'a': 'AA', 'b': 'BB' } )
                   .set('b', 'BBB')
                   .set('b', 'BBBB').change();
    
    console.log('model: changes: change: %o', actual);
    assert.deepEqual( actual, {b: 'BBBB'} );
  })

  it('changes lists all changes in order', function(){
    var actual = subject()
                   .set('e', 1)
                   .set('d', 1)
                   .set('c', '1')
                   .set('b', 'BB')
                   .set('d', '')
                   .set('a', 'AA').changes();
    console.log('model: changes: changes: %o', actual);
    assert.equal( actual.length, 6 );
    assert.deepEqual( actual[0], ['e',1] );
    assert.deepEqual( actual[1], ['d',1] );
    assert.deepEqual( actual[2], ['c','1'] );
    assert.deepEqual( actual[3], ['b','BB'] );
    assert.deepEqual( actual[4], ['d',''] );
    assert.deepEqual( actual[5], ['a','AA'] );
  })

  it('dirty is true after change', function(){
    var actual = subject()
                   .set('e', 1).dirty();
    console.log('model: changes: dirty after change: %o', actual);
    assert.equal( actual, true );
  })

  it('dirty is false when no changes', function(){
    var actual = subject( { 'a': 'AA', 'b': 'BB' } ).dirty()
    console.log('model: changes: dirty before change: %o', actual);
    assert.equal( actual, false );
  })

  it('instance change events are dispatched for each change', function(){
    var m = subject()
      , actual = []
    m.on('set', function(k,v){ actual.push([k,v]); });
    m.set('a', 'AA').set('b', 'BB').set('c', 11);
    assert.equal(actual.length, 3);
    assert.deepEqual(actual[0], ['a','AA']);
    assert.deepEqual(actual[1], ['b','BB']);
    assert.deepEqual(actual[2], ['c', 11 ]);
  })

  it('instance change events are dispatched for each change when set as an object', function(){
    var m = subject()
      , actual = []
    m.on('set', function(k,v){ actual.push([k,v]); });
    m.on('setting', function(k,v){ actual.push([k,v]); });
    m.set( { 'a': 'AA', 'b': 'BB', c: 11 } );
    assert.equal(actual.length, 6);
  })
  

  it('model change events are dispatched for each change', function(){
    var m = subject()
      , actual = []
    subject.on('set', function(it,k,v){ actual.push([it,k,v]); });
    m.set('a', 'AA').set('b', 'BB').set('c', 11);
    assert.equal(actual.length, 3);
    assert.deepEqual(actual[0], [m, 'a','AA']);
    assert.deepEqual(actual[1], [m, 'b','BB']);
    assert.deepEqual(actual[2], [m, 'c', 11 ]);
  })

  it('model change events are dispatched for each change when set as an object', function(){
    var m = subject()
      , actual = []
    subject.on('set', function(it,k,v){ actual.push([it,k,v]); });
    subject.on('setting', function(it,k,v){ actual.push([it,k,v]); });
    m.set( { 'a': 'AA', 'b': 'BB', c: 11 } );
    assert.equal(actual.length, 6);
  })
  

})

describe('readOnly', function(){

  var subject = model().attr('regular').attr('readOnly', { default: 'default', readOnly: true } )

  it('changes to readOnly attributes are not applied', function(){
    var actual = subject().set('regular',1).set('readOnly',2).value();  
    console.log('model: readOnly: changes to readOnly attributes: %o', actual);
    assert.equal(actual.readOnly, 'default');
    assert.equal(actual.regular, 1);
  })

  it('changes to undefined attributes are not applied', function(){
    var actual = subject({foo: 'foo'}).set('regular',1).set('foo',2).value();
    console.log('model: readOnly: changes to undefined attributes: %o', actual);
    assert.equal(actual.foo, 'foo');
    assert.equal(actual.regular, 1);
  })
})


describe('changedValue', function(){

  var subject = model().attr('id',         { readOnly: true, type: 'number' })
                       .attr('name',       { type: 'string' })
                       .attr('issleeping', { default: true, type: 'boolean' })
                       .cast('issleeping', function(s){ return +s == 1; })
                       .calc('iswaking',   function(v){ return !v.issleeping; })
  
  it('does not have readOnly attributes', function(){
    var actual = subject({id: 3421}).set('name','Eric').set('issleeping','1').changedValue();
    console.log('model: changedValue: readOnly attributes: %o', actual);
    assert(!has.call(actual, 'id')); 
  })

  it('does not have undefined attributes', function(){
    var actual = subject({id: 3421}).set('name','Eric').set('mood','grouchy').changedValue();
    console.log('model: changedValue: undefined attributes: %o', actual);
    assert(!has.call(actual, 'mood')); 
  })

  it('does not have calculated attributes', function(){
    var actual = subject({id: 3421}).set('name','Eric').set('issleeping','1').changedValue();
    console.log('model: changedValue: calculated attributes: %o', actual);
    assert(!has.call(actual,'iswaking'));
  })

})


describe('calculations', function(){
 
  var subject = model().attr('attn',     {type: 'string'})
                       .attr('street',   {type: 'string'})
                       .attr('city',     {type: 'string'})
                       .attr('state',    {type: 'string'})
                       .attr('postcode', {type: 'number'})
                       .calc('address', function(v){
                         return [
                           v.attn ? "Attn: " + v.attn : null,
                           v.street,
                           v.city + ", " + v.state + " " + v.postcode
                         ].filter( function(line){ return !!line; })
                          .join('\n')
                       });

  it('includes calculations in value', function(){
    var actual = subject().set({ street: "2888 Miller Ln",
                                 city:   "Bird In Hand", state: "PA", postcode: 17505
                              }).value()
    console.log('model: calculations: value: %o', actual);
    assert.equal( actual.address,
                  ["2888 Miller Ln", "Bird In Hand, PA 17505"].join("\n")
                );
  })

  it('does not include calculations in change', function(){
    var actual = subject({attn: "Hank"})
                   .set({ street: "2888 Miller Ln",
                          city:   "Bird In Hand", state: "PA", postcode: 17505
                       }).change()
    console.log('model: calculations: change: %o', actual);
    assert( !has.call(actual, 'address') );
  })

  it('does not include calculations in changedValue', function(){
    var actual = subject({attn: "Hank"})
                   .set({ street: "2888 Miller Ln",
                          city:   "Bird In Hand", state: "PA", postcode: 17505
                       }).changedValue()
    console.log('model: calculations: changedValue: %o', actual);
    assert( !has.call(actual, 'address') );
  })

  it('should allow calcs to be specified as an object', function(){
    var calcs = {
      'address': function(v){
         return [
           v.attn ? "Attn: " + v.attn : null,
           v.street,
           v.city + ", " + v.state + " " + v.postcode
         ].filter( function(line){ return !!line; })
          .join('\n');
       }
    };
    var subject = model().attr('attn',     {type: 'string'})
                         .attr('street',   {type: 'string'})
                         .attr('city',     {type: 'string'})
                         .attr('state',    {type: 'string'})
                         .attr('postcode', {type: 'number'})
                         .calc( calcs );
    var actual = subject().set({ street: "2888 Miller Ln",
                                 city:   "Bird In Hand", state: "PA", postcode: 17505
                              }).value()
    console.log('model: calculations: calcs specified as object: %o', actual);
    assert.equal( actual.address,
                  ["2888 Miller Ln", "Bird In Hand, PA 17505"].join("\n")
                );
  })

});

describe('reset', function(){

  var subject;
  beforeEach( function(){
    subject = model().attr('foo', { default: 11})
                     .attr('bar');
  });

  it('should reset to inital value if no parameter passed to reset', function(){
    var entity = subject({'foo': 1, 'bar': 2, 'baz': 3});
    var expected = entity.value();
    entity.set('bar', 3);
    entity.reset();
    var actual = entity.value();
    console.log('model: reset: to initial value: %o %o', expected, actual);
    assert.deepEqual(actual, expected);
  });

  it('should reset to new value if parameter passed to reset', function(){
    var entity = subject({'foo': 1, 'bar': 2, 'baz': 3});
    entity.set('bar', 3);
    entity.reset({foo: 111});
    var expected = subject({foo: 111}).value();
    var actual = entity.value();
    console.log('model: reset: to new value: %o %o', expected, actual);
    assert.deepEqual(actual, expected);
  });

});

