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



var sanitizer = {} ;
module.exports = sanitizer ;



			/* Cast sanitizers */



sanitizer.toNumber = function toNumber( data )
{
	if ( typeof data === 'number' ) { return data ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return parseFloat( data ) ; }
	else { return NaN ; }
} ;



sanitizer.toArray = function toArray( data )
{
	if ( Array.isArray( data ) ) { return data ; }
	
	if ( data === undefined ) { return [] ; }
	
	if ( data && typeof data === 'object' && doormen.typeChecker.arguments( data ) )
	{
		return Array.prototype.slice.call( data ) ;
	}
	
	return [ data ] ;
} ;



			/* Object sanitizers */



sanitizer.removeExtraProperties = function( data , schema , clone )
{
	var i , key , newData ;
	
	if (
		! data || ( typeof data !== 'object' && typeof data !== 'function' ) ||
		! schema.properties || typeof schema.properties !== 'object'
	)
	{
		return data ;
	}
	
	if ( clone )
	{
		newData = Array.isArray( data ) ? data.slice() : {} ;
		
		if ( Array.isArray( schema.properties ) )
		{
			for ( i = 0 ; i < schema.properties.length ; i ++ )
			{
				key = schema.properties[ i ] ;
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}
		else
		{
			for ( key in schema.properties )
			{
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}
		
		return newData ;
	}
	else
	{
		if ( Array.isArray( schema.properties ) )
		{
			for ( key in data )
			{
				if ( schema.properties.indexOf( key ) === -1 ) { delete data[ key ] ; }
			}
		}
		else
		{
			for ( key in data )
			{
				if ( ! ( key in schema.properties ) ) { delete data[ key ] ; }
			}
		}
		
		return data ;
	}
} ;



			/* String sanitizers */



sanitizer.trim = function trim( data )
{
	if ( typeof data === 'string' ) { return data.trim() ; }
	else { return data ; }
} ;



sanitizer.toUpperCase = function toUpperCase( data )
{
	if ( typeof data === 'string' ) { return data.toUpperCase() ; }
	else { return data ; }
} ;



sanitizer.toLowerCase = function toLowerCase( data )
{
	if ( typeof data === 'string' ) { return data.toLowerCase() ; }
	else { return data ; }
} ;



sanitizer.dashToCamelCase = function dashToCamelCase( data )
{
	if ( typeof data !== 'string' ) { return data ; }
	
	return data.replace( /-(.)/g , function( match , letter ) {
		return letter.toUpperCase();
	} ) ;
} ;



			/* Misc sanitizers */



// Convert a string to a MongoDB ObjectID
sanitizer.mongoId = function mongoId( data )
{
	if ( typeof data !== 'string' ) { return data ; }
	if ( doormen.isBrowser ) { return data ; }
	
	try {
		var mongodb = require( 'mongodb' ) ;
		return mongodb.ObjectID( data ) ;
	}
	catch ( error ) {
		return data ;
	}
} ;



			/* RestQuery specific sanitizer */



// Create a random slug for restQuery
sanitizer.restQueryRandomSlug = function restQueryRandomSlug( data )
{
	if ( data !== undefined && data !== null ) { return data ; }
	return Math.random().toString( 36 ).slice( 2 ) + '-' + Date.now().toString( 36 ) ;
} ;


