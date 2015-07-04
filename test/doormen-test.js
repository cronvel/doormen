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

/* jshint unused:false */
/* global describe, it, before, after */



var tree = require( 'tree-kit' ) ;

var doormen ;

if ( process.argv.length )
{
	// We are running in Node.js
	doormen = require( '../lib/doormen.js' ) ;
}
else
{
	// We are running in a browser
	//console.log( 'Running browser version' ) ;
	doormen = require( '../lib/browser.js' ) ;
}

var expect = require( 'expect.js' ) ;



describe( "Assertion utilities" , function() {
	
	it( "doormen.shouldThrow() should throw if the callback has not throw, and catch if it has throw" , function() {
		
		var thrown ;
		
		
		thrown = false ;
		
		try {
			doormen.shouldThrow( function() {} ) ;
		}
		catch ( error ) {
			thrown = true ;
		}
		
		if ( ! thrown ) { throw new Error( 'It should throw!' ) ; }
		
		
		thrown = false ;
		
		try {
			doormen.shouldThrow( function() { throw new Error( 'Fatal error' ) ; } ) ;
		}
		catch ( error ) {
			thrown = true ;
		}
		
		if ( thrown ) { throw new Error( 'It should *NOT* throw' ) ; }
		
	} ) ;
	
	it( "doormen.not() should throw if the data validate, and catch if it has throw" , function() {
		
		var thrown ;
		
		
		thrown = false ;
		
		try {
			doormen.not( { type: 'string' } , 'text' ) ;
		}
		catch ( error ) {
			thrown = true ;
		}
		
		if ( ! thrown ) { throw new Error( 'It should throw' ) ; }
		
		
		thrown = false ;
		
		try {
			doormen.not( { type: 'string' } , 1 ) ;
		}
		catch ( error ) {
			thrown = true ;
		}
		
		if ( thrown ) { throw new Error( 'It should *NOT* throw' ) ; }
		
	} ) ;
} ) ;


	
describe( "Equality checker" , function() {
	
	it( "Equality of simple type" , function() {
		
		doormen.equals( undefined , undefined ) ;
		doormen.equals( null , null ) ;
		doormen.equals( true , true ) ;
		doormen.equals( false , false ) ;
		doormen.not.equals( undefined , null ) ;
		doormen.not.equals( true , false ) ;
		doormen.not.equals( null , false ) ;
		doormen.not.equals( undefined , false ) ;
		
		doormen.equals( NaN , NaN ) ;
		doormen.not.equals( NaN , null ) ;
		doormen.not.equals( NaN , undefined ) ;
		
		doormen.equals( Infinity , Infinity ) ;
		doormen.equals( -Infinity , -Infinity ) ;
		doormen.not.equals( Infinity , -Infinity ) ;
		
		doormen.equals( 0 , 0 ) ;
		doormen.equals( 123 , 123 ) ;
		doormen.equals( 0.123 , 0.123 ) ;
		
		doormen.equals( "" , "" ) ;
		doormen.equals( "abc" , "abc" ) ;
		doormen.equals( "   abc" , "   abc" ) ;
		doormen.equals( "abc  " , "abc  " ) ;
		doormen.equals( "     abc  " , "     abc  " ) ;
		
		doormen.not.equals( 0 , "" ) ;
		doormen.not.equals( false , "" ) ;
	} ) ;
		
	it( "Equality of objects" , function() {
		
		var o = {} ;
		
		doormen.equals( {} , {} ) ;
		doormen.equals( o , o ) ;
		doormen.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 } ) ;
		doormen.not.equals( { a: 2 , b: 6 } , { a: 2 , b: 5 } ) ;
		doormen.equals( { b: 5 , a: 2 } , { a: 2 , b: 5 } ) ;
		doormen.not.equals( { a: 2 , b: 5 , c: null } , { a: 2 , b: 5 } ) ;
		doormen.not.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: null } ) ;
		
		doormen.not.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 } ) ;
		doormen.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 , c: {} } ) ;
		doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' } } ) ;
		doormen.not.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'toto' } } ) ;
		doormen.equals(
			{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } } ,
			{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } }
		) ;
	} ) ;
	
	it( "when a property is undefined in the left-side and non-existant in the right-side, they should be equals" , function() {
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 } ) ;
		doormen.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , c: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , d: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' , e: undefined } } ) ;
	} ) ;
	
	it( "should test equality of objects with different prototype" ) ;
		
	it( "Equality of arrays" , function() {
		
		var o = [] ;
		
		doormen.equals( [] , [] ) ;
		doormen.equals( o , o ) ;
		doormen.equals( [ 1 ] , [ 1 ] ) ;
		doormen.not.equals( [ 1 , undefined ] , [ 1 ] ) ;
		doormen.not.equals( [ 1 ] , [ 1 , undefined ] ) ;
		doormen.not.equals( [ 1 ] , [ 2 ] ) ;
		doormen.equals( [ 1 , 2 , 3 ] , [ 1 , 2 , 3 ] ) ;
		doormen.equals( [ 1 , [] , 3 ] , [ 1 , [] , 3 ] ) ;
		doormen.equals( [ 1 , [ 2 ] , 3 ] , [ 1 , [ 2 ] , 3 ] ) ;
		doormen.equals( [ 1 , [ 2 , 'a' ] , 3 ] , [ 1 , [ 2 , 'a' ] , 3 ] ) ;
		doormen.not.equals( [ 1 , [ 2 , 'a' ] , 3 ] , [ 1 , [ 2 , 'b' ] , 3 ] ) ;
		doormen.equals( [ 1 , [ 2 , [ null ] , 'a' ] , 3 ] , [ 1 , [ 2 , [ null ] , 'a' ] , 3 ] ) ;
		doormen.not.equals( [ 1 , [ 2 , [ undefined ] , 'a' ] , 3 ] , [ 1 , [ 2 , [ null ] , 'a' ] , 3 ] ) ;
	} ) ;
	
	it( "Equality of nested and mixed objects and arrays" , function() {
		
		doormen.not.equals( {} , [] ) ;
		doormen.equals(
			{ a: 2 , b: 5 , c: [ 'titi' , { f: 'f' , g: 7 } ] } ,
			{ a: 2 , b: 5 , c: [ 'titi' , { f: 'f' , g: 7 } ] }
		) ;
		doormen.equals(
			[ 'a' , 'b' , { c: 'titi' , d: [ 'f' , 7 ] } ] ,
			[ 'a' , 'b' , { c: 'titi' , d: [ 'f' , 7 ] } ]
		) ;
	} ) ;
		
	it( "Circular references: stop searching when both part have reached circular references" , function() {
		
		var a , b ;
		
		a = { a: 1, b: 2 } ;
		a.c = a ;
		
		b = { a: 1, b: 2 } ;
		b.c = b ;
		
		doormen.equals( a , b ) ;
		
		a = { a: 1, b: 2 , c: { a: 1, b: 2 } } ;
		a.c.c = a ;
		
		b = { a: 1, b: 2 } ;
		b.c = b ;
		
		doormen.equals( a , b ) ;
	} ) ;
} ) ;



describe( "Optional and default data" , function() {
	
	it( "when a data is null, undefined or unexistant, and the optional flag is set the schema, it should validate" , function() {
		
		doormen.not( { type: 'string' } , null ) ;
		doormen( { optional: true, type: 'string' } , null ) ;
		doormen.not( { type: 'string' } , undefined ) ;
		doormen( { optional: true, type: 'string' } , undefined ) ;
		
		doormen( { type: 'string' } , 'text' ) ;
		doormen( { optional: true, type: 'string' } , 'text' ) ;
		doormen.not( { type: 'string' } , 1 ) ;
		doormen.not( { optional: true, type: 'string' } , 1 ) ;
		
		doormen.not( { properties: { a: { type: 'string' } } } , {} ) ;
		doormen( { properties: { a: { optional: true, type: 'string' } } } , {} ) ;
	} ) ;
	
	it( "missing optional properties should not be created (i.e. with undefined)." , function() {
		
		var result ;
		
		result = doormen( { properties: { a: { optional: true, type: 'string' } } } , {} ) ;
		
		// {a:undefined} is equals to {} for doormen.equals() (this is the correct behaviour), but here we want to know for sure
		// that a key is not defined, so we have to check it explicitly
		
		doormen.equals( 'a' in result , false ) ;
		
		result = doormen( {
				properties: {
					a: { optional: true, type: 'string' },
					b: { optional: true, type: 'string' },
					c: {
						optional: true,
						properties: {
							d: { optional: true, type: 'string' }
						}
					}
				}
			} ,
			{}
		) ;
		
		doormen.equals( 'a' in result , false ) ;
		doormen.equals( 'b' in result , false ) ;
		doormen.equals( 'c' in result , false ) ;
		
		result = doormen( {
				properties: {
					a: { optional: true, type: 'string' },
					b: { optional: true, type: 'string' },
					c: {
						optional: true,
						properties: {
							d: { optional: true, type: 'string' }
						}
					}
				}
			} ,
			{ c: undefined }
		) ;
		
		doormen.equals( 'a' in result , false ) ;
		doormen.equals( 'b' in result , false ) ;
		doormen.equals( 'c' in result , true ) ;
		doormen.equals( result.c , undefined ) ;
		
		result = doormen( {
				properties: {
					a: { optional: true, type: 'string' },
					b: { optional: true, type: 'string' },
					c: {
						optional: true,
						properties: {
							d: { optional: true, type: 'string' }
						}
					}
				}
			} ,
			{ c: null }
		) ;
		
		doormen.equals( 'a' in result , false ) ;
		doormen.equals( 'b' in result , false ) ;
		doormen.equals( 'c' in result , true ) ;
		doormen.equals( result.c , null ) ;
		
		result = doormen( {
				properties: {
					a: { optional: true, type: 'string' },
					b: { optional: true, type: 'string' },
					c: {
						optional: true,
						properties: {
							d: { optional: true, type: 'string' }
						}
					}
				}
			} ,
			{ c: {} }
		) ;
		
		doormen.equals( 'a' in result , false ) ;
		doormen.equals( 'b' in result , false ) ;
		doormen.equals( 'c' in result , true ) ;
		doormen.equals( 'd' in result.c , false ) ;
	} ) ;
	
	it( "when a data is null, undefined or unexistant, and a default value is specified in the schema, that default value should overwrite the original one" , function() {
		doormen.equals( doormen( { type: 'string' , "default": 'default!' } , null ) , 'default!' ) ;
		doormen.equals(
			doormen(
				{ properties: { a: { type: 'string' , "default": 'default!' } } } ,
				{ a: null } ) ,
			{ a: 'default!' }
		) ;
		doormen.equals(
			doormen(
				{ properties: { a: { type: 'string' , "default": 'default!' } , b: { type: 'object' , "default": { c: 5 } } } } ,
				{ a: null, b: undefined } ) ,
			{ a: 'default!' , b: { c: 5 } }
		) ;
		doormen.equals(
			doormen(
				{ properties: { a: { type: 'string' , "default": 'default!' } , b: { type: 'object' , "default": { c: 5 } } } } ,
				{} ) ,
			{ a: 'default!' , b: { c: 5 } }
		) ;
	} ) ;
	
} ) ;



