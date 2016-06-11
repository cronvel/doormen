(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.doormen = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



// Load doormen.js, export it, and set isBrowser to true
module.exports = require( './doormen.js' ) ;
module.exports.isBrowser = true ;

},{"./doormen.js":2}],2:[function(require,module,exports){
/*
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



/*
	doormen( schema , data )
	doormen( options , schema , data )
	
	options:
		* userContext: a context that can be accessed by user-land type-checker and sanitizer
		* report: activate the report mode: report as many error as possible (same as doormen.report())
		* export: activate the export mode: sanitizers export into a new object (same as doormen.export())
*/
function doormen()
{
	var options , data , schema , context , sanitized ;
	
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
	
	if ( ! options.patch || typeof options.patch !== 'object' || Array.isArray( options.patch ) ) { options.patch = false ; }
	
	
	context = {
		userContext: options.userContext ,
		validate: true ,
		errors: [] ,
		patch: options.patch ,
		check: check ,
		validatorError: validatorError ,
		report: !! options.report ,
		export: !! options.export
	} ;
	
	sanitized = context.check( schema , data , {
		path: '' ,
		displayPath: data === null ? 'null' : ( Array.isArray( data ) ? 'array' : typeof data ) ,
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



doormen.topLevelFilters = [ 'instanceOf' , 'min' , 'max' , 'length' , 'minLength' , 'maxLength' , 'match' , 'in' , 'notIn' , 'eq' ] ;



function check( schema , data_ , element )
{
	var i , key , newKey , sanitizerList , hashmap , data = data_ , src , returnValue , alternativeErrors ,
		when , ifArray , keys , nextKeys , bkup , addToPath ;
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( element.displayPath + " is not a schema (not an object or an array of object)." ) ;
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
			element.displayPath + " does not validate any schema alternatives: ( " + alternativeErrors.join( ' ; ' ) + " )." ,
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
		
		bkup = data ;
		
		for ( i = 0 ; i < sanitizerList.length ; i ++ )
		{
			if ( ! doormen.sanitizer[ sanitizerList[ i ] ] )
			{
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant sanitizer '" + sanitizerList[ i ] + "'." ) ;
			}
			
			data = doormen.sanitizer[ sanitizerList[ i ] ].call( this , data , schema , this.export && data === data_ ) ;
		}
		
		// if you want patch reporting
		if ( this.patch && bkup !== data )
		{
			this.patch[ element.path ] = data ;
		}
	}
	
	// 3) check the type
	if ( schema.type )
	{
		if ( ! doormen.typeChecker[ schema.type ] )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant type '" + schema.type + "'." ) ;
		}
		
		if ( ! doormen.typeChecker[ schema.type ].call( this , data ) )
		{
			this.validatorError( element.displayPath + " is not a " + schema.type + "." , element ) ;
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
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'filter' should be an object." ) ;
		}
		
		for ( key in schema.filter )
		{
			if ( ! doormen.filter[ key ] )
			{
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant filter '" + key + "'." ) ;
			}
			
			doormen.filter[ key ].call( this , data , schema.filter[ key ] , element ) ;
		}
	}
	
	
	// 6) Recursivity
	
	// of
	if ( schema.of !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) )
	{
		if ( ! schema.of || typeof schema.of !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'of' should contains a schema object." ) ;
		}
		
		if ( Array.isArray( data ) )
		{
			if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }
			
			for ( i = 0 ; i < src.length ; i ++ )
			{
				addToPath = '[' + i + ']' ;
				data[ i ] = this.check( schema.of , src[ i ] , {
					path: element.path + addToPath ,
					displayPath: element.displayPath + addToPath ,
					key: i
				} ) ;
			}
		}
		else
		{
			if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }
			
			for ( key in src )
			{
				addToPath = '.' + key ;
				data[ key ] = this.check( schema.of , src[ key ] , {
					path: element.path ? element.path + addToPath : key ,
					displayPath: element.displayPath + addToPath ,
					key: key
				} ) ;
			}
		}
	}
	
	// keys
	if ( schema.keys !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) )
	{
		if ( ! schema.keys || typeof schema.keys !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'keys' should contains a schema object." ) ;
		}
		
		if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }
		
		for ( key in src )
		{
			addToPath = ':' + key ;
			newKey = this.check( schema.keys , key , {
				path: element.path + addToPath ,
				displayPath: element.displayPath + addToPath ,
				key: key
			} ) ;
			
			if ( newKey in data && newKey !== key )
			{
				this.validatorError(
					"'keys' cannot overwrite another existing key: " + element.displayPath +
					" want to rename '" + key + "' to '" + newKey + "' but it already exists."
				) ;
			}
			
			data[ newKey ] = src[ key ] ;
			if ( newKey !== key ) { delete data[ key ] ; }
		}
	}
	
	// properties
	if ( schema.properties !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) )
	{
		if ( ! schema.properties || typeof schema.properties !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'properties' should be an object." ) ;
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
					this.validatorError( element.displayPath + " does not have all required properties (" +
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
					throw new doormen.SchemaError( element.displayPath + " has 'when' properties with circular dependencies." ) ;
				}
				
				keys = nextKeys ;
				nextKeys = [] ;
				
				for ( i = 0 ; i < keys.length ; i ++ )
				{
					key = keys[ i ] ;
					
					if ( ! schema.properties[ key ] || typeof schema.properties[ key ] !== 'object' )
					{
						throw new doormen.SchemaError( element.displayPath + '.' + key + " is not a schema (not an object or an array of object)." ) ;
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
							throw new doormen.SchemaError( element.displayPath + '.' + key + ".when should be an object with a 'sibling' (string), 'verify' (schema object) and 'set' properties." ) ;
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
					
					addToPath = '.' + key ;
					returnValue = this.check( schema.properties[ key ] , src[ key ] , {
						path: element.path ? element.path + addToPath : key ,
						displayPath: element.displayPath + addToPath ,
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
					this.validatorError( element.displayPath + " has extra properties ('" + key + "' is not in " +
						JSON.stringify( Object.keys( hashmap ) ) + ")." ,
						element ) ;
				}
			}
		}
	}
	
	// elements
	if ( schema.elements !== undefined && Array.isArray( data ) )
	{
		if ( ! Array.isArray( schema.elements ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'elements' should be an array." ) ;
		}
		
		if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
		else { src = data ; }
		
		for ( i = 0 ; i < schema.elements.length ; i ++ )
		{
			addToPath = '[' + i + ']' ;
			data[ i ] = this.check( schema.elements[ i ] , src[ i ] , {
				path: element.path + addToPath ,
				displayPath: element.displayPath + addToPath ,
				key: i
			} ) ;
		}
		
		if ( ! schema.extraElements && src.length > schema.elements.length )
		{
			this.validatorError( element.displayPath + " has extra elements (" +
				src.length + " instead of " + schema.elements.length + ")." ,
				element ) ;
		}
	}
	
	
	// 7) Conditionnal schema
	
	if (
		typeof schema.switch === 'string' &&
		data && typeof data === 'object' && typeof data[ schema.switch ] === 'string' &&
		schema.case && typeof schema.case === 'object' && schema.case[ data[ schema.switch ] ]
	)
	{
		data = this.check( schema.case[ data[ schema.switch ] ] , data , element ) ;
	}
	
	if ( schema.if && typeof schema.if === 'object' )
	{
		ifArray = Array.isArray( schema.if ) ? schema.if : [ schema.if ] ;
		
		for ( i = 0 ; i < ifArray.length ; i ++ )
		{
			try {
				doormen( ifArray[ i ].verify , data ) ;
			}
			catch ( error ) {
				// normal case, it does not match, so continue to the next alternative
				continue ;
			}
			
			data = this.check( ifArray[ i ].then , data , element ) ;
		}
	}
	
	return data ;
}



doormen.path = function schemaPath( schema , path )
{
	var index = 0 ;
	
	if ( ! Array.isArray( path ) )
	{
		if ( typeof path !== 'string' ) { throw new Error( "Argument #1 'path' should be a string" ) ; }
		path = path.split( '.' ) ;
	}
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( schema + " is not a schema (not an object or an array of object)." ) ;
	}
	
	// Skip empty path
	while ( index < path.length && ! path[ index ] ) { index ++ ; }
	
	return schemaPath_( schema , path , index ) ;
} ;



function schemaPath_( schema , path , index )
{
	var key ;
	
	// Found it! return now!
	if ( index >= path.length ) { return schema ; }
	
	key = path[ index ] ;
	
	
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
			//path.shift() ;
			return schemaPath_( schema.properties[ key ] , path , index + 1 ) ;
		}
		else if ( ! schema.extraProperties )
		{
			throw new doormen.SchemaError( "Bad path (at " + path + "), property '" + key + "' not found and the schema does not allow extra properties." ) ;
		}
	}
	
	if ( schema.of !== undefined )
	{
		if ( ! schema.of || typeof schema.of !== 'object' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + path + "), 'of' should contains a schema object." ) ;
		}
		
		//path.shift() ;
		return schemaPath_( schema.of , path , index + 1 ) ;
	}
	
	// "element" is not supported ATM
	//if ( schema.elements !== undefined ) {}
	
	// Sub-schema not found, it should be open to anything, so return {}
	return {} ;
}



