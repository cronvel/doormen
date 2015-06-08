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
		doormen( [] , { type: 'object' } ) ;
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



describe( "Numbers meta types" , function() {
	
	it( "should validate realNumber accordingly" , function() {
		doormen( 0 , { type: 'realNumber' } ) ;
		doormen( 1 , { type: 'realNumber' } ) ;
		doormen( -1 , { type: 'realNumber' } ) ;
		doormen( 0.3 , { type: 'realNumber' } ) ;
		doormen( 18.36 , { type: 'realNumber' } ) ;
		doormen.not( 1/0 , { type: 'realNumber' } ) ;
		doormen.not( Infinity , { type: 'realNumber' } ) ;
		doormen.not( -Infinity , { type: 'realNumber' } ) ;
		doormen.not( NaN , { type: 'realNumber' } ) ;
		
		doormen.not( undefined , { type: 'realNumber' } ) ;
		doormen.not( null , { type: 'realNumber' } ) ;
		doormen.not( false , { type: 'realNumber' } ) ;
		doormen.not( true , { type: 'realNumber' } ) ;
		doormen.not( '' , { type: 'realNumber' } ) ;
		doormen.not( 'text' , { type: 'realNumber' } ) ;
		doormen.not( {} , { type: 'realNumber' } ) ;
		doormen.not( [] , { type: 'realNumber' } ) ;
	} ) ;
} ) ;



describe( "Common sanitizers" , function() {
	
	it( "should sanitize to 'number' accordingly" , function() {
		doormen.equals( doormen( 0 , { sanitize: 'number' } ) , 0 ) ;
		doormen.equals( doormen( '0' , { sanitize: 'number' } ) , 0 ) ;
		doormen.equals( doormen( 1 , { sanitize: 'number' } ) , 1 ) ;
		doormen.equals( doormen( '1' , { sanitize: 'number' } ) , 1 ) ;
	} ) ;
} ) ;



