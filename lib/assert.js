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



var assert = {} ;
module.exports = assert ;



// Truthy
assert.ok =
assert['to be ok'] =
assert.truthy =
assert['to be truthy'] =
assert.toBeTruthy = function toBeTruthy( from , actual ) {
	if ( ! actual ) {
		throw new AssertionError( 'Not truthy!' , from , actual ) ;
	}
} ;



assert.nok =
assert['to be not ok'] =
assert['to not be ok'] =
assert['not to be ok'] =
assert.falsy =
assert['to be falsy'] =
assert['not to be truthy'] =
assert['to not be truthy'] =
assert.toBeFalsy = function toBeFalsy( from , actual ) {
	if ( actual ) {
		throw new AssertionError( 'Not falsy!' , from , actual ) ;
	}
} ;



// identical
assert['to be'] =
assert.toBe = function toBe( from , actual , expected ) {
	if ( actual !== expected && ! ( Number.isNaN( actual ) && Number.isNaN( expected ) ) ) {
		throw new AssertionError( 'Not identical!' , from , actual , expected , true ) ;
	}
} ;



// Not identical
assert['to not be'] =
assert['not to be'] =
assert['to be not'] =
assert.notToBe = function notToBe( from , actual , expected ) {
	if ( actual === expected || ( Number.isNaN( actual ) && Number.isNaN( expected ) ) ) {
		throw new AssertionError( 'Not not identical!' , from , actual , expected , true ) ;
	}
} ;



// Equal (but not identical)
assert['to be equal to'] =
assert['to equal'] =
assert['to eql'] =		// compatibility with expect.js
assert.toEqual = function toEqual( from , actual , expected ) {
	if ( ! isEqual( actual , expected ) ) {
		throw new AssertionError( 'Not equals!' , from , actual , expected , true ) ;
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
assert.notToEqual = function notToEqual( from , actual , expected ) {
	if ( isEqual( actual , expected ) ) {
		throw new AssertionError( 'Not not equals!' , from , actual , expected , true ) ;
	}
} ;



// Like
assert['to be like'] =
assert['to be alike'] =
assert['to be alike to'] =
assert.toBeLike = function toBeLike( from , actual , expected ) {
	if ( ! isEqual( actual , expected , true ) ) {
		throw new AssertionError( 'Not like!' , from , actual , expected , true ) ;
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
assert.notToBeLike = function notToBeLike( from , actual , expected ) {
	if ( isEqual( actual , expected , true ) ) {
		throw new AssertionError( 'Not not like!' , from , actual , expected , true ) ;
	}
} ;



// Type or instance
assert['to be a'] =
assert['to be an'] =
assert.toBeA = function toBeA( from , actual , expected ) {
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
assert.notToBeA = function notToBeA( from , actual , expected ) {
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
		throw new AssertionError( "Expecting type '" + expected + "'." , from , actual ) ;
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
		throw new AssertionError( "Not expecting type '" + expected + "'." , from , actual ) ;
	}
} ;



// Instance
assert['to be an instance of'] =
assert.instanceOf = function instanceOf( from , actual , expected ) {
	if ( ! ( actual instanceof expected ) ) {
		throw new AssertionError( "Expecting an instance of '" + expected + "'." , from , actual ) ;
	}
} ;



// Not instance
assert['to be not an instance of'] =
assert['to not be an instance of'] =
assert['not to be an instance of'] =
assert.notInstanceOf = function notInstanceOf( from , actual , expected ) {
	if ( ! ( actual instanceof expected ) ) {
		throw new AssertionError( "Not expecting an instance of '" + expected + "'." , from , actual ) ;
	}
} ;



// String regexp match
assert['to match'] =
assert.match = function match( from , actual , expected ) {
	if ( typeof actual !== 'string' ) {
		throw new AssertionError( "Not a string!" , from , actual ) ;
	}

	if ( ! actual.match( expected ) ) {
		throw new AssertionError( "Not matching!" , from , actual ) ;
	}
} ;



// Not string regexp match
assert['to not match'] =
assert['not to match'] =
assert.notMatch = function notMatch( from , actual , expected ) {
	if ( typeof actual !== 'string' ) {
		throw new AssertionError( "Not a string!" , from , actual ) ;
	}

	if ( actual.match( expected ) ) {
		throw new AssertionError( "Not not matching!" , from , actual ) ;
	}
} ;

/*
	Remaining expect.js

	contain (indexOf array/string)
	length
	empty
	property
	key/keys
	only keys
	to throw / not to throw
	greater than/gt/gte/above
	lesser than/lt/lte/below
	within
	withArgs (function)
	fail??? useful???


	Doormen specific:

	to validate
*/

