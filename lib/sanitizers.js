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



const latinize = require( 'string-kit/lib/latinize.js' ) ;
const toTitleCase = require( 'string-kit/lib/toTitleCase.js' ) ;



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers ) { global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers = {} ; }

const sanitizers = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers ) ;
module.exports = sanitizers ;

const doormen = require( './core.js' ) ;



/* Cast sanitizers */



sanitizers.toString = data => {
	if ( typeof data === 'string' ) { return data ; }

	// Calling .toString() may throw an error
	try {
		return '' + data ;
	}
	catch ( error ) {
		return data ;
	}
} ;



sanitizers.toNumber = data => {
	if ( typeof data === 'number' ) { return data ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return parseFloat( data ) ; }
	return NaN ;
} ;

// For instance, there is no difference between those 2 sanitizers, 'toReal' is still supposed
// to return NaN on non-conforming real, thus will fail for the 'real' type-checker
sanitizers.toFloat = sanitizers.toReal = sanitizers.toNumber ;



sanitizers.toInteger = data => {
	if ( typeof data === 'number' ) { return Math.round( data ) ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return Math.round( parseFloat( data ) ) ; }	// parseInt() is more capricious
	return NaN ;
} ;



sanitizers.toBoolean = data => {
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
		case 'yes' :
		case 'Yes' :
		case 'YES' :
			return true ;
		case 0 :
		case '0' :
		case 'off' :
		case 'Off' :
		case 'OFF' :
		case 'false' :
		case 'False' :
		case 'FALSE' :
		case 'no' :
		case 'No' :
		case 'NO' :
			return false ;
		default :
			return !! data ;
	}
} ;



sanitizers.toArray = data => {
	if ( Array.isArray( data ) ) { return data ; }

	if ( data === undefined ) { return [] ; }

	if ( data && typeof data === 'object' && doormen.typeCheckers.arguments( data ) ) {
		return Array.prototype.slice.call( data ) ;
	}

	return [ data ] ;
} ;



sanitizers.toDate = data => {
	var parsed ;

	if ( data instanceof Date ) { return data ; }

	if ( typeof data === 'number' || typeof data === 'string' || ( data && typeof data === 'object' && data.constructor.name === 'Date' ) ) {
		parsed = new Date( data ) ;
		return isNaN( parsed ) ? data : parsed ;
	}

	return data ;
} ;



/* Object sanitizers */



sanitizers.removeExtraProperties = ( data , schema , clone ) => {
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



sanitizers.trim = data => typeof data === 'string' ? data.trim() : data ;

sanitizers.toUpperCase = data => typeof data === 'string' ? data.toUpperCase() : data ;

sanitizers.toLowerCase = data => typeof data === 'string' ? data.toLowerCase() : data ;

sanitizers.capitalize = data => typeof data === 'string' ? toTitleCase( data , sanitizers.capitalize.toTitleCaseOptions ) : data ;
sanitizers.capitalize.toTitleCaseOptions = {} ;

sanitizers.titleCase = data => typeof data === 'string' ? toTitleCase( data , sanitizers.titleCase.toTitleCaseOptions ) : data ;
sanitizers.titleCase.toTitleCaseOptions = { zealous: 1 , preserveAllCaps: true } ;

sanitizers.latinize = data => typeof data === 'string' ? latinize( data ) : data ;

sanitizers.dashToCamelCase = data => typeof data === 'string' ? data.replace( /-(.)/g , ( match , letter ) => letter.toUpperCase() ) : data ;



/* Filter compliance sanitizers */



function padding( data , schema , count ) {
	if ( schema.leftPadding ) {
		return schema.leftPadding[ 0 ].repeat( count ) + data ;
	}

	if ( schema.rightPadding ) {
		return data + schema.rightPadding[ 0 ].repeat( count ) ;
	}

	// Else, pad with space to the right...
	return data + ' '.repeat( count ) ;
}



// Resize a string (later: various other data, like array and Buffer?)
// It is used to comply to filters: length, maxLength and minLength.
// To enlarge, it used the subSchema.padding property, or a space if not found.
sanitizers.resize = ( data , schema ) => {
	if ( typeof data !== 'string' ) { return data ; }

	if ( schema.length ) {
		if ( data.length > schema.length ) { return data.slice( 0 , schema.length ) ; }
		if ( data.length < schema.length ) { return padding( data , schema , schema.length - data.length ) ; }
		return data ;
	}

	if ( schema.maxLength && data.length > schema.maxLength ) {
		return data.slice( 0 , schema.maxLength ) ;
	}

	if ( schema.minLength && data.length < schema.minLength ) {
		return padding( data , schema , schema.minLength - data.length ) ;
	}

	return data ;
} ;



/* Misc sanitizers */



sanitizers.nullToUndefined = data => data === null ? undefined : data ;



/* Third party sanitizers */



// We will fool browser's builders, avoiding discovery of unwanted third party modules
const req = id => require( id ) ;



// Convert a string to a MongoDB ObjectID
sanitizers.mongoId = data => {
	if ( typeof data !== 'string' ) { return data ; }
	if ( doormen.isBrowser ) { return data ; }

	try {
		let mongodb = req( 'mongodb' ) ;
		// mongodb ≥ 5 has ObjectId, mongodb ≤ 4 has ObjectID
		return mongodb.ObjectId ? new mongodb.ObjectId( data ) : new mongodb.ObjectID( data ) ;
	}
	catch ( error ) {
		return data ;
	}
} ;

