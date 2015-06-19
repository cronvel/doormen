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
			doormen.not( 'text' , { type: 'string' } ) ;
		}
		catch ( error ) {
			thrown = true ;
		}
		
		if ( ! thrown ) { throw new Error( 'It should throw' ) ; }
		
		
		thrown = false ;
		
		try {
			doormen.not( 1 , { type: 'string' } ) ;
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
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 } ) ;
		doormen.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , c: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , d: undefined } ) ;
		doormen.not.equals( { a: 2 , b: 5 , c: null } , { a: 2 , b: 5 } ) ;
		doormen.not.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: null } ) ;
		
		doormen.not.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 } ) ;
		doormen.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 , c: {} } ) ;
		doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' } } ) ;
		doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' , e: undefined } } ) ;
		doormen.not.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'toto' } } ) ;
		doormen.equals(
			{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } } ,
			{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } }
		) ;
		
		// Should test equality of object with different prototype
	} ) ;
		
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
	
	it( "data should validate when null or undefined if the optional flag is set" , function() {
		
		doormen.not( null , { type: 'string' } ) ;
		doormen( null , { optional: true, type: 'string' } ) ;
		doormen.not( undefined , { type: 'string' } ) ;
		doormen( undefined , { optional: true, type: 'string' } ) ;
		
		doormen( 'text' , { type: 'string' } ) ;
		doormen( 'text' , { optional: true, type: 'string' } ) ;
		doormen.not( 1 , { type: 'string' } ) ;
		doormen.not( 1 , { optional: true, type: 'string' } ) ;
		
		doormen.not( {} , { properties: { a: { type: 'string' } } } ) ;
		doormen( {} , { properties: { a: { optional: true, type: 'string' } } } ) ;
	} ) ;
	
	it( "data should validate when null or undefined if a default value is specified, the default should overwrite the original one" , function() {
		doormen.equals( doormen( null , { type: 'string' , "default": 'default!' } ) , 'default!' ) ;
		doormen.equals(
			doormen(
				{ a: null } ,
				{ properties: { a: { type: 'string' , "default": 'default!' } } } ) ,
			{ a: 'default!' }
		) ;
		doormen.equals(
			doormen(
				{ a: null } ,
				{ properties: { a: { type: 'string' , "default": 'default!' } , b: { type: 'object' , "default": { c: 5 } } } } ) ,
			{ a: 'default!' , b: { c: 5 } }
		) ;
	} ) ;
} ) ;



