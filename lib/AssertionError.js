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


//function AssertionError( message , from , actual , expected , showDiff ) {
function AssertionError( message , from , options = {} ) {
	this.message = message ;

	from = from || AssertionError ;

	// This will make Mocha and Tea-Time show the diff:
	this.actual = options.actual ;
	this.expected = options.expected ;
	this.expectationType = options.expectationType ;
	this.showDiff = !! options.showDiff ;

	this.from = options.fromError ;

	if ( from instanceof Error ) { this.stack = from.stack ; }
	else if ( Error.captureStackTrace ) { Error.captureStackTrace( this , from ) ; }
	else { this.stack = Error().stack ; }
}

module.exports = AssertionError ;

AssertionError.prototype = Object.create( TypeError.prototype ) ;
AssertionError.prototype.constructor = AssertionError ;
AssertionError.prototype.name = 'AssertionError' ;

