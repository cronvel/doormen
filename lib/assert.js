/*
	Doormen

	Copyright (c) 2015 - 2021 Cédric Ronvel

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



const assert = {} ;
module.exports = assert ;



const typeCheckers = require( './typeCheckers.js' ) ;

const isEqual = require( './isEqual.js' ) ;
const IS_EQUAL_LIKE = { like: true } ;
const IS_EQUAL_PARTIALLY_LIKE = { like: true , oneWay: true } ;
const IS_EQUAL_PARTIALLY_EQUAL = { oneWay: true } ;

const VOWEL = new Set( [ 'a' , 'e' , 'i' , 'o' , 'u' , 'y' , 'A' , 'E' , 'I' , 'O' , 'U' , 'Y' ] ) ;



// Should be loaded after exporting
const AssertionError = require( './AssertionError.js' ) ;



// Constant
assert.NONE = {} ;



// A class for actual function, arguments, return value and thrown error
function FunctionCall( fn , isAsync , thisArg , ... args ) {
	this.function = fn ;
	this.isAsync = isAsync ;
	this.this = thisArg ;
	this.args = args ;
	this.hasThrown = false ;
	this.error = undefined ;
	this.return = undefined ;

	try {
		this.return = this.function.call( this.this || null , ... this.args ) ;
	}
	catch ( error ) {
		this.hasThrown = true ;
		this.error = error ;
	}

	if ( this.isAsync ) {
		if ( this.hasThrown ) {
			this.promise = Promise.resolve() ;
		}
		else {
			this.promise = Promise.resolve( this.return )
				.then(
					value => this.return = value ,
					error => {
						this.hasThrown = true ;
						this.error = error ;
					}
				) ;
		}
	}
}

assert.FunctionCall = FunctionCall ;



function toArrayOfValues( value ) {
	return (
		! value || typeof value !== 'object' ? [ value ] :
		Array.isArray( value ) ? value :
		typeof value.values === 'function' ? [ ... value.values() ] :
		Object.values( value )
	) ;
}

assert._toArrayOfValues = toArrayOfValues ;



function toSetOfValues( value ) {
	return (
		! value || typeof value !== 'object' ? new Set( [ value ] ) :
		value instanceof Set ? value :
		Array.isArray( value ) ? new Set( value ) :
		typeof value.values === 'function' ? new Set( value.values() ) :
		new Set( Object.values( value ) )
	) ;
}

assert._toSetOfValues = toSetOfValues ;



/*
	TODO:

	Expect.js: everything is implemented

	Chai:
	- any
	- all
	- ownPropertyDescriptor
	- lengthOf combination with above/below/at least/at most
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
	- throw specific type of errors
*/



/* Constants */



// Defined
assert['to be defined'] =
assert.defined =
assert.isDefined = ( from , actual ) => {
	if ( actual === undefined ) {
		throw AssertionError.create( from , actual , null , 'to be defined' ) ;
	}
} ;



// Undefined
assert['to be not defined'] = assert['to not be defined'] = assert['not to be defined'] =
assert['to be undefined'] =
assert.undefined =
assert.isUndefined = ( from , actual ) => {
	if ( actual !== undefined ) {
		throw AssertionError.create( from , actual , null , 'to be undefined' ) ;
	}
} ;



// Truthy
assert['to be ok'] =
assert['to be truthy'] =
assert.ok =
assert.isOk =
assert.truthy =
assert.isTruthy = ( from , actual ) => {
	if ( ! actual ) {
		throw AssertionError.create( from , actual , null , 'to be truthy' ) ;
	}
} ;



// Falsy
assert['to be not ok'] = assert['to not be ok'] = assert['not to be ok'] =
assert['to be not truthy'] = assert['to not be truthy'] = assert['not to be truthy'] =
assert['to be falsy'] =
assert.nok =
assert.ko =
assert.isNotOk =
assert.falsy =
assert.isFalsy = ( from , actual ) => {
	if ( actual ) {
		throw AssertionError.create( from , actual , null , 'to be falsy' ) ;
	}
} ;



// True
assert['to be true'] =
assert.true =
assert.isTrue = ( from , actual ) => {
	if ( actual !== true ) {
		throw AssertionError.create( from , actual , null , 'to be true' ) ;
	}
} ;



// Not true
assert['to be not true'] = assert['to not be true'] = assert['not to be true'] =
assert.notTrue =
assert.isNotTrue = ( from , actual ) => {
	if ( actual === true ) {
		throw AssertionError.create( from , actual , null , 'not to be true' ) ;
	}
} ;



// False
assert['to be false'] =
assert.false =
assert.isFalse = ( from , actual ) => {
	if ( actual !== false ) {
		throw AssertionError.create( from , actual , null , 'to be false' ) ;
	}
} ;



// Not false
assert['to be not false'] = assert['to not be false'] = assert['not to be false'] =
assert.notFalse =
assert.isNotFalse = ( from , actual ) => {
	if ( actual === false ) {
		throw AssertionError.create( from , actual , null , 'not to be false' ) ;
	}
} ;



// Null
assert['to be null'] =
assert.null =
assert.isNull = ( from , actual ) => {
	if ( actual !== null ) {
		throw AssertionError.create( from , actual , null , 'to be null' ) ;
	}
} ;



// Not null
assert['to be not null'] = assert['to not be null'] = assert['not to be null'] =
assert.notNull =
assert.isNotNull = ( from , actual ) => {
	if ( actual === null ) {
		throw AssertionError.create( from , actual , null , 'not to be null' ) ;
	}
} ;



// NaN
assert['to be NaN'] =
assert['to be nan'] =
assert.NaN =
assert.isNaN = ( from , actual ) => {
	if ( ! Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be NaN' ) ;
	}
} ;



