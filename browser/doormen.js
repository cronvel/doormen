(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.doormen = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



// Load doormen.js, export it, and set isBrowser to true
module.exports = require( './doormen.js' ) ;
module.exports.isBrowser = true ;

},{"./doormen.js":2}],2:[function(require,module,exports){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



function doormen( data , schema , options )
{
	// Schema as a sentence
	if ( typeof schema === 'string' ) { schema = doormen.sentence( schema ) ; }
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new TypeError( 'Bad schema, it should be an object!' ) ;
	}
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var context = {
		validate: true ,
		errors: [] ,
		check: check ,
		validatorError: validatorError ,
		report: !! options.report,
		export: !! options.export
	} ;
	
	var sanitized = context.check( data , schema , {
		path: data === null ? 'null' : ( Array.isArray( data ) ? 'array' : typeof data ) ,
		key: ''
	} ) ;
	
	if ( context.report )
	{
		return {
			validate: context.validate ,
			sanitized: sanitized ,
			errors: context.errors
		} ;
	}
	else
	{
		return sanitized ;
	}
}

module.exports = doormen ;



doormen.isBrowser = false ;



// Shorthand
doormen.report = function report( data , schema ) { return doormen( data , schema , { report: true } ) ; } ;
doormen.export = function export_( data , schema ) { return doormen( data , schema , { export: true } ) ; } ;



// Submodules
doormen.isEqual = require( './isEqual.js' ) ;
doormen.typeChecker = require( './typeChecker.js' ) ;
doormen.sanitizer = require( './sanitizer.js' ) ;
doormen.filter = require( './filter.js' ) ;
doormen.keywords = require( './keywords.js' ) ;
doormen.sentence = require( './sentence.js' ) ;
//doormen.expect = require( './expect.js' ) ;



doormen.topLevelFilters = [ 'instanceOf' , 'min' , 'max' , 'length' , 'minLength' , 'maxLength' , 'match' , 'in' , 'notIn' ] ;



function check( data_ , schema , element )
{
	var i , key , sanitizerList , hashmap , data = data_ , src ;
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( element.path + " is not a schema (not an object)." ) ;
	}
	
	// 1) if the data has a default value or is optional, and it's value is null or undefined, it's ok!
	if ( ( data === null || data === undefined ) )
	{
		if ( 'default' in schema ) { return schema.default ; }
		if ( schema.optional ) { return data ; }
	}
	
	// 2) apply available sanitizers before anything else
	if ( schema.sanitize )
	{
		sanitizerList = Array.isArray( schema.sanitize ) ? schema.sanitize : [ schema.sanitize ] ;
		
		for ( i = 0 ; i < sanitizerList.length ; i ++ )
		{
			if ( ! doormen.sanitizer[ sanitizerList[ i ] ] )
			{
				throw new doormen.SchemaError( "Bad schema (at " + element.path + "), unexistant sanitizer '" + sanitizerList[ i ] + "'." ) ;
			}
			
			data = doormen.sanitizer[ sanitizerList[ i ] ].call( this , data , schema , this.export && data === data_ ) ;
		}
	}
	
	// 3) check the type
	if ( schema.type )
	{
		if ( ! doormen.typeChecker[ schema.type ] )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), unexistant type '" + schema.type + "'." ) ;
		}
		
		if ( ! doormen.typeChecker[ schema.type ].call( this , data ) )
		{
			this.validatorError( element.path + " is not a " + schema.type + "." , element ) ;
		}
	}
	
	// 4) check top-level built-in filters
	for ( i = 0 ; i < doormen.topLevelFilters.length ; i ++ )
	{
		key = doormen.topLevelFilters[ i ] ;
		
		if ( schema[ key ] !== undefined )
		{
			doormen.filter[ key ].call( this , data , schema[ key ] , element ) ;
		}
	}
	
	// 5) check filters
	if ( schema.filter )
	{
		if ( typeof schema.filter !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'filter' should be an object." ) ;
		}
		
		for ( key in schema.filter )
		{
			if ( ! doormen.filter[ key ] )
			{
				throw new doormen.SchemaError( "Bad schema (at " + element.path + "), unexistant filter '" + key + "'." ) ;
			}
			
			doormen.filter[ key ].call( this , data , schema.filter[ key ] , element ) ;
		}
	}
	
	
	// 6) Recursivity
	
	if ( schema.of !== undefined )
	{
		if ( ! schema.of || typeof schema.of !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'of' should contains a schema object." ) ;
		}
		
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) )
		{
			this.validatorError( element.path + " can't have elements (not an array, nor an object, nor a function)." , element ) ;
		}
		
		if ( Array.isArray( data ) )
		{
			if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }
			
			for ( i = 0 ; i < src.length ; i ++ )
			{
				data[ i ] = this.check( src[ i ] , schema.of , { path: element.path + '#' + i , key: i } ) ;
			}
		}
		else
		{
			if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }
			
			for ( key in src )
			{
				data[ key ] = this.check( src[ key ] , schema.of , { path: element.path + '.' + key , key: key } ) ;
			}
		}
	}
	
	if ( schema.properties !== undefined )
	{
		if ( ! schema.properties || typeof schema.properties !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'properties' should be an object." ) ;
		}
		
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) )
		{
			this.validatorError( element.path + " can't have properties (not an object nor a function)." , element ) ;
		}
		
		if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }
		
		if ( Array.isArray( schema.properties ) )
		{
			hashmap = {} ;
			
			for ( i = 0 ; i < schema.properties.length ; i ++ )
			{
				key = schema.properties[ i ] ;
				
				if ( ! ( key in src ) )
				{
					this.validatorError( element.path + " does not have all required properties (" +
						JSON.stringify( schema.properties ) + ")." ,
						element ) ;
				}
				
				data[ key ] = src[ key ] ;
				
				hashmap[ key ] = true ;
			}
		}
		else
		{
			for ( key in schema.properties )
			{
				data[ key ] = this.check( src[ key ] , schema.properties[ key ] , {
					path: element.path + '.' + key ,
					key: key
				} ) ;
			}
			
			hashmap = schema.properties ;
		}
		
		if ( ! schema.extraProperties )
		{
			for ( key in src )
			{
				if ( ! ( key in hashmap ) )
				{
					this.validatorError( element.path + " has extra properties (" +
						JSON.stringify( Object.keys( hashmap ) ) + ")." ,
						element ) ;
				}
			}
		}
	}
	
	if ( schema.elements !== undefined )
	{
		if ( ! Array.isArray( schema.elements ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'elements' should be an array." ) ;
		}
		
		if ( ! Array.isArray( data ) )
		{
			this.validatorError( element.path + " can't have elements (not an array)." , element ) ;
		}
		
		if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
		else { src = data ; }
		
		for ( i = 0 ; i < schema.elements.length ; i ++ )
		{
			data[ i ] = this.check( src[ i ] , schema.elements[ i ] , {
				path: element.path + '#' + i ,
				key: i
			} ) ;
		}
		
		if ( ! schema.extraElements && src.length > schema.elements.length )
		{
			this.validatorError( element.path + " has extra elements (" +
				src.length + " instead of " + schema.elements.length + ")." ,
				element ) ;
		}
	}
	
	return data ;
}



			/* Specific Error class */



