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



function AssertionError( message , from , options = {} ) {
	this.message = message ;

	from = from || AssertionError ;

	// This will make Mocha and Tea-Time show the diff:
	this.actual = options.actual ;
	this.expected = options.expected ;
	this.expectationPath = options.expectationPath ;
	this.expectationType = options.expectationType ;
	this.showDiff = !! options.showDiff ;
	this.showPathDiff = !! options.showPathDiff ;

	this.from = options.fromError ;

	if ( from instanceof Error ) { this.stack = from.stack ; }
	else if ( Error.captureStackTrace ) { Error.captureStackTrace( this , from ) ; }
	else { this.stack = Error().stack ; }
}

module.exports = AssertionError ;

AssertionError.prototype = Object.create( TypeError.prototype ) ;
AssertionError.prototype.constructor = AssertionError ;
AssertionError.prototype.name = 'AssertionError' ;



// Should be loaded after exporting
const assert = require( './assert.js' ) ;



AssertionError.create = ( from , actual , expectationPath , expectationType , ... expectations ) => {
	var middleMessage , inspectStr ;

	var inOpt = {
		inspect: false ,
		glue: ' and ' ,
		showDiff: false ,
		showPathDiff: false ,
		none: false
	} ;

	if ( expectationType && typeof expectationType === 'object' ) {
		middleMessage = expectationType.middleMessage || ' to <insert here your expectation> ' ;
		expectationType = expectationType.expectationType ;
	}
	else {
		middleMessage = expectationType ;
	}

	if ( assert[ expectationType ] ) { Object.assign( inOpt , assert[ expectationType ] ) ; }

	var message = '' ;

	if ( actual !== assert.NONE ) {
		inspectStr = inspectVar( actual , expectations.length >= 2 ) ;

		if ( inspectStr.length > 80 ) {
			message += 'Expected\n\t' + inspectStr + '\n' ;
		}
		else {
			message += 'Expected ' + inspectStr + ' ' ;
		}
	}
	else if ( ! inOpt.none ) {
		message += 'Expected nothing ' ;
	}

	message += middleMessage ;

	if ( expectations.length ) {
		if ( inOpt.inspect ) {
			message += ' ' + expectations.map( e => {
				inspectStr = inspectVar( e ) ;
				if ( inspectStr.length > 80 ) { return '\n\t' + inspectStr + '\n' ; }
				return inspectStr ;
			} ).join( inOpt.glue ) ;
		}
		else {
			message += ' ' + expectations.join( inOpt.glue ) ;
		}
	}

	if ( expectationPath ) {
		message += ' (offending path: ' + expectationPath + ')' ;
	}

	var outOpt = { actual , expectationPath , expectationType } ;

	if ( expectations.length === 1 ) {
		outOpt.expected = expectations[ 0 ] ;
		outOpt.showDiff = inOpt.showDiff ;
		if ( expectationPath ) { outOpt.showPathDiff = inOpt.showPathDiff ; }
	}

	if ( actual instanceof Error ) {
		outOpt.fromError = actual ;
	}
	else if ( actual instanceof assert.FunctionCall && actual.hasThrown ) {
		outOpt.fromError = actual.error ;
	}

	return new AssertionError( message , from , outOpt ) ;
} ;



// Inspect

const inspect = require( 'string-kit/lib/inspect.js' ).inspect ;



const inspectOptions = {
	style: 'inline' ,
	depth: 2 ,
	maxLength: 80 ,
	outputMaxLength: 400 ,
	noDescriptor: true ,
	noType: true ,
	noArrayProperty: true
} ;



function inspectVar( variable , extraExpectations ) {
	var str ;

	if ( typeof variable === 'function' ) {
		return ( variable.name || '(anonymous)' ) + "()" ;
	}

	if ( variable instanceof Error ) {
		str = '' + variable ;

		if ( extraExpectations ) {
			let replacement = Object.assign( {} , variable ) ;
			delete replacement.message ;
			delete replacement.safeMessage ;
			delete replacement.stack ;
			delete replacement.at ;
			delete replacement.constructor ;
			str += ' having ' + inspect( inspectOptions , replacement ) ;
		}

		return str ;
	}

	if ( variable instanceof assert.FunctionCall ) {
		str = ( variable.function.name || '(anonymous)' ) ;

		if ( variable.args.length ) {
			let argStr = "( " + variable.args.map( a => inspectVar( a ) ).join( ', ' ) + " )" ;

			if ( argStr.length > inspectOptions.maxLength ) {
				argStr = argStr.slice( 0 , inspectOptions.maxLength - 1 ) + '…' ;
			}

			str += argStr ;
		}
		else {
			str += "()" ;
		}

		if ( variable.hasThrown ) {
			str += ', which has thrown ' + inspectVar( variable.error , extraExpectations ) + ',' ;
		}

		return str ;
	}

	return inspect( inspectOptions , variable ) ;
}

