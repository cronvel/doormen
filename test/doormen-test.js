/*
	Doormen

	Copyright (c) 2015 - 2021 Cédric Ronvel

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

/* global describe, it */

"use strict" ;



//const tree = require( 'tree-kit' ) ;

var doormen ;

if ( process.browser ) {
	doormen = require( '../lib/browser.js' ) ;
}
else {
	doormen = require( '../lib/doormen.js' ) ;
}



describe( "Assertion utilities" , () => {

	it( "doormen.shouldThrow() should throw if the callback has not throw, and catch if it has throw" , () => {
		var thrown ;

		thrown = false ;

		try {
			doormen.shouldThrow( () => {} ) ;
		}
		catch ( error ) {
			thrown = true ;
		}

		if ( ! thrown ) { throw new Error( 'It should throw!' ) ; }

		thrown = false ;

		try {
			doormen.shouldThrow( () => { throw new Error( 'Fatal error' ) ; } ) ;
		}
		catch ( error ) {
			thrown = true ;
		}

		if ( thrown ) { throw new Error( 'It should *NOT* throw' ) ; }
	} ) ;

	it( "doormen.not() should throw if the data validate, and catch if it has throw" , () => {
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



describe( "Equality checker" , () => {

	it( "Equality of simple type" , () => {
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

	it( "Equality of objects" , () => {
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

	it( "when a property is undefined in the left-side and non-existant in the right-side, they should be equals" , () => {
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 } ) ;
		doormen.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , c: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , d: undefined } ) ;
		doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' , e: undefined } } ) ;
	} ) ;

	it( "equality of properties being enumerable on one side and non-enumerable on the other side" , () => {
		var enum_ = {} , notEnum_ = {} ;

		Object.defineProperties( enum_ , {
			key: {
				value: 'one' ,
				writable: true ,
				enumerable: true
			}
		} ) ;

		Object.defineProperties( notEnum_ , {
			key: {
				value: 'one' ,
				writable: true ,
				enumerable: false
			}
		} ) ;

		doormen.equals( enum_ , notEnum_ ) ;
		doormen.equals( notEnum_ , enum_ ) ;

		enum_.key = 'two' ;
		doormen.not.equals( enum_ , notEnum_ ) ;
		doormen.not.equals( notEnum_ , enum_ ) ;
	} ) ;

	it( "Equality of functions" , () => {
		var o = {} ;
		var fn = function() {} ;
		var fn2 = function() {} ;

		doormen.equals( fn , fn ) ;
		doormen.not.equals( fn , fn2 ) ;
		doormen.equals( { a: fn } , { a: fn } ) ;
		doormen.equals( { b: 2 , a: fn } , { a: fn , b: 2 } ) ;
		doormen.equals( [ fn ] , [ fn ] ) ;
		doormen.equals( [ 1 , 2 , fn ] , [ 1 , 2 , fn ] ) ;
		doormen.not.equals( [ 1 , 2 , fn ] , [ 1 , 2 ] ) ;
	} ) ;

	it( "should test equality of objects with different prototype" ) ;

	it( "Equality of arrays" , () => {
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
		
		doormen.equals( [ [ 'one' ] , [ 'two' ] ] , [ [ 'one' ] , [ 'two' ] ] ) ;
		doormen.not.equals( [ [ 'one' ] , [ 'two' ] ] , [ [ 'one' ] , [ 'twoa' ] ] ) ;
	} ) ;

	it( "Equality of nested and mixed objects and arrays" , () => {
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

	it( "Circular references: stop searching when both part have reached circular references" , () => {
		var a , b ;

		a = { a: 1 , b: 2 } ;
		a.c = a ;

		b = { a: 1 , b: 2 } ;
		b.c = b ;

		doormen.equals( a , b ) ;

		a = { a: 1 , b: 2 , c: { a: 1 , b: 2 } } ;
		a.c.c = a ;

		b = { a: 1 , b: 2 } ;
		b.c = b ;

		doormen.equals( a , b ) ;
	} ) ;

	it( "Date" , () => {
		var date1 = new Date( '2019-06-18' ) ,
			date2 = new Date( '2019-08-21' ) ,
			date3 = new Date( '2019-08-21' ) ;
		
		doormen.not.equals( date1 , date2 ) ;
		doormen.equals( date2 , date3 ) ;
	} ) ;

	it( "Buffers" , () => {
		var buf , buf2 , i ;
		buf = Buffer.allocUnsafe( 80 ) ;
		buf2 = Buffer.allocUnsafe( 80 ) ;
		for ( i = 0 ; i < 80 ; i ++ ) { buf[ i ] = i ; }
		buf.copy( buf2 ) ;
		doormen.equals( buf , buf2 ) ;
		buf2[ 4 ] = 117 ;
		doormen.not.equals( buf , buf2 ) ;
	} ) ;

	it( ".isEqual() 'like' option" ) ;
	it( ".isEqual() 'oneWay' option" ) ;
	
	it( ".isEqual() and Symbol instances" , () => {
		var o1 = {} , o2 = {} , symbol = Symbol( 'symbol' ) ;
		expect( doormen.isEqual( o1 , o2 ) ).to.be( true ) ;
		o1[ symbol ] = 'v1' ;
		expect( doormen.isEqual( o1 , o2 ) ).to.be( false ) ;
		o2[ symbol ] = 'v1' ;
		expect( doormen.isEqual( o1 , o2 ) ).to.be( true ) ;
		o2[ symbol ] = 'v2' ;
		expect( doormen.isEqual( o1 , o2 ) ).to.be( false ) ;
	} ) ;

	it( ".isEqual() 'unordered' option" , () => {
		expect( doormen.isEqual( [1,2,3] , [1,2,3] , { unordered: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( [2,3,1] , [1,2,3] , { unordered: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( [2,2,1] , [1,2,3] , { unordered: true } ) ).to.be( false ) ;
		expect( doormen.isEqual( [3,2,1] , [2,2,3] , { unordered: true } ) ).to.be( false ) ;

		expect( doormen.isEqual( [{a:1},{b:2},[4,3,2]] , [{a:1},{b:2},[4,3,2]] , { unordered: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( [{a:1},{b:2},[4,3,2]] , [[2,4,3],{a:1},{b:2}] , { unordered: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( [[2,4,3],{a:1},{b:2}] , [{a:1},{b:2},[4,3,2]] , { unordered: true } ) ).to.be( true ) ;
	} ) ;

	it( ".isEqual() 'around' option" , () => {
		expect( doormen.isEqual( 1 , 1 , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 1 , 1.0000001 , { around: true } ) ).to.be( false ) ;
		expect( doormen.isEqual( 1.0000001 , 1 , { around: true } ) ).to.be( false ) ;
		expect( doormen.isEqual( 1 , 1 + Number.EPSILON , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 1 , 1 - Number.EPSILON , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 1 + Number.EPSILON , 1 , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 1 - Number.EPSILON , 1 , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 0.125 , 0.125 + Number.EPSILON , { around: true } ) ).to.be( false ) ;
		expect( doormen.isEqual( 0.125 , 0.125 + 0.125 * Number.EPSILON , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 8 , 8 + 8 * Number.EPSILON , { around: true } ) ).to.be( true ) ;

		// We allow up to 4 Epsilons of error by default
		expect( doormen.isEqual( 1 , 1 + 4 * Number.EPSILON , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 1 , 1 + 5 * Number.EPSILON , { around: true } ) ).to.be( false ) ;
		expect( doormen.isEqual( 8 , 8 + 32 * Number.EPSILON , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( 8 , 8 + 64 * Number.EPSILON , { around: true } ) ).to.be( false ) ;
		expect( doormen.isEqual( 8 , 8 + 40 * Number.EPSILON , { around: true } ) ).to.be( false ) ;


		expect( doormen.isEqual( { a: 8 } , { a: 8 + 32 * Number.EPSILON } , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( { a: 8 } , { a: 8 + 64 * Number.EPSILON } , { around: true } ) ).to.be( false ) ;

		expect( doormen.isEqual( { a: 0.2 - 0.05 } , { a: 0.15 } , { around: true } ) ).to.be( true ) ;
		expect( doormen.isEqual( { a: - 0.2 + 0.05 } , { a: - 0.15 } , { around: true } ) ).to.be( true ) ;
	} ) ;

	it( ".isEqual.getLastPath() should return the offending path of the last .isEqual() call that had returned false" , () => {
		expect( doormen.isEqual( {a:1,b:2,sub:{c:3}} , {a:1,b:2,sub:{c:3}} ) ).to.be( true ) ;
		expect( doormen.isEqual.getLastPath() ).to.be( null ) ;

		expect( doormen.isEqual( {a:1,b:2,sub:{c:3}} , {a:1,b:2,sub:{c:4}} ) ).to.be( false ) ;
		expect( doormen.isEqual.getLastPath() ).to.be( '.sub.c' ) ;

		expect( doormen.isEqual( {a:1,b:2,sub:{c:3,e:5}} , {a:1,b:2,sub:{c:3}} ) ).to.be( false ) ;
		expect( doormen.isEqual.getLastPath() ).to.be( '.sub.e' ) ;

		expect( doormen.isEqual( {a:1,b:2,sub:{c:3}} , {a:1,b:2,sub:{c:3,d:[1,2,3]}} ) ).to.be( false ) ;
		expect( doormen.isEqual.getLastPath() ).to.be( '.sub.d' ) ;

		expect( doormen.isEqual( {a:1,b:2,sub:{c:3,d:[1,4,5]}} , {a:1,b:2,sub:{c:3,d:[1,2,3]}} ) ).to.be( false ) ;
		expect( doormen.isEqual.getLastPath() ).to.be( '.sub.d.1' ) ;

		expect( doormen.isEqual( {a:1,b:2,sub:{c:3,d:[1]}} , {a:1,b:2,sub:{c:3,d:[1,2,3]}} ) ).to.be( false ) ;
		expect( doormen.isEqual.getLastPath() ).to.be( '.sub.d.1' ) ;

		expect( doormen.isEqual( {a:1,b:2,sub:{c:3,d:[1,2,3,4]}} , {a:1,b:2,sub:{c:3,d:[1,2,3]}} ) ).to.be( false ) ;
		expect( doormen.isEqual.getLastPath() ).to.be( '.sub.d.3' ) ;

		//doormen.expect( {a:1,b:2,sub:{c:3,d:[1,2,3,4]}} ).to.partially.equal( {a:1,b:2,sub:{c:3,d:[1,2,3]}} ) ;
	} ) ;
} ) ;



describe( "Basic types" , () => {

	it( "should validate undefined accordingly" , () => {
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

	it( "should validate null accordingly" , () => {
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

	it( "should validate boolean accordingly" , () => {
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

	it( "should validate number accordingly" , () => {
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

	it( "should validate string accordingly" , () => {
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

	it( "should validate object accordingly" , () => {
		doormen.not( { type: 'object' } , undefined ) ;
		doormen.not( { type: 'object' } , null ) ;
		doormen.not( { type: 'object' } , false ) ;
		doormen.not( { type: 'object' } , true ) ;
		doormen.not( { type: 'object' } , 0 ) ;
		doormen.not( { type: 'object' } , 1 ) ;
		doormen.not( { type: 'object' } , '' ) ;
		doormen.not( { type: 'object' } , 'text' ) ;
		doormen( { type: 'object' } , {} ) ;
		doormen( { type: 'object' } , { a: 1 , b: 2 } ) ;
		doormen( { type: 'object' } , [] ) ;
		doormen( { type: 'object' } , [ 1 , 2 , 3 ] ) ;
		doormen( { type: 'object' } , new Date() ) ;
		doormen.not( { type: 'object' } , () => {} ) ;
	} ) ;

	it( "should validate function accordingly" , () => {
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
		doormen( { type: 'function' } , () => {} ) ;
	} ) ;
} ) ;



describe( "Optional, default and forced data" , () => {

	it( "when a data is null, undefined or unexistant, and the optional flag is set the schema, it should validate" , () => {
		doormen.not( { type: 'string' } , null ) ;
		doormen( { optional: true , type: 'string' } , null ) ;
		doormen.not( { type: 'string' } , undefined ) ;
		doormen( { optional: true , type: 'string' } , undefined ) ;

		doormen( { type: 'string' } , 'text' ) ;
		doormen( { optional: true , type: 'string' } , 'text' ) ;
		doormen.not( { type: 'string' } , 1 ) ;
		doormen.not( { optional: true , type: 'string' } , 1 ) ;

		doormen.not( { properties: { a: { type: 'string' } } } , {} ) ;
		doormen( { properties: { a: { optional: true , type: 'string' } } } , {} ) ;
		doormen( { properties: { a: { optional: true , type: 'string' } } } , { a: null } ) ;
		doormen( { properties: { a: { optional: true , type: 'string' } } } , { a: undefined } ) ;
	} ) ;

	it( "if 'nullIsValue' and 'optional' flags are set, null values should validate instead being considerate a non-value" , () => {
		doormen.not( { nullIsValue: true , type: 'string' } , null ) ;
		doormen.not( { nullIsValue: true , optional: true , type: 'string' } , null ) ;
		doormen.not( { nullIsValue: true , type: 'string' } , undefined ) ;
		doormen( { nullIsValue: true , optional: true , type: 'string' } , undefined ) ;

		doormen.not( { properties: { a: { nullIsValue: true , type: 'string' } } } , {} ) ;
		doormen( { properties: { a: { nullIsValue: true , optional: true , type: 'string' } } } , {} ) ;
		doormen.not( { properties: { a: { nullIsValue: true , optional: true , type: 'string' } } } , { a: null } ) ;
		doormen( { properties: { a: { nullIsValue: true , optional: true , type: 'string' } } } , { a: undefined } ) ;
	} ) ;

	it( "if 'nullIsUndefined' is set null values are turned to 'undefined' before applying anything else" , () => {
		doormen.equals( doormen( { nullIsUndefined: false } , null ) , null ) ;
		doormen.equals( doormen( { nullIsUndefined: true } , null ) , undefined ) ;
		
		doormen.not( { nullIsUndefined: true , type: 'string' } , null ) ;
		doormen( { nullIsUndefined: true , optional: true , type: 'string' } , null ) ;
		doormen.not( { nullIsUndefined: true , type: 'string' } , undefined ) ;
		doormen( { nullIsUndefined: true , optional: true , type: 'string' } , undefined ) ;

		doormen.equals( doormen( { properties: { a: { nullIsUndefined: true , optional: true , type: 'string' } } } , { a: null } ) , { a: undefined } ) ;
		doormen.equals( doormen( { properties: { a: { nullIsUndefined: true , optional: true , type: 'string' } } } , { a: null } ) , {} ) ;
	} ) ;

	it( "missing optional properties should not be created (i.e. with undefined)." , () => {
		var result ;

		result = doormen( { properties: { a: { optional: true , type: 'string' } } } , {} ) ;

		// {a:undefined} is equals to {} for doormen.equals() (this is the correct behaviour), but here we want to know for sure
		// that a key is not defined, so we have to check it explicitly

		doormen.equals( 'a' in result , false ) ;

		result = doormen(
			{
				properties: {
					a: { optional: true , type: 'string' } ,
					b: { optional: true , type: 'string' } ,
					c: {
						optional: true ,
						properties: {
							d: { optional: true , type: 'string' }
						}
					}
				}
			} ,
			{}
		) ;

		doormen.equals( 'a' in result , false ) ;
		doormen.equals( 'b' in result , false ) ;
		doormen.equals( 'c' in result , false ) ;

		result = doormen(
			{
				properties: {
					a: { optional: true , type: 'string' } ,
					b: { optional: true , type: 'string' } ,
					c: {
						optional: true ,
						properties: {
							d: { optional: true , type: 'string' }
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

		result = doormen(
			{
				properties: {
					a: { optional: true , type: 'string' } ,
					b: { optional: true , type: 'string' } ,
					c: {
						optional: true ,
						properties: {
							d: { optional: true , type: 'string' }
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

		result = doormen(
			{
				properties: {
					a: { optional: true , type: 'string' } ,
					b: { optional: true , type: 'string' } ,
					c: {
						optional: true ,
						properties: {
							d: { optional: true , type: 'string' }
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

	it( "when a data is null, undefined or unexistant, and a default value is specified in the schema, that default value should overwrite the original one" , () => {
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
				{ a: null , b: undefined } ) ,
			{ a: 'default!' , b: { c: 5 } }
		) ;
		doormen.equals(
			doormen(
				{ properties: { a: { type: 'string' , "default": 'default!' } , b: { type: 'object' , "default": { c: 5 } } } } ,
				{} ) ,
			{ a: 'default!' , b: { c: 5 } }
		) ;
		
		// verify that default value can be a function (regression of v0.10.9)
		var fn = () => null ;
		doormen.equals(
			doormen(
				{ properties: { a: { type: 'string' , "default": fn } } } ,
				{ a: null } ) ,
			{ a: fn }
		) ;
	} ) ;

	it( "when the 'defaultFn' is specified in the schema and is a string, that builtin default function is executed and its return-value is used as the default" , () => {
		//doormen.equals( doormen( { type: 'date' , defaultFn: 'now' } , null ) , new Date() ) ;
		doormen.equals(
			doormen(
				{ properties: { a: { type: 'date' , defaultFn: 'now' } } } ,
				{ a: null } ) ,
			{ a: new Date() }
		) ;
	} ) ;

	it( "when the 'defaultFn' is specified in the schema and is a function, that function is executed and its return-value is used as the default" , () => {
		var date , count = 0 ;
		doormen.equals( doormen( { type: 'date' , defaultFn: () => date = new Date() } , null ) , date ) ;
		doormen.equals(
			doormen(
				{ properties: { a: { type: 'date' , defaultFn: () => date = new Date() } } } ,
				{ a: null } ) ,
			{ a: date }
		) ;

		doormen.equals( doormen( { type: 'integer' , defaultFn: () => ++ count } , null ) , 1 ) ;
		doormen.equals(
			doormen(
				{ properties: {
					a: { type: 'integer' , defaultFn: () => ++ count } ,
					b: { type: 'integer' , defaultFn: () => ++ count }
				} } ,
				{ a: null } ) ,
			{ a: 2 , b: 3 }
		) ;
	} ) ;

	it( "when the 'fakeFn' is specified in the schema and is a function, it has priority over 'defaultFn' only if fake-mode is turned on" , () => {
		var count = 0 ,
			fakeCount = 100 ;

		doormen.equals(
			doormen(
				{ properties: {
					a: { type: 'integer' , fakeFn: () => ++ fakeCount , defaultFn: () => ++ count } ,
					b: { type: 'integer' , fakeFn: () => ++ fakeCount , defaultFn: () => ++ count }
				} } ,
				{ a: null } ) ,
			{ a: 1 , b: 2 }
		) ;

		doormen.equals(
			doormen(
				{ fake: true } ,
				{ properties: {
					a: { type: 'integer' , fakeFn: () => ++ fakeCount , defaultFn: () => ++ count } ,
					b: { type: 'integer' , fakeFn: () => ++ fakeCount , defaultFn: () => ++ count }
				} } ,
				{ a: null } ) ,
			{ a: 101 , b: 102 }
		) ;
	} ) ;

	it( "if 'nullIsValue' is set and a 'default' value is set, null values are not replaced by the default value" , () => {
		doormen.not( { type: 'string' , nullIsValue: true , "default": 'default!' } , null ) ;
		doormen.equals( doormen( { nullIsValue: true , "default": 'default!' } , null ) , null ) ;
		doormen.equals( doormen( { nullIsValue: true , "default": 'default!' } , undefined ) , 'default!' ) ;
		
		doormen.not(
			{ properties: { a: { type: 'string' , nullIsValue: true , "default": 'default!' } } } ,
			{ a: null } ) ,
		{ a: null }
		doormen.equals(
			doormen(
				{ properties: { a: { nullIsValue: true , "default": 'default!' } } } ,
				{ a: null } ) ,
			{ a: null }
		) ;
		doormen.equals(
			doormen(
				{ properties: { a: { nullIsValue: true , "default": 'default!' } } } ,
				{ a: undefined } ) ,
			{ a: 'default!' }
		) ;

		doormen.equals(
			doormen(
				{ properties: { a: { nullIsValue: true , "default": 'default!' } , b: { type: 'object' , nullIsValue: true , "default": { c: 5 } } } } ,
				{ a: null , b: undefined } ) ,
			{ a: null , b: { c: 5 } }
		) ;
	} ) ;

	it( "when the schema has a forced value, it should validate the data and set it to that value" , () => {
		var schema ;
		
		schema = { value: 'forced!' } ;
		doormen.equals( doormen( schema , null ) , 'forced!' ) ;
		doormen.equals( doormen( schema , undefined ) , 'forced!' ) ;
		doormen.equals( doormen( schema , 'bob' ) , 'forced!' ) ;
		doormen.equals( doormen( schema , {} ) , 'forced!' ) ;
		
		schema = { properties: { a: { value: 'forced!' } } } ;
		doormen.equals( doormen( schema , {} ) , { a: 'forced!' } ) ;
		doormen.equals( doormen( schema , { a: undefined } ) , { a: 'forced!' } ) ;
		doormen.equals( doormen( schema , { a: null } ) , { a: 'forced!' } ) ;
		doormen.equals( doormen( schema , { a: 'bob' } ) , { a: 'forced!' } ) ;
		doormen.equals( doormen( schema , { a: { jack: 'bob' } } ) , { a: 'forced!' } ) ;
		
		schema = { properties: { a: { value: 'forced!' } , b: { value: { c: 5 } } } } ;
		doormen.equals( doormen( schema , { a: null , b: undefined } ) , { a: 'forced!' , b: { c: 5 } } ) ;
		doormen.equals( doormen( schema , {} ) , { a: 'forced!' , b: { c: 5 } } ) ;
	} ) ;
} ) ;



describe( "Built-in types" , () => {

	it( "should validate 'unset' accordingly (undefined or null)" , () => {
		doormen( { type: 'unset' } , undefined ) ;
		doormen( { type: 'unset' } , null ) ;
		doormen.not( { type: 'unset' } , false ) ;
		doormen.not( { type: 'unset' } , true ) ;
		doormen.not( { type: 'unset' } , 0 ) ;
		doormen.not( { type: 'unset' } , 1 ) ;
		doormen.not( { type: 'unset' } , '' ) ;
		doormen.not( { type: 'unset' } , 'text' ) ;
		doormen.not( { type: 'unset' } , {} ) ;
		doormen.not( { type: 'unset' } , [] ) ;
	} ) ;

	it( "should validate array accordingly" , () => {
		doormen.not( { type: 'array' } , undefined ) ;
		doormen.not( { type: 'array' } , null ) ;
		doormen.not( { type: 'array' } , false ) ;
		doormen.not( { type: 'array' } , true ) ;
		doormen.not( { type: 'array' } , 0 ) ;
		doormen.not( { type: 'array' } , 1 ) ;
		doormen.not( { type: 'array' } , '' ) ;
		doormen.not( { type: 'array' } , 'text' ) ;
		doormen.not( { type: 'array' } , {} ) ;
		doormen.not( { type: 'array' } , { a: 1 , b: 2 } ) ;
		doormen( { type: 'array' } , [] ) ;
		doormen( { type: 'array' } , [ 1 , 2 , 3 ] ) ;
		doormen.not( { type: 'array' } , () => {} ) ;
	} ) ;

	it( "should validate date accordingly" , () => {
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
		doormen.not( { type: 'date' } , { a: 1 , b: 2 } ) ;
		doormen.not( { type: 'date' } , [] ) ;
		doormen.not( { type: 'date' } , [ 1 , 2 , 3 ] ) ;
		doormen.not( { type: 'date' } , () => {} ) ;
	} ) ;

	it( "should validate error accordingly" , () => {
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
		doormen.not( { type: 'error' } , { a: 1 , b: 2 } ) ;
		doormen.not( { type: 'error' } , [] ) ;
		doormen.not( { type: 'error' } , [ 1 , 2 , 3 ] ) ;
		doormen.not( { type: 'error' } , () => {} ) ;
	} ) ;

	it( "should validate arguments accordingly" , () => {
		var fn = function() { doormen( { type: 'arguments' } , arguments ) ; } ;	// eslint-disable-line prefer-rest-params

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
		doormen.not( { type: 'arguments' } , { a: 1 , b: 2 } ) ;
		doormen.not( { type: 'arguments' } , [] ) ;
		doormen.not( { type: 'arguments' } , [ 1 , 2 , 3 ] ) ;
		doormen.not( { type: 'arguments' } , () => {} ) ;
	} ) ;
} ) ;



describe( "Mixed types" , () => {

	it( "should validate 'strictObject' accordingly, i.e. objects that are *NOT* arrays" , () => {
		doormen.not( { type: 'strictObject' } , undefined ) ;
		doormen.not( { type: 'strictObject' } , null ) ;
		doormen.not( { type: 'strictObject' } , false ) ;
		doormen.not( { type: 'strictObject' } , true ) ;
		doormen.not( { type: 'strictObject' } , 0 ) ;
		doormen.not( { type: 'strictObject' } , 1 ) ;
		doormen.not( { type: 'strictObject' } , '' ) ;
		doormen.not( { type: 'strictObject' } , 'text' ) ;
		doormen( { type: 'strictObject' } , {} ) ;
		doormen( { type: 'strictObject' } , { a: 1 , b: 2 } ) ;
		doormen.not( { type: 'strictObject' } , [] ) ;
		doormen.not( { type: 'strictObject' } , [ 1 , 2 , 3 ] ) ;
		doormen.not( { type: 'strictObject' } , () => {} ) ;
	} ) ;

	it( "should validate 'regexp' accordingly, i.e. RegExp instance or string convertible to RegExp" , () => {
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
		doormen.not( { type: 'regexp' } , { a: 1 , b: 2 } ) ;
		doormen.not( { type: 'regexp' } , [] ) ;
		doormen.not( { type: 'regexp' } , [ 1 , 2 , 3 ] ) ;
		doormen.not( { type: 'regexp' } , () => {} ) ;
	} ) ;

	it( "should validate 'classId' accordingly, i.e. function (constructor) or non-empty string" , () => {
		doormen.not( { type: 'classId' } , undefined ) ;
		doormen.not( { type: 'classId' } , null ) ;
		doormen.not( { type: 'classId' } , false ) ;
		doormen.not( { type: 'classId' } , true ) ;
		doormen.not( { type: 'classId' } , 0 ) ;
		doormen.not( { type: 'classId' } , 1 ) ;
		doormen.not( { type: 'classId' } , '' ) ;
		doormen( { type: 'classId' } , 'text' ) ;
		doormen.not( { type: 'classId' } , {} ) ;
		doormen.not( { type: 'classId' } , { a: 1 , b: 2 } ) ;
		doormen.not( { type: 'classId' } , [] ) ;
		doormen.not( { type: 'classId' } , [ 1 , 2 , 3 ] ) ;
		doormen( { type: 'classId' } , () => {} ) ;
	} ) ;
} ) ;



describe( "Top-level filters" , () => {

	it( "'instanceOf' should validate object accordingly" , () => {
		function MyClass() {}

		if ( doormen.isBrowser ) { window[ 'MyClass' ] = MyClass ; }
		else { global[ 'MyClass' ] = MyClass ; }

		doormen( { instanceOf: Date } , new Date() ) ;
		doormen( { instanceOf: Array } , new Array() ) ;
		doormen( { instanceOf: MyClass } , new MyClass() ) ;
		doormen( { instanceOf: Object } , new MyClass() ) ;

		doormen( { instanceOf: 'MyClass' } , new MyClass() ) ;
		doormen( { instanceOf: 'Object' } , new MyClass() ) ;

		doormen.not( { instanceOf: Date } , new Array() ) ;
		doormen.not( { instanceOf: 'Date' } , new Array() ) ;
	} ) ;

	it( "min filter should validate accordingly, non-number should throw" , () => {
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

	it( "max filter should validate accordingly, non-number should throw" , () => {
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

	it( "min + max filter should validate accordingly, non-number should throw" , () => {
		doormen.not( { min: 3 , max: 10 } , 15 ) ;
		doormen( { min: 3 , max: 10 } , 10 ) ;
		doormen( { min: 3 , max: 10 } , 5 ) ;
		doormen( { min: 3 , max: 10 } , 3 ) ;
		doormen.not( { min: 3 , max: 10 } , 1 ) ;
		doormen.not( { min: 3 , max: 10 } , 0 ) ;
		doormen.not( { min: 3 , max: 10 } , -10 ) ;
		doormen.not( { min: 3 , max: 10 } , Infinity ) ;
		doormen.not( { min: 3 , max: 10 } , -Infinity ) ;
		doormen.not( { min: 3 , max: 10 } , NaN ) ;
		doormen.not( { min: 3 , max: 10 } , true ) ;
		doormen.not( { min: 3 , max: 10 } , false ) ;
		doormen.not( { min: 3 , max: 10 } , '6' ) ;
	} ) ;

	it( "'length' filter should validate accordingly, data that do not have a length should throw" , () => {
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

	it( "minLength filter should validate accordingly, data that do not have a length should throw" , () => {
		doormen( { minLength: 3 } , "abc" ) ;
		doormen( { minLength: 3 } , "abcde" ) ;
		doormen.not( { minLength: 3 } , "ab" ) ;
		doormen.not( { minLength: 3 } , "" ) ;
		
		doormen( { minLength: 3 } , [ 1,2,3 ] ) ;
		doormen( { minLength: 3 } , [ 1,2,3,4 ] ) ;
		doormen.not( { minLength: 3 } , [ 1,2 ] ) ;

		doormen.not( { minLength: 3 } , 1 ) ;
		doormen.not( { minLength: 0 } , 1 ) ;
		doormen.not( { minLength: 3 } , NaN ) ;
		doormen.not( { minLength: 3 } , true ) ;
		doormen.not( { minLength: 3 } , false ) ;
	} ) ;

	it( "maxLength filter should validate accordingly, data that do not have a length should throw" , () => {
		doormen( { maxLength: 3 } , "abc" ) ;
		doormen.not( { maxLength: 3 } , "abcde" ) ;
		doormen( { maxLength: 3 } , "ab" ) ;
		doormen( { maxLength: 3 } , "" ) ;

		doormen( { maxLength: 3 } , [ 1,2,3 ] ) ;
		doormen.not( { maxLength: 3 } , [ 1,2,3,4 ] ) ;
		doormen( { maxLength: 3 } , [ 1,2 ] ) ;

		doormen.not( { maxLength: 3 } , 1 ) ;
		doormen.not( { maxLength: 0 } , 1 ) ;
		doormen.not( { maxLength: 3 } , NaN ) ;
		doormen.not( { maxLength: 3 } , true ) ;
		doormen.not( { maxLength: 3 } , false ) ;
	} ) ;

	it( "minLength + maxLength filter should validate accordingly, data that do not have a length should throw" , () => {
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

	it( "'match' filter should validate accordingly using a RegExp" , () => {
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

	it( "'in' filter should validate if the value is listed" , () => {
		doormen.not( { in: [ 1 , 5 , 7 ] } , 10 ) ;
		doormen( { in: [ 1 , 5 , 7 ] } , 5 ) ;
		doormen( { in: [ 1 , 5 , 7 ] } , 1 ) ;
		doormen.not( { in: [ 1 , 5 , 7 ] } , 0 ) ;
		doormen.not( { in: [ 1 , 5 , 7 ] } , -10 ) ;
		doormen.not( { in: [ 1 , 5 , 7 ] } , Infinity ) ;
		doormen( { in: [ 1 , 5 , Infinity , 7 ] } , Infinity ) ;
		doormen.not( { in: [ 1 , 5 , 7 ] } , -Infinity ) ;
		doormen.not( { in: [ 1 , 5 , 7 ] } , NaN ) ;
		doormen( { in: [ 1 , 5 , NaN , 7 ] } , NaN ) ;

		doormen( { in: [ 1 , true , 5 , 7 ] } , true ) ;
		doormen.not( { in: [ 1 , 5 , 7 ] } , true ) ;
		doormen( { in: [ 1 , false , 5 , 7 ] } , false ) ;
		doormen.not( { in: [ 1 , 5 , 7 ] } , false ) ;

		doormen.not( { in: [ 1 , 5 , 7 ] } , "text" ) ;
		doormen( { in: [ 1 , "text" , 5 , 7 ] } , "text" ) ;
		doormen( { in: [ "string" , "text" , "bob" ] } , "text" ) ;
		doormen.not( { in: [ "string" , "text" , "bob" ] } , "bobby" ) ;
		doormen( { in: [ "string" , "text" , "" ] } , "" ) ;
		doormen.not( { in: [ "string" , "text" , "bob" ] } , "" ) ;
	} ) ;

	it( "'notIn' filter should validate if the value is listed" , () => {
		doormen( { notIn: [ 1 , 5 , 7 ] } , 10 ) ;
		doormen.not( { notIn: [ 1 , 5 , 7 ] } , 5 ) ;
		doormen.not( { notIn: [ 1 , 5 , 7 ] } , 1 ) ;
		doormen( { notIn: [ 1 , 5 , 7 ] } , 0 ) ;
		doormen( { notIn: [ 1 , 5 , 7 ] } , -10 ) ;
		doormen( { notIn: [ 1 , 5 , 7 ] } , Infinity ) ;
		doormen.not( { notIn: [ 1 , 5 , Infinity , 7 ] } , Infinity ) ;
		doormen( { notIn: [ 1 , 5 , 7 ] } , -Infinity ) ;
		doormen( { notIn: [ 1 , 5 , 7 ] } , NaN ) ;
		doormen.not( { notIn: [ 1 , 5 , NaN , 7 ] } , NaN ) ;

		doormen.not( { notIn: [ 1 , true , 5 , 7 ] } , true ) ;
		doormen( { notIn: [ 1 , 5 , 7 ] } , true ) ;
		doormen.not( { notIn: [ 1 , false , 5 , 7 ] } , false ) ;
		doormen( { notIn: [ 1 , 5 , 7 ] } , false ) ;

		doormen( { notIn: [ 1 , 5 , 7 ] } , "text" ) ;
		doormen.not( { notIn: [ 1 , "text" , 5 , 7 ] } , "text" ) ;
		doormen.not( { notIn: [ "string" , "text" , "bob" ] } , "text" ) ;
		doormen( { notIn: [ "string" , "text" , "bob" ] } , "bobby" ) ;
		doormen.not( { notIn: [ "string" , "text" , "" ] } , "" ) ;
		doormen( { notIn: [ "string" , "text" , "bob" ] } , "" ) ;
	} ) ;

	it( "'in' filter containing object and arrays" , () => {
		doormen( { in: [ 1 , { a: 2 } , 5 , 7 ] } , { a: 2 } ) ;
		doormen.not( { in: [ 1 , { a: 2 } , 5 , 7 ] } , { a: 2 , b: 5 } ) ;
		doormen.not( { in: [ 1 , { a: 2 } , { b: 5 } , 7 ] } , { a: 2 , b: 5 } ) ;
		doormen( { in: [ 1 , { a: 2 } , { a: 2 , b: 5 } , { b: 5 } , 7 ] } , { a: 2 , b: 5 } ) ;
		doormen( { in: [ 1 , [ 'a' , 2 ] , 5 , 7 ] } , [ 'a' , 2 ] ) ;
		doormen.not( { in: [ 1 , [ 'a' , 2 , 3 ] , 5 , 7 ] } , [ 'a' , 2 ] ) ;
	} ) ;
} ) ;



describe( "Filters" , () => {

	it( "'greaterThan' and aliases ('gt' and '>') filter should validate accordingly, non-number should throw" , () => {
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

		doormen( { filter: { gt: 3 } } , 3.00001 ) ;
		doormen.not( { filter: { gt: 3 } } , 3 ) ;
		doormen( { filter: { '>': 3 } } , 3.00001 ) ;
		doormen.not( { filter: { '>': 3 } } , 3 ) ;
	} ) ;

	it( "'lesserThan' and aliases ('lt' and '<') filter should validate accordingly, non-number should throw" , () => {
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



describe( "Children and recursivity" , () => {

	it( "'of' should perform the check recursively for each children, using the same given schema for all of them." , () => {

		var schema ;

		schema = {
			of: { type: 'string' }
		} ;

		// Object
		doormen( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
		doormen.not( schema , { a: 1 , b: 'text' } ) ;
		doormen.not( schema , { a: 'text' , b: 3 } ) ;
		doormen( schema , { a: 'text' , b: 'string' } ) ;
		doormen.not( schema , { A: 'TEXT' , b: 'text' , c: undefined } ) ;

		// Array
		doormen( schema , [ 'text' ] ) ;
		doormen( schema , [] ) ;
		doormen( schema , [ 'text' , 'string' ] ) ;
		doormen.not( schema , [ 'text' , 'string' , null ] ) ;
		doormen.not( schema , [ 1 , 'text' , 'string' ] ) ;
		doormen.not( schema , [ 'text' , 'string' , null ] ) ;
		doormen.not( schema , [ true ] ) ;
	} ) ;

	it( "when 'properties' is an array, it should check if the value has all listed properties, no extra properties are allowed" , () => {

		var schema = {
			properties: [ 'a' , 'b' ]
		} ;

		doormen( schema , { a: 1 , b: 'text' } ) ;
		doormen( schema , { a: 'text' , b: 3 } ) ;
		doormen.not( schema , {
			A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
	} ) ;

	it( "when 'properties' is an array and 'extraProperties' is set, it should allow non-listed extra-properties" , () => {

		var schema = {
			properties: [ 'a' , 'b' ] ,
			extraProperties: true
		} ;

		doormen( schema , { a: 1 , b: 'text' } ) ;
		doormen( schema , { a: 'text' , b: 3 } ) ;
		doormen( schema , {
			A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
	} ) ;

	it( "when 'properties' is an object, it should perform the check recursively for each listed child, no extra properties are allowed" , () => {

		var schema = {
			properties: {
				a: { type: 'number' } ,
				b: { type: 'string' }
			}
		} ;

		doormen( schema , { a: 1 , b: 'text' } ) ;
		doormen.not( schema , { a: 'text' , b: 3 } ) ;
		doormen.not( schema , {
			A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
	} ) ;

	it( "when 'properties' is an object and 'extraProperties' is set, it should allow extra-properties" , () => {

		var schema = {
			properties: {
				a: { type: 'number' } ,
				b: { type: 'string' }
			} ,
			extraProperties: true
		} ;

		doormen( schema , { a: 1 , b: 'text' } ) ;
		doormen.not( schema , { a: 'text' , b: 3 } ) ;
		doormen( schema , {
			A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) ;
		doormen.not( schema , { b: 'text' } ) ;
		doormen.not( schema , { a: 1 } ) ;
	} ) ;

	it( "'elements' should perform the check recursively for each children elements, using a specific schema for each one, extra-element are not allowed" , () => {

		var schema = {
			elements: [
				{ type: 'string' } ,
				{ type: 'number' } ,
				{ type: 'boolean' }
			]
		} ;

		doormen( schema , [ 'text' , 3 , false ] ) ;
		doormen.not( schema , [ 'text' , 3 , false , 'extra' , true ] ) ;
		doormen.not( schema , [] ) ;
		doormen.not( schema , [ 'text' , 3 ] ) ;
		doormen.not( schema , [ true ] ) ;
	} ) ;

	it( "when 'elements' is used in conjunction with 'extraElements', extra-elements are allowed" , () => {

		var schema = {
			elements: [
				{ type: 'string' } ,
				{ type: 'number' } ,
				{ type: 'boolean' }
			] ,
			extraElements: true
		} ;

		doormen( schema , [ 'text' , 3 , false ] ) ;
		doormen( schema , [ 'text' , 3 , false , 'extra' , true ] ) ;
		doormen.not( schema , [] ) ;
		doormen.not( schema , [ 'text' , 3 ] ) ;
		doormen.not( schema , [ true ] ) ;
	} ) ;
} ) ;



describe( "Mask" , () => {

	it( "should mask data using a tier-level" , () => {
		var schema = {
			properties: {
				a: {
					type: 'number' ,
					tier: 1
				} ,
				b: {
					type: 'boolean' ,
					tier: 3
				} ,
				c: {
					type: 'string' ,
					tier: 2
				}
			}
		} ;

		var data = {
			a: 1 ,
			b: true ,
			c: 'blah!'
		} ;

		doormen.equals(
			doormen.tierMask( schema , data , 0 ) ,
			{}
		) ;
		doormen.equals(
			doormen.tierMask( schema , data , 1 ) ,
			{ a: 1 }
		) ;
		doormen.equals(
			doormen.tierMask( schema , data , 2 ) ,
			{ a: 1 , c: 'blah!' }
		) ;
		doormen.equals(
			doormen.tierMask( schema , data , 3 ) ,
			{ a: 1 , b: true , c: 'blah!' }
		) ;
		doormen.equals(
			doormen.tierMask( schema , data , 4 ) ,
			{ a: 1 , b: true , c: 'blah!' }
		) ;
	} ) ;

	it( "should mask nested data using a tier-level" , () => {
		var schema = {
			properties: {
				a: {
					type: 'number' ,
					tier: 1
				} ,
				b: {
					type: 'boolean' ,
					tier: 3
				} ,
				c: {
					type: 'string' ,
					tier: 2
				} ,
				d: {
					type: 'strictObject' ,
					properties: {
						e: {
							type: 'number' ,
							tier: 1
						} ,
						f: {
							type: 'boolean' ,
							tier: 3
						} ,
						g: {
							type: 'string' ,
							tier: 2
						}
					}
				} ,
				d2: {
					type: 'strictObject' ,
					tier: 2 ,
					extraProperties: true ,
					properties: {
						e: {
							type: 'number' ,
							tier: 1
						} ,
						f: {
							type: 'boolean' ,
							tier: 3
						} ,
						g: {
							type: 'string' ,
							tier: 2
						}
					}
				}
			}
		} ;

		var data = {
			a: 1 ,
			b: true ,
			c: 'blah!' ,
			d: {
				e: 7 ,
				f: false ,
				g: 'bob'
			} ,
			d2: {
				e: 7 ,
				f: false ,
				g: 'bob'
			}
		} ;

		doormen.equals(
			doormen.tierMask( schema , data , 1 ) ,
			{ a: 1 , d: { e: 7 } }
		) ;
		doormen.equals(
			doormen.tierMask( schema , data , 2 ) ,
			{
				a: 1 , c: 'blah!' , d: { e: 7 , g: 'bob' } , d2: { e: 7 , g: 'bob' }
			}
		) ;
		doormen.equals(
			doormen.tierMask( schema , data , 3 ) ,
			{
				a: 1 , b: true , c: 'blah!' , d: { e: 7 , f: false , g: 'bob' } , d2: { e: 7 , f: false , g: 'bob' }
			}
		) ;
		
		// Test extra-properties
		data.d.extra = 'val' ;
		data.d2.extra = 'val' ;
		doormen.equals(
			doormen.tierMask( schema , data , 2 ) ,
			{
				a: 1 , c: 'blah!' , d: { e: 7 , g: 'bob' } , d2: { e: 7 , g: 'bob' , extra: 'val' }
			}
		) ;
		
		// Test submasking
		schema.properties.d2.noSubmasking = true ;
		doormen.equals(
			doormen.tierMask( schema , data , 2 ) ,
			{
				a: 1 , c: 'blah!' , d: { e: 7 , g: 'bob' } , d2: { e: 7 , f: false , g: 'bob' , extra: 'val' }
			}
		) ;
	} ) ;

	it( "should mask data using tags" , () => {
		var schema = {
			properties: {
				_id: { tags: [] } ,
				slug: { tags: [ 'internal' , 'meta' ] } ,
				access: { tags: [ 'internal' ] } ,
				title: { tags: [ 'meta' ] } ,
				post: { tags: [ 'content' ] }
			}
		} ;

		var data = {
			_id: '1978f09ac3e' ,
			slug: 'ten-things-about-nothing' ,
			access: 'public' ,
			title: '10 things you should know about nothing' ,
			post: 'blah blah blah blah'
		} ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'meta' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				title: '10 things you should know about nothing'
			}
		) ;

		// Test the non-array syntax
		doormen.equals(
			doormen.tagMask( schema , data , 'meta' ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				title: '10 things you should know about nothing'
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				access: 'public'
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' , 'content' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				access: 'public' ,
				post: 'blah blah blah blah'
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' , 'meta' , 'content' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				access: 'public' ,
				title: '10 things you should know about nothing' ,
				post: 'blah blah blah blah'
			}
		) ;

	} ) ;

	it( "should mask nested data using tags" , () => {
		var schema = {
			properties: {
				_id: {} ,
				slug: { tags: [ 'internal' , 'meta' ] } ,
				accesses: {
					of: {
						properties: {
							userId: {} ,
							accessLevel: { tags: [ 'internal' ] }
						}
					}
				} ,
				title: { tags: [ 'meta' ] } ,
				post: { tags: [ 'content' ] }
			}
		} ;

		var data = {
			_id: '1978f09ac3e' ,
			slug: 'ten-things-about-nothing' ,
			accesses: [
				{
					userId: 'bob' ,
					accessLevel: 2
				} ,
				{
					userId: 'bill' ,
					accessLevel: 3
				}
			] ,
			title: '10 things you should know about nothing' ,
			post: 'blah blah blah blah'
		} ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'meta' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				accesses: [ { userId: 'bob' } , { userId: 'bill' } ] ,
				title: '10 things you should know about nothing'
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				accesses: [
					{ userId: 'bob' , accessLevel: 2 } ,
					{ userId: 'bill' , accessLevel: 3 }
				]
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' , 'content' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				accesses: [
					{ userId: 'bob' , accessLevel: 2 } ,
					{ userId: 'bill' , accessLevel: 3 }
				] ,
				post: 'blah blah blah blah'
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' , 'meta' , 'content' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				accesses: [
					{ userId: 'bob' , accessLevel: 2 } ,
					{ userId: 'bill' , accessLevel: 3 }
				] ,
				title: '10 things you should know about nothing' ,
				post: 'blah blah blah blah'
			}
		) ;
	} ) ;

	it( "tag-masking and 'noSubmasking' behavior" , () => {
		var schema = {
			properties: {
				_id: {} ,
				slug: { tags: [ 'internal' , 'meta' ] } ,
				accesses: {
					of: {
						properties: {
							userId: {} ,
							accessLevel: { tags: [ 'internal' ] } ,
							details: {
								tags: [ 'internal' ] ,
								properties: {
									k1: { type: 'string' , tags: [ 'nope' ] } ,
									k2: { type: 'string' }
								}
							}
						}
					}
				} ,
				title: { tags: [ 'meta' ] } ,
				post: { tags: [ 'content' ] }
			}
		} ;

		var data = {
			_id: '1978f09ac3e' ,
			slug: 'ten-things-about-nothing' ,
			accesses: [
				{
					userId: 'bob' ,
					accessLevel: 2 ,
					details: { k1: 'one' , k2: 'two' }
				} ,
				{
					userId: 'bill' ,
					accessLevel: 3 ,
					details: { k1: 'three' , k2: 'four' }
				}
			] ,
			title: '10 things you should know about nothing' ,
			post: 'blah blah blah blah'
		} ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'meta' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				accesses: [ { userId: 'bob' } , { userId: 'bill' } ] ,
				title: '10 things you should know about nothing'
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				accesses: [
					{ userId: 'bob' , accessLevel: 2 , details: { k2: 'two' } } ,
					{ userId: 'bill' , accessLevel: 3 , details: { k2: 'four' } }
				]
			}
		) ;

		schema.properties.accesses.of.properties.details.noSubmasking = true ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'internal' ] ) ,
			{
				_id: '1978f09ac3e' ,
				slug: 'ten-things-about-nothing' ,
				accesses: [
					{ userId: 'bob' , accessLevel: 2 , details: { k1: 'one' , k2: 'two' } } ,
					{ userId: 'bill' , accessLevel: 3 , details: { k1: 'three' , k2: 'four' } }
				]
			}
		) ;
	} ) ;

	it( "depthLimit with mask and nested data" , () => {
		var schema = {
			properties: {
				title: { tags: [ 'meta' ] } ,
				post: { tags: [ 'meta' ] } ,
				accesses: {
					of: {
						properties: {
							userId: { tags: [ 'meta' ] } ,
							accessLevel: { tags: [ 'internal' ] }
						}
					}
				}
			}
		} ;

		var data = {
			title: '10 things you should know about nothing' ,
			post: 'blah blah blah blah' ,
			accesses: [
				{
					userId: 'bob' ,
					accessLevel: 2
				} ,
				{
					userId: 'bill' ,
					accessLevel: 3
				}
			]
		} ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'meta' ] ) ,
			{
				title: '10 things you should know about nothing' ,
				post: 'blah blah blah blah' ,
				accesses: [ { userId: 'bob' } , { userId: 'bill' } ]
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'meta' ] , 1 ) ,
			{
				title: '10 things you should know about nothing' ,
				post: 'blah blah blah blah' ,
				accesses: [ { userId: 'bob' , accessLevel: 2 } , { userId: 'bill' , accessLevel: 3 } ]
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'meta' ] , 2 ) ,
			{
				title: '10 things you should know about nothing' ,
				post: 'blah blah blah blah' ,
				accesses: [ { userId: 'bob' , accessLevel: 2 } , { userId: 'bill' , accessLevel: 3 } ]
			}
		) ;

		doormen.equals(
			doormen.tagMask( schema , data , [ 'meta' ] , 3 ) ,
			{
				title: '10 things you should know about nothing' ,
				post: 'blah blah blah blah' ,
				accesses: [ { userId: 'bob' } , { userId: 'bill' } ]
			}
		) ;
	} ) ;

	it( ".patchTier()" , () => {
		var schema = {
			type: 'strictObject' ,
			properties: {
				a: {
					type: 'number' ,
					tier: 3
				} ,
				b: {
					type: 'string' ,
					tier: 1
				} ,
				c: {
					type: 'string' ,
					tier: 4
				} ,
				embedded: {
					type: 'strictObject' ,
					tier: 3 ,
					extraProperties: true ,
					properties: {
						d: {
							type: 'number' ,
							tier: 2
						} ,
						e: {
							type: 'string' ,
							tier: 4
						}
					}
				}
			}
		} ;

		doormen.equals(  doormen.patchTier( schema , {} )  ,  1  ) ;
		doormen.equals(  doormen.patchTier( schema , { a: 'some' , b: 'useless' , c: 'values' } )  ,  4  ) ;
		doormen.equals(  doormen.patchTier( schema , { a: 'some' } )  ,  3  ) ;
		doormen.equals(  doormen.patchTier( schema , { b: 'some' } )  ,  1  ) ;
		doormen.equals(  doormen.patchTier( schema , { a: 'some' , c: 'values' } )  ,  4  ) ;
		doormen.equals(  doormen.patchTier( schema , { a: 'some' , b: 'useless' } )  ,  3  ) ;
		doormen.equals(  doormen.patchTier( schema , { embedded: 'useless' } )  ,  3  ) ;
		doormen.equals(  doormen.patchTier( schema , { b: 'some' , 'embedded.e': 'useless' } )  ,  4  ) ;
		doormen.equals(  doormen.patchTier( schema , { b: 'some' , 'embedded.unexistant': 'useless' } )  ,  3  ) ;
		doormen.equals(  doormen.patchTier( schema , { 'embedded.e': 'useless' } )  ,  4  ) ;
		doormen.equals(  doormen.patchTier( schema , { 'embedded.d': 'useless' } )  ,  3  ) ;
		doormen.equals(  doormen.patchTier( schema , { 'embedded.unexistant': 'useless' } )  ,  3  ) ;
	} ) ;

	it( ".checkPatchByTags()" , () => {
		var schema = {
			properties: {
				_id: {} ,
				slug: { tags: [ 'internal' , 'meta' ] } ,
				accesses: {
					of: {
						properties: {
							userId: {} ,
							accessLevel: { tags: [ 'internal' ] }
						}
					}
				} ,
				title: { tags: [ 'meta' ] } ,
				post: { tags: [ 'content' ] }
			}
		} ;

		doormen.checkPatchByTags( schema , { slug: 'bob' } , 'meta' ) ;
		doormen.checkPatchByTags( schema , { slug: 'bob' } , 'internal' ) ;
		doormen.checkPatchByTags( schema , { slug: 'bob' } , [ 'meta' , 'content' ] ) ;
		doormen.shouldThrow( () => doormen.checkPatchByTags( schema , { slug: 'bob' } , 'content' ) ) ;
		doormen.shouldThrow( () => doormen.checkPatchByTags( schema , { slug: 'bob' } , [ 'content' , 'unknown' ] ) ) ;
		
		doormen.checkPatchByTags( schema , { title: 'bob' } , 'meta' ) ;
		doormen.checkPatchByTags( schema , { title: 'bob' } , [ 'content' , 'meta' ] ) ;
		doormen.shouldThrow( () => doormen.checkPatchByTags( schema , { title: 'bob' } , 'content' ) ) ;
		
		doormen.checkPatchByTags( schema , { "accesses.public.accessLevel": 5 } , 'internal' ) ;
		doormen.shouldThrow( () => doormen.checkPatchByTags( schema , { "accesses.public.accessLevel": 5 } , 'meta' ) ) ;

		doormen.checkPatchByTags( schema , { slug: 'bob' , title: 'bob' } , [ 'meta' , 'unknown' ] ) ;
		doormen.checkPatchByTags( schema , { slug: 'bob' , "accesses.public.accessLevel": 5 } , [ 'internal' , 'unknown' ] ) ;
		
		doormen.checkPatchByTags( schema , { post: 'my content' } , [ 'content' , 'unknown' ] ) ;
		doormen.shouldThrow( () => doormen.checkPatchByTags( schema , { slug: 'bob' , post: 'my content' } , [ 'content' , 'unknown' ] ) ) ;
	} ) ;

	it( "should validate a patch with the 'allowedTags' option" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				a: { type: 'string' , sanitize: 'toString' , tags: [ 'meta' ] } ,
				b: { type: 'string' , tags: [ 'meta' , 'internal' ] } ,
				c: { type: 'string' , tags: [ 'content' ] }
			}
		} ;

		doormen.patch( { allowedTags: [ 'meta' , 'content' ] } , schema , { a: 'one' , b: 'two' , c: 'three' } ) ;
		doormen.patch( { allowedTags: 'meta' } , schema , { a: 'one' , b: 'two' } ) ;
		doormen.shouldThrow( () => doormen.patch( { allowedTags: 'meta' } , schema , { a: 'one' , b: 'two' , c: 'three' } ) ) ;
		doormen.patch( { allowedTags: [ 'meta' , 'content' ] } , schema , { a: 1 , b: 'two' , c: 'three' } ) ;
		doormen.equals( doormen.patch( { allowedTags: [ 'meta' , 'content' ] } , schema , { a: 1 , b: 'two' } ) , { a: '1' , b: 'two' } ) ;
	} ) ;

	it( "should find all tags in a schema" , () => {
		var schema = {
			properties: {
				_id: {} ,
				slug: { tags: [ 'internal' , 'meta' ] } ,
				accesses: {
					of: {
						tags: [ 'nested' ] ,
						properties: {
							userId: {} ,
							accessLevel: { tags: [ 'internal' ] }
						}
					}
				} ,
				title: { tags: [ 'meta' ] } ,
				post: { tags: [ 'content' ] }
			}
		} ;

		var tags = doormen.getAllSchemaTags( schema ) ;
		expect( tags ).to.be.a( Set ) ;
		doormen.equals( [ ... tags ] , [ 'internal' , 'meta' , 'nested' , 'content' ] ) ;
	} ) ;
} ) ;



describe( "Numbers meta types" , () => {

	it( "should validate real accordingly" , () => {
		doormen( { type: 'real' } , 0 ) ;
		doormen( { type: 'real' } , 1 ) ;
		doormen( { type: 'real' } , -1 ) ;
		doormen( { type: 'real' } , 0.3 ) ;
		doormen( { type: 'real' } , 18.36 ) ;
		doormen.not( { type: 'real' } , 1 / 0 ) ;
		doormen.not( { type: 'real' } , -1 / 0 ) ;
		doormen.not( { type: 'real' } , Infinity ) ;
		doormen.not( { type: 'real' } , -Infinity ) ;
		doormen.not( { type: 'real' } , NaN ) ;

		doormen.not( { type: 'real' } , undefined ) ;
		doormen.not( { type: 'real' } , null ) ;
		doormen.not( { type: 'real' } , false ) ;
		doormen.not( { type: 'real' } , true ) ;
		doormen.not( { type: 'real' } , '' ) ;
		doormen.not( { type: 'real' } , 'text' ) ;
		doormen.not( { type: 'real' } , {} ) ;
		doormen.not( { type: 'real' } , [] ) ;
	} ) ;

	it( "should validate integer accordingly" , () => {
		doormen( { type: 'integer' } , 0 ) ;
		doormen( { type: 'integer' } , 1 ) ;
		doormen( { type: 'integer' } , 123456789 ) ;
		doormen( { type: 'integer' } , -1 ) ;
		doormen.not( { type: 'integer' } , 0.00001 ) ;
		doormen.not( { type: 'integer' } , -0.00001 ) ;
		doormen.not( { type: 'integer' } , 123456.00001 ) ;
		doormen.not( { type: 'integer' } , 123456.99999 ) ;
		doormen.not( { type: 'integer' } , 0.3 ) ;
		doormen.not( { type: 'integer' } , 18.36 ) ;
		doormen.not( { type: 'integer' } , 1 / 0 ) ;
		doormen.not( { type: 'integer' } , Infinity ) ;
		doormen.not( { type: 'integer' } , -Infinity ) ;
		doormen.not( { type: 'integer' } , NaN ) ;

		doormen.not( { type: 'integer' } , undefined ) ;
		doormen.not( { type: 'integer' } , null ) ;
		doormen.not( { type: 'integer' } , false ) ;
		doormen.not( { type: 'integer' } , true ) ;
		doormen.not( { type: 'integer' } , '' ) ;
		doormen.not( { type: 'integer' } , 'text' ) ;
		doormen.not( { type: 'integer' } , {} ) ;
		doormen.not( { type: 'integer' } , [] ) ;
	} ) ;
} ) ;



describe( "Strings meta types" , () => {

	it( "should validate hex accordingly" , () => {
		doormen( { type: 'hex' } , '1234' ) ;
		doormen( { type: 'hex' } , '12af34' ) ;
		doormen( { type: 'hex' } , '12AF34' ) ;
		doormen.not( { type: 'hex' } , '12g34' ) ;
	} ) ;

	it( "should validate ipv4 accordingly" , () => {
		doormen( { type: 'ipv4' } , '127.0.0.1' ) ;
		doormen( { type: 'ipv4' } , '127.000.00.001' ) ;
		doormen.not( { type: 'ipv4' } , '127.0000.00.001' ) ;
		doormen.not( { type: 'ipv4' } , '0127.000.00.001' ) ;
		doormen.not( { type: 'ipv4' } , '127.0.0.0001' ) ;
		doormen.not( { type: 'ipv4' } , '127.0.0.' ) ;
		doormen.not( { type: 'ipv4' } , '127.0.0.256' ) ;
		doormen.not( { type: 'ipv4' } , '127.0.0.1.' ) ;
		doormen.not( { type: 'ipv4' } , '.127.0.0.1' ) ;
		doormen.not( { type: 'ipv4' } , '.127.0.0.' ) ;
	} ) ;

	it( "should validate ipv6 accordingly" , () => {
		doormen( { type: 'ipv6' } , '2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
		doormen.not( { type: 'ipv6' } , ':2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
		doormen.not( { type: 'ipv6' } , 'abcd:2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
		doormen.not( { type: 'ipv6' } , '2001:0db8:0000:0000:0000:ff00:0042:8329:' ) ;
		doormen.not( { type: 'ipv6' } , '2001:0000:0000:0000:ff00:0042:8329:' ) ;
		doormen.not( { type: 'ipv6' } , ':2001:0000:0000:0000:ff00:0042:8329' ) ;
		doormen( { type: 'ipv6' } , '2001:db8:0:0:0:ff00:0042:8329' ) ;
		doormen( { type: 'ipv6' } , '2001:db8::ff00:0042:8329' ) ;
		doormen.not( { type: 'ipv6' } , '2001:db8:::0042:8329' ) ;
		doormen.not( { type: 'ipv6' } , '2001:db8::ff00::0042:8329' ) ;
		doormen.not( { type: 'ipv6' } , '2001::ff00::0042:8329' ) ;
		doormen( { type: 'ipv6' } , '::1' ) ;
		doormen( { type: 'ipv6' } , '1::' ) ;
	} ) ;

	it( "should validate ip accordingly" , () => {
		doormen( { type: 'ip' } , '127.0.0.1' ) ;
		doormen( { type: 'ip' } , '127.000.00.001' ) ;
		doormen.not( { type: 'ip' } , '127.0000.00.001' ) ;
		doormen.not( { type: 'ip' } , '0127.000.00.001' ) ;
		doormen.not( { type: 'ip' } , '127.0.0.0001' ) ;
		doormen.not( { type: 'ip' } , '127.0.0.' ) ;
		doormen.not( { type: 'ip' } , '127.0.0.256' ) ;
		doormen.not( { type: 'ip' } , '127.0.0.1.' ) ;
		doormen.not( { type: 'ip' } , '.127.0.0.1' ) ;
		doormen.not( { type: 'ip' } , '.127.0.0.' ) ;

		doormen( { type: 'ip' } , '2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
		doormen.not( { type: 'ip' } , ':2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
		doormen.not( { type: 'ip' } , 'abcd:2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
		doormen.not( { type: 'ip' } , '2001:0db8:0000:0000:0000:ff00:0042:8329:' ) ;
		doormen.not( { type: 'ip' } , '2001:0000:0000:0000:ff00:0042:8329:' ) ;
		doormen.not( { type: 'ip' } , ':2001:0000:0000:0000:ff00:0042:8329' ) ;
		doormen( { type: 'ip' } , '2001:db8:0:0:0:ff00:0042:8329' ) ;
		doormen( { type: 'ip' } , '2001:db8::ff00:0042:8329' ) ;
		doormen.not( { type: 'ip' } , '2001:db8:::0042:8329' ) ;
		doormen.not( { type: 'ip' } , '2001:db8::ff00::0042:8329' ) ;
		doormen.not( { type: 'ip' } , '2001::ff00::0042:8329' ) ;
		doormen( { type: 'ip' } , '::1' ) ;
		doormen( { type: 'ip' } , '1::' ) ;
	} ) ;

	it( "should validate hostname accordingly" ) ;
	it( "should validate host accordingly" ) ;

	it( "should validate url accordingly" , () => {
		doormen( { type: 'url' } , 'http://google.com' ) ;
		doormen( { type: 'url' } , 'http://google.com/' ) ;
		doormen( { type: 'url' } , 'https://stackoverflow.com/questions/1303872/url-validation-using-javascript' ) ;
		doormen( { type: 'url' } , 'http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2' ) ;
		doormen( { type: 'url' } , 'https://uk.reuters.com/article/2013/02/25/rosneft-tender-idUKL6N0BPJZC20130225' ) ;
		doormen( { type: 'url' } , 'http://grooveshark.com/#!/massive_attack' ) ;
		doormen( { type: 'url' } , 'http://::1/#!/massive_attack' ) ;
		doormen( { type: 'url' } , 'http://127.0.0.1/' ) ;
		doormen( { type: 'url' } , 'http://localhost/' ) ;
		doormen( { type: 'url' } , 'http://localhost:8080/' ) ;
		doormen( { type: 'url' } , 'http://bob@localhost/' ) ;
		doormen( { type: 'url' } , 'http://bob:pw@localhost/' ) ;
		doormen.not( { type: 'url' } , 'http://127.0.0.1/spaces not allowed' ) ;
		doormen.not( { type: 'url' } , 'http://127.0.0/' ) ;
		doormen.not( { type: 'url' } , 'http://192.168.0.256/' ) ;
		doormen.not( { type: 'url' } , 'http://19.16.33.25.6/' ) ;
		doormen( { type: 'url' } , 'file:///home/toto/TODO.txt' ) ;
		doormen.not( { type: 'url' } , 'http:///google.com/' ) ;
		doormen.not( { type: 'url' } , 'google.com' ) ;
	} ) ;

	it( "should validate web url accordingly" , () => {
		doormen( { type: 'weburl' } , 'http://google.com' ) ;
		doormen( { type: 'weburl' } , 'https://stackoverflow.com/questions/1303872/url-validation-using-javascript' ) ;
		doormen( { type: 'weburl' } , 'http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2' ) ;
		doormen( { type: 'weburl' } , 'https://uk.reuters.com/article/2013/02/25/rosneft-tender-idUKL6N0BPJZC20130225' ) ;
		doormen( { type: 'weburl' } , 'http://grooveshark.com/#!/massive_attack' ) ;
		doormen( { type: 'weburl' } , 'http://127.0.0.1/#!/massive_attack' ) ;
		doormen( { type: 'weburl' } , 'http://::1/#!/massive_attack' ) ;
		doormen( { type: 'weburl' } , 'http://127.0.0.1/' ) ;
		doormen.not( { type: 'weburl' } , 'http://127.0.0.1/spaces not allowed' ) ;
		doormen.not( { type: 'weburl' } , 'http://127.0.0/' ) ;
		doormen.not( { type: 'weburl' } , 'http://192.168.0.256/' ) ;
		doormen.not( { type: 'weburl' } , 'http://19.16.33.25.6/' ) ;
		doormen.not( { type: 'weburl' } , 'file:///home/toto/TODO.txt' ) ;
		doormen.not( { type: 'weburl' } , 'google.com' ) ;
	} ) ;

	it( "should validate email accordingly" , () => {
		doormen( { type: 'email' } , 'bob@gmail.com' ) ;
		doormen( { type: 'email' } , 'cedric.ronvel@gmail.com' ) ;
		doormen( { type: 'email' } , 'cédric.ronvel@gmail.com' ) ;
		doormen( { type: 'email' } , 'Cédric.Ronvel@gmail.com' ) ;
		doormen( { type: 'email' } , 'söm3-2än.dOm+çH4r@g33-mail.ninja' ) ;
		doormen.not( { type: 'email' } , 'bobgmail.com' ) ;
		doormen.not( { type: 'email' } , 'bob.@gmail.com' ) ;
		doormen.not( { type: 'email' } , '.bob@gmail.com' ) ;
		doormen.not( { type: 'email' } , 'bob..bob@gmail.com' ) ;
		doormen( { type: 'email' } , 'bob.a.bob@gmail.com' ) ;
		doormen.not( { type: 'email' } , 'bob @gmail.com' ) ;
		doormen.not( { type: 'email' } , ' bob@gmail.com' ) ;
		doormen.not( { type: 'email' } , 'b b@gmail.com' ) ;
	} ) ;
} ) ;



describe( "Sanitize" , () => {

	it( "should sanitize to 'toString' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'toString' } , "string" ) , "string" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , "123" ) , "123" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , "" ) , "" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , 0 ) , "0" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , 1234 ) , "1234" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , 123.45 ) , "123.45" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , -123.45 ) , "-123.45" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , true ) , "true" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , false ) , "false" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , null ) , "null" ) ;
		doormen.equals( doormen( { sanitize: 'toString' } , undefined ) , "undefined" ) ;
	} ) ;

	it( "should sanitize to 'toStringEmpty', undefined and null return an empty string" , () => {
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , "string" ) , "string" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , "123" ) , "123" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , "" ) , "" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , 0 ) , "0" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , 1234 ) , "1234" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , 123.45 ) , "123.45" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , -123.45 ) , "-123.45" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , true ) , "true" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , false ) , "false" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , null ) , "" ) ;
		doormen.equals( doormen( { sanitize: 'toStringEmpty' } , undefined ) , "" ) ;
	} ) ;

	it( "should sanitize 'numberToString' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'numberToString' } , "string" ) , "string" ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , "123" ) , "123" ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , "" ) , "" ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , 0 ) , "0" ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , 1234 ) , "1234" ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , 123.45 ) , "123.45" ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , -123.45 ) , "-123.45" ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , true ) , true ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , false ) , false ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , null ) , null ) ;
		doormen.equals( doormen( { sanitize: 'numberToString' } , undefined ) , undefined ) ;
	} ) ;

	it( "should sanitize to 'toBoolean' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'toBoolean' } , 0 ) , false ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , '0' ) , false ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , 1 ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , '1' ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , 123 ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "on" ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "On" ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "ON" ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "off" ) , false ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "Off" ) , false ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "OFF" ) , false ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "true" ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "false" ) , false ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "yes" ) , true ) ;
		doormen.equals( doormen( { sanitize: 'toBoolean' } , "no" ) , false ) ;

		doormen.equals( doormen( { sanitize: 'toBoolean' } , '123' ) , true ) ;
	} ) ;

	it( "should sanitize to 'toNumber' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'toNumber' } , 0 ) , 0 ) ;
		doormen.equals( doormen( { sanitize: 'toNumber' } , '0' ) , 0 ) ;
		doormen.equals( doormen( { sanitize: 'toNumber' } , 1 ) , 1 ) ;
		doormen.equals( doormen( { sanitize: 'toNumber' } , '1' ) , 1 ) ;
		doormen.equals( doormen( { sanitize: 'toNumber' } , 123 ) , 123 ) ;
		doormen.equals( doormen( { sanitize: 'toNumber' } , '123' ) , 123 ) ;
		doormen.equals( doormen( { sanitize: 'toNumber' } , 123.456 ) , 123.456 ) ;
		doormen.equals( doormen( { sanitize: 'toNumber' } , '123.456' ) , 123.456 ) ;
	} ) ;

	it( "should sanitize to 'toInteger' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'toInteger' } , 0 ) , 0 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , '0' ) , 0 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , 1 ) , 1 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , '1' ) , 1 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , 123 ) , 123 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , '123' ) , 123 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , 123.456 ) , 123 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , '123.456' ) , 123 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , 123.789 ) , 124 ) ;
		doormen.equals( doormen( { sanitize: 'toInteger' } , '123.789' ) , 124 ) ;
	} ) ;

	it( "should sanitize to 'toArray' accordingly" , function() {	// <- function() because we use 'arguments' in the test
		doormen.equals( doormen( { sanitize: 'toArray' } , [] ) , [] ) ;
		doormen.equals( doormen( { sanitize: 'toArray' } , [ 1 , 2 , 3 ] ) , [ 1 , 2 , 3 ] ) ;
		doormen.equals( doormen( { sanitize: 'toArray' } , { a: 'Ah!' , b: 'bee' } ) , [ { a: 'Ah!' , b: 'bee' } ] ) ;
		doormen.equals( doormen( { sanitize: 'toArray' } , 0 ) , [ 0 ] ) ;
		doormen.equals( doormen( { sanitize: 'toArray' } , 'a' ) , [ 'a' ] ) ;

		var fn = function() { return doormen( { sanitize: 'toArray' } , arguments ) ; } ;	// eslint-disable-line prefer-rest-params
		doormen.equals( fn() , [] ) ;
		doormen.equals( fn( 1 , 2 , 3 ) , [ 1 , 2 , 3 ] ) ;
		doormen.equals( fn( { yeepee: 'yaa' } , 'yeah' , true ) , [ { yeepee: 'yaa' } , 'yeah' , true ] ) ;
		doormen.equals( Array.isArray( fn( 1 , 2 , 3 ) ) , true ) ;
		doormen.equals( Array.isArray( arguments ) , false ) ;	// eslint-disable-line prefer-rest-params
	} ) ;

	it( "should sanitize to 'toDate' accordingly" , () => {
		var date = new Date() ;
		var timestamp = date.getTime() ;
		var dateString = date.toISOString() ;	// .toString() doesn't work: it strips millisecond
		doormen.equals( doormen( { sanitize: 'toDate' } , date ) , date ) ;
		doormen.equals( doormen( { sanitize: 'toDate' } , timestamp ) , date ) ;
		doormen.equals( doormen( { sanitize: 'toDate' } , dateString ) , date ) ;

		//console.log( doormen( { sanitize: 'toDate' } , 123456789 ) ) ;
		//console.log( doormen( { sanitize: 'toDate' } , timestamp ) ) ;
		//console.log( doormen( { sanitize: 'toDate' } , dateString ) ) ;
		//console.log( doormen( { sanitize: 'toDate' } , 'bob' ) ) ;

		doormen.equals( doormen( { sanitize: 'toDate' } , 'bob' ) , 'bob' ) ;
		doormen.equals( doormen( { sanitize: 'toDate' } , [] ) , [] ) ;
		doormen.equals( doormen( { sanitize: 'toDate' } , [ 1 , 2 , 3 ] ) , [ 1 , 2 , 3 ] ) ;
		doormen.equals( doormen( { sanitize: 'toDate' } , { a: 'Ah!' , b: 'bee' } ) , { a: 'Ah!' , b: 'bee' } ) ;
	} ) ;

	it( "should remove extra properties accordingly" , () => {
		var schema ;

		schema = {
			sanitize: 'removeExtraProperties' ,
			properties: [ 'a' , 'b' ]
		} ;

		doormen( schema , { a: 1 , b: 'text' } ) ;
		doormen( schema , { a: 'text' , b: 3 } ) ;
		doormen.equals( doormen( schema , {
			A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) , { a: 1 , b: 'text' } ) ;
		doormen.equals( doormen( schema , {
			omg: 'noob!' , A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) , { a: 1 , b: 'text' } ) ;


		schema = {
			sanitize: 'removeExtraProperties' ,
			properties: {
				a: { type: 'number' } ,
				b: { type: 'string' }
			}
		} ;

		doormen( schema , { a: 1 , b: 'text' } ) ;
		doormen.not( schema , { a: 'text' , b: 3 } ) ;
		doormen.equals( doormen( schema , {
			A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) , { a: 1 , b: 'text' } ) ;
		doormen.equals( doormen( schema , {
			omg: 'noob!' , A: 'TEXT' , a: 1 , b: 'text' , c: 5
		} ) , { a: 1 , b: 'text' } ) ;
	} ) ;

	it( "should trim a string accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'trim' } , 'a' ) , 'a' ) ;
		doormen.equals( doormen( { sanitize: 'trim' } , '  a' ) , 'a' ) ;
		doormen.equals( doormen( { sanitize: 'trim' } , 'a   ' ) , 'a' ) ;
		doormen.equals( doormen( { sanitize: 'trim' } , '  a   ' ) , 'a' ) ;
		doormen.equals( doormen( { sanitize: 'trim' } , 'ab  cd' ) , 'ab  cd' ) ;
		doormen.equals( doormen( { sanitize: 'trim' } , '   ab  cd' ) , 'ab  cd' ) ;
		doormen.equals( doormen( { sanitize: 'trim' } , 'ab  cd   ' ) , 'ab  cd' ) ;
		doormen.equals( doormen( { sanitize: 'trim' } , '   ab  cd  ' ) , 'ab  cd' ) ;
	} ) ;

	it( "should sanitize to 'toUpperCase' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'toUpperCase' } , 'aBc dE f' ) , 'ABC DE F' ) ;
	} ) ;

	it( "should sanitize to 'toLowerCase' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'toLowerCase' } , 'aBc dE f' ) , 'abc de f' ) ;
	} ) ;

	it( "should sanitize to 'capitalize' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'capitalize' } , 'oneTWOthree' ) , 'OneTWOthree' ) ;
		doormen.equals( doormen( { sanitize: 'capitalize' } , 'one TWO tHRee' ) , 'One TWO THRee' ) ;
	} ) ;

	it( "should sanitize to 'titleCase' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'titleCase' } , 'oneTWOthree' ) , 'Onetwothree' ) ;
		doormen.equals( doormen( { sanitize: 'titleCase' } , 'one TWO tHRee' ) , 'One TWO Three' ) ;
	} ) ;

	it( "should sanitize to 'dashToCamelCase' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'dashToCamelCase' } , 'to-upper-case' ) , 'toUpperCase' ) ;
		doormen.equals( doormen( { sanitize: 'dashToCamelCase' } , 'toUpperCase' ) , 'toUpperCase' ) ;
	} ) ;

	it( "should sanitize to 'latinize' accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'latinize' } , 'éàèùâêîôûÂÊÎÔÛäëïöüÄËÏÖÜæÆŧøþßðđħł' ) , 'eaeuaeiouAEIOUaeiouAEIOUaeAEtothssdhdhl' ) ;
	} ) ;

	it( "sanitize should work recursively as well" , () => {
		doormen.equals( doormen( { of: { sanitize: 'trim' } } , {} ) , {} ) ;
		doormen.equals( doormen( { of: { sanitize: 'trim' } } , { a: ' toto  ' } ) , { a: 'toto' } ) ;
		doormen.equals( doormen( { of: { sanitize: 'trim' } } , { a: ' toto  ' , b: 'text  ' } ) , { a: 'toto' , b: 'text' } ) ;
		doormen.equals( doormen(
			{ of: { sanitize: 'trim' } } ,
			{ a: ' toto  ' , b: 'text  ' } ) ,
		{ a: 'toto' , b: 'text' }
		) ;
		doormen.equals( doormen(
			{ extraProperties: true , properties: { a: { sanitize: 'trim' } } } ,
			{ a: ' toto  ' , b: 'text  ' } ) ,
		{ a: 'toto' , b: 'text  ' }
		) ;
		doormen.equals( doormen(
			{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
			{ a: ' toto  ' , b: 'text  ' } ) ,
		{ a: 'toto' , b: 'text' }
		) ;
	} ) ;

	it( "should resize a string accordingly" , () => {
		doormen.equals( doormen( { sanitize: 'resize' , maxLength: 3 } , 'abcde' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , maxLength: 3 } , 'abc' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , maxLength: 3 } , 'ab' ) , 'ab' ) ;
		
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , minLength: 3 } , 'a' ) , '--a' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , minLength: 3 } , 'a' ) , 'a--' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , minLength: 3 } , 'abc' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , minLength: 3 } , 'abc' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , minLength: 3 } , 'abcde' ) , 'abcde' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , minLength: 3 } , 'abcde' ) , 'abcde' ) ;
		
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , length: 3 } , 'a' ) , '--a' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , length: 3 } , 'a' ) , 'a--' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , length: 3 } , 'abc' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , length: 3 } , 'abc' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , length: 3 } , 'abcde' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , length: 3 } , 'abcde' ) , 'abc' ) ;

		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , minLength: 3 , maxLength: 5 } , 'a' ) , '--a' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , minLength: 3 , maxLength: 5 } , 'a' ) , 'a--' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , minLength: 3 , maxLength: 5 } , 'abc' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , minLength: 3 , maxLength: 5 } , 'abc' ) , 'abc' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , minLength: 3 , maxLength: 5 } , 'abcde' ) , 'abcde' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , minLength: 3 , maxLength: 5 } , 'abcde' ) , 'abcde' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '-' , minLength: 3 , maxLength: 5 } , 'abcdefg' ) , 'abcde' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '-' , minLength: 3 , maxLength: 5 } , 'abcdefg' ) , 'abcde' ) ;

		doormen.equals( doormen( { sanitize: 'resize' , minLength: 3 } , 'a' ) , 'a  ' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , leftPadding: '----' , length: 3 } , 'a' ) , '--a' ) ;
		doormen.equals( doormen( { sanitize: 'resize' , rightPadding: '----' , length: 3 } , 'a' ) , 'a--' ) ;
	} ) ;

} ) ;



