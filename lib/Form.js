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
const Input = require( './Input.js' ) ;



/*
	* gui contains all the form creation hooks:
		* constructor: a constructor to instanciate a client's form object
		* main: hook for the main form creation (e.g. web: <form>)
		* label: hook for the text-label creation
		* input: object, key being the method of input, value being the hook for the input creation (e.g. web: <input type="text" />)
		* preview: object, key being the type of preview, value being the hook for the preview creation (e.g. web image preview: <img src="path/to/image" />)
	* remote contains all the hook to communicate with the remote data holder, if any
*/

function Form( schema , data , gui , remote ) {
	this.schema = schema ;
	this.data = data ;
	this.gui = gui ;
	this.remote = remote ;
	this.patch = null ;			// A patch to modify the current data
	this.inputs = [] ;			// The list of Input instances
	this.inputIndex = 0 ;		// The auto-increment
	this.shared = null ;		// The form structure to be used by third-party (HTML, Vue, etc), it's a proxy

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

	var input = null ;
	
	// Top-level object never create an input
	if ( depth || ( ! schema.of && ! schema.properties && ! schema.type === 'object' ) ) {
		input = new Input( this , {
			parent: parentInput ,
			schema: schema ,
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

		if ( this.gui ) { this.gui.addInput( input , parentInput ) ; }
	}

	// 1) Recursivity
	if ( schema.of && typeof schema.of === 'object' ) {
		if ( schema.type === 'array' ) {
			if ( input ) {
				input.turnIntoContainer( true , { schema: schema.of , prefix , input , depth: depth + 1 } ) ;
			}

			if ( Array.isArray( data ) ) {
				for ( let i = 0 ; i < data.length ; i ++ ) {
					let subInput = this.createInputs( schema.of , data[ i ] , prefix ? prefix + '.' + i : i , input , depth + 1 ) ;
					input.subInputs[ i ] = subInput ;
				}
			}
		}
		else {
			if ( input ) {
				input.turnIntoContainer( false , { schema: schema.of , prefix , input , depth: depth + 1 } ) ;
			}
			
			if ( ! Array.isArray( data ) ) {
				for ( let key in data ) {
					let subInput = this.createInputs( schema.of , data[ key ] , prefix ? prefix + '.' + key : key , input , depth + 1 ) ;
					if ( input ) { input.subInputs[ key ] = subInput ; }
				}
			}
		}
	}

	if ( schema.properties && typeof schema.properties === 'object' ) {
		if ( input ) {
			input.turnIntoContainer( false ) ;	// schema.extraProperties ) ;
		}

		for ( let key in schema.properties ) {
			let subInput = this.createInputs( schema.properties[ key ] , data[ key ] , prefix ? prefix + '.' + key : key , input , depth + 1 ) ;
			if ( input ) { input.subInputs[ key ] = subInput ; }
		}
	}
	
	return input ;
} ;



// Mark all local values as remote values
Form.prototype.commit = function() {
	if ( ! this.remote ) { return ; }
	var patch = this.getPatch() ;
	if ( ! patch ) { return ; }
	this.remote.commit( patch ) ;
} ;



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