function validatorError( message , element )
{
	var error = new doormen.ValidatorError( message , element ) ;
	
	this.validate = false ;
	
	if ( this.report )
	{
		this.errors.push( error ) ;
	}
	else
	{
		throw error ;
	}
}

doormen.ValidatorError = function ValidatorError( message , element )
{
	this.message = message ;
	if ( element ) { this.path = element.path ; }
	this.stack = Error().stack ;
} ;

doormen.ValidatorError.prototype = Object.create( TypeError.prototype ) ;
doormen.ValidatorError.prototype.constructor = doormen.ValidatorError ;
doormen.ValidatorError.prototype.name = 'ValidatorError' ;



doormen.SchemaError = function SchemaError( message )
{
	this.message = message ;
	this.stack = Error().stack ;
} ;

doormen.SchemaError.prototype = Object.create( TypeError.prototype ) ;
doormen.SchemaError.prototype.constructor = doormen.SchemaError ;
doormen.SchemaError.prototype.name = 'SchemaError' ;





			/* Assertion specific utilities */



doormen.shouldThrow = function shouldThrow( fn )
{
	var thrown = false ;
	
	try { fn() ; }
	catch ( error ) { thrown = true ; }
	
	if ( ! thrown )
	{
		throw new Error( "Function '" + ( fn.name || '(anonymous)' ) + "' should had thrown." ) ;
	}
} ;



