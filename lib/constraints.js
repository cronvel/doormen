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
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.constraints ) { global.DOORMEN_GLOBAL_EXTENSIONS.constraints = {} ; }

const constraints = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.constraints ) ;
module.exports = constraints ;

const doormen = require( './doormen.js' ) ;
const dotPath = require( 'tree-kit/lib/dotPath.js' ) ;
const format = require( 'string-kit/lib/format.js' ).format ;



constraints.condition = function( data , params , element , clone ) {
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



constraints.switch = function( data , params , element , clone ) {
	var source = data ,
		target = data ;

	if ( params.source ) {
		source = dotPath.get( data , params.source ) ;
	}

	if ( params.target ) {
		target = dotPath.get( data , params.target ) ;
	}

	if ( params.case && typeof params.case === 'object' && ( source in params.case ) ) {
		target = this.check( params.case[ source ] , target , element ) ;
	}
	else if ( params.otherCases ) {
		// Use 'otherCases' instead of 'default' because 'default' is used as default values
		target = this.check( params.otherCases , target , element ) ;
	}
	else {
		return data ;
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



constraints.unique = function( data , params , element , clone ) {
	var i , iMax , item , uniqueValue , newData ,
		existing = new Set() ;

	if ( params.convert && ! doormen.sanitizers[ params.convert ] ) {
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

		if ( ( params.noEmpty && ! uniqueValue ) || ( params.noNull && ( uniqueValue === null || uniqueValue === undefined ) ) ) {
			if ( ! params.resolve ) {
				this.validatorError( element.displayPath + " does not satisfy the 'unique' constraint (has null/empty value)." , element ) ;
				return ;
			}

			if ( ! newData ) { newData = data.slice( 0 , i ) ; }
			continue ;
		}

		if ( params.convert ) { uniqueValue = doormen.sanitizers[ params.convert ].call( this , uniqueValue , params , true ) ; }

		if ( existing.has( uniqueValue ) ) {
			if ( ! params.resolve ) {
				this.validatorError( element.displayPath + " does not satisfy the 'unique' constraint." , element ) ;
				return ;
			}

			if ( ! newData ) { newData = data.slice( 0 , i ) ; }
			continue ;
		}

		if ( newData ) { newData.push( item ) ; }
		existing.add( uniqueValue ) ;
	}

	return newData || data ;
} ;



constraints.compound = function( data , params , element , clone ) {
	var target , sources , value ;

	if ( ! Array.isArray( params.sources ) || typeof params.target !== 'string' || typeof params.format !== 'string' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), the 'compound' constraint needs a 'sources' array, a 'target' and a 'format' string." ) ;
	}

	target = dotPath.get( data , params.target ) ;

	if ( target && params.ifEmpty ) { return data ; }

	sources = params.sources.map( s => dotPath.get( data , s ) ) ,
	value = format( params.format , ... sources ) ;

	if ( value === target ) { return data ; }

	if ( ! params.resolve ) {
		this.validatorError( element.displayPath + " does not satisfy the 'compound' constraint." , element ) ;
		return ;
	}

	dotPath.set( data , params.target , value ) ;
	return data ;
} ;



// Reciprocal of 'compound'
constraints.extraction = function( data , params , element , clone ) {
	var i , iMax , target , source , values , value , regexp ;

	if ( ! Array.isArray( params.targets ) || typeof params.source !== 'string' || ( typeof params.match !== 'string' && ! ( params.match instanceof RegExp ) ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), the 'extraction' constraint needs a 'targets' array, a 'source' string, and a 'match' string or RegExp." ) ;
	}

	source = dotPath.get( data , params.source ) ;

	if ( typeof source !== 'string' ) {
		this.validatorError( element.displayPath + " should have a string as its '" + params.source + "' child to satisfy the 'extraction' constraint." , element ) ;
		return ;
	}

	regexp = params.match instanceof RegExp ? params.match : new RegExp( params.match , params.flags || '' ) ;
	values = source.match( regexp ) ;

	if ( ! values ) {
		this.validatorError( element.displayPath + " 's child '" + params.source + "' does not match the regular expression, hence do not to satisfy the 'extraction' constraint." , element ) ;
		return ;
	}

	for ( i = 0 , iMax = params.targets.length ; i < iMax ; i ++ ) {
		target = dotPath.get( data , params.targets[ i ] ) ;
		value = values[ i + 1 ] ;	// Because values[ 0 ] is the whole match

		if ( target && params.ifEmpty ) { continue ; }
		if ( value === target ) { continue ; }

		if ( ! params.resolve ) {
			this.validatorError( element.displayPath + " does not satisfy the 'extraction' constraint." , element ) ;
			return ;
		}

		dotPath.set( data , params.targets[ i ] , value ) ;
	}

	return data ;
} ;

