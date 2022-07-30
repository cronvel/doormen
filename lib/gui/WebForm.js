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



function WebForm( options ) {
	this.form = null ;	// set by .init()
	this.$container = options.$container || document.querySelector( 'body' ) ;

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

	// Add input is used for container like arrays/inputList
	this.addInputButtonElementTag = options.addInputButtonElement?.tag || 'div' ;
	this.addInputButtonElementClasses = options.addInputButtonElement?.classes || [ 'doormen-form-add-input-button' ] ;
	if ( options.addInputButtonElement?.addClasses ) { this.addInputButtonElementClasses.push( ... options.addInputButtonElement.addClasses ) ; }
	this.addInputButtonElementText = options.addInputButtonElement?.text || null ;

	// Remove input is used for container like arrays/inputList
	this.removeInputButtonElementTag = options.removeInputButtonElement?.tag || 'div' ;
	this.removeInputButtonElementClasses = options.removeInputButtonElement?.classes || [ 'doormen-form-remove-input-button' ] ;
	if ( options.removeInputButtonElement?.addClasses ) { this.removeInputButtonElementClasses.push( ... options.removeInputButtonElement.addClasses ) ; }
	this.removeInputButtonElementText = options.removeInputButtonElement?.text || null ;

	// Alt input is used for thing like button opening dialog
	this.altInputButtonElementTag = options.altInputButtonElement?.tag || 'div' ;
	this.altInputButtonElementClasses = options.altInputButtonElement?.classes || [ 'doormen-form-alt-input-button' ] ;
	if ( options.altInputButtonElement?.addClasses ) { this.altInputButtonElementClasses.push( ... options.altInputButtonElement.addClasses ) ; }
	this.altInputButtonElementText = options.altInputButtonElement?.text || null ;

	// Things like image may have a preview thumbnail next to the input, this manages its tag and classes
	this.previewElementClasses = options.previewElement?.classes || [ 'doormen-form-preview' ] ;
	if ( options.previewElement?.addClasses ) { this.previewElementClasses.push( ... options.previewElement.addClasses ) ; }

	// Things like image may have a preview thumbnail next to the input, this manages its tag and classes
	this.commitButtonElementTag = options.commitButtonElement?.tag || 'div' ;
	this.commitButtonElementElementId = options.commitButtonElementElement?.id || null ;
	this.commitButtonElementClasses = options.commitButtonElement?.classes || [ 'doormen-form-commit-button' ] ;
	if ( options.commitButtonElement?.addClasses ) { this.commitButtonElementClasses.push( ... options.commitButtonElement.addClasses ) ; }
	this.commitButtonElementText = options.commitButtonElement?.text || null ;

	// Store all actives entries, key is input.property
	this.entries = {} ;

	// DOM elements
	this.$form = null ;
	this.$entryBlock = null ;
	this.$commitButton = null ;

	if ( options.inputMethods ) {
		this.inputMethods = Object.assign( {} , this.inputMethods , options.inputMethods ) ;
	}

	if ( options.previewMethods ) {
		this.previewMethods = Object.assign( {} , this.previewMethods , options.previewMethods ) ;
	}
}

module.exports = WebForm ;



WebForm.prototype.init = async function( form ) {
	this.form = form ;

	this.$form = document.createElement( this.formElementTag ) ;
	if ( this.formElementClasses ) { this.$form.classList.add( ... this.formElementClasses ) ; }
	this.$container.appendChild( this.$form ) ;

	this.$entryBlock = document.createElement( this.entryBlockElementTag ) ;
	if ( this.entryBlockElementClasses ) { this.$entryBlock.classList.add( ... this.entryBlockElementClasses ) ; }
	this.$form.appendChild( this.$entryBlock ) ;

	this.$commitButton = document.createElement( this.commitButtonElementTag ) ;
	if ( this.commitButtonElementClasses ) { this.$commitButton.classList.add( ... this.commitButtonElementClasses ) ; }
	if ( this.commitButtonElementText ) { this.$commitButton.textContent = this.commitButtonElementText ; }
	this.$form.appendChild( this.$commitButton ) ;

	this.$commitButton.addEventListener( 'click' , () => this.commit() ) ;
} ;