// Inverse validation
doormen.not = function not( data , schema , options )
{
	doormen.shouldThrow( function() {
		doormen( data , schema , options ) ;
	} ) ;
} ;



doormen.equals = function equals( left , right )
{
	if ( ! doormen.isEqual( left , right ) ) { throw new doormen.ValidatorError( 'should had been equal' ) ; }
} ;

// Inverse of equals
doormen.not.equals = function notEquals( left , right )
{
	if ( doormen.isEqual( left , right ) ) { throw new doormen.ValidatorError( 'should not had been equal' ) ; }
} ;



},{"./filter.js":3,"./isEqual.js":4,"./keywords.js":5,"./sanitizer.js":6,"./sentence.js":7,"./typeChecker.js":8}],3:[function(require,module,exports){
(function (global){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



// Load modules
var doormen = require( './doormen.js' ) ;



var filter = {} ;
module.exports = filter ;



filter.instanceOf = function instanceOf( data , params , element )
{
	if ( typeof params === 'string' ) { params = global[ params ] ; }
	
	if ( typeof params !== 'function' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'instanceOf' should be a function." ) ;
	}
	
	if ( ! ( data instanceof params ) )
	{
		this.validatorError( element.path + " is not an instance of " + params + "." , element ) ;
	}
} ;



filter.min = filter.gte = filter.greaterThanOrEqual = filter[ '>=' ] = function min( data , params , element )
{
	if ( typeof params !== 'number' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'min' should be a number." ) ;
	}
	
	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data >= params ) )	// jshint ignore:line
	{
		this.validatorError( element.path + " is not greater than or equal to " + params + "." , element ) ;
	}
} ;



filter.max = filter.lte = filter.lesserThanOrEqual = filter[ '<=' ] = function max( data , params , element )
{
	if ( typeof params !== 'number' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'max' should be a number." ) ;
	}
	
	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data <= params ) )	// jshint ignore:line
	{
		this.validatorError( element.path + " is not lesser than or equal to " + params + "." , element ) ;
	}
} ;



filter.gt = filter.greaterThan = filter[ '>' ] = function greaterThan( data , params , element )
{
	if ( typeof params !== 'number' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'greaterThan' should be a number." ) ;
	}
	
	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data > params ) )	// jshint ignore:line
	{
		this.validatorError( element.path + " is not greater than " + params + "." , element ) ;
	}
} ;



filter.lt = filter.lesserThan = filter[ '<' ] = function lesserThan( data , params , element )
{
	if ( typeof params !== 'number' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'lesserThan' should be a number." ) ;
	}
	
	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data < params ) )	// jshint ignore:line
	{
		this.validatorError( element.path + " is not lesser than " + params + "." , element ) ;
	}
} ;



filter.length = function length( data , params , element )
{
	if ( typeof params !== 'number' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'length' should be a number." ) ;
	}
	
	// Nasty tricks ;)
	try {
		if ( ! ( data.length === params ) ) { throw true ; }	// jshint ignore:line
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length greater than or equal to " + params + "." , element ) ;
	}
} ;



filter.minLength = function minLength( data , params , element )
{
	if ( typeof params !== 'number' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'minLength' should be a number." ) ;
	}
	
	// Nasty tricks ;)
	try {
		if ( ! ( data.length >= params ) ) { throw true ; }	// jshint ignore:line
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length greater than or equal to " + params + "." , element ) ;
	}
} ;



filter.maxLength = function maxLength( data , params , element )
{
	if ( typeof params !== 'number' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'maxLength' should be a number." ) ;
	}
	
	// Nasty tricks ;)
	try {
		if ( ! ( data.length <= params ) ) { throw true ; }	// jshint ignore:line
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length lesser than or equal to " + params + "." , element ) ;
	}
} ;



filter.match = function match( data , params , element )
{
	if ( typeof params !== 'string' && ! ( params instanceof RegExp ) )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'match' should be a RegExp or a string." ) ;
	}
	
	if ( params instanceof RegExp )
	{
		if ( typeof data !== 'string' || ! data.match( params ) )
		{
			this.validatorError( element.path + " does not match " + params + " ." , element ) ;
		}
	}
	else
	{
		if ( typeof data !== 'string' || ! data.match( new RegExp( params ) ) )
		{
			this.validatorError( element.path + " does not match /" + params + "/ ." , element ) ;
		}
	}
} ;



