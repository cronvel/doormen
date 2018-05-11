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



// A class for actual function, arguments, return value and thrown error
function FunctionCall( fn , thisArg , ... args ) {
	this.function = fn ;
	this.this = thisArg ;
	this.args = args ;
	this.hasThrown = false ;
	this.error = undefined ;
	this.return = undefined ;

	try {
		if ( this.this ) { this.return = this.function.call( this.this , ... this.args ) ; }
		else { this.return = this.function( ... this.args ) ; }
	}
	catch ( error ) {
		this.hasThrown = true ;
		this.error = error ;
	}
}



function inspectVar( variable ) {
	if ( typeof variable === 'function' ) {
		return ( variable.name || '(anonymous)' ) + "()" ;
	}

	if ( variable instanceof RegExp ) {
		return variable.toString() ;
	}

	if ( variable instanceof Error ) {
		return '' + variable ;
	}

	if ( variable instanceof FunctionCall ) {
		let str = ( variable.function.name || '(anonymous)' ) ;

		if ( variable.args.length ) {
			let argStr = "( " + variable.args.map( a => inspectVar( a ) ).join( ', ' ) + " )" ;

			if ( argStr.length > inspectOptions.maxLength ) {
				argStr = argStr.slice( 0 , inspectOptions.maxLength - 1 ) + '…' ;
			}

			str += argStr ;
		}
		else {
			str += "()" ;
		}

		if ( variable.hasThrown ) {
			str += ', which has thrown ' + inspectVar( variable.error ) + ',' ;
		}

		return str ;
	}

	return inspect( inspectOptions , variable ) ;
}



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



function assertionError( from , actual , expectationType , ... expectations ) {
	var inOpt = {
		inspect: false ,
		glue: ' and ' ,
		showDiff: false
	} ;

	if ( assert[ expectationType ] ) { Object.assign( inOpt , assert[ expectationType ] ) ; }

	var message = 'Expected ' + inspectVar( actual ) + ' ' + expectationType ;

	if ( expectations.length ) {
		if ( inOpt.inspect ) {
			message += ' ' + expectations.map( e => inspectVar( e ) ).join( inOpt.glue ) ;
		}
		else {
			message += ' ' + expectations.join( inOpt.glue ) ;
		}
	}

	var outOpt = { actual , expectationType } ;

	if ( expectations.length === 1 ) {
		outOpt.expected = expectations[ 0 ] ;
		outOpt.showDiff = inOpt.showDiff ;
	}

	return new AssertionError( message , from , outOpt ) ;
}



var assert = {} ;
module.exports = assert ;



