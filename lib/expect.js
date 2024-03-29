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

"use strict" ;



const assert = require( './assert.js' ) ;
const AssertionError = require( './AssertionError.js' ) ;



const ExpectPrototype = {} ;
ExpectPrototype.inspect = function() { return this ; } ;
ExpectPrototype.toString = function() { return '' + this ; } ;



function factory( hooks = {} ) {

	var ExpectFn = function Expect( value , expectationType , ... args ) {
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

		if ( arguments.length ) { assertion.value = value ; }
		else { assertion.value = assert.NONE ; }

		assertion.expectationType = null ;
		assertion.fnArgs = null ;	// Extra-values, for function arguments
		assertion.isPromise = false ;	// true if it is asynchronous
		assertion.each = false ;
		assertion.expectFn = ExpectFn ;
		assertion.proxy = new Proxy( assertion , handler ) ;

		return assertion.proxy ;
	} ;

	ExpectFn.hooks = hooks ;
	ExpectFn.stats = {
		ok: 0 ,
		fail: 0
	} ;
	ExpectFn.prototype = ExpectPrototype ;

	// expect.each() function
	ExpectFn.each = function ExpectEach( values , expectationType , ... args ) {
		values = assert._toArrayOfValues( values ) ;

		// Direct usage, e.g.: expect( actual , "to equal" , expected )
		if ( expectationType ) {
			if ( ! assert[ expectationType ] ) {
				throw new Error( "Unknown expectationType '" + expectationType + "'." ) ;
			}

			return values.forEach( value => assert[ expectationType ]( ExpectEach , value , ... args ) ) ;
		}

		// Sadly, Proxy are not callable on regular object, so the target has to be a function.
		// The name is purposedly the same.
		var assertion = function Expect() {} ;	// eslint-disable-line no-shadow

		if ( arguments.length ) { assertion.value = values ; }
		else { assertion.value = assert.NONE ; }

		assertion.expectationType = null ;
		assertion.fnArgs = null ;	// Extra-values, for function arguments
		assertion.isPromise = false ;	// true if it is asynchronous
		assertion.each = true ;
		assertion.expectFn = ExpectFn ;	// not ExpectFn.each, it's used for stats
		assertion.proxy = new Proxy( assertion , handler ) ;

		return assertion.proxy ;
	} ;

	return ExpectFn ;
}



module.exports = factory() ;
module.exports.factory = factory ;



var expectation = {} ;

// Set arguments for a function call
expectation['with args'] =
expectation.with =
expectation.args =
expectation.withArgs = ( expect , ... args ) => {
	if ( ! expect.fnArgs ) { expect.fnArgs = [ null , ... args ] ; }
	else { expect.fnArgs = [ expect.fnArgs[ 0 ] , ... args ] ; }
} ;

// Set the 'this' binding of a method
expectation['method of'] = ( expect , object ) => {
	if ( ! expect.fnArgs ) { expect.fnArgs = [ object ] ; }
	else { expect.fnArgs[ 0 ] = object ; }

	if ( typeof expect.value !== 'function' ) {
		expect.value = object[ expect.value ] ;
	}
} ;



var handler = {
	get: ( target , property ) => {
		// First, check special flags
		if ( property === 'eventually' ) {
			target.isPromise = true ;
			return target.proxy ;
		}

		if ( typeof property === 'string' && ! Function.prototype[ property ] && ! Object.prototype[ property ] && ! ExpectPrototype[ property ] ) {
			if ( target.expectationType ) { target.expectationType += ' ' + property ; }
			else { target.expectationType = property ; }

			return target.proxy ;
		}

		if ( ExpectPrototype[ property ] && ! target[ property ] ) {
			target[ property ] = ExpectPrototype[ property ] ;
		}

		if ( typeof target[ property ] === 'function' ) {
			return target[ property ].bind( target ) ;
		}

		return target[ property ] ;
	} ,
	apply: ( target , thisArg , args ) => {
		var fn , promise , traceError ;

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

		if ( target.isPromise ) {
			if ( ! fn.promise ) {
				// If it's a promise, resolve it and then call the proxy again

				// First keep the stack trace
				traceError = new Error() ;
				if ( Error.captureStackTrace ) { Error.captureStackTrace( traceError , handler.apply ) ; }

				if ( target.each ) {
					promise = Promise.all( target.value ) ;
				}
				else {
					promise = Promise.resolve( target.value ) ;
				}

				return promise.then(
					value => {
						target.value = value ;
						target.isPromise = false ;
						target.proxy( ... args ) ;
					} ,
					() => {
						target.expectFn.stats.fail ++ ;
						if ( target.expectFn.hooks.fail ) { target.expectFn.hooks.fail() ; }
						throw AssertionError.create( traceError , target.value , null , "to resolve" ) ;
					}
				) ;
			}

			if ( typeof fn.promise === 'function' ) { fn = fn.promise ; }
		}

		if ( fn.async ) {
			// First keep the stack trace
			traceError = new Error() ;
			if ( Error.captureStackTrace ) { Error.captureStackTrace( traceError , handler.apply ) ; }

			if ( fn.fnParams ) {
				if ( target.each ) {
					promise = Promise.all( target.value.map( value => fn( traceError , value , target.fnArgs , ... args ) ) ) ;
				}
				else {
					promise = fn( traceError , target.value , target.fnArgs , ... args ) ;
				}
			}
			else if ( target.each ) {
				promise = Promise.all( target.value.map( value => fn( traceError , value , ... args ) ) ) ;
			}
			else {
				promise = fn( traceError , target.value , ... args ) ;
			}

			return promise.then(
				() => {
					target.expectFn.stats.ok ++ ;
					if ( target.expectFn.hooks.ok ) { target.expectFn.hooks.ok() ; }
				} ,
				error => {
					target.expectFn.stats.fail ++ ;
					if ( target.expectFn.hooks.fail ) { target.expectFn.hooks.fail() ; }
					throw error ;
				}
			) ;
		}

		try {
			if ( fn.fnParams ) {
				if ( target.each ) {
					target.value.forEach( value => fn( handler.apply , value , target.fnArgs , ... args ) ) ;
				}
				else {
					fn( handler.apply , target.value , target.fnArgs , ... args ) ;
				}
			}
			else if ( target.each ) {
				target.value.forEach( value => fn( handler.apply , value , ... args ) ) ;
			}
			else {
				fn( handler.apply , target.value , ... args ) ;
			}

			target.expectFn.stats.ok ++ ;
			if ( target.expectFn.hooks.ok ) { target.expectFn.hooks.ok() ; }
		}
		catch ( error ) {
			target.expectFn.stats.fail ++ ;
			if ( target.expectFn.hooks.fail ) { target.expectFn.hooks.fail() ; }
			throw error ;
		}
	}
} ;

