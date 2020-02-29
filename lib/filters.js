/*
	Doormen

	Copyright (c) 2015 - 2020 Cédric Ronvel

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



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.filters ) { global.DOORMEN_GLOBAL_EXTENSIONS.filters = {} ; }

const filters = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.filters ) ;
module.exports = filters ;

const doormen = require( './core.js' ) ;



filters.instanceOf = function( data , params , element ) {
	if ( typeof params === 'string' ) {
		params = doormen.isBrowser ?
			window[ params ] :
			global[ params ] ;
	}

	if ( typeof params !== 'function' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'instanceOf' should be a function or a global function's name." ) ;
	}

	if ( ! ( data instanceof params ) ) {
		this.validatorError( element.path + " is not an instance of " + params + "." , element ) ;
	}
} ;



filters.eq = filters[ '===' ] = function( data , params , element ) {
	if ( data !== params ) {
		this.validatorError( element.path + " is not stricly equal to " + params + "." , element ) ;
	}
} ;



filters.min = filters.gte = filters.greaterThanOrEqual = filters[ '>=' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'min' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data >= params ) )	{
		this.validatorError( element.path + " is not greater than or equal to " + params + "." , element ) ;
	}
} ;



filters.max = filters.lte = filters.lesserThanOrEqual = filters[ '<=' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'max' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data <= params ) )	{
		this.validatorError( element.path + " is not lesser than or equal to " + params + "." , element ) ;
	}
} ;



filters.gt = filters.greaterThan = filters[ '>' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'greaterThan' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data > params ) ) {
		this.validatorError( element.path + " is not greater than " + params + "." , element ) ;
	}
} ;



filters.lt = filters.lesserThan = filters[ '<' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'lesserThan' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data < params ) ) {
		this.validatorError( element.path + " is not lesser than " + params + "." , element ) ;
	}
} ;



filters.length = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'length' should be a number." ) ;
	}

	// Nasty tricks ;)
	try {
		if ( ! ( data.length === params ) ) { throw true ; }
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length equal to " + params + "." , element ) ;
	}
} ;



filters.minLength = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'minLength' should be a number." ) ;
	}

	// Nasty tricks ;)
	try {
		if ( ! ( data.length >= params ) ) { throw true ; }
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length greater than or equal to " + params + "." , element ) ;
	}
} ;



filters.maxLength = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'maxLength' should be a number." ) ;
	}

	// Nasty tricks ;)
	try {
		if ( ! ( data.length <= params ) ) { throw true ; }
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length lesser than or equal to " + params + "." , element ) ;
	}
} ;



filters.match = function( data , params , element ) {
	if ( typeof params !== 'string' && ! ( params instanceof RegExp ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'match' should be a RegExp or a string." ) ;
	}

	if ( params instanceof RegExp ) {
		if ( typeof data !== 'string' || ! data.match( params ) ) {
			this.validatorError( element.path + " does not match " + params + " ." , element ) ;
		}
	}
	else if ( typeof data !== 'string' || ! data.match( new RegExp( params ) ) ) {
		this.validatorError( element.path + " does not match /" + params + "/ ." , element ) ;
	}
} ;



filters.in = function( data , params , element ) {
	var i , found = false ;

	if ( ! Array.isArray( params ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'in' should be an array." ) ;
	}

	for ( i = 0 ; i < params.length ; i ++ ) {
		if ( doormen.isEqual( data , params[ i ] ) ) { found = true ; break ; }
	}

	if ( ! found ) {
		this.validatorError( element.path + " should be in " + JSON.stringify( params ) + "." , element ) ;
	}
} ;



filters.notIn = function( data , params , element ) {
	var i ;

	if ( ! Array.isArray( params ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'not-in' should be an array." ) ;
	}

	for ( i = 0 ; i < params.length ; i ++ ) {
		if ( doormen.isEqual( data , params[ i ] ) ) {
			this.validatorError( element.path + " should not be in " + JSON.stringify( params ) + "." , element ) ;
		}
	}
} ;

