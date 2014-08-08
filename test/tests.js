
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

})

describe('changes', function(){
  
  var subject = model().attr('a', { default: 'A' })
                       .attr('b', { default: 'B' })
                       .attr('c', { type: 'number'})
                       .attr('d', { default: true, type: 'boolean' })
                       .attr('e')

  it('changes to default object are applied', function(){
    var actual = subject()
                   .set('e', 1)
                   .set('d', 1)
                   .set('c', '1')
                   .set('b', 'BB')
                   .set('d', '')
                   .set('a', 'AA').value();
    
    console.log('model: changes: applied to default object: %o', actual);
    assert.equal( actual.a, 'AA'  );
    assert.equal( actual.b, 'BB'  );
    assert.equal( actual.c, 1     );
    assert.equal( actual.d, false );
    assert.equal( actual.e, 1     );
  })

  it('changes to passed object are applied', function(){
    var actual = subject( { 'a': 'AA', 'b': 'BB' } )
                   .set('b', 'BBB')
                   .set('b', 'BBBB').value();

    console.log('model: changes: applied to passed object: %o', actual);
    assert.equal( actual.a, 'AA' );
    assert.equal( actual.b, 'BBBB');
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
})
