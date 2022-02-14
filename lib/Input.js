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



const doormen = require( './core.js' ) ;
const clone = require( 'tree-kit/lib/clone.js' ) ;



function Input( form , options = {} ) {
	this.form = form ;
	this.property = options.property ;
	this.index = options.index || 0 ;	// Index in the parent form
	this.method = options.method || null ;	// The method (type) of the input field
	this.hidden = !! options.hidden ;	// The field somewhat exists but is hidden to the user
	this.readOnly = !! options.readOnly ;	// The field cannot be changed but is still shown (unless hidden) to the user
	this.type = options.type ;	// The type of the data, same than in the schema
	this.value = options.value ;		// Current value of the UI input element
	this.localValue = options.localValue || options.value ;		// The real behind-the-scene value
	this.remoteValue = options.remoteValue || options.value ;	// Value at creation, useful for creating a patch for the data
	this.order = options.order || 0 ;	// Custom order, ordering should be done by order first, and index as a tie-breaker
	this.label = options.label || null ;	// A label for this field
	this.placeholder = options.placeholder || null ;	// Something to display inside the input before user's entry
	this.description = options.description || null ;	// A description for this field
	this.error = null ;					// An error message for this field, if it does not validate
	this.schema = clone( options.schema ) ;	// The schema for this input

	this.proxy = null ;

	this.init() ;
}

module.exports = Input ;



Input.prototype.init = function() {
	if ( ! this.method ) { this.method = Input.guessMethod( this.type ) ; }

	// Force a sanitizer for the input, since most of input returns string
	var sanitizer = Input.guessSanitizer( this.type ) ;

	if ( sanitizer ) {
		if ( ! this.schema.sanitize ) { this.schema.sanitize = [] ; }
		else if ( typeof this.schema.sanitize === 'string' ) { this.schema.sanitize = [ this.schema.sanitize ] ; }

		if ( this.schema.sanitize[ 0 ] !== sanitizer ) { this.schema.sanitize.unshift( sanitizer ) ; }
	}

	this.proxy = this.createProxy() ;
} ;



const TYPE_TO_METHOD = {
	string: 'text' ,
	number: 'text' ,
	integer: 'text'
} ;



const TYPE_TO_SANITIZER = {
	number: 'toNumber' ,
	integer: 'toInteger'
} ;



Input.guessMethod = function( type ) { return TYPE_TO_METHOD[ type ] || 'text' ; } ;
Input.guessSanitizer = function( type ) { return TYPE_TO_SANITIZER[ type ] || null ; } ;



Input.prototype.createProxy = function() {
	return new Proxy( this , {
		set: function( target , property , value , receiver ) {
			if ( property !== 'value' ) { return false ; }
			target.value = value ;
			target.update() ;
			return true ;
		}
	} ) ;
} ;



Input.prototype.update = function() {
	try {
		this.localValue = doormen( this.schema , this.value ) ;
	}
	catch ( error ) {
		//console.log( error ) ;
		this.error = error.message ;
		return ;
	}

	this.error = null ;

	// Check global errors
} ;