// Not NaN
assert['to be not NaN'] = assert['to not be NaN'] = assert['not to be NaN'] =
assert['to be not nan'] = assert['to not be nan'] = assert['not to be nan'] =
assert.notNaN =
assert.isNotNaN = ( from , actual ) => {
	if ( Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'not to be NaN' ) ;
	}
} ;



assert['to be finite'] =
assert.finite = ( from , actual ) => {
	if ( typeof actual !== 'number' ) {
		throw AssertionError.create( from , actual , null , 'to be a number' ) ;
	}

	if ( Number.isNaN( actual ) || actual === Infinity || actual === -Infinity ) {
		throw AssertionError.create( from , actual , null , 'to be finite' ) ;
	}
} ;



assert['to be not finite'] = assert['to not be finite'] = assert['not to be finite'] =
assert.notFinite = ( from , actual ) => {
	if ( typeof actual !== 'number' ) {
		throw AssertionError.create( from , actual , null , 'to be a number' ) ;
	}

	if ( ! Number.isNaN( actual ) && actual !== Infinity && actual !== -Infinity ) {
		throw AssertionError.create( from , actual , null , 'to be finite' ) ;
	}
} ;



/* Equality */



// identical
assert['to be'] =
assert.strictEqual = ( from , actual , expected ) => {
	if ( actual !== expected && ! ( Number.isNaN( actual ) && Number.isNaN( expected ) ) ) {
		throw AssertionError.create( from , actual , null , 'to be' , expected ) ;
	}
} ;
assert.strictEqual.showDiff = true ;
assert.strictEqual.inspect = true ;



// Not identical
assert['to be not'] = assert['to not be'] = assert['not to be'] =
assert.notStrictEqual = ( from , actual , notExpected ) => {
	if ( actual === notExpected || ( Number.isNaN( actual ) && Number.isNaN( notExpected ) ) ) {
		throw AssertionError.create( from , actual , null , 'not to be' , notExpected ) ;
	}
} ;
assert.notStrictEqual.inspect = true ;



// Equal (different from identical)
assert['to be equal to'] =
assert['to equal'] =
assert['to eql'] =		// compatibility with expect.js
assert.equal = ( from , actual , expected ) => {
	if ( ! isEqual( actual , expected ) ) {
		throw AssertionError.create( from , actual , isEqual.getLastPath() , 'to equal' , expected ) ;
	}
} ;
assert.equal.showDiff = true ;
assert.equal.inspect = true ;



// Not equal
assert['to be not equal to'] = assert['to not be equal to'] = assert['not to be equal to'] =
assert['to not equal'] = assert['not to equal'] =
assert['to not eql'] = assert['not to eql'] =		// compatibility with expect.js
assert.notEqual = ( from , actual , notExpected ) => {
	if ( isEqual( actual , notExpected ) ) {
		throw AssertionError.create( from , actual , null , 'not to equal' , notExpected ) ;
	}
} ;
assert.notEqual.inspect = true ;



// Like
assert['to be like'] =
assert['to be alike'] =
assert['to be alike to'] =
assert.like = ( from , actual , expected ) => {
	if ( ! isEqual( actual , expected , IS_EQUAL_LIKE ) ) {
		throw AssertionError.create( from , actual , isEqual.getLastPath() , 'to be like' , expected ) ;
	}
} ;
assert.like.showDiff = true ;
assert.like.inspect = true ;



// Not like
assert['to be not like'] = assert['to not be like'] = assert['not to be like'] =
assert['to be not alike'] = assert['to not be alike'] = assert['not to be alike'] =
assert['to be not alike to'] = assert['to not be alike to'] = assert['not to be alike to'] =
assert.notLike = ( from , actual , notExpected ) => {
	if ( isEqual( actual , notExpected , IS_EQUAL_LIKE ) ) {
		throw AssertionError.create( from , actual , null , 'not to be like' , notExpected ) ;
	}
} ;
assert.notLike.inspect = true ;



// Equal to a partial object
assert['to be partially equal to'] =
assert['to be partial equal to'] =
assert['to be equal to partial'] =
assert['to partially equal'] =
assert['to partial equal'] =
assert['to equal partial'] =
assert.partialEqual =
assert.partiallyEqual = ( from , actual , expected ) => {
	if ( ! isEqual( expected , actual , IS_EQUAL_PARTIALLY_EQUAL ) ) {
		throw AssertionError.create( from , actual , isEqual.getLastPath() , 'to partially equal' , expected ) ;
	}
} ;
assert.partiallyEqual.showPathDiff = true ;
assert.partiallyEqual.inspect = true ;



// Not equal to a partial object
assert['to be not partially equal to'] = assert['to not be partially equal to'] = assert['not to be partially equal to'] =
assert['to be not partial equal to'] = assert['to not be partial equal to'] = assert['not to be partial equal to'] =
assert['to be not equal to partial'] = assert['to not be equal to partial'] = assert['not to be equal to partial'] =
assert['to not partially equal'] = assert['not to partially equal'] =
assert['to not partial equal'] = assert['not to partial equal'] =
assert['to not equal partial'] = assert['not to equal partial'] =
assert.notPartialEqual =
assert.notPartiallyEqual = ( from , actual , notExpected ) => {
	if ( isEqual( notExpected , actual , IS_EQUAL_PARTIALLY_EQUAL ) ) {
		throw AssertionError.create( from , actual , null , 'not to partially equal' , notExpected ) ;
	}
} ;
assert.notPartiallyEqual.inspect = true ;



// Like partial
assert['to be partially like'] =
assert['to be like partial'] =
assert.partialLike =
assert.partiallyLike = ( from , actual , expected ) => {
	if ( ! isEqual( expected , actual , IS_EQUAL_PARTIALLY_LIKE ) ) {
		throw AssertionError.create( from , actual , isEqual.getLastPath() , 'to be partially like' , expected ) ;
	}
} ;
assert.partiallyLike.showPathDiff = true ;
assert.partiallyLike.inspect = true ;



