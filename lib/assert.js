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



// Truthy
assert['to be ok'] =
assert['to be truthy'] =
assert.ok =
assert.isOk =
assert.truthy =
assert.isTruthy = function isTruthy( from , actual ) {
	if ( ! actual ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + 'to be truthy' , from , actual ) ;
	}
} ;



// Falsy
assert['to be not ok'] =
assert['to not be ok'] =
assert['not to be ok'] =
assert['to be falsy'] =
assert['not to be truthy'] =
assert['to not be truthy'] =
assert.nok =
assert.ko =
assert.isNotOk =
assert.falsy =
assert.isFalsy = function isFalsy( from , actual ) {
	if ( actual ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + 'to be falsy' , from , actual ) ;
	}
} ;



// True
assert['to be true'] =
assert.true =
assert.isTrue = function isTrue( from , actual ) {
	if ( actual !== true ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + 'to be true' , from , actual , true ) ;
	}
} ;



// Falsy
assert['to be false'] =
assert.false =
assert.isFalse = function isFalse( from , actual ) {
	if ( actual !== false ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + 'to be false' , from , actual , false ) ;
	}
} ;



// Null
assert['to be null'] =
assert.null =
assert.isNull = function isNull( from , actual ) {
	if ( actual !== null ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + 'to be null' , from , actual , null ) ;
	}
} ;



// Undefined
assert['to be undefined'] =
assert.undefined =
assert.isUndefined = function isUndefined( from , actual ) {
	if ( actual !== undefined ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + 'to be undefined' , from , actual , undefined ) ;
	}
} ;



// Undefined
assert['to be defined'] =
assert.defined =
assert.isDefined = function isDefined( from , actual ) {
	if ( actual === undefined ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + 'to be defined' , from , actual ) ;
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
assert['to not be'] =
assert['not to be'] =
assert['to be not'] =
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
assert['to be not equal to'] =
assert['to not be equal to'] =
assert['not to be equal to'] =
assert['to not equal'] =
assert['not to equal'] =
assert['to not eql'] =		// compatibility with expect.js
assert['not to eql'] =		// compatibility with expect.js
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
assert['to be not like'] =
assert['to not be like'] =
assert['not to be like'] =
assert['to be not alike'] =
assert['to not be alike'] =
assert['not to be alike'] =
assert['to be not alike to'] =
assert['to not be alike to'] =
assert['not to be alike to'] =
assert.notLike = function notLike( from , actual , expected ) {
	if ( isEqual( actual , expected , true ) ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be like ' + inspectVar( expected ) , from , actual , expected ) ;
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
	if ( typeof actual !== 'string' && typeof actual !== 'object' || typeof actual.indexOf !== 'function' ) {
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
	if ( typeof actual !== 'string' && typeof actual !== 'object' || typeof actual.indexOf !== 'function' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to have an indexOf method' , from , actual ) ;
	}

	if ( actual.indexOf( expected ) !== -1 ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to contain ' + inspectVar( expected ) , from , actual , expected ) ;
	}
} ;



assert['to be within'] =
assert.within = function within( from , actual , lower , higher ) {
	if ( typeof actual !== 'number' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number' , from , actual ) ;
	}

	if ( actual < lower || actual > higher ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be within ' + lower + ' and ' + higher  , from , actual ) ;
	}
} ;



assert['to be not within'] =
assert['to not be within'] =
assert['not to be within'] =
assert.notWithin = function notWithin( from , actual , lower , higher ) {
	if ( typeof actual !== 'number' ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be a number' , from , actual ) ;
	}

	if ( actual >= lower && actual <= higher ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' not to be within ' + lower + ' and ' + higher  , from , actual ) ;
	}
} ;



assert['to be empty'] =
assert.empty = function empty( from , actual ) {
	var failed = false ;

	if ( actual ) {
		if ( typeof actual === 'object' ) {
			if ( Array.isArray( actual ) ) {
				if ( actual.length ) { failed = true ; }
			}
			else if ( ( actual instanceof Map ) || ( actual instanceof Set ) ) {
				if ( actual.size ) { failed = true ; }
			}
			else if ( actual.length !== undefined ) {
				if ( actual.length ) { failed = true ; }
			}
			else if ( Object.keys( actual ).length ) {
				failed = true ;
			}
		}
		else if ( typeof actual === 'string' ) {
			failed = true ;
		}
	}

	if ( failed ) {
		throw new AssertionError( 'Expected ' + inspectVar( actual ) + ' to be empty' , from , actual ) ;
	}
} ;






/*
	Remaining expect.js

	length
	empty
	property
	key/keys
	only keys
	to throw / not to throw
	greater than/gt/gte/above
	lesser than/lt/lte/below
	withArgs (function)
	fail useful???


	Doormen specific:

	to validate
*/

