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



const doormen = require( './doormen.js' ) ;
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
	this.form = null ;

	this.createFlatForm() ;
}

module.exports = Form ;



Form.prototype.createFlatForm = function() {
	this.form = [] ;
	this.createFlatFormRecursive( this.schema , this.data , '' ) ;
} ;



Form.prototype.createFlatFormRecursive = function( schema , data , prefix ) {
	var key ;
	
	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) { throw new Error( "Schema alternatives are not supported for forms ATM." ) ; }

	// 1) Recursivity
	if ( schema.properties && typeof schema.properties === 'object' ) {
		 for ( key in schema.properties ) {
		 	this.createFlatFormRecursive( schema.properties[ key ] , data[ key ] , prefix ? prefix + '.' + key : key ) ;
		 }
		 
		 return ;
	}
	
	this.form.push( new Input( {
		name: prefix ,
		index: this.form.length ,
		type: schema.inputType ,
		dataType: schema.type ,
		value: data ,
		startingValue: data ,
		order: schema.inputOrder ,
		title: schema.inputTitle ,
		placeholder: schema.inputPlaceholder ,
		description: schema.inputDescription ,
	} ) ) ;
} ;

