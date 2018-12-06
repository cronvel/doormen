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



/*
	doormen( schema , data )
	doormen( options , schema , data )

	options:
		* userContext: a context that can be accessed by user-land type-checker and sanitizer
		* report: activate the report mode: report as many error as possible (same as doormen.report())
		* export: activate the export mode: sanitizers export into a new object (same as doormen.export())
*/
function doormen( ... args ) {
	var options , data , schema , context , sanitized ;

	if ( args.length < 2 || args.length > 3 ) {
		throw new Error( 'doormen() needs at least 2 and at most 3 arguments' ) ;
	}

	if ( args.length === 2 ) { schema = args[ 0 ] ; data = args[ 1 ] ; }
	else { options = args[ 0 ] ; schema = args[ 1 ] ; data = args[ 2 ] ; }

	// Schema as a sentence
	if ( typeof schema === 'string' ) { schema = doormen.sentence( schema ) ; }

	if ( ! schema || typeof schema !== 'object' ) {
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
		displayPath: data === null ? 'null' : ( Array.isArray( data ) ? 'array' : typeof data ) ,	// eslint-disable-line no-nested-ternary
		key: ''
	} , false ) ;

	if ( context.report ) {
		return {
			validate: context.validate ,
			sanitized: sanitized ,
			errors: context.errors
		} ;
	}

	return sanitized ;

}

module.exports = doormen ;



doormen.isBrowser = false ;



// Shorthand
doormen.report = doormen.bind( doormen , { report: true } ) ;
doormen.export = doormen.bind( doormen , { export: true } ) ;



// Submodules
doormen.AssertionError = require( './AssertionError.js' ) ;
doormen.ValidatorError = require( './ValidatorError.js' ) ;
doormen.SchemaError = require( './SchemaError.js' ) ;

var mask = require( './mask.js' ) ;
doormen.tierMask = mask.tierMask ;
doormen.tagMask = mask.tagMask ;

doormen.isEqual = require( './isEqual.js' ) ;
doormen.keywords = require( './keywords.js' ) ;
doormen.assert = require( './assert.js' ) ;
doormen.expect = require( './expect.js' ) ;
doormen.sentence = require( './sentence.js' ) ;
doormen.schemaSchema = require( './schemaSchema.js' ) ;

doormen.validateSchema = function( schema ) { return doormen( doormen.schemaSchema , schema ) ; } ;
doormen.purifySchema = function( schema ) { return doormen.export( doormen.schemaSchema , schema ) ; } ;



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

// Extendable things
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.typeChecker ) { global.DOORMEN_GLOBAL_EXTENSIONS.typeChecker = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.sanitizer ) { global.DOORMEN_GLOBAL_EXTENSIONS.sanitizer = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.filter ) { global.DOORMEN_GLOBAL_EXTENSIONS.filter = {} ; }

doormen.typeChecker = require( './typeChecker.js' ) ;
doormen.sanitizer = require( './sanitizer.js' ) ;
doormen.filter = require( './filter.js' ) ;



//doormen.expect = require( './expect.js' ) ;



doormen.topLevelFilters = [ 'instanceOf' , 'min' , 'max' , 'length' , 'minLength' , 'maxLength' , 'match' , 'in' , 'notIn' , 'eq' ] ;



