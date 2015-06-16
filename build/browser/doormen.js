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
		fullReport: !! options.fullReport
	} ;
	
	var sanitized = context.check( data , schema , {
		path: data === null ? 'null' : ( Array.isArray( data ) ? 'array' : typeof data ) ,
		key: ''
	} ) ;
	
	if ( context.fullReport )
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
doormen.fullReport = function fullReport( data , schema ) { return doormen( data , schema , { fullReport: true } ) ; } ;



// Submodules
doormen.isEqual = require( './isEqual.js' ) ;
doormen.typeChecker = require( './typeChecker.js' ) ;
doormen.sanitizer = require( './sanitizer.js' ) ;
doormen.filter = require( './filter.js' ) ;
doormen.sentence = require( './sentence.js' ) ;



doormen.topLevelFilters = [ 'instanceOf' , 'min' , 'max' , 'length' , 'minLength' , 'maxLength' , 'match' , 'in' , 'notIn' ] ;



function check( data , schema , element )
{
	var i , key , sanitizerList , hashmap ;
	
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
			
			data = doormen.sanitizer[ sanitizerList[ i ] ].call( this , data ) ;
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
	
	
	// 5) Recursivity
	
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
			for ( i = 0 ; i < data.length ; i ++ )
			{
				data[ i ] = this.check( data[ i ] , schema.of , {
					path: element.path + '#' + i ,
					key: i
				} ) ;
			}
		}
		else
		{
			for ( key in data )
			{
				data[ key ] = this.check( data[ key ] , schema.of , {
					path: element.path + '.' + key ,
					key: key
				} ) ;
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
		
		if ( Array.isArray( schema.properties ) )
		{
			hashmap = {} ;
			
			for ( i = 0 ; i < schema.properties.length ; i ++ )
			{
				if ( ! ( schema.properties[ i ] in data ) )
				{
					this.validatorError( element.path + " does not have all required properties (" +
						JSON.stringify( schema.properties ) + ")." ,
						element ) ;
				}
				
				hashmap[ schema.properties[ i ] ] = true ;
			}
		}
		else
		{
			for ( key in schema.properties )
			{
				data[ key ] = this.check( data[ key ] , schema.properties[ key ] , {
					path: element.path + '.' + key ,
					key: key
				} ) ;
			}
			
			hashmap = schema.properties ;
		}
		
		if ( schema.only )
		{
			for ( key in data )
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
		
		for ( i = 0 ; i < schema.elements.length ; i ++ )
		{
			data[ i ] = this.check( data[ i ] , schema.elements[ i ] , {
				path: element.path + '#' + i ,
				key: i
			} ) ;
		}
		
		if ( schema.only && data.length > schema.elements.length )
		{
			this.validatorError( element.path + " has extra elements (" +
				data.length + " instead of " + schema.elements.length + ")." ,
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
	
	if ( this.fullReport )
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



},{"./filter.js":3,"./isEqual.js":4,"./sanitizer.js":5,"./sentence.js":6,"./typeChecker.js":7}],3:[function(require,module,exports){
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



module.exports = {
	
	
	instanceOf: function instanceOf( data , params , element ) {
		
		if ( typeof params === 'string' ) { params = global[ params ] ; }
		
		if ( typeof params !== 'function' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'instanceOf' should be a function." ) ;
		}
		
		if ( ! ( data instanceof params ) )
		{
			this.validatorError( element.path + " is not an instance of " + params + "." , element ) ;
		}
	} ,
	
	min: function min( data , params , element ) {
		
		if ( typeof params !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'min' should be a number." ) ;
		}
		
		// Negative test here, because of NaN
		if ( typeof data !== 'number' || ! ( data >= params ) )	// jshint ignore:line
		{
			this.validatorError( element.path + " is not greater than or equal to " + params + "." , element ) ;
		}
	} ,
	
	max: function max( data , params , element ) {
		
		if ( typeof params !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'max' should be a number." ) ;
		}
		
		// Negative test here, because of NaN
		if ( typeof data !== 'number' || ! ( data <= params ) )	// jshint ignore:line
		{
			this.validatorError( element.path + " is not lesser than or equal to " + params + "." , element ) ;
		}
	} ,
	
	length: function length( data , params , element ) {
		
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
	} ,
	
	minLength: function minLength( data , params , element ) {
		
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
	} ,
	
	maxLength: function maxLength( data , params , element ) {
		
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
	} ,
	
	match: function match( data , params , element ) {
		
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
	} ,
	
	in: function in_( data , params , element ) {
		
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
	} ,
	
	notIn: function notIn( data , params , element ) {
		
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
	} ,
	
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
	
	toNumber: function( data ) {
		if ( typeof data === 'number' ) { return data ; }
		else if ( ! data ) { return NaN ; }
		else if ( typeof data === 'string' ) { return parseFloat( data ) ; }
		else { return NaN ; }
	} ,
	
	trim: function( data ) {
		if ( typeof data === 'string' ) { return data.trim() ; }
		else { return data ; }
	} ,
	
	toUpperCase: function( data ) {
		if ( typeof data === 'string' ) { return data.toUpperCase() ; }
		else { return data ; }
	} ,
	
	toLowerCase: function( data ) {
		if ( typeof data === 'string' ) { return data.toLowerCase() ; }
		else { return data ; }
	} ,
	
	dashToCamelCase: function( data ) {
		if ( typeof data !== 'string' ) { return data ; }
		
		return data.replace( /-(.)/g , function( match , letter ) {
			return letter.toUpperCase();
		} ) ;
	} ,
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



var doormen = require( './doormen.js' ) ;



var keyWords = {
	it: {},
	its: {},
	a: {},
	an: {},
	the: {},
	to: {},
	that: {},
	has: {},
	have: {},
	having: {},
	at: {},
	with: {},
	than: {},
	or: {},
	equal: {},
	":": {},
	should: { reset: true },
	expect: { reset: true },
	expected: { reset: true },
	be: { expected: 'typeOrClass' },
	is: { expected: 'typeOrClass' },
	instance: { expected: 'class', override: { of: {} } },
	type: { expected: 'type', override: { of: {} } },
	optional: { flag: true },
	empty: { set: { length: 0 } },
	after: { expected: 'sanitizer' },
	sanitize: { expected: 'sanitizer' },
	sanitizer: { expected: 'sanitizer' },
	sanitizers: { expected: 'sanitizer' },
	sanitizing: { expected: 'sanitizer' },
	least: { expected: 'minValue' },
	greater: { expected: 'minValue' , needKeyWord: 'equal' },
	">=": { expected: 'minValue' },
	gte: { expected: 'minValue' },
	most: { expected: 'maxValue' },
	"<=": { expected: 'maxValue' },
	lte: { expected: 'maxValue' },
	lower: { expected: 'maxValue' , needKeyWord: 'equal' },
	lesser: { expected: 'maxValue' , needKeyWord: 'equal' },
	between: { expected: 'minValue', nextActions: [ { expected: 'maxValue' } ] },
	within: { expected: 'minValue', nextActions: [ { expected: 'maxValue' } ] },
	and: { next: true, restoreOverride: true, restoreExpected: true },
	',': { next: true, restoreOverride: true, restoreExpected: true },
	';': { reset: true },
	'.': { reset: true },
	length: { expected: 'lengthValue' , override: {
		of: {},
		least: { expected: 'minLengthValue' },
		most: { expected: 'maxLengthValue' },
		between: { expected: 'minLengthValue', nextActions: [ { expected: 'maxLengthValue' } ] },
	} },
	letter: { minMaxAreLength: true },
	letters: { minMaxAreLength: true },
	char: { minMaxAreLength: true },
	chars: { minMaxAreLength: true },
	character: { minMaxAreLength: true },
	characters: { minMaxAreLength: true },
	of: { expected: 'typeOrClass' , toChild: 'of' },
} ;



function sentence( str )
{
	var i , word , wordList , expected , lastExpected , schema , pointer , stack , nextActions ,
		keyWordsOverride , noOverride , lastOverride ,
		needKeyWord , needKeyWordFor ;
	
	wordList = str.split( / +|(?=[,;.:])/ ) ;
	//console.log( wordList ) ;
	
	schema = {} ;
	pointer = schema ;
	stack = [ schema ] ;
	
	nextActions = [] ;
	noOverride = {} ;
	keyWordsOverride = lastOverride = noOverride ;
	
	lastExpected = null ;
	expected = 'typeOrClass' ;
	
	needKeyWord = null ;
	needKeyWordFor = null ;
	
	
	
	var applyAction = function applyAction( action , word ) {
	
		var key ;
		
		if ( action.reset )
		{
			nextActions = [] ;
			keyWordsOverride = lastOverride = noOverride ;
			lastExpected = null ;
			expected = 'typeOrClass' ;
			needKeyWord = null ;
			needKeyWordFor = null ;
		}
		
		if ( action.toChild )
		{
			pointer[ action.toChild ] = {} ;
			stack.push( pointer[ action.toChild ] ) ;
			pointer = pointer[ action.toChild ] ;
		}
		
		if ( action.expected )
		{
			expected = action.expected ;
			needKeyWord = null ;
		}
		
		if ( action.needKeyWord ) { needKeyWord = action.needKeyWord ; needKeyWordFor = word ; }
		else if ( needKeyWord && needKeyWord === word ) { needKeyWord = null ; needKeyWordFor = null ; }
		
		if ( action.set )
		{
			for ( key in action.set ) { pointer[ key ] = action.set[ key ] ; }
		}
		
		if ( action.flag ) { pointer[ action.flag ] = true ; }
		
		if ( action.override ) { keyWordsOverride = action.override ; }
		
		if ( action.restoreOverride ) { keyWordsOverride = lastOverride ; }
		
		if ( action.restoreExpected ) { expected = lastExpected ; }
		
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
		
		if ( keyWordsOverride[ word ] || keyWords[ word ] )
		{
			applyAction( keyWordsOverride[ word ] || keyWords[ word ] , word ) ;
		}
		else if ( ! expected )
		{
			throw new Error(
				"Can't understand the word #" + i + " '" + word + "'" +
				( i > 0 ? ", just after '" + wordList[ i - 1 ] + "'" : '' ) +
				", in the sentence '" + str + "'."
			) ;
		}
		else if ( needKeyWord )
		{
			throw new Error(
				"Keyword '" + needKeyWord + "' is required after keyword '" + needKeyWordFor + "'" +
				", in the sentence '" + str + "'."
			) ;
		}
		else
		{
			word = doormen.sanitizer.dashToCamelCase( word ) ;
			
			switch ( expected )
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
			
			lastExpected = expected ;
			expected = null ;
			
			if ( ! nextActions.length )
			{
				if ( keyWordsOverride !== noOverride )
				{
					lastOverride = keyWordsOverride ;
					keyWordsOverride = noOverride ;
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
sentence.keyWords = keyWords ;



},{"./doormen.js":2}],7:[function(require,module,exports){
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



module.exports = {
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
	} ,
	
	// Meta type of numbers
	real: function( data ) { return typeof data === 'number' && ! isNaN( data ) && isFinite( data ) ; } ,
	integer: function( data ) { return typeof data === 'number' && isFinite( data ) && data === Math.round( data ) ; } ,
	
	// Meta type of string
	email: function( data ) {
		// Borrowed from: package 'is_js' and 'email-validator' (Licence: MIT)
		
		if ( typeof data !== 'string' ) { return false ; }
		
		if ( data.length > 254 ) { return false ; }
		
		if ( !
			/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
			.test( data )
		)
		{
			return false ;
		}
		
		// Further checking of some things regex can't handle
		
		var parts = data.split( '@' ) ;
		
		if ( parts[ 0 ].length > 64 ) { return false ; }
		
		var domainParts = parts[ 1 ].split( '.' ) ;
		
		if ( domainParts.some( function( part ) { return part.length > 63 ; } ) ) { return false ; }
		
		return true ;
	} ,
	url: function( data ) {
		// Borrowed from: Jquery Validation
		return typeof data === 'string' &&
			/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
			.test( data ) ;
	} ,
} ;



}).call(this,require("buffer").Buffer)
},{"buffer":undefined}]},{},[1])(1)
});