filter.in = function in_( data , params , element )
{
	var i , found = false ;
	
	if ( ! Array.isArray( params ) )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'in' should be an array." ) ;
	}
	
	for ( i = 0 ; i < params.length ; i ++ )
	{
		if ( doormen.isEqual( data , params[ i ] ) ) { found = true ; break ; }
	}
	
	if ( ! found )
	{
		this.validatorError( element.path + " should be in " + JSON.stringify( params ) + "." , element ) ;
	}
} ;



filter.notIn = function notIn( data , params , element )
{
	var i ;
	
	if ( ! Array.isArray( params ) )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'not-in' should be an array." ) ;
	}
	
	for ( i = 0 ; i < params.length ; i ++ )
	{
		if ( doormen.isEqual( data , params[ i ] ) )
		{
			this.validatorError( element.path + " should not be in " + JSON.stringify( params ) + "." , element ) ;
		}
	}
} ;




}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./doormen.js":2}],4:[function(require,module,exports){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



function isEqual( left , right , extra )
{
	var index , key , leftIndexOf , rightIndexOf , r ;
	
	if ( ! extra )
	{
		extra = {
			leftStack: [],
			rightStack: []
		} ;
	}
	
	// If it's strictly equals, then early exit now.
	if ( left === right ) { return true ; }
	
	// If the type mismatch exit now.
	if ( typeof left !== typeof right ) { return false ; }
	
	// Below, left and rights have the same type
	
	// NaN check
	if ( typeof left === 'number' && isNaN( left ) && isNaN( right ) ) { return true ; }
	
	// Should come after the NaN check
	if ( ! left ) { return false ; }
	
	// Objects and arrays
	if ( typeof left === 'object' )
	{
		// First, check circular references
		leftIndexOf = extra.leftStack.indexOf( left ) ;
		rightIndexOf = extra.rightStack.indexOf( right ) ;
		
		if ( leftIndexOf >= 0 ) { extra.leftCircular = true ; }
		if ( rightIndexOf >= 0 ) { extra.rightCircular = true ; }
		
		if ( extra.leftCircular && extra.rightCircular ) { return true ; }
		
		if ( Array.isArray( left ) )
		{
			// Arrays
			if ( ! Array.isArray( right ) || left.length !== right.length ) { return false ; }
			
			for ( index = 0 ; index < left.length ; index ++ )
			{
				if ( left[ index ] === right[ index ] ) { continue ; }
				
				extra.leftStack.push( left ) ;
				extra.rightStack.push( right ) ;
				
				r = isEqual( left[ index ] , right[ index ] , {
					leftStack: extra.leftStack,
					rightStack: extra.rightStack,
					leftCircular: extra.leftCircular,
					rightCircular: extra.rightCircular
				} ) ;
				
				if ( ! r ) { return false ; }
				
				extra.leftStack.pop() ;
				extra.rightStack.pop() ;
			}
		}
		else
		{
			// Objects
			if ( Array.isArray( right ) ) { return false ; }
			
			for ( key in left )
			{
				if ( left[ key ] === undefined ) { continue ; }	// undefined and no key are the same
				if ( right[ key ] === undefined ) { return false ; }
				if ( left[ key ] === right[ key ] ) { continue ; }
				
				extra.leftStack.push( left ) ;
				extra.rightStack.push( right ) ;
				
				r = isEqual( left[ key ] , right[ key ] , {
					leftStack: extra.leftStack,
					rightStack: extra.rightStack,
					leftCircular: extra.leftCircular,
					rightCircular: extra.rightCircular
				} ) ;
				
				if ( ! r ) { return false ; }
				
				extra.leftStack.pop() ;
				extra.rightStack.pop() ;
			}
			
			for ( key in right )
			{
				if ( right[ key ] === undefined ) { continue ; }	// undefined and no key are the same
				if ( left[ key ] === undefined ) { return false ; }
				// No need to check equality: already done in the previous loop
			}
		}
		
		return true ;
	}
	
	return false ;
}



