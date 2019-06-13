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



const latinize = require( 'string-kit/lib/latinize.js' ) ;
const toTitleCase = require( 'string-kit/lib/toTitleCase.js' ) ;



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.sanitizer ) { global.DOORMEN_GLOBAL_EXTENSIONS.sanitizer = {} ; }

const sanitizer = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.sanitizer ) ;
module.exports = sanitizer ;

const doormen = require( './doormen.js' ) ;



/* Cast sanitizers */



sanitizer.toString = function( data ) {
	if ( typeof data === 'string' ) { return data ; }

	// Calling .toString() may throw an error
	try {
		return '' + data ;
	}
	catch ( error ) {
		return data ;
	}
} ;



sanitizer.toNumber = function( data ) {
	if ( typeof data === 'number' ) { return data ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return parseFloat( data ) ; }
	return NaN ;
} ;



sanitizer.toBoolean = function( data ) {
	if ( typeof data === 'boolean' ) { return data ; }

	switch ( data ) {
		case 1 :
		case '1' :
		case 'on' :
		case 'On' :
		case 'ON' :
		case 'true' :
		case 'True' :
		case 'TRUE' :
			return true ;
		case 0 :
		case '0' :
		case 'off' :
		case 'Off' :
		case 'OFF' :
		case 'false' :
		case 'False' :
		case 'FALSE' :
			return false ;
		default :
			return !! data ;
	}
} ;



sanitizer.toInteger = function( data ) {
	if ( typeof data === 'number' ) { return Math.round( data ) ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return Math.round( parseFloat( data ) ) ; }	// parseInt() is more capricious
	return NaN ;
} ;



sanitizer.toArray = function( data ) {
	if ( Array.isArray( data ) ) { return data ; }

	if ( data === undefined ) { return [] ; }

	if ( data && typeof data === 'object' && doormen.typeChecker.arguments( data ) ) {
		return Array.prototype.slice.call( data ) ;
	}

	return [ data ] ;
} ;



sanitizer.toDate = function( data ) {
	var parsed ;

	if ( data instanceof Date ) { return data ; }

	if ( typeof data === 'number' || typeof data === 'string' || ( data && typeof data === 'object' && data.constructor.name === 'Date' ) ) {
		parsed = new Date( data ) ;
		return isNaN( parsed ) ? data : parsed ;
	}

	return data ;
} ;



/* Object sanitizers */



sanitizer.removeExtraProperties = function( data , schema , clone ) {
	var i , key , newData ;

	if (
		! data || ( typeof data !== 'object' && typeof data !== 'function' ) ||
		! schema.properties || typeof schema.properties !== 'object'
	) {
		return data ;
	}

	if ( clone ) {
		newData = Array.isArray( data ) ? data.slice() : {} ;

		if ( Array.isArray( schema.properties ) ) {
			for ( i = 0 ; i < schema.properties.length ; i ++ ) {
				key = schema.properties[ i ] ;
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}
		else {
			for ( key in schema.properties ) {
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}

		return newData ;
	}

	if ( Array.isArray( schema.properties ) ) {
		for ( key in data ) {
			if ( schema.properties.indexOf( key ) === -1 ) { delete data[ key ] ; }
		}
	}
	else {
		for ( key in data ) {
			if ( ! ( key in schema.properties ) ) { delete data[ key ] ; }
		}
	}

	return data ;

} ;



/* String sanitizers */



sanitizer.trim = function( data ) {
	if ( typeof data === 'string' ) { return data.trim() ; }
	return data ;
} ;



sanitizer.toUpperCase = function( data ) {
	if ( typeof data === 'string' ) { return data.toUpperCase() ; }
	return data ;
} ;



sanitizer.toLowerCase = function( data ) {
	if ( typeof data === 'string' ) { return data.toLowerCase() ; }
	return data ;
} ;



sanitizer.capitalize = function( data ) {
	if ( typeof data === 'string' ) { return toTitleCase( data , sanitizer.capitalize.toTitleCaseOptions ) ; }
	return data ;
} ;

sanitizer.capitalize.toTitleCaseOptions = {} ;



sanitizer.titleCase = function( data ) {
	if ( typeof data === 'string' ) { return toTitleCase( data , sanitizer.titleCase.toTitleCaseOptions ) ; }
	return data ;
} ;

sanitizer.titleCase.toTitleCaseOptions = { zealous: 1 , preserveAllCaps: true } ;



sanitizer.latinize = function( data ) {
	if ( typeof data === 'string' ) { return latinize( data ) ; }
	return data ;
} ;



sanitizer.dashToCamelCase = function( data ) {
	if ( typeof data !== 'string' ) { return data ; }

	return data.replace( /-(.)/g , ( match , letter ) => letter.toUpperCase() ) ;
} ;



/* Misc sanitizers */



// Convert a string to a MongoDB ObjectID
sanitizer.mongoId = function( data ) {
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