// Not like partial
assert['to be not partially like'] = assert['to not be partially like'] = assert['not to be partially like'] =
assert['to be not like partial'] = assert['to not be like partial'] = assert['not to be like partial'] =
assert.notPartialLike =
assert.notPartiallyLike = ( from , actual , notExpected ) => {
	if ( isEqual( notExpected , actual , IS_EQUAL_PARTIALLY_LIKE ) ) {
		throw AssertionError.create( from , actual , null , 'not to be partially like' , notExpected ) ;
	}
} ;
assert.notPartiallyLike.inspect = true ;



// Map
assert['to map'] =
assert.map = ( from , actual , expected ) => {
	if ( ! actual || typeof actual !== 'object' || typeof actual.get !== 'function' || typeof actual.keys !== 'function' ) {
		throw AssertionError.create( from , actual , null , 'to be be a mappable object' ) ;
	}

	if ( ! Array.isArray( expected ) ) {
		throw new AssertionError( "Expectation are not map entries" , from ) ;
	}

	var actualKeys = [ ... actual.keys() ] ;

	if ( actualKeys.length !== expected.length ) {
		throw AssertionError.create( from , actual , null , 'to map' , expected ) ;
	}

	expected.forEach( expectedEntry => {
		var actualKey , indexOf ;

		if ( ! Array.isArray( expectedEntry ) ) {
			throw new AssertionError( "Expectation are not map entries" , from ) ;
		}

		indexOf = actualKeys.findIndex( k => isEqual( expectedEntry[ 0 ] , k ) ) ;

		if (
			( ( indexOf = actualKeys.indexOf( expectedEntry[ 0 ] ) ) !== -1 ) ||
			( ( indexOf = actualKeys.findIndex( k => isEqual( expectedEntry[ 0 ] , k ) ) ) !== -1 )
		) {
			actualKey = actualKeys.splice( indexOf , 1 )[ 0 ] ;

			if ( ! isEqual( expectedEntry[ 1 ] , actual.get( actualKey ) ) ) {
				throw AssertionError.create( from , actual , null , 'to map' , expected ) ;
			}
		}
		else {
			throw AssertionError.create( from , actual , null , 'to map' , expected ) ;
		}
	} ) ;
} ;
assert.map.inspect = true ;



// Shallow clone
assert['to be shallow clone'] =
assert['to be shallow clone of'] =
assert['to be a shallow clone of'] =
assert.shallowCloneOf = ( from , actual , expected ) => {
	if ( typeof actual !== 'function' && ( ! actual || typeof actual !== 'object' ) ) {
		throw AssertionError.create( from , actual , null , 'to be be an object or a function' ) ;
	}

	// Or throw?
	if ( actual === expected ) { return ; }

	if ( Array.isArray( actual ) ) {
		if ( ! Array.isArray( expected ) || actual.length !== expected.length ) {
			throw AssertionError.create( from , actual , null , 'to be a shallow clone of' , expected ) ;
		}

		actual.forEach( ( element , index ) => {
			if ( element !== expected[ index ] ) {
				throw AssertionError.create( from , actual , null , 'to be a shallow clone of' , expected ) ;
			}
		} ) ;
	}
	else {
		if ( Array.isArray( expected ) ) {
			throw AssertionError.create( from , actual , null , 'to be a shallow clone of' , expected ) ;
		}

		let actualKeys = Object.keys( actual ) ;
		let expectedKeys = Object.keys( expected ) ;

		if ( actualKeys.length !== expectedKeys.length ) {
			throw AssertionError.create( from , actual , null , 'to be a shallow clone of' , expected ) ;
		}

		// The .hasOwnProperty() check is mandatory, or we have to iterate over actualKeys too
		expectedKeys.forEach( key => {
			if ( ! Object.prototype.hasOwnProperty.call( actual , key ) || actual[ key ] !== expected[ key ] ) {
				throw AssertionError.create( from , actual , null , 'to be a shallow clone of' , expected ) ;
			}
		} ) ;
	}
} ;
assert.shallowCloneOf.inspect = true ;



// Not shallow clone
assert['to be not shallow clone'] = assert['to not be shallow clone'] = assert['not to be shallow clone'] =
assert['to be not shallow clone of'] = assert['to not be shallow clone of'] = assert['not to be shallow clone of'] =
assert['to be not a shallow clone of'] = assert['to not be a shallow clone of'] = assert['not to be a shallow clone of'] =
assert.notShallowCloneOf = ( from , actual , notExpected ) => {
	if ( typeof actual !== 'function' && ( ! actual || typeof actual !== 'object' ) ) {
		throw AssertionError.create( from , actual , null , 'to be be an object or a function' ) ;
	}

	// Too boring to code, we use the reverse of shallowClone() now...
	try {
		assert.shallowCloneOf( from , actual , notExpected ) ;
	}
	catch ( error ) {
		// Great, it must throw, we can return now
		return ;
	}

	throw AssertionError.create( from , actual , null , 'not to be a shallow clone of' , notExpected ) ;
} ;
assert.notShallowCloneOf.inspect = true ;



/* Numbers / Date */



const EPSILON_DELTA_RATE = 1 + 4 * Number.EPSILON ;
const EPSILON_ZERO_DELTA = 4 * Number.MIN_VALUE ;