describe( "Basic types" , function() {
	
	it( "should validate undefined accordingly" , function() {
		doormen( { type: 'undefined' } , undefined ) ;
		doormen.not( { type: 'undefined' } , null ) ;
		doormen.not( { type: 'undefined' } , false ) ;
		doormen.not( { type: 'undefined' } , true ) ;
		doormen.not( { type: 'undefined' } , 0 ) ;
		doormen.not( { type: 'undefined' } , 1 ) ;
		doormen.not( { type: 'undefined' } , '' ) ;
		doormen.not( { type: 'undefined' } , 'text' ) ;
		doormen.not( { type: 'undefined' } , {} ) ;
		doormen.not( { type: 'undefined' } , [] ) ;
	} ) ;
	
	it( "should validate null accordingly" , function() {
		doormen.not( { type: 'null' } , undefined ) ;
		doormen( { type: 'null' } , null ) ;
		doormen.not( { type: 'null' } , false ) ;
		doormen.not( { type: 'null' } , true ) ;
		doormen.not( { type: 'null' } , 0 ) ;
		doormen.not( { type: 'null' } , 1 ) ;
		doormen.not( { type: 'null' } , '' ) ;
		doormen.not( { type: 'null' } , 'text' ) ;
		doormen.not( { type: 'null' } , {} ) ;
		doormen.not( { type: 'null' } , [] ) ;
	} ) ;
	
	it( "should validate boolean accordingly" , function() {
		doormen.not( { type: 'boolean' } , undefined ) ;
		doormen.not( { type: 'boolean' } , null ) ;
		doormen( { type: 'boolean' } , false ) ;
		doormen( { type: 'boolean' } , true ) ;
		doormen.not( { type: 'boolean' } , 0 ) ;
		doormen.not( { type: 'boolean' } , 1 ) ;
		doormen.not( { type: 'boolean' } , '' ) ;
		doormen.not( { type: 'boolean' } , 'text' ) ;
		doormen.not( { type: 'boolean' } , {} ) ;
		doormen.not( { type: 'boolean' } , [] ) ;
	} ) ;
	
	it( "should validate number accordingly" , function() {
		doormen.not( { type: 'number' } , undefined ) ;
		doormen.not( { type: 'number' } , null ) ;
		doormen.not( { type: 'number' } , false ) ;
		doormen.not( { type: 'number' } , true ) ;
		doormen( { type: 'number' } , 0 ) ;
		doormen( { type: 'number' } , 1 ) ;
		doormen( { type: 'number' } , Infinity ) ;
		doormen( { type: 'number' } , NaN ) ;
		doormen.not( { type: 'number' } , '' ) ;
		doormen.not( { type: 'number' } , 'text' ) ;
		doormen.not( { type: 'number' } , {} ) ;
		doormen.not( { type: 'number' } , [] ) ;
	} ) ;
	
	it( "should validate string accordingly" , function() {
		doormen.not( { type: 'string' } , undefined ) ;
		doormen.not( { type: 'string' } , null ) ;
		doormen.not( { type: 'string' } , false ) ;
		doormen.not( { type: 'string' } , true ) ;
		doormen.not( { type: 'string' } , 0 ) ;
		doormen.not( { type: 'string' } , 1 ) ;
		doormen( { type: 'string' } , '' ) ;
		doormen( { type: 'string' } , 'text' ) ;
		doormen.not( { type: 'string' } , {} ) ;
		doormen.not( { type: 'string' } , [] ) ;
	} ) ;
	
	it( "should validate object accordingly" , function() {
		doormen.not( { type: 'object' } , undefined ) ;
		doormen.not( { type: 'object' } , null ) ;
		doormen.not( { type: 'object' } , false ) ;
		doormen.not( { type: 'object' } , true ) ;
		doormen.not( { type: 'object' } , 0 ) ;
		doormen.not( { type: 'object' } , 1 ) ;
		doormen.not( { type: 'object' } , '' ) ;
		doormen.not( { type: 'object' } , 'text' ) ;
		doormen( { type: 'object' } , {} ) ;
		doormen( { type: 'object' } , { a:1 , b:2 } ) ;
		doormen( { type: 'object' } , [] ) ;
		doormen( { type: 'object' } , [ 1,2,3 ] ) ;
		doormen( { type: 'object' } , new Date() ) ;
		doormen.not( { type: 'object' } , function(){} ) ;
	} ) ;
	
	it( "should validate function accordingly" , function() {
		doormen.not( { type: 'function' } , undefined ) ;
		doormen.not( { type: 'function' } , null ) ;
		doormen.not( { type: 'function' } , false ) ;
		doormen.not( { type: 'function' } , true ) ;
		doormen.not( { type: 'function' } , 0 ) ;
		doormen.not( { type: 'function' } , 1 ) ;
		doormen.not( { type: 'function' } , '' ) ;
		doormen.not( { type: 'function' } , 'text' ) ;
		doormen.not( { type: 'function' } , {} ) ;
		doormen.not( { type: 'function' } , [] ) ;
		doormen( { type: 'function' } , function(){} ) ;
	} ) ;
} ) ;
	


describe( "Built-in types" , function() {
	
	it( "should validate array accordingly" , function() {
		doormen.not( { type: 'array' } , undefined ) ;
		doormen.not( { type: 'array' } , null ) ;
		doormen.not( { type: 'array' } , false ) ;
		doormen.not( { type: 'array' } , true ) ;
		doormen.not( { type: 'array' } , 0 ) ;
		doormen.not( { type: 'array' } , 1 ) ;
		doormen.not( { type: 'array' } , '' ) ;
		doormen.not( { type: 'array' } , 'text' ) ;
		doormen.not( { type: 'array' } , {} ) ;
		doormen.not( { type: 'array' } , { a:1 , b:2 } ) ;
		doormen( { type: 'array' } , [] ) ;
		doormen( { type: 'array' } , [ 1,2,3 ] ) ;
		doormen.not( { type: 'array' } , function(){} ) ;
	} ) ;
	
	it( "should validate date accordingly" , function() {
		doormen( { type: 'date' } , new Date() ) ;
		
		doormen.not( { type: 'date' } , undefined ) ;
		doormen.not( { type: 'date' } , null ) ;
		doormen.not( { type: 'date' } , false ) ;
		doormen.not( { type: 'date' } , true ) ;
		doormen.not( { type: 'date' } , 0 ) ;
		doormen.not( { type: 'date' } , 1 ) ;
		doormen.not( { type: 'date' } , '' ) ;
		doormen.not( { type: 'date' } , 'text' ) ;
		doormen.not( { type: 'date' } , {} ) ;
		doormen.not( { type: 'date' } , { a:1 , b:2 } ) ;
		doormen.not( { type: 'date' } , [] ) ;
		doormen.not( { type: 'date' } , [ 1,2,3 ] ) ;
		doormen.not( { type: 'date' } , function(){} ) ;
	} ) ;
	
	it( "should validate error accordingly" , function() {
		doormen( { type: 'error' } , new Error() ) ;
		
		doormen.not( { type: 'error' } , undefined ) ;
		doormen.not( { type: 'error' } , null ) ;
		doormen.not( { type: 'error' } , false ) ;
		doormen.not( { type: 'error' } , true ) ;
		doormen.not( { type: 'error' } , 0 ) ;
		doormen.not( { type: 'error' } , 1 ) ;
		doormen.not( { type: 'error' } , '' ) ;
		doormen.not( { type: 'error' } , 'text' ) ;
		doormen.not( { type: 'error' } , {} ) ;
		doormen.not( { type: 'error' } , { a:1 , b:2 } ) ;
		doormen.not( { type: 'error' } , [] ) ;
		doormen.not( { type: 'error' } , [ 1,2,3 ] ) ;
		doormen.not( { type: 'error' } , function(){} ) ;
	} ) ;
	
	it( "should validate arguments accordingly" , function() {
		var fn = function() { doormen( { type: 'arguments' } , arguments ) ; } ;
		
		fn() ;
		fn( 1 ) ;
		fn( 1 , 2 , 3 ) ;
		
		doormen.not( { type: 'arguments' } , undefined ) ;
		doormen.not( { type: 'arguments' } , null ) ;
		doormen.not( { type: 'arguments' } , false ) ;
		doormen.not( { type: 'arguments' } , true ) ;
		doormen.not( { type: 'arguments' } , 0 ) ;
		doormen.not( { type: 'arguments' } , 1 ) ;
		doormen.not( { type: 'arguments' } , '' ) ;
		doormen.not( { type: 'arguments' } , 'text' ) ;
		doormen.not( { type: 'arguments' } , {} ) ;
		doormen.not( { type: 'arguments' } , { a:1 , b:2 } ) ;
		doormen.not( { type: 'arguments' } , [] ) ;
		doormen.not( { type: 'arguments' } , [ 1,2,3 ] ) ;
		doormen.not( { type: 'arguments' } , function(){} ) ;
	} ) ;
} ) ;