// Get the tier of a patch, i.e. the highest tier for all path of the patch.
doormen.patchTier = function pathsMaxTier( schema , patch )
{
	var i , iMax , path ,
		maxTier = 1 ,
		paths = Object.keys( patch ) ;
	
	for ( i = 0 , iMax = paths.length ; i < iMax ; i ++ )
	{
		path = paths[ i ].split( '.' ) ;
		
		while ( path.length )
		{
			maxTier = Math.max( maxTier , doormen.path( schema , path ).tier || 1 ) ;
			path.pop() ;
		}
	}
	
	return maxTier ;
} ;



/*
	doormen.patch( schema , patch )
	doormen.patch( options , schema , patch )
	
	Validate the 'patch' format
*/
doormen.patch = function schemaPatch()
{
	var patch , schema , options , context , sanitized , key , subSchema ;
	
	
	// Share a lot of code with the doormen() function
	
	
	if ( arguments.length < 2 || arguments.length > 3 )
	{
		throw new Error( 'doormen.patch() needs at least 2 and at most 3 arguments' ) ;
	}
	
	if ( arguments.length === 2 ) { schema = arguments[ 0 ] ; patch = arguments[ 1 ] ; }
	else { options = arguments[ 0 ] ; schema = arguments[ 1 ] ; patch = arguments[ 2 ] ; }
	
	// Schema as a sentence
	if ( typeof schema === 'string' ) { schema = doormen.sentence( schema ) ; }
	
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new doormen.SchemaError( 'Bad schema, it should be an object or an array of object!' ) ;
	}
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	// End of common part
	
	if ( ! patch || typeof patch !== 'object' ) { throw new Error( 'The patch should be an object' ) ; }
	
	// If in the 'export' mode, create a new object, else modify it in place
	
	sanitized = options.export ? {} : patch ;
	
	context = {
		userContext: options.userContext ,
		validate: true ,
		errors: [] ,
		check: check ,
		validatorError: validatorError ,
		report: !! options.report ,
		export: !! options.export
	} ;
	
	for ( key in patch )
	{
		// Don't try-catch! Let it throw!
		subSchema = doormen.path( schema , key ) ;
		
		//sanitized[ key ] = doormen( options , subSchema , patch[ key ] ) ;
		sanitized[ key ] = context.check( subSchema , patch[ key ] , {
			path: 'patch.' + key ,
			key: key
		} ) ;
	}
	
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
} ;