// Epsilon aware comparison, or with a custom delta
assert['to be close to'] =
assert['to be around'] =
assert.around = ( from , actual , value , delta ) => {
	if ( typeof actual !== 'number' ) {
		throw AssertionError.create( from , actual , null , 'to be a number' ) ;
	}

	if ( Number.isNaN( actual ) || Number.isNaN( value ) ) {
		throw AssertionError.create( from , actual , null , 'to be around' , value ) ;
	}

	if ( ! delta ) {
		let absActual = Math.abs( actual ) ,
			absValue = Math.abs( value ) ;

		if ( absActual <= EPSILON_ZERO_DELTA || absValue <= EPSILON_ZERO_DELTA ) {
			if ( actual > value + EPSILON_ZERO_DELTA || value > actual + EPSILON_ZERO_DELTA ) {
				throw AssertionError.create( from , actual , null , 'to be around' , value ) ;
			}
		}
		else if ( actual * value < 0 ) {
			// Sign mismatch
			throw AssertionError.create( from , actual , null , 'to be around' , value ) ;
		}
		else if ( absActual > absValue * EPSILON_DELTA_RATE || absValue > absActual * EPSILON_DELTA_RATE ) {
			throw AssertionError.create( from , actual , null , 'to be around' , value ) ;
		}

		return ;
	}

	if ( actual < value - delta || actual > value + delta ) {
		throw AssertionError.create( from , actual , null , 'to be around' , value ) ;
	}
} ;



// Epsilon aware comparison, or with a custom delta
assert['to be not close to'] =
assert['to not be close to'] =
assert['not to be close to'] =
assert['to be not around'] =
assert['to not be around'] =
assert['not to be around'] =
assert.notAround = ( from , actual , value , delta ) => {
	if ( typeof actual !== 'number' ) {
		throw AssertionError.create( from , actual , null , 'to be a number' ) ;
	}

	if ( Number.isNaN( actual ) || Number.isNaN( value ) ) { return ; }

	if ( ! delta ) {
		if ( actual === 0 || value === 0 ) {
			if ( actual <= value + EPSILON_ZERO_DELTA && value <= actual + EPSILON_ZERO_DELTA ) {
				throw AssertionError.create( from , actual , null , 'not to be around' , value ) ;
			}
		}
		else if ( actual <= value * EPSILON_DELTA_RATE && value <= actual * EPSILON_DELTA_RATE ) {
			throw AssertionError.create( from , actual , null , 'not to be around' , value ) ;
		}

		return ;
	}

	if ( ( actual >= value - delta && actual <= value + delta ) || Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'not to be around' , value ) ;
	}
} ;



assert['to be above'] =
assert['to be greater'] =
assert['to be greater than'] =
assert.above =
assert.gt =
assert.greater =
assert.greaterThan = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw AssertionError.create( from , actual , null , 'to be a number or a Date' ) ;
	}

	if ( actual <= value || Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be above' , value ) ;
	}
} ;



assert['to be at least'] =
assert['to be greater than or equal to'] =
assert.least =
assert.gte =
assert.greaterThanOrEqualTo = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw AssertionError.create( from , actual , null , 'to be a number or a Date' ) ;
	}

	if ( actual < value || Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be at least' , value ) ;
	}
} ;



assert['to be below'] =
assert['to be lesser'] =
assert['to be lesser than'] =
assert.below =
assert.lt =
assert.lesser =
assert.lesserThan = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw AssertionError.create( from , actual , null , 'to be a number or a Date' ) ;
	}

	if ( actual >= value || Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be below' , value ) ;
	}
} ;



assert['to be at most'] =
assert['to be lesser than or equal to'] =
assert.most =
assert.lte =
assert.lesserThanOrEqualTo = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw AssertionError.create( from , actual , null , 'to be a number or a Date' ) ;
	}

	if ( actual > value || Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be at most' , value ) ;
	}
} ;



assert['to be within'] =
assert.within = ( from , actual , lower , higher ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw AssertionError.create( from , actual , null , 'to be a number or a Date' ) ;
	}

	if ( actual < lower || actual > higher || Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be within' , lower , higher ) ;
	}
} ;



assert['to be not within'] =
assert['to not be within'] =
assert['not to be within'] =
assert.notWithin = ( from , actual , lower , higher ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw AssertionError.create( from , actual , null , 'to be a number or a Date' ) ;
	}

	if ( ( actual >= lower && actual <= higher ) || Number.isNaN( actual ) ) {
		throw AssertionError.create( from , actual , null , 'not to be within' , lower , higher ) ;
	}
} ;



/* String */



// String regexp match
assert['to match'] =
assert.match = ( from , actual , expected ) => {
	if ( typeof actual !== 'string' ) {
		throw AssertionError.create( from , actual , null , 'to be a string' ) ;
	}

	if ( ! actual.match( expected ) ) {
		throw AssertionError.create( from , actual , null , 'to match' , expected ) ;
	}
} ;



// Not string regexp match
assert['to not match'] =
assert['not to match'] =
assert.notMatch = ( from , actual , notExpected ) => {
	if ( typeof actual !== 'string' ) {
		throw AssertionError.create( from , actual , null , 'to be a string' ) ;
	}

	if ( actual.match( notExpected ) ) {
		throw AssertionError.create( from , actual , null , 'not to match' , notExpected ) ;
	}
} ;



/* Content */



assert['to have length'] =
assert['to have length of'] =
assert['to have a length of'] =
assert.lengthOf = ( from , actual , expected ) => {
	if ( typeof actual !== 'string' && ( ! actual || typeof actual !== 'object' ) ) {
		throw AssertionError.create( from , actual , null , 'to have some length' ) ;
	}

	if ( actual.length !== expected ) {
		throw AssertionError.create( from , actual , null , 'to have a length of' , expected ) ;
	}
} ;



assert['to have not length'] = assert['to not have length'] = assert['not to have length'] =
assert['to have length not of'] = assert['to have not length of'] = assert['to not have length of'] = assert['not to have length of'] =
assert['to have a length not of'] = assert['to have not a length of'] = assert['to not have a length of'] = assert['not to have a length of'] =
assert.notLengthOf = ( from , actual , notExpected ) => {
	if ( typeof actual !== 'string' && ( ! actual || typeof actual !== 'object' ) ) {
		throw AssertionError.create( from , actual , null , 'to have some length' ) ;
	}

	if ( actual.length === notExpected ) {
		throw AssertionError.create( from , actual , null , 'not to have a length of' , notExpected ) ;
	}
} ;



