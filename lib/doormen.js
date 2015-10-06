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



//doormen( schema , data )
//doormen( options , schema , data )
function doormen()
{
	var data , schema , options ;
	
	if ( arguments.length < 2 || arguments.length > 3 )
	{
		throw new Error( 'doormen() needs at least 2 and at most 3 arguments' ) ;
	}
	
	if ( arguments.length === 2 ) { schema = arguments[ 0 ] ; data = arguments[ 1 ] ; }
	else { options = arguments[ 0 ] ; schema = arguments[ 1 ] ; data = arguments[ 2 ] ; }
	
	// Schema as a sentence
	if ( typeof schema === 'string' ) { schema = doormen.sentence( schema ) ; }
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( 'Bad schema, it should be an object or an array of object!' ) ;
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
	
	var sanitized = context.check( schema , data , {
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
doormen.report = doormen.bind( doormen , { report: true } ) ;
doormen.export = doormen.bind( doormen , { export: true } ) ;



// Submodules
doormen.isEqual = require( './isEqual.js' ) ;
doormen.typeChecker = require( './typeChecker.js' ) ;
doormen.sanitizer = require( './sanitizer.js' ) ;
doormen.filter = require( './filter.js' ) ;
doormen.mask = require( './mask.js' ) ;
doormen.keywords = require( './keywords.js' ) ;
doormen.sentence = require( './sentence.js' ) ;
doormen.purifySchema = require( './purifySchema.js' ) ;
//doormen.expect = require( './expect.js' ) ;



doormen.topLevelFilters = [ 'instanceOf' , 'min' , 'max' , 'length' , 'minLength' , 'maxLength' , 'match' , 'in' , 'notIn' ] ;



function check( schema , data_ , element )
{
	var i , key , newKey , sanitizerList , hashmap , data = data_ , src , returnValue , alternativeErrors ,
		when , keys , nextKeys ;
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( element.path + " is not a schema (not an object or an array of object)." ) ;
	}
	
	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) )
	{
		alternativeErrors = [] ;
		
		for ( i = 0 ; i < schema.length ; i ++ )
		{
			try {
				// using .export() is mandatory here: we should not modify the original data
				// since we should check against alternative (and sanitize can change things, for example)
				data = doormen.export( schema[ i ] , data_ ) ;
			}
			catch( error ) {
				alternativeErrors.push( error.message.replace( /\.$/ , '' ) ) ;
				continue ;
			}
			
			return data ;
		}
		
		this.validatorError(
			element.path + " does not validate any schema alternatives: ( " + alternativeErrors.join( ' ; ' ) + " )." ,
			element ) ;
		
		return ;
	}
	
	// 1) if the data has a default value or is optional, and its value is null or undefined, it's ok!
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
				data[ i ] = this.check( schema.of , src[ i ] , { path: element.path + '#' + i , key: i } ) ;
			}
		}
		else
		{
			if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }
			
			for ( key in src )
			{
				data[ key ] = this.check( schema.of , src[ key ] , { path: element.path + '.' + key , key: key } ) ;
			}
		}
	}
	
	if ( schema.keys !== undefined )
	{
		if ( ! schema.keys || typeof schema.keys !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'keys' should contains a schema object." ) ;
		}
		
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) || Array.isArray( data ) )
		{
			this.validatorError( element.path + " can't have keys (not a strict object, nor a function)." , element ) ;
		}
		
		if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }
		
		for ( key in src )
		{
			newKey = this.check( schema.keys , key , { path: element.path + ':' + key , key: key } ) ;
			
			if ( newKey in data && newKey !== key )
			{
				this.validatorError(
					"'keys' cannot overwrite another existing key: " + element.path +
					" want to rename '" + key + "' to '" + newKey + "' but it already exists."
				) ;
			}
			
			data[ newKey ] = src[ key ] ;
			if ( newKey !== key ) { delete data[ key ] ; }
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
		
		hashmap = {} ;
		
		if ( Array.isArray( schema.properties ) )
		{
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
			//for ( key in schema.properties )
			nextKeys = Object.keys( schema.properties ) ;
			keys = [] ;
			
			while( nextKeys.length )
			{
				if ( keys.length === nextKeys.length )
				{
					throw new doormen.SchemaError( element.path + " has 'when' properties with circular dependencies." ) ;
				}
				
				keys = nextKeys ;
				nextKeys = [] ;
				
				for ( i = 0 ; i < keys.length ; i ++ )
				{
					key = keys[ i ] ;
					
					if ( ! schema.properties[ key ] || typeof schema.properties[ key ] !== 'object' )
					{
						throw new doormen.SchemaError( element.path + '.' + key + " is not a schema (not an object or an array of object)." ) ;
					}
					
					if ( schema.properties[ key ].when )
					{
						when = schema.properties[ key ].when ;
						
						if (
							typeof when !== 'object' ||
							typeof when.sibling !== 'string' ||
							! when.verify || typeof when.verify !== 'object'
						)
						{
							throw new doormen.SchemaError( element.path + '.' + key + ".when should be an object with a 'sibling' (string), 'verify' (schema object) and 'set' properties." ) ;
						}
						
						if ( ! hashmap[ when.sibling ] && schema.properties[ when.sibling ] )
						{
							// Postpone
							//console.log( "postpone:" , key ) ;
							nextKeys.push( key ) ;
							continue ;
						}
						
						try {
							//console.log( "try" ) ;
							doormen( when.verify , data[ when.sibling ] ) ;
							
							if ( when.set === undefined ) { delete data[ key ] ; }
							else { data[ key ] = when.set ; }
							
							hashmap[ key ] = true ;	// Add it anyway
							continue ;
						}
						catch ( error ) {
							//console.log( "catch" ) ;
						}
					}
					
					hashmap[ key ] = true ;
					
					returnValue = this.check( schema.properties[ key ] , src[ key ] , {
						path: element.path + '.' + key ,
						key: key
					} ) ;
					
					// Do not create new properties with undefined
					if ( returnValue !== undefined || key in src ) { data[ key ] = returnValue ; }
				}
			}
		}
		
		if ( ! schema.extraProperties )
		{
			for ( key in src )
			{
				if ( ! ( key in hashmap ) )
				{
					this.validatorError( element.path + " has extra properties ('" + key + "' is not in " +
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
			data[ i ] = this.check( schema.elements[ i ] , src[ i ] , {
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



doormen.path = function schemaPath( schema , path )
{
	var length , key ;
	
	if ( ! Array.isArray( path ) )
	{
		if ( typeof path !== 'string' ) { throw new Error( "Argument #1 'path' should be a string" ) ; }
		path = path.split( '.' ) ;
	}
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( path + " is not a schema (not an object or an array of object)." ) ;
	}
	
	
	length = path.length ;
	
	// Remove empty path
	while ( length && ! path[ 0 ] ) { path.shift() ; length -- ; }
	
	// Found it! return now!
	if ( ! length ) { return schema ; }
	
	key = path[ 0 ] ;
	
	
	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) )
	{
		throw new Error( "Schema alternatives are not supported for path matching ATM." ) ;
	}
	
	// 1) Recursivity
	if ( schema.properties !== undefined )
	{
		if ( ! schema.properties || typeof schema.properties !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + path + "), 'properties' should be an object." ) ;
		}
		
		if ( schema.properties[ key ] )
		{
			path.shift() ;
			return doormen.path( schema.properties[ key ] , path ) ;
		}
	}
	
	if ( schema.of !== undefined )
	{
		if ( ! schema.of || typeof schema.of !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + path + "), 'of' should contains a schema object." ) ;
		}
		
		path.shift() ;
		return doormen.path( schema.of , path ) ;
	}
	
	// "element" is not supported ATM
	//if ( schema.elements !== undefined ) {}
	
	return null ;
} ;



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
	
	if ( Error.captureStackTrace ) { Error.captureStackTrace( this , ValidatorError ) ; }
	else { Object.defineProperty( this , 'stack' , { value: Error().stack , enumerable: true } ) ; }
} ;

doormen.ValidatorError.prototype = Object.create( TypeError.prototype ) ;
doormen.ValidatorError.prototype.constructor = doormen.ValidatorError ;
doormen.ValidatorError.prototype.name = 'ValidatorError' ;



doormen.SchemaError = function SchemaError( message )
{
	this.message = message ;
	
	if ( Error.captureStackTrace ) { Error.captureStackTrace( this , SchemaError ) ; }
	else { Object.defineProperty( this , 'stack' , { value: Error().stack , enumerable: true } ) ; }
} ;

doormen.SchemaError.prototype = Object.create( TypeError.prototype ) ;
doormen.SchemaError.prototype.constructor = doormen.SchemaError ;
doormen.SchemaError.prototype.name = 'SchemaError' ;





			/* Extend */



function extend( base , extension )
{
	var key ;
	
	if ( ! extension || typeof extension !== 'object' || Array.isArray( extension ) )
	{
		throw new TypeError( '[doormen] .extend*(): Argument #0 should be a plain object' ) ;
	}
	
	for ( key in extension )
	{
		if ( key in base || typeof extension[ key ] !== 'function' ) { continue ; }
		base[ key ] = extension[ key ] ;
	}
}



doormen.extendTypeChecker = function extendTypeChecker( extension ) { extend( doormen.typeChecker , extension ) ; } ;
doormen.extendSanitizer = function extendSanitizer( extension ) { extend( doormen.sanitizer , extension ) ; } ;
doormen.extendFilter = function extendFilter( extension ) { extend( doormen.filter , extension ) ; } ;





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
doormen.not = function not()
{
	var args = arguments ;
	doormen.shouldThrow( function() {
		doormen.apply( doormen , args ) ;
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