/*
	TODO:

	Expect.js:
	- length
	- withArgs (function)
	- fail useful???

	Chai:
	- any
	- all
	- ownPropertyDescriptor
	- lengthOf
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
assert.isDefined = function isDefined( from , actual ) {
	if ( actual === undefined ) {
		throw assertionError( from , actual , 'to be defined' ) ;
	}
} ;



// Undefined
assert['to be not defined'] = assert['to not be defined'] = assert['not to be defined'] =
assert['to be undefined'] =
assert.undefined =
assert.isUndefined = function isUndefined( from , actual ) {
	if ( actual !== undefined ) {
		throw assertionError( from , actual , 'to be undefined' ) ;
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
		throw assertionError( from , actual , 'to be truthy' ) ;
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
assert.isFalsy = function isFalsy( from , actual ) {
	if ( actual ) {
		throw assertionError( from , actual , 'to be falsy' ) ;
	}
} ;



// True
assert['to be true'] =
assert.true =
assert.isTrue = function isTrue( from , actual ) {
	if ( actual !== true ) {
		throw assertionError( from , actual , 'to be true' ) ;
	}
} ;



// Not true
assert['to be not true'] = assert['to not be true'] = assert['not to be true'] =
assert.notTrue =
assert.isNotTrue = function isNotTrue( from , actual ) {
	if ( actual === true ) {
		throw assertionError( from , actual , 'not to be true' ) ;
	}
} ;



// False
assert['to be false'] =
assert.false =
assert.isFalse = function isFalse( from , actual ) {
	if ( actual !== false ) {
		throw assertionError( from , actual , 'to be false' ) ;
	}
} ;



// Not false
assert['to be not false'] = assert['to not be false'] = assert['not to be false'] =
assert.notFalse =
assert.isNotFalse = function isNotFalse( from , actual ) {
	if ( actual === false ) {
		throw assertionError( from , actual , 'not to be false' ) ;
	}
} ;



// Null
assert['to be null'] =
assert.null =
assert.isNull = function isNull( from , actual ) {
	if ( actual !== null ) {
		throw assertionError( from , actual , 'to be null' ) ;
	}
} ;



// Not null
assert['to be not null'] = assert['to not be null'] = assert['not to be null'] =
assert.notNull =
assert.isNotNull = function isNotNull( from , actual ) {
	if ( actual === null ) {
		throw assertionError( from , actual , 'not to be null' ) ;
	}
} ;



// NaN
assert['to be NaN'] =
assert['to be nan'] =
assert.NaN =
assert.isNaN = function isNaN( from , actual ) {
	if ( ! Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be NaN' ) ;
	}
} ;



// Not NaN
assert['to be not NaN'] = assert['to not be NaN'] = assert['not to be NaN'] =
assert['to be not nan'] = assert['to not be nan'] = assert['not to be nan'] =
assert.notNaN =
assert.isNotNaN = function isNaN( from , actual ) {
	if ( Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'not to be NaN' ) ;
	}
} ;



assert['to be finite'] =
assert.finite = function finite( from , actual ) {
	if ( typeof actual !== 'number' ) {
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( Number.isNaN( actual ) || actual === Infinity || actual === -Infinity ) {
		throw assertionError( from , actual , 'to be finite' ) ;
	}
} ;



assert['to be not finite'] = assert['to not be finite'] = assert['not to be finite'] =
assert.notFinite = function notFinite( from , actual ) {
	if ( typeof actual !== 'number' ) {
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( ! Number.isNaN( actual ) && actual !== Infinity && actual !== -Infinity ) {
		throw assertionError( from , actual , 'to be finite' ) ;
	}
} ;



/* Equality */



// identical
assert['to be'] =
assert.strictEqual = function strictEqual( from , actual , expected ) {
	if ( actual !== expected && ! ( Number.isNaN( actual ) && Number.isNaN( expected ) ) ) {
		throw assertionError( from , actual , 'to be' , expected ) ;
	}
} ;
assert.strictEqual.showDiff = true ;
assert.strictEqual.inspect = true ;



// Not identical
assert['to be not'] = assert['to not be'] = assert['not to be'] =
assert.notStrictEqual = function notStrictEqual( from , actual , notExpected ) {
	if ( actual === notExpected || ( Number.isNaN( actual ) && Number.isNaN( notExpected ) ) ) {
		throw assertionError( from , actual , 'not to be' , notExpected ) ;
	}
} ;
assert.notStrictEqual.inspect = true ;



// Equal (different from identical)
assert['to be equal to'] =
assert['to equal'] =
assert['to eql'] =		// compatibility with expect.js
assert.equal = function equal( from , actual , expected ) {
	if ( ! isEqual( actual , expected ) ) {
		throw assertionError( from , actual , 'to equal' , expected ) ;
	}
} ;
assert.equal.showDiff = true ;
assert.equal.inspect = true ;



// Not equal
assert['to be not equal to'] = assert['to not be equal to'] = assert['not to be equal to'] =
assert['to not equal'] = assert['not to equal'] =
assert['to not eql'] = assert['not to eql'] =		// compatibility with expect.js
assert.notEqual = function notEqual( from , actual , notExpected ) {
	if ( isEqual( actual , notExpected ) ) {
		throw assertionError( from , actual , 'not to equal' , notExpected ) ;
	}
} ;
assert.notEqual.inspect = true ;



