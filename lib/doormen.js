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
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new TypeError( 'Bad schema, it should be an object!' ) ;
	}
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var runtime = {
		ok: true ,
		errors: []
	} ;
	
	var sanitized = check( data , schema , options , runtime , {
		path: '' ,
		key: ''
	} ) ;
	
	return sanitized ;
}

module.exports = doormen ;



// Submodules
doormen.typeChecker = require( './typeChecker.js' ) ;
doormen.sanitizer = require( './sanitizer.js' ) ;
doormen.filter = require( './filter.js' ) ;



function check( data , schema , options , runtime , element )
{
	var i , sanitizerList , messagePath , found ;
	
	messagePath = element.path || '(it)' ;
	
	
	// Firstly: if the data is optional and it's value is null or undefined, it's ok!
	if ( schema.optional && ( data === null || data === undefined ) )
	{
		return 'default' in schema ? schema.default : null ;
	}
	
	// Secondly: apply available sanitizers before anything else
	if ( schema.sanitize )
	{
		sanitizerList = Array.isArray( schema.sanitize ) ? schema.sanitize : [ schema.sanitize ] ;
		
		for ( i = 0 ; i < sanitizerList.length ; i ++ )
		{
			if ( ! doormen.sanitizer[ sanitizerList[ i ] ] )
			{
				throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), unexistant sanitizer '" + sanitizerList[ i ] + "'." ) ;
			}
			
			data = doormen.sanitizer[ sanitizerList[ i ] ]( data ) ;
		}
	}
	
	// Thirdly: check the type
	if ( schema.type )
	{
		if ( ! doormen.typeChecker[ schema.type ] )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), unexistant type '" + schema.type + "'." ) ;
		}
		
		if ( ! doormen.typeChecker[ schema.type ]( data ) )
		{
			throw new doormen.ValidatorError( messagePath + " is not a " + schema.type + "." ) ;
		}
	}
	
	// Fourthly: check advanced built-in filters
	
	if ( schema.min !== undefined )
	{
		if ( typeof schema.min !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'min' should be a number." ) ;
		}
		
		// Negative test here, because of NaN
		if ( typeof data !== 'number' || ! ( data >= schema.min ) )	// jshint ignore:line
		{
			throw new doormen.ValidatorError( messagePath + " is not greater than or equals to " + schema.min + "." ) ;
		}
	}
	
	if ( schema.max !== undefined )
	{
		if ( typeof schema.max !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'max' should be a number." ) ;
		}
		
		// Negative test here, because of NaN
		if ( typeof data !== 'number' || ! ( data <= schema.max ) )	// jshint ignore:line
		{
			throw new doormen.ValidatorError( messagePath + " is not lesser than or equals to " + schema.max + "." ) ;
		}
	}
	
	if ( schema['min-length'] !== undefined )
	{
		if ( typeof schema['min-length'] !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'min-length' should be a number." ) ;
		}
		
		// Nasty tricks ;)
		try {
			if ( ! ( data.length >= schema['min-length'] ) ) { throw true ; }	// jshint ignore:line
		}
		catch ( error ) {
			throw new doormen.ValidatorError( messagePath + " has not a length greater than or equals to " + schema['min-length'] + "." ) ;
		}
	}
	
	if ( schema['max-length'] !== undefined )
	{
		if ( typeof schema['max-length'] !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'max-length' should be a number." ) ;
		}
		
		// Nasty tricks ;)
		try {
			if ( ! ( data.length <= schema['max-length'] ) ) { throw true ; }	// jshint ignore:line
		}
		catch ( error ) {
			throw new doormen.ValidatorError( messagePath + " has not a length lesser than or equals to " + schema['max-length'] + "." ) ;
		}
	}
	
	if ( schema.in !== undefined )
	{
		if ( ! Array.isArray( schema.in ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'in' should be an array." ) ;
		}
		
		found = false ;
		
		for ( i = 0 ; i < schema.in.length ; i ++ )
		{
			if ( doormen.filter.equals( data , schema.in[ i ] ) ) { found = true ; break ; }
		}
		
		if ( ! found )
		{
			throw new doormen.ValidatorError( messagePath + " should be in " + JSON.stringify( schema.in ) + "." ) ;
		}
	}
	
	if ( schema['not-in'] !== undefined )
	{
		if ( ! Array.isArray( schema['not-in'] ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'not-in' should be an array." ) ;
		}
		
		found = false ;
		
		for ( i = 0 ; i < schema['not-in'].length ; i ++ )
		{
			if ( doormen.filter.equals( data , schema['not-in'][ i ] ) )
			{
				throw new doormen.ValidatorError( messagePath + " should not be in " + JSON.stringify( schema['not-in'] ) + "." ) ;
			}
		}
	}
	
	//if ( 'not-equals' in schema ) { doormen.not.equals( data , schema.equals ) ; }
	
	return data ;
}





			/* Specific Error class */



doormen.ValidatorError = function ValidatorError( message )
{
	this.message = message ;
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



/*
	- NaN should be equals to NaN: OK!
	- object comparison: TODO...
*/
doormen.equals = function equals( left , right )
{
	if ( ! doormen.filter.equals( left , right ) ) { throw new doormen.ValidatorError( 'should had been equals' ) ; }
} ;

// Inverse of equals
doormen.not.equals = function notEquals( left , right )
{
	if ( doormen.filter.equals( left , right ) ) { throw new doormen.ValidatorError( 'should not had been equals' ) ; }
} ;


