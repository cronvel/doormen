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



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers ) { global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers = {} ; }

const typeCheckers = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers ) ;
module.exports = typeCheckers ;

const doormen = require( './core.js' ) ;



// Basic types
// Primitive types
typeCheckers.undefined = data => data === undefined ;
typeCheckers.null = data => data === null ;
typeCheckers.boolean = data => typeof data === 'boolean' ;
typeCheckers.number = data => typeof data === 'number' ;
typeCheckers.string = data => typeof data === 'string' ;
typeCheckers.object = data => data && typeof data === 'object' ;
typeCheckers.function = data => typeof data === 'function' ;

// Built-in type
typeCheckers.array = data => Array.isArray( data ) ;
typeCheckers.error = data => data instanceof Error ;
typeCheckers.date = data => data instanceof Date ;
typeCheckers.arguments = data => Object.prototype.toString.call( data ) === '[object Arguments]' ;

typeCheckers.buffer = data => {
	try {
		// If we run in a browser, this does not exist
		return data instanceof Buffer ;
	}
	catch ( error ) {
		return false ;
	}
} ;

// Mixed
typeCheckers.strictObject = data => data && typeof data === 'object' && ! Array.isArray( data ) ;
typeCheckers.looseObject = data => ( data && typeof data === 'object' ) || typeof data === 'function' ;	// object+function
typeCheckers.classId = data => typeof data === 'function' || ( typeof data === 'string' && data.length ) ;
typeCheckers.unset = data => data === undefined || data === null ;

typeCheckers.regexp = data => {
	if ( data instanceof RegExp ) { return true ; }
	if ( typeof data !== 'string' ) { return false ; }

	try {
		new RegExp( data ) ;
		return true ;
	}
	catch ( error ) {
		return false ;
	}
} ;



typeCheckers.schema = data => {
	try {
		doormen.validateSchema( data ) ;
	}
	catch ( error ) {
		return false ;
	}

	return true ;
} ;



// Meta type of numbers
typeCheckers.real = data => typeof data === 'number' && ! isNaN( data ) && isFinite( data ) ;
typeCheckers.integer = data => typeof data === 'number' && isFinite( data ) && data === Math.round( data ) ;



typeCheckers.hex = data => typeof data === 'string' && /^[0-9a-fA-F]+$/.test( data ) ;



// IP
typeCheckers.ip = ( data , schema ) => typeCheckers.ipv4( data , schema ) || typeCheckers.ipv6( data , schema ) ;



// IPv4
typeCheckers.ipv4 = ( data , schema , skipRegExp ) => {
	var i , parts , tmp ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( ! skipRegExp && ! /^[0-9.]+$/.test( data ) ) { return false ; }

	parts = data.split( '.' ) ;

	if ( parts.length !== 4 ) { return false ; }

	for ( i = 0 ; i < parts.length ; i ++ ) {
		if ( ! parts[ i ].length || parts[ i ].length > 3 ) { return false ; }

		tmp = parseInt( parts[ i ] , 10 ) ;

		// NaN compliant check
		if ( ! ( tmp >= 0 && tmp <= 255 ) ) { return false ; }	// jshint ignore:line
	}

	return true ;
} ;



// IPv6
typeCheckers.ipv6 = ( data , schema , skipRegExp ) => {
	var i , parts , hasDoubleColon = false , startWithDoubleColon = false , endWithDoubleColon = false ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( ! skipRegExp && ! /^[0-9a-f:]+$/.test( data ) ) { return false ; }

	parts = data.split( ':' ) ;

	// 9 instead of 8 because of starting double-colon
	if ( parts.length > 9 && parts.length < 3 ) { return false ; }

	for ( i = 0 ; i < parts.length ; i ++ ) {
		if ( ! parts[ i ].length ) {
			if ( i === 0 ) {
				// an IPv6 can start with a double-colon, but not with a single colon
				startWithDoubleColon = true ;
				if ( parts[ 1 ].length ) { return false ; }
			}
			else if ( i === parts.length - 1 ) {
				// an IPv6 can end with a double-colon, but with a single colon
				endWithDoubleColon = true ;
				if ( parts[ i - 1 ].length ) { return false ; }
			}
			else {
				// the whole IP should have at most one double-colon, for consecutive 0 group
				if ( hasDoubleColon ) { return false ; }
				hasDoubleColon = true ;
			}
		}
		else if ( parts[ i ].length > 4 ) {
			// a group has at most 4 letters of hexadecimal
			return false ;
		}
	}

	if ( parts.length < 8 && ! hasDoubleColon ) { return false ; }
	if ( parts.length - ( startWithDoubleColon ? 1 : 0 ) - ( endWithDoubleColon ? 1 : 0 ) > 8 ) { return false ; }

	return true ;
} ;