module.exports = isEqual ;




},{}],5:[function(require,module,exports){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



module.exports = {
	it: { filler: true },
	its: { filler: true },
	a: { filler: true },
	an: { filler: true },
	the: { filler: true },
	to: { filler: true },
	that: { filler: true },
	has: { filler: true },
	have: { filler: true },
	having: { filler: true },
	at: { filler: true },
	with: { filler: true },
	than: { filler: true },
	or: { filler: true },
	equal: { filler: true },
	":": { filler: true },
	should: { reset: true },
	expect: { reset: true },
	expected: { reset: true },
	be: { expected: 'typeOrClass' },
	is: { expected: 'typeOrClass' },
	instance: { expected: 'class', override: { of: { filler: true } } },
	type: { expected: 'type', override: { of: { filler: true } } },
	optional: { flag: true },
	empty: { set: { length: 0 } },
	after: { expected: 'sanitizer' },
	sanitize: { expected: 'sanitizer' },
	sanitizer: { expected: 'sanitizer' },
	sanitizers: { expected: 'sanitizer' },
	sanitizing: { expected: 'sanitizer' },
	least: { expected: 'minValue' },
	greater: { expected: 'minValue' , needKeyword: 'equal' },
	">=": { expected: 'minValue' },
	gte: { expected: 'minValue' },
	most: { expected: 'maxValue' },
	"<=": { expected: 'maxValue' },
	lte: { expected: 'maxValue' },
	lower: { expected: 'maxValue' , needKeyword: 'equal' },
	lesser: { expected: 'maxValue' , needKeyword: 'equal' },
	between: { expected: [ 'minValue', 'maxValue' ] },
	within: { expected: [ 'minValue', 'maxValue' ] },
	and: { next: true, restoreOverride: true, restoreExpected: true },
	',': { next: true, restoreOverride: true, restoreExpected: true },
	';': { reset: true },
	'.': { reset: true },
	length: { expected: 'lengthValue' , override: {
		of: { filler: true },
		least: { expected: 'minLengthValue' },
		most: { expected: 'maxLengthValue' },
		between: { expected: [ 'minLengthValue' , 'maxLengthValue' ] },
	} },
	letter: { minMaxAreLength: true },
	letters: { minMaxAreLength: true },
	char: { minMaxAreLength: true },
	chars: { minMaxAreLength: true },
	character: { minMaxAreLength: true },
	characters: { minMaxAreLength: true },
	of: { expected: 'typeOrClass' , toChild: 'of' },
} ;

},{}],6:[function(require,module,exports){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



// Load modules
var doormen = require( './doormen.js' ) ;



var sanitizer = {} ;
module.exports = sanitizer ;



			/* Cast sanitizers */



sanitizer.toNumber = function toNumber( data )
{
	if ( typeof data === 'number' ) { return data ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return parseFloat( data ) ; }
	else { return NaN ; }
} ;



sanitizer.toArray = function toArray( data )
{
	if ( Array.isArray( data ) ) { return data ; }
	
	if ( data && typeof data === 'object' )
	{
		if ( doormen.typeChecker.arguments( data ) ) { return Array.prototype.slice.call( data ) ; }
	}
	
	return [ data ] ;
} ;



			/* Object sanitizers */



sanitizer.removeExtraProperties = function( data , schema , clone )
{
	var i , key , newData ;
	
	if (
		! data || ( typeof data !== 'object' && typeof data !== 'function' ) ||
		! schema.properties || typeof schema.properties !== 'object'
	)
	{
		return data ;
	}
	
	if ( clone )
	{
		newData = Array.isArray( data ) ? data.slice() : {} ;
		
		if ( Array.isArray( schema.properties ) )
		{
			for ( i = 0 ; i < schema.properties.length ; i ++ )
			{
				key = schema.properties[ i ] ;
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}
		else
		{
			for ( key in schema.properties )
			{
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}
		
		return newData ;
	}
	else
	{
		if ( Array.isArray( schema.properties ) )
		{
			for ( key in data )
			{
				if ( schema.properties.indexOf( key ) === -1 ) { delete data[ key ] ; }
			}
		}
		else
		{
			for ( key in data )
			{
				if ( ! ( key in schema.properties ) ) { delete data[ key ] ; }
			}
		}
		
		return data ;
	}
} ;



			/* String sanitizers */



sanitizer.trim = function trim( data )
{
	if ( typeof data === 'string' ) { return data.trim() ; }
	else { return data ; }
} ;



sanitizer.toUpperCase = function toUpperCase( data )
{
	if ( typeof data === 'string' ) { return data.toUpperCase() ; }
	else { return data ; }
} ;



sanitizer.toLowerCase = function toLowerCase( data )
{
	if ( typeof data === 'string' ) { return data.toLowerCase() ; }
	else { return data ; }
} ;



sanitizer.dashToCamelCase = function dashToCamelCase( data )
{
	if ( typeof data !== 'string' ) { return data ; }
	
	return data.replace( /-(.)/g , function( match , letter ) {
		return letter.toUpperCase();
	} ) ;
} ;



},{"./doormen.js":2}],7:[function(require,module,exports){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



var doormen = require( './doormen.js' ) ;



function sentence( str )
{
	var i , word , wordList , expected , lastExpected , schema , pointer , stack , nextActions ,
		keywordsOverride , noOverride , lastOverride ,
		needKeyword , needKeywordFor ;
	
	wordList = str.split( / +|(?=[,;.:])/ ) ;
	//console.log( wordList ) ;
	
	schema = {} ;
	pointer = schema ;
	stack = [ schema ] ;
	
	nextActions = [] ;
	noOverride = {} ;
	keywordsOverride = lastOverride = noOverride ;
	
	lastExpected = null ;
	expected = [ 'typeOrClass' ] ;
	
	needKeyword = null ;
	needKeywordFor = null ;
	
	
	
	var applyAction = function applyAction( action , word ) {
	
		var key ;
		
		if ( action.reset )
		{
			nextActions = [] ;
			keywordsOverride = lastOverride = noOverride ;
			lastExpected = null ;
			expected = [ 'typeOrClass' ] ;
			needKeyword = null ;
			needKeywordFor = null ;
		}
		
		if ( action.toChild )
		{
			pointer[ action.toChild ] = {} ;
			stack.push( pointer[ action.toChild ] ) ;
			pointer = pointer[ action.toChild ] ;
		}
		
		if ( action.expected )
		{
			expected = Array.isArray( action.expected ) ? action.expected.slice() : [ action.expected ] ;
			needKeyword = null ;
		}
		
		if ( action.needKeyword ) { needKeyword = action.needKeyword ; needKeywordFor = word ; }
		else if ( needKeyword && needKeyword === word ) { needKeyword = null ; needKeywordFor = null ; }
		
		if ( action.set )
		{
			for ( key in action.set ) { pointer[ key ] = action.set[ key ] ; }
		}
		
		if ( action.flag ) { pointer[ action.flag ] = true ; }
		
		if ( action.override ) { keywordsOverride = action.override ; }
		
		if ( action.restoreOverride ) { keywordsOverride = lastOverride ; }
		
		if ( action.restoreExpected && ! expected.length ) { expected.unshift( lastExpected ) ; }
		
		if ( action.nextActions ) { nextActions = action.nextActions.slice() ; }
		
		if ( action.minMaxAreLength )
		{
			if ( 'min' in pointer ) { pointer.minLength = pointer.min ; delete pointer.min ; }
			if ( 'max' in pointer ) { pointer.maxLength = pointer.max ; delete pointer.max ; }
		}
		
		if ( action.next && nextActions.length ) { applyAction( nextActions.shift() ) ; }
	} ;
	
	
	
	for ( i = 0 ; i < wordList.length ; i ++ )
	{
		word = wordList[ i ] ;
		//console.log( 'word:' , word , '- expected:' , expected ) ;
		
		if ( keywordsOverride[ word ] || doormen.keywords[ word ] )
		{
			applyAction( keywordsOverride[ word ] || doormen.keywords[ word ] , word ) ;
		}
		else if ( ! expected.length )
		{
			throw new Error(
				"Can't understand the word #" + i + " '" + word + "'" +
				( i > 0 ? ", just after '" + wordList[ i - 1 ] + "'" : '' ) +
				", in the sentence '" + str + "'."
			) ;
		}
		else if ( needKeyword )
		{
			throw new Error(
				"Keyword '" + needKeyword + "' is required after keyword '" + needKeywordFor + "'" +
				", in the sentence '" + str + "'."
			) ;
		}
		else
		{
			word = doormen.sanitizer.dashToCamelCase( word ) ;
			
			switch ( expected[ 0 ] )
			{
				case 'type' :
					pointer.type = word ;
					break ;
				case 'class' :
					pointer.instanceOf = word ;
					break ;
				case 'typeOrClass' :
					if ( word[ 0 ].toLowerCase() === word[ 0 ] ) { pointer.type = word ; }
					else { pointer.instanceOf = word ; }
					break ;
				case 'sanitizer' :
					if ( ! pointer.sanitize ) { pointer.sanitize = [] ; }
					pointer.sanitize.push( word ) ;
					break ;
				case 'minValue' :
					pointer.min = parseInt( word , 10 ) ;
					break ;
				case 'maxValue' :
					pointer.max = parseInt( word , 10 ) ;
					break ;
				case 'lengthValue' :
					pointer.length = parseInt( word , 10 ) ;
					break ;
				case 'minLengthValue' :
					pointer.minLength = parseInt( word , 10 ) ;
					break ;
				case 'maxLengthValue' :
					pointer.maxLength = parseInt( word , 10 ) ;
					break ;
				/*
				case 'matchValue' :
				case 'inValues' :
				case 'notInValues' :
				case 'properties' :
				case 'elements' :
					break ;
				case 'default' :
					pointer.default = 
					expected = null ;
					break ;
				*/
			}
			
			lastExpected = expected.shift() ;
			//expected = null ;
			
			if ( ! nextActions.length )
			{
				if ( keywordsOverride !== noOverride )
				{
					lastOverride = keywordsOverride ;
					keywordsOverride = noOverride ;
				}
				else
				{
					lastOverride = noOverride ;
				}
			}
		}
	}
	
	return schema ;
}



module.exports = sentence ;



},{"./doormen.js":2}],8:[function(require,module,exports){
(function (Buffer){
/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



// Load modules
//var doormen = require( './doormen.js' ) ;



// Basic types
var check = {
	// Primitive types
	"undefined": function( data ) { return data === undefined ; } ,
	"null": function( data ) { return data === null ; } ,
	"boolean": function( data ) { return typeof data === 'boolean' ; } ,
	"number": function( data ) { return typeof data === 'number' ; } ,
	"string": function( data ) { return typeof data === 'string' ; } ,
	"object": function( data ) { return data && typeof data === 'object' ; } ,
	"function": function( data ) { return typeof data === 'function' ; } ,
	
	// Built-in type
	array: function( data ) { return Array.isArray( data ) ; } ,
	error: function( data ) { return data instanceof Error ; } ,
	date: function( data ) { return data instanceof Date ; } ,
	regexp: function( data ) { return data instanceof RegExp ; } ,
	"arguments": function( data ) { return Object.prototype.toString.call( data ) === '[object Arguments]' ; } ,
	
	buffer: function( data )
	{
		try {
			// If we run in a browser, this does not exist
			return data instanceof Buffer ;
		}
		catch ( error ) {
			return false ;
		}
	}
} ;

module.exports = check ;



// Meta type of numbers
check.real = function checkReal( data ) { return typeof data === 'number' && ! isNaN( data ) && isFinite( data ) ; } ;
check.integer = function checkInteger( data ) { return typeof data === 'number' && isFinite( data ) && data === Math.round( data ) ; } ;





// IP
check.ip = function checkIp( data )
{
	return check.ipv4( data ) || check.ipv6( data ) ;
} ;



// IPv4
check.ipv4 = function checkIpv4( data , skipRegExp )
{
	var i , parts , tmp ;
	
	if ( typeof data !== 'string' ) { return false ; }
	
	if ( ! skipRegExp && ! /^[0-9.]+$/.test( data ) ) { return false ; }
	
	parts = data.split( '.' ) ;
	
	if ( parts.length !== 4 ) { return false ; }
	
	for ( i = 0 ; i < parts.length ; i ++ )
	{
		if ( ! parts[ i ].length || parts[ i ].length > 3 ) { return false ; }
		
		tmp = parseInt( parts[ i ] , 10 ) ;
		
		// NaN compliant check
		if ( ! ( tmp >= 0 && tmp <= 255 ) ) { return false ; }	// jshint ignore:line
	}
	
	return true ;
} ;



// IPv6
check.ipv6 = function checkIpv6( data , skipRegExp )
{
	var i , parts , hasDoubleColon = false , startWithDoubleColon = false , endWithDoubleColon = false ;
	
	if ( typeof data !== 'string' ) { return false ; }
	
	if ( ! skipRegExp && ! /^[0-9a-f:]+$/.test( data ) ) { return false ; }
	
	parts = data.split( ':' ) ;
	
	// 9 instead of 8 because of starting double-colon
	if ( parts.length > 9 && parts.length < 3 ) { return false ; }
	
	for ( i = 0 ; i < parts.length ; i ++ )
	{
		if ( ! parts[ i ].length )
		{
			if ( i === 0 )
			{
				// an IPv6 can start with a double-colon, but not with a single colon
				startWithDoubleColon = true ;
				if ( parts[ 1 ].length ) { return false ; }
			}
			else if ( i === parts.length - 1 )
			{
				// an IPv6 can end with a double-colon, but with a single colon
				endWithDoubleColon = true ;
				if ( parts[ i - 1 ].length ) { return false ; }
			}
			else
			{
				// the whole IP should have at most one double-colon, for consecutive 0 group
				if ( hasDoubleColon ) { return false ; }
				hasDoubleColon = true ;
			}
		}
		else if ( parts[ i ].length > 4 )
		{
			// a group has at most 4 letters of hexadecimal
			return false ;
		}
	}
	
	if ( parts.length < 8 && ! hasDoubleColon ) { return false ; }
	if ( parts.length - ( startWithDoubleColon ? 1 : 0 ) - ( endWithDoubleColon ? 1 : 0 ) > 8 ) { return false ; }
	
	return true ;
} ;



check.hostname = function checkHostname( data , skipRegExp )
{
	var i , parts ;
	
	if ( typeof data !== 'string' ) { return false ; }
	
	if ( ! skipRegExp && ! /^[^\s\/$?#@:]+$/.test( data ) ) { return false ; }
	
	parts = data.split( '.' ) ;
	
	for ( i = 0 ; i < parts.length ; i ++ )
	{
		// An hostname can have a '.' after the TLD, but it should not have empty part anywhere else
		if ( ! parts[ i ].length && i !== parts.length - 1 ) { return false ; }
		
		// A part cannot exceed 63 chars
		if ( parts[ i ].length > 63 ) { return false ; }
	}
	
	return true ;
} ;


// URLs
check.url = function checkUrl( data , restrictToWebUrl )
{
	if ( typeof data !== 'string' ) { return false ; }
	
	var matches = data.match( /^([a-z+.-]+):\/\/((?:([^\s@\/:]+)(?::([^\s@\/:]+))?@)?(([0-9.]+)|([0-9a-f:]+)|([^\s\/$?#@:]+))(:[0-9]+)?)?(\/[^\s]*)?$/ ) ;
	
	if ( ! matches ) { return false ; }
	
	// If we only want http, https and ftp...
	if ( restrictToWebUrl && matches[ 1 ] !== 'http' &&  matches[ 1 ] !== 'https' && matches[ 1 ] !== 'ftp' ) { return false ; }
	
	if ( ! matches[ 2 ] && matches[ 1 ] !== 'file' ) { return false ; }
	
	if ( matches[ 6 ] )
	{
		if ( ! check.ipv4( matches[ 6 ] , true ) ) { return false ; }
	}
	
	if ( matches[ 7 ] )
	{
		if ( ! check.ipv6( matches[ 7 ] , true ) ) { return false ; }
	}
	
	if ( matches[ 8 ] )
	{
		if ( ! check.hostname( matches[ 8 ] , true ) ) { return false ; }
	}
	
	return true ;
} ;

check.weburl = function checkWeburl( data ) { return check.url( data , true ) ; } ;



// Emails
check.email = function checkEmail( data )
{
	var matches , i , parts ;
	
	if ( typeof data !== 'string' ) { return false ; }
	
	if ( data.length > 254 ) { return false ; }
	
	// It only matches the most common email address
	//var matches = data.match( /^([a-z0-9._-]+)@([^\s\/$?#.][^\s\/$?#@:]+)$/ ) ;
	
	// It matches most email address, and reject really bizarre one
	matches = data.match( /^([a-zA-Z0-9._#~!$&*+=,;:\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF-]+)@([^\s\/$?#@:]+)$/ ) ;
	
	// /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
	
	if ( ! matches ) { return false ; }
	
	if ( matches[ 1 ].length > 64 ) { return false ; }
	
	parts = matches[ 1 ].split( '.' ) ;
	
	for ( i = 0 ; i < parts.length ; i ++ )
	{
		if ( ! parts[ i ].length ) { return false ; }
	}
	
	if ( ! check.hostname( matches[ 2 ] , true ) ) { return false ; }
	
	return true ;
} ;




}).call(this,require("buffer").Buffer)
},{"buffer":9}],9:[function(require,module,exports){

},{}]},{},[1])(1)
});