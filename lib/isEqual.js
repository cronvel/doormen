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



/*
	Should be FAST! Some critical application part are depending on it.
	When a reporter will be coded, it should be plugged in a way that do not slow down it.
*/
function isEqual( left , right , extra )
{
	var index , key , leftIndexOf , rightIndexOf , r ;
	
	if ( ! extra )
	{
		extra = {
			leftStack: [],
			rightStack: []
		} ;
	}
	
	// If it's strictly equals, then early exit now.
	if ( left === right ) { return true ; }
	
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
		leftIndexOf = extra.leftStack.indexOf( left ) ;
		rightIndexOf = extra.rightStack.indexOf( right ) ;
		
		if ( leftIndexOf >= 0 ) { extra.leftCircular = true ; }
		if ( rightIndexOf >= 0 ) { extra.rightCircular = true ; }
		
		if ( extra.leftCircular && extra.rightCircular ) { return true ; }
		
		if ( Array.isArray( left ) )
		{
			// Arrays
			if ( ! Array.isArray( right ) || left.length !== right.length ) { return false ; }
			
			for ( index = 0 ; index < left.length ; index ++ )
			{
				if ( left[ index ] === right[ index ] ) { continue ; }
				
				extra.leftStack.push( left ) ;
				extra.rightStack.push( right ) ;
				
				r = isEqual( left[ index ] , right[ index ] , {
					leftStack: extra.leftStack,
					rightStack: extra.rightStack,
					leftCircular: extra.leftCircular,
					rightCircular: extra.rightCircular
				} ) ;
				
				if ( ! r ) { return false ; }
				
				extra.leftStack.pop() ;
				extra.rightStack.pop() ;
			}
		}
		else
		{
			// Objects
			if ( Array.isArray( right ) ) { return false ; }
			
			for ( key in left )
			{
				if ( left[ key ] === undefined ) { continue ; }	// undefined and no key are the same
				if ( right[ key ] === undefined ) { return false ; }
				if ( left[ key ] === right[ key ] ) { continue ; }
				
				extra.leftStack.push( left ) ;
				extra.rightStack.push( right ) ;
				
				r = isEqual( left[ key ] , right[ key ] , {
					leftStack: extra.leftStack,
					rightStack: extra.rightStack,
					leftCircular: extra.leftCircular,
					rightCircular: extra.rightCircular
				} ) ;
				
				if ( ! r ) { return false ; }
				
				extra.leftStack.pop() ;
				extra.rightStack.pop() ;
			}
			
			for ( key in right )
			{
				if ( right[ key ] === undefined ) { continue ; }	// undefined and no key are the same
				if ( left[ key ] === undefined ) { return false ; }
				// No need to check equality: already done in the previous loop
			}
		}
		
		return true ;
	}
	
	return false ;
}



module.exports = isEqual ;