typeCheckers.hostname = ( data , schema , skipRegExp ) => {
	var i , parts ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( ! skipRegExp && ! /^[^\s/$?#@:]+$/.test( data ) ) { return false ; }

	parts = data.split( '.' ) ;

	for ( i = 0 ; i < parts.length ; i ++ ) {
		// An hostname can have a '.' after the TLD, but it should not have empty part anywhere else
		if ( ! parts[ i ].length && i !== parts.length - 1 ) { return false ; }

		// A part cannot exceed 63 chars
		if ( parts[ i ].length > 63 ) { return false ; }
	}

	return true ;
} ;



// hostname or ip
typeCheckers.host = ( data , schema ) => typeCheckers.ip( data , schema ) || typeCheckers.hostname( data , schema ) ;



// URLs
typeCheckers.url = ( data , schema , restrictToWebUrl ) => {
	if ( typeof data !== 'string' ) { return false ; }

	var matches = data.match( /^([a-z+.-]+):\/\/((?:([^\s@/:]+)(?::([^\s@/:]+))?@)?(([0-9.]+)|([0-9a-f:]+)|([^\s/$?#@:]+))(:[0-9]+)?)?(\/[^\s]*)?$/ ) ;

	if ( ! matches ) { return false ; }

	// If we only want http, https and ftp...
	if ( restrictToWebUrl && matches[ 1 ] !== 'http' &&  matches[ 1 ] !== 'https' && matches[ 1 ] !== 'ftp' ) { return false ; }

	if ( ! matches[ 2 ] && matches[ 1 ] !== 'file' ) { return false ; }

	if ( matches[ 6 ] ) {
		if ( ! typeCheckers.ipv4( matches[ 6 ] , schema , true ) ) { return false ; }
	}

	if ( matches[ 7 ] ) {
		if ( ! typeCheckers.ipv6( matches[ 7 ] , schema , true ) ) { return false ; }
	}

	if ( matches[ 8 ] ) {
		if ( ! typeCheckers.hostname( matches[ 8 ] , schema , true ) ) { return false ; }
	}

	return true ;
} ;

typeCheckers.weburl = ( data , schema ) => typeCheckers.url( data , schema , true ) ;



// Emails
typeCheckers.email = ( data , schema ) => {
	var matches , i , parts ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( data.length > 254 ) { return false ; }

	// It only matches the most common email address
	//var matches = data.match( /^([a-z0-9._-]+)@([^\s\/$?#.][^\s\/$?#@:]+)$/ ) ;

	// It matches most email address, and reject really bizarre one
	matches = data.match( /^([a-zA-Z0-9._#~!$&*+=,;:\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF-]+)@([^\s/$?#@:]+)$/ ) ;

	// /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i

	if ( ! matches ) { return false ; }

	if ( matches[ 1 ].length > 64 ) { return false ; }

	parts = matches[ 1 ].split( '.' ) ;

	for ( i = 0 ; i < parts.length ; i ++ ) {
		if ( ! parts[ i ].length ) { return false ; }
	}

	if ( ! typeCheckers.hostname( matches[ 2 ] , schema , true ) ) { return false ; }

	return true ;
} ;



// MongoDB ObjectID
typeCheckers.mongoId = data => {
	if (
		data && typeof data === 'object'
		// mongodb ≥ 5 has ObjectId, mongodb ≤ 4 has ObjectID
		&& ( data.constructor.name === 'ObjectId' || data.constructor.name === 'ObjectID' )
		&& data.id && typeof data.toString === 'function'
	) {
		data = data.toString() ;
	}

	return typeof data === 'string' && data.length === 24 && /^[0-9a-f]{24}$/.test( data ) ;
} ;