function check( schema , data_ , element , isPatch ) {
	var i , key , newKey , sanitizerList , hashmap , data = data_ , src , returnValue , alternativeErrors ,
		when , ifArray , keys , nextKeys , bkup , addToPath ;

	if ( ! schema || typeof schema !== 'object' ) {
		throw new doormen.SchemaError( element.displayPath + " is not a schema (not an object or an array of object)." ) ;
	}

	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) {
		alternativeErrors = [] ;

		for ( i = 0 ; i < schema.length ; i ++ ) {
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
	if ( ( data === null || data === undefined ) ) {
		if ( 'default' in schema ) { return clone( schema.default ) ; }
		if ( schema.optional ) { return data ; }
	}

	// 2) apply available sanitizers before anything else
	if ( schema.sanitize ) {
		sanitizerList = Array.isArray( schema.sanitize ) ? schema.sanitize : [ schema.sanitize ] ;

		bkup = data ;

		for ( i = 0 ; i < sanitizerList.length ; i ++ ) {
			if ( ! doormen.sanitizer[ sanitizerList[ i ] ] ) {
				if ( doormen.clientMode ) { continue ; }
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant sanitizer '" + sanitizerList[ i ] + "'." ) ;
			}

			data = doormen.sanitizer[ sanitizerList[ i ] ].call( this , data , schema , this.export && data === data_ ) ;
		}

		// if you want patch reporting
		if ( this.patch && bkup !== data ) {
			this.patch[ element.path ] = data ;
		}
	}

	// 3) check the type
	if ( schema.type ) {
		if ( ! doormen.typeChecker[ schema.type ] ) {
			if ( ! doormen.clientMode ) {
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant type '" + schema.type + "'." ) ;
			}
		}
		else if ( ! doormen.typeChecker[ schema.type ].call( this , data ) ) {
			this.validatorError( element.displayPath + " is not a " + schema.type + "." , element ) ;
		}
	}

	// 4) check top-level built-in filters
	for ( i = 0 ; i < doormen.topLevelFilters.length ; i ++ ) {
		key = doormen.topLevelFilters[ i ] ;

		if ( schema[ key ] !== undefined ) {
			doormen.filter[ key ].call( this , data , schema[ key ] , element ) ;
		}
	}

	// 5) check filters
	if ( schema.filter ) {
		if ( typeof schema.filter !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'filter' should be an object." ) ;
		}

		for ( key in schema.filter ) {
			if ( ! doormen.filter[ key ] ) {
				if ( doormen.clientMode ) { continue ; }
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant filter '" + key + "'." ) ;
			}

			doormen.filter[ key ].call( this , data , schema.filter[ key ] , element ) ;
		}
	}


	// 6) Recursivity

	// of
	if ( schema.of !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) ) {
		if ( ! schema.of || typeof schema.of !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'of' should contain a schema object." ) ;
		}

		if ( Array.isArray( data ) ) {
			if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }

			for ( i = 0 ; i < src.length ; i ++ ) {
				addToPath = '[' + i + ']' ;
				data[ i ] = this.check( schema.of , src[ i ] , {
					path: element.path + addToPath ,
					displayPath: element.displayPath + addToPath ,
					key: i
				} , isPatch ) ;
			}
		}
		else {
			if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }

			for ( key in src ) {
				addToPath = '.' + key ;
				data[ key ] = this.check( schema.of , src[ key ] , {
					path: element.path ? element.path + addToPath : key ,
					displayPath: element.displayPath + addToPath ,
					key: key
				} , isPatch ) ;
			}
		}
	}

	// keys
	if ( schema.keys !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) ) {
		if ( ! schema.keys || typeof schema.keys !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'keys' should contain a schema object." ) ;
		}

		if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }

		for ( key in src ) {
			addToPath = ':' + key ;
			newKey = this.check( schema.keys , key , {
				path: element.path + addToPath ,
				displayPath: element.displayPath + addToPath ,
				key: key
			} , isPatch ) ;

			if ( newKey in data && newKey !== key ) {
				this.validatorError(
					"'keys' cannot overwrite another existing key: " + element.displayPath +
					" want to rename '" + key + "' to '" + newKey + "' but it already exists." ,
					element
				) ;
			}

			data[ newKey ] = src[ key ] ;
			if ( newKey !== key ) { delete data[ key ] ; }
		}
	}

	// properties
	if ( schema.properties !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) ) {
		if ( ! schema.properties || typeof schema.properties !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'properties' should be an object." ) ;
		}

		if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }

		hashmap = {} ;

		if ( Array.isArray( schema.properties ) ) {
			for ( i = 0 ; i < schema.properties.length ; i ++ ) {
				key = schema.properties[ i ] ;

				if ( ! ( key in src ) ) {
					this.validatorError( element.displayPath + " does not have all required properties (" +
						JSON.stringify( schema.properties ) + ")." ,
					element ) ;
				}

				data[ key ] = src[ key ] ;

				hashmap[ key ] = true ;
			}
		}
		else {
			//for ( key in schema.properties )
			nextKeys = Object.keys( schema.properties ) ;
			keys = [] ;

			while( nextKeys.length ) {
				if ( keys.length === nextKeys.length ) {
					throw new doormen.SchemaError( element.displayPath + " has 'when' properties with circular dependencies." ) ;
				}

				keys = nextKeys ;
				nextKeys = [] ;

				for ( i = 0 ; i < keys.length ; i ++ ) {
					key = keys[ i ] ;

					if ( ! schema.properties[ key ] || typeof schema.properties[ key ] !== 'object' ) {
						throw new doormen.SchemaError( element.displayPath + '.' + key + " is not a schema (not an object or an array of object)." ) ;
					}

					if ( schema.properties[ key ].when && ! isPatch ) {
						when = schema.properties[ key ].when ;

						if (
							typeof when !== 'object' ||
							typeof when.sibling !== 'string' ||
							(
								( ! when.siblingVerify || typeof when.siblingVerify !== 'object' ) &&
								( ! when.verify || typeof when.verify !== 'object' )
							)
						) {
							throw new doormen.SchemaError( element.displayPath + '.' + key + ".when should be an object with a 'sibling' (string), 'siblingVerify'/'verify' (schema object) and 'set'/'clone' properties." ) ;
						}

						if ( ! hashmap[ when.sibling ] && schema.properties[ when.sibling ] ) {
							// Postpone
							//console.log( "postpone:" , key ) ;
							nextKeys.push( key ) ;
							continue ;
						}

						try {
							//console.log( "try" ) ;
							if ( when.siblingVerify ) { doormen( when.siblingVerify , data[ when.sibling ] ) ; }
							if ( when.verify ) { doormen( when.verify , data[ key ] ) ; }

							if ( when.clone ) { data[ key ] = clone( data[ when.sibling ] ) ; }
							else if ( when.set === undefined ) { delete data[ key ] ; }
							else { data[ key ] = clone( when.set ) ; }

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
					} , isPatch ) ;

					// Do not create new properties with undefined
					if ( returnValue !== undefined || key in src ) { data[ key ] = returnValue ; }
				}
			}
		}

		if ( ! schema.extraProperties ) {
			for ( key in src ) {
				if ( ! ( key in hashmap ) ) {
					this.validatorError( element.displayPath + " has extra properties ('" + key + "' is not in " +
						JSON.stringify( Object.keys( hashmap ) ) + ")." ,
					element ) ;
				}
			}
		}
	}

	// elements
	if ( schema.elements !== undefined && Array.isArray( data ) ) {
		if ( ! Array.isArray( schema.elements ) ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'elements' should be an array." ) ;
		}

		if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
		else { src = data ; }

		for ( i = 0 ; i < schema.elements.length ; i ++ ) {
			addToPath = '[' + i + ']' ;
			data[ i ] = this.check( schema.elements[ i ] , src[ i ] , {
				path: element.path + addToPath ,
				displayPath: element.displayPath + addToPath ,
				key: i
			} , isPatch ) ;
		}

		if ( ! schema.extraElements && src.length > schema.elements.length ) {
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
	) {
		data = this.check( schema.case[ data[ schema.switch ] ] , data , element , isPatch ) ;
	}

	if ( schema.if && typeof schema.if === 'object' ) {
		ifArray = Array.isArray( schema.if ) ? schema.if : [ schema.if ] ;

		for ( i = 0 ; i < ifArray.length ; i ++ ) {
			try {
				doormen( ifArray[ i ].verify , data ) ;
			}
			catch ( error ) {
				// normal case, it does not match, so continue to the next alternative
				continue ;
			}

			data = this.check( ifArray[ i ].then , data , element , isPatch ) ;
		}
	}

	return data ;
}