// Shorthand
doormen.patch.report = doormen.patch.bind( doormen , { report: true } ) ;
doormen.patch.export = doormen.patch.bind( doormen , { export: true } ) ;





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



function extend( base , extension , overwrite )
{
	var key ;
	
	if ( ! extension || typeof extension !== 'object' || Array.isArray( extension ) )
	{
		throw new TypeError( '[doormen] .extend*(): Argument #0 should be a plain object' ) ;
	}
	
	for ( key in extension )
	{
		if ( ( ( key in base ) && ! overwrite ) || typeof extension[ key ] !== 'function' ) { continue ; }
		base[ key ] = extension[ key ] ;
	}
}



doormen.extendTypeChecker = function extendTypeChecker( extension , overwrite ) { extend( doormen.typeChecker , extension , overwrite ) ; } ;
doormen.extendSanitizer = function extendSanitizer( extension , overwrite ) { extend( doormen.sanitizer , extension , overwrite ) ; } ;
doormen.extendFilter = function extendFilter( extension , overwrite ) { extend( doormen.filter , extension , overwrite ) ; } ;





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

// Inverse validation for patch
doormen.patch.not = function patchNot()
{
	var args = arguments ;
	doormen.shouldThrow( function() {
		doormen.patch.apply( doormen , args ) ;
	} ) ;
} ;



