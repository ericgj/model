
var model = require('model')
  , assert = require('assert')
  , has = hasOwnProperty

describe('model default', function(){

  var subject = 
    model().attr('A', { default: 'default' } )
           .attr('B', { default: [] } )
           .attr('C')

  it('sets defaults on empty object', function(){
    var actual = subject().value();
    console.log('defaults on empty object: %o', actual);
    assert.equal( actual.A, 'default' );
    assert.deepEqual( actual.B, [] );
  })

  it('does not set default on empty object for attribute with no default defined', function(){
    var actual = subject().value();
    assert(!has.call(actual,'C'));
  })

  it('sets defaults on non-empty object for attributes not set', function(){
    var actual = subject({ A: "nondefault" }).value();
    console.log('defaults on non-empty object: %o', actual);
    assert.equal( actual.A, "nondefault" );
    assert.deepEqual( actual.B, []);
  })

  it('passes through non-empty object attributes that have not been defined', function(){
    var actual = subject({ B: [1,2], D: "something new"}).value();
    console.log('undefined attributes on non-empty object: %o', actual);
    assert.equal( actual.A, "default" );
    assert.deepEqual( actual.B, [1,2]);
    assert.equal( actual.D, "something new" );
  })

})