var clone_ = require( 'tree-kit/lib/clone.js' ) ;

function clone( value ) {
	if ( value && typeof value === 'object' ) { return clone_( value ) ; }
	return value ;
}



doormen.path = function schemaPath( schema , path , noSubmasking = false ) {
	var index = 0 ;

	if ( ! Array.isArray( path ) ) {
		if ( typeof path !== 'string' ) { throw new Error( "Argument #1 'path' should be a string or an array" ) ; }
		path = path.split( '.' ) ;
	}

	if ( ! schema || typeof schema !== 'object' ) {
		throw new doormen.SchemaError( schema + " is not a schema (not an object or an array of object)." ) ;
	}

	// Skip empty path
	while ( index < path.length && ! path[ index ] ) { index ++ ; }

	return schemaPath_( schema , path , index , noSubmasking ) ;
} ;



function schemaPath_( schema , path , index , noSubmasking ) {
	var key ;

	// Found it! return now!
	if ( index >= path.length ) { return schema ; }

	if ( noSubmasking && schema.noSubmasking ) { return null ; }

	key = path[ index ] ;


	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) {
		throw new Error( "Schema alternatives are not supported for path matching ATM." ) ;
	}

	// 1) Recursivity
	if ( schema.properties !== undefined ) {
		if ( ! schema.properties || typeof schema.properties !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + path + "), 'properties' should be an object." ) ;
		}

		if ( schema.properties[ key ] ) {
			//path.shift() ;
			return schemaPath_( schema.properties[ key ] , path , index + 1 , noSubmasking ) ;
		}
		else if ( ! schema.extraProperties ) {
			throw new doormen.SchemaError( "Bad path (at " + path + "), property '" + key + "' not found and the schema does not allow extra properties." ) ;
		}
	}

	if ( schema.of !== undefined ) {
		if ( ! schema.of || typeof schema.of !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + path + "), 'of' should contain a schema object." ) ;
		}

		//path.shift() ;
		return schemaPath_( schema.of , path , index + 1 , noSubmasking ) ;
	}

	// "element" is not supported ATM
	//if ( schema.elements !== undefined ) {}

	// Sub-schema not found, it should be open to anything, so return {}
	return {} ;
}



