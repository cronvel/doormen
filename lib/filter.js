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



// Load modules
var doormen = require( './doormen.js' ) ;



module.exports = {
	
	equals: function equals( data , arg )
	{
		if ( data === arg ) { return true ; }
		if ( typeof data === 'number' && typeof arg === 'number' && isNaN( data ) && isNaN( arg ) ) { return true ; }
		return false ;
	} ,
	
	/*
	min: function min( data , arg )
	{
		if ( typeof arg !== 'number' )
		{
			throw new doormen.SchemaError( "Bad schema (at " + messagePath + "), 'min' should be a number." ) ;
		}
		
		// Negative test here, because of NaN
		if ( typeof data !== 'number' || ! ( data >= arg ) )	// jshint ignore:line
		{
			throw new doormen.ValidatorError( messagePath + " is not greater than or equals to " + arg + "." ) ;
		}
		
		
		if ( data === arg ) { return true ; }
		if ( typeof data === 'number' && typeof arg === 'number' && isNaN( data ) && isNaN( arg ) ) { return true ; }
		return false ;
	}
	*/
} ;


