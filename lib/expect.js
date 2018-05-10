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



//var AssertionError = require( './AssertionError.js' ) ;
var assert = require( './assert.js' ) ;



function Expect( value , expectationType , ... args ) {

	// Direct usage, e.g.: expect( actual , "to equal" , expected )
	if ( expectationType ) {
		if ( ! assert[ expectationType ] ) {
			throw new Error( "Unknown expectationType '" + expectationType + "'." ) ;
		}

		return assert[ expectationType ]( Expect , value , ... args ) ;
	}

	// Sadly, Proxy are not callable on regular object, so the target has to be a function.
	// The name is purposedly the same.
	var assertion = function Expect() {} ;	// eslint-disable-line no-shadow
	assertion.value = value ;
	assertion.expectationType = null ;
	assertion.extra = null ;	// Extra-values, for function arguments
	assertion.proxy = new Proxy( assertion , handler ) ;

	return assertion.proxy ;
}

module.exports = Expect ;



Expect.prototype.inspect = function() { return this ; } ;
Expect.prototype.toString = function() { return '' + this ; } ;



var expectation = {} ;



expectation['with args'] =
expectation.with =
expectation.args =
expectation.withArgs = ( expect , ... args ) => {
	if ( ! expect.extra ) { expect.extra = [ null , ... args ] ; }
	else { expect.extra = [ expect.extra[ 0 ] , ... args ] ; }
} ;



var handler = {
	get: ( target , property ) => {
		//console.error( "Getting:" , property ) ;

		if ( typeof property === 'string' && ! Function.prototype[ property ] && ! Object.prototype[ property ] && ! Expect.prototype[ property ] ) {
			//console.error( ">>> inside" ) ;
			if ( target.expectationType ) { target.expectationType += ' ' + property ; }
			else { target.expectationType = property ; }

			return target.proxy ;
		}

		if ( Expect.prototype[ property ] && ! target[ property ] ) {
			target[ property ] = Expect.prototype[ property ] ;
		}

		if ( typeof target[ property ] === 'function' ) {
			return target[ property ].bind( target ) ;
		}

		return target[ property ] ;
	} ,
	apply: ( target , thisArg , args ) => {
		var fn ;

		fn = expectation[ target.expectationType ] ;

		if ( fn ) {
			// Composition operators
			target.expectationType = null ;
			fn( target , ... args ) ;
			return target.proxy ;
		}

		fn = assert[ target.expectationType ] ;

		if ( ! fn ) {
			throw new Error( "Unknown expectationType '" + target.expectationType + "'." ) ;
		}

		if ( fn.extra ) {
			return fn( handler.apply , target.value , target.extra , ... args ) ;
		}

		return fn( handler.apply , target.value , ... args ) ;

	}
} ;

