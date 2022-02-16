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

	// The whole form is usually a <form> tag
	this.formElementTag = options.formElement?.tag || 'form' ;
	this.formElementId = options.formElement?.id || null ;
	this.formElementClasses = options.formElement?.classes || [ 'doormen-form' ] ;
	if ( options.formElement?.addClasses ) { this.formElementClasses.push( ... options.formElement.addClasses ) ; }

	// The entry block is containing all entries
	this.entryBlockElementTag = options.entryBlockElement?.tag || 'div' ;
	this.entryBlockElementId = options.entryBlockElement?.id || null ;
	this.entryBlockElementClasses = options.entryBlockElement?.classes || [ 'doormen-form-entry-block' ] ;
	if ( options.entryBlockElement?.addClasses ) { this.entryBlockElementClasses.push( ... options.entryBlockElement.addClasses ) ; }

	// An element surrounding the whole input, i.e. the label, the input, and eventual preview tags
	this.entryElementTag = options.entryElement?.tag || 'div' ;
	this.entryElementClasses = options.entryElement?.classes || [ 'doormen-form-entry' ] ;
	if ( options.entryElement?.addClasses ) { this.entryElementClasses.push( ... options.entryElement.addClasses ) ; }

	// The label is usually a text that name the input field
	this.labelElementTag = options.labelElement?.tag || 'div' ;
	this.labelElementClasses = options.labelElement?.classes || [ 'doormen-form-label' ] ;
	if ( options.labelElement?.addClasses ) { this.labelElementClasses.push( ... options.labelElement.addClasses ) ; }

	// For the input, only the class is configurable, since the tag will be forced by the input data type
	this.inputElementClasses = options.inputElement?.classes || [ 'doormen-form-input' ] ;
	if ( options.inputElement?.addClasses ) { this.inputElementClasses.push( ... options.inputElement.addClasses ) ; }

	// Alt input is used for thing like button opening dialog
	this.altInputButtonElementTag = options.altInputButtonElement?.tag || 'div' ;
	this.altInputButtonElementClasses = options.altInputButtonElement?.classes || [ 'doormen-form-alt-input-button' ] ;
	if ( options.altInputButtonElement?.addClasses ) { this.altInputButtonElementClasses.push( ... options.altInputButtonElement.addClasses ) ; }
	this.altInputButtonElementText = options.altInputButtonElement?.text || null ;

	// Things like image may have a preview thumbnail next to the input, this manages its tag and classes
	this.previewElementClasses = options.previewElement?.classes || [ 'doormen-form-preview' ] ;
	if ( options.previewElement?.addClasses ) { this.previewElementClasses.push( ... options.previewElement.addClasses ) ; }

	// Things like image may have a preview thumbnail next to the input, this manages its tag and classes
	this.saveButtonElementTag = options.saveButtonElement?.tag || 'div' ;
	this.saveButtonElementElementId = options.saveButtonElementElement?.id || null ;
	this.saveButtonElementClasses = options.saveButtonElement?.classes || [ 'doormen-form-save-button' ] ;
	if ( options.saveButtonElement?.addClasses ) { this.saveButtonElementClasses.push( ... options.saveButtonElement.addClasses ) ; }
	this.saveButtonElementText = options.saveButtonElement?.text || null ;

	// Store all actives entries, key is input.property
	this.entries = {} ;

	// DOM elements
	this.$form = null ;
	this.$entryBlock = null ;
	this.$saveButton = null ;

	// Temp:
	this.electronHelpers = options.electronHelpers ;


	// Deprecated?
	this.formSchema = options.formSchema ;
	this.form = null ;
	this.hasChanges = false ;
}

module.exports = WebForm ;



WebForm.prototype.init = async function() {
	this.$form = document.createElement( this.formElementTag ) ;
	if ( this.formElementClasses ) { this.$form.classList.add( ... this.formElementClasses ) ; }
	this.$parent.appendChild( this.$form ) ;

	this.$entryBlock = document.createElement( this.entryBlockElementTag ) ;
	if ( this.entryBlockElementClasses ) { this.$entryBlock.classList.add( ... this.entryBlockElementClasses ) ; }
	this.$form.appendChild( this.$entryBlock ) ;

	this.$saveButton = document.createElement( this.saveButtonElementTag ) ;
	if ( this.saveButtonElementClasses ) { this.$saveButton.classList.add( ... this.saveButtonElementClasses ) ; }
	if ( this.saveButtonElementText ) { this.$saveButton.textContent = this.saveButtonElementText ; }
	this.$form.appendChild( this.$saveButton ) ;

	this.$saveButton.addEventListener( 'click' , () => this.save() ) ;
} ;



