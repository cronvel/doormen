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

"use strict" ;



/*
	Should be FAST! Some critical application part are depending on it.
	When a reporter will be coded, it should be plugged in a way that does not slow down it.
*/
function isEqual( left , right )
{
	var runtime = {
		leftStack: [],
		rightStack: []
	} ;
	
	return isEqual_( left , right , runtime ) ;
}


	
function isEqual_( left , right , runtime )
{
	var index , key , leftIndexOf , rightIndexOf , r ;
	
	// If it's strictly equals, then early exit now.
	if ( left === right ) { return true ; }
	
	// If one is truthy and the other falsy, early exit now
	// It is an important test since it catch the "null is an object" case that can confuse things later
	if ( ! left !== ! right ) { return false ; }	// jshint ignore:line
	
	// If the type mismatch exit now.
	if ( typeof left !== typeof right ) { return false ; }
	
	// Below, left and rights have the same type
	
	// NaN check
	if ( typeof left === 'number' && isNaN( left ) && isNaN( right ) ) { return true ; }
	
	// Should come after the NaN check
	if ( ! left ) { return false ; }
	
	// Objects and arrays
	if ( typeof left === 'object' )
	{
		// First, check circular references
		leftIndexOf = runtime.leftStack.indexOf( left ) ;
		rightIndexOf = runtime.rightStack.indexOf( right ) ;
		
		if ( leftIndexOf >= 0 ) { runtime.leftCircular = true ; }
		if ( rightIndexOf >= 0 ) { runtime.rightCircular = true ; }
		
		if ( runtime.leftCircular && runtime.rightCircular ) { return true ; }
		
		if ( Array.isArray( left ) )
		{
			// Arrays
			if ( ! Array.isArray( right ) || left.length !== right.length ) { return false ; }
			
			for ( index = 0 ; index < left.length ; index ++ )
			{
				if ( left[ index ] === right[ index ] ) { continue ; }
				
				runtime.leftStack.push( left ) ;
				runtime.rightStack.push( right ) ;
				
				r = isEqual_( left[ index ] , right[ index ] , runtime ) ;
				
				if ( ! r ) { return false ; }
				
				runtime.leftStack.pop() ;
				runtime.rightStack.pop() ;
			}
		}
		else
		{
			// Objects
			if ( Array.isArray( right ) ) { return false ; }
			
			for ( key in left )
			{
				if ( left[ key ] === undefined ) { continue ; }	// undefined and no key are considered the same
				if ( right[ key ] === undefined ) { return false ; }
				if ( left[ key ] === right[ key ] ) { continue ; }
				
				runtime.leftStack.push( left ) ;
				runtime.rightStack.push( right ) ;
				
				r = isEqual_( left[ key ] , right[ key ] , runtime ) ;
				
				if ( ! r ) { return false ; }
				
				runtime.leftStack.pop() ;
				runtime.rightStack.pop() ;
			}
			
			for ( key in right )
			{
				if ( right[ key ] === undefined ) { continue ; }	// undefined and no key are considered the same
				if ( left[ key ] === undefined ) { return false ; }
				// No need to check equality: already done in the previous loop
			}
		}
		
		return true ;
	}
	
	return false ;
}



module.exports = isEqual ;