describe( "Basic types" , function() {
	
	it( "should validate undefined accordingly" , function() {
		doormen( undefined , { type: 'undefined' } ) ;
		doormen.not( null , { type: 'undefined' } ) ;
		doormen.not( false , { type: 'undefined' } ) ;
		doormen.not( true , { type: 'undefined' } ) ;
		doormen.not( 0 , { type: 'undefined' } ) ;
		doormen.not( 1 , { type: 'undefined' } ) ;
		doormen.not( '' , { type: 'undefined' } ) ;
		doormen.not( 'text' , { type: 'undefined' } ) ;
		doormen.not( {} , { type: 'undefined' } ) ;
		doormen.not( [] , { type: 'undefined' } ) ;
	} ) ;
	
	it( "should validate null accordingly" , function() {
		doormen.not( undefined , { type: 'null' } ) ;
		doormen( null , { type: 'null' } ) ;
		doormen.not( false , { type: 'null' } ) ;
		doormen.not( true , { type: 'null' } ) ;
		doormen.not( 0 , { type: 'null' } ) ;
		doormen.not( 1 , { type: 'null' } ) ;
		doormen.not( '' , { type: 'null' } ) ;
		doormen.not( 'text' , { type: 'null' } ) ;
		doormen.not( {} , { type: 'null' } ) ;
		doormen.not( [] , { type: 'null' } ) ;
	} ) ;
	
	it( "should validate boolean accordingly" , function() {
		doormen.not( undefined , { type: 'boolean' } ) ;
		doormen.not( null , { type: 'boolean' } ) ;
		doormen( false , { type: 'boolean' } ) ;
		doormen( true , { type: 'boolean' } ) ;
		doormen.not( 0 , { type: 'boolean' } ) ;
		doormen.not( 1 , { type: 'boolean' } ) ;
		doormen.not( '' , { type: 'boolean' } ) ;
		doormen.not( 'text' , { type: 'boolean' } ) ;
		doormen.not( {} , { type: 'boolean' } ) ;
		doormen.not( [] , { type: 'boolean' } ) ;
	} ) ;
	
	it( "should validate number accordingly" , function() {
		doormen.not( undefined , { type: 'number' } ) ;
		doormen.not( null , { type: 'number' } ) ;
		doormen.not( false , { type: 'number' } ) ;
		doormen.not( true , { type: 'number' } ) ;
		doormen( 0 , { type: 'number' } ) ;
		doormen( 1 , { type: 'number' } ) ;
		doormen( Infinity , { type: 'number' } ) ;
		doormen( NaN , { type: 'number' } ) ;
		doormen.not( '' , { type: 'number' } ) ;
		doormen.not( 'text' , { type: 'number' } ) ;
		doormen.not( {} , { type: 'number' } ) ;
		doormen.not( [] , { type: 'number' } ) ;
	} ) ;
	
	it( "should validate string accordingly" , function() {
		doormen.not( undefined , { type: 'string' } ) ;
		doormen.not( null , { type: 'string' } ) ;
		doormen.not( false , { type: 'string' } ) ;
		doormen.not( true , { type: 'string' } ) ;
		doormen.not( 0 , { type: 'string' } ) ;
		doormen.not( 1 , { type: 'string' } ) ;
		doormen( '' , { type: 'string' } ) ;
		doormen( 'text' , { type: 'string' } ) ;
		doormen.not( {} , { type: 'string' } ) ;
		doormen.not( [] , { type: 'string' } ) ;
	} ) ;
	
	it( "should validate object accordingly" , function() {
		doormen.not( undefined , { type: 'object' } ) ;
		doormen.not( null , { type: 'object' } ) ;
		doormen.not( false , { type: 'object' } ) ;
		doormen.not( true , { type: 'object' } ) ;
		doormen.not( 0 , { type: 'object' } ) ;
		doormen.not( 1 , { type: 'object' } ) ;
		doormen.not( '' , { type: 'object' } ) ;
		doormen.not( 'text' , { type: 'object' } ) ;
		doormen( {} , { type: 'object' } ) ;
		doormen( { a:1 , b:2 } , { type: 'object' } ) ;
		doormen( [] , { type: 'object' } ) ;
		doormen( [ 1,2,3 ] , { type: 'object' } ) ;
		doormen( new Date() , { type: 'object' } ) ;
		doormen.not( function(){} , { type: 'object' } ) ;
	} ) ;
	
	it( "should validate function accordingly" , function() {
		doormen.not( undefined , { type: 'function' } ) ;
		doormen.not( null , { type: 'function' } ) ;
		doormen.not( false , { type: 'function' } ) ;
		doormen.not( true , { type: 'function' } ) ;
		doormen.not( 0 , { type: 'function' } ) ;
		doormen.not( 1 , { type: 'function' } ) ;
		doormen.not( '' , { type: 'function' } ) ;
		doormen.not( 'text' , { type: 'function' } ) ;
		doormen.not( {} , { type: 'function' } ) ;
		doormen.not( [] , { type: 'function' } ) ;
		doormen( function(){} , { type: 'function' } ) ;
	} ) ;
} ) ;
	