describe( "Sanitize + Patch reporting" , () => {

	it( "sanitize should should report in the provided patch object" , () => {
		var schema , patch ;

		patch = {} ;
		doormen(
			{ patch: patch } ,
			{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
			{ a: ' toto  ' , b: 'text  ' }
		) ;
		doormen.equals( patch , { a: 'toto' , b: 'text' } ) ;

		patch = {} ;
		doormen(
			{ patch: patch } ,
			{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
			{ a: 'toto' , b: 'text  ' }
		) ;
		doormen.equals( patch , { b: 'text' } ) ;

		patch = {} ;
		doormen(
			{ patch: patch } ,
			{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
			{ a: 'toto' , b: 'text' }
		) ;
		doormen.equals( patch , {} ) ;

		schema = {
			properties: {
				a: { sanitize: 'trim' } ,
				sub: {
					properties: {
						b: { sanitize: 'trim' } ,
						sub: {
							properties: {
								c: { sanitize: 'trim' }
							}
						}
					}
				}
			}
		} ;

		patch = {} ;
		doormen(
			{ patch: patch } ,
			schema ,
			{ a: ' toto  ' , sub: { b: 'text  ' , sub: { c: ' weee! ' } } }
		) ;
		doormen.equals( patch , { "a": "toto" , "sub.b": "text" , "sub.sub.c": "weee!" } ) ;

		patch = {} ;
		doormen(
			{ patch: patch } ,
			schema ,
			{ a: 'toto' , sub: { b: 'text  ' , sub: { c: 'weee!' } } }
		) ;
		doormen.equals( patch , { "sub.b": "text" } ) ;

		patch = {} ;
		doormen(
			{ patch: patch } ,
			schema ,
			{ a: ' toto  ' , sub: { b: 'text' , sub: { c: ' weee! ' } } }
		) ;
		doormen.equals( patch , { "a": "toto" , "sub.sub.c": "weee!" } ) ;
	} ) ;
} ) ;



describe( "Merging patch" , () => {

	it( "should merge patch, the second overriding the first, and removing overlap" , () => {
		var patch1 = {
			sub: {
				a: "bob" ,
				b: "bill"
			}
        } ;
        
        var patch2 = { "sub.a": "toto" , c: "jack" } ;

		doormen.mergePatch( patch1 , patch2 ) ;
		doormen.equals( patch1 , { sub: { a: "toto" , b: "bill" } , c: "jack" } ) ;

        
        patch1 = { "sub.a": "toto" } ;

		patch2 = {
			sub: {
				a: "bob" ,
				b: "bill"
			}
        } ;
        
		doormen.mergePatch( patch1 , patch2 ) ;
		doormen.equals( patch1 , { sub: { a: "bob" , b: "bill" } } ) ;
	} ) ;
} ) ;



describe( "Full report mode" , () => {

	it( "should return an object with all contained data weither it validates or not, the sanitized data, and an array of errors" , () => {

		var report , schema ;
		schema = {
			of: { type: 'string' , sanitize: 'trim' }
		} ;

		report = doormen.report( schema , { a: 'abc' , b: '  def  ' } ) ;
		//console.log( report ) ;
		doormen.equals( report.validate , true ) ;
		doormen.equals( report.sanitized , { a: 'abc' , b: 'def' } ) ;
		doormen.equals( report.errors.length , 0 ) ;

		report = doormen.report( schema , { a: true , b: 3 } ) ;
		//console.log( report ) ;
		doormen.equals( report.validate , false ) ;
		doormen.equals( report.sanitized , { a: true , b: 3 } ) ;
		doormen.equals( report.errors.length , 2 ) ;

		schema = {
			properties: {
				a: { type: 'string' , sanitize: 'trim' } ,
				b: { type: 'string' , sanitize: 'trim' } ,
				c: { of: { type: 'string' , sanitize: 'trim' } }
			}
		} ;

		report = doormen.report( schema , { a: '  abc  ' , b: 3 , c: { d: true , e: 'def  ' } } ) ;
		//console.log( report ) ;
		doormen.equals( report.validate , false ) ;
		doormen.equals( report.sanitized , { a: 'abc' , b: 3 , c: { d: true , e: 'def' } } ) ;
		doormen.equals( report.errors.length , 2 ) ;
	} ) ;

	it( "Check error messages" ) ;
} ) ;



describe( "Patch validation" , () => {

	it( "should validate a patch" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				a: { type: 'string' , sanitize: 'toString' } ,
				b: { type: 'string' } ,
				c: { type: 'string' }
			}
		} ;

		doormen( schema , { a: 'one' , b: 'two' , c: 'three' } ) ;
		doormen.equals( doormen( schema , { a: 1 , b: 'two' , c: 'three' } ) , { a: '1' , b: 'two' , c: 'three' } ) ;
		doormen.not( schema , { a: 'one' , b: 'two' } ) ;

		doormen.patch( schema , {} ) ;
		doormen.patch( schema , { a: 'one' , b: 'two' , c: 'three' } ) ;
		doormen.equals( doormen.patch( schema , { a: 1 , b: 'two' , c: 'three' } ) , { a: '1' , b: 'two' , c: 'three' } ) ;
		doormen.patch( schema , { a: 'one' , b: 'two' } ) ;
		doormen.equals( doormen.patch( schema , { a: 1 , b: 'two' } ) , { a: '1' , b: 'two' } ) ;
	} ) ;

	it( "should validate a patch of an array" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				array: {
					type: 'array' , of: {
						type: 'string' ,
						sanitize: 'toString'
					}
				}
			}
		} ;

		doormen( schema , { array: [ 'one' , 'two' , 'three' ] } ) ;
		doormen.equals( doormen( schema , { array: [ 1 , 'two' , 'three' ] } ) , { array: [ '1' , 'two' , 'three' ] } ) ;

		doormen.patch( schema , {} ) ;
		doormen.patch( schema , { array: [ 1 , 'two' , 'three' ] } ) ;
		doormen.equals( doormen.patch( schema , { array: [ 1 , 'two' , 'three' ] } ) , { array: [ '1' , 'two' , 'three' ] } ) ;

		doormen.equals( doormen.patch( schema , { 'array.1': 'two' } ) , { 'array.1': 'two' } ) ;
		doormen.equals( doormen.patch( schema , { 'array.1': 2 } ) , { 'array.1': '2' } ) ;
	} ) ;

	it( "forbidden path in a patch should throw" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				a: { type: 'string' , sanitize: 'toString' } ,
				b: { type: 'string' } ,
				c: { type: 'string' }
			}
		} ;

		doormen.patch.not( schema , { d: 'four' } ) ;
		doormen.patch.not( schema , { c: 'three' , d: 'four' } ) ;

		// Now allow extra properties, it should be ok
		schema.extraProperties = true ;

		doormen.equals( doormen.patch( schema , { d: 'four' } ) , { d: 'four' } ) ;
		doormen.equals( doormen.patch( schema , { c: 'three' , d: 'four' } ) , { c: 'three' , d: 'four' } ) ;

		// Now allow any properties, it should still be ok
		schema = {
			type: 'strictObject' ,
			of: { type: 'string' , sanitize: 'toString' }
		} ;

		doormen.equals( doormen.patch( schema , { d: 'four' } ) , { d: 'four' } ) ;
		doormen.equals( doormen.patch( schema , { c: 'three' , d: 'four' } ) , { c: 'three' , d: 'four' } ) ;
	} ) ;

	it( "opaque object: forbidden path in a patch should throw" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				a: {
					type: 'strictObject',
					of: { type: 'string' }
				} ,
				b: {
					type: 'strictObject' ,
					of: { type: 'string' } ,
					opaque: true
				}
			}
		} ;

		doormen.patch( schema , { "a.a": 'val' } ) ;
		doormen.patch.not( schema , { "b.a": 'val' } ) ;
	} ) ;

	it( "non-object patch should not validate" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				a: { type: 'string' , sanitize: 'toString' } ,
				b: { type: 'string' } ,
				c: { type: 'string' }
			}
		} ;

		doormen.patch.not( schema , null ) ;
		doormen.patch.not( schema , false ) ;
		doormen.patch.not( schema , 'mldjsr' ) ;
		doormen.patch.not( schema , 8 ) ;
	} ) ;

	it( "should validate a patch with deep path" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				a: { type: 'string' , sanitize: 'toString' } ,
				sub: {
					type: 'strictObject' ,
					properties: {
						b: { type: 'string' } ,
						c: { type: 'string' }
					}
				}
			}
		} ;

		doormen( schema , { a: "one" , sub: { b: "two" , c: "three" } } ) ;
		doormen.equals( doormen( schema , { a: 1 , sub: { b: "two" , c: "three" } } ) , { a: "1" , sub: { b: "two" , c: "three" } } ) ;
		doormen.not( schema , { a: "one" , sub: { b: "two" } } ) ;

		doormen.patch( schema , {} ) ;
		doormen.patch( schema , { a: "one" , sub: { b: "two" , c: "three" } } ) ;
		doormen.equals( doormen.patch( schema , { a: 1 , sub: { b: "two" , c: "three" } } ) , { a: "1" , sub: { b: "two" , c: "three" } } ) ;

		// Shall not pass! This patch means: replace "sub" by { b: "two" }, thus sub.c is missing
		doormen.patch.not( schema , { a: "one" , sub: { b: "two" } } ) ;

		// Pass: only replace sub.b, but keep existing value for sub.c
		doormen.patch( schema , { a: "one" , "sub.b": "two" } ) ;
		doormen.equals( doormen.patch( schema , { a: 1 , "sub.b": "two" } ) , { a: "1" , "sub.b": "two" } ) ;

		doormen.patch.not( schema , { a: "one" , "sub.d": "four" } ) ;

		// Now allow extra-properties
		schema.properties.sub.extraProperties = true ;
		doormen.patch( schema , { a: "one" , "sub.d": "four" } ) ;
		doormen.equals( doormen.patch( schema , { a: 1 , "sub.d": "four" } ) , { a: "1" , "sub.d": "four" } ) ;
	} ) ;

	it( "should validate a patch with commands" , () => {
		var schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				object: {
					type: 'object' , of: {
						type: 'string' ,
						sanitize: 'toString'
					}
				} ,
				array: {
					type: 'array' , of: {
						type: 'string' ,
						sanitize: 'toString'
					}
				}
			}
		} ;

		doormen.patch( schema , { array: { $push: 1 } } ) ;
		doormen.equals( doormen.patch( schema , { array: { $push: 1 } } ) , { array: { $push: '1' } } ) ;

		doormen.patch( schema , { 'array.0': { $set: 1 } } ) ;
		doormen.equals( doormen.patch( schema , { 'array.0': { $set: 1 } } ) , { 'array.0': { $set: '1' } } ) ;

		doormen.patch( schema , { 'object.a': { $unset: true } } ) ;
		doormen.equals( doormen.patch( schema , { 'object.a': { $unset: true } } ) , { 'object.a': { $unset: true } } ) ;
		doormen.equals( doormen.patch( schema , { 'object.a': { $unset: null } } ) , { 'object.a': { $unset: true } } ) ;
	} ) ;

	it( "immutable properties should throw when they would be patched" , () => {
		var data , schema ;

		schema = {
			type: 'strictObject' ,
			properties: {
				a: { type: 'string' } ,
				b: { type: 'string' , optional: true , immutable: true }
			}
		} ;

		data = { a: 'one' , b: 'two' } ;
        doormen.patch( null , schema , { a: 'one1' } , data ) ;
		doormen.patch.not( null , schema , { a: '1' , b: '2' } , data ) ;
		doormen.patch.not( null , schema , { a: '1' , b: { $delete: true } } , data ) ;

		data = { a: 'one' } ;
        doormen.patch( null , schema , { a: 'one1' } , data ) ;
		doormen.patch( null , schema , { a: '1' , b: '2' } , data ) ;
		doormen.patch( null , schema , { a: '1' , b: { $delete: true } } , data ) ;
	} ) ;

	it( "test doormen.reportPatch()" ) ;
	it( "test doormen.exportPatch()" ) ;
} ) ;