WebForm.prototype.addInput = function( input ) {
	console.warn( ".addInput()" , input ) ;
	var $entry = null , $label = null , $input = null , $altInputButton , $preview = null ;

	$entry = document.createElement( this.entryElementTag ) ;
	if ( this.entryElementClasses ) { $entry.classList.add( ... this.entryElementClasses ) ; }
	this.$entryBlock.appendChild( $entry ) ;

	$label = document.createElement( this.labelElementTag ) ;
	if ( this.labelElementClasses ) { $label.classList.add( ... this.labelElementClasses ) ; }
	$label.textContent = input.label ;
	$entry.appendChild( $label ) ;

	if ( this.inputMethods[ input.method ] ) {
		//$input = this.inputMethods[ input.method ].call( this , $entry , input )  ;
		let result = this.inputMethods[ input.method ].call( this , $entry , input )  ;
		if ( Array.isArray( result ) ) { [ $input , $altInputButton ] = result ; }
		else { $input = result ; }

		if ( this.inputElementClasses ) { $input.classList.add( ... this.inputElementClasses ) ; }
		if ( $altInputButton ) {
			if ( this.altInputButtonElementClasses ) { $altInputButton.classList.add( ... this.altInputButtonElementClasses ) ; }
			if ( this.altInputButtonElementText ) { $altInputButton.textContent = this.altInputButtonElementText ; }
		}
	}

	if ( input.previewMethod && this.previewMethods[ input.previewMethod ] ) {
		$preview = this.previewMethods[ input.previewMethod ].call( this , $entry , input )  ;
		if ( this.previewElementClasses ) { $preview.classList.add( ... this.previewElementClasses ) ; }
	}

	this.entries[ input.property ] = {
		input , $entry , $label , $input , $altInputButton , $preview
	} ;
} ;



// Those methods are called with `.call( this , ... )`, so `this` still refers to the instance,
// even if the method is not directly on the WebForm's prototype.
WebForm.prototype.inputMethods = {} ;

WebForm.prototype.inputMethods.text = function( $parent , input ) {
	console.warn( ".inputMethods.text()" , input ) ;
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
WebForm.prototype.inputMethods.fileSelector = function( $parent , input , directoryMode ) {
	// First, we create a regular text-input
	var $input = this.inputMethods.text.call( this , $parent , input ) ;
	
	// Now we create a button opening the file selector
	var $altInputButton = document.createElement( this.altInputButtonElementTag ) ;
	$parent.appendChild( $altInputButton ) ;

	$altInputButton.addEventListener( 'click' , async () => {
		console.warn( "open load dialog" ) ;
		var options = {
			title: "Get a " + input.title ,
			//extensions: [ { name: 'image' , extensions: [ 'jpg' , 'png' ] } ]
		} ;
		
		if ( directoryMode ) {
			options.file = false ;
			options.directory = true ;
		}

		var filePath = await this.electronHelpers.loadDialog( options ) ;

		if ( ! filePath ) { return ; }

		$input.value = filePath ;
		this.change( input , filePath ) ;
	} ) ;

	return [ $input , $altInputButton ] ;
} ;

WebForm.prototype.inputMethods.directorySelector = function( $parent , input ) {
	return this.inputMethods.fileSelector.call( this , $parent , input , true ) ;
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

	if ( input.previewMethod && this.previewMethods[ input.previewMethod ] ) {
		if ( ! entry.$preview ) {
			entry.$preview = this.previewMethods[ input.previewMethod ]( this.$parent , input ) ;
		}

		this.previewMethods[ input.previewMethod ].update( entry.$preview , input.value ) ;
	}

	//this.messagePort.postMessage( { type: 'change' , property: entry.input.property , value: entry.input.value } ) ;
} ;



WebForm.prototype.save = function() {
	if ( ! this.hasChanges || ! this.remote ) { return ; }
	this.remote.save() ;
	this.hasChanges = false ;
} ;