describe( "Built-in types" , function() {
	
	it( "should validate array accordingly" , function() {
		doormen.not( undefined , { type: 'array' } ) ;
		doormen.not( null , { type: 'array' } ) ;
		doormen.not( false , { type: 'array' } ) ;
		doormen.not( true , { type: 'array' } ) ;
		doormen.not( 0 , { type: 'array' } ) ;
		doormen.not( 1 , { type: 'array' } ) ;
		doormen.not( '' , { type: 'array' } ) ;
		doormen.not( 'text' , { type: 'array' } ) ;
		doormen.not( {} , { type: 'array' } ) ;
		doormen.not( { a:1 , b:2 } , { type: 'array' } ) ;
		doormen( [] , { type: 'array' } ) ;
		doormen( [ 1,2,3 ] , { type: 'array' } ) ;
		doormen.not( function(){} , { type: 'array' } ) ;
	} ) ;
	
	it( "should validate date accordingly" , function() {
		doormen( new Date() , { type: 'date' } ) ;
		
		doormen.not( undefined , { type: 'date' } ) ;
		doormen.not( null , { type: 'date' } ) ;
		doormen.not( false , { type: 'date' } ) ;
		doormen.not( true , { type: 'date' } ) ;
		doormen.not( 0 , { type: 'date' } ) ;
		doormen.not( 1 , { type: 'date' } ) ;
		doormen.not( '' , { type: 'date' } ) ;
		doormen.not( 'text' , { type: 'date' } ) ;
		doormen.not( {} , { type: 'date' } ) ;
		doormen.not( { a:1 , b:2 } , { type: 'date' } ) ;
		doormen.not( [] , { type: 'date' } ) ;
		doormen.not( [ 1,2,3 ] , { type: 'date' } ) ;
		doormen.not( function(){} , { type: 'date' } ) ;
	} ) ;
	
	it( "should validate error accordingly" , function() {
		doormen( new Error() , { type: 'error' } ) ;
		
		doormen.not( undefined , { type: 'error' } ) ;
		doormen.not( null , { type: 'error' } ) ;
		doormen.not( false , { type: 'error' } ) ;
		doormen.not( true , { type: 'error' } ) ;
		doormen.not( 0 , { type: 'error' } ) ;
		doormen.not( 1 , { type: 'error' } ) ;
		doormen.not( '' , { type: 'error' } ) ;
		doormen.not( 'text' , { type: 'error' } ) ;
		doormen.not( {} , { type: 'error' } ) ;
		doormen.not( { a:1 , b:2 } , { type: 'error' } ) ;
		doormen.not( [] , { type: 'error' } ) ;
		doormen.not( [ 1,2,3 ] , { type: 'error' } ) ;
		doormen.not( function(){} , { type: 'error' } ) ;
	} ) ;
	
	it( "should validate arguments accordingly" , function() {
		var fn = function() { doormen( arguments , { type: 'arguments' } ) ; } ;
		
		fn() ;
		fn( 1 ) ;
		fn( 1 , 2 , 3 ) ;
		
		doormen.not( undefined , { type: 'arguments' } ) ;
		doormen.not( null , { type: 'arguments' } ) ;
		doormen.not( false , { type: 'arguments' } ) ;
		doormen.not( true , { type: 'arguments' } ) ;
		doormen.not( 0 , { type: 'arguments' } ) ;
		doormen.not( 1 , { type: 'arguments' } ) ;
		doormen.not( '' , { type: 'arguments' } ) ;
		doormen.not( 'text' , { type: 'arguments' } ) ;
		doormen.not( {} , { type: 'arguments' } ) ;
		doormen.not( { a:1 , b:2 } , { type: 'arguments' } ) ;
		doormen.not( [] , { type: 'arguments' } ) ;
		doormen.not( [ 1,2,3 ] , { type: 'arguments' } ) ;
		doormen.not( function(){} , { type: 'arguments' } ) ;
	} ) ;
} ) ;



describe( "Mixed types" , function() {
	
	it( "should validate 'strictObject' accordingly, i.e. objects that are *NOT* arrays" , function() {
		doormen.not( undefined , { type: 'strictObject' } ) ;
		doormen.not( null , { type: 'strictObject' } ) ;
		doormen.not( false , { type: 'strictObject' } ) ;
		doormen.not( true , { type: 'strictObject' } ) ;
		doormen.not( 0 , { type: 'strictObject' } ) ;
		doormen.not( 1 , { type: 'strictObject' } ) ;
		doormen.not( '' , { type: 'strictObject' } ) ;
		doormen.not( 'text' , { type: 'strictObject' } ) ;
		doormen( {} , { type: 'strictObject' } ) ;
		doormen( { a:1 , b:2 } , { type: 'strictObject' } ) ;
		doormen.not( [] , { type: 'strictObject' } ) ;
		doormen.not( [ 1,2,3 ] , { type: 'strictObject' } ) ;
		doormen.not( function(){} , { type: 'strictObject' } ) ;
	} ) ;
	
	it( "should validate 'regexp' accordingly, i.e. RegExp instance or string convertible to RegExp" , function() {
		doormen( /Random/ , { type: 'regexp' } ) ;
		doormen( new RegExp( "Random" ) , { type: 'regexp' } ) ;
		doormen( "Random" , { type: 'regexp' } ) ;
		doormen.not( "(Random" , { type: 'regexp' } ) ;
		doormen.not( undefined , { type: 'regexp' } ) ;
		doormen.not( null , { type: 'regexp' } ) ;
		doormen.not( false , { type: 'regexp' } ) ;
		doormen.not( true , { type: 'regexp' } ) ;
		doormen.not( 0 , { type: 'regexp' } ) ;
		doormen.not( 1 , { type: 'regexp' } ) ;
		doormen( '' , { type: 'regexp' } ) ;
		doormen( 'text' , { type: 'regexp' } ) ;
		doormen.not( {} , { type: 'regexp' } ) ;
		doormen.not( { a:1 , b:2 } , { type: 'regexp' } ) ;
		doormen.not( [] , { type: 'regexp' } ) ;
		doormen.not( [ 1,2,3 ] , { type: 'regexp' } ) ;
		doormen.not( function(){} , { type: 'regexp' } ) ;
	} ) ;
	
	it( "should validate 'classId' accordingly, i.e. function (constructor) or non-empty string" , function() {
		doormen.not( undefined , { type: 'classId' } ) ;
		doormen.not( null , { type: 'classId' } ) ;
		doormen.not( false , { type: 'classId' } ) ;
		doormen.not( true , { type: 'classId' } ) ;
		doormen.not( 0 , { type: 'classId' } ) ;
		doormen.not( 1 , { type: 'classId' } ) ;
		doormen.not( '' , { type: 'classId' } ) ;
		doormen( 'text' , { type: 'classId' } ) ;
		doormen.not( {} , { type: 'classId' } ) ;
		doormen.not( { a:1 , b:2 } , { type: 'classId' } ) ;
		doormen.not( [] , { type: 'classId' } ) ;
		doormen.not( [ 1,2,3 ] , { type: 'classId' } ) ;
		doormen( function(){} , { type: 'classId' } ) ;
	} ) ;
	
} ) ;



