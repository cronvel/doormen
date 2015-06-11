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
doormen.utils = require( './utils.js' ) ;
doormen.typeChecker = require( './typeChecker.js' ) ;
doormen.sanitizer = require( './sanitizer.js' ) ;
doormen.filter = require( './filter.js' ) ;



doormen.topLevelFilters = [ 'min' , 'max' , 'minLength' , 'maxLength' , 'match' ] ;



function check( data , schema , options , runtime , element )
{
	var i , key , sanitizerList , messagePath , found , sanitized , hashmap ;
	
	messagePath = element.path || '(it)' ;
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( messagePath + " is not a schema (not an object)." ) ;
	}
	
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
	
	// Fourthly: check top-level built-in filters
	
	for ( i = 0 ; i < doormen.topLevelFilters.length ; i ++ )
	{
		key = doormen.topLevelFilters[ i ] ;
		
		if ( schema[ key ] !== undefined )
		{
			doormen.filter[ key ]( data , schema[ key ] , messagePath ) ;
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
			if ( doormen.utils.equals( data , schema.in[ i ] ) ) { found = true ; break ; }
		}
		
		if ( ! found )
		{
			throw new doormen.ValidatorError( messagePath + " should be in " + JSON.stringify( schema.in ) + "." ) ;
		}
	}
	
	if ( schema.notIn !== undefined )
	{
		if ( ! Array.isArray( schema.notIn ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'not-in' should be an array." ) ;
		}
		
		found = false ;
		
		for ( i = 0 ; i < schema.notIn.length ; i ++ )
		{
			if ( doormen.utils.equals( data , schema.notIn[ i ] ) )
			{
				throw new doormen.ValidatorError( messagePath + " should not be in " + JSON.stringify( schema.notIn ) + "." ) ;
			}
		}
	}
	
	if ( schema.properties !== undefined )
	{
		if ( ! schema.properties || typeof schema.properties !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'properties' should be an object." ) ;
		}
		
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) )
		{
			throw new doormen.ValidatorError( messagePath + " can't have properties (not an object nor a function)." ) ;
		}
		
		if ( Array.isArray( schema.properties ) )
		{
			hashmap = {} ;
			
			for ( i = 0 ; i < schema.properties.length ; i ++ )
			{
				if ( ! ( schema.properties[ i ] in data ) )
				{
					throw new doormen.ValidatorError( messagePath + " does not have all required properties (" +
						JSON.stringify( schema.properties ) + ")." ) ;
				}
				
				hashmap[ schema.properties[ i ] ] = true ;
			}
		}
		else
		{
			for ( key in schema.properties )
			{
				sanitized = check( data[ key ] , schema.properties[ key ] , options , runtime , {
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
					throw new doormen.ValidatorError( messagePath + " has extra properties (" +
						JSON.stringify( Object.keys( hashmap ) ) + ")." ) ;
				}
			}
		}
	}
	
	if ( schema.elements !== undefined )
	{
		if ( ! Array.isArray( schema.elements ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'elements' should be an array." ) ;
		}
		
		if ( ! Array.isArray( data ) )
		{
			throw new doormen.ValidatorError( messagePath + " can't have elements (not an array)." ) ;
		}
		
		for ( i = 0 ; i < schema.elements.length ; i ++ )
		{
			sanitized = check( data[ i ] , schema.elements[ i ] , options , runtime , {
				path: element.path + '#' + i ,
				key: i
			} ) ;
		}
		
		if ( schema.only && data.length > schema.elements.length )
		{
			throw new doormen.ValidatorError( messagePath + " has extra elements (" +
				data.length + " instead of " + schema.elements.length + ")." ) ;
		}
	}
	
	if ( schema.of !== undefined )
	{
		if ( ! schema.of || typeof schema.of !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'of' should contains a schema object." ) ;
		}
		
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) )
		{
			throw new doormen.ValidatorError( messagePath + " can't have elements (not an array, nor an object, nor a function)." ) ;
		}
		
		if ( Array.isArray( data ) )
		{
			for ( i = 0 ; i < data.length ; i ++ )
			{
				sanitized = check( data[ i ] , schema.of , options , runtime , {
					path: element.path + '#' + i ,
					key: i
				} ) ;
			}
		}
		else
		{
			for ( key in data )
			{
				sanitized = check( data[ key ] , schema.of , options , runtime , {
					path: element.path + '.' + key ,
					key: key
				} ) ;
			}
		}
	}
	
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
	if ( ! doormen.utils.equals( left , right ) ) { throw new doormen.ValidatorError( 'should had been equals' ) ; }
} ;

// Inverse of equals
doormen.not.equals = function notEquals( left , right )
{
	if ( doormen.utils.equals( left , right ) ) { throw new doormen.ValidatorError( 'should not had been equals' ) ; }
} ;


