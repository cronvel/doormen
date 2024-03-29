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
const dotPath = require( 'tree-kit/lib/dotPath.js' ) ;
const clone = require( 'tree-kit/lib/clone.js' ) ;



function Input( form , options = {} ) {
	this.form = form ;
	this.id = options.id ;	// useful for framework like Vue.js, to be used as :key in the template (this is a unique ID for the input)
	this.parent = options.parent || null ;
	this.depth = options.depth || 0 ;
	this.subInputs = options.subInputs || null ;
	this.variableSubInputs = options.variableSubInputs ;	// true if new subInput can be created

	this.property = options.property ;
	this.index = options.index || 0 ;	// Index in the parent form
	this.method = options.method || null ;	// The method (type) of the input field
	this.previewMethod = options.previewMethod || null ;	// The method (type) of the preview (e.g. for image)
	this.hidden = !! options.hidden ;	// The field somewhat exists but is hidden to the user
	this.readOnly = !! options.readOnly ;	// The field cannot be changed but is still shown (unless hidden) to the user
	this.type = options.type ;	// The type of the data, same than in the schema
	this.localValue = options.localValue || options.value ;		// The local value
	this.localChanged = false ;
	this.remoteValue = options.remoteValue || options.value ;	// Value at creation, useful for creating a patch for the data
	this.remoteChanged = false ;
	this.order = options.order || 0 ;	// Custom order, ordering should be done by order first, and index as a tie-breaker
	this.label = options.label ;	// A label for this field
	this.placeholder = options.placeholder || null ;	// Something to display inside the input before user's entry
	this.description = options.description || null ;	// A description for this field
	this.error = null ;					// An error message for this field, if it does not validate
	this.schema = clone( options.schema ) ;	// The schema for this input

	this.removable = !! this.parent?.variableSubInputs ;

	this.guiEntry = null ;

	Object.defineProperties( this , {
		value: {
			get: function() { return this.localValue ; } ,
			set: function( value ) { this.setValue( value ) ; }
		} ,
		autoLabel: {
			get: function() {
				if ( this.label ) { return this.label ; }
				return this.property.match( /[^.]+$/ )?.[ 0 ] ?? null ;
			}
		}
	} ) ;

	this.init() ;
}

module.exports = Input ;



Input.prototype.init = function() {
	if ( ! this.method ) { this.method = this.guessMethod( this.type ) ; }

	// Force a sanitizer for the input, since most of input returns string
	var sanitizer = this.guessSanitizer( this.type ) ;

	if ( sanitizer ) {
		if ( ! this.schema.sanitize ) { this.schema.sanitize = [] ; }
		else if ( typeof this.schema.sanitize === 'string' ) { this.schema.sanitize = [ this.schema.sanitize ] ; }

		if ( this.schema.sanitize[ 0 ] !== sanitizer ) { this.schema.sanitize.unshift( sanitizer ) ; }
	}
} ;



const TYPE_TO_METHOD = {
	string: 'text' ,
	number: 'text' ,
	integer: 'text' ,
	boolean: 'switch' ,
	array: 'inputList' ,
	object: null
} ;

Input.prototype.guessMethod = function( type ) {
	return type in TYPE_TO_METHOD ? TYPE_TO_METHOD[ type ] : 'text' ;
} ;



const TYPE_TO_SANITIZER = {
	number: 'toNumber' ,
	integer: 'toInteger'
} ;

Input.prototype.guessSanitizer = function( type ) {
	return TYPE_TO_SANITIZER[ type ] || null ;
} ;



Input.prototype.setValue = function( value ) {
	try {
		this.localValue = doormen( this.schema , value ) ;
	}
	catch ( error ) {
		//console.log( error ) ;
		this.error = error.message ;
		return ;
	}

	this.localChanged = true ;
	this.error = null ;

	// Check global errors

	// Set the form data
	dotPath.set( this.form.data , this.property , this.localValue ) ;

	return this.localValue ;
} ;