assert['to contain'] =
assert['to have'] =
assert['to include'] =
assert.has =
assert.includes = assert.include =
assert.contains = assert.contain = ( from , actual , ... expected ) => {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		let actualValues = toArrayOfValues( actual ) ;
		has = expected.every( value => actualValues.includes( value ) ) ;
	}
	else if ( typeof actual === 'string' ) {
		has = expected.every( value => actual.includes( value ) ) ;
	}

	if ( ! has ) {
		throw AssertionError.create( from , actual , null , 'to contain' , expected ) ;
	}
} ;
assert.contain.inspect = true ;



assert['to contain not'] = assert['to not contain'] = assert['not to contain'] =
assert['to have not'] = assert['to not have'] = assert['not to have'] =
assert['to include not'] = assert['to not include'] = assert['not to include'] =
assert.hasNot =
assert.notInclude =
assert.notContain = ( from , actual , ... notExpected ) => {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		let actualValues = toArrayOfValues( actual ) ;
		has = notExpected.some( value => actualValues.includes( value ) ) ;
	}
	else if ( typeof actual === 'string' ) {
		has = notExpected.some( value => actual.includes( value ) ) ;
	}

	if ( has ) {
		throw AssertionError.create( from , actual , null , 'not to contain' , notExpected ) ;
	}
} ;
assert.notContain.inspect = true ;



// .has() is ambigous, it's like .contain() except for object having a .has() method: e.g. Map, for Set it still produces the same result
assert['to have'] =
assert.has = ( from , actual , ... expected ) => {
	if ( actual && typeof actual === 'object' ) {
		if ( typeof actual.has === 'function' ) {
			if ( ! expected.every( value => actual.has( value ) ) ) {
				throw AssertionError.create( from , actual , null , 'to have' , expected ) ;
			}

			return ;
		}
	}

	assert.contain( from , actual , ... expected ) ;
} ;
assert.has.inspect = true ;



// .hasNot() is ambigous, it's like .notContain() except for object having a .has() method: e.g. Map, for Set it still produces the same result
assert['to have not'] = assert['to not have'] = assert['not to have'] =
assert.hasNot = ( from , actual , ... notExpected ) => {
	if ( actual && typeof actual === 'object' ) {
		if ( typeof actual.has === 'function' ) {
			if ( notExpected.some( value => actual.has( value ) ) ) {
				throw AssertionError.create( from , actual , null , 'not to have' , notExpected ) ;
			}
			return ;
		}
	}

	assert.notContain( from , actual , ... notExpected ) ;
} ;
assert.hasNot.inspect = true ;



assert['to only contain'] = assert['to contain only'] =
assert['to only have'] = assert['to have only'] =
assert['to only include'] = assert['to include only'] =
assert.includeOnly = assert.includesOnly =
assert.containOnly = assert.containsOnly = ( from , actual , ... expected ) => {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		let actualValues = toSetOfValues( actual ) ;
		let expectedValues = toSetOfValues( expected ) ;
		// Check size, then iterate...
		has = actualValues.size === expectedValues.size && [ ... expectedValues ].every( value => actualValues.has( value ) ) ;
	}
	else if ( typeof actual === 'string' ) {
		// Does not make sense at all to use this assertion for strings, but well...
		has = expected.every( value => actual === value ) ;
	}

	if ( ! has ) {
		throw AssertionError.create( from , actual , null , 'to contain only' , expected ) ;
	}
} ;
assert.containOnly.inspect = true ;
assert.containOnly.glue = ', ' ;



assert['not to only contain'] = assert['to not only contain'] =
assert['not to contain only'] = assert['to not contain only'] = assert['to contain not only'] =
assert['not to only include'] = assert['to not only include'] =
assert['not to include only'] = assert['to not include only'] = assert['to include not only'] =
assert.notIncludeOnly =
assert.notContainOnly = ( from ) => {
	throw new AssertionError( "Ambigous assertion type 'not to contain only'" , from ) ;
} ;



assert['to only have'] = assert['to have only'] =
assert.hasOnly = ( from , actual , ... expected ) => {
	if ( actual && typeof actual === 'object' ) {
		if ( typeof actual.has === 'function' ) {
			let actualValues = toSetOfValues( actual ) ;
			let expectedValues = toSetOfValues( expected ) ;
			// Check size, then iterate...
			// Use actual, not actualValues inside every()
			if ( actualValues.size !== expectedValues.size || ! [ ... expectedValues ].every( value => actual.has( value ) ) ) {
				throw AssertionError.create( from , actual , null , 'to have only' , expected ) ;
			}

			return ;
		}
	}

	assert.containOnly( from , actual , ... expected ) ;
} ;
assert.hasOnly.inspect = true ;
assert.hasOnly.glue = ', ' ;



assert['not to only have'] = assert['to not only have'] =
assert['not to have only'] = assert['to not have only'] = assert['to have not only'] =
assert.hasNotOnly = ( from ) => {
	throw new AssertionError( "Ambigous assertion type 'not to have only'" , from ) ;
} ;



assert['to only have unique values'] =
assert['to have only unique values'] =
assert['to only contain unique values'] =
assert['to contain only unique values'] =
assert['to only include unique values'] =
assert['to include only unique values'] =
assert.onlyUniqueValues = ( from , actual ) => {
	if ( ! actual || typeof actual !== 'object' ) {
		throw AssertionError.create( from , actual , null , 'to only contain unique values' ) ;
	}

	var actualValues = toArrayOfValues( actual ) ;

	for ( let i = 0 ; i < actualValues.length ; i ++ ) {
		for ( let j = i + 1 ; j < actualValues.length ; j ++ ) {
			if ( actualValues[ i ] === actualValues[ j ] ) {
				throw AssertionError.create( from , actual , null , 'to only contain unique values' ) ;
			}
		}
	}
} ;
assert.onlyUniqueValues.inspect = true ;