describe( "Top-level filters" , function() {
	
	it( "'instanceOf' should validate object accordingly" , function() {
		doormen( new Date() , { instanceOf: Date } ) ;
		doormen( new Array() , { instanceOf: Array } ) ;	// jshint ignore:line
		function MyClass(){}
		doormen( new MyClass() , { instanceOf: MyClass } ) ;
		doormen( new MyClass() , { instanceOf: Object } ) ;
	} ) ;
	
	it( "min filter should validate accordingly, non-number should throw" , function() {
		doormen( 10 , { min: 3 } ) ;
		doormen( 3 , { min: 3 } ) ;
		doormen.not( 1 , { min: 3 } ) ;
		doormen.not( 0 , { min: 3 } ) ;
		doormen.not( -10 , { min: 3 } ) ;
		doormen( Infinity , { min: 3 } ) ;
		doormen( Infinity , { min: Infinity } ) ;
		doormen.not( -Infinity , { min: 3 } ) ;
		doormen.not( NaN , { min: 3 } ) ;
		doormen.not( true , { min: 3 } ) ;
		doormen.not( false , { min: 3 } ) ;
		doormen.not( undefined , { min: 3 } ) ;
		doormen.not( undefined , { min: 0 } ) ;
		doormen.not( undefined , { min: -3 } ) ;
		doormen.not( '10' , { min: 3 } ) ;
	} ) ;
	
	it( "max filter should validate accordingly, non-number should throw" , function() {
		doormen.not( 10 , { max: 3 } ) ;
		doormen( 3 , { max: 3 } ) ;
		doormen( 1 , { max: 3 } ) ;
		doormen( 0 , { max: 3 } ) ;
		doormen( -10 , { max: 3 } ) ;
		doormen.not( Infinity , { max: 3 } ) ;
		doormen( -Infinity , { max: 3 } ) ;
		doormen( -Infinity , { max: -Infinity } ) ;
		doormen.not( NaN , { max: 3 } ) ;
		doormen.not( true , { max: 3 } ) ;
		doormen.not( false , { max: 3 } ) ;
		doormen.not( '1' , { max: 3 } ) ;
	} ) ;
	
	it( "min + max filter should validate accordingly, non-number should throw" , function() {
		doormen.not( 15 , { min: 3, max: 10 } ) ;
		doormen( 10 , { min: 3, max: 10 } ) ;
		doormen( 5 , { min: 3, max: 10 } ) ;
		doormen( 3 , { min: 3, max: 10 } ) ;
		doormen.not( 1 , { min: 3, max: 10 } ) ;
		doormen.not( 0 , { min: 3, max: 10 } ) ;
		doormen.not( -10 , { min: 3, max: 10 } ) ;
		doormen.not( Infinity , { min: 3, max: 10 } ) ;
		doormen.not( -Infinity , { min: 3, max: 10 } ) ;
		doormen.not( NaN , { min: 3, max: 10 } ) ;
		doormen.not( true , { min: 3, max: 10 } ) ;
		doormen.not( false , { min: 3, max: 10 } ) ;
		doormen.not( '6' , { min: 3, max: 10 } ) ;
	} ) ;
	
	it( "'length' filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( "abc" , { length: 3 } ) ;
		doormen.not( "abcde" , { length: 3 } ) ;
		doormen.not( "ab" , { length: 3 } ) ;
		doormen.not( "" , { length: 3 } ) ;
		
		doormen.not( 1 , { length: 3 } ) ;
		doormen.not( 1 , { length: 0 } ) ;
		doormen.not( NaN , { length: 3 } ) ;
		doormen.not( true , { length: 3 } ) ;
		doormen.not( false , { length: 3 } ) ;
	} ) ;
	
	it( "minLength filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( "abc" , { minLength: 3 } ) ;
		doormen( "abcde" , { minLength: 3 } ) ;
		doormen.not( "ab" , { minLength: 3 } ) ;
		doormen.not( "" , { minLength: 3 } ) ;
		
		doormen.not( 1 , { minLength: 3 } ) ;
		doormen.not( 1 , { minLength: 0 } ) ;
		doormen.not( NaN , { minLength: 3 } ) ;
		doormen.not( true , { minLength: 3 } ) ;
		doormen.not( false , { minLength: 3 } ) ;
	} ) ;
	
	it( "maxLength filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( "abc" , { maxLength: 3 } ) ;
		doormen.not( "abcde" , { maxLength: 3 } ) ;
		doormen( "ab" , { maxLength: 3 } ) ;
		doormen( "" , { maxLength: 3 } ) ;
		
		doormen.not( 1 , { maxLength: 3 } ) ;
		doormen.not( 1 , { maxLength: 0 } ) ;
		doormen.not( NaN , { maxLength: 3 } ) ;
		doormen.not( true , { maxLength: 3 } ) ;
		doormen.not( false , { maxLength: 3 } ) ;
	} ) ;
	
	it( "minLength + maxLength filter should validate accordingly, data that do not have a length should throw" , function() {
		doormen( "abc" , { minLength: 3 , maxLength: 5 } ) ;
		doormen( "abcd" , { minLength: 3 , maxLength: 5 } ) ;
		doormen( "abcde" , { minLength: 3 , maxLength: 5 } ) ;
		doormen.not( "abcdef" , { minLength: 3 , maxLength: 5 } ) ;
		doormen.not( "ab" , { minLength: 3 , maxLength: 5 } ) ;
		doormen.not( "" , { minLength: 3 , maxLength: 5 } ) ;
		
		doormen.not( 1 , { minLength: 3 , maxLength: 5 } ) ;
		doormen.not( 1 , { maxLength: 0 } ) ;
		doormen.not( NaN , { minLength: 3 , maxLength: 5 } ) ;
		doormen.not( true , { minLength: 3 , maxLength: 5 } ) ;
		doormen.not( false , { minLength: 3 , maxLength: 5 } ) ;
	} ) ;
	
	it( "'match' filter should validate accordingly using a RegExp" , function() {
		doormen( "" , { match: "^[a-f]*$" } ) ;
		doormen.not( "" , { match: "^[a-f]+$" } ) ;
		doormen( "abc" , { match: "^[a-f]*$" } ) ;
		doormen( "abcdef" , { match: "^[a-f]*$" } ) ;
		doormen.not( "ghi" , { match: "^[a-f]*$" } ) ;
		doormen.not( "ghi" , { match: /^[a-f]*$/ } ) ;
		
		doormen.not( 1 , { match: "^[a-f]*$" } ) ;
		doormen.not( 1 , { maxLength: 0 } ) ;
		doormen.not( NaN , { match: "^[a-f]*$" } ) ;
		doormen.not( true , { match: "^[a-f]*$" } ) ;
		doormen.not( false , { match: "^[a-f]*$" } ) ;
	} ) ;
	
	it( "'in' filter should validate if the value is listed" , function() {
		doormen.not( 10 , { in: [ 1,5,7 ] } ) ;
		doormen( 5 , { in: [ 1,5,7 ] } ) ;
		doormen( 1 , { in: [ 1,5,7 ] } ) ;
		doormen.not( 0 , { in: [ 1,5,7 ] } ) ;
		doormen.not( -10 , { in: [ 1,5,7 ] } ) ;
		doormen.not( Infinity , { in: [ 1,5,7 ] } ) ;
		doormen( Infinity , { in: [ 1,5,Infinity,7 ] } ) ;
		doormen.not( -Infinity , { in: [ 1,5,7 ] } ) ;
		doormen.not( NaN , { in: [ 1,5,7 ] } ) ;
		doormen( NaN , { in: [ 1,5,NaN,7 ] } ) ;
		
		doormen( true , { in: [ 1,true,5,7 ] } ) ;
		doormen.not( true , { in: [ 1,5,7 ] } ) ;
		doormen( false , { in: [ 1,false,5,7 ] } ) ;
		doormen.not( false , { in: [ 1,5,7 ] } ) ;
		
		doormen.not( "text" , { in: [ 1,5,7 ] } ) ;
		doormen( "text" , { in: [ 1,"text",5,7 ] } ) ;
		doormen( "text" , { in: [ "string", "text", "bob" ] } ) ;
		doormen.not( "bobby" , { in: [ "string", "text", "bob" ] } ) ;
		doormen( "" , { in: [ "string", "text", "" ] } ) ;
		doormen.not( "" , { in: [ "string", "text", "bob" ] } ) ;
	} ) ;
	
	it( "'notIn' filter should validate if the value is listed" , function() {
		doormen( 10 , { notIn: [ 1,5,7 ] } ) ;
		doormen.not( 5 , { notIn: [ 1,5,7 ] } ) ;
		doormen.not( 1 , { notIn: [ 1,5,7 ] } ) ;
		doormen( 0 , { notIn: [ 1,5,7 ] } ) ;
		doormen( -10 , { notIn: [ 1,5,7 ] } ) ;
		doormen( Infinity , { notIn: [ 1,5,7 ] } ) ;
		doormen.not( Infinity , { notIn: [ 1,5,Infinity,7 ] } ) ;
		doormen( -Infinity , { notIn: [ 1,5,7 ] } ) ;
		doormen( NaN , { notIn: [ 1,5,7 ] } ) ;
		doormen.not( NaN , { notIn: [ 1,5,NaN,7 ] } ) ;
		
		doormen.not( true , { notIn: [ 1,true,5,7 ] } ) ;
		doormen( true , { notIn: [ 1,5,7 ] } ) ;
		doormen.not( false , { notIn: [ 1,false,5,7 ] } ) ;
		doormen( false , { notIn: [ 1,5,7 ] } ) ;
		
		doormen( "text" , { notIn: [ 1,5,7 ] } ) ;
		doormen.not( "text" , { notIn: [ 1,"text",5,7 ] } ) ;
		doormen.not( "text" , { notIn: [ "string", "text", "bob" ] } ) ;
		doormen( "bobby" , { notIn: [ "string", "text", "bob" ] } ) ;
		doormen.not( "" , { notIn: [ "string", "text", "" ] } ) ;
		doormen( "" , { notIn: [ "string", "text", "bob" ] } ) ;
	} ) ;
	
	it( "'in' filter containing object and arrays" , function() {
		doormen( { a: 2 } , { in: [ 1 , { a: 2 } , 5 , 7 ] } ) ;
		doormen.not( { a: 2 , b: 5 } , { in: [ 1 , { a: 2 } , 5 , 7 ] } ) ;
		doormen.not( { a: 2 , b: 5 } , { in: [ 1 , { a: 2 } , { b: 5 } , 7 ] } ) ;
		doormen( { a: 2 , b: 5 } , { in: [ 1 , { a: 2 } , { a: 2 , b: 5 } , { b: 5 } , 7 ] } ) ;
		doormen( [ 'a' , 2 ] , { in: [ 1 , [ 'a', 2 ] , 5 , 7 ] } ) ;
		doormen.not( [ 'a' , 2 ] , { in: [ 1 , [ 'a', 2 , 3 ] , 5 , 7 ] } ) ;
	} ) ;
} ) ;



