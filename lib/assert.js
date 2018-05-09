/*
	Doormen

	Copyright (c) 2015 - 2018 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var AssertionError = require( './AssertionError.js' ) ;
var isEqual = require( './isEqual.js' ) ;
var typeChecker = require( './typeChecker.js' ) ;

var inspect = require( 'string-kit/lib/inspect.js' ).inspect ;



var inspectOptions = {
	style: 'inline' ,
	depth: 2 ,
	maxLength: 40 ,
	outputMaxLength: 80 ,
	noDescriptor: true ,
	noType: true ,
	noArrayProperty: true
} ;

var inspectVar = inspect.bind( null , inspectOptions ) ;



var vowel = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	A: true ,
	E: true ,
	I: true ,
	O: true ,
	U: true ,
	Y: true
} ;



var assert = {} ;
module.exports = assert ;



/*
	TODO:

	Expect.js:
	- length
	- property
	- key/keys
	- only keys
	- to throw / not to throw
	- withArgs (function)
	- fail useful???

	Chai:
	- any
	- all
	- own
	- ownPropertyDescriptor
	- lengthOf
	- keys
	- throw
	- members
	- oneOf
	- functions specific:
		- respondTo (check method on object or function.prototype)
		- change
		- increase
		- decrease
	- object specific:
		- extensible
		- sealed
		- frozen
	- fail useful???

	Doormen specific:
	- to validate
*/



// Defined
assert['to be defined'] =
assert.defined =
assert.isDefined = function isDefined( from , actual ) {
	if ( actual === undefined ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be defined' , from , actual ) ;
	}
} ;



// Undefined
assert['to be not defined'] = assert['to not be defined'] =
assert['not to be defined'] = assert['to be undefined'] =
assert.undefined =
assert.isUndefined = function isUndefined( from , actual ) {
	if ( actual !== undefined ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be undefined' , from , actual , undefined ) ;
	}
} ;



// Truthy
assert['to be ok'] =
assert['to be truthy'] =
assert.ok =
assert.isOk =
assert.truthy =
assert.isTruthy = function isTruthy( from , actual ) {
	if ( ! actual ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be truthy' , from , actual ) ;
	}
} ;



// Falsy
assert['to be not ok'] = assert['to not be ok'] = assert['not to be ok'] =
assert['to be falsy'] = assert['not to be truthy'] = assert['to not be truthy'] =
assert.nok =
assert.ko =
assert.isNotOk =
assert.falsy =
assert.isFalsy = function isFalsy( from , actual ) {
	if ( actual ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be falsy' , from , actual ) ;
	}
} ;



// True
assert['to be true'] =
assert.true =
assert.isTrue = function isTrue( from , actual ) {
	if ( actual !== true ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be true' , from , actual , true ) ;
	}
} ;



// Not true
assert['to be not true'] = assert['to not be true'] = assert['not to be true'] =
assert.notTrue =
assert.isNotTrue = function isNotTrue( from , actual ) {
	if ( actual === true ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be true' , from , actual ) ;
	}
} ;



// False
assert['to be false'] =
assert.false =
assert.isFalse = function isFalse( from , actual ) {
	if ( actual !== false ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be false' , from , actual , false ) ;
	}
} ;



// Not false
assert['to be not false'] = assert['to not be false'] = assert['not to be false'] =
assert.notFalse =
assert.isNotFalse = function isNotFalse( from , actual ) {
	if ( actual === false ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be false' , from , actual , false ) ;
	}
} ;



// Null
assert['to be null'] =
assert.null =
assert.isNull = function isNull( from , actual ) {
	if ( actual !== null ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be null' , from , actual , null ) ;
	}
} ;



// Not null
assert['to be not null'] = assert['to not be null'] = assert['not to be null'] =
assert.notNull =
assert.isNotNull = function isNotNull( from , actual ) {
	if ( actual === null ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be null' , from , actual , null ) ;
	}
} ;