assert['not to only have unique values'] = assert['to not only have unique values'] =
assert['not to have only unique values'] = assert['to not have only unique values'] = assert['to have not only unique values'] =
assert['not to only contain unique values'] = assert['to not only contain unique values'] =
assert['not to contain only unique values'] = assert['to not contain only unique values'] = assert['to contain not only unique values'] =
assert['not to only include unique values'] = assert['to not only include unique values'] =
assert['not to include only unique values'] = assert['to not include only unique values'] = assert['to include not only unique values'] =
assert.notOnlyUniqueValues = ( from ) => {
	throw new AssertionError( "Ambigous assertion type 'not to contain only unique values'" , from ) ;
} ;



assert['to be empty'] =
assert.empty = ( from , actual ) => {
	var isEmpty = true ;

	if ( actual ) {
		if ( typeof actual === 'object' ) {
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
		throw AssertionError.create( from , actual , null , 'to be empty' ) ;
	}
} ;



assert['to be not empty'] = assert['to not be empty'] = assert['not to be empty'] =
assert.notEmpty = ( from , actual ) => {
	var isEmpty = true ;

	if ( actual ) {
		if ( typeof actual === 'object' ) {
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
		throw AssertionError.create( from , actual , null , 'to be empty' ) ;
	}
} ;



/* Objects */



assert['to have key'] =
assert['to have keys'] =
assert.key =
assert.keys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( ! ( key in actual ) ) {
			throw AssertionError.create( from , actual , null , 'to have key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.keys.inspect = true ;
assert.keys.glue = ', ' ;



assert['to have not key'] = assert['to not have key'] = assert['not to have key'] =
assert['to have not keys'] = assert['to not have keys'] = assert['not to have keys'] =
assert['to have no key'] =
assert.noKey =
assert.notKey =
assert.notKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( key in actual ) {
			throw AssertionError.create( from , actual , null , 'not to have key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.notKeys.inspect = true ;
assert.notKeys.glue = ', ' ;



assert['to have own key'] =
assert['to have own keys'] =
assert.ownKey =
assert.ownKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( ! Object.prototype.hasOwnProperty.call( actual , key ) ) {
			throw AssertionError.create( from , actual , null , 'to have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.ownKeys.inspect = true ;
assert.ownKeys.glue = ', ' ;



assert['to only have key'] = assert['to have only key'] = assert['to have only key'] =
assert['to only have keys'] = assert['to have only keys'] = assert['to have only keys'] =
assert.onlyKey =
assert.onlyKeys = ( from ) => {
	throw new AssertionError( "Instead of using assertion 'onlyKeys', you should use assertion 'onlyOwnKeys'." , from ) ;
} ;



assert['to only have own key'] = assert['to have only own key'] = assert['to have own only key'] =
assert['to only have own keys'] = assert['to have only own keys'] = assert['to have own only keys'] =
assert.onlyOwnKey =
assert.onlyOwnKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be an object or a function' ) ;
	}

	// First, check if the number of keys match
	if ( Object.getOwnPropertyNames( actual ).length !== keys.length ) {
		throw AssertionError.create( from , actual , null , 'to only have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
	}

	// Then, each expected keys should be present
	keys.forEach( key => {
		if ( ! Object.prototype.hasOwnProperty.call( actual , key ) ) {
			throw AssertionError.create( from , actual , null , 'to only have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.onlyOwnKeys.inspect = true ;
assert.onlyOwnKeys.glue = ', ' ;



assert['to have not own key'] = assert['to not have own key'] = assert['not to have own key'] =
assert['to have not own keys'] = assert['to not have own keys'] = assert['not to have own keys'] =
assert['to have no own key'] =
assert.noOwnKey =
assert.notOwnKey =
assert.notOwnKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw AssertionError.create( from , actual , null , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( Object.prototype.hasOwnProperty.call( actual , key ) ) {
			throw AssertionError.create( from , actual , null , 'not to have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.notOwnKeys.inspect = true ;
assert.notOwnKeys.glue = ', ' ;



assert['to have property'] =
assert.property = function( from , actual , key , value ) {
	assert.key( from , actual , key ) ;

	if ( arguments.length >= 4 ) {
		assert.equal( from , actual[ key ] , value ) ;
	}
} ;



assert['to have not property'] = assert['to not have property'] = assert['not to have property'] =
assert['to have no property'] =
assert.notProperty = function( from , actual , key , value ) {
	if ( arguments.length >= 4 ) {
		if ( key in actual ) {
			assert.notEqual( from , actual[ key ] , value ) ;
		}
	}
	else {
		assert.notKey( from , actual , key ) ;
	}
} ;



assert['to have own property'] =
assert.ownProperty = function( from , actual , key , value ) {
	assert.ownKey( from , actual , key ) ;

	if ( arguments.length >= 4 ) {
		assert.equal( from , actual[ key ] , value ) ;
	}
} ;



assert['to have not own property'] = assert['to not have own property'] = assert['not to have own property'] =
assert['to have no own property'] =
assert.notOwnProperty = function( from , actual , key , value ) {
	if ( arguments.length >= 4 ) {
		if ( Object.prototype.hasOwnProperty.call( actual , key ) ) {
			assert.notEqual( from , actual[ key ] , value ) ;
		}
	}
	else {
		assert.notOwnKey( from , actual , key ) ;
	}
} ;



/* Functions */



assert['to throw'] =
assert['to throw a'] =
assert['to throw an'] =
assert.throw = ( from , fn , fnThisAndArgs , expectedErrorInstance , expectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		throw AssertionError.create( from , fn , null , 'to be a function' ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , false , ... fnThisAndArgs ) ;

	if ( expectedErrorInstance ) {
		if ( ! call.hasThrown || ! ( call.error instanceof expectedErrorInstance ) ) {
			let article = VOWEL.has(  ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
			throw AssertionError.create( from , call , null , 'to throw ' + article , expectedErrorInstance ) ;
		}

		if ( expectedPartialError && ! isEqual( expectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
			let article = VOWEL.has(  ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
			throw AssertionError.create( from , call , isEqual.getLastPath() , 'to throw ' + article , expectedErrorInstance , expectedPartialError ) ;
		}
	}
	else if ( ! call.hasThrown ) {
		throw AssertionError.create( from , call , null , 'to throw' ) ;
	}
} ;
assert.throw.fnParams = true ;
assert.throw.inspect = true ;
assert.throw.glue = ' having ' ;



assert['to not throw'] = assert['not to throw'] =
assert['to throw not a'] = assert['to not throw a'] = assert['not to throw a'] =
assert['to throw not an'] = assert['to not throw an'] = assert['not to throw an'] =
assert.notThrow = ( from , fn , fnThisAndArgs , notExpectedErrorInstance , notExpectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		throw AssertionError.create( from , fn , null , 'to be a function' ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , false , ... fnThisAndArgs ) ;

	if ( notExpectedErrorInstance ) {
		if ( call.hasThrown && call.error instanceof notExpectedErrorInstance ) {
			if ( notExpectedPartialError ) {
				if ( isEqual( notExpectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
					let article = VOWEL.has(  ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
					throw AssertionError.create( from , call , null , 'not to throw ' + article , notExpectedErrorInstance , notExpectedPartialError ) ;
				}
			}
			else {
				let article = VOWEL.has(  ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
				throw AssertionError.create( from , call , null , 'not to throw ' + article , notExpectedErrorInstance ) ;
			}
		}
	}
	else if ( call.hasThrown ) {
		throw AssertionError.create( from , call , null , 'not to throw' ) ;
	}
} ;
assert.notThrow.fnParams = true ;
assert.notThrow.inspect = true ;
assert.notThrow.glue = ' having ' ;



// Almost identical to .throw()
assert['to reject'] =
assert['to reject with'] =
assert['to reject with a'] =
assert['to reject with an'] =
assert['to not fulfill'] = assert['not to fulfill'] =
//assert['to fulfill not with'] = assert['to not fulfill with'] = assert['not to fulfill with'] =
//assert['to fulfill not with a'] = assert['to not fulfill with a'] = assert['not to fulfill with a'] =
//assert['to fulfill not with an'] = assert['to not fulfill with an'] = assert['not to fulfill with an'] =
assert.notFulfill =
assert.reject = async ( from , fn , fnThisAndArgs , expectedErrorInstance , expectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		return assert.rejected( from , fn , expectedErrorInstance , expectedPartialError ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , true , ... fnThisAndArgs ) ;
	await call.promise ;

	if ( expectedErrorInstance ) {
		if ( ! call.hasThrown || ! ( call.error instanceof expectedErrorInstance ) ) {
			let article = VOWEL.has(  ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
			throw AssertionError.create( from , call , null , 'to reject with ' + article , expectedErrorInstance ) ;
		}

		if ( expectedPartialError && ! isEqual( expectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
			let article = VOWEL.has(  ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
			throw AssertionError.create( from , call , isEqual.getLastPath() , 'to reject with ' + article , expectedErrorInstance , expectedPartialError ) ;
		}
	}
	else if ( ! call.hasThrown ) {
		throw AssertionError.create( from , call , null , 'to reject' ) ;
	}
} ;
assert.throw.promise = assert.reject ;
assert.reject.fnParams = true ;
assert.reject.async = true ;
assert.reject.inspect = true ;
assert.reject.glue = ' having ' ;



// Almost identical to .notThrow()
assert['to not reject'] = assert['not to reject'] =
assert['to reject not with'] = assert['to not reject with'] = assert['not to reject with'] =
assert['to reject not with a'] = assert['to not reject with a'] = assert['not to reject with a'] =
assert['to reject not with an'] = assert['to not reject with an'] = assert['not to reject with an'] =
assert['to fulfill'] =
//assert['to fulfill with'] =
//assert['to fulfill with a'] =
//assert['to fulfill with an'] =
assert.notReject =
assert.fulfill = async ( from , fn , fnThisAndArgs , notExpectedErrorInstance , notExpectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		return assert.fulfilled( from , fn , notExpectedErrorInstance , notExpectedPartialError ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , true , ... fnThisAndArgs ) ;
	await call.promise ;

	if ( notExpectedErrorInstance ) {
		if ( call.hasThrown && call.error instanceof notExpectedErrorInstance ) {
			if ( notExpectedPartialError ) {
				if ( isEqual( notExpectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
					let article = VOWEL.has(  ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
					throw AssertionError.create( from , call , null , 'not to reject with ' + article , notExpectedErrorInstance , notExpectedPartialError ) ;
				}
			}
			else {
				let article = VOWEL.has(  ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
				throw AssertionError.create( from , call , null , 'not to reject with ' + article , notExpectedErrorInstance ) ;
			}
		}
	}
	else if ( call.hasThrown ) {
		throw AssertionError.create( from , call , null , 'not to reject' ) ;
	}
} ;
assert.notThrow.promise = assert.fulfill ;
assert.fulfill.fnParams = true ;
assert.fulfill.async = true ;
assert.fulfill.inspect = true ;
assert.fulfill.glue = ' having ' ;



/* Promises */



// Almost identical to .throw()
assert['to be rejected'] =
assert['to be rejected with'] =
assert['to be rejected with a'] =
assert['to be rejected with an'] =
assert['not to be fulfilled'] = assert['to not be fulfilled'] = assert['to be not fulfilled'] =
//assert['not to be fulfilled with'] = assert['to not be fulfilled with'] = assert['to be not fulfilled with'] =
//assert['not to be fulfilled with a'] = assert['to not be fulfilled with a'] = assert['to be not fulfilled with a'] =
//assert['not to be fulfilled with an'] = assert['to not be fulfilled with an'] = assert['to be not fulfilled with an'] =
assert.notFulfilled =
assert.rejected = async ( from , promise , expectedErrorInstance , expectedPartialError ) => {
	var error , hasThrown = false ;

	try {
		await promise ;
	}
	catch ( error_ ) {
		hasThrown = true ;
		error = error_ ;
	}

	if ( expectedErrorInstance ) {
		if ( ! hasThrown || ! ( error instanceof expectedErrorInstance ) ) {
			let article = VOWEL.has(  ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
			throw AssertionError.create( from , promise , null , 'to be rejected with ' + article , expectedErrorInstance ) ;
		}

		if ( expectedPartialError && ! isEqual( expectedPartialError , error , IS_EQUAL_PARTIALLY_LIKE ) ) {
			let article = VOWEL.has(  ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
			throw AssertionError.create( from , promise , isEqual.getLastPath() , 'to be rejected with ' + article , expectedErrorInstance , expectedPartialError ) ;
		}
	}
	else if ( ! hasThrown ) {
		throw AssertionError.create( from , promise , null , 'to be rejected' ) ;
	}
} ;
assert.rejected.promise = true ;
assert.rejected.async = true ;
assert.rejected.inspect = true ;



// Almost identical to .notThrow()
assert['not to be rejected'] = assert['to not be rejected'] = assert['to be not rejected'] =
assert['not to be rejected with'] = assert['to not be rejected with'] = assert['to be not rejected with'] =
assert['not to be rejected with a'] = assert['to not be rejected with a'] = assert['to be not rejected with a'] =
assert['not to be rejected with an'] = assert['to not be rejected with an'] = assert['to be not rejected with an'] =
assert['to be fulfilled'] =
//assert['to be fulfilled with'] =
//assert['to be fulfilled with a'] =
//assert['to be fulfilled with an'] =
assert.fulfilled =
assert.notRejected = async ( from , promise , notExpectedErrorInstance , notExpectedPartialError ) => {
	var error , hasThrown = false ;

	try {
		await promise ;
	}
	catch ( error_ ) {
		hasThrown = true ;
		error = error_ ;
	}

	if ( notExpectedErrorInstance ) {
		if ( hasThrown && error instanceof notExpectedErrorInstance ) {
			if ( notExpectedPartialError ) {
				if ( isEqual( notExpectedPartialError , error , IS_EQUAL_PARTIALLY_LIKE ) ) {
					let article = VOWEL.has(  ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
					throw AssertionError.create( from , promise , null , 'not to be rejected with ' + article , notExpectedErrorInstance , notExpectedPartialError ) ;
				}
			}
			else {
				let article = VOWEL.has(  ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
				throw AssertionError.create( from , promise , null , 'not to be rejected with ' + article , notExpectedErrorInstance ) ;
			}
		}
	}
	else if ( hasThrown ) {
		throw AssertionError.create( from , promise , null , 'not to be rejected' ) ;
	}
} ;
assert.fulfilled.promise = true ;
assert.fulfilled.async = true ;
assert.fulfilled.inspect = true ;



/* Types / Instances */



// Type or instance
assert['to be a'] =
assert['to be an'] =
assert.typeOrInstanceOf = ( from , actual , expected ) => {
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
assert.notTypeOrInstanceOf = ( from , actual , notExpected ) => {
	if ( typeof notExpected === 'string' ) {
		return assert.notTypeOf( from , actual , notExpected ) ;
	}

	return assert.notInstanceOf( from , actual , notExpected ) ;
} ;



// Type
assert['to be of type'] =
assert.typeOf = ( from , actual , expected ) => {
	if ( ! typeCheckers[ expected ] ) {
		throw new Error( "Unknown type '" + expected + "'." ) ;
	}

	if ( ! typeCheckers[ expected ]( actual ) ) {
		let article = VOWEL.has(  expected[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
		throw AssertionError.create( from , actual , null , 'to be ' + article , expected ) ;
	}
} ;



// Not type
assert['to be not of type'] =
assert['to not be of type'] =
assert['not to be of type'] =
assert.notTypeOf = ( from , actual , notExpected ) => {
	if ( ! typeCheckers[ notExpected ] ) {
		throw new Error( "Unknown type '" + notExpected + "'." ) ;
	}

	if ( typeCheckers[ notExpected ]( actual ) ) {
		let article = VOWEL.has(  notExpected[ 0 ] ) ? 'an' : 'a' ;	// cosmetic
		throw AssertionError.create( from , actual , null , 'not to be ' + article , notExpected ) ;
	}
} ;



// Instance
assert['to be an instance of'] =
assert.instanceOf = ( from , actual , expected ) => {
	if ( ! ( actual instanceof expected ) ) {
		throw AssertionError.create( from , actual , null , 'to be an instance of' , expected ) ;
	}
} ;
assert.instanceOf.inspect = true ;



// Not instance
assert['to be not an instance of'] =
assert['to not be an instance of'] =
assert['not to be an instance of'] =
assert.notInstanceOf = ( from , actual , notExpected ) => {
	if ( actual instanceof notExpected ) {
		throw AssertionError.create( from , actual , null , 'not to be an instance of' , notExpected ) ;
	}
} ;
assert.notInstanceOf.inspect = true ;



// Force failure
assert.fail = ( from , actual , middleMessage , ... expectations ) => {
	throw AssertionError.create( from , actual , null , { expectationType: 'fail' , middleMessage: middleMessage } , ... expectations ) ;
} ;
assert.fail.inspect = true ;
assert.fail.none = true ;