describe( "Mixed types" , function() {
	
	it( "should validate 'strictObject' accordingly, i.e. objects that are *NOT* arrays" , function() {
		doormen.not( { type: 'strictObject' } , undefined ) ;
		doormen.not( { type: 'strictObject' } , null ) ;
		doormen.not( { type: 'strictObject' } , false ) ;
		doormen.not( { type: 'strictObject' } , true ) ;
		doormen.not( { type: 'strictObject' } , 0 ) ;
		doormen.not( { type: 'strictObject' } , 1 ) ;
		doormen.not( { type: 'strictObject' } , '' ) ;
		doormen.not( { type: 'strictObject' } , 'text' ) ;
		doormen( { type: 'strictObject' } , {} ) ;
		doormen( { type: 'strictObject' } , { a:1 , b:2 } ) ;
		doormen.not( { type: 'strictObject' } , [] ) ;
		doormen.not( { type: 'strictObject' } , [ 1,2,3 ] ) ;
		doormen.not( { type: 'strictObject' } , function(){} ) ;
	} ) ;
	
	it( "should validate 'regexp' accordingly, i.e. RegExp instance or string convertible to RegExp" , function() {
		doormen( { type: 'regexp' } , /Random/ ) ;
		doormen( { type: 'regexp' } , new RegExp( "Random" ) ) ;
		doormen( { type: 'regexp' } , "Random" ) ;
		doormen.not( { type: 'regexp' } , "(Random" ) ;
		
		doormen.not( { type: 'regexp' } , undefined ) ;
		doormen.not( { type: 'regexp' } , null ) ;
		doormen.not( { type: 'regexp' } , false ) ;
		doormen.not( { type: 'regexp' } , true ) ;
		doormen.not( { type: 'regexp' } , 0 ) ;
		doormen.not( { type: 'regexp' } , 1 ) ;
		doormen( { type: 'regexp' } , '' ) ;
		doormen( { type: 'regexp' } , 'text' ) ;
		doormen.not( { type: 'regexp' } , {} ) ;
		doormen.not( { type: 'regexp' } , { a:1 , b:2 } ) ;
		doormen.not( { type: 'regexp' } , [] ) ;
		doormen.not( { type: 'regexp' } , [ 1,2,3 ] ) ;
		doormen.not( { type: 'regexp' } , function(){} ) ;
	} ) ;
	
	it( "should validate 'classId' accordingly, i.e. function (constructor) or non-empty string" , function() {
		doormen.not( { type: 'classId' } , undefined ) ;
		doormen.not( { type: 'classId' } , null ) ;
		doormen.not( { type: 'classId' } , false ) ;
		doormen.not( { type: 'classId' } , true ) ;
		doormen.not( { type: 'classId' } , 0 ) ;
		doormen.not( { type: 'classId' } , 1 ) ;
		doormen.not( { type: 'classId' } , '' ) ;
		doormen( { type: 'classId' } , 'text' ) ;
		doormen.not( { type: 'classId' } , {} ) ;
		doormen.not( { type: 'classId' } , { a:1 , b:2 } ) ;
		doormen.not( { type: 'classId' } , [] ) ;
		doormen.not( { type: 'classId' } , [ 1,2,3 ] ) ;
		doormen( { type: 'classId' } , function(){} ) ;
	} ) ;
	
} ) ;



describe( "Top-level filters" , function() {
	
	it( "'instanceOf' should validate object accordingly" , function() {
		if ( doormen.isBrowser ) { window[ 'MyClass' ] = function MyClass(){} ; }
		else { global[ 'MyClass' ] = function MyClass(){} ; }
		
		doormen( { instanceOf: Date } , new Date ) ;
		doormen( { instanceOf: Array } , new Array ) ;	// jshint ignore:line
		doormen( { instanceOf: MyClass } , new MyClass() ) ;
		doormen( { instanceOf: Object } , new MyClass() ) ;
		
		doormen( { instanceOf: 'MyClass' } , new MyClass() ) ;
		doormen( { instanceOf: 'Object' } , new MyClass() ) ;
		
		doormen.not( { instanceOf: Date } , new Array ) ;
		doormen.not( { instanceOf: 'Date' } , new Array ) ;
	} ) ;
	
	it( "min filter should validate accordingly, non-number should throw" , function() {
		doormen( { min: 3 } , 10 ) ;
		doormen( { min: 3 } , 3 ) ;
		doormen.not( { min: 3 } , 1 ) ;
		doormen.not( { min: 3 } , 0 ) ;
		doormen.not( { min: 3 } , -10 ) ;
		doormen( { min: 3 } , Infinity ) ;
		doormen( { min: Infinity } , Infinity ) ;
		doormen.not( { min: 3 } , -Infinity ) ;
		doormen.not( { min: 3 } , NaN ) ;
		doormen.not( { min: 3 } , true ) ;
		doormen.not( { min: 3 } , false ) ;
		doormen.not( { min: 3 } , undefined ) ;
		doormen.not( { min: 0 } , undefined ) ;
		doormen.not( { min: -3 } , undefined ) ;
		doormen.not( { min: 3 } , '10' ) ;
	} ) ;
	
	it( "max filter should validate accordingly, non-number should throw" , function() {
		doormen.not( { max: 3 } , 10 ) ;
		doormen( { max: 3 } , 3 ) ;
		doormen( { max: 3 } , 1 ) ;
		doormen( { max: 3 } , 0 ) ;
		doormen( { max: 3 } , -10 ) ;
		doormen.not( { max: 3 } , Infinity ) ;
		doormen( { max: 3 } , -Infinity ) ;
		doormen( { max: -Infinity } , -Infinity ) ;
		doormen.not( { max: 3 } , NaN ) ;
		doormen.not( { max: 3 } , true ) ;
		doormen.not( { max: 3 } , false ) ;
		doormen.not( { max: 3 } , '1' ) ;
	} ) ;
	
	it( "min + max filter should validate accordingly, non-number should throw" , function() {
		doormen.not( { min: 3, max: 10 } , 15 ) ;
		doormen( { min: 3, max: 10 } , 10 ) ;
		doormen( { min: 3, max: 10 } , 5 ) ;
		doormen( { min: 3, max: 10 } , 3 ) ;
		doormen.not( { min: 3, max: 10 } , 1 ) ;
		doormen.not( { min: 3, max: 10 } , 0 ) ;
		doormen.not( { min: 3, max: 10 } , -10 ) ;
		doormen.not( { min: 3, max: 10 } , Infinity ) ;
		doormen.not( { min: 3, max: 10 } , -Infinity ) ;
		doormen.not( { min: 3, max: 10 } , NaN ) ;
		doormen.not( { min: 3, max: 10 } , true ) ;
		doormen.not( { min: 3, max: 10 } , false ) ;
		doormen.not( { min: 3, max: 10 } , '6' ) ;
	} ) ;
	
	it( "'length' filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( { length: 3 } , "abc" ) ;
		doormen.not( { length: 3 } , "abcde" ) ;
		doormen.not( { length: 3 } , "ab" ) ;
		doormen.not( { length: 3 } , "" ) ;
		
		doormen.not( { length: 3 } , 1 ) ;
		doormen.not( { length: 0 } , 1 ) ;
		doormen.not( { length: 3 } , NaN ) ;
		doormen.not( { length: 3 } , true ) ;
		doormen.not( { length: 3 } , false ) ;
	} ) ;
	
	it( "minLength filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( { minLength: 3 } , "abc" ) ;
		doormen( { minLength: 3 } , "abcde" ) ;
		doormen.not( { minLength: 3 } , "ab" ) ;
		doormen.not( { minLength: 3 } , "" ) ;
		
		doormen.not( { minLength: 3 } , 1 ) ;
		doormen.not( { minLength: 0 } , 1 ) ;
		doormen.not( { minLength: 3 } , NaN ) ;
		doormen.not( { minLength: 3 } , true ) ;
		doormen.not( { minLength: 3 } , false ) ;
	} ) ;
	
	it( "maxLength filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( { maxLength: 3 } , "abc" ) ;
		doormen.not( { maxLength: 3 } , "abcde" ) ;
		doormen( { maxLength: 3 } , "ab" ) ;
		doormen( { maxLength: 3 } , "" ) ;
		
		doormen.not( { maxLength: 3 } , 1 ) ;
		doormen.not( { maxLength: 0 } , 1 ) ;
		doormen.not( { maxLength: 3 } , NaN ) ;
		doormen.not( { maxLength: 3 } , true ) ;
		doormen.not( { maxLength: 3 } , false ) ;
	} ) ;
	
	it( "minLength + maxLength filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( { minLength: 3 , maxLength: 5 } , "abc" ) ;
		doormen( { minLength: 3 , maxLength: 5 } , "abcd" ) ;
		doormen( { minLength: 3 , maxLength: 5 } , "abcde" ) ;
		doormen.not( { minLength: 3 , maxLength: 5 } , "abcdef" ) ;
		doormen.not( { minLength: 3 , maxLength: 5 } , "ab" ) ;
		doormen.not( { minLength: 3 , maxLength: 5 } , "" ) ;
		
		doormen.not( { minLength: 3 , maxLength: 5 } , 1 ) ;
		doormen.not( { maxLength: 0 } , 1 ) ;
		doormen.not( { minLength: 3 , maxLength: 5 } , NaN ) ;
		doormen.not( { minLength: 3 , maxLength: 5 } , true ) ;
		doormen.not( { minLength: 3 , maxLength: 5 } , false ) ;
	} ) ;
	
	it( "'match' filter should validate accordingly using a RegExp" , function() {
		doormen( { match: "^[a-f]*$" } , "" ) ;
		doormen.not( { match: "^[a-f]+$" } , "" ) ;
		doormen( { match: "^[a-f]*$" } , "abc" ) ;
		doormen( { match: "^[a-f]*$" } , "abcdef" ) ;
		doormen.not( { match: "^[a-f]*$" } , "ghi" ) ;
		doormen.not( { match: /^[a-f]*$/ } , "ghi" ) ;
		
		doormen.not( { match: "^[a-f]*$" } , 1 ) ;
		doormen.not( { match: "^[a-f]*$" } , NaN ) ;
		doormen.not( { match: "^[a-f]*$" } , true ) ;
		doormen.not( { match: "^[a-f]*$" } , false ) ;
	} ) ;
	
	it( "'in' filter should validate if the value is listed" , function() {
		doormen.not( { in: [ 1,5,7 ] } , 10 ) ;
		doormen( { in: [ 1,5,7 ] } , 5 ) ;
		doormen( { in: [ 1,5,7 ] } , 1 ) ;
		doormen.not( { in: [ 1,5,7 ] } , 0 ) ;
		doormen.not( { in: [ 1,5,7 ] } , -10 ) ;
		doormen.not( { in: [ 1,5,7 ] } , Infinity ) ;
		doormen( { in: [ 1,5,Infinity,7 ] } , Infinity ) ;
		doormen.not( { in: [ 1,5,7 ] } , -Infinity ) ;
		doormen.not( { in: [ 1,5,7 ] } , NaN ) ;
		doormen( { in: [ 1,5,NaN,7 ] } , NaN ) ;
		
		doormen( { in: [ 1,true,5,7 ] } , true ) ;
		doormen.not( { in: [ 1,5,7 ] } , true ) ;
		doormen( { in: [ 1,false,5,7 ] } , false ) ;
		doormen.not( { in: [ 1,5,7 ] } , false ) ;
		
		doormen.not( { in: [ 1,5,7 ] } , "text" ) ;
		doormen( { in: [ 1,"text",5,7 ] } , "text" ) ;
		doormen( { in: [ "string", "text", "bob" ] } , "text" ) ;
		doormen.not( { in: [ "string", "text", "bob" ] } , "bobby" ) ;
		doormen( { in: [ "string", "text", "" ] } , "" ) ;
		doormen.not( { in: [ "string", "text", "bob" ] } , "" ) ;
	} ) ;
	
	it( "'notIn' filter should validate if the value is listed" , function() {
		doormen( { notIn: [ 1,5,7 ] } , 10 ) ;
		doormen.not( { notIn: [ 1,5,7 ] } , 5 ) ;
		doormen.not( { notIn: [ 1,5,7 ] } , 1 ) ;
		doormen( { notIn: [ 1,5,7 ] } , 0 ) ;
		doormen( { notIn: [ 1,5,7 ] } , -10 ) ;
		doormen( { notIn: [ 1,5,7 ] } , Infinity ) ;
		doormen.not( { notIn: [ 1,5,Infinity,7 ] } , Infinity ) ;
		doormen( { notIn: [ 1,5,7 ] } , -Infinity ) ;
		doormen( { notIn: [ 1,5,7 ] } , NaN ) ;
		doormen.not( { notIn: [ 1,5,NaN,7 ] } , NaN ) ;
		
		doormen.not( { notIn: [ 1,true,5,7 ] } , true ) ;
		doormen( { notIn: [ 1,5,7 ] } , true ) ;
		doormen.not( { notIn: [ 1,false,5,7 ] } , false ) ;
		doormen( { notIn: [ 1,5,7 ] } , false ) ;
		
		doormen( { notIn: [ 1,5,7 ] } , "text" ) ;
		doormen.not( { notIn: [ 1,"text",5,7 ] } , "text" ) ;
		doormen.not( { notIn: [ "string", "text", "bob" ] } , "text" ) ;
		doormen( { notIn: [ "string", "text", "bob" ] } , "bobby" ) ;
		doormen.not( { notIn: [ "string", "text", "" ] } , "" ) ;
		doormen( { notIn: [ "string", "text", "bob" ] } , "" ) ;
	} ) ;
	
	it( "'in' filter containing object and arrays" , function() {
		doormen( { in: [ 1 , { a: 2 } , 5 , 7 ] } , { a: 2 } ) ;
		doormen.not( { in: [ 1 , { a: 2 } , 5 , 7 ] } , { a: 2 , b: 5 } ) ;
		doormen.not( { in: [ 1 , { a: 2 } , { b: 5 } , 7 ] } , { a: 2 , b: 5 } ) ;
		doormen( { in: [ 1 , { a: 2 } , { a: 2 , b: 5 } , { b: 5 } , 7 ] } , { a: 2 , b: 5 } ) ;
		doormen( { in: [ 1 , [ 'a', 2 ] , 5 , 7 ] } , [ 'a' , 2 ] ) ;
		doormen.not( { in: [ 1 , [ 'a', 2 , 3 ] , 5 , 7 ] } , [ 'a' , 2 ] ) ;
	} ) ;
} ) ;