describe( "Filters" , function() {
	
	it( "'greaterThan' and aliases ('gt' and '>') filter should validate accordingly, non-number should throw" , function() {
		doormen( 10 , { filter: { greaterThan: 3 } } ) ;
		doormen( 3.0001 , { filter: { greaterThan: 3 } } ) ;
		doormen.not( 3 , { filter: { greaterThan: 3 } } ) ;
		doormen.not( 1 , { filter: { greaterThan: 3 } } ) ;
		doormen.not( 0 , { filter: { greaterThan: 3 } } ) ;
		doormen.not( -10 , { filter: { greaterThan: 3 } } ) ;
		doormen( Infinity , { filter: { greaterThan: 3 } } ) ;
		doormen.not( Infinity , { filter: { greaterThan: Infinity } } ) ;
		doormen.not( -Infinity , { filter: { greaterThan: 3 } } ) ;
		doormen.not( NaN , { filter: { greaterThan: 3 } } ) ;
		doormen.not( true , { filter: { greaterThan: 3 } } ) ;
		doormen.not( false , { filter: { greaterThan: 3 } } ) ;
		doormen.not( undefined , { filter: { greaterThan: 3 } } ) ;
		doormen.not( undefined , { filter: { greaterThan: 0 } } ) ;
		doormen.not( undefined , { filter: { greaterThan: -3 } } ) ;
		doormen.not( '10' , { filter: { greaterThan: 3 } } ) ;
		
		doormen( 3.0001 , { filter: { gt: 3 } } ) ;
		doormen.not( 3 , { filter: { gt: 3 } } ) ;
		doormen( 3.0001 , { filter: { '>': 3 } } ) ;
		doormen.not( 3 , { filter: { '>': 3 } } ) ;
	} ) ;
	
	it( "'lesserThan' and aliases ('lt' and '<') filter should validate accordingly, non-number should throw" , function() {
		doormen.not( 10 , { filter: { lesserThan: 3 } } ) ;
		doormen( 2.999 , { filter: { lesserThan: 3 } } ) ;
		doormen.not( 3 , { filter: { lesserThan: 3 } } ) ;
		doormen( 1 , { filter: { lesserThan: 3 } } ) ;
		doormen( 0 , { filter: { lesserThan: 3 } } ) ;
		doormen( -10 , { filter: { lesserThan: 3 } } ) ;
		doormen.not( Infinity , { filter: { lesserThan: 3 } } ) ;
		doormen( -Infinity , { filter: { lesserThan: 3 } } ) ;
		doormen.not( -Infinity , { filter: { lesserThan: -Infinity } } ) ;
		doormen.not( NaN , { filter: { lesserThan: 3 } } ) ;
		doormen.not( true , { filter: { lesserThan: 3 } } ) ;
		doormen.not( false , { filter: { lesserThan: 3 } } ) ;
		doormen.not( '1' , { filter: { lesserThan: 3 } } ) ;
		
		doormen( 2.999 , { filter: { lt: 3 } } ) ;
		doormen.not( 3 , { filter: { lt: 3 } } ) ;
		doormen( 2.999 , { filter: { '<': 3 } } ) ;
		doormen.not( 3 , { filter: { '<': 3 } } ) ;
	} ) ;
} ) ;