// Like
assert['to be like'] =
assert['to be alike'] =
assert['to be alike to'] =
assert.like = function like( from , actual , expected ) {
	if ( ! isEqual( actual , expected , true ) ) {
		throw assertionError( from , actual , 'to be like' , expected ) ;
	}
} ;
assert.like.showDiff = true ;
assert.like.inspect = true ;



// Not like
assert['to be not like'] = assert['to not be like'] = assert['not to be like'] =
assert['to be not alike'] = assert['to not be alike'] = assert['not to be alike'] =
assert['to be not alike to'] = assert['to not be alike to'] = assert['not to be alike to'] =
assert.notLike = function notLike( from , actual , notExpected ) {
	if ( isEqual( actual , notExpected , true ) ) {
		throw assertionError( from , actual , 'not to be like' , notExpected ) ;
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
assert.partiallyEqual = function partiallyEqual( from , actual , expected ) {
	if ( ! isEqual( expected , actual , false , true ) ) {
		throw assertionError( from , actual , 'to partially equal' , expected ) ;
	}
} ;
//assert.partiallyEqual.showDiff = true ;
assert.partiallyEqual.inspect = true ;



// Not equal to a partial object
assert['to be not partially equal to'] = assert['to not be partially equal to'] = assert['not to be partially equal to'] =
assert['to be not partial equal to'] = assert['to not be partial equal to'] = assert['not to be partial equal to'] =
assert['to be not equal to partial'] = assert['to not be equal to partial'] = assert['not to be equal to partial'] =
assert['to not partially equal'] = assert['not to partially equal'] =
assert['to not partial equal'] = assert['not to partial equal'] =
assert['to not equal partial'] = assert['not to equal partial'] =
assert.notPartialEqual =
assert.notPartiallyEqual = function notPartiallyEqual( from , actual , notExpected ) {
	if ( isEqual( notExpected , actual , false , true ) ) {
		throw assertionError( from , actual , 'not to partially equal' , notExpected ) ;
	}
} ;
assert.notPartiallyEqual.inspect = true ;



// Like partial
assert['to be partially like'] =
assert['to be like partial'] =
assert.partialLike =
assert.partiallyLike = function partiallyLike( from , actual , expected ) {
	if ( ! isEqual( expected , actual , true , true ) ) {
		throw assertionError( from , actual , 'to be partially like' , expected ) ;
	}
} ;
//assert.partiallyLike.showDiff = true ;
assert.partiallyLike.inspect = true ;



// Not like partial
assert['to be not partially like'] = assert['to not be partially like'] = assert['not to be partially like'] =
assert['to be not like partial'] = assert['to not be like partial'] = assert['not to be like partial'] =
assert.notPartialLike =
assert.notPartiallyLike = function notPartiallyLike( from , actual , notExpected ) {
	if ( isEqual( notExpected , actual , true , true ) ) {
		throw assertionError( from , actual , 'not to be partially like' , notExpected ) ;
	}
} ;
assert.notPartiallyLike.inspect = true ;



/* Numbers / Date */



// Epsilon aware comparison, or with a custom delta
assert['to be close to'] =
assert['to be around'] =
assert.around = function around( from , actual , value , delta ) {
	if ( typeof actual !== 'number' ) {
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( ! delta ) {
		delta = 2 * Number.EPSILON ;

		if ( value ) {
			delta = Math.pow( 2 , Math.ceil( Math.log2( Math.abs( value ) ) ) ) * delta ;
		}
	}

	if ( actual < value - delta || actual > value + delta || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be around' , value ) ;
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
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( ! delta ) {
		delta = 2 * Number.EPSILON ;

		if ( value ) {
			delta = Math.pow( 2 , Math.ceil( Math.log2( Math.abs( value ) ) ) ) * delta ;
		}
	}

	if ( ( actual >= value - delta && actual <= value + delta ) || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'not to be around' , value ) ;
	}
} ;



assert['to be above'] =
assert['to be greater'] =
assert['to be greater than'] =
assert.above =
assert.gt =
assert.greater =
assert.greaterThan = function greaterThan( from , actual , value ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual <= value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be above' , value ) ;
	}
} ;



assert['to be at least'] =
assert['to be greater than or equal to'] =
assert.least =
assert.gte =
assert.greaterThanOrEqualTo = function greaterThanOrEqualTo( from , actual , value ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual < value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be at least' , value ) ;
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
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual >= value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be below' , value ) ;
	}
} ;



assert['to be at most'] =
assert['to be lesser than or equal to'] =
assert.most =
assert.lte =
assert.lesserThanOrEqualTo = function lesserThanOrEqualTo( from , actual , value ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual > value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be at most' , value ) ;
	}
} ;



