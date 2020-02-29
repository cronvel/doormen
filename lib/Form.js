/*
	Doormen

	Copyright (c) 2015 - 2020 Cédric Ronvel

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
const Input = require( './Input.js' ) ;



/*
	IDEAS:
		* Proxy on input or form
		* Proxies would be NextGen Event emitter, with 'change' event
		* client UI can change any value, triggering validation
		* code can change any value, emitting event for the client
*/

function Form( schema , data ) {
	this.schema = schema ;
	this.data = data ;
	this.patch = null ;			// A patch to modify the current data
	this.inputs = [] ;			// The list of inputs
	this.inputIndex = 0 ;		// The auto-increment
	this.structure = null ;		// The form structure to be used by third-party (HTML, Vue, etc), it's a proxy

	this.error = null ;

	this.createInputs() ;
}

module.exports = Form ;



Form.prototype.createInputs = function() {
	this.createInputsRecursive( this.schema , this.data , '' ) ;
} ;



Form.prototype.createInputsRecursive = function( schema , data , prefix ) {
	var key , input ;

	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) { throw new Error( "Schema alternatives are not supported for forms ATM." ) ; }

	// 1) Recursivity
	if ( schema.properties && typeof schema.properties === 'object' ) {
		for ( key in schema.properties ) {
			this.createInputsRecursive( schema.properties[ key ] , data[ key ] , prefix ? prefix + '.' + key : key ) ;
		}

		return ;
	}

	input = new Input( {
		form: this ,
		name: prefix ,
		index: this.inputIndex ++ ,
		type: schema.input && schema.input.type ,
		dataType: schema.type ,
		value: data ,
		startingValue: data ,
		order: schema.input && schema.input.order ,
		title: schema.input && schema.input.title ,
		placeholder: schema.input && schema.input.placeholder ,
		description: schema.input && schema.input.description ,
		schema: schema
	} ) ;

	this.inputs.push( input ) ;
} ;



// if ofProxies:true then the structure contains proxies of inputs, else it contains inputs
Form.prototype.createFlatObjectStructure = function( ofProxies ) {
	var input ;

	this.structure = {} ;

	for ( input of this.inputs ) {
		this.structure[ input.name ] = ofProxies ? input.proxy : input ;
	}

	return this.structure ;
} ;



Form.prototype.update = function() {
	for ( let input of this.inputs ) {
		input.update() ;
	}
} ;



Form.prototype.getPatch = function() {
	var count = 0 , patch = null , input ;

	for ( input of this.inputs ) {
		if ( input.localValue !== input.remoteValue ) {
			if ( ! patch ) { patch = {} ; }
			patch[ input.name ] = input.localValue ;
		}
	}

	return patch ;
} ;



// Mark all local values as remote values
Form.prototype.commit = function() {
	for ( let input of this.inputs ) {
		input.remoteValue = input.localValue ;
	}
} ;

