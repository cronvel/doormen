/*
	3D Kit

	Copyright (c) 2020 Cédric Ronvel

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



const string = require( 'string-kit' ) ;



//function WebForm( options , messagePort ) {
function WebForm( remote , options ) {
	this.remote = remote || null ;
	this.$parent = options.parent || document.querySelector( 'body' ) ;

	// The whole form is usually
	this.formElementTag = options.formElement?.tag || 'form' ;
	this.formElementId = options.formElement?.id || null ;
	this.formElementClasses = options.formElement?.classes || [ 'doormen-form' ] ;

	// An element surrounding the whole input, i.e. the label, the input, and eventual preview tags
	this.entryElementTag = options.entryElement?.tag || 'div' ;
	this.entryElementClasses = options.entryElement?.classes || [ 'doormen-form-entry' ] ;

	// The label is usually a text that name the input field
	this.labelElementTag = options.labelElement?.tag || 'div' ;
	this.labelElementClasses = options.labelElement?.classes || [ 'doormen-form-label' ] ;

	// For the input, only the class is configurable, since the tag will be forced by the input data type
	this.inputElementClasses = options.inputElement?.classes || [ 'doormen-form-input' ] ;

	// Things like image may have a preview thumbnail next to the input, this manages its tag and classes
	this.previewElementClasses = options.previewElement?.classes || [ 'doormen-form-preview' ] ;

	// Things like image may have a preview thumbnail next to the input, this manages its tag and classes
	this.saveButtonElementTag = options.saveButtonElement?.tag || 'div' ;
	this.saveButtonElementElementId = options.saveButtonElementElement?.id || null ;
	this.saveButtonElementClasses = options.saveButtonElement?.classes || [ 'doormen-form-save-button' ] ;
	this.saveButtonElementText = options.saveButtonElement?.text || null ;

	// Store all actives entries, key is input.property
	this.entries = {} ;

	// DOM elements
	this.$form = null ;
	this.$inputs = [] ;
	this.$saveButton = null ;

	// Temp:
	this.electronHelpers = options.electronHelpers ;

	// Useful?
	this.formSchema = options.formSchema ;
	this.form = null ;
	this.hasChanges = false ;
}

module.exports = WebForm ;



WebForm.prototype.init = async function() {
	this.$form = document.createElement( this.formElementTag ) ;
	if ( this.formElementClasses ) { this.$form.classList.add( ... this.formElementClasses ) ; }
	this.$parent.appendChild( this.$form ) ;

	this.$saveButton = document.createElement( this.saveButtonElementTag ) ;
	if ( this.saveButtonElementClasses ) { this.$saveButton.classList.add( ... this.saveButtonElementClasses ) ; }
	this.$parent.appendChild( this.$saveButton ) ;

	this.$saveSettingsButton.addEventListener( 'click' , () => this.save() ) ;
} ;



WebForm.prototype.addInput = function( input ) {
	var $entry = null , $label = null , $input = null , $preview = null ;

	$entry = document.createElement( this.entryElementTag ) ;
	if ( this.entryElementClasses ) { $entry.classList.add( ... this.entryElementClasses ) ; }
	this.$form.appendChild( $entry ) ;

	$label = document.createElement( this.labelElementTag ) ;
	if ( this.labelElementClasses ) { $label.classList.add( ... this.labelElementClasses ) ; }
	$label.textContent = input.label ;
	$entry.appendChild( $label ) ;

	if ( this.inputMethods[ input.method ] ) {
		$input = this.inputMethods[ input.method ].call( this , this.$parent , input )  ;
		if ( this.inputElementClasses ) { $input.classList.add( ... this.inputElementClasses ) ; }
	}

	if ( input.preview && this.previewMethods[ input.preview ] ) {
		$preview = this.previewMethods[ input.preview ].call( this , this.$parent , input )  ;
		if ( this.previewElementClasses ) { $preview.classList.add( ... this.previewElementClasses ) ; }
	}

	this.entries[ input.property ] = {
		input , $entry , $label , $input , $preview
	} ;
} ;



// Those methods are called with `.call( this , ... )`, so `this` still refers to the instance,
// even if the method is not directly on the WebForm's prototype.
WebForm.prototype.inputMethods = {} ;

WebForm.prototype.inputMethods.text = function( $parent , input ) {
	var $input = document.createElement( 'input' ) ;
	$input.setAttribute( 'type' , 'text' ) ;
	$input.setAttribute( 'value' , input.value || '' ) ;
	$parent.appendChild( $input ) ;

	$input.addEventListener( 'change' , () => {
		console.warn( "change event" , input.title , $input.value ) ;
		let newValue = $input.value ;
		this.change( input , newValue ) ;
	} ) ;

	return $input ;
} ;



// Temp:
WebForm.prototype.inputMethods.filePath = function( $parent , input ) {
	var $input = document.createElement( 'input' ) ;
	$input.setAttribute( 'type' , 'text' ) ;
	$input.setAttribute( 'value' , input.value || '' ) ;
	$parent.appendChild( $input ) ;

	$input.addEventListener( 'click' , async () => {
		console.warn( "open load dialog" ) ;
		var options = {
			title: "Get a " + input.title ,
			extensions: [
				{ name: 'image' , extensions: [ 'jpg' , 'png' ] }
			]
		} ;

		var filePath = await this.electronHelpers.loadDialog( options ) ;

		if ( ! filePath ) { return ; }

		$input.value = filePath ;
		this.change( input , filePath ) ;
	} ) ;

	return $input ;
} ;



WebForm.prototype.previewMethods = {} ;

WebForm.prototype.previewMethods.localImage = function( $parent , input ) {
	var $preview = document.createElement( 'div' ) ;

	if ( input.value ) {
		$preview.style.backgroundImage = 'url("file://' + string.escape.htmlSpecialChars( input.value ) + '")' ;
	}

	$parent.appendChild( $preview ) ;

	return $preview ;
} ;

WebForm.prototype.previewMethods.localImage.update = function( $preview , value ) {
	if ( value ) {
		$preview.style.backgroundImage = 'url("file://' + string.escape.htmlSpecialChars( value ) + '")' ;
	}
} ;



WebForm.prototype.change = function( input , newValue ) {
	var entry = this.entries[ input.property ] ;

	if ( ! entry ) {
		throw new Error( 'Entry not found:' + input.property ) ;
		//return ;
	}

	this.hasChanges = true ;

	// /!\ /!\ Call sanitizer here!!! /!\ /!\
	// E.g.: input.setValue( newValue ) ;
	input.value = newValue ;

	if ( input.preview && this.previewMethods[ input.preview ] ) {
		if ( ! entry.$preview ) {
			entry.$preview = this.previewMethods[ input.preview ]( this.$parent , input ) ;
		}

		this.previewMethods[ input.preview ].update( entry.$preview , input.value ) ;
	}

	//this.messagePort.postMessage( { type: 'change' , property: entry.input.property , value: entry.input.value } ) ;
} ;



WebForm.prototype.save = function() {
	if ( ! this.hasChanges || ! this.remote ) { return ; }
	this.remote.save() ;
	this.hasChanges = false ;
} ;

