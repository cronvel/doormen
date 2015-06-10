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



var doormen = require( '../lib/doormen.js' ) ;
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
	
	it( "doormen.equals()" ) ;
} ) ;



describe( "Optional and default data" , function() {
	
	it( "optional data should validate when null or undefined even if the type check would have failed" , function() {
		
		doormen.not( null , { type: 'string' } ) ;
		doormen( null , { optional: true, type: 'string' } ) ;
		doormen.not( undefined , { type: 'string' } ) ;
		doormen( undefined , { optional: true, type: 'string' } ) ;
		
		doormen( 'text' , { type: 'string' } ) ;
		doormen( 'text' , { optional: true, type: 'string' } ) ;
		doormen.not( 1 , { type: 'string' } ) ;
		doormen.not( 1 , { optional: true, type: 'string' } ) ;
	} ) ;
	
	it( "default" ) ;
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
		var fn = function() { doormen( arguments , { type: 'arguments' } ) ; }
		
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



describe( "Built-in filters" , function() {
	
	it( "min filter should validate accordingly, non-number should throw" , function() {
		doormen( 10 , { min: 3 } ) ;
		doormen( 3 , { min: 3 } ) ;
		doormen.not( 1 , { min: 3 } ) ;
		doormen.not( 0 , { min: 3 } ) ;
		doormen.not( -10 , { min: 3 } ) ;
		doormen( Infinity , { min: 3 } ) ;
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
	
	it( "'in' filter and object" ) ;
	
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
		doormen.not( [ true ] , schema ) ;
		
		doormen.not( 'text' , schema ) ;
		doormen.not( 5 , schema ) ;
		doormen.not( null , schema ) ;
		doormen.not( undefined , schema ) ;
	} ) ;
	
	it( "when 'properties' is an array, it should check if the value has all listed properties" , function() {
		var schema = {
			properties: [ 'a' , 'b' ]
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
	
	it( "when 'properties' is an object, it should perform the check recursively for each listed child" , function() {
		var schema = {
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			}
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
	
	it( "when 'properties' is an array and 'only' is truthy, it should check if the value has all and ONLY listed properties" , function() {
		var schema = {
			properties: [ 'a' , 'b' ],
			only: true,
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
	
	it( "when 'properties' is an object and 'only' is truthy, it should perform the check recursively for each listed child and check if the value has ONLY listed properties" , function() {
		var schema = {
			properties: {
				a: { type: 'number' },
				b: { type: 'string' }
			},
			only: true
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
	
	it( "'elements' should perform the check recursively for each children elements, using a specific schema for each one" , function() {
		var schema = {
			elements: [
				{ type: 'string' },
				{ type: 'number' },
				{ type: 'boolean' }
			]
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
	
	it( "'elements' should perform the check recursively for each children elements, using a specific schema for each one" , function() {
		var schema = {
			elements: [
				{ type: 'string' },
				{ type: 'number' },
				{ type: 'boolean' }
			],
			only: true
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
	
} ) ;



describe( "Numbers meta types" , function() {
	
	it( "should validate real accordingly" , function() {
		doormen( 0 , { type: 'real' } ) ;
		doormen( 1 , { type: 'real' } ) ;
		doormen( -1 , { type: 'real' } ) ;
		doormen( 0.3 , { type: 'real' } ) ;
		doormen( 18.36 , { type: 'real' } ) ;
		doormen.not( 1/0 , { type: 'real' } ) ;
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



describe( "Common sanitizers" , function() {
	
	it( "should sanitize to 'toNumber' accordingly" , function() {
		doormen.equals( doormen( 0 , { sanitize: 'toNumber' } ) , 0 ) ;
		doormen.equals( doormen( '0' , { sanitize: 'toNumber' } ) , 0 ) ;
		doormen.equals( doormen( 1 , { sanitize: 'toNumber' } ) , 1 ) ;
		doormen.equals( doormen( '1' , { sanitize: 'toNumber' } ) , 1 ) ;
	} ) ;
} ) ;