describe( "Filters" , function() {
	
	it( "'greaterThan' and aliases ('gt' and '>') filter should validate accordingly, non-number should throw" , function() {
		doormen( { filter: { greaterThan: 3 } } , 10 ) ;
		doormen( { filter: { greaterThan: 3 } } , 3.00001 ) ;
		doormen.not( { filter: { greaterThan: 3 } } , 3 ) ;
		doormen.not( { filter: { greaterThan: 3 } } , 1 ) ;
		doormen.not( { filter: { greaterThan: 3 } } , 0 ) ;
		doormen.not( { filter: { greaterThan: 3 } } , -10 ) ;
		doormen( { filter: { greaterThan: 3 } } , Infinity ) ;
		doormen.not( { filter: { greaterThan: Infinity } } , Infinity ) ;
		doormen.not( { filter: { greaterThan: 3 } } , -Infinity ) ;
		doormen.not( { filter: { greaterThan: 3 } } , NaN ) ;
		doormen.not( { filter: { greaterThan: 3 } } , true ) ;
		doormen.not( { filter: { greaterThan: 3 } } , false ) ;
		doormen.not( { filter: { greaterThan: 3 } } , undefined ) ;
		doormen.not( { filter: { greaterThan: 0 } } , undefined ) ;
		doormen.not( { filter: { greaterThan: -3 } } , undefined ) ;
		doormen.not( { filter: { greaterThan: 3 } } , '10' ) ;
		
		doormen( { filter: { gt: 3 } } , 3.00001) ;
		doormen.not( { filter: { gt: 3 } } , 3 ) ;
		doormen( { filter: { '>': 3 } } , 3.00001 ) ;
		doormen.not( { filter: { '>': 3 } } , 3 ) ;
	} ) ;
	
	it( "'lesserThan' and aliases ('lt' and '<') filter should validate accordingly, non-number should throw" , function() {
		doormen.not( { filter: { lesserThan: 3 } } , 10 ) ;
		doormen( { filter: { lesserThan: 3 } } , 2.999 ) ;
		doormen.not( { filter: { lesserThan: 3 } } , 3 ) ;
		doormen( { filter: { lesserThan: 3 } } , 1 ) ;
		doormen( { filter: { lesserThan: 3 } } , 0 ) ;
		doormen( { filter: { lesserThan: 3 } } , -10 ) ;
		doormen.not( { filter: { lesserThan: 3 } } , Infinity ) ;
		doormen( { filter: { lesserThan: 3 } } , -Infinity ) ;
		doormen.not( { filter: { lesserThan: -Infinity } } , -Infinity ) ;
		doormen.not( { filter: { lesserThan: 3 } } , NaN ) ;
		doormen.not( { filter: { lesserThan: 3 } } , true ) ;
		doormen.not( { filter: { lesserThan: 3 } } , false ) ;
		doormen.not( { filter: { lesserThan: 3 } } , '1' ) ;
		
		doormen( { filter: { lt: 3 } } , 2.999 ) ;
		doormen.not( { filter: { lt: 3 } } , 3 ) ;
		doormen( { filter: { '<': 3 } } , 2.999 ) ;
		doormen.not( { filter: { '<': 3 } } , 3 ) ;
	} ) ;
} ) ;