doormen.equals = function equals( left , right )
{
	var error ;
	
	if ( ! doormen.isEqual( left , right ) )
	{
		error = new doormen.ValidatorError( 'should had been equal' ) ;
		
		// This will make Mocha show the diff:
		error.actual = left ;
		error.expected = right ;
		error.showDiff = true ;
		
		throw error ;
	}
} ;

// Inverse of equals
doormen.not.equals = function notEquals( left , right )
{
	if ( doormen.isEqual( left , right ) ) { throw new doormen.ValidatorError( 'should not had been equal' ) ; }
} ;



},{"./filter.js":3,"./isEqual.js":4,"./keywords.js":5,"./mask.js":6,"./purifySchema.js":7,"./sanitizer.js":8,"./sentence.js":9,"./typeChecker.js":10}],3:[function(require,module,exports){
(function (global){
/*
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



// Load modules
var doormen = require( './doormen.js' ) ;



var filter = {} ;
module.exports = filter ;



filter.instanceOf = function instanceOf( data , params , element )
{
	if ( typeof params === 'string' )
	{
		params = doormen.isBrowser ?
			window[ params ] :		// jshint ignore:line
			global[ params ] ;
	}
	
	if ( typeof params !== 'function' )
	{
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'instanceOf' should be a function or a global function's name." ) ;
	}
	
	if ( ! ( data instanceof params ) )
	{
		this.validatorError( element.path + " is not an instance of " + params + "." , element ) ;
	}
} ;



filter.eq = filter[ '===' ] = function eq( data , params , element )
{
	if ( data !== params )
	{
		this.validatorError( element.path + " is not stricly equal to " + params + "." , element ) ;
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
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



/*
	Should be FAST! Some critical application part are depending on it.
	When a reporter will be coded, it should be plugged in a way that does not slow down it.
*/
function isEqual( left , right )
{
	var runtime = {
		leftStack: [],
		rightStack: []
	} ;
	
	return isEqual_( left , right , runtime ) ;
}


	
function isEqual_( left , right , runtime )
{
	var index , key , leftIndexOf , rightIndexOf , r ;
	
	// If it's strictly equals, then early exit now.
	if ( left === right ) { return true ; }
	
	// If one is truthy and the other falsy, early exit now
	// It is an important test since it catch the "null is an object" case that can confuse things later
	if ( ! left !== ! right ) { return false ; }	// jshint ignore:line
	
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
		leftIndexOf = runtime.leftStack.indexOf( left ) ;
		rightIndexOf = runtime.rightStack.indexOf( right ) ;
		
		if ( leftIndexOf >= 0 ) { runtime.leftCircular = true ; }
		if ( rightIndexOf >= 0 ) { runtime.rightCircular = true ; }
		
		if ( runtime.leftCircular && runtime.rightCircular ) { return true ; }
		
		if ( Array.isArray( left ) )
		{
			// Arrays
			if ( ! Array.isArray( right ) || left.length !== right.length ) { return false ; }
			
			for ( index = 0 ; index < left.length ; index ++ )
			{
				if ( left[ index ] === right[ index ] ) { continue ; }
				
				runtime.leftStack.push( left ) ;
				runtime.rightStack.push( right ) ;
				
				r = isEqual_( left[ index ] , right[ index ] , runtime ) ;
				
				if ( ! r ) { return false ; }
				
				runtime.leftStack.pop() ;
				runtime.rightStack.pop() ;
			}
		}
		else
		{
			// Objects
			if ( Array.isArray( right ) ) { return false ; }
			
			for ( key in left )
			{
				if ( left[ key ] === undefined ) { continue ; }	// undefined and no key are considered the same
				if ( right[ key ] === undefined ) { return false ; }
				if ( left[ key ] === right[ key ] ) { continue ; }
				
				runtime.leftStack.push( left ) ;
				runtime.rightStack.push( right ) ;
				
				r = isEqual_( left[ key ] , right[ key ] , runtime ) ;
				
				if ( ! r ) { return false ; }
				
				runtime.leftStack.pop() ;
				runtime.rightStack.pop() ;
			}
			
			for ( key in right )
			{
				if ( right[ key ] === undefined ) { continue ; }	// undefined and no key are considered the same
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
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



//mask( schema , data , criteria )
function mask( schema , data , criteria )
{
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new TypeError( 'Bad schema, it should be an object or an array of object!' ) ;
	}
	
	if ( ! criteria || typeof criteria !== 'object' ) { criteria = {} ; }
	
	var context = {
		tier: criteria.tier ,
		tags: criteria.tags ,
		iterate: iterate ,
		check: mask.check
	} ;
	
	return context.iterate( schema , data ) ;
}

module.exports = mask ;



function iterate( schema , data_ )
{
	var i , key , data = data_ , src , returnValue , checkValue ;
	
	if ( ! schema || typeof schema !== 'object' ) { return ; }
	
	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) )
	{
		for ( i = 0 ; i < schema.length ; i ++ )
		{
			try {
				data = mask( schema[ i ] , data_ ) ;
			}
			catch( error ) {
				continue ;
			}
			
			return data ;
		}
		
		return ;
	}
	
	
	// 1) Mask
	checkValue = this.check( schema ) ;
	
	if ( checkValue === false ) { return ; }
	else if ( checkValue === true ) { return data ; }
	// if it's undefined, then recursivity can be checked
	
	// 2) Recursivity
	
	if ( schema.of && typeof schema.of === 'object' )
	{
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) ) { return data ; }
		
		if ( Array.isArray( data ) )
		{
			if ( data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }
			
			for ( i = 0 ; i < src.length ; i ++ )
			{
				data[ i ] = this.iterate( schema.of , src[ i ] ) ;
			}
		}
		else
		{
			if ( data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }
			
			for ( key in src )
			{
				data[ key ] = this.iterate( schema.of , src[ key ] ) ;
			}
		}
	}
	
	if ( schema.properties && typeof schema.properties === 'object' )
	{
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) ) { return data ; }
		
		if ( data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }
		
		if ( Array.isArray( schema.properties ) )
		{
			for ( i = 0 ; i < schema.properties.length ; i ++ )
			{
				key = schema.properties[ i ] ;
				data[ key ] = src[ key ] ;
			}
		}
		else
		{
			for ( key in schema.properties )
			{
				if ( ! schema.properties[ key ] || typeof schema.properties[ key ] !== 'object' )
				{
					continue ;
				}
				
				returnValue = this.iterate( schema.properties[ key ] , src[ key ] ) ;
				
				// Do not create new properties with undefined
				if ( returnValue !== undefined ) { data[ key ] = returnValue ; }
			}
		}
	}
	
	if ( Array.isArray( schema.elements ) )
	{
		if ( ! Array.isArray( data ) ) { return data ; }
		
		if ( data === data_ ) { data = [] ; src = data_ ; }
		else { src = data ; }
		
		for ( i = 0 ; i < schema.elements.length ; i ++ )
		{
			data[ i ] = this.iterate( schema.elements[ i ] , src[ i ] ) ;
		}
	}
	
	return data ;
}