// Get the tier of a patch, i.e. the highest tier for all path of the patch.
doormen.patchTier = function patchTier( schema , patch ) {
	var i , iMax , path ,
		maxTier = 1 ,
		paths = Object.keys( patch ) ;

	for ( i = 0 , iMax = paths.length ; i < iMax ; i ++ ) {
		path = paths[ i ].split( '.' ) ;

		while ( path.length ) {
			maxTier = Math.max( maxTier , doormen.path( schema , path ).tier || 1 ) ;
			path.pop() ;
		}
	}

	return maxTier ;
} ;



// Check if a patch is allowed by a tag-list
doormen.checkPatchByTags = function( schema , patch , allowedTags ) {
	var path ;

	if ( ! ( allowedTags instanceof Set ) ) {
		if ( Array.isArray( allowedTags ) ) { allowedTags = new Set( allowedTags ) ; }
		else { allowedTags = new Set( [ allowedTags ] ) ; }
	}

	for ( path in patch ) {
		checkOnePatchPathByTags( schema , path , allowedTags , patch[ path ] ) ;
	}
} ;



function checkOnePatchPathByTags( schema , path , allowedTags , element ) {
	var subSchema , tag , found ;

	path = path.split( '.' ) ;

	while ( path.length ) {
		subSchema = doormen.path( schema , path ) ;

		if ( subSchema.tags ) {
			found = false ;

			for ( tag of subSchema.tags ) {
				if ( allowedTags.has( tag ) ) {
					found = true ;
					break ;
				}
			}

			if ( ! found ) {
				if ( this && this.validatorError ) { this.validatorError( "Not allowed by tags" , element ) ; }
				else { throw new doormen.ValidatorError( "Not allowed by tags" , element ) ; }
			}
		}

		path.pop() ;
	}
}



/*
	doormen.patch( schema , patch )
	doormen.patch( options , schema , patch )

	Validate the 'patch' format
*/
doormen.patch = function schemaPatch( ... args ) {
	var patch , schema , options , context , sanitized , path , subSchema ;


	// Share a lot of code with the doormen() function


	if ( args.length < 2 || args.length > 3 ) {
		throw new Error( 'doormen.patch() needs at least 2 and at most 3 arguments' ) ;
	}

	if ( args.length === 2 ) { schema = args[ 0 ] ; patch = args[ 1 ] ; }
	else { options = args[ 0 ] ; schema = args[ 1 ] ; patch = args[ 2 ] ; }

	// Schema as a sentence
	if ( typeof schema === 'string' ) { schema = doormen.sentence( schema ) ; }

	if ( ! schema || typeof schema !== 'object' ) {
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
		checkAllowed: options.allowedTags ? checkOnePatchPathByTags : null ,
		allowedTags: options.allowedTags ?
			new Set( Array.isArray( options.allowedTags ) ? options.allowedTags : [ options.allowedTags ] ) :
			null ,
		validatorError: validatorError ,
		report: !! options.report ,
		export: !! options.export
	} ;

	for ( path in patch ) {
		// Don't try-catch! Let it throw!
		if ( context.checkAllowed ) { context.checkAllowed( schema , path , context.allowedTags , patch[ path ] ) ; }
		subSchema = doormen.path( schema , path ) ;

		//sanitized[ path ] = doormen( options , subSchema , patch[ path ] ) ;
		sanitized[ path ] = context.check( subSchema , patch[ path ] , {
			path: 'patch.' + path ,
			key: path
		} , true ) ;
	}

	if ( context.report ) {
		return {
			validate: context.validate ,
			sanitized: sanitized ,
			errors: context.errors
		} ;
	}

	return sanitized ;
} ;



// Shorthand
doormen.patch.report = doormen.patch.bind( doormen , { report: true } ) ;
doormen.patch.export = doormen.patch.bind( doormen , { export: true } ) ;





