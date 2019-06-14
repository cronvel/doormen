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



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.constraint ) { global.DOORMEN_GLOBAL_EXTENSIONS.constraint = {} ; }

const constraint = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.constraint ) ;
module.exports = constraint ;

const doormen = require( './doormen.js' ) ;
const dotPath = require( 'tree-kit/lib/dotPath.js' ) ;



constraint.condition = function( data , params , element , clone ) {
	var source = data ,
		target = data ;
	
	if ( params.source ) {
		source = dotPath.get( data , params.source ) ;
	}
	
	if ( params.target ) {
		target = dotPath.get( data , params.target ) ;
	}
	
	if ( params.if ) {
		try {
			doormen( params.if , source ) ;
		}
		catch ( error ) {
			// normal case, it does not match so we have nothing to do here
			return data ;
		}
	}
	
	if ( params.then ) {
		target = this.check( params.then , target , element ) ;
	}


	// Restore link, if target itself was modified, or update data
	if ( params.target ) {
		dotPath.set( data , params.target , target ) ;
	}
	else {
		data = target ;
	}
	
	return data ;
} ;



constraint.switch = function( data , params , element , clone ) {
	var source = data ,
		target = data ;
	
	if ( params.source ) {
		source = dotPath.get( data , params.source ) ;
	}
	
	if ( params.target ) {
		target = dotPath.get( data , params.target ) ;
	}
	
	if ( ! ( source in params.cases ) ) { return data ; }
	
	target = this.check( params.cases[ source ] , target , element ) ;


	// Restore link, if target itself was modified, or update data
	if ( params.target ) {
		dotPath.set( data , params.target , target ) ;
	}
	else {
		data = target ;
	}
	
	return data ;
} ;



constraint.unique = function( data , params , element , clone ) {
	var i , iMax , item , uniqueValue , newData ,
		existing = new Set() ;

	if ( params.convert && ! doormen.sanitizer[ params.convert ] ) {
		if ( doormen.clientMode ) { return data ; }
		throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant sanitizer '" + params.convert + "' (used as 'convert')." ) ;
	}

	if ( ! Array.isArray( data ) ) {
		this.validatorError( element.displayPath + " should be an array to satisfy the 'unique' constraint." , element ) ;
		return ;
	}

	for ( i = 0 , iMax = data.length ; i < iMax ; i ++ ) {
		uniqueValue = item = data[ i ] ;
		if ( params.path ) { uniqueValue = dotPath.get( item , params.path ) ; }
		if ( params.convert ) { uniqueValue = doormen.sanitizer[ params.convert ].call( this , uniqueValue , params , true ) ; }

		if ( existing.has( uniqueValue ) ) {
			if ( ! params.resolve ) {
				this.validatorError( element.displayPath + " does not satisfy the 'unique' constraint." , element ) ;
				return ;
			}

			if ( ! newData ) {
				newData = data.slice( 0 , i ) ;
			}

			continue ;
		}

		if ( newData ) { newData.push( item ) ; }
		existing.add( uniqueValue ) ;
	}

	return newData || data ;
} ;