mask.check = function maskCheck( schema )
{
	var i , iMax ;
	
	if ( this.tier !== undefined )
	{
		if ( schema.tier === undefined ) { return ; }
		
		if ( this.tier < schema.tier ) { return false ; }
		
		return true ;
	}
	else if ( this.tags )
	{
		if ( ! Array.isArray( schema.tags ) || ! schema.tags.length ) { return ; }
		
		iMax = this.tags.length ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( schema.tags.indexOf( this.tags[ i ] ) !== -1 ) { return true ; }
		}
		
		return false ;
	}
	
	return ;
} ;



},{}],7:[function(require,module,exports){
/*
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



// Load modules
var doormen = require( './doormen.js' ) ;



var singleSchema = {
	optional: true ,	// For recursivity...
	type: 'strictObject' ,
	extraProperties: true ,
	properties: {
		type: { optional: true , type: 'string' } ,
		optional: { optional: true , type: 'boolean' } ,
		extraProperties: { optional: true , type: 'boolean' } ,
		default: { optional: true } ,
		sanitize: { optional: true , sanitize: 'toArray' , type: 'array' , of: { type: 'string' } } ,
		filter: { optional: true , type: 'strictObject' } ,
		
		tier: { optional: true , type: 'integer' } ,
		tags: { optional: true , type: 'array' , of: { type: 'string' } } ,
		
		// Top-level filters
		instanceOf: { optional: true , type: 'classId' } ,
		min: { optional: true , type: 'integer' } ,
		max: { optional: true , type: 'integer' } ,
		length: { optional: true , type: 'integer' } ,
		minLength: { optional: true , type: 'integer' } ,
		maxLength: { optional: true , type: 'integer' } ,
		match: { optional: true , type: 'regexp' } ,
		in: {
			optional: true ,
			type: 'array'
		} ,
		notIn: {
			optional: true ,
			type: 'array'
		} ,
		when: {
			optional: true ,
			type: 'strictObject' ,
			properties: {
				sibling: { type: 'string' } ,
				//verify: // recursive
				set: { optional: true }
			}
		} ,
		
		// Commons
		hooks: {
			optional: true,
			type: 'strictObject',
			of: {
				type: 'array',
				sanitize: 'toArray',
				of: { type: 'function' }
			}
		},
	} ,
} ;

var doormenSchema = [
	singleSchema ,
	{ type: 'array', of: singleSchema }
] ;

var ifSchema = {
	optional: true ,
	type: 'strictObject' ,
	properties: {
		verify: doormenSchema ,
		then: doormenSchema
	}
} ;

// Recursivity
singleSchema.properties.of = doormenSchema ;

singleSchema.properties.if = [
	ifSchema ,
	{
		type: 'array' ,
		of: ifSchema
	}
] ;

singleSchema.properties.properties = [
	{
		optional: true,
		type: 'strictObject',
		of: doormenSchema
	} ,
	{
		optional: true,
		type: 'array',
		of: { type: 'string' }
	}
] ;

singleSchema.properties.elements = {
	optional: true,
	type: 'array',
	of: doormenSchema
} ;

singleSchema.properties.when.properties.verify = doormenSchema ;



module.exports = function( schema ) 
{
	return doormen.export( doormenSchema , schema ) ;
} ;



},{"./doormen.js":2}],8:[function(require,module,exports){
/*
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



// Load modules
var doormen = require( './doormen.js' ) ;
var latinize = require( 'string-kit/lib/latinize.js' ) ;



var sanitizer = {} ;
module.exports = sanitizer ;



			/* Cast sanitizers */



sanitizer.toString = function toString( data )
{
	if ( typeof data === 'string' ) { return data ; }
	
	// Calling .toString() may throw an error
	try {
		return '' + data ;
	}
	catch ( error ) {
		return data ;
	}
} ;



sanitizer.toNumber = function toNumber( data )
{
	if ( typeof data === 'number' ) { return data ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return parseFloat( data ) ; }
	else { return NaN ; }
} ;



sanitizer.toBoolean = function toBoolean( data )
{
	if ( typeof data === 'boolean' ) { return data ; }
	
	switch ( data )
	{
		case 1 :
		case '1' :
		case 'on' :
		case 'On' :
		case 'ON' :
		case 'true' :
		case 'True' :
		case 'TRUE' :
			return true ;
		case 0 :
		case '0' :
		case 'off' :
		case 'Off' :
		case 'OFF' :
		case 'false' :
		case 'False' :
		case 'FALSE' :
			return false ;
		default :
			return !! data ;
	}
} ;



sanitizer.toInteger = function toInteger( data )
{
	if ( typeof data === 'number' ) { return Math.round( data ) ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return Math.round( parseFloat( data ) ) ; }	// parseInt() is more capricious
	else { return NaN ; }
} ;



sanitizer.toArray = function toArray( data )
{
	if ( Array.isArray( data ) ) { return data ; }
	
	if ( data === undefined ) { return [] ; }
	
	if ( data && typeof data === 'object' && doormen.typeChecker.arguments( data ) )
	{
		return Array.prototype.slice.call( data ) ;
	}
	
	return [ data ] ;
} ;



sanitizer.toDate = function toDate( data )
{
	var parsed ;
	
	if ( data instanceof Date ) { return data ; }
	
	if ( typeof data === 'number' || typeof data === 'string' || ( data && typeof data === 'object' && data.constructor.name === 'Date' ) )
	{
		parsed = new Date( data ) ;
		return isNaN( parsed ) ? data : parsed ;
	}
	
	return data ;
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



sanitizer.capitalize = function capitalize( data )
{
	if ( typeof data === 'string' ) { return data[ 0 ].toUpperCase() + data.slice( 1 ).toLowerCase() ; }
	else { return data ; }
} ;



sanitizer.latinize = function latinize_( data )
{
	if ( typeof data === 'string' ) { return latinize( data ) ; }
	else { return data ; }
} ;



sanitizer.dashToCamelCase = function dashToCamelCase( data )
{
	if ( typeof data !== 'string' ) { return data ; }
	
	return data.replace( /-(.)/g , function( match , letter ) {
		return letter.toUpperCase();
	} ) ;
} ;



			/* Misc sanitizers */



// Convert a string to a MongoDB ObjectID
sanitizer.mongoId = function mongoId( data )
{
	if ( typeof data !== 'string' ) { return data ; }
	if ( doormen.isBrowser ) { return data ; }
	
	try {
		var mongodb = require( 'mongodb' ) ;
		return mongodb.ObjectID( data ) ;
	}
	catch ( error ) {
		return data ;
	}
} ;

},{"./doormen.js":2,"mongodb":11,"string-kit/lib/latinize.js":13}],9:[function(require,module,exports){
/*
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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



},{"./doormen.js":2}],10:[function(require,module,exports){
(function (Buffer){
/*
	Doormen
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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
	
	// Mixed
	"strictObject": function( data ) { return data && typeof data === 'object' && ! Array.isArray( data ) ; } ,
	"classId": function( data ) { return typeof data === 'function' || ( typeof data === 'string' && data.length ) ; } ,
	
	regexp: function( data ) {
		if ( data instanceof RegExp ) { return true ; }
		if ( typeof data !== 'string' ) { return false ; }
		
		try {
			new RegExp( data ) ;
			return true ;
		}
		catch ( error ) {
			return false ;
		}
	} ,
} ;

module.exports = check ;



// Meta type of numbers
check.real = function checkReal( data ) { return typeof data === 'number' && ! isNaN( data ) && isFinite( data ) ; } ;
check.integer = function checkInteger( data ) { return typeof data === 'number' && isFinite( data ) && data === Math.round( data ) ; } ;



check.hex = function checkHex( data )
{
	return typeof data === 'string' && /^[0-9a-fA-F]+$/.test( data ) ;
} ;



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



// hostname or ip
check.host = function checkHost( data )
{
	return check.ip( data ) || check.hostname( data ) ;
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



// MongoDB ObjectID
check.mongoId = function mongoId( data )
{
	if ( data && typeof data === 'object' && data.constructor.name === 'ObjectID' && data.id && typeof data.toString === 'function' )
	{
		data = data.toString() ;
	}
	
	return typeof data === 'string' && data.length === 24 && /^[0-9a-f]{24}$/.test( data ) ;
} ;




}).call(this,require("buffer").Buffer)
},{"buffer":11}],11:[function(require,module,exports){

},{}],12:[function(require,module,exports){
module.exports={"߀":"0","́":""," ":" ","Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ɓ":"B","ｃ":"C","Ⓒ":"C","Ｃ":"C","Ꜿ":"C","Ḉ":"C","Ç":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ɗ":"D","Ɖ":"D","ᴅ":"D","Ꝺ":"D","Ð":"Dh","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","ɛ":"E","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","ᴇ":"E","ꝼ":"F","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","ɢ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","ȷ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","ϻ":"M","Ꞥ":"N","Ƞ":"N","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ɲ":"N","Ꞑ":"N","ᴎ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Œ":"OE","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Þ":"Th","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ɑ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","Ƃ":"b","ⓒ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","C":"c","Ć":"c","Ĉ":"c","Ċ":"c","Č":"c","Ƈ":"c","Ȼ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","Ƌ":"d","Ꮷ":"d","ԁ":"d","Ɦ":"d","ð":"dh","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ﬀ":"ff","ﬁ":"fi","ﬂ":"fl","ﬃ":"ffi","ﬄ":"ffl","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ꝿ":"g","ᵹ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ɭ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ԉ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ɔ":"o","ᴑ":"o","œ":"oe","ƣ":"oi","ꝏ":"oo","ȣ":"ou","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ρ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ʂ":"s","ß":"ss","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","þ":"th","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z"}
},{}],13:[function(require,module,exports){
/*
	String Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
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



var map = require( './latinize-map.json' ) ;

module.exports = function( str )
{
	return str.replace( /[^\u0000-\u007e]/g , function( c ) { return map[ c ] || c ; } ) ;
} ;

            

},{"./latinize-map.json":12}]},{},[1])(1)
});