/* Specific Error class */



function validatorError( message , element ) {
	var error = new doormen.ValidatorError( message , element ) ;

	this.validate = false ;

	if ( this.report ) {
		this.errors.push( error ) ;
	}
	else {
		throw error ;
	}
}




/* Extend */



function extend( base , extension , overwrite ) {
	var key ;

	if ( ! extension || typeof extension !== 'object' || Array.isArray( extension ) ) {
		throw new TypeError( '[doormen] .extend*(): Argument #0 should be a plain object' ) ;
	}

	for ( key in extension ) {
		if ( ( ( key in base ) && ! overwrite ) || typeof extension[ key ] !== 'function' ) { continue ; }
		base[ key ] = extension[ key ] ;
	}
}



doormen.extendTypeChecker = function extendTypeChecker( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.typeChecker , extension , overwrite ) ; } ;
doormen.extendSanitizer = function extendSanitizer( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.sanitizer , extension , overwrite ) ; } ;
doormen.extendFilter = function extendFilter( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.filter , extension , overwrite ) ; } ;

// Client mode does not throw when type checker, a sanitizer or a filter is not found
doormen.clientMode = false ;
doormen.setClientMode = function setClientMode( clientMode ) { doormen.clientMode = !! clientMode ; } ;





/* Assertion specific utilities */



doormen.shouldThrow = function shouldThrow( fn , from ) {
	var thrown = false ;
	from = from || shouldThrow ;

	try { fn() ; }
	catch ( error ) { thrown = true ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown." , from ) ;
	}
} ;



doormen.shouldReject = async function shouldReject( fn , from ) {
	var thrown = false ;
	from = from || shouldReject ;

	try { await fn() ; }
	catch ( error ) { thrown = true ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have rejected." , from ) ;
	}
} ;



// For internal usage or dev only
doormen.shouldThrowAssertion = function shouldThrowAssertion( fn , from ) {
	var error , thrown = false ;
	from = from || shouldThrowAssertion ;

	try { fn() ; }
	catch ( error_ ) { thrown = true ; error = error_ ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown." , from ) ;
	}
	if ( ! ( error instanceof doormen.AssertionError ) ) {
		// Throw a new error? Seems better to re-throw with a modified message, or the stack trace would be lost?
		//throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown an AssertionError, but have thrown: " + error , from ) ;
		error.message = "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown an AssertionError, instead it had thrown: " + error.message ;
		throw error ;
	}

	return error ;
} ;



// For internal usage or dev only
doormen.shouldRejectAssertion = async function shouldRejectAssertion( fn , from ) {
	var error , thrown = false ;
	from = from || shouldRejectAssertion ;

	try { await fn() ; }
	catch ( error_ ) { thrown = true ; error = error_ ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have rejected." , from ) ;
	}
	if ( ! ( error instanceof doormen.AssertionError ) ) {
		// Throw a new error? Seems better to re-throw with a modified message, or the stack trace would be lost?
		//throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown an AssertionError, but have thrown: " + error , from ) ;
		error.message = "Function '" + ( fn.name || '(anonymous)' ) + "' should have rejected with an AssertionError, instead it had rejected with: " + error.message ;
		throw error ;
	}

	return error ;
} ;



// Inverse validation
doormen.not = function not( ... args ) {
	doormen.shouldThrow( () => {
		doormen( ... args ) ;
	} , not ) ;
} ;



// Inverse validation for patch
doormen.patch.not = function patchNot( ... args ) {
	doormen.shouldThrow( () => {
		doormen.patch( ... args ) ;
	} , patchNot ) ;
} ;



// DEPRECATED assertions! Only here for backward compatibility

doormen.equals = function equals( left , right ) {
	var error ;

	if ( ! doormen.isEqual( left , right ) ) {
		throw new doormen.AssertionError( 'should have been equal' , equals , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;



// Inverse of equals
doormen.not.equals = function notEquals( left , right ) {
	if ( doormen.isEqual( left , right ) ) {
		throw new doormen.AssertionError( 'should not have been equal' , notEquals , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;



doormen.alike = function alike( left , right ) {
	var error ;

	if ( ! doormen.isEqual( left , right , true ) ) {
		throw new doormen.AssertionError( 'should have been alike' , alike , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;



// Inverse of alike
doormen.not.alike = function notAlike( left , right ) {
	if ( doormen.isEqual( left , right , true ) ) {
		throw new doormen.AssertionError( 'should not have been alike' , notAlike , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;