assert['to be within'] =
assert.within = function within( from , actual , lower , higher ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual < lower || actual > higher || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be within' , lower , higher ) ;
	}
} ;



assert['to be not within'] =
assert['to not be within'] =
assert['not to be within'] =
assert.notWithin = function notWithin( from , actual , lower , higher ) {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( ( actual >= lower && actual <= higher ) || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'not to be within' , lower , higher ) ;
	}
} ;



/* String */



// String regexp match
assert['to match'] =
assert.match = function match( from , actual , expected ) {
	if ( typeof actual !== 'string' ) {
		throw assertionError( from , actual , 'to be a string' ) ;
	}

	if ( ! actual.match( expected ) ) {
		throw assertionError( from , actual , 'to match' , expected ) ;
	}
} ;



// Not string regexp match
assert['to not match'] =
assert['not to match'] =
assert.notMatch = function notMatch( from , actual , notExpected ) {
	if ( typeof actual !== 'string' ) {
		throw assertionError( from , actual , 'to be a string' ) ;
	}

	if ( actual.match( notExpected ) ) {
		throw assertionError( from , actual , 'not to match' , notExpected ) ;
	}
} ;



/* Content */



assert['to have length'] =
assert['to have length of'] =
assert['to have a length of'] =
assert.lengthOf = function lengthOf( from , actual , expected ) {
	if ( typeof actual !== 'string' && ( ! actual || typeof actual !== 'object' ) ) {
		throw assertionError( from , actual , 'to have some length' ) ;
	}

	if ( actual.length !== expected ) {
		throw assertionError( from , actual , 'to have a length of' , expected ) ;
	}
} ;



assert['to have not length'] = assert['to not have length'] = assert['not to have length'] =
assert['to have length not of'] = assert['to have not length of'] = assert['to not have length of'] = assert['not to have length of'] =
assert['to have a length not of'] = assert['to have not a length of'] = assert['to not have a length of'] = assert['not to have a length of'] =
assert.notLengthOf = function notLengthOf( from , actual , notExpected ) {
	if ( typeof actual !== 'string' && ( ! actual || typeof actual !== 'object' ) ) {
		throw assertionError( from , actual , 'to have some length' ) ;
	}

	if ( actual.length === notExpected ) {
		throw assertionError( from , actual , 'not to have a length of' , notExpected ) ;
	}
} ;



assert['to contain'] =
assert['to have'] =
assert['to include'] =
assert.has =
assert.include =
assert.contain = function contain( from , actual , expected ) {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		if ( Array.isArray( actual ) ) {
			if ( actual.indexOf( expected ) !== -1 ) { has = true ; }
		}
		else if ( typeof actual.has === 'function' ) {
			if ( actual.has( expected ) ) { has = true ; }
		}
	}
	else if ( typeof actual === 'string' ) {
		if ( actual.indexOf( expected ) !== -1 ) { has = true ; }
	}

	if ( ! has ) {
		throw assertionError( from , actual , 'to contain' , expected ) ;
	}
} ;
assert.contain.inspect = true ;



