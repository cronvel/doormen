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
	
	check( data , schema , options , runtime , {
		path: '' ,
		key: ''
	} ) ;
}

module.exports = doormen ;



doormen.ValidatorError = function ValidatorError( message )
{
	this.message = message ;
	//this.stack = Error().stack ;
} ;

doormen.ValidatorError.prototype = Object.create( TypeError.prototype ) ;
doormen.ValidatorError.prototype.constructor = doormen.ValidatorError ;
doormen.ValidatorError.prototype.name = 'ValidatorError' ;



doormen.SchemaError = function SchemaError( message )
{
	this.message = message ;
	//this.stack = Error().stack ;
} ;

doormen.SchemaError.prototype = Object.create( TypeError.prototype ) ;
doormen.SchemaError.prototype.constructor = doormen.SchemaError ;
doormen.SchemaError.prototype.name = 'SchemaError' ;



doormen.typeTest = {
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
	
	// Meta type
	realNumber: function( data ) { return typeof data === 'number' && ! isNaN( data ) && isFinite( data ) ; }
} ;



function check( data , schema , options , runtime , element )
{
	if ( schema.type )
	{
		if ( ! doormen.typeTest[ schema.type ] )
		{
			throw new doormen.SchemaError( "Bad schema, unexistant type '" + schema.type + "'." ) ;
		}
		
		if ( ! doormen.typeTest[ schema.type ]( data ) )
		{
			throw new doormen.ValidatorError( ( element.path || '(it)' ) + " is not a " + schema.type + "." ) ;
		}
	}
}





			/* Assertion specific utilities */



doormen.shouldThrow = function shouldThrow( fn )
{
	var throwed = false ;
	
	try { fn() ; }
	catch ( error ) { throwed = true ; }
	
	if ( ! throwed )
	{
		throw new Error( "Function '" + ( fn.name || '(anonymous)' ) + "' has not thrown." ) ;
	}
} ;



// Inverse validation
doormen.not = function not()
{
	doormen.shouldThrow( function() {
		doormen.apply( undefined , arguments ) ;
	} ) ;
} ;



