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
	
	
	min: function min( data , params , messagePath ) {
		
		if ( typeof params !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'min' should be a number." ) ;
		}
		
		// Negative test here, because of NaN
		if ( typeof data !== 'number' || ! ( data >= params ) )	// jshint ignore:line
		{
			throw new doormen.ValidatorError( messagePath + " is not greater than or equals to " + params + "." ) ;
		}
		
		
		if ( data === params ) { return true ; }
		if ( typeof data === 'number' && typeof params === 'number' && isNaN( data ) && isNaN( params ) ) { return true ; }
		return false ;
	} ,
	
	max: function max( data , params , messagePath ) {
		
		if ( typeof params !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'max' should be a number." ) ;
		}
		
		// Negative test here, because of NaN
		if ( typeof data !== 'number' || ! ( data <= params ) )	// jshint ignore:line
		{
			throw new doormen.ValidatorError( messagePath + " is not lesser than or equals to " + params + "." ) ;
		}
	} ,
	
	length: function length( data , params , messagePath ) {
		
		if ( typeof params !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'length' should be a number." ) ;
		}
		
		// Nasty tricks ;)
		try {
			if ( ! ( data.length === params ) ) { throw true ; }	// jshint ignore:line
		}
		catch ( error ) {
			throw new doormen.ValidatorError( messagePath + " has not a length greater than or equals to " + params + "." ) ;
		}
	} ,
	
	minLength: function minLength( data , params , messagePath ) {
		
		if ( typeof params !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'minLength' should be a number." ) ;
		}
		
		// Nasty tricks ;)
		try {
			if ( ! ( data.length >= params ) ) { throw true ; }	// jshint ignore:line
		}
		catch ( error ) {
			throw new doormen.ValidatorError( messagePath + " has not a length greater than or equals to " + params + "." ) ;
		}
	} ,
	
	maxLength: function maxLength( data , params , messagePath ) {
		
		if ( typeof params !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'maxLength' should be a number." ) ;
		}
		
		// Nasty tricks ;)
		try {
			if ( ! ( data.length <= params ) ) { throw true ; }	// jshint ignore:line
		}
		catch ( error ) {
			throw new doormen.ValidatorError( messagePath + " has not a length lesser than or equals to " + params + "." ) ;
		}
	} ,
	
	match: function match( data , params , messagePath ) {
		
		if ( typeof params !== 'string' && ! ( params instanceof RegExp ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'match' should be a RegExp or a string." ) ;
		}
		
		if ( params instanceof RegExp )
		{
			if ( typeof data !== 'string' || ! data.match( params ) )
			{
				throw new doormen.ValidatorError( messagePath + " does not match " + params + " ." ) ;
			}
		}
		else
		{
			if ( typeof data !== 'string' || ! data.match( new RegExp( params ) ) )
			{
				throw new doormen.ValidatorError( messagePath + " does not match /" + params + "/ ." ) ;
			}
		}
	} ,
	
	in: function in_( data , params , messagePath ) {
		
		var i , found = false ;
		
		if ( ! Array.isArray( params ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'in' should be an array." ) ;
		}
		
		for ( i = 0 ; i < params.length ; i ++ )
		{
			if ( doormen.utils.equals( data , params[ i ] ) ) { found = true ; break ; }
		}
		
		if ( ! found )
		{
			throw new doormen.ValidatorError( messagePath + " should be in " + JSON.stringify( params ) + "." ) ;
		}
	} ,
	
	notIn: function notIn( data , params , messagePath ) {
		
		var i ;
		
		if ( ! Array.isArray( params ) )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'not-in' should be an array." ) ;
		}
		
		for ( i = 0 ; i < params.length ; i ++ )
		{
			if ( doormen.utils.equals( data , params[ i ] ) )
			{
				throw new doormen.ValidatorError( messagePath + " should not be in " + JSON.stringify( params ) + "." ) ;
			}
		}
	} ,
	
} ;