assert['to contain not'] = assert['to not contain'] = assert['not to contain'] =
assert['to have not'] = assert['to not have'] = assert['not to have'] =
assert['to include not'] = assert['to not include'] = assert['not to include'] =
assert.hasNot =
assert.notInclude =
assert.notContain = function notContain( from , actual , notExpected ) {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		if ( Array.isArray( actual ) ) {
			if ( actual.indexOf( notExpected ) !== -1 ) { has = true ; }
		}
		else if ( typeof actual.has === 'function' ) {
			if ( actual.has( notExpected ) ) { has = true ; }
		}
	}
	else if ( typeof actual === 'string' ) {
		if ( actual.indexOf( notExpected ) !== -1 ) { has = true ; }
	}

	if ( has ) {
		throw assertionError( from , actual , 'not to contain' , notExpected ) ;
	}
} ;
assert.notContain.inspect = true ;



assert['to be empty'] =
assert.empty = function empty( from , actual ) {
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
		throw assertionError( from , actual , 'to be empty' ) ;
	}
} ;



assert['to be not empty'] = assert['to not be empty'] = assert['not to be empty'] =
assert.notEmpty = function notEmpty( from , actual ) {
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
		throw assertionError( from , actual , 'to be empty' ) ;
	}
} ;



/* Objects */