describe( "Children and recursivity" , function() {
	
	it( "'of' should perform the check recursively for each children, using the same given schema for all of them." , function() {
		
		var schema = {
			of: { type: 'string' }
		} ;
		
		// Object
		doormen( { b: 'text' } , schema ) ;
		doormen.not( { a: 1 } , schema ) ;
		doormen.not( { a: 1, b: 'text' } , schema ) ;
		doormen.not( { a: 'text', b: 3 } , schema ) ;
		doormen( { a: 'text', b: 'string' } , schema ) ;
		doormen.not( { A: 'TEXT', b: 'text' , c: undefined } , schema ) ;
		
		// Array
		doormen( [ 'text' ] , schema ) ;
		doormen( [] , schema ) ;
		doormen( [ 'text' , 'string' ] , schema ) ;
		doormen.not( [ 'text' , 'string' , null ] , schema ) ;
		doormen.not( [ 1 , 'text' , 'string' ] , schema ) ;
		doormen.not( [ 'text' , 'string' , null ] , schema ) ;
		doormen.not( [ true ] , schema ) ;
		
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
	} ) ;
	
	it( "when 'properties' is an array, it should check if the value has all listed properties, no extra properties are allowed" , function() {
		
		var schema = {
			properties: [ 'a' , 'b' ]
		} ;
		
		doormen( { a: 1, b: 'text' } , schema ) ;
		doormen( { a: 'text', b: 3 } , schema ) ;
		doormen.not( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
		doormen.not( { b: 'text' } , schema ) ;
		doormen.not( { a: 1 } , schema ) ;
		
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
	} ) ;
	
	it( "when 'properties' is an array and 'extraProperties' is set, it should allow non-listed extra-properties" , function() {
		
		var schema = {
			properties: [ 'a' , 'b' ],
			extraProperties: true
		} ;
		
		doormen( { a: 1, b: 'text' } , schema ) ;
		doormen( { a: 'text', b: 3 } , schema ) ;
		doormen( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
		doormen.not( { b: 'text' } , schema ) ;
		doormen.not( { a: 1 } , schema ) ;
		
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
	} ) ;
	
	it( "when 'properties' is an object, it should perform the check recursively for each listed child, no extra properties are allowed" , function() {
		
		var schema = {
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			}
		} ;
		
		doormen( { a: 1, b: 'text' } , schema ) ;
		doormen.not( { a: 'text', b: 3 } , schema ) ;
		doormen.not( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
		doormen.not( { b: 'text' } , schema ) ;
		doormen.not( { a: 1 } , schema ) ;
		
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
	} ) ;
	
	it( "when 'properties' is an object and 'extraProperties' is set, it should allow extra-properties" , function() {
		
		var schema = {
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			},
			extraProperties: true
		} ;
		
		doormen( { a: 1, b: 'text' } , schema ) ;
		doormen.not( { a: 'text', b: 3 } , schema ) ;
		doormen( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
		doormen.not( { b: 'text' } , schema ) ;
		doormen.not( { a: 1 } , schema ) ;
		
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
	} ) ;
	
	it( "'elements' should perform the check recursively for each children elements, using a specific schema for each one, extra-element are not allowed" , function() {
		
		var schema = {
			elements: [
				{ type: 'string' },
				{ type: 'number' },
				{ type: 'boolean' }
			]
		} ;
		
		doormen( [ 'text' , 3 , false ] , schema ) ;
		doormen.not( [ 'text' , 3 , false , 'extra' , true ] , schema ) ;
		doormen.not( [] , schema ) ;
		doormen.not( [ 'text' , 3 ] , schema ) ;
		doormen.not( [ true ] , schema ) ;
		
		doormen.not( {} , schema ) ;
		doormen.not( { b: 'text' } , schema ) ;
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
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
		
		doormen( [ 'text' , 3 , false ] , schema ) ;
		doormen( [ 'text' , 3 , false , 'extra' , true ] , schema ) ;
		doormen.not( [] , schema ) ;
		doormen.not( [ 'text' , 3 ] , schema ) ;
		doormen.not( [ true ] , schema ) ;
		
		doormen.not( {} , schema ) ;
		doormen.not( { b: 'text' } , schema ) ;
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
	} ) ;
	
	it( "Recursivity should not create optional properties." ) ;
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
		
		doormen( { a: 1, b: 'text' } , schema ) ;
		doormen( { a: 'text', b: 3 } , schema ) ;
		doormen.equals( doormen( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) , { a: 1, b: 'text' } ) ;
		doormen.equals( doormen( { omg: 'noob!', A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) , { a: 1, b: 'text' } ) ;
		
		
		schema = {
			sanitize: 'removeExtraProperties',
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			}
		} ;
		
		doormen( { a: 1, b: 'text' } , schema ) ;
		doormen.not( { a: 'text', b: 3 } , schema ) ;
		doormen.equals( doormen( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) , { a: 1, b: 'text' } ) ;
		doormen.equals( doormen( { omg: 'noob!', A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) , { a: 1, b: 'text' } ) ;
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
		
		report = doormen.report( { a: 'abc', b: '  def  ' } , schema ) ;
		//console.log( report ) ;
		doormen.equals( report.validate , true ) ;
		doormen.equals( report.sanitized , { a: 'abc', b: 'def' } ) ;
		doormen.equals( report.errors.length , 0 ) ;
		
		report = doormen.report( { a: true, b: 3 } , schema ) ;
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
		
		report = doormen.report( { a: '  abc  ', b: 3 , c: { d: true , e: 'def  ' } } , schema ) ;
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
	
	it( "Schema alternatives needs more tests" ) ;
} ) ;



describe( "Purify" , function() {
	
	it( "Purify a basic schema" , function() {
		console.log( doormen.purifySchema( { type: 'string' } ) ) ;
		console.log( doormen.purifySchema( { type: 'string' , random: 'stuff' } ) ) ;
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
		returned = doormen.export( data , schema ) ;
		doormen.equals( data , { a: 'abc', b: '  def  ' } ) ;
		doormen.equals( returned , { a: 'abc', b: 'def' } ) ;
		
		returned = doormen( data , schema ) ;
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
		returned = doormen.export( data , schema ) ;
		doormen.equals( data , { a: 'abc', b: '  def  ' } ) ;
		doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;
		
		returned = doormen( data , schema ) ;
		doormen.equals( data , { a: 'ABC', b: 'def' } ) ;
		doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;
		
		data = { a: 'abc', b: '  def  ', c: 'toto' } ;
		doormen.shouldThrow( function() {
			returned = doormen.export( data , schema ) ;
		} ) ;
		
		schema.extraProperties = true ;
		data = { a: 'abc', b: '  def  ', c: 'toto' } ;
		returned = doormen.export( data , schema ) ;
		doormen.equals( data , { a: 'abc', b: '  def  ', c: 'toto' } ) ;
		doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;
		
		returned = doormen( data , schema ) ;
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
		returned = doormen.export( data , schema ) ;
		doormen.equals( data , [ 'abc', '  def  ' ] ) ;
		doormen.equals( returned , [ 'ABC', 'def' ] ) ;
		
		returned = doormen( data , schema ) ;
		doormen.equals( data , [ 'ABC', 'def' ] ) ;
		doormen.equals( returned , [ 'ABC', 'def' ] ) ;
		
		data = [ 'abc', '  def  ', 'toto' ] ;
		doormen.shouldThrow( function() {
			returned = doormen.export( data , schema ) ;
		} ) ;
		
		schema.extraElements = true ;
		data = [ 'abc', '  def  ', 'toto' ] ;
		returned = doormen.export( data , schema ) ;
		doormen.equals( data , [ 'abc', '  def  ', 'toto' ] ) ;
		doormen.equals( returned , [ 'ABC', 'def' ] ) ;
		
		returned = doormen( data , schema ) ;
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
		
		doormen( {
			id: 'alacon',
			name: 'Doug',
			email: 'doug@java.net',
			password: 'myJavaCodeIsFasterThanYourC!',
		} , userSchema ) ;
		
		doormen( {
			id: 'alanoix',
			name: 'Étienne Jabert',
			email: 'etienne-jabert@java.net',
			password: 'superJabert!',
			contact: {
				fax: '0142559833'
			}
		} , userSchema ) ;
	} ) ;
} ) ;
	