// NaN
assert['to be NaN'] =
assert['to be nan'] =
assert.NaN =
assert.isNaN = function isNaN( from , actual ) {
	if ( ! Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be NaN' , from , actual , null ) ;
	}
} ;



// Not NaN
assert['to be not NaN'] = assert['to not be NaN'] = assert['not to be NaN'] =
assert['to be not nan'] = assert['to not be nan'] = assert['not to be nan'] =
assert.notNaN =
assert.isNotNaN = function isNaN( from , actual ) {
	if ( Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be NaN' , from , actual , null ) ;
	}
} ;



assert['to be finite'] =
assert.finite = function finite( from , actual ) {
	if ( typeof actual !== 'number' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number' , from , actual ) ;
	}

	if ( Number.isNaN( actual ) || actual === Infinity || actual === -Infinity ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be finite' , from , actual ) ;
	}
} ;



assert['to be not finite'] = assert['to not be finite'] = assert['not to be finite'] =
assert.notFinite = function notFinite( from , actual ) {
	if ( typeof actual !== 'number' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number' , from , actual ) ;
	}

	if ( ! Number.isNaN( actual ) && actual !== Infinity && actual !== -Infinity ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be finite' , from , actual ) ;
	}
} ;



// identical
assert['to be'] =
assert.strictEqual = function strictEqual( from , actual , expected ) {
	if ( actual !== expected && ! ( Number.isNaN( actual ) && Number.isNaN( expected ) ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be ' + inspectVar( expected ) , from , actual , expected , true ) ;
	}
} ;



// Not identical
assert['to be not'] = assert['to not be'] = assert['not to be'] =
assert.notStrictEqual = function notStrictEqual( from , actual , expected ) {
	if ( actual === expected || ( Number.isNaN( actual ) && Number.isNaN( expected ) ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be ' + inspectVar( expected ) , from , actual , expected ) ;
	}
} ;



// Equal (but not identical)
assert['to be equal to'] =
assert['to equal'] =
assert['to eql'] =		// compatibility with expect.js
assert.equal = function equal( from , actual , expected ) {
	if ( ! isEqual( actual , expected ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to equal ' + inspectVar( expected ) , from , actual , expected , true ) ;
	}
} ;



// Not equal
assert['to be not equal to'] = assert['to not be equal to'] = assert['not to be equal to'] =
assert['to not equal'] = assert['not to equal'] =
assert['to not eql'] = assert['not to eql'] =		// compatibility with expect.js
assert.notEqual = function notEqual( from , actual , expected ) {
	if ( isEqual( actual , expected ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to equal ' + inspectVar( expected ) , from , actual , expected ) ;
	}
} ;



// Like
assert['to be like'] =
assert['to be alike'] =
assert['to be alike to'] =
assert.like = function like( from , actual , expected ) {
	if ( ! isEqual( actual , expected , true ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be like ' + inspectVar( expected ) , from , actual , expected , true ) ;
	}
} ;



// Not like
assert['to be not like'] = assert['to not be like'] = assert['not to be like'] =
assert['to be not alike'] = assert['to not be alike'] = assert['not to be alike'] =
assert['to be not alike to'] = assert['to not be alike to'] = assert['not to be alike to'] =
assert.notLike = function notLike( from , actual , expected ) {
	if ( isEqual( actual , expected , true ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be like ' + inspectVar( expected ) , from , actual , expected ) ;
	}
} ;



// Equal to a partial object
assert['to be partially equal to'] =
assert['to be partial equal to'] =
assert['to be equal to partial'] =
assert['to partially equal'] =
assert['to partial equal'] =
assert['to equal partial'] =
assert.partialEqual =
assert.partiallyEqual = function partiallyEqual( from , actual , expected ) {
	if ( ! isEqual( expected , actual , false , true ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to partially equal ' + inspectVar( expected ) , from , actual , expected , true ) ;
	}
} ;



// Not equal to a partial object
assert['to be not partially equal to'] = assert['to not be partially equal to'] = assert['not to be partially equal to'] =
assert['to be not partial equal to'] = assert['to not be partial equal to'] = assert['not to be partial equal to'] =
assert['to be not equal to partial'] = assert['to not be equal to partial'] = assert['not to be equal to partial'] =
assert['to not partially equal'] = assert['not to partially equal'] =
assert['to not partial equal'] = assert['not to partial equal'] =
assert['to not equal partial'] = assert['not to equal partial'] =
assert.notPartialEqual =
assert.notPartiallyEqual = function notPartiallyEqual( from , actual , expected ) {
	if ( isEqual( expected , actual , false , true ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to partially equal ' + inspectVar( expected ) , from , actual , expected , true ) ;
	}
} ;



// Like partial
assert['to be partially like'] =
assert['to be like partial'] =
assert.partialLike =
assert.partiallyLike = function partiallyLike( from , actual , expected ) {
	if ( ! isEqual( actual , expected , true , true ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be like ' + inspectVar( expected ) , from , actual , expected , true ) ;
	}
} ;



// Not like partial
assert['to be not partially like'] = assert['to not be partially like'] = assert['not to be partially like'] =
assert['to be not like partial'] = assert['to not be like partial'] = assert['not to be like partial'] =
assert.partialLike =
assert.partiallyLike = function partiallyLike( from , actual , expected ) {
	if ( isEqual( actual , expected , true , true ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be like ' + inspectVar( expected ) , from , actual , expected , true ) ;
	}
} ;



// Epsilon aware comparison, or with a custom delta
assert['to be close to'] =
assert['to be around'] =
assert.around = function around( from , actual , value , delta ) {
	if ( typeof actual !== 'number' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number' , from , actual ) ;
	}

	if ( ! delta ) {
		delta = 2 * Number.EPSILON ;

		if ( value ) {
			delta = Math.pow( 2 , Math.ceil( Math.log2( Math.abs( value ) ) ) ) * delta ;
		}
	}

	if ( actual < value - delta || actual > value + delta || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be around ' + value  , from , actual ) ;
	}
} ;



// Epsilon aware comparison, or with a custom delta
assert['to be not close to'] =
assert['to not be close to'] =
assert['not to be close to'] =
assert['to be not around'] =
assert['to not be around'] =
assert['not to be around'] =
assert.notAround = function notAround( from , actual , value , delta ) {
	if ( typeof actual !== 'number' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number' , from , actual ) ;
	}

	if ( ! delta ) {
		delta = 2 * Number.EPSILON ;

		if ( value ) {
			delta = Math.pow( 2 , Math.ceil( Math.log2( Math.abs( value ) ) ) ) * delta ;
		}
	}

	if ( ( actual >= value - delta && actual <= value + delta ) || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be around ' + value  , from , actual ) ;
	}
} ;



// number/date >
assert['to be above'] =
assert['to be greater'] =
assert['to be greater than'] =
assert.above =
assert.gt =
assert.greater =
assert.greaterThan = function greaterThan( from , actual , value ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number or a Date' , from , actual ) ;
	}

	if ( actual <= value || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be above ' + value  , from , actual ) ;
	}
} ;



assert['to be at least'] =
assert['to be greater than or equal to'] =
assert.least =
assert.gte =
assert.greaterThanOrEqualTo = function greaterThanOrEqualTo( from , actual , value ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number or a Date' , from , actual ) ;
	}

	if ( actual < value || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be at least ' + value  , from , actual ) ;
	}
} ;



assert['to be below'] =
assert['to be lesser'] =
assert['to be lesser than'] =
assert.below =
assert.lt =
assert.lesser =
assert.lesserThan = function lesserThan( from , actual , value ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number or a Date' , from , actual ) ;
	}

	if ( actual >= value || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be below ' + value  , from , actual ) ;
	}
} ;



assert['to be at most'] =
assert['to be lesser than or equal to'] =
assert.most =
assert.lte =
assert.lesserThanOrEqualTo = function lesserThanOrEqualTo( from , actual , value ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number or a Date' , from , actual ) ;
	}

	if ( actual > value || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be at most ' + value  , from , actual ) ;
	}
} ;



assert['to be within'] =
assert.within = function within( from , actual , lower , higher ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number or a Date' , from , actual ) ;
	}

	if ( actual < lower || actual > higher || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be within ' + lower + ' and ' + higher  , from , actual ) ;
	}
} ;



assert['to be not within'] =
assert['to not be within'] =
assert['not to be within'] =
assert.notWithin = function notWithin( from , actual , lower , higher ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number or a Date' , from , actual ) ;
	}

	if ( ( actual >= lower && actual <= higher ) || Number.isNaN( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be within ' + lower + ' and ' + higher  , from , actual ) ;
	}
} ;



// String regexp match
assert['to match'] =
assert.match = function match( from , actual , expected ) {
	if ( typeof actual !== 'string' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a string' , from , actual ) ;
	}

	if ( ! actual.match( expected ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to match ' + expected , from , actual , expected ) ;
	}
} ;



// Not string regexp match
assert['to not match'] =
assert['not to match'] =
assert.notMatch = function notMatch( from , actual , expected ) {
	if ( typeof actual !== 'string' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a string' , from , actual ) ;
	}

	if ( actual.match( expected ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to match ' + expected , from , actual , expected ) ;
	}
} ;



assert['to contain'] =
assert['to include'] =
assert.include =
assert.contain = function contain( from , actual , expected ) {
	if ( typeof actual !== 'string' && ( ! typeChecker.looseObject( actual ) || typeof actual.indexOf !== 'function' ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to have an indexOf method' , from , actual ) ;
	}

	if ( actual.indexOf( expected ) === -1 ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to contain ' + inspectVar( expected ) , from , actual , expected ) ;
	}
} ;



assert['to not contain'] =
assert['not to contain'] =
assert['to not include'] =
assert['not to include'] =
assert.notInclude =
assert.notContain = function notContain( from , actual , expected ) {
	if ( typeof actual !== 'string' && ( ! typeChecker.looseObject( actual ) || typeof actual.indexOf !== 'function' ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to have an indexOf method' , from , actual ) ;
	}

	if ( actual.indexOf( expected ) !== -1 ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to contain ' + inspectVar( expected ) , from , actual , expected ) ;
	}
} ;



assert['to be empty'] =
assert.empty = function empty( from , actual ) {
	var isEmpty = true ;

	if ( actual ) {
		if ( actual && typeof actual === 'object' ) {
			if ( Array.isArray( actual ) ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( ( actual instanceof Map ) || ( actual instanceof Set ) ) {
				if ( actual.size ) { isEmpty = false ; }
			}
			else if ( actual.length !== undefined ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( Object.keys( actual ).length ) {
				isEmpty = false ;
			}
		}
		else if ( typeof actual === 'string' ) {
			isEmpty = false ;
		}
	}

	if ( ! isEmpty ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be empty' , from , actual ) ;
	}
} ;



assert['to be not empty'] =
assert['to not be empty'] =
assert['not to be empty'] =
assert.notEmpty = function notEmpty( from , actual ) {
	var isEmpty = true ;

	if ( actual ) {
		if ( actual && typeof actual === 'object' ) {
			if ( Array.isArray( actual ) ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( ( actual instanceof Map ) || ( actual instanceof Set ) ) {
				if ( actual.size ) { isEmpty = false ; }
			}
			else if ( actual.length !== undefined ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( Object.keys( actual ).length ) {
				isEmpty = false ;
			}
		}
		else if ( typeof actual === 'string' ) {
			isEmpty = false ;
		}
	}

	if ( isEmpty ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be empty' , from , actual ) ;
	}
} ;



assert['to have key'] =
assert['to have keys'] =
assert.key =
assert.keys = function keys_( from , actual , ... keys ) {
	if ( ! typeChecker.looseObject( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be an object or function' , from , actual ) ;
	}

	keys.forEach( key => {
		if ( ! ( key in actual ) ) {
			throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to have key(s) ' + keys , from , actual ) ;
		}
	} ) ;
} ;



assert['to have not key'] =
assert['to not have key'] =
assert['not to have key'] =
assert['to have not keys'] =
assert['to not have keys'] =
assert['not to have keys'] =
assert['to have no key'] =
assert.noKey =
assert.notKey =
assert.notKeys = function notKeys( from , actual , ... keys ) {
	if ( ! typeChecker.looseObject( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be an object or function' , from , actual ) ;
	}

	keys.forEach( key => {
		if ( key in actual ) {
			throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to have key(s) ' + keys , from , actual ) ;
		}
	} ) ;
} ;



assert['to have property'] =
assert.property = function property( from , actual , key , value ) {
	if ( arguments.length <= 3 ) {
		return assert.key( from , actual , key ) ;
	}

	if ( ! typeChecker.looseObject( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be an object or function' , from , actual ) ;
	}

	else {
		return assert.equal( from , actual[ key ] , value ) ;
	}
} ;



assert['to have not property'] =
assert['to not have property'] =
assert['not to have property'] =
assert['to have no property'] =
assert.notProperty = function notProperty( from , actual , key , value ) {
	if ( arguments.length <= 3 ) {
		return assert.notKey( from , actual , key ) ;
	}

	if ( ! typeChecker.looseObject( actual ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be an object or function' , from , actual ) ;
	}

	else {
		return assert.notEqual( from , actual[ key ] , value ) ;
	}
} ;



// Type or instance
assert['to be a'] =
assert['to be an'] =
assert.typeOrInstanceOf = function typeOrInstanceOf( from , actual , expected ) {
	if ( typeof expected === 'string' ) {
		return assert.typeOf( from , actual , expected ) ;
	}

	return assert.instanceOf( from , actual , expected ) ;
} ;



// Not type or instance
assert['to be not a'] =
assert['to not be a'] =
assert['not to be a'] =
assert['to be not an'] =
assert['to not be an'] =
assert['not to be an'] =
assert.notTypeOrInstanceOf = function notTypeOrInstanceOf( from , actual , expected ) {
	if ( typeof expected === 'string' ) {
		return assert.notTypeOf( from , actual , expected ) ;
	}

	return assert.notInstanceOf( from , actual , expected ) ;
} ;



// Type
assert['to be of type'] =
assert.typeOf = function typeOf( from , actual , expected ) {
	if ( ! typeChecker[ expected ] ) {
		throw new Error( "Unknown type '" + expected + "'." ) ;
	}

	if ( ! typeChecker[ expected ]( actual ) ) {
		let article = vowel[ expected[ 0 ] ] ? 'an' : 'a' ;
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be ' + article + ' ' + expected , from , actual , expected ) ;
	}
} ;



// Not type
assert['to be not of type'] =
assert['to not be of type'] =
assert['not to be of type'] =
assert.notTypeOf = function notTypeOf( from , actual , expected ) {
	if ( ! typeChecker[ expected ] ) {
		throw new Error( "Unknown type '" + expected + "'." ) ;
	}

	if ( typeChecker[ expected ]( actual ) ) {
		let article = vowel[ expected[ 0 ] ] ? 'an' : 'a' ;
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be ' + article + ' ' + expected , from , actual , expected ) ;
	}
} ;



// Instance
assert['to be an instance of'] =
assert.instanceOf = function instanceOf( from , actual , expected ) {
	if ( ! ( actual instanceof expected ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be an instance of ' + expected , from , actual , expected ) ;
	}
} ;



// Not instance
assert['to be not an instance of'] =
assert['to not be an instance of'] =
assert['not to be an instance of'] =
assert.notInstanceOf = function notInstanceOf( from , actual , expected ) {
	if ( ! ( actual instanceof expected ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be an instance of ' + expected , from , actual , expected ) ;
	}
} ;