assert['to have key'] =
assert['to have keys'] =
assert.key =
assert.keys = function keys_( from , actual , ... keys ) {
	if ( ! typeChecker.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( ! ( key in actual ) ) {
			throw assertionError( from , actual , 'to have key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
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
assert.notKeys = function notKeys( from , actual , ... keys ) {
	if ( ! typeChecker.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( key in actual ) {
			throw assertionError( from , actual , 'not to have key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.notKeys.inspect = true ;
assert.notKeys.glue = ', ' ;



assert['to have own key'] =
assert['to have own keys'] =
assert.ownKey =
assert.ownKeys = function ownKeys( from , actual , ... keys ) {
	if ( ! typeChecker.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( ! actual.hasOwnProperty( key ) ) {
			throw assertionError( from , actual , 'to have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.ownKeys.inspect = true ;
assert.ownKeys.glue = ', ' ;



assert['to only have own key'] = assert['to have only own key'] = assert['to have own only key'] =
assert['to only have own keys'] = assert['to have only own keys'] = assert['to have own only keys'] =
assert.onlyOwnKey =
assert.onlyOwnKeys = function ownKeys( from , actual , ... keys ) {
	if ( ! typeChecker.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	// First, check if the number of keys match
	if ( Object.keys( actual ).length !== keys.length ) {
		throw assertionError( from , actual , 'to only have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
	}

	// Then, each expected keys should be present
	keys.forEach( key => {
		if ( ! actual.hasOwnProperty( key ) ) {
			throw assertionError( from , actual , 'to only have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
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
assert.notOwnKeys = function notKeys( from , actual , ... keys ) {
	if ( ! typeChecker.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( actual.hasOwnProperty( key ) ) {
			throw assertionError( from , actual , 'not to have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.notOwnKeys.inspect = true ;
assert.notOwnKeys.glue = ', ' ;



assert['to have property'] =
assert.property = function property( from , actual , key , value ) {
	assert.key( from , actual , key ) ;

	if ( arguments.length >= 4 ) {
		assert.equal( from , actual[ key ] , value ) ;
	}
} ;



assert['to have not property'] = assert['to not have property'] = assert['not to have property'] =
assert['to have no property'] =
assert.notProperty = function notProperty( from , actual , key , value ) {
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
assert.ownProperty = function ownProperty( from , actual , key , value ) {
	assert.ownKey( from , actual , key ) ;

	if ( arguments.length >= 4 ) {
		assert.equal( from , actual[ key ] , value ) ;
	}
} ;



assert['to have not own property'] = assert['to not have own property'] = assert['not to have own property'] =
assert['to have no own property'] =
assert.notOwnProperty = function notOwnProperty( from , actual , key , value ) {
	if ( arguments.length >= 4 ) {
		if ( actual.hasOwnProperty( key ) ) {
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
assert.throw = function throw_( from , fn , fnThisAndArgs , expectedErrorInstance , expectedPartialError ) {
	if ( typeof fn !== 'function' ) {
		throw assertionError( from , fn , 'to be a function' ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , ... fnThisAndArgs ) ;

	if ( expectedErrorInstance ) {
		if ( ! call.hasThrown || ! ( call.error instanceof expectedErrorInstance ) ) {
			let article = vowel[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , call , 'to throw ' + article , expectedErrorInstance ) ;
		}

		if ( expectedPartialError && ! isEqual( expectedPartialError , call.error , true , true ) ) {
			let article = vowel[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , call , 'to throw ' + article , expectedErrorInstance , expectedPartialError ) ;
		}
	}
	else if ( ! call.hasThrown ) {
		throw assertionError( from , call , 'to throw' ) ;
	}
} ;
assert.throw.extra = true ;
assert.throw.inspect = true ;
assert.throw.glue = ' having ' ;



assert['to not throw'] = assert['not to throw'] =
assert['to throw not a'] = assert['to not throw a'] = assert['not to throw a'] =
assert['to throw not an'] = assert['to not throw an'] = assert['not to throw an'] =
assert.notThrow = function notThrow( from , fn , fnThisAndArgs , notExpectedErrorInstance , notExpectedPartialError ) {
	if ( typeof fn !== 'function' ) {
		throw assertionError( from , fn , 'to be a function' ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , ... fnThisAndArgs ) ;

	if ( notExpectedErrorInstance ) {
		if ( call.hasThrown && call.error instanceof notExpectedErrorInstance ) {
			if ( notExpectedPartialError ) {
				if ( isEqual( notExpectedPartialError , call.error , true , true ) ) {
					let article = vowel[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
					throw assertionError( from , call , 'not to throw ' + article , notExpectedErrorInstance , notExpectedPartialError ) ;
				}
			}
			else {
				let article = vowel[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
				throw assertionError( from , call , 'not to throw ' + article , notExpectedErrorInstance ) ;
			}
		}
	}
	else if ( call.hasThrown ) {
		throw assertionError( from , call , 'not to throw' ) ;
	}
} ;
assert.notThrow.extra = true ;
assert.notThrow.inspect = true ;
assert.notThrow.glue = ' having ' ;



/* Types / Instances */



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
assert.notTypeOrInstanceOf = function notTypeOrInstanceOf( from , actual , notExpected ) {
	if ( typeof notExpected === 'string' ) {
		return assert.notTypeOf( from , actual , notExpected ) ;
	}

	return assert.notInstanceOf( from , actual , notExpected ) ;
} ;



// Type
assert['to be of type'] =
assert.typeOf = function typeOf( from , actual , expected ) {
	if ( ! typeChecker[ expected ] ) {
		throw new Error( "Unknown type '" + expected + "'." ) ;
	}

	if ( ! typeChecker[ expected ]( actual ) ) {
		let article = vowel[ expected[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
		throw assertionError( from , actual , 'to be ' + article , expected ) ;
	}
} ;



// Not type
assert['to be not of type'] =
assert['to not be of type'] =
assert['not to be of type'] =
assert.notTypeOf = function notTypeOf( from , actual , notExpected ) {
	if ( ! typeChecker[ notExpected ] ) {
		throw new Error( "Unknown type '" + notExpected + "'." ) ;
	}

	if ( typeChecker[ notExpected ]( actual ) ) {
		let article = vowel[ notExpected[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
		throw assertionError( from , actual , 'not to be ' + article , notExpected ) ;
	}
} ;



// Instance
assert['to be an instance of'] =
assert.instanceOf = function instanceOf( from , actual , expected ) {
	if ( ! ( actual instanceof expected ) ) {
		throw assertionError( from , actual , 'to be an instance of' , expected ) ;
	}
} ;
assert.instanceOf.inspect = true ;



// Not instance
assert['to be not an instance of'] =
assert['to not be an instance of'] =
assert['not to be an instance of'] =
assert.notInstanceOf = function notInstanceOf( from , actual , notExpected ) {
	if ( actual instanceof notExpected ) {
		throw assertionError( from , actual , 'not to be an instance of' , notExpected ) ;
	}
} ;
assert.notInstanceOf.inspect = true ;

