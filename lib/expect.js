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



function expect( value ) {
	var assertion = {
		value: value ,
		comparison: null
	} ;
	
	return new Proxy( assertion , handler ) ;
}

module.exports = expect ;



var passThrough = {
	inspect: true
} ;



var handler = {
	get: ( target , property , receiver ) => {
		console.error( "Getting:" , property ) ;
		
		if ( typeof property === 'string' && ! passThrough[ property ] ) {
			console.error( "receiver:" , receiver ) ;
			if ( target.comparison ) { target.comparison += ' ' + property ; }
			else { target.comparison = property ; }
			
			return receiver ;
		}
		
		return target[ property ] ;
	} ,
	apply: ( target , thisArg , ... args ) => {
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

