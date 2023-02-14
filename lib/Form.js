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
		removeInput(): remove an input (probably an optional one, or an array element)
	* remote is an object used to communicate with the remote data holder, with methods:
		init(): optional
		commit(): send a patch
		send(): send the whole data
*/

function Form( schema , data , params = {} ) {
	this.schema = schema ;
	this.data = data ;

	this.filterInTags =
		params.filterInTags instanceof Set ? params.filterInTags :
		Array.isArray( params.filterInTags ) ? new Set( params.filterInTags ) :
		params.filterInTags && typeof params.filterInTags === 'string' ? new Set( [ params.filterInTags ] ) :
		null ;

	this.filterOutTags =
		params.filterOutTags instanceof Set ? params.filterOutTags :
		Array.isArray( params.filterOutTags ) ? new Set( params.filterOutTags ) :
		params.filterOutTags && typeof params.filterOutTags === 'string' ? new Set( [ params.filterOutTags ] ) :
		null ;

	this.gui = params.gui || null ;
	this.remote = params.remote || null ;

	this.inputs = [] ;			// The list of Input instances
	this.inputId = 0 ;		// The auto-increment

	this.error = null ;

	this.isInit = false ;
	this.init() ;
}

module.exports = Form ;



Form.prototype.init = function() {
	if ( this.isInit ) { return ; }

	if ( this.remote?.init ) { this.remote.init( this ) ; }
	if ( this.gui?.init ) { this.gui.init( this ) ; }
	this.createInputs( this.schema , this.data ) ;

	this.isInit = true ;
} ;



Form.prototype.createInputs = function( schema , data , prefix = '' , parentInput = null , depth = 0 ) {
	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) { throw new Error( "Schema alternatives are not supported for forms ATM." ) ; }

	if ( ! this.filter( schema ) ) { return ; }

	var input = null ,
		subInputs = null ,
		variableSubInputs = false ,
		// Top-level object never create an input
		shouldCreateInput = depth || ( ! schema.of && ! schema.properties && ! schema.type === 'object' ) ;

	if ( shouldCreateInput ) {
		if ( schema.of && typeof schema.of === 'object' ) {
			variableSubInputs = true ;
			subInputs = schema.type === 'array' ? [] : {} ;
		}
		else if ( schema.properties && typeof schema.properties === 'object' ) {
			subInputs = {} ;
		}
	}

	if ( shouldCreateInput ) {
		input = new Input( this , {
			parent: parentInput ,
			id: 'input_' + ( this.inputId ++ ) ,
			depth ,
			subInputs ,
			variableSubInputs ,
			schema ,
			property: prefix ,
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
			description: schema.input?.description
		} ) ;

		this.addInputToList( input ) ;

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



Form.prototype.addInputToList = function( input ) {
	if ( ! input.parent ) {
		input.index = this.inputs.length ;
		this.inputs.push( input ) ;
		return ;
	}

	// We have to insert the input at the right place in the array

	var index = this.inputs.indexOf( input.parent ) + 1 ;

	while ( index < this.inputs.length && this.inputs[ index ].depth > input.parent.depth ) {
		index ++ ;
	}

	if ( index === this.inputs.length ) {
		input.index = index ;
		this.inputs.push( input ) ;
		return ;
	}

	this.inputs.splice( index , 0 , input ) ;

	// Now we change each input .index to match its array position
	for ( ; index < this.inputs.length ; index ++ ) {
		this.inputs[ index ].index = index ;
	}
} ;



Form.prototype.filter = function( schema ) {
	if ( schema.noInput ) { return false ; }

	if ( this.filterInTags ) {
		if ( ! schema.tags ) { return false ; }
		if ( ! schema.tags.some( tag => this.filterInTags.has( tag ) ) ) { return false ; }
	}

	if ( this.filterOutTags && schema.tags ) {
		if ( schema.tags.some( tag => this.filterOutTags.has( tag ) ) ) { return false ; }
	}

	return true ;
} ;



Form.prototype.addSubInput = function( input ) {
	if ( ! input.variableSubInputs ) { return ; }

	var index = input.subInputs.length ;
	//console.warn( "Add subInput details" , input.schema.of , null , input.property + '.' + index , input , input.depth + 1 ) ;
	var subInput = this.createInputs( input.schema.of , null , input.property + '.' + index , input , input.depth + 1 ) ;

	var container = dotPath.get( this.data , input.property ) ;
	container[ index ] = undefined ;

	input.subInputs[ index ] = subInput ;
} ;



Form.prototype.removeInput = function( input ) {
	console.log( ".removeInput()" , input ) ;
	if ( ! input.removable || ! input.parent ) { return ; }

	var subInputIndex = input.parent.subInputs.indexOf( input ) ;
	if ( subInputIndex < 0 ) { return ; }

	var index = this.inputs.indexOf( input ) ;
	this.inputs.splice( index , 1 ) ;

	// Now we change each input .index to match its array position
	for ( ; index < this.inputs.length ; index ++ ) {
		this.inputs[ index ].index = index ;
	}

	var container = dotPath.get( this.data , input.parent.property ) ;

	if ( Array.isArray( input.parent.subInputs ) ) {
		input.parent.subInputs.splice( subInputIndex , 1 ) ;
		for ( ; subInputIndex < input.parent.subInputs.length ; subInputIndex ++ ) {
			let subInput = input.parent.subInputs[ subInputIndex ] ;
			subInput.property = input.parent.property + '.' + subInputIndex ;
		}

		container.splice( subInputIndex , 1 ) ;
	}
	else {
		delete input.parent.subInputs[ subInputIndex ] ;
		delete container[ subInputIndex ] ;
	}

	if ( this.gui ) { this.gui.removeInput( input ) ; }
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

