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
doormen.keywords = require( './keywords.js' ) ;
doormen.sentence = require( './sentence.js' ) ;
doormen.expect = require( './expect.js' ) ;



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



},{"./expect.js":3,"./filter.js":4,"./isEqual.js":5,"./keywords.js":6,"./sanitizer.js":7,"./sentence.js":8,"./typeChecker.js":9}],3:[function(require,module,exports){
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



function expect( data )
{
	var context = Object.create( Object.prototype , {
		data: { value: data } ,
		schema: { value: {} }
	} ) ;
	
	var carryOver = [] ;
	var action = {} ;
	
	var apply = apply.bind( context , action ) ;
	
	populate( apply , context , carryOver ) ;
	
	return apply ;
}



function apply( action )
{
	return doormen( this.data , this.schema ) ;
}



function populate( fn , context , carryOver )
{
	var key ;
	
	for ( key in doormen.keywords )
	{
		lazyLoad( fn , key , context , carryOver.slice() ) ;
	}
}

function lazyLoad( parent , key , context , carryOver )
{
	carryOver.push( key ) ;
	
	Object.defineProperty( fn , key , {
		configurable: true,
		//enumerable: true,
		get: function() {
			updateAction( context.schema , carryOver ) ;
			var fn = apply.bind( context , carryOver ) ;
			populate( fn , context , carryOver ) ;
			Object.defineProperty( fn , key , { value: fn } ) ;
			return fn ;
		}
	} ) ;
}

function updateAction( schema , carryOver )
{
	
}



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



module.exports = expect ;



},{"./doormen.js":2}],4:[function(require,module,exports){
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
},{"./doormen.js":2}],5:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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



},{}],8:[function(require,module,exports){
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



},{"./doormen.js":2}],9:[function(require,module,exports){
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
var url = require( 'url' ) ;
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


// Emails
check.email = function checkEmail( data )
{
	// Borrowed from: package 'is_js' and 'email-validator' (Licence: MIT)
	
	if ( typeof data !== 'string' ) { return false ; }
	
	if ( data.length > 254 ) { return false ; }
	
	if ( !
		/^([^\s@\/$?#.][^\s@\/$?#]+[^\s@\/$?#.])@([^\s\/$?#.][^\s\/$?#]+)$/
		// /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
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
} ;



// URLs
check.url = function checkUrl( data , restrictToWebUrl )
{
	if ( typeof data !== 'string' ) { return false ; }
	
	var matches , i , splited , tmp ;
	
	matches = data.match( /^([a-z+.-]+):\/\/(([0-9][0-9.]+[0-9])|([0-9a-f:]+)|([^\s\/$?#.][^\s\/$?#]+))?(\/[^\s]*)?$/ ) ;
	
	if ( ! matches ) { return false ; }
	
	// If we only want http, https and ftp...
	if ( restrictToWebUrl && matches[ 1 ] !== 'http' &&  matches[ 1 ] !== 'https' && matches[ 1 ] !== 'ftp' ) { return false ; }
	
	if ( ! matches[ 2 ] && matches[ 1 ] !== 'file' ) { return false ; }
	
	if ( matches[ 3 ] )
	{
		// IPv4
		splited = matches[ 3 ].split( '.' ) ;
		
		if ( splited.length !== 4 ) { return false ; }
		
		for ( i = 0 ; i < splited.length ; i ++ )
		{
			tmp = parseInt( splited[ i ] , 10 ) ;
			// NaN compliant check
			if ( ! ( tmp >= 0 && tmp <= 255 ) ) { return false ; }	// jshint ignore:line
		}
	}
	
	// IPv6
	// TODO...
	//if ( matches[ 4 ] ) {}
	
	return true ;
} ;

check.weburl = function checkWeburl( data ) { return check.url( data , true ) ; } ;




}).call(this,require("buffer").Buffer)
},{"buffer":undefined,"url":13}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],12:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":10,"./encode":11}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":undefined,"querystring":12}]},{},[1])(1)
});