WebForm.prototype.addInput = function( input , parentInput = null ) {
	//console.warn( ".addInput()" , input ) ;
	var $entry = null , $label = null ,
		$input = null , $addInputButton = null , $removeInputButton = null , $altInputButton = null ,
		$preview = null ,
		$parent = parentInput?.guiEntry?.$input || this.$entryBlock ;

	if ( ! input.method ) { return ; }

	$entry = document.createElement( this.entryElementTag ) ;
	if ( this.entryElementClasses ) { $entry.classList.add( ... this.entryElementClasses ) ; }
	$parent.appendChild( $entry ) ;

	$label = document.createElement( this.labelElementTag ) ;
	if ( this.labelElementClasses ) { $label.classList.add( ... this.labelElementClasses ) ; }
	$label.textContent = input.label ;
	$entry.appendChild( $label ) ;

	if ( this.inputMethods[ input.method ] ) {
		let result = this.inputMethods[ input.method ].call( this , $entry , input )  ;
		( { $input , $addInputButton , $altInputButton } = result ) ;

		if ( this.inputElementClasses ) { $input.classList.add( ... this.inputElementClasses ) ; }

		if ( $addInputButton ) {
			if ( this.addInputButtonElementClasses ) { $addInputButton.classList.add( ... this.addInputButtonElementClasses ) ; }
			if ( this.addInputButtonElementText ) { $addInputButton.textContent = this.addInputButtonElementText ; }
		}

		if ( $altInputButton ) {
			if ( this.altInputButtonElementClasses ) { $altInputButton.classList.add( ... this.altInputButtonElementClasses ) ; }
			if ( this.altInputButtonElementText ) { $altInputButton.textContent = this.altInputButtonElementText ; }
		}
	}

	if ( input.removable ) {
		$removeInputButton = document.createElement( this.removeInputButtonElementTag ) ;
		if ( this.removeInputButtonElementClasses ) { $removeInputButton.classList.add( ... this.removeInputButtonElementClasses ) ; }
		if ( this.removeInputButtonElementText ) { $removeInputButton.textContent = this.removeInputButtonElementText ; }
		$entry.appendChild( $removeInputButton ) ;

		$removeInputButton.addEventListener( 'click' , () => {
			//console.warn( "remove item click event" ) ;
			this.form.removeInput( input ) ;
		} ) ;
	}

	if ( input.previewMethod && this.previewMethods[ input.previewMethod ] ) {
		$preview = this.previewMethods[ input.previewMethod ].call( this , $entry , input )  ;
		if ( this.previewElementClasses ) { $preview.classList.add( ... this.previewElementClasses ) ; }
	}

	this.entries[ input.property ] = {
		input , parentInput , $entry , $label , $input , $addInputButton , $removeInputButton , $altInputButton , $preview
	} ;

	return this.entries[ input.property ] ;
} ;



WebForm.prototype.removeInput = function( input ) {
	var entry = this.entries[ input.property ] ;
	entry.$entry.parentNode.removeChild( entry.$entry ) ;
	delete this.entries[ input.property ] ;
} ;



// Those methods are called with `.call( this , ... )`, so `this` still refers to the instance,
// even if the method is not directly on the WebForm's prototype.
WebForm.prototype.inputMethods = {} ;

WebForm.prototype.inputMethods.text = function( $parent , input ) {
	//console.warn( ".inputMethods.text()" , input ) ;
	var $input = document.createElement( 'input' ) ;
	$input.setAttribute( 'type' , 'text' ) ;
	$parent.appendChild( $input ) ;

	$input.addEventListener( 'change' , () => {
		//console.warn( "change event" , input.label , $input.value ) ;
		let newValue = $input.value ;
		this.change( input , newValue ) ;
	} ) ;

	this.inputMethods.text.update.call( this , $input , input.value ) ;

	return { $input } ;
} ;