describe( "Patch application" , () => {

	it( "should apply a simple patch" , () => {
		var data , patch ;
		
		data = {
			object: {
				a: 'one' ,
				b: 'two'
			} ,
			array: [ 'three' , 'four' , 'five' ]
		} ;
		
		patch = {
			'object.a' : 1 ,
			'array.1': 4
		}
		
		expect( doormen.applyPatch( data , patch ) ).to.equal( {
			object: {
				a: 1 ,
				b: 'two'
			} ,
			array: [ 'three' , 4 , 'five' ]
		} ) ;

		patch = {
			'object.c' : 3 ,
			'array.3': 6
		}
		
		expect( doormen.applyPatch( data , patch ) ).to.equal( {
			object: {
				a: 1 ,
				b: 'two' ,
				c: 3
			} ,
			array: [ 'three' , 4 , 'five' , 6 ]
		} ) ;
	} ) ;

	it( "advanced patch command: set a property with '$set'" , () => {
		var data , patch ;
		
		data = {
			object: {
				a: 'one' ,
				b: 'two'
			} ,
			array: [ 'three' , 'four' , 'five' ]
		} ;
		
		patch = {
			'object.a' : { $set: 1 } ,
			'array.1': { $set: 4 }
		}
		
		expect( doormen.applyPatch( data , patch ) ).to.equal( {
			object: {
				a: 1 ,
				b: 'two'
			} ,
			array: [ 'three' , 4 , 'five' ]
		} ) ;
	} ) ;

	it( "advanced patch command: delete properties with '$delete' and the '$unset' alias" , () => {
		var data , patch ;
		
		data = {
			object: {
				a: 'one' ,
				b: 'two'
			} ,
			array: [ 'three' , 'four' , 'five' ]
		} ;
		
		patch = {
			'object.a' : { $delete: true } ,
			'array.1': { $unset: null }
		}
		
		expect( doormen.applyPatch( data , patch ) ).to.equal( {
			object: { b: 'two' } ,
			array: [ 'three' , undefined , 'five' ]
		} ) ;
	} ) ;

	it( "advanced patch command: $push" , () => {
		var data , patch ;
		
		data = {
			object: {
				a: 'one' ,
				b: 'two'
			} ,
			array: [ 'three' , 'four' , 'five' ]
		} ;
		
		patch = {
			'array': { $push: 'six' }
		}
		
		expect( doormen.applyPatch( data , patch ) ).to.equal( {
			object: { a: 'one' , b: 'two' } ,
			array: [ 'three' , 'four' , 'five' , 'six' ]
		} ) ;
	} ) ;

	it( "unknown commands should throw" , () => {
		var data , patch ;
		
		data = {
			object: { a: 'one' , b: 'two' }
		} ;
		
		patch = { 'object.a': { $unknown: true } }
		
		expect( () => doormen.applyPatch( data , patch ) ).to.throw() ;
	} ) ;
} ) ;



