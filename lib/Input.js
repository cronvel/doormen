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



//const doormen = require( './doormen.js' ) ;



function Input( options = {} ) {
	this.name = options.name ;
	this.index = options.index || 0 ;	// Index in the parent form
	this.type = options.type || null ;	// The type of the input field
	this.dataType = options.dataType ;	// The type of the data
	this.value = options.value ;		// Current value
	this.startingValue = options.startingValue || options.value ;	// Value at creation, useful for creating a patch for the data
	this.order = options.order || 0 ;	// Custom order, ordering should be done by order first, and index as a tie-breaker
	this.title = options.title || null ;	// A title for this field
	this.placeholder = options.placeholder || null ;	// Something to display inside the input before user's entry
	this.description = options.description || null ;	// A description for this field
	this.error = null ;		// An error message for this field, if it does not validate
	
	this.init() ;
}

module.exports = Input ;



Input.prototype.init = function() {
	if ( ! this.type ) { this.type = Input.guessType( this.dataType ) ; }
} ;



const DATA_TYPE_TO_TYPE = {
	string: 'text' ,
	number: 'text' ,
	integer: 'text'
} ;



Input.guessType = function( dataType ) {
	if ( DATA_TYPE_TO_TYPE[ dataType ] ) {
		return DATA_TYPE_TO_TYPE[ dataType ] ;
	}

	return 'text' ;
} ;

