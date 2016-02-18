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



//mask( schema , data , criteria )
function mask( schema , data , criteria )
{
	if ( ! schema || typeof schema !== 'object' )
	{
		throw new TypeError( 'Bad schema, it should be an object or an array of object!' ) ;
	}
	
	if ( ! criteria || typeof criteria !== 'object' ) { criteria = {} ; }
	
	var context = {
		tier: criteria.tier ,
		tags: criteria.tags ,
		iterate: iterate ,
		check: mask.check
	} ;
	
	return context.iterate( schema , data ) ;
}

module.exports = mask ;



function iterate( schema , data_ )
{
	var i , key , data = data_ , src , returnValue , checkValue ;
	
	if ( ! schema || typeof schema !== 'object' ) { return ; }
	
	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) )
	{
		for ( i = 0 ; i < schema.length ; i ++ )
		{
			try {
				data = mask( schema[ i ] , data_ ) ;
			}
			catch( error ) {
				continue ;
			}
			
			return data ;
		}
		
		return ;
	}
	
	
	// 1) Mask
	checkValue = this.check( schema ) ;
	
	if ( checkValue === false ) { return ; }
	else if ( checkValue === true ) { return data ; }
	// if it's undefined, then recursivity can be checked
	
	// 2) Recursivity
	
	if ( schema.of && typeof schema.of === 'object' )
	{
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) ) { return data ; }
		
		if ( Array.isArray( data ) )
		{
			if ( data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }
			
			for ( i = 0 ; i < src.length ; i ++ )
			{
				data[ i ] = this.iterate( schema.of , src[ i ] ) ;
			}
		}
		else
		{
			if ( data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }
			
			for ( key in src )
			{
				data[ key ] = this.iterate( schema.of , src[ key ] ) ;
			}
		}
	}
	
	if ( schema.properties && typeof schema.properties === 'object' )
	{
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) ) { return data ; }
		
		if ( data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }
		
		if ( Array.isArray( schema.properties ) )
		{
			for ( i = 0 ; i < schema.properties.length ; i ++ )
			{
				key = schema.properties[ i ] ;
				data[ key ] = src[ key ] ;
			}
		}
		else
		{
			for ( key in schema.properties )
			{
				if ( ! schema.properties[ key ] || typeof schema.properties[ key ] !== 'object' )
				{
					continue ;
				}
				
				returnValue = this.iterate( schema.properties[ key ] , src[ key ] ) ;
				
				// Do not create new properties with undefined
				if ( returnValue !== undefined ) { data[ key ] = returnValue ; }
			}
		}
	}
	
	if ( Array.isArray( schema.elements ) )
	{
		if ( ! Array.isArray( data ) ) { return data ; }
		
		if ( data === data_ ) { data = [] ; src = data_ ; }
		else { src = data ; }
		
		for ( i = 0 ; i < schema.elements.length ; i ++ )
		{
			data[ i ] = this.iterate( schema.elements[ i ] , src[ i ] ) ;
		}
	}
	
	return data ;
}



mask.check = function maskCheck( schema )
{
	var i , iMax ;
	
	if ( this.tier !== undefined )
	{
		if ( schema.tier === undefined ) { return ; }
		
		if ( this.tier < schema.tier ) { return false ; }
		
		return true ;
	}
	else if ( this.tags )
	{
		if ( ! Array.isArray( schema.tags ) || ! schema.tags.length ) { return ; }
		
		iMax = this.tags.length ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( schema.tags.indexOf( this.tags[ i ] ) !== -1 ) { return true ; }
		}
		
		return false ;
	}
	
	return ;
} ;