describe( "'keys' attribute" , () => {

	it( "'keys' should perform the check recursively for key itself, using the same given schema for all of them." , () => {

		var schema = {
			keys: { match: /^[a-z]+$/ }
		} ;

		// Object
		doormen( schema , { a: 'text' } ) ;
		doormen.not( schema , { a2: 1 } ) ;
		doormen( schema , { a: 'text' , b: 'string' } ) ;
		doormen.not( schema , { a: 'text' , b2: 'string' } ) ;
	} ) ;

	it( "'keys' and sanitizer." , () => {

		var schema = {
			keys: { sanitize: 'dashToCamelCase' }
		} ;

		doormen.equals(
			doormen( schema , { "camel-case": "?" , "or-not-camel-case": "?" } ) ,
			{ camelCase: "?" , orNotCamelCase: "?" }
		) ;
	} ) ;

	it( "'keys' should throw in case of overwrite." , () => {

		var schema = {
			keys: { sanitize: 'dashToCamelCase' }
		} ;

		doormen.not( schema , { camelCase: "!" , "camel-case": "?" } ) ;
	} ) ;
} ) ;



describe( "Alternatives" , () => {

	it( "Basic schema alternatives" , () => {
		doormen( [ { type: 'boolean' } , { type: 'number' } ] , true ) ;
		doormen( [ { type: 'boolean' } , { type: 'number' } ] , 5 ) ;
		doormen.not( [ { type: 'boolean' } , { type: 'number' } ] , 'toto' ) ;
	} ) ;

	it( "Schema alternatives 'export' tests" ) ;
	it( "Schema alternatives needs more tests" ) ;
} ) ;