WebForm.prototype.inputMethods.text.update = function( $input , value ) {
	$input.setAttribute( 'value' , value ? '' + value : '' ) ;
} ;



WebForm.prototype.inputMethods.switch = function( $parent , input ) {
	//console.warn( ".inputMethods.text()" , input ) ;
	var $input = document.createElement( 'div' ) ;
	$input.setAttribute( 'type' , 'switch' ) ;
	$parent.appendChild( $input ) ;

	$input.addEventListener( 'click' , () => {
		//console.warn( "click event" ) ;
		let newValue = ! input.value ;
		this.inputMethods.switch.update.call( this , $input , newValue ) ;
		this.change( input , newValue ) ;
	} ) ;

	this.inputMethods.switch.update.call( this , $input , input.value ) ;

	return { $input } ;
} ;

WebForm.prototype.inputMethods.switch.update = function( $input , value ) {
	$input.setAttribute( 'value' , value ? 'true' : 'false' ) ;
} ;



WebForm.prototype.inputMethods.inputList = function( $parent , input ) {
	//console.warn( ".inputMethods.text()" , input ) ;
	var $input = document.createElement( 'div' ) ;
	$input.setAttribute( 'type' , 'inputList' ) ;
	$parent.appendChild( $input ) ;

	var $addInputButton = null ;

	if ( input.variableSubInputs ) {
		$addInputButton = document.createElement( 'div' ) ;
		$addInputButton.setAttribute( 'type' , 'inputList-plus' ) ;
		$parent.appendChild( $addInputButton ) ;

		$addInputButton.addEventListener( 'click' , () => {
			//console.warn( "add item click event" ) ;
			this.form.addSubInput( input ) ;
		} ) ;
	}

	this.inputMethods.inputList.update.call( this , $input , input.value ) ;

	return { $input , $addInputButton } ;
} ;

WebForm.prototype.inputMethods.inputList.update = function( $input , value ) {
} ;



WebForm.prototype.previewMethods = {} ;

WebForm.prototype.previewMethods.localImage = function( $parent , input ) {
	var $preview = document.createElement( 'div' ) ;
	$parent.appendChild( $preview ) ;

	this.previewMethods.localImage.update.call( this , $preview , input.value ) ;

	return $preview ;
} ;

WebForm.prototype.previewMethods.localImage.update = function( $preview , value ) {
	$preview.style.backgroundImage = value ? 'url("file://' + string.escape.htmlSpecialChars( value ) + '")' : null ;
} ;



WebForm.prototype.change = function( input , newValue ) {
	var sanitizedValue ,
		entry = this.entries[ input.property ] ;

	if ( ! entry ) {
		throw new Error( 'Entry not found:' + input.property ) ;
		//return ;
	}

	// This setter calls sanitizer and checkers
	try {
		sanitizedValue = input.setValue( newValue ) ;
	}
	catch ( error ) {
		console.warn( "Error:" , error ) ;
		return ;
	}

	if ( sanitizedValue !== newValue ) {
		this.inputMethods[ input.inputMethod ].update.call( this , this.$container , input ) ;
		// /!\ Update value now!!!
	}

	if ( input.previewMethod && this.previewMethods[ input.previewMethod ] ) {
		if ( ! entry.$preview ) {
			entry.$preview = this.previewMethods[ input.previewMethod ].call( this , this.$container , input ) ;
		}

		this.previewMethods[ input.previewMethod ].update.call( this , entry.$preview , input.value ) ;
	}
} ;



WebForm.prototype.commit = function() {
	//this.form.commit() ;
	this.form.send() ;
} ;