describe( "Children and recursivity" , function() {
	
	it( "'of' should perform the check recursively for each children, using the same given schema for all of them." , function() {
		
		var schema = {
			of: { type: 'string' }
		} ;
		
		// Object
		doormen( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
		doormen.not( schema , { a: 1, b: 'text' } ) ;
		doormen.not( schema , { a: 'text', b: 3 } ) ;
		doormen( schema , { a: 'text', b: 'string' } ) ;
		doormen.not( schema , { A: 'TEXT', b: 'text' , c: undefined } ) ;
		
		// Array
		doormen( schema , [ 'text' ] ) ;
		doormen( schema , [] ) ;
		doormen( schema , [ 'text' , 'string' ] ) ;
		doormen.not( schema , [ 'text' , 'string' , null ] ) ;
		doormen.not( schema , [ 1 , 'text' , 'string' ] ) ;
		doormen.not( schema , [ 'text' , 'string' , null ] ) ;
		doormen.not( schema , [ true ] ) ;
		
		doormen.not( schema , 'text' ) ;
		doormen.not( schema , 5 ) ;
		doormen.not( schema , null ) ;
		doormen.not( schema , undefined ) ;
	} ) ;
	
	it( "when 'properties' is an array, it should check if the value has all listed properties, no extra properties are allowed" , function() {
		
		var schema = {
			properties: [ 'a' , 'b' ]
		} ;
		
		doormen( schema , { a: 1, b: 'text' } ) ;
		doormen( schema , { a: 'text', b: 3 } ) ;
		doormen.not( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
		
		doormen.not( schema , 'text' ) ;
		doormen.not( schema , 5 ) ;
		doormen.not( schema , null ) ;
		doormen.not( schema , undefined ) ;
	} ) ;
	
	it( "when 'properties' is an array and 'extraProperties' is set, it should allow non-listed extra-properties" , function() {
		
		var schema = {
			properties: [ 'a' , 'b' ],
			extraProperties: true
		} ;
		
		doormen( schema , { a: 1, b: 'text' } ) ;
		doormen( schema , { a: 'text', b: 3 } ) ;
		doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
		
		doormen.not( schema , 'text' ) ;
		doormen.not( schema , 5 ) ;
		doormen.not( schema , null ) ;
		doormen.not( schema , undefined ) ;
	} ) ;
	
	it( "when 'properties' is an object, it should perform the check recursively for each listed child, no extra properties are allowed" , function() {
		
		var schema = {
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			}
		} ;
		
		doormen( schema , { a: 1, b: 'text' } ) ;
		doormen.not( schema , { a: 'text', b: 3 } ) ;
		doormen.not( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
		
		doormen.not( schema , 'text' ) ;
		doormen.not( schema , 5 ) ;
		doormen.not( schema , null ) ;
		doormen.not( schema , undefined ) ;
	} ) ;
	
	it( "when 'properties' is an object and 'extraProperties' is set, it should allow extra-properties" , function() {
		
		var schema = {
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			},
			extraProperties: true
		} ;
		
		doormen( schema , { a: 1, b: 'text' } ) ;
		doormen.not( schema , { a: 'text', b: 3 } ) ;
		doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
		
		doormen.not( schema , 'text' ) ;
		doormen.not( schema , 5 ) ;
		doormen.not( schema , null ) ;
		doormen.not( schema , undefined ) ;
	} ) ;
	
	it( "'elements' should perform the check recursively for each children elements, using a specific schema for each one, extra-element are not allowed" , function() {
		
		var schema = {
			elements: [
				{ type: 'string' },
				{ type: 'number' },
				{ type: 'boolean' }
			]
		} ;
		
		doormen( schema , [ 'text' , 3 , false ] ) ;
		doormen.not( schema , [ 'text' , 3 , false , 'extra' , true ] ) ;
		doormen.not( schema , [] ) ;
		doormen.not( schema , [ 'text' , 3 ] ) ;
		doormen.not( schema , [ true ] ) ;
		
		doormen.not( schema , {} ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , 'text' ) ;
		doormen.not( schema , 5 ) ;
		doormen.not( schema , null ) ;
		doormen.not( schema , undefined ) ;
	} ) ;
	
	it( "when 'elements' is used in conjunction with 'extraElements', extra-elements are allowed" , function() {
		
		var schema = {
			elements: [
				{ type: 'string' },
				{ type: 'number' },
				{ type: 'boolean' }
			],
			extraElements: true
		} ;
		
		doormen( schema , [ 'text' , 3 , false ] ) ;
		doormen( schema , [ 'text' , 3 , false , 'extra' , true ] ) ;
		doormen.not( schema , [] ) ;
		doormen.not( schema , [ 'text' , 3 ] ) ;
		doormen.not( schema , [ true ] ) ;
		
		doormen.not( schema , {} ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , 'text' ) ;
		doormen.not( schema , 5 ) ;
		doormen.not( schema , null ) ;
		doormen.not( schema , undefined ) ;
	} ) ;
} ) ;

	

describe( "Properties having 'when'" , function() {
	
	it( "zzz when 'properties' is an object and one child's schema contains a 'when' properties, it should be deleted if the 'verify' condition is met for the 'sibling'" , function() {
		
		var schema = {
			properties: {
				a: {
					type: 'number'
				},
				b: {
					type: 'string' ,
					when: {
						sibling: 'a',
						verify: { in: [ 1 ] },
						set: undefined
					}
				}
			}
		} ;
		
		doormen.equals(
			doormen( schema , { a: 0, b: 'text' } ) ,
			{ a: 0, b: 'text' }
		) ;
		
		console.log( "TOFIX: " , doormen( schema , { a: 1, b: 'text' } ) ) ;
		doormen.equals(
			doormen( schema , { a: 1, b: 'text' } ) ,
			{ a: 1 }
		) ;
		
		doormen.not( schema , { a: 0 } ) ;
		
		doormen.equals(
			doormen( schema , { a: 1 } ) ,
			{ a: 1 }
		) ;
		
		
		var schema = {
			properties: {
				b: {
					type: 'string' ,
					when: {
						sibling: 'a',
						verify: { in: [ 1 ] },
						set: undefined
					}
				},
				a: {
					type: 'number'
				}
			}
		} ;
		
		doormen.equals(
			doormen( schema , { a: 0, b: 'text' } ) ,
			{ a: 0, b: 'text' }
		) ;
		
		doormen.equals(
			doormen( schema , { a: 1, b: 'text' } ) ,
			{ a: 1 }
		) ;
		
		doormen.not( schema , { a: 0 } ) ;
		
		doormen.equals(
			doormen( schema , { a: 1 } ) ,
			{ a: 1 }
		) ;
	} ) ;
	
	it( "complex dependencies tests" , function() {
		
		var schema = {
			properties: {
				c: {
					type: 'string' ,
					when: {
						sibling: 'b',
						verify: { in: [ undefined , 'text' ] },
						set: undefined
					}
				},
				b: {
					type: 'string' ,
					when: {
						sibling: 'a',
						verify: { in: [ 1 ] },
						set: undefined
					}
				},
				a: {
					type: 'number'
				}
			}
		} ;
		
		doormen.equals(
			doormen( schema , { a: 0, b: 'text', c: 'toto' } ) ,
			{ a: 0, b: 'text' }
		) ;
		
		doormen.equals(
			doormen( schema , { a: 0, b: 'text' } ) ,
			{ a: 0, b: 'text' }
		) ;
		
		doormen.equals(
			doormen( schema , { a: 1, b: 'text' } ) ,
			{ a: 1 }
		) ;
		
		doormen.equals(
			doormen( schema , { a: 1, b: undefined } ) ,
			{ a: 1 }
		) ;
		
		doormen.not( schema , { a: 0, b: undefined } ) ;
		doormen.not( schema , { a: 0 } ) ;
		
		doormen.equals(
			doormen( schema , { a: 1 } ) ,
			{ a: 1 }
		) ;
	} ) ;
	
	it( "when circular 'when' properties exists, it should throw" , function() {
		
		var schema = {
			properties: {
				a: {
					type: 'number',
					when: {
						sibling: 'b',
						verify: { in: [ 'text' ] },
						set: undefined
					}
				},
				b: {
					type: 'string' ,
					when: {
						sibling: 'a',
						verify: { in: [ 1 ] },
						set: undefined
					}
				}
			}
		} ;
		
		// Circular 'when' throw
		doormen.not( schema , { a: 0, b: 'text' } ) ;
		
		var schema = {
			properties: {
				a: {
					type: 'number',
					when: {
						sibling: 'a',
						verify: { in: [ 1 ] },
						set: undefined
					}
				}
			}
		} ;
		
		// Circular 'when' throw
		doormen.not( schema , { a: 0, b: 'text' } ) ;
	} ) ;
} ) ;



describe( "Numbers meta types" , function() {
	
	it( "should validate real accordingly" , function() {
		doormen( 0 , { type: 'real' } ) ;
		doormen( 1 , { type: 'real' } ) ;
		doormen( -1 , { type: 'real' } ) ;
		doormen( 0.3 , { type: 'real' } ) ;
		doormen( 18.36 , { type: 'real' } ) ;
		doormen.not( 1/0 , { type: 'real' } ) ;
		doormen.not( -1/0 , { type: 'real' } ) ;
		doormen.not( Infinity , { type: 'real' } ) ;
		doormen.not( -Infinity , { type: 'real' } ) ;
		doormen.not( NaN , { type: 'real' } ) ;
		
		doormen.not( undefined , { type: 'real' } ) ;
		doormen.not( null , { type: 'real' } ) ;
		doormen.not( false , { type: 'real' } ) ;
		doormen.not( true , { type: 'real' } ) ;
		doormen.not( '' , { type: 'real' } ) ;
		doormen.not( 'text' , { type: 'real' } ) ;
		doormen.not( {} , { type: 'real' } ) ;
		doormen.not( [] , { type: 'real' } ) ;
	} ) ;
	
	it( "should validate integer accordingly" , function() {
		doormen( 0 , { type: 'integer' } ) ;
		doormen( 1 , { type: 'integer' } ) ;
		doormen( 123456789 , { type: 'integer' } ) ;
		doormen( -1 , { type: 'integer' } ) ;
		doormen.not( 0.00001 , { type: 'integer' } ) ;
		doormen.not( -0.00001 , { type: 'integer' } ) ;
		doormen.not( 123456.00001 , { type: 'integer' } ) ;
		doormen.not( 123456.99999 , { type: 'integer' } ) ;
		doormen.not( 0.3 , { type: 'integer' } ) ;
		doormen.not( 18.36 , { type: 'integer' } ) ;
		doormen.not( 1/0 , { type: 'integer' } ) ;
		doormen.not( Infinity , { type: 'integer' } ) ;
		doormen.not( -Infinity , { type: 'integer' } ) ;
		doormen.not( NaN , { type: 'integer' } ) ;
		
		doormen.not( undefined , { type: 'integer' } ) ;
		doormen.not( null , { type: 'integer' } ) ;
		doormen.not( false , { type: 'integer' } ) ;
		doormen.not( true , { type: 'integer' } ) ;
		doormen.not( '' , { type: 'integer' } ) ;
		doormen.not( 'text' , { type: 'integer' } ) ;
		doormen.not( {} , { type: 'integer' } ) ;
		doormen.not( [] , { type: 'integer' } ) ;
	} ) ;
} ) ;



describe( "Strings meta types" , function() {
	
	it( "should validate ipv4 accordingly" , function() {
		doormen( '127.0.0.1' , { type: 'ipv4' } ) ;
		doormen( '127.000.00.001' , { type: 'ipv4' } ) ;
		doormen.not( '127.0000.00.001' , { type: 'ipv4' } ) ;
		doormen.not( '0127.000.00.001' , { type: 'ipv4' } ) ;
		doormen.not( '127.0.0.0001' , { type: 'ipv4' } ) ;
		doormen.not( '127.0.0.' , { type: 'ipv4' } ) ;
		doormen.not( '127.0.0.256' , { type: 'ipv4' } ) ;
		doormen.not( '127.0.0.1.' , { type: 'ipv4' } ) ;
		doormen.not( '.127.0.0.1' , { type: 'ipv4' } ) ;
		doormen.not( '.127.0.0.' , { type: 'ipv4' } ) ;
	} ) ;
		
	it( "should validate ipv6 accordingly" , function() {
		
		doormen( '2001:0db8:0000:0000:0000:ff00:0042:8329' , { type: 'ipv6' } ) ;
		doormen.not( ':2001:0db8:0000:0000:0000:ff00:0042:8329' , { type: 'ipv6' } ) ;
		doormen.not( 'abcd:2001:0db8:0000:0000:0000:ff00:0042:8329' , { type: 'ipv6' } ) ;
		doormen.not( '2001:0db8:0000:0000:0000:ff00:0042:8329:' , { type: 'ipv6' } ) ;
		doormen.not( '2001:0000:0000:0000:ff00:0042:8329:' , { type: 'ipv6' } ) ;
		doormen.not( ':2001:0000:0000:0000:ff00:0042:8329' , { type: 'ipv6' } ) ;
		doormen( '2001:db8:0:0:0:ff00:0042:8329' , { type: 'ipv6' } ) ;
		doormen( '2001:db8::ff00:0042:8329' , { type: 'ipv6' } ) ;
		doormen.not( '2001:db8:::0042:8329' , { type: 'ipv6' } ) ;
		doormen.not( '2001:db8::ff00::0042:8329' , { type: 'ipv6' } ) ;
		doormen.not( '2001::ff00::0042:8329' , { type: 'ipv6' } ) ;
		doormen( '::1' , { type: 'ipv6' } ) ;
		doormen( '1::' , { type: 'ipv6' } ) ;
	} ) ;
	
	it( "should validate ip accordingly" , function() {
		
		doormen( '127.0.0.1' , { type: 'ip' } ) ;
		doormen( '127.000.00.001' , { type: 'ip' } ) ;
		doormen.not( '127.0000.00.001' , { type: 'ip' } ) ;
		doormen.not( '0127.000.00.001' , { type: 'ip' } ) ;
		doormen.not( '127.0.0.0001' , { type: 'ip' } ) ;
		doormen.not( '127.0.0.' , { type: 'ip' } ) ;
		doormen.not( '127.0.0.256' , { type: 'ip' } ) ;
		doormen.not( '127.0.0.1.' , { type: 'ip' } ) ;
		doormen.not( '.127.0.0.1' , { type: 'ip' } ) ;
		doormen.not( '.127.0.0.' , { type: 'ip' } ) ;
		
		doormen( '2001:0db8:0000:0000:0000:ff00:0042:8329' , { type: 'ip' } ) ;
		doormen.not( ':2001:0db8:0000:0000:0000:ff00:0042:8329' , { type: 'ip' } ) ;
		doormen.not( 'abcd:2001:0db8:0000:0000:0000:ff00:0042:8329' , { type: 'ip' } ) ;
		doormen.not( '2001:0db8:0000:0000:0000:ff00:0042:8329:' , { type: 'ip' } ) ;
		doormen.not( '2001:0000:0000:0000:ff00:0042:8329:' , { type: 'ip' } ) ;
		doormen.not( ':2001:0000:0000:0000:ff00:0042:8329' , { type: 'ip' } ) ;
		doormen( '2001:db8:0:0:0:ff00:0042:8329' , { type: 'ip' } ) ;
		doormen( '2001:db8::ff00:0042:8329' , { type: 'ip' } ) ;
		doormen.not( '2001:db8:::0042:8329' , { type: 'ip' } ) ;
		doormen.not( '2001:db8::ff00::0042:8329' , { type: 'ip' } ) ;
		doormen.not( '2001::ff00::0042:8329' , { type: 'ip' } ) ;
		doormen( '::1' , { type: 'ip' } ) ;
		doormen( '1::' , { type: 'ip' } ) ;
	} ) ;
		
	it( "should validate hostname accordingly" ) ;
	
	it( "should validate url accordingly" , function() {
		doormen( 'http://google.com' , { type: 'url' } ) ;
		doormen( 'http://google.com/' , { type: 'url' } ) ;
		doormen( 'https://stackoverflow.com/questions/1303872/url-validation-using-javascript' , { type: 'url' } ) ;
		doormen( 'http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2' , { type: 'url' } ) ;
		doormen( 'https://uk.reuters.com/article/2013/02/25/rosneft-tender-idUKL6N0BPJZC20130225' , { type: 'url' } ) ;
		doormen( 'http://grooveshark.com/#!/massive_attack' , { type: 'url' } ) ;
		doormen( 'http://::1/#!/massive_attack' , { type: 'url' } ) ;
		doormen( 'http://127.0.0.1/' , { type: 'url' } ) ;
		doormen( 'http://localhost/' , { type: 'url' } ) ;
		doormen( 'http://localhost:8080/' , { type: 'url' } ) ;
		doormen( 'http://bob@localhost/' , { type: 'url' } ) ;
		doormen( 'http://bob:pw@localhost/' , { type: 'url' } ) ;
		doormen.not( 'http://127.0.0.1/spaces not allowed' , { type: 'url' } ) ;
		doormen.not( 'http://127.0.0/' , { type: 'url' } ) ;
		doormen.not( 'http://192.168.0.256/' , { type: 'url' } ) ;
		doormen.not( 'http://19.16.33.25.6/' , { type: 'url' } ) ;
		doormen( 'file:///home/toto/TODO.txt' , { type: 'url' } ) ;
		doormen.not( 'http:///google.com/' , { type: 'url' } ) ;
		doormen.not( 'google.com' , { type: 'url' } ) ;
	} ) ;
	
	it( "should validate web url accordingly" , function() {
		doormen( 'http://google.com' , { type: 'weburl' } ) ;
		doormen( 'https://stackoverflow.com/questions/1303872/url-validation-using-javascript' , { type: 'weburl' } ) ;
		doormen( 'http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2' , { type: 'weburl' } ) ;
		doormen( 'https://uk.reuters.com/article/2013/02/25/rosneft-tender-idUKL6N0BPJZC20130225' , { type: 'weburl' } ) ;
		doormen( 'http://grooveshark.com/#!/massive_attack' , { type: 'weburl' } ) ;
		doormen( 'http://127.0.0.1/#!/massive_attack' , { type: 'weburl' } ) ;
		doormen( 'http://::1/#!/massive_attack' , { type: 'weburl' } ) ;
		doormen( 'http://127.0.0.1/' , { type: 'weburl' } ) ;
		doormen.not( 'http://127.0.0.1/spaces not allowed' , { type: 'weburl' } ) ;
		doormen.not( 'http://127.0.0/' , { type: 'weburl' } ) ;
		doormen.not( 'http://192.168.0.256/' , { type: 'weburl' } ) ;
		doormen.not( 'http://19.16.33.25.6/' , { type: 'weburl' } ) ;
		doormen.not( 'file:///home/toto/TODO.txt' , { type: 'weburl' } ) ;
		doormen.not( 'google.com' , { type: 'weburl' } ) ;
	} ) ;
	
	it( "should validate email accordingly" , function() {
		doormen( 'bob@gmail.com' , { type: 'email' } ) ;
		doormen( 'cedric.ronvel@gmail.com' , { type: 'email' } ) ;
		doormen( 'cédric.ronvel@gmail.com' , { type: 'email' } ) ;
		doormen( 'Cédric.Ronvel@gmail.com' , { type: 'email' } ) ;
		doormen( 'söm3-2än.dOm+çH4r@g33-mail.ninja' , { type: 'email' } ) ;
		doormen.not( 'bobgmail.com' , { type: 'email' } ) ;
		doormen.not( 'bob.@gmail.com' , { type: 'email' } ) ;
		doormen.not( '.bob@gmail.com' , { type: 'email' } ) ;
		doormen.not( 'bob..bob@gmail.com' , { type: 'email' } ) ;
		doormen( 'bob.a.bob@gmail.com' , { type: 'email' } ) ;
		doormen.not( 'bob @gmail.com' , { type: 'email' } ) ;
		doormen.not( ' bob@gmail.com' , { type: 'email' } ) ;
		doormen.not( 'b b@gmail.com' , { type: 'email' } ) ;
	} ) ;
} ) ;



describe( "Sanitize" , function() {
	
	it( "should sanitize to 'toNumber' accordingly" , function() {
		doormen.equals( doormen( 0 , { sanitize: 'toNumber' } ) , 0 ) ;
		doormen.equals( doormen( '0' , { sanitize: 'toNumber' } ) , 0 ) ;
		doormen.equals( doormen( 1 , { sanitize: 'toNumber' } ) , 1 ) ;
		doormen.equals( doormen( '1' , { sanitize: 'toNumber' } ) , 1 ) ;
	} ) ;
	
	it( "should sanitize to 'toArray' accordingly" , function() {
		doormen.equals( doormen( [] , { sanitize: 'toArray' } ) , [] ) ;
		doormen.equals( doormen( [ 1,2,3 ] , { sanitize: 'toArray' } ) , [ 1,2,3 ] ) ;
		doormen.equals( doormen( { a: 'Ah!' , b: 'bee' } , { sanitize: 'toArray' } ) , [ { a: 'Ah!' , b: 'bee' } ] ) ;
		doormen.equals( doormen( 0 , { sanitize: 'toArray' } ) , [ 0 ] ) ;
		doormen.equals( doormen( 'a' , { sanitize: 'toArray' } ) , [ 'a' ] ) ;
		
		var fn = function() { return doormen( arguments , { sanitize: 'toArray' } ) ; } ;
		doormen.equals( fn() , [] ) ;
		doormen.equals( fn( 1,2,3 ) , [ 1,2,3 ] ) ;
		doormen.equals( fn( { yeepee: 'yaa' } , 'yeah' , true ) , [ { yeepee: 'yaa' } , 'yeah' , true ] ) ;
		doormen.equals( Array.isArray( fn( 1,2,3 ) ) , true ) ;
		doormen.equals( Array.isArray( arguments ) , false ) ;
	} ) ;
	
	it( "should remove extra properties accordingly" , function() {
		
		var schema ;
		
		schema = {
			sanitize: 'removeExtraProperties',
			properties: [ 'a' , 'b' ]
		} ;
		
		doormen( schema , { a: 1, b: 'text' } ) ;
		doormen( schema , { a: 'text', b: 3 } ) ;
		doormen.equals( doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;
		doormen.equals( doormen( schema , { omg: 'noob!', A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;
		
		
		schema = {
			sanitize: 'removeExtraProperties',
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			}
		} ;
		
		doormen( schema , { a: 1, b: 'text' } ) ;
		doormen.not( schema , { a: 'text', b: 3 } ) ;
		doormen.equals( doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;
		doormen.equals( doormen( schema , { omg: 'noob!', A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;
	} ) ;
	
	it( "should trim a string accordingly" , function() {
		doormen.equals( doormen( 'a' , { sanitize: 'trim' } ) , 'a' ) ;
		doormen.equals( doormen( '  a' , { sanitize: 'trim' } ) , 'a' ) ;
		doormen.equals( doormen( 'a  ' , { sanitize: 'trim' } ) , 'a' ) ;
		doormen.equals( doormen( '  a  ' , { sanitize: 'trim' } ) , 'a' ) ;
		doormen.equals( doormen( 'ab  cd' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
		doormen.equals( doormen( '   ab  cd' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
		doormen.equals( doormen( 'ab  cd   ' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
		doormen.equals( doormen( '   ab  cd   ' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
	} ) ;
	
	it( "should sanitize to 'toUpperCase' accordingly" , function() {
		doormen.equals( doormen( 'aBc dE f' , { sanitize: 'toUpperCase' } ) , 'ABC DE F' ) ;
	} ) ;
	
	it( "should sanitize to 'toLowerCase' accordingly" , function() {
		doormen.equals( doormen( 'aBc dE f' , { sanitize: 'toLowerCase' } ) , 'abc de f' ) ;
	} ) ;
	
	it( "should sanitize to 'dashToCamelCase' accordingly" , function() {
		doormen.equals( doormen( 'to-upper-case' , { sanitize: 'dashToCamelCase' } ) , 'toUpperCase' ) ;
		doormen.equals( doormen( 'toUpperCase' , { sanitize: 'dashToCamelCase' } ) , 'toUpperCase' ) ;
	} ) ;
	
	it( "sanitize should work recursively as well" , function() {
		doormen.equals( doormen( {} , { of: { sanitize: 'trim' } } ) , {} ) ;
		doormen.equals( doormen( { a: ' toto  ' } , { of: { sanitize: 'trim' } } ) , { a: 'toto' } ) ;
		doormen.equals( doormen( { a: ' toto  ' , b: 'text  ' } , { of: { sanitize: 'trim' } } ) , { a: 'toto' , b: 'text' } ) ;
		doormen.equals( doormen(
				{ a: ' toto  ' , b: 'text  ' } ,
				{ of: { sanitize: 'trim' } } ) ,
			{ a: 'toto' , b: 'text' }
		) ;
		doormen.equals( doormen(
				{ a: ' toto  ' , b: 'text  ' } ,
				{ extraProperties: true, properties: { a: { sanitize: 'trim' } } } ) ,
			{ a: 'toto' , b: 'text  ' }
		) ;
		doormen.equals( doormen(
				{ a: ' toto  ' , b: 'text  ' } ,
				{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ) ,
			{ a: 'toto' , b: 'text' }
		) ;
	} ) ;
} ) ;



describe( "Full report mode" , function() {
	
	it( "should return an object with all containing weither it valid or not, the sanitized data, and an array of errors" , function() {
		
		var report , schema ;
		
		schema = {
			of: { type: 'string' , sanitize: 'trim' }
		} ;
		
		report = doormen.report( { a: 'abc', b: '  def  ' } ) ;
		//console.log( report ) ;
		doormen.equals( report.validate , true ) ;
		doormen.equals( report.sanitized , { a: 'abc', b: 'def' } ) ;
		doormen.equals( report.errors.length , 0 ) ;
		
		report = doormen.report( { a: true, b: 3 } ) ;
		//console.log( report ) ;
		doormen.equals( report.validate , false ) ;
		doormen.equals( report.sanitized , { a: true, b: 3 } ) ;
		doormen.equals( report.errors.length , 2 ) ;
		
		schema = {
			properties: {
				a: { type: 'string' , sanitize: 'trim' } ,
				b: { type: 'string' , sanitize: 'trim' } ,
				c: { of: { type: 'string' , sanitize: 'trim' } }
			}
		} ;
		
		report = doormen.report( { a: '  abc  ', b: 3 , c: { d: true , e: 'def  ' } } ) ;
		//console.log( report ) ;
		doormen.equals( report.validate , false ) ;
		doormen.equals( report.sanitized , { a: 'abc', b: 3 , c: { d: true , e: 'def' } } ) ;
		doormen.equals( report.errors.length , 2 ) ;
	} ) ;
	
	it( "Check error messages" ) ;
} ) ;



describe( "Alternatives" , function() {
	
	it( "Basic schema alternatives" , function() {
		doormen( true , [ { type: 'boolean' } , { type: 'number' } ] ) ;
		doormen( 5 , [ { type: 'boolean' } , { type: 'number' } ] ) ;
		doormen.not( 'toto' , [ { type: 'boolean' } , { type: 'number' } ] ) ;
	} ) ;
	
	it( "Schema alternatives 'export' tests" ) ;
	it( "Schema alternatives needs more tests" ) ;
} ) ;



describe( "Purify" , function() {
	
	it( "Purify a basic schema" , function() {
		doormen.equals( doormen.purifySchema( { type: 'string' } ) , { type: 'string' } ) ;
		doormen.equals( doormen.purifySchema( { type: 'string' , random: 'stuff' } ) , { type: 'string' } ) ;
		
		doormen.equals( doormen.purifySchema(
			{
				extraProperties: true,
				properties: {
					a: { optional: true , type: 'object' , of: { type: 'string' } },
					b: { type: 'array' , sanitize: 'toArray' , of: { type: 'integer' , min: 4 , max: 7 , random: 'stuff' } },
					c: { default: 'default' , type: 'string' },
					d: { filter: { blah: 'blih' } },
					e: { properties: [ 'one' , 'two' , 'three' ] },
					f: { random: 'stuff' , type: 'integer' , sanitize: [ 'some' , 'sanitizers' ] },
					g: { in: [ { some: 'data' } , { some: 'other data' } ] },
					h: { notIn: [ { some: 'data' } , { some: 'other data' } ] },
					i: { match: /a regexp/ , minLength: 4 , maxLength: 11 , length: 6 },
					j: { match: "a regexp compatible string" },
					k: { instanceOf: 'Date' },
					l: { instanceOf: Date },
					m: { of: [ { type: 'array' } , { type: 'string' } ] },
					n: { properties: { a: [ { type: 'array' } , { type: 'string' } ] } },
					o: { elements: [ { type: 'array' } , { type: 'string' } ] },
					p: { elements: [ [ { type: 'array' } , { type: 'string' } ] ] },
					q: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] }, set: 'bob' } },
					r: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] } } },
				}
			}
			) ,
			{
				extraProperties: true,
				properties: {
					a: { optional: true , type: 'object' , of: { type: 'string' } },
					b: { type: 'array' , sanitize: [ 'toArray' ] , of: { type: 'integer' , min: 4 , max: 7 } },
					c: { default: 'default' , type: 'string' },
					d: { filter: { blah: 'blih' } },
					e: { properties: [ 'one' , 'two' , 'three' ] },
					f: { type: 'integer' , sanitize: [ 'some' , 'sanitizers' ] },
					g: { in: [ { some: 'data' } , { some: 'other data' } ] },
					h: { notIn: [ { some: 'data' } , { some: 'other data' } ] },
					i: { match: /a regexp/ , minLength: 4 , maxLength: 11 , length: 6 },
					j: { match: "a regexp compatible string" },
					k: { instanceOf: 'Date' },
					l: { instanceOf: Date },
					m: { of: [ { type: 'array' } , { type: 'string' } ] },
					n: { properties: { a: [ { type: 'array' } , { type: 'string' } ] } },
					o: { elements: [ { type: 'array' } , { type: 'string' } ] },
					p: { elements: [ [ { type: 'array' } , { type: 'string' } ] ] },
					q: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] }, set: 'bob' } },
					r: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] } } },
				}
			}
		) ;
		
	} ) ;
	
	it( "Purify needs more tests (alternatives, etc)" ) ;
} ) ;



describe( "Export mode" , function() {
	
	it( ".export() and 'of'" , function() {
		
		var data , schema , returned ;
		
		schema = {
			of: { type: 'string' , sanitize: 'trim' }
		} ;
		
		data = { a: 'abc', b: '  def  ' } ;
		returned = doormen.export( data ) ;
		doormen.equals( data , { a: 'abc', b: '  def  ' } ) ;
		doormen.equals( returned , { a: 'abc', b: 'def' } ) ;
		
		returned = doormen( schema , data ) ;
		doormen.equals( data , { a: 'abc', b: 'def' } ) ;
		doormen.equals( returned , { a: 'abc', b: 'def' } ) ;
	} ) ;
	
	it( ".export() and 'properties'" , function() {
		
		var data , schema , returned ;
		
		schema = {
			properties: {
				a: { type: 'string' , sanitize: 'toUpperCase' },
				b: { type: 'string' , sanitize: 'trim' }
			}
		} ;
		
		data = { a: 'abc', b: '  def  ' } ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , { a: 'abc', b: '  def  ' } ) ;
		doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;
		
		returned = doormen( schema , data ) ;
		doormen.equals( data , { a: 'ABC', b: 'def' } ) ;
		doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;
		
		data = { a: 'abc', b: '  def  ', c: 'toto' } ;
		doormen.shouldThrow( function() {
			returned = doormen.export( schema , data ) ;
		} ) ;
		
		schema.extraProperties = true ;
		data = { a: 'abc', b: '  def  ', c: 'toto' } ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , { a: 'abc', b: '  def  ', c: 'toto' } ) ;
		doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;
		
		returned = doormen( schema , data ) ;
		doormen.equals( data , { a: 'ABC', b: 'def', c: 'toto' } ) ;
		doormen.equals( returned , { a: 'ABC', b: 'def', c: 'toto' } ) ;
	} ) ;
	
	it( ".export() and 'elements'" , function() {
		
		var data , schema , returned ;
		
		schema = {
			elements: [
				{ type: 'string' , sanitize: 'toUpperCase' },
				{ type: 'string' , sanitize: 'trim' }
			]
		} ;
		
		data = [ 'abc', '  def  ' ] ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , [ 'abc', '  def  ' ] ) ;
		doormen.equals( returned , [ 'ABC', 'def' ] ) ;
		
		returned = doormen( schema , data ) ;
		doormen.equals( data , [ 'ABC', 'def' ] ) ;
		doormen.equals( returned , [ 'ABC', 'def' ] ) ;
		
		data = [ 'abc', '  def  ', 'toto' ] ;
		doormen.shouldThrow( function() {
			returned = doormen.export( schema , data ) ;
		} ) ;
		
		schema.extraElements = true ;
		data = [ 'abc', '  def  ', 'toto' ] ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , [ 'abc', '  def  ', 'toto' ] ) ;
		doormen.equals( returned , [ 'ABC', 'def' ] ) ;
		
		returned = doormen( schema , data ) ;
		doormen.equals( data , [ 'ABC', 'def', 'toto' ] ) ;
		doormen.equals( returned , [ 'ABC', 'def', 'toto' ] ) ;
	} ) ;
} ) ;



