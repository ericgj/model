
var model = require('model')
  , assert = require('assert')
  , has = hasOwnProperty

describe('defaults', function(){

  var subject = 
    model().attr('A', { default: 'default' } )
           .attr('B', { default: [] } )
           .attr('C')

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
    var actual = subject({ B: [1,2], D: "something new"}).value();
    console.log('model: defaults: undefined attributes: %o', actual);
    assert.equal( actual.A, "default" );
    assert.deepEqual( actual.B, [1,2]);
    assert.equal( actual.D, "something new" );
  })

})

describe('casts', function(){

  var subject =
    model().attr('string',  { type: 'string' })
           .attr('boolean', { type: 'boolean' })
           .attr('number',  { type: 'number' })
           .attr('integer', { type: 'integer' })
           .attr('null',    { type: 'null' })
           .attr('array',   { type: 'array' })
           .attr('object',  { type: 'object' })
           .attr('custom',  { type: 'upcase' })
           .attr('notype')
           .cast('upcase', function(v){ return String(v).toUpperCase(); })

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

  it('casts applied to string values', function(){
    var actual = subject({
      'string': '1', 
      'boolean': '2', 
      'number': '3',
      'integer': '4',
      'null': '5',
      'array': '6',
      'object': '7',
      'custom': '8',
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
    assert.equal( actual['custom'], '8' );
    assert.equal( actual['notype'], '9' );
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

})

