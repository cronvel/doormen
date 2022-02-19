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



//const doormen = require( './core.js' ) ;
const dotPath = require( 'tree-kit/lib/dotPath.js' ) ;
const Input = require( './Input.js' ) ;



/*
	* gui is an object used to display the form in the client, with methods:
		init(): optional
		addInput(): add an input for the user
	* remote is an object used to communicate with the remote data holder, with methods:
		init(): optional
		commit(): send a patch
		send(): send the whole data
*/

function Form( schema , data , gui , remote ) {
	this.schema = schema ;
	this.data = data ;
	this.gui = gui ;
	this.remote = remote ;

	this.inputs = [] ;			// The list of Input instances
	this.inputIndex = 0 ;		// The auto-increment

	this.error = null ;
}

module.exports = Form ;



Form.prototype.init = function() {
	if ( this.remote?.init ) { this.remote.init( this ) ; }
	if ( this.gui?.init ) { this.gui.init( this ) ; }
	this.createInputs( this.schema , this.data ) ;
} ;



Form.prototype.createInputs = function( schema , data , prefix = '' , parentInput = null , depth = 0 ) {
	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) { throw new Error( "Schema alternatives are not supported for forms ATM." ) ; }

	if ( schema.noInput ) { return ; }

	var input = null ,
		subInputs = null ,
		extraSubInputCreation = false ,
		createInput = depth || ( ! schema.of && ! schema.properties && ! schema.type === 'object' ) ;

	if ( createInput ) {
		if ( schema.of && typeof schema.of === 'object' ) {
			extraSubInputCreation = true ;
			subInputs = schema.type === 'array' ? [] : {} ;
			console.warn( "Yo!" , subInputs , extraSubInputCreation ) ;
		}
		else if ( schema.properties && typeof schema.properties === 'object' ) {
			subInputs = {} ;
		}
	}

	// Top-level object never create an input
	if ( createInput ) {
		input = new Input( this , {
			parent: parentInput ,
			depth , subInputs , extraSubInputCreation , schema ,
			property: prefix ,
			index: this.inputIndex ++ ,
			method: schema.input?.method ,
			previewMethod: schema.input?.previewMethod ,
			hidden: !! schema.input?.hidden ,
			readOnly: !! schema.input?.readOnly ,
			type: schema.type ,
			value: data ,
			startingValue: data ,
			order: schema.input?.order ,
			label: schema.input?.label ,
			placeholder: schema.input?.placeholder ,
			description: schema.input?.description ,
		} ) ;

		this.inputs.push( input ) ;

		if ( this.gui ) {
			input.guiEntry = this.gui.addInput( input , parentInput ) ;
		}
	}

	// 1) Recursivity
	if ( schema.of && typeof schema.of === 'object' ) {
		if ( schema.type === 'array' ) {
			if ( Array.isArray( data ) ) {
				for ( let index = 0 ; index < data.length ; index ++ ) {
					let subInput = this.createInputs( schema.of , data[ index ] , prefix ? prefix + '.' + index : index , input , depth + 1 ) ;
					input.subInputs[ index ] = subInput ;
				}
			}
		}
		else {
			if ( ! Array.isArray( data ) ) {
				for ( let key in data ) {
					let subInput = this.createInputs( schema.of , data[ key ] , prefix ? prefix + '.' + key : key , input , depth + 1 ) ;
					if ( input ) { input.subInputs[ key ] = subInput ; }
				}
			}
		}
	}

	if ( schema.properties && typeof schema.properties === 'object' ) {
		for ( let key in schema.properties ) {
			let subInput = this.createInputs( schema.properties[ key ] , data[ key ] , prefix ? prefix + '.' + key : key , input , depth + 1 ) ;
			if ( input ) { input.subInputs[ key ] = subInput ; }
		}
	}
	
	return input ;
} ;



Form.prototype.addSubInput = function( input ) {
	console.warn( "Add subInput" ) ;
	if ( ! input.extraSubInputCreation ) { return ; }

	var index = input.subInputs.length ;
	console.warn( "Add subInput details" , input.schema.of , null , input.property + '.' + index , input , input.depth + 1 ) ;
	var subInput = this.createInputs( input.schema.of , null , input.property + '.' + index , input , input.depth + 1 ) ;
	
	var container = dotPath.get( input.property ) ;
	container[ index ] = undefined ;
	
	input.subInputs[ index ] = subInput ;
} ;



// Mark all local values as remote values
Form.prototype.send = function() {
	if ( ! this.remote ) { return ; }
	this.remote.send( this.data ) ;
} ;



// Mark all local values as remote values
Form.prototype.commit = function() {
	if ( ! this.remote ) { return ; }
	var patch = this.getPatch() ;
	if ( ! patch ) { return ; }
	this.remote.commit( patch ) ;
} ;



// This method is not perfect ATM
Form.prototype.getPatch = function() {
	var patch = null , input ;

	for ( input of this.inputs ) {
		if ( input.localValue !== input.remoteValue ) {
			if ( ! patch ) { patch = {} ; }
			patch[ input.property ] = input.localValue ;
		}
	}

	return patch ;
} ;