describe( "Schema as a sentence" , function() {
	
	it( "should transform a sentence into a schema" , function() {
		
		doormen.equals( doormen.sentence( 'array' ) , { type: 'array' } ) ;
		doormen.equals( doormen.sentence( 'Array' ) , { instanceOf: 'Array' } ) ;
		doormen.equals( doormen.sentence( 'it should be an array' ) , { type: 'array' } ) ;
		doormen.equals( doormen.sentence( 'it should have type of array' ) , { type: 'array' } ) ;
		doormen.equals( doormen.sentence( 'it should have type of Uppercasetype' ) , { type: 'Uppercasetype' } ) ;
		doormen.equals( doormen.sentence( 'it should be an Array' ) , { instanceOf: 'Array' } ) ;
		doormen.equals( doormen.sentence( 'it should be an instance of Array' ) , { instanceOf: 'Array' } ) ;
		doormen.equals( doormen.sentence( 'it should be an instance of lowercaseclass' ) , { instanceOf: 'lowercaseclass' } ) ;
		
		doormen.equals( doormen.sentence( 'it should be an Array of string' ) ,
			{ instanceOf: 'Array' , of: { type: 'string' } }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be an Array of Array of string' ) ,
			{ instanceOf: 'Array' , of: { instanceOf: 'Array' , of: { type: 'string' } } }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a number at least 5' ) ,
			{ type: 'number', min: 5 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a number at most 7' ) ,
			{ type: 'number', max: 7 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a number at least 5 and at most 7' ) ,
			{ type: 'number', min: 5, max: 7 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a number at least 5, at most 7' ) ,
			{ type: 'number', min: 5, max: 7 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a number between 3 and 11' ) ,
			{ type: 'number', min: 3, max: 11 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a number greater than or equal to 4' ) ,
			{ type: 'number', min: 4 }
		) ;
		
		// equals is required
		doormen.shouldThrow( function() { doormen.sentence( 'it should be a number greater than 4' ) ; } ) ;
		
		
		
		doormen.equals( doormen.sentence( 'it should be an empty string' ) ,
			{ type: 'string', length: 0 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a string and it should have a length of 6' ) ,
			{ type: 'string', length: 6 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a string and it should have a length of at least 8' ) ,
			{ type: 'string', minLength: 8 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a string and it should have a length of at most 18' ) ,
			{ type: 'string', maxLength: 18 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a string and it should have a length of at least 9 and at most 17' ) ,
			{ type: 'string', minLength: 9, maxLength: 17 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should be a string and it should have a length between 4 and 7' ) ,
			{ type: 'string', minLength: 4, maxLength: 7 }
		) ;
		
		doormen.equals( doormen.sentence( 'it should have between 4 and 7 letters' ) ,
			{ minLength: 4, maxLength: 7 }
		) ;
		
		
		
		doormen.equals( doormen.sentence( 'after trim, it should be a string between 5 and 8 chars' ) ,
			{ sanitize: [ 'trim' ] , type: 'string', minLength: 5, maxLength: 8 }
		) ;
		
		doormen.equals( doormen.sentence( 'after trim and toUpperCase it should be a string between 5 and 8 chars' ) ,
			{ sanitize: [ 'trim' , 'toUpperCase' ] , type: 'string', minLength: 5, maxLength: 8 }
		) ;
		
		doormen.equals( doormen.sentence( 'after trim and to-upper-case, it is expected to be a string between 5 and 8 chars' ) ,
			{ sanitize: [ 'trim' , 'toUpperCase' ] , type: 'string', minLength: 5, maxLength: 8 }
		) ;
		
		doormen.equals( doormen.sentence( 'after sanitizers: trim and to-upper-case, it is expected to be a string between 5 and 8 chars' ) ,
			{ sanitize: [ 'trim' , 'toUpperCase' ] , type: 'string', minLength: 5, maxLength: 8 }
		) ;
		
	} ) ;
	
	it( "should accept a sentence instead of a schema" , function() {
		doormen( "" , 'should be a string' ) ;
		doormen( "" , 'should be an empty string' ) ;
		doormen( "one two three" , 'should be a string' ) ;
		doormen.not( "one two three" , 'should be an empty string' ) ;
		doormen( "   " , 'after trim, it should be an empty string' ) ;
		doormen.not( " !  " , 'after trim, it should be an empty string' ) ;
		
		doormen( [] , 'should be an array' ) ;
		doormen( [] , 'should be an Array' ) ;
		doormen( [] , 'should be an empty array' ) ;
		doormen( [] , 'should be an empty Array' ) ;
		doormen.not( [ 1 , 2 , 3 ] , 'should be an empty array' ) ;
		doormen( [ 1 , 2 , 3 ] , 'should be an array' ) ;
	} ) ;
		
} ) ;



describe( "Misc" , function() {
	
	it( "should support custom data in the schema for third party lib" , function() {
		
		doormen(
			{ a: 1, b: 'text' } ,
			{
				custom: 'field',
				another: { custom: 'field' },
				properties: {
					a: {
						type: 'number',
						yet: 'another custom field'
					},
					b: {
						type: 'string'
					}
				}
			}
		) ;
	} ) ;
	
	it( "real world use case" , function() {
		
		doormen.typeChecker.password = function( data ) {
			if ( typeof data !== 'string' ) { return false ; }
			if ( data.length < 8 ) { return false ; }
			if ( ! data.match( /[a-z]/ ) || ! data.match( /[A-Z]/ ) || ! data.match( /[0-9.,;!?*%$#+-]/ ) ) { return false ; }
			return true ;
		} ;
		
		var userSchema = {
			type: 'object',
			properties: {
				id: { type: 'string' },
				name: {
					type: 'string',
					minLength: 2,
					maxLength: 50
				},
				email: { type: 'email' },
				password: { type: 'password' },
				contact: {
					optional: true,
					type: 'object',
					properties: {
						address: { optional: true, type: 'string' },
						phone: { optional: true, type: 'string' },
						fax: { optional: true, type: 'string' }
					}
				},
				custom: {
					optional: true,
					type: 'object',
					of: { type: 'string' }
				}
			}
		} ;
		
		doormen( userSchema , {
			id: 'alacon',
			name: 'Doug',
			email: 'doug@java.net',
			password: 'myJavaCodeIsFasterThanYourC!',
		} ) ;
		
		doormen( userSchema , {
			id: 'alanoix',
			name: 'Étienne Jabert',
			email: 'etienne-jabert@java.net',
			password: 'superJabert!',
			contact: {
				fax: '0142559833'
			}
		} ) ;
	} ) ;
} ) ;
	



