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