describe( "Complex multiple-children constraints" , () => {

	it( "Constraint 'condition' and 'if-then' syntax" , () => {
		var schema = {
			extraProperties: true ,
			properties: {
				type: { type: 'string' } ,
				c: { type: 'string' }
			} ,
			constraints: [
				{
					enforce: 'condition' ,
					if: {
						extraProperties: true ,
						properties: {
							type: { eq: 'alt1' }
						}
					} ,
					then: {
						extraProperties: true ,
						properties: {
							a: { type: 'string' }
						}
					}
				}
			]
		} ;

		doormen.not( schema , { type: 'std' , a: 'bob' } ) ;
		doormen( schema , { type: 'std' , a: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'std' , b: 'bob' } ) ;
		doormen( schema , { type: 'std' , b: 'bob' , c: 'jack' } ) ;

		doormen.not( schema , { type: 'alt1' , a: 'bob' } ) ;
		doormen( schema , { type: 'alt1' , a: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'alt1' , b: 'bob' } ) ;
		doormen.not( schema , { type: 'alt1' , b: 'bob' , c: 'jack' } ) ;
	} ) ;
	
	it( "Constraint 'condition' and as a replacement of the older 'when' syntax" , () => {
		var schema = {
			extraProperties: true ,
			properties: {
				type: { type: 'string' } ,
				a: { type: 'string' }
			} ,
			constraints: [
				{
					enforce: 'condition' ,
					source: 'type' ,
					if: { eq: 'alt' } ,
					target: 'b' ,
					then: { value: 'bobby' } ,
					resolve: true
				}
			]
		} ;

		expect( doormen( schema , { type: 'std' , a: 'bob' } ) ).to.equal( { type: 'std' , a: 'bob' } ) ;
		expect( doormen( schema , { type: 'alt' , a: 'bob' } ) ).to.equal( { type: 'alt' , a: 'bob' , b: 'bobby' } ) ;
		expect( doormen( schema , { type: 'alt' , a: 'bob' , b: 'jack' } ) ).to.equal( { type: 'alt' , a: 'bob' , b: 'bobby' } ) ;
		expect( doormen( schema , { type: 'alt' , a: 'bob' , b: {} } ) ).to.equal( { type: 'alt' , a: 'bob' , b: 'bobby' } ) ;
	} ) ;
	
	it( "Constraint 'switch' and 'switch-case-otherCases' syntax" , () => {
		var schema = {
			extraProperties: true ,
			properties: {
				type: { type: 'string' } ,
				c: { type: 'string' }
			} ,
			constraints: [
				{
					enforce: 'switch' ,
					source: 'type' ,
					case: {
						alt1: {
							extraProperties: true ,
							properties: {
								a: { type: 'string' }
							}
						} ,
						alt2: {
							extraProperties: true ,
							properties: {
								b: { type: 'string' }
							}
						}
					}
				}
			]
		} ;

		doormen.not( schema , { type: 'std' , a: 'bob' } ) ;
		doormen( schema , { type: 'std' , a: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'std' , b: 'bob' } ) ;
		doormen( schema , { type: 'std' , b: 'bob' , c: 'jack' } ) ;

		doormen.not( schema , { type: 'alt1' , a: 'bob' } ) ;
		doormen( schema , { type: 'alt1' , a: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'alt1' , b: 'bob' } ) ;
		doormen.not( schema , { type: 'alt1' , b: 'bob' , c: 'jack' } ) ;

		doormen.not( schema , { type: 'alt2' , b: 'bob' } ) ;
		doormen( schema , { type: 'alt2' , b: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'alt2' , a: 'bob' } ) ;
		doormen.not( schema , { type: 'alt2' , a: 'bob' , c: 'jack' } ) ;

		// Add a default to the switch-case
		schema.constraints[0].otherCases = {
			extraProperties: true ,
			properties: {
				d: { type: 'string' }
			}
		} ;

		doormen.not( schema , { type: 'std' , a: 'bob' } ) ;
		doormen.not( schema , { type: 'std' , a: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'std' , b: 'bob' } ) ;
		doormen.not( schema , { type: 'std' , b: 'bob' , c: 'jack' } ) ;
		doormen( schema , { type: 'std' , c: 'jack' , d: 'jim' } ) ;

		doormen.not( schema , { type: 'alt1' , a: 'bob' } ) ;
		doormen( schema , { type: 'alt1' , a: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'alt1' , b: 'bob' } ) ;
		doormen.not( schema , { type: 'alt1' , b: 'bob' , c: 'jack' } ) ;

		doormen.not( schema , { type: 'alt2' , b: 'bob' } ) ;
		doormen( schema , { type: 'alt2' , b: 'bob' , c: 'jack' } ) ;
		doormen.not( schema , { type: 'alt2' , a: 'bob' } ) ;
		doormen.not( schema , { type: 'alt2' , a: 'bob' , c: 'jack' } ) ;
	} ) ;
	
	it( "Constraint 'unique' syntax" , () => {
		var schema , o1 , o2 , o3 , o4 , a , result ;

		// Without path nor convert
		schema = {
			type: 'array' ,
			of: {
				type: 'string'
			} ,
			constraints: [
				{ enforce: 'unique' }
			]
		} ;

		doormen( schema , [ 'bob' , 'bill' , 'jack' ] ) ;
		doormen.not( schema , [ 'bob' , 'bill' , 'bob' ] ) ;
		
		// Turn fixing on
		schema.constraints[0].resolve = true ;

		result = doormen( schema , [ 'bob' , 'bill' , 'bob' , 'jack' , 'jim' , 'jack' , 'joe' ] ) ;
		expect( result ).to.be.like( [ 'bob' , 'bill' , 'jack' , 'jim' , 'joe' ] ) ;
		
		
		// With path and convert
		schema = {
			type: 'array' ,
			of: {
				type: 'strictObject' ,
			} ,
			constraints: [
				{
					enforce: 'unique' ,
					path: 'id' ,
					convert: 'toString'
				}
			]
		} ;
		
		doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: 'id1' , a: 'jack' } ] ) ;
		doormen.not( schema , [ { id: '1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: 1 , a: 'jack' } ] ) ;
		
		// Turn fixing on
		schema.constraints[0].resolve = true ;
		
		o1 = { id: '1' , a: 'bob' } ,
		o2 = { id: 'id2' , a: 'bill' } ,
		o3 = { id: 1 , a: 'jack' } ,
		o4 = { id: 3 , a: 'jim' } ,
		a = [ o1 , o2 , o3 , o4 ] ,
		
		result = doormen( schema , a ) ;
		expect( result ).to.be.like( [ o1 , o2 , o4 ] ) ;
		expect( result ).not.to.be( a ) ;
		expect( result[ 0 ] ).to.be( o1 ) ;
		expect( result[ 1 ] ).to.be( o2 ) ;
		expect( result[ 2 ] ).to.be( o4 ) ;
	} ) ;
	
	it( "Constraint 'unique' with 'noNull' or 'noEmpty' option syntax" , () => {
		var schema , o1 , o2 , o3 , o4 , a , result ;

		schema = {
			type: 'array' ,
			constraints: [
				{
					enforce: 'unique' ,
					path: 'id' ,
					convert: 'toString' ,
				}
			]
		} ;
		
		doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: 'id3' , a: 'bob' } ] ) ;
		doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: '' , a: 'tony' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: null , a: 'jimmy' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: null , a: 'jimmy' } , { id: '' , a: 'tony' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , {} , { id: null } , { id: 'id3' , a: 'bob' } ] ) ;
		
		// Turn noNull on
		schema.constraints[0].noNull = true ;
		schema.constraints[0].noEmpty = false ;
		
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: 'id3' , a: 'bob' } ] ) ;
		doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: '' , a: 'tony' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: null , a: 'jimmy' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: null , a: 'jimmy' } , { id: '' , a: 'tony' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , {} , { id: null } , { id: 'id3' , a: 'bob' } ] ) ;

		// Turn noEmpty on
		schema.constraints[0].noNull = false ;
		schema.constraints[0].noEmpty = true ;
		
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: '' , a: 'tony' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: null , a: 'jimmy' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , { id: null , a: 'jimmy' } , { id: '' , a: 'tony' } , { id: 'id3' , a: 'bob' } ] ) ;
		doormen.not( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , {} , { id: null } , { id: 'id3' , a: 'bob' } ] ) ;
		
		// Turn fixing on
		schema.constraints[0].resolve = true ;
		schema.constraints[0].noEmpty = true ;
		expect( doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , {} , { id: null , a: 'jimmy' } , { id: 'id3' , a: 'bob' } ] ) ).to.equal(  [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: 'id3' , a: 'bob' } ] ) ;
		expect( doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , {} , { id: null , a: 'jimmy' } , { id: '' , a: 'tony' } , { id: 'id3' , a: 'bob' } ] ) ).to.equal(  [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , { id: 'id3' , a: 'bob' } ] ) ;
		expect( doormen( schema , [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } , null , {} , { id: null , a: 'jimmy' } , { id: 'id1' , a: 'bob' } ] ) ).to.equal(  [ { id: 'id1' , a: 'bob' } , { id: 'id2' , a: 'bill' } ] ) ;
	} ) ;
	
	it( "Constraint 'compound' syntax" , () => {
		var schema , o1 , o2 , o3 , o4 , a , result ;
		// Without path nor convert
		
		schema = {
			type: 'strictObject' ,
			properties: {
				firstName: { type: 'string' } ,
				lastName: { type: 'string' } ,
				domain: { type: 'string' } ,
				login: { type: 'string' , optional: true }
			} ,
			constraints: [
				{
					enforce: 'compound' ,
					sources: [ 'firstName' , 'lastName' , 'domain' ] ,
					target: 'login' ,
					format: '%s.%s@%s'
				}
			]
		} ;

		doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
		doormen.not( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		doormen.not( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'noone@nowhere.com' } ) ;
		doormen.not( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: '' } ) ;
		
		// Turn ifEmpty on
		schema.constraints[0].ifEmpty = true ;
		doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
		doormen.not( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'noone@nowhere.com' } ) ;
		doormen.not( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: '' } ) ;
		
		// Turn fixing on, ifEmpty off
		schema.constraints[0].resolve = true ;
		schema.constraints[0].ifEmpty = false ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'noone@nowhere.com' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: '' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;

		// Turn ifEmpty on
		schema.constraints[0].ifEmpty = true ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'noone@nowhere.com' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'noone@nowhere.com' } ) ;
		expect( doormen( schema , { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: '' } ) ).to.equal( { firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' , login: 'joe.doe@gmail.com' } ) ;
	} ) ;
	
	it( "Constraint 'extraction' syntax" , () => {
		var schema , o1 , o2 , o3 , o4 , a , result ;
		// Without path nor convert
		
		schema = {
			type: 'strictObject' ,
			properties: {
				login: { type: 'string' } ,
				firstName: { type: 'string' , optional: true } ,
				lastName: { type: 'string' , optional: true } ,
				domain: { type: 'string' , optional: true }
			} ,
			constraints: [
				{
					enforce: 'extraction' ,
					source: 'login' ,
					targets: [ 'firstName' , 'lastName' , 'domain' ] ,
					match: /^([^.]+)\.([^@]+)@(.+)$/
				}
			]
		} ;

		doormen( schema , { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		doormen.not( schema , { login: 'joe.doe@gmail.com' , firstName: 'jack' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		doormen.not( schema , { login: 'joe.doe@gmail.com' , firstName: '' , domain: 'gmail.com' } ) ;
		
		// Turn ifEmpty on
		schema.constraints[0].ifEmpty = true ;
		doormen( schema , { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		doormen( schema , { login: 'joe.doe@gmail.com' , firstName: 'jack' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		doormen.not( schema , { login: 'joe.doe@gmail.com' , firstName: '' , domain: 'gmail.com' } ) ;

		// Turn fixing on, ifEmpty off
		schema.constraints[0].resolve = true ;
		schema.constraints[0].ifEmpty = false ;
		expect( doormen( schema , { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ).to.equal( { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		expect( doormen( schema , { login: 'joe.doe@gmail.com' , firstName: 'jack' , lastName: 'doe' , domain: 'gmail.com' } ) ).to.equal( { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		expect( doormen( schema , { login: 'joe.doe@gmail.com' , firstName: '' , domain: 'gmail.com' } ) ).to.equal( { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;

		// Turn ifEmpty on
		schema.constraints[0].ifEmpty = true ;
		expect( doormen( schema , { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ).to.equal( { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		expect( doormen( schema , { login: 'joe.doe@gmail.com' , firstName: 'jack' , lastName: 'doe' , domain: 'gmail.com' } ) ).to.equal( { login: 'joe.doe@gmail.com' , firstName: 'jack' , lastName: 'doe' , domain: 'gmail.com' } ) ;
		expect( doormen( schema , { login: 'joe.doe@gmail.com' , firstName: '' , domain: 'gmail.com' } ) ).to.equal( { login: 'joe.doe@gmail.com' , firstName: 'joe' , lastName: 'doe' , domain: 'gmail.com' } ) ;
	} ) ;

	it( "doormen.checkConstraints() should only perform constraints validation/sanitization" , () => {
		var schema , o1 , o2 , o3 , o4 , a , result ;
		// Without path nor convert
		
		schema = {
			type: 'array' ,
			constraints: [
				{ enforce: 'unique' }
			] ,
			of: {
				sanitize: 'toString'
			}
		} ;

		doormen.checkConstraints( schema , [ 'bob' , 'bill' , 'jack' ] ) ;
		doormen.checkConstraints.not( schema , [ 'bob' , 'bill' , 'bob' ] ) ;
		
		// Turn fixing on
		schema.constraints[0].resolve = true ;

		result = doormen( schema , [ 'bob' , 'bill' , 1 , 2 , 3 , 'bob' , 'jack' , 'jim' , 'jack' , 'joe' ] ) ;
		expect( result ).to.be.like( [ 'bob' , 'bill' , '1' , '2' , '3' , 'jack' , 'jim' , 'joe' ] ) ;

		result = doormen.checkConstraints( schema , [ 'bob' , 'bill' , 1 , 2 , 3 , 'bob' , 'jack' , 'jim' , 'jack' , 'joe' ] ) ;
		expect( result ).to.be.like( [ 'bob' , 'bill' , 1 , 2 , 3 , 'jack' , 'jim' , 'joe' ] ) ;
	} ) ;
} ) ;



describe( "Schema validation" , () => {

	it( "Validate a schema" , () => {
		var schema ;

		schema = { properties: { a: { optional: true , type: 'string' } } } ;
		doormen.validateSchema( schema ) ;
		doormen( { type: "schema" } , schema ) ;

		schema = { type: true } ;
		doormen.shouldThrow( () => { doormen.validateSchema( schema ) ; } ) ;
		doormen.not( { type: "schema" } , schema ) ;
	} ) ;
} ) ;



describe( "Purify" , () => {

	it( "Purify a basic schema" , () => {
		doormen.equals( doormen.purifySchema( { type: 'string' } ) , { type: 'string' } ) ;
		doormen.equals( doormen.purifySchema( { type: 'string' , random: 'stuff' } ) , { type: 'string' } ) ;
		doormen.equals( 'default' in doormen.purifySchema( { default: null } ) , true ) ;
		doormen.equals( 'default' in doormen.purifySchema( { default: undefined } ) , true ) ;

		doormen.equals(
			doormen.purifySchema( {
				extraProperties: true ,
				properties: {
					a: { optional: true , type: 'object' , of: { type: 'string' } } ,
					b: { type: 'array' ,
						sanitize: 'toArray' ,
						of: {
							type: 'integer' , min: 4 , max: 7 , random: 'stuff'
						} } ,
					c: { default: 'default' , type: 'string' } ,
					d: { filter: { blah: 'blih' } } ,
					e: { properties: [ 'one' , 'two' , 'three' ] } ,
					f: { random: 'stuff' , type: 'integer' , sanitize: [ 'some' , 'sanitizers' ] } ,
					g: { in: [ { some: 'data' } , { some: 'other data' } ] } ,
					h: { notIn: [ { some: 'data' } , { some: 'other data' } ] } ,
					i: {
						match: /a regexp/ , minLength: 4 , maxLength: 11 , length: 6
					} ,
					j: { match: "a regexp compatible string" } ,
					k: { instanceOf: 'Date' } ,
					l: { instanceOf: Date } ,
					m: { of: [ { type: 'array' } , { type: 'string' } ] } ,
					n: { properties: { a: [ { type: 'array' } , { type: 'string' } ] } } ,
					o: { elements: [ { type: 'array' } , { type: 'string' } ] } ,
					p: { elements: [ [ { type: 'array' } , { type: 'string' } ] ] } ,
				}
			} ) ,
			{
				extraProperties: true ,
				properties: {
					a: { optional: true , type: 'object' , of: { type: 'string' } } ,
					b: { type: 'array' , sanitize: [ 'toArray' ] , of: { type: 'integer' , min: 4 , max: 7 } } ,
					c: { default: 'default' , type: 'string' } ,
					d: { filter: { blah: 'blih' } } ,
					e: { properties: [ 'one' , 'two' , 'three' ] } ,
					f: { type: 'integer' , sanitize: [ 'some' , 'sanitizers' ] } ,
					g: { in: [ { some: 'data' } , { some: 'other data' } ] } ,
					h: { notIn: [ { some: 'data' } , { some: 'other data' } ] } ,
					i: {
						match: /a regexp/ , minLength: 4 , maxLength: 11 , length: 6
					} ,
					j: { match: "a regexp compatible string" } ,
					k: { instanceOf: 'Date' } ,
					l: { instanceOf: Date } ,
					m: { of: [ { type: 'array' } , { type: 'string' } ] } ,
					n: { properties: { a: [ { type: 'array' } , { type: 'string' } ] } } ,
					o: { elements: [ { type: 'array' } , { type: 'string' } ] } ,
					p: { elements: [ [ { type: 'array' } , { type: 'string' } ] ] } ,
				}
			}
		) ;
	} ) ;

	it( "Purify needs more tests (alternatives, etc)" ) ;
} ) ;



describe( "Export mode" , () => {

	it( ".export() and 'of'" , () => {
		var data , schema , returned ;

		schema = {
			of: { type: 'string' , sanitize: 'trim' }
		} ;

		data = { a: 'abc' , b: '  def  ' } ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , { a: 'abc' , b: '  def  ' } ) ;
		doormen.equals( returned , { a: 'abc' , b: 'def' } ) ;

		returned = doormen( schema , data ) ;
		doormen.equals( data , { a: 'abc' , b: 'def' } ) ;
		doormen.equals( returned , { a: 'abc' , b: 'def' } ) ;
	} ) ;

	it( ".export() and 'properties'" , () => {
		var data , schema , returned ;

		schema = {
			properties: {
				a: { type: 'string' , sanitize: 'toUpperCase' } ,
				b: { type: 'string' , sanitize: 'trim' }
			}
		} ;

		data = { a: 'abc' , b: '  def  ' } ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , { a: 'abc' , b: '  def  ' } ) ;
		doormen.equals( returned , { a: 'ABC' , b: 'def' } ) ;

		returned = doormen( schema , data ) ;
		doormen.equals( data , { a: 'ABC' , b: 'def' } ) ;
		doormen.equals( returned , { a: 'ABC' , b: 'def' } ) ;

		data = { a: 'abc' , b: '  def  ' , c: 'toto' } ;
		doormen.shouldThrow( () => {
			returned = doormen.export( schema , data ) ;
		} ) ;

		schema.extraProperties = true ;
		data = { a: 'abc' , b: '  def  ' , c: 'toto' } ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , { a: 'abc' , b: '  def  ' , c: 'toto' } ) ;
		doormen.equals( returned , { a: 'ABC' , b: 'def' } ) ;

		returned = doormen( schema , data ) ;
		doormen.equals( data , { a: 'ABC' , b: 'def' , c: 'toto' } ) ;
		doormen.equals( returned , { a: 'ABC' , b: 'def' , c: 'toto' } ) ;
	} ) ;

	it( ".export() and 'elements'" , () => {
		var data , schema , returned ;

		schema = {
			elements: [
				{ type: 'string' , sanitize: 'toUpperCase' } ,
				{ type: 'string' , sanitize: 'trim' }
			]
		} ;

		data = [ 'abc' , '  def  ' ] ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , [ 'abc' , '  def  ' ] ) ;
		doormen.equals( returned , [ 'ABC' , 'def' ] ) ;

		returned = doormen( schema , data ) ;
		doormen.equals( data , [ 'ABC' , 'def' ] ) ;
		doormen.equals( returned , [ 'ABC' , 'def' ] ) ;

		data = [ 'abc' , '  def  ' , 'toto' ] ;
		doormen.shouldThrow( () => {
			returned = doormen.export( schema , data ) ;
		} ) ;

		schema.extraElements = true ;
		data = [ 'abc' , '  def  ' , 'toto' ] ;
		returned = doormen.export( schema , data ) ;
		doormen.equals( data , [ 'abc' , '  def  ' , 'toto' ] ) ;
		doormen.equals( returned , [ 'ABC' , 'def' ] ) ;

		returned = doormen( schema , data ) ;
		doormen.equals( data , [ 'ABC' , 'def' , 'toto' ] ) ;
		doormen.equals( returned , [ 'ABC' , 'def' , 'toto' ] ) ;
	} ) ;
} ) ;



describe( "Expect BDD assertion library" , () => {

	function resolveTimeout( value ) {
		return new Promise( resolve => {
			setTimeout( () => resolve( value ) , 20 ) ;
		} ) ;
	}

	function rejectTimeout( error ) {
		return new Promise( ( resolve , reject ) => {
			setTimeout( () => reject( error ) , 20 ) ;
		} ) ;
	}

	it( "expect a value to be defined/undefined" , () => {
		doormen.expect( "bob" ).to.be.defined() ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).not.to.be.defined() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.undefined() ) ;
		doormen.expect( null ).to.be.defined() ;
		doormen.shouldThrowAssertion( () => doormen.expect( null ).not.to.be.defined() ) ;
		doormen.expect( undefined ).to.be.undefined() ;
		doormen.expect( '' ).to.be.defined() ;
		doormen.expect( false ).to.be.defined() ;
		doormen.shouldThrowAssertion( () => doormen.expect( false ).to.be.undefined() ) ;
	} ) ;

	it( "expect a value to be truthy/falsy" , () => {
		doormen.expect( "bob" ).to.be.ok() ;
		doormen.expect( "" ).not.to.be.ok() ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).not.to.be.ok() ) ;
		doormen.expect( false ).not.to.be.ok() ;
		doormen.expect( 0 ).to.be.falsy() ;
		doormen.expect( null ).to.be.not.ok() ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be.falsy() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [] ).not.to.be.truthy() ) ;
		doormen.expect( {} ).to.be.truthy() ;
		doormen.expect( [] ).to.be.truthy() ;
	} ) ;

	it( "expect a value to be true/not true/false/not false" , () => {
		doormen.expect( "bob" ).not.to.be.true() ;
		doormen.expect( "bob" ).not.to.be.false() ;
		doormen.expect( "" ).not.to.be.true() ;
		doormen.expect( "" ).not.to.be.false() ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.true() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be.true() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be.false() ) ;
		doormen.expect( true ).to.be.true() ;
		doormen.expect( true ).not.to.be.false() ;
		doormen.expect( false ).not.to.be.true() ;
		doormen.expect( false ).to.be.false() ;
	} ) ;

	it( "expect a value to be null/not null" , () => {
		doormen.expect( "bob" ).to.be.not.null() ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.null() ) ;
		doormen.expect( undefined ).not.to.be.null() ;
		doormen.shouldThrowAssertion( () => doormen.expect( undefined ).to.be.null() ) ;
		doormen.expect( null ).to.be.null() ;
		doormen.shouldThrowAssertion( () => doormen.expect( null ).not.to.be.null() ) ;
		doormen.expect( '' ).not.to.be.null() ;
		doormen.expect( {} ).not.to.be.null() ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be.null() ) ;
	} ) ;

	it( "expect a value to be NaN/not NaN" , () => {
		doormen.expect( "" ).not.to.be.NaN() ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.NaN() ) ;
		doormen.expect( undefined ).not.to.be.NaN() ;
		doormen.shouldThrowAssertion( () => doormen.expect( undefined ).to.be.NaN() ) ;
		doormen.expect( NaN ).to.be.NaN() ;
		doormen.shouldThrowAssertion( () => doormen.expect( NaN ).not.to.be.NaN() ) ;
		doormen.expect( Infinity ).to.be.not.NaN() ;
		doormen.shouldThrowAssertion( () => doormen.expect( Infinity ).to.be.NaN() ) ;
	} ) ;

	it( "expect a value to be finite" , () => {
		doormen.expect( 0 ).to.be.finite() ;
		doormen.expect( 9123.345 ).to.be.finite() ;
		doormen.expect( -9123.345 ).to.be.finite() ;
		doormen.shouldThrowAssertion( () => doormen.expect( 123 ).not.to.be.finite() ) ;
		doormen.expect( NaN ).not.to.be.finite() ;
		doormen.shouldThrowAssertion( () => doormen.expect( NaN ).to.be.finite() ) ;
		doormen.expect( Infinity ).not.to.be.finite() ;
		doormen.shouldThrowAssertion( () => doormen.expect( Infinity ).to.be.finite() ) ;
		doormen.expect( -Infinity ).not.to.be.finite() ;
		doormen.shouldThrowAssertion( () => doormen.expect( -Infinity ).to.be.finite() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "trash" ).to.be.finite() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "trash" ).not.to.be.finite() ) ;
	} ) ;

	it( "expect a value to be identical" , () => {
		doormen.expect( "bob" ).to.be( "bob" ) ;
		doormen.expect( "bob" ).to.be.not( "bobby" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be( "bobby" ) ) ;
		doormen.expect( "" ).to.be( "" ) ;
		doormen.expect( NaN ).to.be( NaN ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be( {} ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [] ).to.be( [] ) ) ;
		doormen.expect( {} ).to.not.be( {} ) ;
		doormen.expect( [] ).to.not.be( [] ) ;
	} ) ;

	it( "expect a value to be a shallow clone of" , () => {
		var o1 = { a: 1 , b: 2 } ,
			o2 = { c: 3 } ,
			a1 = [ 1 , 2 , 3 ] ,
			a2 = [ "one" , "two" , "three" ] ;

		doormen.expect( {} ).to.be.a.shallow.clone.of( {} ) ;
		doormen.expect( o1 ).to.be.a.shallow.clone.of( o1 ) ;
		doormen.expect( { n: o1 } ).to.be.a.shallow.clone.of( { n: o1 } ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.be.a.shallow.clone.of( { a: 1 , b: 2 } ) ) ;
		doormen.expect( { a: 1 , b: 3 } ).not.to.be.a.shallow.clone.of( { a: 1 , b: 2 } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 3 } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 } ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 , c: 3 } ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 , c: 3 } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 } ) ) ;
		doormen.expect( { a: 1 , b: 2 , c: o1 } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 , c: o1 } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 , c: { d: 4 } } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 , c: { d: 4 } } ) ) ;
		doormen.expect( { a: 1 , b: 2 , c: a1 } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 , c: a1 } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 , c: [ 1 , 2 , 3 ] } ).to.be.a.shallow.clone.of( { a: 1 , b: 2 , c: [ 1 , 2 , 3 ] } ) ) ;
		doormen.expect( [] ).to.be.a.shallow.clone.of( [] ) ;
		doormen.expect( a1 ).to.be.a.shallow.clone.of( a1 ) ;
		doormen.expect( [ a1 ] ).to.be.a.shallow.clone.of( [ a1 ] ) ;
		doormen.expect( [ a1 , a2 , o1 , o2 ] ).to.be.a.shallow.clone.of( [ a1 , a2 , o1 , o2 ] ) ;
		doormen.expect( [ 1 , 2 , 3 ] ).to.be.a.shallow.clone.of( [ 1 , 2 , 3 ] ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ 0 , 2 , 3 ] ).to.be.a.shallow.clone.of( [ 1 , 2 , 3 ] ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ [ 1 , 2 , 3 ] ] ).to.be.a.shallow.clone.of( [ [ 1 , 2 , 3 ] ] ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ { a: 1 } ] ).to.be.a.shallow.clone.of( [ { a: 1 } ] ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ 0 , [ 1 , 2 , 3 ] ] ).to.be.a.shallow.clone.of( [ 0 , [ 1 , 2 , 3 ] ] ) ) ;
	} ) ;

	it( "expect a value to be equal (different from identical)" , () => {
		doormen.expect( "bob" ).to.equal( "bob" ) ;
		doormen.expect( "bob" ).to.be.not.equal.to( "bobby" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.equal.to( "bobby" ) ) ;
		doormen.expect( "" ).to.equal( "" ) ;
		doormen.expect( NaN ).to.equal( NaN ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).not.to.equal( {} ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [] ).not.to.equal( [] ) ) ;
		doormen.expect( {} ).to.equal( {} ) ;
		doormen.expect( [] ).to.be.equal.to( [] ) ;
		doormen.expect( { b: 2 , a: 1 } ).to.equal( { a: 1 , b: 2 } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.equal( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).not.to.equal( { b: 2 , a: 1 , nested: { c: 3 } } ) ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.be.equal.to( [ {} , "b" , 3 ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.equal.to( [ {} , "b" , 3 , undefined ] ) ;

		// not the same prototype
		doormen.expect( { b: 2 , a: 1 } ).not.to.equal( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 , a: 1 } ).to.equal( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ) ;
	} ) ;

	it( "expect a value to be equal but unordered" , () => {
		doormen.expect( [ {} , "b" , 3 ] ).to.be.equal.to.unordered( [ {} , "b" , 3 ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.be.equal.to.unordered( [ "b" , 3 , {} ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.be.equal.to.unordered( [ 3 , {} , "b" ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.equal.to.unordered( [ 3 , {} , "c" ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.equal.to.unordered( [ {} , "b" , 3 , undefined ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.equal.to.unordered( [ "b" , 3 , {} , undefined ] ) ;

		// prototype tests
		doormen.expect( [ {} , "b" , 3 ] ).not.to.be.equal.to.unordered( [ Object.create( null ) , "b" , 3 ] ) ;
		doormen.expect( [ Object.create( null ) , "b" , 3 ] ).not.to.be.equal.to.unordered( [ {} , "b" , 3 ] ) ;
		doormen.expect( [ Object.create( null ) , "b" , 3 ] ).to.be.equal.to.unordered( [ Object.create( null ) , "b" , 3 ] ) ;
		doormen.expect( [ Object.create( null ) , "b" , 3 ] ).to.be.equal.to.unordered( [ 3 , "b" , Object.create( null ) ] ) ;
	} ) ;

	it( "expect a value to be equal around" , () => {
		doormen.expect( { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ).not.to.equal( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.expect( { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ).to.equal.around( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ).not.to.equal.around( { a: 1 , b: 2 , nested: { c: 3 } } ) ) ;
	} ) ;

	it( "expect a value to be like" , () => {
		doormen.expect( "bob" ).to.be.like( "bob" ) ;
		doormen.expect( "bob" ).to.be.not.like( "bobby" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.like( "bobby" ) ) ;
		doormen.expect( "" ).to.be.like( "" ) ;
		doormen.expect( NaN ).to.be.like( NaN ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).not.to.be.like( {} ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [] ).not.to.be.like( [] ) ) ;
		doormen.expect( {} ).to.be.like( {} ) ;
		doormen.expect( [] ).to.be.like( [] ) ;
		doormen.expect( { b: 2 , a: 1 } ).to.be.like( { a: 1 , b: 2 } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.be.like( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).not.to.be.like( { b: 2 , a: 1 , nested: { c: 3 } } ) ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.be.like( [ {} , "b" , 3 ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.like( [ {} , "b" , 3 , undefined ] ) ;

		// not the same prototype
		doormen.expect( { b: 2 , a: 1 } ).to.be.like( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 , a: 1 } ).to.not.be.like( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ) ;
	} ) ;

	it( "expect a value to be like but unordered" , () => {
		doormen.expect( [ {} , "b" , 3 ] ).to.be.like.unordered( [ {} , "b" , 3 ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.be.like.unordered( [ "b" , 3 , {} ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.be.like.unordered( [ 3 , {} , "b" ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.like.unordered( [ 3 , {} , "c" ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.like.unordered( [ {} , "b" , 3 , undefined ] ) ;
		doormen.expect( [ {} , "b" , 3 ] ).to.not.be.like.unordered( [ "b" , 3 , {} , undefined ] ) ;

		// prototype tests
		doormen.expect( [ {} , "b" , 3 ] ).to.be.like.unordered( [ Object.create( null ) , "b" , 3 ] ) ;
		doormen.expect( [ Object.create( null ) , "b" , 3 ] ).to.be.like.unordered( [ {} , "b" , 3 ] ) ;
		doormen.expect( [ Object.create( null ) , "b" , 3 ] ).to.be.like.unordered( [ Object.create( null ) , "b" , 3 ] ) ;
		doormen.expect( [ Object.create( null ) , "b" , 3 ] ).to.be.like.unordered( [ 3 , "b" , Object.create( null ) ] ) ;
	} ) ;

	it( "expect a value to be like around" , () => {
		doormen.expect( Object.assign( Object.create( null ) , { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ) ).not.to.be.like( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.expect( Object.assign( Object.create( null ) , { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ) ).to.be.like.around( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( null ) , { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ) ).not.to.be.like.around( { a: 1 , b: 2 , nested: { c: 3 } } ) ) ;

		doormen.expect( Object.assign( Object.create( null ) , { value: 0.2 - 0.05 } ) ).to.be.like.around( { value: 0.15 } ) ;
		doormen.expect( Object.assign( Object.create( null ) , { value: - 0.2 + 0.05 } ) ).to.be.like.around( { value: - 0.15 } ) ;
	} ) ;

	it( "expect a value to be partially equal" , () => {
		doormen.expect( {} ).to.partially.equal( {} ) ;
		doormen.expect( [] ).to.partially.equal( [] ) ;
		doormen.expect( { b: 2 , a: 1 } ).to.partially.equal( { a: 1 , b: 2 } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.partially.equal( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.partially.equal( { nested: { c: 3 } } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.partially.equal( { a: 1 , b: 2 } ) ;
		doormen.expect( { a: 1 , nested: { c: 3 } } ).to.not.partially.equal( { a: 1 , b: 2 } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , nested: { c: 3 } } ).to.partially.equal( { a: 1 , b: 2 } ) ) ;

		// not the same prototype
		doormen.expect( { b: 2 , a: 1 } ).not.to.partially.equal( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 , a: 1 } ).to.partially.equal( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ) ;
	} ) ;

	it( "expect a value to be partially equal, the expected property being non-enumerable" , () => {
		var notEnum = {} ;

		Object.defineProperties( notEnum , {
			key: {
				value: 'one' ,
				writable: true ,
				enumerable: false
			}
		} ) ;
		
		doormen.expect( notEnum ).to.be.like( { key: 'one' } ) ;
		doormen.expect( notEnum ).not.to.be.like( { key: 'two' } ) ;
		
		var error = new Error( "Dang!" ) ;
		doormen.expect( error ).to.be.like( { message: 'Dang!' } ) ;
		doormen.expect( error ).not.to.be.like( { message: 'Argh!' } ) ;
	} ) ;

	it( "expect a value to be partially equal around" , () => {
		doormen.expect( { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ).not.to.partially.equal( { a: 1 , nested: { c: 3 } } ) ;
		doormen.expect( { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ).to.partially.equal.around( { a: 1 , nested: { c: 3 } } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ).not.to.partially.equal.around( { a: 1 , nested: { c: 3 } } ) ) ;
	} ) ;

	it( "expect a value to be partially like" , () => {
		doormen.expect( {} ).to.be.partially.like( {} ) ;
		doormen.expect( [] ).to.be.partially.like( [] ) ;
		doormen.expect( { b: 2 , a: 1 } ).to.be.partially.like( { a: 1 , b: 2 } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.be.partially.like( { a: 1 , b: 2 , nested: { c: 3 } } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.be.partially.like( { nested: { c: 3 } } ) ;
		doormen.expect( { b: 2 , a: 1 , nested: { c: 3 } } ).to.be.partially.like( { a: 1 , b: 2 } ) ;
		doormen.expect( { a: 1 , nested: { c: 3 } } ).to.not.partially.equal( { a: 1 , b: 2 } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , nested: { c: 3 } } ).to.be.partially.like( { a: 1 , b: 2 } ) ) ;

		// not the same prototype
		doormen.expect( { b: 2 , a: 1 } ).to.be.partially.like( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { b: 2 , a: 1 } ).to.not.be.partially.like( Object.assign( Object.create( null ) , { a: 1 , b: 2 } ) ) ) ;
	} ) ;

	it( "expect a value to be partially like around" , () => {
		doormen.expect( Object.assign( Object.create( null ) , { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ) ).not.to.be.partially.like( { a: 1 , nested: { c: 3 } } ) ;
		doormen.expect( Object.assign( Object.create( null ) , { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ) ).to.be.partially.like.around( { a: 1 , nested: { c: 3 } } ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( null ) , { b: 2 + 2 * Number.EPSILON , a: 1 - 2 * Number.EPSILON , nested: { c: 3 + 2 * Number.EPSILON } } ) ).not.to.be.partially.like.around( { a: 1 , nested: { c: 3 } } ) ) ;
	} ) ;

	it( "expect a value to map" , () => {
		doormen.expect( new Map() ).to.map( [] ) ;
		doormen.expect( new Map( [ [ "one" , 1 ] ] ) ).to.map( [ [ "one" , 1 ] ] ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "one" , 1 ] , [ 2 , "two" ] ] ) ).to.map( [ [ "one" , 1 ] ] ) ) ;
		doormen.expect( new Map( [ [ "one" , 1 ] , [ 2 , "two" ] ] ) ).to.map( [ [ "one" , 1 ] , [ 2 , "two" ] ] ) ;
		doormen.expect( new Map( [ [ "one" , 1 ] , [ 2 , { "two": 2 } ] ] ) ).to.map( [ [ "one" , 1 ] , [ 2 , { "two": 2 } ] ] ) ;

		// Keys and values should be checked with the equal algorithm
		doormen.expect( new Map( [ [ { a: 1 } , 1 ] , [ { b: 2 } , { "two": 2 } ] ] ) ).to.map( [ [ { a: 1 } , 1 ] , [ { b: 2 } , { "two": 2 } ] ] ) ;
		doormen.expect( new Map( [ [ { a: 1 } , 1 ] , [ { a: 1 } , { "two": 2 } ] ] ) ).to.map( [ [ { a: 1 } , 1 ] , [ { a: 1 } , { "two": 2 } ] ] ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ { a: 1 } , 1 ] , [ { b: 2 } , { "two": 2 } ] ] ) ).to.map( [ [ { a: 1 } , 1 ] , [ { a: 1 } , { "two": 2 } ] ] ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ { a: 1 } , 1 ] , [ { a: 1 } , { "two": 2 } ] ] ) ).to.map( [ [ { a: 1 } , 1 ] , [ { b: 2 } , { "two": 2 } ] ] ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ { a: 1 } , 1 ] , [ { b: 2 } , { "two": 2 } ] ] ) ).to.map( [ [ { a: 1 } , 1 ] , [ { b: 2 } , { "two": 3 } ] ] ) ) ;
	} ) ;

	it( "expect a value to be around/close to (epsilon-aware)" , () => {
		// 0.1 + 0.2 is not equal to 0.3 due to epsilon error in floating point numbers
		doormen.expect( 0.1 + 0.2 ).not.to.be( 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.1 + 0.2 ).to.be( 0.3 ) ) ;
		doormen.expect( 0.1 + 0.2 ).to.be.close.to( 0.3 ) ;
		doormen.expect( 0.1 + 0.2 ).to.be.around( 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.1 + 0.2 ).not.to.be.close.to( 0.3 ) ) ;
		doormen.expect( 0.1 + 0.2 + 2 * Number.EPSILON ).to.be.not.close.to( 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.1 + 0.2 + 2 * Number.EPSILON ).to.be.close.to( 0.3 ) ) ;

		// Non-numbers throw
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.close.to( 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "0.3" ).to.be.close.to( 0.3 ) ) ;

		doormen.expect( 0 ).to.be.close.to( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 ).not.to.be.close.to( 0 ) ) ;
		doormen.expect( 0 + Number.MIN_VALUE ).to.be.close.to( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 + Number.MIN_VALUE ).not.to.be.close.to( 0 ) ) ;
		doormen.expect( 0 + 4 * Number.MIN_VALUE ).to.be.close.to( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 + 4 * Number.MIN_VALUE ).not.to.be.close.to( 0 ) ) ;
		doormen.expect( 0 + 5 * Number.MIN_VALUE ).to.be.not.close.to( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 + 5 * Number.MIN_VALUE ).to.be.close.to( 0 ) ) ;

		doormen.expect( 0 - Number.MIN_VALUE ).to.be.close.to( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 - Number.MIN_VALUE ).to.be.not.close.to( 0 ) ) ;
		doormen.expect( 0 - 4 * Number.MIN_VALUE ).to.be.close.to( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 - 4 * Number.MIN_VALUE ).to.be.not.close.to( 0 ) ) ;
		doormen.expect( 0 - 5 * Number.MIN_VALUE ).to.be.not.close.to( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 - 5 * Number.MIN_VALUE ).to.be.close.to( 0 ) ) ;

		
		// Historical bug with negative numbers
		doormen.expect( -1 ).to.be.around( -1 ) ;
		doormen.expect( 0.2 - 0.05 ).to.be.around( 0.15 ) ;
		doormen.expect( - 0.2 + 0.05 ).to.be.around( - 0.15 ) ;
	} ) ;

	it( "expect a value to be above/below/at least/at most" , () => {
		doormen.expect( 0.1 ).to.be.below( 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.1 ).to.be.above( 0.3 ) ) ;
		doormen.expect( 0.1 ).to.be.at.most( 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.1 ).to.be.at.least( 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.3 ).to.be.below( 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.3 ).to.be.above( 0.3 ) ) ;
		doormen.expect( 0.3 ).to.be.at.most( 0.3 ) ;
		doormen.expect( 0.3 ).to.be.at.least( 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.5 ).to.be.below( 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.5 ).to.be.at.most( 0.3 ) ) ;
		doormen.expect( 0.5 ).to.be.above( 0.3 ) ;
		doormen.expect( 0.5 ).to.be.at.least( 0.3 ) ;

		// Non-numbers throw
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.above( 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "0.2" ).to.be.below( 0.3 ) ) ;
	} ) ;

	it( "expect a value to be within/not within" , () => {
		doormen.expect( 0.1 ).to.be.within( 0 , 0.3 ) ;
		doormen.expect( 0 ).to.be.within( 0 , 0.3 ) ;
		doormen.expect( 0.3 ).to.be.within( 0 , 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.1 ).not.to.be.within( 0 , 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0 ).to.be.not.within( 0 , 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.3 ).to.not.be.within( 0 , 0.3 ) ) ;
		doormen.expect( -0.1 ).not.to.be.within( 0 , 0.3 ) ;
		doormen.expect( 0.4 ).not.to.be.within( 0 , 0.3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( -0.1 ).to.be.within( 0 , 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( 0.4 ).to.be.within( 0 , 0.3 ) ) ;

		// Non-numbers throw
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.within( 0 , 0.3 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "0.2" ).to.be.within( 0 , 0.3 ) ) ;
	} ) ;

	it( "expect a value to match/not match" , () => {
		doormen.expect( "bob" ).to.match( /bob/ ) ;
		doormen.expect( "bob" ).to.match( /^[bo]+$/ ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.not.match( /^[bo]+$/ ) ) ;
		doormen.expect( "bob" ).not.to.match( /^[ba]+$/ ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.match( /^[ba]+$/ ) ) ;
	} ) ;

	it( "expect a value to start with/not start with" , () => {
		doormen.expect( "abcdefgh" ).to.start.with( "abc" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "abcdefgh" ).to.not.start.with( "abc" ) ) ;
		doormen.expect( "abcdefgh" ).not.to.start.with( "bcd" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "abcdefgh" ).to.start.with( "bcd" ) ) ;
	} ) ;

	it( "expect a value to end with/not end with" , () => {
		doormen.expect( "abcdefgh" ).to.end.with( "fgh" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "abcdefgh" ).to.not.end.with( "fgh" ) ) ;
		doormen.expect( "abcdefgh" ).not.to.end.with( "efg" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "abcdefgh" ).to.end.with( "efg" ) ) ;
	} ) ;

	it( "expect a value to have a length of/not have a length of" , () => {
		doormen.expect( "Hello Bob!" ).to.have.length.of( 10 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).not.to.have.length.of( 10 ) ) ;
		doormen.expect( "Hello Bob!" ).to.not.have.length.of( 8 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).to.have.length.of( 8 ) ) ;
		doormen.expect( "" ).to.have.length.of( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "" ).not.to.have.length.of( 0 ) ) ;
		doormen.expect( "" ).to.not.have.length.of( 8 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "" ).to.have.length.of( 8 ) ) ;
		doormen.expect( [ 1 , 2 , 3 ] ).to.have.length.of( 3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ 1 , 2 , 3 ] ).not.to.have.length.of( 3 ) ) ;
		doormen.expect( [ 1 , 2 , 3 ] ).to.not.have.length.of( 8 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ 1 , 2 , 3 ] ).to.have.length.of( 8 ) ) ;
		doormen.expect( [] ).to.have.length.of( 0 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [] ).not.to.have.length.of( 0 ) ) ;
		doormen.expect( [] ).to.not.have.length.of( 8 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [] ).to.have.length.of( 8 ) ) ;
	} ) ;

	it( "expect a value to contain/not contain" , () => {
		// String
		doormen.expect( "Hello Bob!" ).to.contain( 'Bob' ) ;
		doormen.expect( "Hello Bob!" ).to.include( 'Bob' ) ;
		doormen.expect( "Hello Bob!" ).to.include( 'Hello' , 'Bob' ) ;
		doormen.expect( "Hello Bob!" ).to.not.have( 'Jack' ) ;
		doormen.expect( "Hello Bob!" ).to.not.have( 'Hi' , 'Jack' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).to.contain( 'Bill' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).to.contain( 'Hi' , 'Bill' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).to.contain( 'Hello' , 'Bill' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).to.contain( 'Hi' , 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).not.to.contain( 'Hi' , 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).not.to.contain( 'Hello' , 'Bill' ) ) ;
		
		// Array
		doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain( 'Bob' ) ;
		doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain( 'Bob' , 'Jack' ) ;
		doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).not.to.contain( 'Bobby' ) ;
		doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).not.to.contain( 'Jacky' , 'Bobby' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain( 'Bobby' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).not.to.contain( 'Jack' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).not.to.contain( 'Jack' , 'Bobby' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).not.to.contain( 'Bobby' , 'Alice' ) ) ;
		doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain( 'Bob' ) ;
		doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain( 'Bob' , 'Alice' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain( 'Charlie' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).not.to.contain( 'Jack' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).not.to.contain( 'Roger' , 'Jack' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).not.to.contain( 'Jack' , 'Roger' ) ) ;

		doormen.expect( new Map( [ [ 1 , "Alice" ] , [ 2 , "Bob" ] , [ "two" , "Jack" ] ] ) ).to.contain( 'Bob' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ 1 , "Alice" ] , [ 2 , "Bob" ] , [ "two" , "Jack" ] ] ) ).to.contain( 'bob' ) ) ;

		// Object
		doormen.expect( { a: "Alice" , b: "Bob" , c: "Jack" } ).to.contain( 'Bob' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: "Alice" , b: "Bob" , c: "Alice" } ).to.contain( 'Bobby' ) ) ;
	} ) ;

	it( "have vs contain" , () => {
		doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.contain( 'two' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.contain( 'Jack' ) ) ;

		// Map and 'have' behavior
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.have( 'two' ) ) ;
		doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.have( 'Jack' ) ;
	} ) ;

	it( "expect a value to contain/not contain only" , () => {
		doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Jack' , 'Alice' , 'Bob' ) ;
		doormen.expect( [ "Alice" , "Bob" , "Jack" , "Bob" ] ).to.contain.only( 'Jack' , 'Alice' , 'Bob' ) ;
		doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Jack' , 'Alice' , 'Bob' , 'Alice' ) ;
		doormen.expect( [ "Jack" , "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Jack' , 'Alice' , 'Bob' , 'Alice' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Alice' , 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Bob' , 'Bob' , 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Tony' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.contain.only( 'Jack' , 'Alice' , 'Bob' , 'Tony' ) ) ;

		doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Jack' , 'Alice' , 'Bob' ) ;
		doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" , "Bob" ] ) ).to.contain.only( 'Jack' , 'Alice' , 'Bob' ) ;
		doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Jack' , 'Alice' , 'Bob' , 'Alice' ) ;
		doormen.expect( new Set( [ "Jack" , "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Jack' , 'Alice' , 'Bob' , 'Alice' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Alice' , 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Bob' , 'Bob' , 'Bob' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Tony' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ "Alice" , "Bob" , "Jack" ] ) ).to.contain.only( 'Jack' , 'Alice' , 'Bob' , 'Tony' ) ) ;

		// Ambigous assertion
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).not.to.contain.only( 'Alice' ) ) ;
	} ) ;

	it( "have only vs contain only" , () => {
		doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.contain.only( 1 , 2 , 'two' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.contain.only( 1 , 2 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.contain.only( 1 , 2 , 'two' , 'three' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.contain.only( "Alice" , "Bob" , "Jack" ) ) ;

		// Map and 'have' behavior
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.have.only( 1 , 2 , 'two' ) ) ;
		doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.have.only( "Alice" , "Bob" , "Jack" ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.have.only( "Alice" , "Bob" ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ "Alice" , 1 ] , [ "Bob" , 2 ] , [ "Jack" , "two" ] ] ) ).to.have.only( "Alice" , "Bob" , "Jack" , "Jim" ) ) ;
	} ) ;

	it( "expect a value to only contain unique values" , () => {
		// Array
		doormen.expect( [ "Alice" , "Bob" , "Jack" ] ).to.only.contain.unique.values() ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ "Alice" , "Bob" , "Alice" ] ).to.only.contain.unique.values() ) ;
		
		var o = {} ;
		doormen.expect( [ {} , {} ] ).to.only.contain.unique.values() ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ {} , o , o ] ).to.only.contain.unique.values() ) ;

		// Object
		doormen.expect( { a: "Alice" , b: "Bob" , c: "Jack" } ).to.only.contain.unique.values() ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: "Alice" , b: "Bob" , c: "Alice" } ).to.only.contain.unique.values() ) ;
		
		var o = {} ;
		doormen.expect( { a: {} , b: {} } ).to.only.contain.unique.values() ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: {} , b: o , c: o } ).to.only.contain.unique.values() ) ;

		// Map
		doormen.expect( new Map( [ [ 'a', "Alice" ] , [ 'b', "Bob" ] , [ 'c', "Jack" ] ] ) ).to.only.contain.unique.values() ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ 'a', "Alice" ] , [ 'b', "Bob" ] , [ 'c', "Alice" ] ] ) ).to.only.contain.unique.values() ) ;
		
		var o = {} ;
		doormen.expect( new Map( [ [ 'a', {} ] , [ 'b', {} ] ] ) ).to.only.contain.unique.values() ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Map( [ [ 'a', {} ] , [ 'b', o ] , [ 'c', o ] ] ) ).to.only.contain.unique.values() ) ;
	} ) ;

	it( "expect a value to be empty/not empty" , () => {
		doormen.expect( "" ).to.be.empty() ;
		doormen.expect( "Bob" ).not.to.be.empty() ;
		doormen.shouldThrowAssertion( () => doormen.expect( "Hello Bob!" ).to.be.empty() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "" ).to.not.be.empty() ) ;
		doormen.expect( [] ).to.be.empty() ;
		doormen.shouldThrowAssertion( () => doormen.expect( [] ).to.be.not.empty() ) ;
		doormen.expect( [ 1 ] ).not.to.be.empty() ;
		doormen.expect( [ 1 , 2 , 3 ] ).not.to.be.empty() ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ 1 ] ).to.be.empty() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( [ 1 , 2 , 3 ] ).to.be.empty() ) ;
		doormen.expect( [ undefined ] ).not.to.be.empty() ;
		doormen.expect( {} ).to.be.empty() ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be.not.empty() ) ;
		doormen.expect( { a: 1 } ).not.to.be.empty() ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.be.empty() ) ;
		doormen.expect( new Set() ).to.be.empty() ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set() ).to.be.not.empty() ) ;
		doormen.expect( new Set( [ 1 ] ) ).not.to.be.empty() ;
		doormen.expect( new Set( [ 1 , 2 , 3 ] ) ).not.to.be.empty() ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ 1 ] ) ).to.be.empty() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Set( [ 1 , 2 , 3 ] ) ).to.be.empty() ) ;
	} ) ;

	it( "expect a value to have keys/not to have keys" , () => {
		doormen.expect( { a: 1 } ).to.have.key( 'a' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.no.key( 'a' ) ) ;
		doormen.expect( { a: 1 } ).to.not.have.key( 'b' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.key( 'b' ) ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.keys( 'a' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.keys( 'b' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.keys( 'a' , 'b' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.keys( 'a' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.keys( 'b' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.keys( 'a' , 'b' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.keys( 'a' , 'b' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.keys( 'a' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.keys( 'b' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.have.keys( 'a' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.have.keys( 'b' , 'c' ) ) ;

		var proto = { d: 4 } ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.keys( 'a' ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.keys( 'd' ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.keys( 'a' , 'd' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.not.have.key( 'd' ) ) ;
	} ) ;

	it( "expect a value to have own keys/not to have own keys" , () => {
		doormen.expect( { a: 1 } ).to.have.own.key( 'a' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.no.own.key( 'a' ) ) ;
		doormen.expect( { a: 1 } ).to.not.have.own.key( 'b' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.own.key( 'b' ) ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.own.keys( 'a' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.own.keys( 'b' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.own.keys( 'a' , 'b' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.own.keys( 'a' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.own.keys( 'b' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.own.keys( 'a' , 'b' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.own.keys( 'a' , 'b' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.own.keys( 'a' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).not.to.have.own.keys( 'b' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.have.own.keys( 'a' , 'c' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.have.own.keys( 'b' , 'c' ) ) ;

		var proto = { d: 4 } ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.keys( 'a' ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).not.to.have.own.keys( 'd' ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.no.own.key( 'd' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.key( 'd' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.keys( 'd' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.keys( 'a' , 'd' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).not.to.have.own.keys( 'a' , 'd' ) ) ;
	} ) ;

	it( "expect a value to 'only have keys' should throw, suggesting to use 'only have own keys' instead" , () => {
		doormen.equals( '' + doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.only.have.key( 'a' ) ) , "AssertionError: Instead of using assertion 'onlyKeys', you should use assertion 'onlyOwnKeys'." ) ;
		doormen.equals( '' + doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.only.have.key( 'a' ) ) , "AssertionError: Instead of using assertion 'onlyKeys', you should use assertion 'onlyOwnKeys'." ) ;
	} ) ;

	it( "expect a value to only have own keys" , () => {
		doormen.expect( { a: 1 } ).to.only.have.own.key( 'a' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.have.only.own.key( 'a' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.only.own.keys( 'a' , 'b' ) ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.only.have.own.keys( 'a' , 'b' ) ;

		var proto = { d: 4 } ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 } ) ).to.have.own.only.key( 'a' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 } ) ).to.only.have.own.key( 'd' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , {} ) ).to.only.have.own.key( 'd' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 } ) ).to.have.only.own.keys( 'a' , 'd' ) ) ;
	} ) ;

	it( "expect a value to have property/not to have property" , () => {
		doormen.expect( { a: 1 } ).to.have.property( 'a' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.no.property( 'a' ) ) ;
		doormen.expect( { a: 1 } ).to.not.have.property( 'b' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.property( 'b' ) ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.property( 'a' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.property( 'b' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.property( 'a' , 1 ) ;
		doormen.expect( { a: 1 , b: 2 } ).not.to.have.property( 'a' , 2 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.have.property( 'a' , 2 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.not.have.property( 'a' , 1 ) ) ;

		var proto = { d: 4 } ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.property( 'a' ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.property( 'd' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.not.have.property( 'd' ) ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.property( 'd' , 4 ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.not.have.property( 'd' , 3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.not.have.property( 'd' , 4 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.property( 'd' , 3 ) ) ;
	} ) ;

	it( "expect a value to have own property/not to have own property" , () => {
		doormen.expect( { a: 1 } ).to.have.own.property( 'a' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.no.own.property( 'a' ) ) ;
		doormen.expect( { a: 1 } ).to.not.have.own.property( 'b' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 } ).to.have.own.property( 'b' ) ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.own.property( 'a' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.own.property( 'b' ) ;
		doormen.expect( { a: 1 , b: 2 } ).to.have.own.property( 'a' , 1 ) ;
		doormen.expect( { a: 1 , b: 2 } ).not.to.have.own.property( 'a' , 2 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.have.own.property( 'a' , 2 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( { a: 1 , b: 2 } ).to.not.have.own.property( 'a' , 1 ) ) ;

		var proto = { d: 4 } ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.property( 'a' ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).not.to.have.own.property( 'd' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.property( 'd' ) ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).not.to.have.own.property( 'd' , 4 ) ;
		doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.not.have.own.property( 'd' , 3 ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.property( 'd' , 4 ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( Object.assign( Object.create( proto ) , { a: 1 , b: 2 } ) ).to.have.own.property( 'd' , 3 ) ) ;
	} ) ;

	it( "expect a value (function) to throw/to not throw" , () => {
		doormen.expect( () => { throw new Error( "bob" ) ; } ).to.throw() ;
		doormen.shouldThrowAssertion( () => doormen.expect( () => { throw new Error( "bob" ) ; } ).not.to.throw() ) ;
		doormen.expect( () => 1 ).not.to.throw() ;
		doormen.shouldThrowAssertion( () => doormen.expect( () => 1 ).to.throw() ) ;
	} ) ;

	it( "expect a value (function) to throw/to not throw a specific error" , () => {
		doormen.expect( () => { throw new SyntaxError( "bob" ) ; } ).to.throw.a( SyntaxError ) ;
		doormen.expect( () => { throw new SyntaxError( "bob" ) ; } ).to.throw.a( Error ) ;	// SyntaxError inherit Error
		doormen.shouldThrowAssertion( () => doormen.expect( () => { throw new SyntaxError( "bob" ) ; } ).not.to.throw.a( SyntaxError ) ) ;
		doormen.expect( () => { throw new SyntaxError( "bob" ) ; } ).to.not.throw.a( RangeError ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( () => { throw new SyntaxError( "bob" ) ; } ).to.throw.a( RangeError ) ) ;
		doormen.expect( () => 1 ).not.to.throw.a( SyntaxError ) ;
		doormen.expect( () => 1 ).not.to.throw.an( Error ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( () => 1 ).to.throw( SyntaxError ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( () => 1 ).to.throw( Error ) ) ;
	} ) ;

	it( "executing a function with args" , () => {
		doormen.expect( ( v ) => { if ( v === 3 ) { throw new Error( "bob" ) ; } } ).not.to.throw() ;
		doormen.expect( ( v ) => { if ( v === 3 ) { throw new Error( "bob" ) ; } } ).with.args( 2 ).not.to.throw() ;
		doormen.expect( ( v ) => { if ( v === 3 ) { throw new Error( "bob" ) ; } } ).with.args( 3 ).to.throw() ;
		doormen.expect( ( v ) => { if ( v === 3 ) { throw new Error( "bob" ) ; } } ).with.args( 2 , 'some' , 'value' ).not.to.throw() ;
		doormen.expect( ( v ) => { if ( v === 3 ) { throw new Error( "bob" ) ; } } ).with.args( 3 , 'some' , 'value' ).to.throw() ;
		doormen.expect( ( v , v2 ) => { if ( v === 3 || v2 === 'some' ) { throw new Error( "bob" ) ; } } ).with.args( 2 , 'some' , 'value' ).to.throw() ;
		doormen.expect( ( v , v2 ) => { if ( v === 3 || v2 === 'some' ) { throw new Error( "bob" ) ; } } ).with.args( 3 , 'some' , 'value' ).to.throw() ;
		doormen.expect( ( v , v2 ) => { if ( v === 3 && v2 === 'some' ) { throw new Error( "bob" ) ; } } ).with.args( 2 , 'some' , 'value' ).to.not.throw() ;
		doormen.expect( ( v , v2 ) => { if ( v === 3 && v2 === 'some' ) { throw new Error( "bob" ) ; } } ).with.args( 3 , 'some' , 'value' ).to.throw() ;
		doormen.shouldThrowAssertion( () => doormen.expect( ( v , v2 ) => { if ( v === 3 && v2 === 'some' ) { throw new Error( "bob" ) ; } } ).with.args( 2 , 'some' , 'value' ).to.throw() ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( ( v , v2 ) => { if ( v === 3 && v2 === 'some' ) { throw new Error( "bob" ) ; } } ).with.args( 3 , 'some' , 'value' ).to.not.throw() ) ;
	} ) ;

	it( "executing a method of an object, passing a either the function or property" , () => {
		var object = {
			a: 3 ,
			test: function( v ) {
				if ( v !== this.a ) {
					throw new Error( "bob" ) ;
				}
			}
		} ;

		doormen.expect( object.test ).method.of( object ).to.throw() ;
		doormen.expect( object.test ).method.of( object ).with.args( 2 ).to.throw() ;
		doormen.expect( object.test ).method.of( object ).with.args( 3 ).not.to.throw() ;

		doormen.expect( 'test' ).method.of( object ).to.throw() ;
		doormen.expect( 'test' ).method.of( object ).with.args( 2 ).to.throw() ;
		doormen.expect( 'test' ).method.of( object ).with.args( 3 ).not.to.throw() ;
	} ) ;

	it( "expect a value to be of a type" , () => {
		doormen.expect( "bob" ).to.be.a( 'string' ) ;
		doormen.expect( "bob" ).to.be.of.type( 'string' ) ;
		doormen.expect( "bob" ).not.to.be.a( 'number' ) ;
		doormen.expect( "bob" ).not.to.be.of.type( 'number' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).not.to.be.a( 'string' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).to.be.a( 'number' ) ) ;
		doormen.expect( "http://soulserv.net" ).to.be.an( 'url' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "http://soulserv.net" ).not.to.be.an( 'url' ) ) ;
		doormen.expect( "soulserv.net" ).to.be.not.an( 'url' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( "soulserv.net" ).to.be.an( 'url' ) ) ;
	} ) ;

	it( "expect a value to be an instance of" , () => {
		doormen.expect( {} ).to.be.an( Object ) ;
		doormen.expect( {} ).not.to.be.a( Date ) ;
		doormen.expect( new Date() ).to.be.a( Date ) ;
		doormen.expect( new Date() ).to.be.an( Object ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be.not.an( Object ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( {} ).to.be.a( Date ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Date() ).to.not.be.a( Date ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect( new Date() ).not.to.be.an( Object ) ) ;
	} ) ;

	it( "force failure" , () => {
		doormen.equals( '' + doormen.shouldThrowAssertion( () => doormen.expect().fail( "Failed!" ) ) , 'AssertionError: Failed!' ) ;
		doormen.equals( '' + doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).fail( "to do something" ) ) , 'AssertionError: Expected "bob" to do something' ) ;
		doormen.equals( '' + doormen.shouldThrowAssertion( () => doormen.expect( "bob" ).fail( "to do something with" , { a: 1 , b: 2 } ) ) , 'AssertionError: Expected "bob" to do something with { a: 1 , b: 2 }' ) ;
	} ) ;

	it( "Promise as values" , async () => {
		await doormen.expect( Promise.resolve( 2 ) ).to.eventually.be( 2 ) ;
		await doormen.expect( resolveTimeout( 2 ) ).to.be.eventually( 2 ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( resolveTimeout( 2 ) ).to.be.eventually( 3 ) ) ;
		await doormen.expect( resolveTimeout( { a: 1 , b: 2 } ) ).to.be.eventually.equal.to( { a: 1 , b: 2 } ) ;
		await doormen.expect( resolveTimeout( { a: 1 , b: 2 } ) ).to.equal.eventually( { a: 1 , b: 2 } ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( resolveTimeout( { a: 1 , b: 2 } ) ).to.equal.eventually( { a: 1 , b: 3 } ) ) ;

		await doormen.expect( rejectTimeout( new Error( 'Reject!' ) ) ).to.be.rejected() ;
		await doormen.shouldRejectAssertion( () => doormen.expect( resolveTimeout() ).to.be.rejected() ) ;
		await doormen.expect( resolveTimeout() ).not.to.be.rejected() ;
		await doormen.shouldRejectAssertion( () => doormen.expect( rejectTimeout( new Error( 'Reject!' ) ) ).not.to.be.rejected() ) ;
	} ) ;

	it( "Promise-returning functions" , async () => {
		await doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).to.eventually.throw() ;
		await doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).to.reject() ;
		await doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).not.to.fulfill() ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => resolveTimeout() ).to.eventually.throw() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => resolveTimeout() ).to.reject() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => resolveTimeout() ).not.to.fulfill() ) ;

		await doormen.expect( () => resolveTimeout() ).not.to.eventually.throw() ;
		await doormen.expect( () => resolveTimeout() ).not.to.reject() ;
		await doormen.expect( () => resolveTimeout() ).to.fulfill() ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).not.to.eventually.throw() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).not.to.reject() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).to.fulfill() ) ;
	} ) ;
	
	it( "'to reject'/'to fulfill' assertion should support both promises and functions returning a promise" , async () => {
		await doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).to.reject() ;
		await doormen.expect( rejectTimeout( new Error( 'Reject!' ) ) ).to.reject() ;
		await doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).not.to.fulfill() ;
		await doormen.expect( rejectTimeout( new Error( 'Reject!' ) ) ).not.to.fulfill() ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => resolveTimeout() ).to.reject() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( resolveTimeout() ).to.reject() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => resolveTimeout() ).not.to.fulfill() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( resolveTimeout() ).not.to.fulfill() ) ;

		await doormen.expect( () => resolveTimeout() ).not.to.reject() ;
		await doormen.expect( resolveTimeout() ).not.to.reject() ;
		await doormen.expect( () => resolveTimeout() ).to.fulfill() ;
		await doormen.expect( resolveTimeout() ).to.fulfill() ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).not.to.reject() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( rejectTimeout( new Error( 'Reject!' ) ) ).not.to.reject() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).to.fulfill() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect( rejectTimeout( new Error( 'Reject!' ) ) ).to.fulfill() ) ;
	} ) ;

	it( "expectation for each value of an iterable using expect.each()" , () => {
		doormen.expect.each( [] ).to.be.a( 'number' ) ;
		doormen.expect.each( [ 1,2,3 ] ).to.be.a( 'number' ) ;
		doormen.expect.each( { a:1,b:2,c:3 } ).to.be.a( 'number' ) ;
		doormen.expect.each( new Set( [ 1,2,3 ] ) ).to.be.a( 'number' ) ;
		doormen.shouldThrowAssertion( () => doormen.expect.each( [ 1,2,3,"bob" ] ).to.be.a( 'number' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect.each( [ 1,2,3,"bob",4 ] ).to.be.a( 'number' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect.each( [ "bob" ] ).to.be.a( 'number' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect.each( { a:1,b:2,c:"bob" } ).to.be.a( 'number' ) ) ;
		doormen.shouldThrowAssertion( () => doormen.expect.each( new Set( [ 1,2,3,"bob" ] ) ).to.be.a( 'number' ) ) ;
	} ) ;

	it( "expectation for each promise of an iterable using expect.each()" , async () => {
		var error = new Error( "Error!" ) ;
		await doormen.expect.each( [ resolveTimeout(1), resolveTimeout(2), resolveTimeout(3) ] ).to.eventually.be.a( 'number' ) ;
		await doormen.expect.each( [ resolveTimeout(1), resolveTimeout(2), resolveTimeout(3) ] ).to.fulfill() ;
		await doormen.expect.each( [ rejectTimeout(error), rejectTimeout(error), rejectTimeout(error) ] ).to.reject() ;

		await doormen.shouldRejectAssertion( () => doormen.expect.each( [ resolveTimeout(1), resolveTimeout({}), resolveTimeout(3) ] ).to.eventually.be.a( 'number' ) ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect.each( [ resolveTimeout(1), rejectTimeout(error), resolveTimeout(3) ] ).to.eventually.be.a( 'number' ) ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect.each( [ rejectTimeout(error), rejectTimeout(error), rejectTimeout(error) ] ).to.fulfill() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect.each( [ resolveTimeout(1), rejectTimeout(error), resolveTimeout(3) ] ).to.fulfill() ) ;
		await doormen.shouldRejectAssertion( () => doormen.expect.each( [ resolveTimeout(1), rejectTimeout(error), resolveTimeout(3) ] ).to.reject() ) ;
	} ) ;

	/*
	it( "test stack traces" , async () => {
		await doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).to.reject() ;
		
		// This should generate the correct sstack trace
		await doormen.expect( () => rejectTimeout( new Error( 'Reject!' ) ) ).to.fulfill() ;
	} ) ;
	//*/
} ) ;



describe( "Sub-schema path" , () => {

	it( "should find the sub-schema for a basic path" , () => {
		var schema = {
			type: 'strictObject' ,
			properties: {
				key1: { type: 'integer' , custom: 'field' } ,
				key2: { type: 'string' , another: 'custom' } ,
				key3: {
					type: 'strictObject' ,
					properties: {
						subkey1: { type: 'integer' , some: 'data' }
					}
				} ,
				key4: {
					type: 'strictObject' ,
					noSubmasking: true ,
					of: { type: 'string' , another: 'custom' }
				} ,
				key5: {
					type: 'array' ,
					of: { type: 'string' , more: 'data' }
				} ,
				key6: {
					type: 'array' ,
					elements: [
						{ type: 'string' , custom: '0' } ,
						{ type: 'number' , custom: '1' } ,
						{ type: 'boolean' , custom: '2' } ,
					]
				}
			}
		} ;

		doormen.equals(
			doormen.subSchema( schema , '' ) ,
			schema
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key1' ) ,
			schema.properties.key1
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key2' ) ,
			schema.properties.key2
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key3' ) ,
			schema.properties.key3
		) ;

		doormen.shouldThrow( () => doormen.subSchema( schema , 'unexistant' ) ) ;

		doormen.equals(
			doormen.subSchema( schema , 'key3.subkey1' ) ,
			schema.properties.key3.properties.subkey1
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key4.anything' ) ,
			schema.properties.key4.of
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key4.anythingelse' ) ,
			schema.properties.key4.of
		) ;

		doormen.shouldThrow( () => doormen.subSchema( schema , 'unexistant.unexistant' ) ) ;

		doormen.equals(
			doormen.subSchema( schema , 'key2.unexistant' ) ,
			{}
		) ;

		doormen.shouldThrow( () => doormen.subSchema( schema , 'key3.unexistant' ) ) ;
		
		doormen.equals(
			doormen.subSchema( schema , 'key5.0' ) ,
			{ type: 'string' , more: 'data' }
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key5.1' ) ,
			{ type: 'string' , more: 'data' }
		) ;
		
		doormen.equals(
			doormen.subSchema( schema , 'key6.0' ) ,
			{ type: 'string' , custom: '0' } ,
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key6.1' ) ,
			{ type: 'number' , custom: '1' } ,
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key6.2' ) ,
			{ type: 'boolean' , custom: '2' } ,
		) ;
		
		doormen.shouldThrow( () => doormen.subSchema( schema , 'key6.3' ) ) ;
	} ) ;

	it( "should find the sub-schema with the 'noSubmasking' option" , () => {
		var schema = {
			type: 'strictObject' ,
			properties: {
				key1: { type: 'integer' , custom: 'field' } ,
				key2: { type: 'string' , another: 'custom' } ,
				key3: {
					type: 'strictObject' ,
					properties: {
						subkey1: { type: 'integer' , some: 'data' }
					}
				} ,
				key4: {
					type: 'strictObject' ,
					noSubmasking: true ,
					of: { type: 'string' , another: 'custom' }
				} ,
				key5: {
					type: 'array' ,
					of: { type: 'string' , more: 'data' }
				} ,
				key6: {
					type: 'array' ,
					elements: [
						{ type: 'string' , custom: '0' } ,
						{ type: 'number' , custom: '1' } ,
						{ type: 'boolean' , custom: '2' } ,
					]
				}
			}
		} ;

		doormen.equals(
			doormen.subSchema( schema , '' , true ) ,
			schema
		) ;
		doormen.equals(
			doormen.subSchema( schema , 'key4' , true ) ,
			schema.properties.key4
		) ;
		doormen.equals(
			doormen.subSchema( schema , 'key4.anything' , true ) ,
			null
		) ;

		schema.noSubmasking = true ;
		doormen.equals(
			doormen.subSchema( schema , '' , true ) ,
			schema
		) ;
		doormen.equals(
			doormen.subSchema( schema , 'key4' , true ) ,
			null
		) ;
		doormen.equals(
			doormen.subSchema( schema , 'key4.anything' , true ) ,
			null
		) ;
	} ) ;

	it( "* has no special meaning at the moment, but in any case it should support the 'of' part of a sub-schema" , () => {
		var schema = {
			type: 'strictObject' ,
			properties: {
				key1: {
					type: 'array' ,
					of: { type: 'string' , more: 'data' }
				} ,
				key2: {
					type: 'strictObject' ,
					noSubmasking: true ,
					of: { type: 'string' , another: 'custom' }
				}
			}
		} ;

		doormen.equals(
			doormen.subSchema( schema , 'key1.*' ) ,
			{ type: 'string' , more: 'data' }
		) ;

		doormen.equals(
			doormen.subSchema( schema , 'key2.*' ) ,
			{ type: 'string' , another: 'custom' }
		) ;
	} ) ;
} ) ;



describe( "Extract constraint-only schema" , () => {

	it( "Extract constraint-only schema from a complete schema" , () => {
		expect( doormen.constraintSchema( {
			type: 'array' ,
			of: {
				type: 'string'
			} ,
			constraints: [
				{ enforce: 'unique' }
			]
		} ) ).to.equal( {
			constraints: [
				{ enforce: 'unique' }
			]
		} ) ;

		expect( doormen.constraintSchema( {
			type: 'strictObject' ,
			properties: {
				a: { type: 'array' , constraints: [ { enforce: 'unique' } ] } ,
				b: { type: 'array' , constraints: [ { enforce: 'unique' } ] }
			}
		} ) ).to.equal( {
			properties: {
				a: { constraints: [ { enforce: 'unique' } ] } ,
				b: { constraints: [ { enforce: 'unique' } ] }
			}
		} ) ;

		expect( doormen.constraintSchema( {
			type: 'strictObject' ,
			properties: {
				a: { type: 'array' , constraints: [ { enforce: 'unique' } ] } ,
				b: { type: 'array' }
			}
		} ) ).to.equal( {
			extraProperties: true ,
			properties: {
				a: { constraints: [ { enforce: 'unique' } ] }
			}
		} ) ;

		expect( doormen.constraintSchema( {
			type: 'strictObject' ,
			properties: {
				a: { type: 'array' , constraints: [ { enforce: 'unique' } ] } ,
				b: { type: 'array' }
			} ,
			constraints: [
				{ enforce: 'something' }
			]
		} ) ).to.equal( {
			extraProperties: true ,
			properties: {
				a: { constraints: [ { enforce: 'unique' } ] }
			} ,
			constraints: [
				{ enforce: 'something' }
			]
		} ) ;
	} ) ;
} ) ;



describe( "Forms" , () => {

	// This test is not up to date... deactivated
	it.skip( "zzz form" , () => {
		var schema , data , form ;
		
		schema = {
			properties: {
				id: { type: 'string' , tags: [ 'id' ] , noInput: true } ,
				firstName: { type: 'string' , tags: [ 'content' ] } ,
				lastName: { type: 'string' , tags: [ 'content' ] } ,
				age: { type: 'integer' , tags: [ 'content' ] } ,
			}
		} ;
		
		data = {
			id: '489312' ,
			firstName: 'Joe' ,
			lastName: 'Doe' ,
			age: 29
		} ;

		// Proxy mode
		
		form = new doormen.Form( schema , data , true ) ;
		//console.log( form ) ;
		console.log( form.shared ) ;

		//form.shared.firstName.value = {} ;
		form.shared.firstName.value = 'Joey' ;
		form.shared.age.value = '33' ;
		console.log( form.getPatch() ) ;


		// .update() mode
		
		form = new doormen.Form( schema , data ) ;
		//console.log( form ) ;
		console.log( form.shared ) ;

		//form.shared.firstName.value = {} ;
		form.shared.firstName.value = 'Joey' ;
		form.shared.age.value = '33' ;
		form.update() ;
		
		console.log( form.getPatch() ) ;
		return ;
	} ) ;
} ) ;



if ( ! process.browser ) {
	var mongodb ;

	try {
		mongodb = require( 'mongodb' ) ;
	}
	catch ( error ) {
		//console.log( 'WARNING: MongoDB module not found, the end of the test is skipped.' ) ;
	}	// skip the remaining tests if the module is not found

	if ( mongodb ) {
		describe( "MongoDB's ObjectId" , () => {

			it( "should validate MongoDB's ObjectId" , () => {
				doormen( { type: 'mongoId' } , '1234567890abcd1234567890' ) ;
				doormen( { type: 'mongoId' } , new mongodb.ObjectId() ) ;
			} ) ;

			it( "should sanitize string to MongoDB's ObjectId" , () => {
				doormen( { instanceOf: mongodb.ObjectId } , doormen( { type: 'mongoId' , sanitize: 'mongoId' } , '1234567890abcd1234567890' ) ) ;
			} ) ;
		} ) ;
	}
}


describe( "Misc" , () => {

	it( "should support custom data in the schema for third party lib" , () => {

		doormen(
			{ a: 1 , b: 'text' } ,
			{
				custom: 'field' ,
				another: { custom: 'field' } ,
				properties: {
					a: {
						type: 'number' ,
						yet: 'another custom field'
					} ,
					b: {
						type: 'string'
					}
				}
			}
		) ;
	} ) ;

	it( "real world use case" , () => {
		doormen.typeCheckers.password = function( data ) {
			if ( typeof data !== 'string' ) { return false ; }
			if ( data.length < 8 ) { return false ; }
			if ( ! data.match( /[a-z]/ ) || ! data.match( /[A-Z]/ ) || ! data.match( /[0-9.,;!?*%$#+-]/ ) ) { return false ; }
			return true ;
		} ;

		var userSchema = {
			type: 'object' ,
			properties: {
				id: { type: 'string' } ,
				name: {
					type: 'string' ,
					minLength: 2 ,
					maxLength: 50
				} ,
				email: { type: 'email' } ,
				password: { type: 'password' } ,
				contact: {
					optional: true ,
					type: 'object' ,
					properties: {
						address: { optional: true , type: 'string' } ,
						phone: { optional: true , type: 'string' } ,
						fax: { optional: true , type: 'string' }
					}
				} ,
				custom: {
					optional: true ,
					type: 'object' ,
					of: { type: 'string' }
				}
			}
		} ;

		doormen( userSchema , {
			id: 'alacon' ,
			name: 'Doug' ,
			email: 'doug@java.net' ,
			password: 'myJavaCodeIsFasterThanYourC!'
		} ) ;

		doormen( userSchema , {
			id: 'alanoix' ,
			name: 'Étienne Jabert' ,
			email: 'etienne-jabert@java.net' ,
			password: 'superJabert!' ,
			contact: {
				fax: '0142559833'
			}
		} ) ;
	} ) ;
} ) ;



describe( "Historical bugs" , () => {

	it( "should fix the bug where NaN creates useless patch" , () => {
		var schema = {
			properties: {
				a: {
					type: 'number' ,
					sanitize: 'toNumber'
				}
			}
		} ;

		var patch = {} ;
		doormen( { patch } , schema , { a: NaN } ) ;
		//log( "Patch: %Y" , patch ) ;
		doormen.equals( patch , {} ) ;
	} ) ;

	it( "should fix the bug where patching array create patch's path with bracket instead of dot" , () => {
		var schema = {
			properties: {
				array: {
					type: 'array' ,
					of: {
						type: 'strictObject' ,
						properties: {
							a: {
								type: 'number' ,
								sanitize: 'toNumber'
							}
						}
					}
				}
			}
		} ;

		var patch = {} ;
		doormen( { patch } , schema , { array: [ { a: "123" } ] } ) ;
		//log( "Patch: %Y" , patch ) ;
		doormen.equals( patch , { "array.0.a": 123 } ) ;
	} ) ;
} ) ;

