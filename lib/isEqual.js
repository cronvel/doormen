/*
	Doormen

	Copyright (c) 2015 - 2019 Cédric Ronvel

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



const EPSILON_DELTA_RATE = 1 + 4 * Number.EPSILON ;
const EPSILON_ZERO_DELTA = 4 * Number.MIN_VALUE ;

/*
	Should be FAST! Some critical application part are depending on it.
	When a reporter will be coded, it should be plugged in a way that does not slow it down.

	Options:
		like: if true, the prototype of object are not compared
		oneWay: if true, check partially, e.g.:
			{ a: 1 , b: 2 } and { a: 1 , b: 2 , c: 3 } DOES pass the test
			but the reverse { a: 1 , b: 2 , c: 3 } and { a: 1 , b: 2 } DOES NOT pass the test
*/
function isEqual( left , right , like , oneWay , around ) {
	var runtime = {
		leftStack: [] ,
		rightStack: [] ,
		like: !! like ,
		oneWay: !! oneWay ,
		around: !! around
	} ;

	return isEqual_( runtime , left , right ) ;
}



function isEqual_( runtime , left , right ) {
	var index , indexMax , keys , key , leftIndexOf , rightIndexOf , recursiveTest ,
		valueOfLeft , valueOfRight , leftProto , rightProto , leftConstructor , rightConstructor ;

	// If it's strictly equals, then early exit now.
	if ( left === right ) { return true ; }

	// If the type mismatch exit now.
	if ( typeof left !== typeof right ) { return false ; }

	// Below, left and rights have the same type

	if ( typeof left === 'number' ) {
		// NaN check
		if ( Number.isNaN( left ) && Number.isNaN( right ) ) { return true ; }

		// Epsilon error
		if ( runtime.around ) {
			if ( left === 0 || right === 0 ) {
				if ( left <= right + EPSILON_ZERO_DELTA && right <= left + EPSILON_ZERO_DELTA ) { return true ; }
			}
			else if ( left <= right * EPSILON_DELTA_RATE && right <= left * EPSILON_DELTA_RATE ) { return true ; }
		}
	}

	// Should comes after the number check
	// If one is truthy and the other falsy, early exit now
	// It is an important test since it catch the "null is an object" case that can confuse things later
	if ( ! left !== ! right ) { return false ; }

	// Should come after the NaN check
	if ( ! left ) { return false ; }

	// Objects and arrays
	if ( typeof left === 'object' ) {
		// First, check circular references
		leftIndexOf = runtime.leftStack.indexOf( left ) ;
		rightIndexOf = runtime.rightStack.indexOf( right ) ;

		if ( leftIndexOf >= 0 ) { runtime.leftCircular = true ; }
		if ( rightIndexOf >= 0 ) { runtime.rightCircular = true ; }

		if ( runtime.leftCircular && runtime.rightCircular ) { return true ; }

		if ( ! runtime.like && Object.getPrototypeOf( left ) !== Object.getPrototypeOf( right ) ) { return false ; }

		if ( Array.isArray( left ) ) {
			// Arrays
			if ( ! Array.isArray( right ) || left.length !== right.length ) { return false ; }

			for ( index = 0 , indexMax = left.length ; index < indexMax ; index ++ ) {
				if ( left[ index ] === right[ index ] ) { continue ; }

				runtime.leftStack.push( left ) ;
				runtime.rightStack.push( right ) ;
				recursiveTest = isEqual_( runtime , left[ index ] , right[ index ] ) ;
				//if ( ! recursiveTest ) { return false ; }
				runtime.leftStack.pop() ;
				runtime.rightStack.pop() ;
				if ( ! recursiveTest ) { return false ; }
			}
		}
		else if ( Buffer.isBuffer( left ) ) {
			return Buffer.isBuffer( right ) && left.equals( right ) ;
		}
		else {
			// Objects
			if ( Array.isArray( right ) ) { return false ; }

			if ( typeof left.valueOf === 'function' && typeof right.valueOf === 'function' ) {
				valueOfLeft = left.valueOf() ;
				valueOfRight = right.valueOf() ;

				if ( valueOfLeft !== left && valueOfRight !== right ) {
					leftProto = Object.getPrototypeOf( left ) ;
					leftConstructor = leftProto && leftProto.constructor ;
					rightProto = Object.getPrototypeOf( right ) ;
					rightConstructor = rightProto && rightProto.constructor ;

					// We only compare .valueOf() if the prototype are compatible
					if (
						leftConstructor && rightConstructor &&
						( leftConstructor === rightConstructor || ( left instanceof rightConstructor ) || ( right instanceof leftConstructor ) )
					) {
						// .valueOf() must return a primitive value, so we wouldn't have to call recursively,
						// but there are NaN check to be performed, and nothing prevent userland from returning an object...

						runtime.leftStack.push( left ) ;
						runtime.rightStack.push( right ) ;
						recursiveTest = isEqual_( runtime , valueOfLeft , valueOfRight ) ;
						//if ( ! recursiveTest ) { return false ; }
						runtime.leftStack.pop() ;
						runtime.rightStack.pop() ;
						if ( ! recursiveTest ) { return false ; }
					}
				}
			}

			keys = Object.keys( left ) ;

			for ( index = 0 , indexMax = keys.length ; index < indexMax ; index ++ ) {
				key = keys[ index ] ;

				if ( left[ key ] === undefined ) { continue ; }			// undefined and no key are considered the same
				if ( right[ key ] === undefined ) { return false ; }
				if ( left[ key ] === right[ key ] ) { continue ; }

				runtime.leftStack.push( left ) ;
				runtime.rightStack.push( right ) ;
				recursiveTest = isEqual_( runtime , left[ key ] , right[ key ] ) ;
				//if ( ! recursiveTest ) { return false ; }
				runtime.leftStack.pop() ;
				runtime.rightStack.pop() ;
				if ( ! recursiveTest ) { return false ; }
			}

			if ( ! runtime.oneWay ) {
				keys = Object.keys( right ) ;

				for ( index = 0 , indexMax = keys.length ; index < indexMax ; index ++ ) {
					key = keys[ index ] ;

					if ( right[ key ] === undefined ) { continue ; }		// undefined and no key are considered the same
					if ( left[ key ] === undefined ) { return false ; }
					// No need to check equality: already done in the previous loop
				}
			}
		}

		return true ;
	}

	return false ;
}

module.exports = isEqual ;

