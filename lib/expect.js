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



function Expect( value , comparison , ... args ) {
	
	// Direct usage, e.g.: expect( actual , "to equal" , expected )
	if ( comparison ) {
		if ( ! assert[ comparison ] ) {
			throw new Error( "Unknown comparison '" + comparison + "'." ) ;
		}
		
		return assert[ comparison ]( value , ... args ) ;
	}
	
	// Sadly, Proxy are not callable on regular object, so the target has to be a function.
	// The name is purposedly the same.
	var assertion = function Expect() {} ;	// eslint-disable-line no-shadow
	assertion.value = value ;
	assertion.comparison = null ;
	
	return new Proxy( assertion , handler ) ;
}

module.exports = Expect ;



Expect.prototype.inspect = function() { return this ; } ;
Expect.prototype.toString = function() { return '' + this ; }



var handler = {
	get: ( target , property , receiver ) => {
		console.error( "Getting:" , property ) ;
		
		if ( typeof property === 'string' && ! Function.prototype[ property ] && ! Object.prototype[ property ] && ! Expect.prototype[ property ] ) {
			console.error( ">>> inside" ) ;
			console.error( " receiver:" , receiver ) ;
			if ( target.comparison ) { target.comparison += ' ' + property ; }
			else { target.comparison = property ; }
			
			return receiver ;
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
		console.error( ">>> APPLY" ) ;
		if ( ! assert[ target.comparison ] ) {
			throw new Error( "Unknown comparison '" + target.comparison + "'." ) ;
		}
		
		return assert[ target.comparison ]( target.value , ... args ) ;
	}
} ;


var assert = {} ;

assert[ 'to be' ] = ( actual , expected ) => {
	if ( actual !== expected ) {
		throw new Error( 'Not equals!' ) ;
	}
} ;

