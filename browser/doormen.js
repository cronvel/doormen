(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.doormen = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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


//function AssertionError( message , from , actual , expected , showDiff ) {
function AssertionError( message , from , options = {} ) {
	this.message = message ;

	from = from || AssertionError ;

	// This will make Mocha and Tea-Time show the diff:
	this.actual = options.actual ;
	this.expected = options.expected ;
	this.expectationType = options.expectationType ;
	this.showDiff = !! options.showDiff ;

	this.from = options.fromError ;

	if ( from instanceof Error ) { this.stack = from.stack ; }
	else if ( Error.captureStackTrace ) { Error.captureStackTrace( this , from ) ; }
	else { this.stack = Error().stack ; }
}

module.exports = AssertionError ;

AssertionError.prototype = Object.create( TypeError.prototype ) ;
AssertionError.prototype.constructor = AssertionError ;
AssertionError.prototype.name = 'AssertionError' ;


},{}],2:[function(require,module,exports){
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


},{"./Input.js":3,"./core.js":9}],3:[function(require,module,exports){
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
const clone = require( 'tree-kit/lib/clone.js' ) ;



function Input( options = {} ) {
	this.form = options.form ;
	this.name = options.name ;
	this.index = options.index || 0 ;	// Index in the parent form
	this.type = options.type || null ;	// The type of the input field
	this.dataType = options.dataType ;	// The type of the data
	this.value = options.value ;		// Current value of the UI input element
	this.localValue = options.localValue || options.value ;		// The real behind-the-scene value
	this.remoteValue = options.remoteValue || options.value ;	// Value at creation, useful for creating a patch for the data
	this.order = options.order || 0 ;	// Custom order, ordering should be done by order first, and index as a tie-breaker
	this.title = options.title || null ;	// A title for this field
	this.placeholder = options.placeholder || null ;	// Something to display inside the input before user's entry
	this.description = options.description || null ;	// A description for this field
	this.error = null ;					// An error message for this field, if it does not validate
	this.schema = clone( options.schema ) ;	// The schema for this input

	this.proxy = null ;

	this.init() ;
}

module.exports = Input ;



Input.prototype.init = function() {
	if ( ! this.type ) { this.type = Input.guessType( this.dataType ) ; }

	// Force a sanitizer for the input, since most of input returns string
	var sanitizer = Input.guessSanitizer( this.dataType ) ;

	if ( sanitizer ) {
		if ( ! this.schema.sanitize ) { this.schema.sanitize = [] ; }
		else if ( typeof this.schema.sanitize === 'string' ) { this.schema.sanitize = [ this.schema.sanitize ] ; }

		if ( this.schema.sanitize[ 0 ] !== sanitizer ) { this.schema.sanitize.unshift( sanitizer ) ; }
	}

	this.proxy = this.createProxy() ;
} ;



const DATA_TYPE_TO_TYPE = {
	string: 'text' ,
	number: 'text' ,
	integer: 'text'
} ;



const DATA_TYPE_TO_SANITIZER = {
	number: 'toNumber' ,
	integer: 'toInteger'
} ;



Input.guessType = function( dataType ) {
	if ( DATA_TYPE_TO_TYPE[ dataType ] ) {
		return DATA_TYPE_TO_TYPE[ dataType ] ;
	}

	return 'text' ;
} ;



Input.guessSanitizer = function( dataType ) {
	if ( DATA_TYPE_TO_SANITIZER[ dataType ] ) {
		return DATA_TYPE_TO_SANITIZER[ dataType ] ;
	}

	return ;
} ;



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


},{"./core.js":9,"tree-kit/lib/clone.js":32}],4:[function(require,module,exports){
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



function SchemaError( message ) {
	this.message = message ;

	if ( Error.captureStackTrace ) { Error.captureStackTrace( this , SchemaError ) ; }
	else { Object.defineProperty( this , 'stack' , { value: Error().stack , enumerable: true , configurable: true } ) ; }
}

module.exports = SchemaError ;

SchemaError.prototype = Object.create( TypeError.prototype ) ;
SchemaError.prototype.constructor = SchemaError ;
SchemaError.prototype.name = 'SchemaError' ;


},{}],5:[function(require,module,exports){
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



function ValidatorError( message , element ) {
	this.message = message ;

	if ( element ) { this.at = this.path = element.path ; }

	if ( Error.captureStackTrace ) { Error.captureStackTrace( this , ValidatorError ) ; }
	else { Object.defineProperty( this , 'stack' , { value: Error().stack , enumerable: true , configurable: true } ) ; }
}

module.exports = ValidatorError ;

ValidatorError.prototype = Object.create( TypeError.prototype ) ;
ValidatorError.prototype.constructor = ValidatorError ;
ValidatorError.prototype.name = 'ValidatorError' ;


},{}],6:[function(require,module,exports){
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



const AssertionError = require( './AssertionError.js' ) ;
const typeCheckers = require( './typeCheckers.js' ) ;

const isEqual = require( './isEqual.js' ) ;
const IS_EQUAL_LIKE = { like: true } ;
const IS_EQUAL_PARTIALLY_LIKE = { like: true , oneWay: true } ;
const IS_EQUAL_PARTIALLY_EQUAL = { oneWay: true } ;

const inspect = require( 'string-kit/lib/inspect.js' ).inspect ;



const inspectOptions = {
	style: 'inline' ,
	depth: 2 ,
	maxLength: 80 ,
	outputMaxLength: 400 ,
	noDescriptor: true ,
	noType: true ,
	noArrayProperty: true
} ;



// A class for actual function, arguments, return value and thrown error
function FunctionCall( fn , isAsync , thisArg , ... args ) {
	this.function = fn ;
	this.isAsync = isAsync ;
	this.this = thisArg ;
	this.args = args ;
	this.hasThrown = false ;
	this.error = undefined ;
	this.return = undefined ;

	try {
		this.return = this.function.call( this.this || null , ... this.args ) ;
	}
	catch ( error ) {
		this.hasThrown = true ;
		this.error = error ;
	}

	if ( this.isAsync ) {
		if ( this.hasThrown ) {
			this.promise = Promise.resolve() ;
		}
		else {
			this.promise = Promise.resolve( this.return )
				.then(
					value => this.return = value ,
					error => {
						this.hasThrown = true ;
						this.error = error ;
					}
				) ;
		}
	}
}



function inspectVar( variable , extraExpectations ) {
	var str ;

	if ( typeof variable === 'function' ) {
		return ( variable.name || '(anonymous)' ) + "()" ;
	}

	if ( variable instanceof Error ) {
		str = '' + variable ;

		if ( extraExpectations ) {
			let replacement = Object.assign( {} , variable ) ;
			delete replacement.message ;
			delete replacement.safeMessage ;
			delete replacement.stack ;
			delete replacement.at ;
			delete replacement.constructor ;
			str += ' having ' + inspect( inspectOptions , replacement ) ;
		}

		return str ;
	}

	if ( variable instanceof FunctionCall ) {
		str = ( variable.function.name || '(anonymous)' ) ;

		if ( variable.args.length ) {
			let argStr = "( " + variable.args.map( a => inspectVar( a ) ).join( ', ' ) + " )" ;

			if ( argStr.length > inspectOptions.maxLength ) {
				argStr = argStr.slice( 0 , inspectOptions.maxLength - 1 ) + '…' ;
			}

			str += argStr ;
		}
		else {
			str += "()" ;
		}

		if ( variable.hasThrown ) {
			str += ', which has thrown ' + inspectVar( variable.error , extraExpectations ) + ',' ;
		}

		return str ;
	}

	return inspect( inspectOptions , variable ) ;
}



const VOWEL = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	A: true ,
	E: true ,
	I: true ,
	O: true ,
	U: true ,
	Y: true
} ;



function assertionError( from , actual , expectationType , ... expectations ) {
	var middleMessage , inspectStr ;

	var inOpt = {
		inspect: false ,
		glue: ' and ' ,
		showDiff: false ,
		none: false
	} ;

	if ( expectationType && typeof expectationType === 'object' ) {
		middleMessage = expectationType.middleMessage || ' to <insert here your expectation> ' ;
		expectationType = expectationType.expectationType ;
	}
	else {
		middleMessage = expectationType ;
	}

	if ( assert[ expectationType ] ) { Object.assign( inOpt , assert[ expectationType ] ) ; }

	var message = '' ;

	if ( actual !== assert.NONE ) {
		inspectStr = inspectVar( actual , expectations.length >= 2 ) ;

		if ( inspectStr.length > 80 ) {
			message += 'Expected\n\t' + inspectStr + '\n' ;
		}
		else {
			message += 'Expected ' + inspectStr + ' ' ;
		}
	}
	else if ( ! inOpt.none ) {
		message += 'Expected nothing ' ;
	}

	message += middleMessage ;

	if ( expectations.length ) {
		if ( inOpt.inspect ) {
			message += ' ' + expectations.map( e => {
				inspectStr = inspectVar( e ) ;
				if ( inspectStr.length > 80 ) { return '\n\t' + inspectStr + '\n' ; }
				return inspectStr ;
			} ).join( inOpt.glue ) ;
		}
		else {
			message += ' ' + expectations.join( inOpt.glue ) ;
		}
	}

	var outOpt = { actual , expectationType } ;

	if ( expectations.length === 1 ) {
		outOpt.expected = expectations[ 0 ] ;
		outOpt.showDiff = inOpt.showDiff ;
	}

	if ( actual instanceof Error ) {
		outOpt.fromError = actual ;
	}
	else if ( actual instanceof FunctionCall && actual.hasThrown ) {
		outOpt.fromError = actual.error ;
	}

	return new AssertionError( message , from , outOpt ) ;
}



var assert = {} ;
module.exports = assert ;



assert.__assertionError__ = assertionError ;



// Constant
assert.NONE = {} ;



/*
	TODO:

	Expect.js: everything is implemented

	Chai:
	- any
	- all
	- ownPropertyDescriptor
	- lengthOf combination with above/below/at least/at most
	- members
	- oneOf
	- functions specific:
		- respondTo (check method on object or function.prototype)
		- change
		- increase
		- decrease
	- object specific:
		- extensible
		- sealed
		- frozen
	- fail useful???

	Doormen specific:
	- to validate
	- throw specific type of errors
*/



/* Constants */



// Defined
assert['to be defined'] =
assert.defined =
assert.isDefined = ( from , actual ) => {
	if ( actual === undefined ) {
		throw assertionError( from , actual , 'to be defined' ) ;
	}
} ;



// Undefined
assert['to be not defined'] = assert['to not be defined'] = assert['not to be defined'] =
assert['to be undefined'] =
assert.undefined =
assert.isUndefined = ( from , actual ) => {
	if ( actual !== undefined ) {
		throw assertionError( from , actual , 'to be undefined' ) ;
	}
} ;



// Truthy
assert['to be ok'] =
assert['to be truthy'] =
assert.ok =
assert.isOk =
assert.truthy =
assert.isTruthy = ( from , actual ) => {
	if ( ! actual ) {
		throw assertionError( from , actual , 'to be truthy' ) ;
	}
} ;



// Falsy
assert['to be not ok'] = assert['to not be ok'] = assert['not to be ok'] =
assert['to be not truthy'] = assert['to not be truthy'] = assert['not to be truthy'] =
assert['to be falsy'] =
assert.nok =
assert.ko =
assert.isNotOk =
assert.falsy =
assert.isFalsy = ( from , actual ) => {
	if ( actual ) {
		throw assertionError( from , actual , 'to be falsy' ) ;
	}
} ;



// True
assert['to be true'] =
assert.true =
assert.isTrue = ( from , actual ) => {
	if ( actual !== true ) {
		throw assertionError( from , actual , 'to be true' ) ;
	}
} ;



// Not true
assert['to be not true'] = assert['to not be true'] = assert['not to be true'] =
assert.notTrue =
assert.isNotTrue = ( from , actual ) => {
	if ( actual === true ) {
		throw assertionError( from , actual , 'not to be true' ) ;
	}
} ;



// False
assert['to be false'] =
assert.false =
assert.isFalse = ( from , actual ) => {
	if ( actual !== false ) {
		throw assertionError( from , actual , 'to be false' ) ;
	}
} ;



// Not false
assert['to be not false'] = assert['to not be false'] = assert['not to be false'] =
assert.notFalse =
assert.isNotFalse = ( from , actual ) => {
	if ( actual === false ) {
		throw assertionError( from , actual , 'not to be false' ) ;
	}
} ;



// Null
assert['to be null'] =
assert.null =
assert.isNull = ( from , actual ) => {
	if ( actual !== null ) {
		throw assertionError( from , actual , 'to be null' ) ;
	}
} ;



// Not null
assert['to be not null'] = assert['to not be null'] = assert['not to be null'] =
assert.notNull =
assert.isNotNull = ( from , actual ) => {
	if ( actual === null ) {
		throw assertionError( from , actual , 'not to be null' ) ;
	}
} ;



// NaN
assert['to be NaN'] =
assert['to be nan'] =
assert.NaN =
assert.isNaN = ( from , actual ) => {
	if ( ! Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be NaN' ) ;
	}
} ;



// Not NaN
assert['to be not NaN'] = assert['to not be NaN'] = assert['not to be NaN'] =
assert['to be not nan'] = assert['to not be nan'] = assert['not to be nan'] =
assert.notNaN =
assert.isNotNaN = ( from , actual ) => {
	if ( Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'not to be NaN' ) ;
	}
} ;



assert['to be finite'] =
assert.finite = ( from , actual ) => {
	if ( typeof actual !== 'number' ) {
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( Number.isNaN( actual ) || actual === Infinity || actual === -Infinity ) {
		throw assertionError( from , actual , 'to be finite' ) ;
	}
} ;



assert['to be not finite'] = assert['to not be finite'] = assert['not to be finite'] =
assert.notFinite = ( from , actual ) => {
	if ( typeof actual !== 'number' ) {
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( ! Number.isNaN( actual ) && actual !== Infinity && actual !== -Infinity ) {
		throw assertionError( from , actual , 'to be finite' ) ;
	}
} ;



/* Equality */



// identical
assert['to be'] =
assert.strictEqual = ( from , actual , expected ) => {
	if ( actual !== expected && ! ( Number.isNaN( actual ) && Number.isNaN( expected ) ) ) {
		throw assertionError( from , actual , 'to be' , expected ) ;
	}
} ;
assert.strictEqual.showDiff = true ;
assert.strictEqual.inspect = true ;



// Not identical
assert['to be not'] = assert['to not be'] = assert['not to be'] =
assert.notStrictEqual = ( from , actual , notExpected ) => {
	if ( actual === notExpected || ( Number.isNaN( actual ) && Number.isNaN( notExpected ) ) ) {
		throw assertionError( from , actual , 'not to be' , notExpected ) ;
	}
} ;
assert.notStrictEqual.inspect = true ;



// Equal (different from identical)
assert['to be equal to'] =
assert['to equal'] =
assert['to eql'] =		// compatibility with expect.js
assert.equal = ( from , actual , expected ) => {
	if ( ! isEqual( actual , expected ) ) {
		throw assertionError( from , actual , 'to equal' , expected ) ;
	}
} ;
assert.equal.showDiff = true ;
assert.equal.inspect = true ;



// Not equal
assert['to be not equal to'] = assert['to not be equal to'] = assert['not to be equal to'] =
assert['to not equal'] = assert['not to equal'] =
assert['to not eql'] = assert['not to eql'] =		// compatibility with expect.js
assert.notEqual = ( from , actual , notExpected ) => {
	if ( isEqual( actual , notExpected ) ) {
		throw assertionError( from , actual , 'not to equal' , notExpected ) ;
	}
} ;
assert.notEqual.inspect = true ;



// Like
assert['to be like'] =
assert['to be alike'] =
assert['to be alike to'] =
assert.like = ( from , actual , expected ) => {
	if ( ! isEqual( actual , expected , IS_EQUAL_LIKE ) ) {
		throw assertionError( from , actual , 'to be like' , expected ) ;
	}
} ;
assert.like.showDiff = true ;
assert.like.inspect = true ;



// Not like
assert['to be not like'] = assert['to not be like'] = assert['not to be like'] =
assert['to be not alike'] = assert['to not be alike'] = assert['not to be alike'] =
assert['to be not alike to'] = assert['to not be alike to'] = assert['not to be alike to'] =
assert.notLike = ( from , actual , notExpected ) => {
	if ( isEqual( actual , notExpected , IS_EQUAL_LIKE ) ) {
		throw assertionError( from , actual , 'not to be like' , notExpected ) ;
	}
} ;
assert.notLike.inspect = true ;



// Equal to a partial object
assert['to be partially equal to'] =
assert['to be partial equal to'] =
assert['to be equal to partial'] =
assert['to partially equal'] =
assert['to partial equal'] =
assert['to equal partial'] =
assert.partialEqual =
assert.partiallyEqual = ( from , actual , expected ) => {
	if ( ! isEqual( expected , actual , IS_EQUAL_PARTIALLY_EQUAL ) ) {
		throw assertionError( from , actual , 'to partially equal' , expected ) ;
	}
} ;
//assert.partiallyEqual.showDiff = true ;
assert.partiallyEqual.inspect = true ;



// Not equal to a partial object
assert['to be not partially equal to'] = assert['to not be partially equal to'] = assert['not to be partially equal to'] =
assert['to be not partial equal to'] = assert['to not be partial equal to'] = assert['not to be partial equal to'] =
assert['to be not equal to partial'] = assert['to not be equal to partial'] = assert['not to be equal to partial'] =
assert['to not partially equal'] = assert['not to partially equal'] =
assert['to not partial equal'] = assert['not to partial equal'] =
assert['to not equal partial'] = assert['not to equal partial'] =
assert.notPartialEqual =
assert.notPartiallyEqual = ( from , actual , notExpected ) => {
	if ( isEqual( notExpected , actual , IS_EQUAL_PARTIALLY_EQUAL ) ) {
		throw assertionError( from , actual , 'not to partially equal' , notExpected ) ;
	}
} ;
assert.notPartiallyEqual.inspect = true ;



// Like partial
assert['to be partially like'] =
assert['to be like partial'] =
assert.partialLike =
assert.partiallyLike = ( from , actual , expected ) => {
	if ( ! isEqual( expected , actual , IS_EQUAL_PARTIALLY_LIKE ) ) {
		throw assertionError( from , actual , 'to be partially like' , expected ) ;
	}
} ;
//assert.partiallyLike.showDiff = true ;
assert.partiallyLike.inspect = true ;



// Not like partial
assert['to be not partially like'] = assert['to not be partially like'] = assert['not to be partially like'] =
assert['to be not like partial'] = assert['to not be like partial'] = assert['not to be like partial'] =
assert.notPartialLike =
assert.notPartiallyLike = ( from , actual , notExpected ) => {
	if ( isEqual( notExpected , actual , IS_EQUAL_PARTIALLY_LIKE ) ) {
		throw assertionError( from , actual , 'not to be partially like' , notExpected ) ;
	}
} ;
assert.notPartiallyLike.inspect = true ;



// Map
assert['to map'] =
assert.map = ( from , actual , expected ) => {
	if ( ! actual || typeof actual !== 'object' || typeof actual.get !== 'function' || typeof actual.keys !== 'function' ) {
		throw assertionError( from , actual , 'to be be a mappable object' ) ;
	}

	if ( ! Array.isArray( expected ) ) {
		throw new AssertionError( "Expectation are not map entries" , from ) ;
	}

	var actualKeys = [ ... actual.keys() ] ;

	if ( actualKeys.length !== expected.length ) {
		throw assertionError( from , actual , 'to map' , expected ) ;
	}

	expected.forEach( expectedEntry => {
		var actualKey , indexOf ;

		if ( ! Array.isArray( expectedEntry ) ) {
			throw new AssertionError( "Expectation are not map entries" , from ) ;
		}

		indexOf = actualKeys.findIndex( k => isEqual( expectedEntry[ 0 ] , k ) ) ;

		if (
			( ( indexOf = actualKeys.indexOf( expectedEntry[ 0 ] ) ) !== -1 ) ||
			( ( indexOf = actualKeys.findIndex( k => isEqual( expectedEntry[ 0 ] , k ) ) ) !== -1 )
		) {
			actualKey = actualKeys.splice( indexOf , 1 )[ 0 ] ;

			if ( ! isEqual( expectedEntry[ 1 ] , actual.get( actualKey ) ) ) {
				throw assertionError( from , actual , 'to map' , expected ) ;
			}
		}
		else {
			throw assertionError( from , actual , 'to map' , expected ) ;
		}
	} ) ;
} ;
assert.map.inspect = true ;



// Shallow clone
assert['to be shallow clone'] =
assert['to be shallow clone of'] =
assert['to be a shallow clone of'] =
assert.shallowCloneOf = ( from , actual , expected ) => {
	if ( typeof actual !== 'function' && ( ! actual || typeof actual !== 'object' ) ) {
		throw assertionError( from , actual , 'to be be an object or a function' ) ;
	}

	// Or throw?
	if ( actual === expected ) { return ; }

	if ( Array.isArray( actual ) ) {
		if ( ! Array.isArray( expected ) || actual.length !== expected.length ) {
			throw assertionError( from , actual , 'to be a shallow clone of' , expected ) ;
		}

		actual.forEach( ( element , index ) => {
			if ( element !== expected[ index ] ) {
				throw assertionError( from , actual , 'to be a shallow clone of' , expected ) ;
			}
		} ) ;
	}
	else {
		if ( Array.isArray( expected ) ) {
			throw assertionError( from , actual , 'to be a shallow clone of' , expected ) ;
		}

		let actualKeys = Object.keys( actual ) ;
		let expectedKeys = Object.keys( expected ) ;

		if ( actualKeys.length !== expectedKeys.length ) {
			throw assertionError( from , actual , 'to be a shallow clone of' , expected ) ;
		}

		// The .hasOwnProperty() check is mandatory, or we have to iterate over actualKeys too
		expectedKeys.forEach( key => {
			if ( ! Object.prototype.hasOwnProperty.call( actual , key ) || actual[ key ] !== expected[ key ] ) {
				throw assertionError( from , actual , 'to be a shallow clone of' , expected ) ;
			}
		} ) ;
	}
} ;
assert.shallowCloneOf.inspect = true ;



// Not shallow clone
assert['to be not shallow clone'] = assert['to not be shallow clone'] = assert['not to be shallow clone'] =
assert['to be not shallow clone of'] = assert['to not be shallow clone of'] = assert['not to be shallow clone of'] =
assert['to be not a shallow clone of'] = assert['to not be a shallow clone of'] = assert['not to be a shallow clone of'] =
assert.notShallowCloneOf = ( from , actual , notExpected ) => {
	if ( typeof actual !== 'function' && ( ! actual || typeof actual !== 'object' ) ) {
		throw assertionError( from , actual , 'to be be an object or a function' ) ;
	}

	// Too boring to code, we use the reverse of shallowClone() now...
	try {
		assert.shallowCloneOf( from , actual , notExpected ) ;
	}
	catch ( error ) {
		// Great, it must throw, we can return now
		return ;
	}

	throw assertionError( from , actual , 'not to be a shallow clone of' , notExpected ) ;
} ;
assert.notShallowCloneOf.inspect = true ;



/* Numbers / Date */



const EPSILON_DELTA_RATE = 1 + 4 * Number.EPSILON ;
const EPSILON_ZERO_DELTA = 4 * Number.MIN_VALUE ;

// Epsilon aware comparison, or with a custom delta
assert['to be close to'] =
assert['to be around'] =
assert.around = ( from , actual , value , delta ) => {
	if ( typeof actual !== 'number' ) {
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( Number.isNaN( actual ) || Number.isNaN( value ) ) {
		throw assertionError( from , actual , 'to be around' , value ) ;
	}

	if ( ! delta ) {
		let absActual = Math.abs( actual ) ,
			absValue = Math.abs( value ) ;

		if ( absActual <= EPSILON_ZERO_DELTA || absValue <= EPSILON_ZERO_DELTA ) {
			if ( actual > value + EPSILON_ZERO_DELTA || value > actual + EPSILON_ZERO_DELTA ) {
				throw assertionError( from , actual , 'to be around' , value ) ;
			}
		}
		else if ( actual * value < 0 ) {
			// Sign mismatch
			throw assertionError( from , actual , 'to be around' , value ) ;
		}
		else if ( absActual > absValue * EPSILON_DELTA_RATE || absValue > absActual * EPSILON_DELTA_RATE ) {
			throw assertionError( from , actual , 'to be around' , value ) ;
		}

		return ;
	}

	if ( actual < value - delta || actual > value + delta ) {
		throw assertionError( from , actual , 'to be around' , value ) ;
	}
} ;



// Epsilon aware comparison, or with a custom delta
assert['to be not close to'] =
assert['to not be close to'] =
assert['not to be close to'] =
assert['to be not around'] =
assert['to not be around'] =
assert['not to be around'] =
assert.notAround = ( from , actual , value , delta ) => {
	if ( typeof actual !== 'number' ) {
		throw assertionError( from , actual , 'to be a number' ) ;
	}

	if ( Number.isNaN( actual ) || Number.isNaN( value ) ) { return ; }

	if ( ! delta ) {
		if ( actual === 0 || value === 0 ) {
			if ( actual <= value + EPSILON_ZERO_DELTA && value <= actual + EPSILON_ZERO_DELTA ) {
				throw assertionError( from , actual , 'not to be around' , value ) ;
			}
		}
		else if ( actual <= value * EPSILON_DELTA_RATE && value <= actual * EPSILON_DELTA_RATE ) {
			throw assertionError( from , actual , 'not to be around' , value ) ;
		}

		return ;
	}

	if ( ( actual >= value - delta && actual <= value + delta ) || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'not to be around' , value ) ;
	}
} ;



assert['to be above'] =
assert['to be greater'] =
assert['to be greater than'] =
assert.above =
assert.gt =
assert.greater =
assert.greaterThan = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual <= value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be above' , value ) ;
	}
} ;



assert['to be at least'] =
assert['to be greater than or equal to'] =
assert.least =
assert.gte =
assert.greaterThanOrEqualTo = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual < value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be at least' , value ) ;
	}
} ;



assert['to be below'] =
assert['to be lesser'] =
assert['to be lesser than'] =
assert.below =
assert.lt =
assert.lesser =
assert.lesserThan = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual >= value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be below' , value ) ;
	}
} ;



assert['to be at most'] =
assert['to be lesser than or equal to'] =
assert.most =
assert.lte =
assert.lesserThanOrEqualTo = ( from , actual , value ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual > value || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be at most' , value ) ;
	}
} ;



assert['to be within'] =
assert.within = ( from , actual , lower , higher ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( actual < lower || actual > higher || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'to be within' , lower , higher ) ;
	}
} ;



assert['to be not within'] =
assert['to not be within'] =
assert['not to be within'] =
assert.notWithin = ( from , actual , lower , higher ) => {
	if ( typeof actual !== 'number' && ! ( actual instanceof Date ) ) {
		throw assertionError( from , actual , 'to be a number or a Date' ) ;
	}

	if ( ( actual >= lower && actual <= higher ) || Number.isNaN( actual ) ) {
		throw assertionError( from , actual , 'not to be within' , lower , higher ) ;
	}
} ;



/* String */



// String regexp match
assert['to match'] =
assert.match = ( from , actual , expected ) => {
	if ( typeof actual !== 'string' ) {
		throw assertionError( from , actual , 'to be a string' ) ;
	}

	if ( ! actual.match( expected ) ) {
		throw assertionError( from , actual , 'to match' , expected ) ;
	}
} ;



// Not string regexp match
assert['to not match'] =
assert['not to match'] =
assert.notMatch = ( from , actual , notExpected ) => {
	if ( typeof actual !== 'string' ) {
		throw assertionError( from , actual , 'to be a string' ) ;
	}

	if ( actual.match( notExpected ) ) {
		throw assertionError( from , actual , 'not to match' , notExpected ) ;
	}
} ;



/* Content */



assert['to have length'] =
assert['to have length of'] =
assert['to have a length of'] =
assert.lengthOf = ( from , actual , expected ) => {
	if ( typeof actual !== 'string' && ( ! actual || typeof actual !== 'object' ) ) {
		throw assertionError( from , actual , 'to have some length' ) ;
	}

	if ( actual.length !== expected ) {
		throw assertionError( from , actual , 'to have a length of' , expected ) ;
	}
} ;



assert['to have not length'] = assert['to not have length'] = assert['not to have length'] =
assert['to have length not of'] = assert['to have not length of'] = assert['to not have length of'] = assert['not to have length of'] =
assert['to have a length not of'] = assert['to have not a length of'] = assert['to not have a length of'] = assert['not to have a length of'] =
assert.notLengthOf = ( from , actual , notExpected ) => {
	if ( typeof actual !== 'string' && ( ! actual || typeof actual !== 'object' ) ) {
		throw assertionError( from , actual , 'to have some length' ) ;
	}

	if ( actual.length === notExpected ) {
		throw assertionError( from , actual , 'not to have a length of' , notExpected ) ;
	}
} ;



assert['to contain'] =
assert['to have'] =
assert['to include'] =
assert.has =
assert.include =
assert.contain = ( from , actual , ... expected ) => {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		if ( Array.isArray( actual ) ) {
			has = expected.every( value => actual.includes( value ) ) ;
		}
		else if ( typeof actual.has === 'function' ) {
			has = expected.every( value => actual.has( value ) ) ;
		}
	}
	else if ( typeof actual === 'string' ) {
		has = expected.every( value => actual.includes( value ) ) ;
	}

	if ( ! has ) {
		throw assertionError( from , actual , 'to contain' , expected ) ;
	}
} ;
assert.contain.inspect = true ;



assert['to contain not'] = assert['to not contain'] = assert['not to contain'] =
assert['to have not'] = assert['to not have'] = assert['not to have'] =
assert['to include not'] = assert['to not include'] = assert['not to include'] =
assert.hasNot =
assert.notInclude =
assert.notContain = ( from , actual , ... notExpected ) => {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		if ( Array.isArray( actual ) ) {
			has = notExpected.some( value => actual.includes( value ) ) ;
		}
		else if ( typeof actual.has === 'function' ) {
			has = notExpected.some( value => actual.has( value ) ) ;
		}
	}
	else if ( typeof actual === 'string' ) {
		has = notExpected.some( value => actual.includes( value ) ) ;
	}

	if ( has ) {
		throw assertionError( from , actual , 'not to contain' , notExpected ) ;
	}
} ;
assert.notContain.inspect = true ;



assert['to only contain'] = assert['to contain only'] =
assert['to only have'] = assert['to have only'] =
assert['to only include'] = assert['to include only'] =
assert.includeOnly =
assert.containOnly = ( from , actual , ... expected ) => {
	var has = false ;

	if ( actual && typeof actual === 'object' ) {
		if ( Array.isArray( actual ) ) {
			// Turn 'actual' to a Set to dedup everything
			actual = new Set( actual ) ;
		}

		if ( typeof actual.has === 'function' ) {
			// Turn 'expected' to a Set to dedup everything
			expected = new Set( expected ) ;
			// Check size, then iterate...
			has = actual.size === expected.size && [ ... expected ].every( value => actual.has( value ) ) ;
		}
	}
	else if ( typeof actual === 'string' ) {
		// Does not make sens at all to use this assertion for strings, but well...
		has = expected.every( value => actual === value ) ;
	}

	if ( ! has ) {
		throw assertionError( from , actual , 'to contain only' , expected ) ;
	}
} ;
assert.containOnly.inspect = true ;
assert.containOnly.glue = ', ' ;



assert['not to only contain'] = assert['to not only contain'] =
assert['not to contain only'] = assert['to not contain only'] = assert['to contain not only'] =
assert['not to only have'] = assert['to not only have'] =
assert['not to have only'] = assert['to not have only'] = assert['to have not only'] =
assert['not to only include'] = assert['to not only include'] =
assert['not to include only'] = assert['to not include only'] = assert['to include not only'] =
assert.notIncludeOnly =
assert.notContainOnly = ( from ) => {
	throw new AssertionError( "Ambigous assertion type 'not to contain only'" , from ) ;
} ;



assert['to be empty'] =
assert.empty = ( from , actual ) => {
	var isEmpty = true ;

	if ( actual ) {
		if ( typeof actual === 'object' ) {
			if ( Array.isArray( actual ) ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( ( actual instanceof Map ) || ( actual instanceof Set ) ) {
				if ( actual.size ) { isEmpty = false ; }
			}
			else if ( actual.length !== undefined ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( Object.keys( actual ).length ) {
				isEmpty = false ;
			}
		}
		else if ( typeof actual === 'string' ) {
			isEmpty = false ;
		}
	}

	if ( ! isEmpty ) {
		throw assertionError( from , actual , 'to be empty' ) ;
	}
} ;



assert['to be not empty'] = assert['to not be empty'] = assert['not to be empty'] =
assert.notEmpty = ( from , actual ) => {
	var isEmpty = true ;

	if ( actual ) {
		if ( typeof actual === 'object' ) {
			if ( Array.isArray( actual ) ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( ( actual instanceof Map ) || ( actual instanceof Set ) ) {
				if ( actual.size ) { isEmpty = false ; }
			}
			else if ( actual.length !== undefined ) {
				if ( actual.length ) { isEmpty = false ; }
			}
			else if ( Object.keys( actual ).length ) {
				isEmpty = false ;
			}
		}
		else if ( typeof actual === 'string' ) {
			isEmpty = false ;
		}
	}

	if ( isEmpty ) {
		throw assertionError( from , actual , 'to be empty' ) ;
	}
} ;



/* Objects */



assert['to have key'] =
assert['to have keys'] =
assert.key =
assert.keys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( ! ( key in actual ) ) {
			throw assertionError( from , actual , 'to have key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.keys.inspect = true ;
assert.keys.glue = ', ' ;



assert['to have not key'] = assert['to not have key'] = assert['not to have key'] =
assert['to have not keys'] = assert['to not have keys'] = assert['not to have keys'] =
assert['to have no key'] =
assert.noKey =
assert.notKey =
assert.notKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( key in actual ) {
			throw assertionError( from , actual , 'not to have key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.notKeys.inspect = true ;
assert.notKeys.glue = ', ' ;



assert['to have own key'] =
assert['to have own keys'] =
assert.ownKey =
assert.ownKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( ! Object.prototype.hasOwnProperty.call( actual , key ) ) {
			throw assertionError( from , actual , 'to have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.ownKeys.inspect = true ;
assert.ownKeys.glue = ', ' ;



assert['to only have key'] = assert['to have only key'] = assert['to have only key'] =
assert['to only have keys'] = assert['to have only keys'] = assert['to have only keys'] =
assert.onlyKey =
assert.onlyKeys = ( from , actual , ... keys ) => {
	throw new AssertionError( "Instead of using assertion 'onlyKeys', you should use assertion 'onlyOwnKeys'." , from ) ;
} ;
assert.onlyKeys.glue = ', ' ;



assert['to only have own key'] = assert['to have only own key'] = assert['to have own only key'] =
assert['to only have own keys'] = assert['to have only own keys'] = assert['to have own only keys'] =
assert.onlyOwnKey =
assert.onlyOwnKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	// First, check if the number of keys match
	if ( Object.getOwnPropertyNames( actual ).length !== keys.length ) {
		throw assertionError( from , actual , 'to only have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
	}

	// Then, each expected keys should be present
	keys.forEach( key => {
		if ( ! Object.prototype.hasOwnProperty.call( actual , key ) ) {
			throw assertionError( from , actual , 'to only have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.onlyOwnKeys.inspect = true ;
assert.onlyOwnKeys.glue = ', ' ;



assert['to have not own key'] = assert['to not have own key'] = assert['not to have own key'] =
assert['to have not own keys'] = assert['to not have own keys'] = assert['not to have own keys'] =
assert['to have no own key'] =
assert.noOwnKey =
assert.notOwnKey =
assert.notOwnKeys = ( from , actual , ... keys ) => {
	if ( ! typeCheckers.looseObject( actual ) ) {
		throw assertionError( from , actual , 'to be an object or a function' ) ;
	}

	keys.forEach( key => {
		if ( Object.prototype.hasOwnProperty.call( actual , key ) ) {
			throw assertionError( from , actual , 'not to have own key' + ( keys.length > 1 ? 's' : '' ) , ... keys ) ;
		}
	} ) ;
} ;
assert.notOwnKeys.inspect = true ;
assert.notOwnKeys.glue = ', ' ;



assert['to have property'] =
assert.property = function( from , actual , key , value ) {
	assert.key( from , actual , key ) ;

	if ( arguments.length >= 4 ) {
		assert.equal( from , actual[ key ] , value ) ;
	}
} ;



assert['to have not property'] = assert['to not have property'] = assert['not to have property'] =
assert['to have no property'] =
assert.notProperty = function( from , actual , key , value ) {
	if ( arguments.length >= 4 ) {
		if ( key in actual ) {
			assert.notEqual( from , actual[ key ] , value ) ;
		}
	}
	else {
		assert.notKey( from , actual , key ) ;
	}
} ;



assert['to have own property'] =
assert.ownProperty = function( from , actual , key , value ) {
	assert.ownKey( from , actual , key ) ;

	if ( arguments.length >= 4 ) {
		assert.equal( from , actual[ key ] , value ) ;
	}
} ;



assert['to have not own property'] = assert['to not have own property'] = assert['not to have own property'] =
assert['to have no own property'] =
assert.notOwnProperty = function( from , actual , key , value ) {
	if ( arguments.length >= 4 ) {
		if ( Object.prototype.hasOwnProperty.call( actual , key ) ) {
			assert.notEqual( from , actual[ key ] , value ) ;
		}
	}
	else {
		assert.notOwnKey( from , actual , key ) ;
	}
} ;



/* Functions */



assert['to throw'] =
assert['to throw a'] =
assert['to throw an'] =
assert.throw = ( from , fn , fnThisAndArgs , expectedErrorInstance , expectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		throw assertionError( from , fn , 'to be a function' ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , false , ... fnThisAndArgs ) ;

	if ( expectedErrorInstance ) {
		if ( ! call.hasThrown || ! ( call.error instanceof expectedErrorInstance ) ) {
			let article = VOWEL[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , call , 'to throw ' + article , expectedErrorInstance ) ;
		}

		if ( expectedPartialError && ! isEqual( expectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
			let article = VOWEL[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , call , 'to throw ' + article , expectedErrorInstance , expectedPartialError ) ;
		}
	}
	else if ( ! call.hasThrown ) {
		throw assertionError( from , call , 'to throw' ) ;
	}
} ;
assert.throw.fnParams = true ;
assert.throw.inspect = true ;
assert.throw.glue = ' having ' ;



assert['to not throw'] = assert['not to throw'] =
assert['to throw not a'] = assert['to not throw a'] = assert['not to throw a'] =
assert['to throw not an'] = assert['to not throw an'] = assert['not to throw an'] =
assert.notThrow = ( from , fn , fnThisAndArgs , notExpectedErrorInstance , notExpectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		throw assertionError( from , fn , 'to be a function' ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , false , ... fnThisAndArgs ) ;

	if ( notExpectedErrorInstance ) {
		if ( call.hasThrown && call.error instanceof notExpectedErrorInstance ) {
			if ( notExpectedPartialError ) {
				if ( isEqual( notExpectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
					let article = VOWEL[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
					throw assertionError( from , call , 'not to throw ' + article , notExpectedErrorInstance , notExpectedPartialError ) ;
				}
			}
			else {
				let article = VOWEL[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
				throw assertionError( from , call , 'not to throw ' + article , notExpectedErrorInstance ) ;
			}
		}
	}
	else if ( call.hasThrown ) {
		throw assertionError( from , call , 'not to throw' ) ;
	}
} ;
assert.notThrow.fnParams = true ;
assert.notThrow.inspect = true ;
assert.notThrow.glue = ' having ' ;



// Almost identical to .throw()
assert['to reject'] =
assert['to reject with'] =
assert['to reject with a'] =
assert['to reject with an'] =
assert['to not fulfill'] = assert['not to fulfill'] =
//assert['to fulfill not with'] = assert['to not fulfill with'] = assert['not to fulfill with'] =
//assert['to fulfill not with a'] = assert['to not fulfill with a'] = assert['not to fulfill with a'] =
//assert['to fulfill not with an'] = assert['to not fulfill with an'] = assert['not to fulfill with an'] =
assert.notFulfill =
assert.reject = async ( from , fn , fnThisAndArgs , expectedErrorInstance , expectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		return assert.rejected( from , fn , expectedErrorInstance , expectedPartialError ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , true , ... fnThisAndArgs ) ;
	await call.promise ;

	if ( expectedErrorInstance ) {
		if ( ! call.hasThrown || ! ( call.error instanceof expectedErrorInstance ) ) {
			let article = VOWEL[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , call , 'to reject with ' + article , expectedErrorInstance ) ;
		}

		if ( expectedPartialError && ! isEqual( expectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
			let article = VOWEL[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , call , 'to reject with ' + article , expectedErrorInstance , expectedPartialError ) ;
		}
	}
	else if ( ! call.hasThrown ) {
		throw assertionError( from , call , 'to reject' ) ;
	}
} ;
assert.throw.promise = assert.reject ;
assert.reject.fnParams = true ;
assert.reject.async = true ;
assert.reject.inspect = true ;
assert.reject.glue = ' having ' ;



// Almost identical to .notThrow()
assert['to not reject'] = assert['not to reject'] =
assert['to reject not with'] = assert['to not reject with'] = assert['not to reject with'] =
assert['to reject not with a'] = assert['to not reject with a'] = assert['not to reject with a'] =
assert['to reject not with an'] = assert['to not reject with an'] = assert['not to reject with an'] =
assert['to fulfill'] =
//assert['to fulfill with'] =
//assert['to fulfill with a'] =
//assert['to fulfill with an'] =
assert.notReject =
assert.fulfill = async ( from , fn , fnThisAndArgs , notExpectedErrorInstance , notExpectedPartialError ) => {
	if ( typeof fn !== 'function' ) {
		return assert.fulfilled( from , fn , notExpectedErrorInstance , notExpectedPartialError ) ;
	}

	if ( ! Array.isArray( fnThisAndArgs ) ) { fnThisAndArgs = [] ; }

	var call = new FunctionCall( fn , true , ... fnThisAndArgs ) ;
	await call.promise ;

	if ( notExpectedErrorInstance ) {
		if ( call.hasThrown && call.error instanceof notExpectedErrorInstance ) {
			if ( notExpectedPartialError ) {
				if ( isEqual( notExpectedPartialError , call.error , IS_EQUAL_PARTIALLY_LIKE ) ) {
					let article = VOWEL[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
					throw assertionError( from , call , 'not to reject with ' + article , notExpectedErrorInstance , notExpectedPartialError ) ;
				}
			}
			else {
				let article = VOWEL[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
				throw assertionError( from , call , 'not to reject with ' + article , notExpectedErrorInstance ) ;
			}
		}
	}
	else if ( call.hasThrown ) {
		throw assertionError( from , call , 'not to reject' ) ;
	}
} ;
assert.notThrow.promise = assert.fulfill ;
assert.fulfill.fnParams = true ;
assert.fulfill.async = true ;
assert.fulfill.inspect = true ;
assert.fulfill.glue = ' having ' ;



/* Promises */



// Almost identical to .throw()
assert['to be rejected'] =
assert['to be rejected with'] =
assert['to be rejected with a'] =
assert['to be rejected with an'] =
assert['not to be fulfilled'] = assert['to not be fulfilled'] = assert['to be not fulfilled'] =
//assert['not to be fulfilled with'] = assert['to not be fulfilled with'] = assert['to be not fulfilled with'] =
//assert['not to be fulfilled with a'] = assert['to not be fulfilled with a'] = assert['to be not fulfilled with a'] =
//assert['not to be fulfilled with an'] = assert['to not be fulfilled with an'] = assert['to be not fulfilled with an'] =
assert.notFulfilled =
assert.rejected = async ( from , promise , expectedErrorInstance , expectedPartialError ) => {
	var error , hasThrown = false ;

	try {
		await promise ;
	}
	catch ( error_ ) {
		hasThrown = true ;
		error = error_ ;
	}

	if ( expectedErrorInstance ) {
		if ( ! hasThrown || ! ( error instanceof expectedErrorInstance ) ) {
			let article = VOWEL[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , promise , 'to be rejected with ' + article , expectedErrorInstance ) ;
		}

		if ( expectedPartialError && ! isEqual( expectedPartialError , error , IS_EQUAL_PARTIALLY_LIKE ) ) {
			let article = VOWEL[ ( '' + ( expectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
			throw assertionError( from , promise , 'to be rejected with ' + article , expectedErrorInstance , expectedPartialError ) ;
		}
	}
	else if ( ! hasThrown ) {
		throw assertionError( from , promise , 'to be rejected' ) ;
	}
} ;
assert.rejected.promise = true ;
assert.rejected.async = true ;
assert.rejected.inspect = true ;



// Almost identical to .notThrow()
assert['not to be rejected'] = assert['to not be rejected'] = assert['to be not rejected'] =
assert['not to be rejected with'] = assert['to not be rejected with'] = assert['to be not rejected with'] =
assert['not to be rejected with a'] = assert['to not be rejected with a'] = assert['to be not rejected with a'] =
assert['not to be rejected with an'] = assert['to not be rejected with an'] = assert['to be not rejected with an'] =
assert['to be fulfilled'] =
//assert['to be fulfilled with'] =
//assert['to be fulfilled with a'] =
//assert['to be fulfilled with an'] =
assert.fulfilled =
assert.notRejected = async ( from , promise , notExpectedErrorInstance , notExpectedPartialError ) => {
	var error , hasThrown = false ;

	try {
		await promise ;
	}
	catch ( error_ ) {
		hasThrown = true ;
		error = error_ ;
	}

	if ( notExpectedErrorInstance ) {
		if ( hasThrown && error instanceof notExpectedErrorInstance ) {
			if ( notExpectedPartialError ) {
				if ( isEqual( notExpectedPartialError , error , IS_EQUAL_PARTIALLY_LIKE ) ) {
					let article = VOWEL[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
					throw assertionError( from , promise , 'not to be rejected with ' + article , notExpectedErrorInstance , notExpectedPartialError ) ;
				}
			}
			else {
				let article = VOWEL[ ( '' + ( notExpectedErrorInstance.name || '(anonymous)' ) )[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
				throw assertionError( from , promise , 'not to be rejected with ' + article , notExpectedErrorInstance ) ;
			}
		}
	}
	else if ( hasThrown ) {
		throw assertionError( from , promise , 'not to be rejected' ) ;
	}
} ;
assert.fulfilled.promise = true ;
assert.fulfilled.async = true ;
assert.fulfilled.inspect = true ;



/* Types / Instances */



// Type or instance
assert['to be a'] =
assert['to be an'] =
assert.typeOrInstanceOf = ( from , actual , expected ) => {
	if ( typeof expected === 'string' ) {
		return assert.typeOf( from , actual , expected ) ;
	}

	return assert.instanceOf( from , actual , expected ) ;
} ;



// Not type or instance
assert['to be not a'] =
assert['to not be a'] =
assert['not to be a'] =
assert['to be not an'] =
assert['to not be an'] =
assert['not to be an'] =
assert.notTypeOrInstanceOf = ( from , actual , notExpected ) => {
	if ( typeof notExpected === 'string' ) {
		return assert.notTypeOf( from , actual , notExpected ) ;
	}

	return assert.notInstanceOf( from , actual , notExpected ) ;
} ;



// Type
assert['to be of type'] =
assert.typeOf = ( from , actual , expected ) => {
	if ( ! typeCheckers[ expected ] ) {
		throw new Error( "Unknown type '" + expected + "'." ) ;
	}

	if ( ! typeCheckers[ expected ]( actual ) ) {
		let article = VOWEL[ expected[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
		throw assertionError( from , actual , 'to be ' + article , expected ) ;
	}
} ;



// Not type
assert['to be not of type'] =
assert['to not be of type'] =
assert['not to be of type'] =
assert.notTypeOf = ( from , actual , notExpected ) => {
	if ( ! typeCheckers[ notExpected ] ) {
		throw new Error( "Unknown type '" + notExpected + "'." ) ;
	}

	if ( typeCheckers[ notExpected ]( actual ) ) {
		let article = VOWEL[ notExpected[ 0 ] ] ? 'an' : 'a' ;	// cosmetic
		throw assertionError( from , actual , 'not to be ' + article , notExpected ) ;
	}
} ;



// Instance
assert['to be an instance of'] =
assert.instanceOf = ( from , actual , expected ) => {
	if ( ! ( actual instanceof expected ) ) {
		throw assertionError( from , actual , 'to be an instance of' , expected ) ;
	}
} ;
assert.instanceOf.inspect = true ;



// Not instance
assert['to be not an instance of'] =
assert['to not be an instance of'] =
assert['not to be an instance of'] =
assert.notInstanceOf = ( from , actual , notExpected ) => {
	if ( actual instanceof notExpected ) {
		throw assertionError( from , actual , 'not to be an instance of' , notExpected ) ;
	}
} ;
assert.notInstanceOf.inspect = true ;



// Force failure
assert.fail = ( from , actual , middleMessage , ... expectations ) => {
	throw assertionError( from , actual , { expectationType: 'fail' , middleMessage: middleMessage } , ... expectations ) ;
} ;
assert.fail.inspect = true ;
assert.fail.none = true ;


},{"./AssertionError.js":1,"./isEqual.js":14,"./typeCheckers.js":18,"string-kit/lib/inspect.js":26}],7:[function(require,module,exports){
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



// Load doormen.js, export it, and set isBrowser to true
module.exports = require( './doormen.js' ) ;
module.exports.isBrowser = true ;

},{"./doormen.js":11}],8:[function(require,module,exports){
(function (global){(function (){
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



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.constraints ) { global.DOORMEN_GLOBAL_EXTENSIONS.constraints = {} ; }

const constraints = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.constraints ) ;
module.exports = constraints ;

const doormen = require( './core.js' ) ;
const dotPath = require( 'tree-kit/lib/dotPath.js' ) ;
const format = require( 'string-kit/lib/format.js' ).format ;



constraints.condition = function( data , params , element , clone ) {
	var source = data ,
		target = data ;

	if ( params.source ) {
		source = dotPath.get( data , params.source ) ;
	}

	if ( params.target ) {
		target = dotPath.get( data , params.target ) ;
	}

	if ( params.if ) {
		try {
			doormen( params.if , source ) ;
		}
		catch ( error ) {
			// normal case, it does not match so we have nothing to do here
			return data ;
		}
	}

	if ( params.then ) {
		target = this.check( params.then , target , element ) ;
	}

	// Restore link, if target itself was modified, or update data
	if ( params.target ) {
		dotPath.set( data , params.target , target ) ;
	}
	else {
		data = target ;
	}

	return data ;
} ;



constraints.switch = function( data , params , element , clone ) {
	var source = data ,
		target = data ;

	if ( params.source ) {
		source = dotPath.get( data , params.source ) ;
	}

	if ( params.target ) {
		target = dotPath.get( data , params.target ) ;
	}

	if ( params.case && typeof params.case === 'object' && ( source in params.case ) ) {
		target = this.check( params.case[ source ] , target , element ) ;
	}
	else if ( params.otherCases ) {
		// Use 'otherCases' instead of 'default' because 'default' is used as default values
		target = this.check( params.otherCases , target , element ) ;
	}
	else {
		return data ;
	}

	// Restore link, if target itself was modified, or update data
	if ( params.target ) {
		dotPath.set( data , params.target , target ) ;
	}
	else {
		data = target ;
	}

	return data ;
} ;



constraints.unique = function( data , params , element , clone ) {
	var i , iMax , item , uniqueValue , newData ,
		existing = new Set() ;

	if ( params.convert && ! doormen.sanitizers[ params.convert ] ) {
		if ( doormen.clientMode ) { return data ; }
		throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant sanitizer '" + params.convert + "' (used as 'convert')." ) ;
	}

	if ( ! Array.isArray( data ) ) {
		this.validatorError( element.displayPath + " should be an array to satisfy the 'unique' constraint." , element ) ;
		return ;
	}

	for ( i = 0 , iMax = data.length ; i < iMax ; i ++ ) {
		uniqueValue = item = data[ i ] ;
		if ( params.path ) { uniqueValue = dotPath.get( item , params.path ) ; }

		if ( ( params.noEmpty && ! uniqueValue ) || ( params.noNull && ( uniqueValue === null || uniqueValue === undefined ) ) ) {
			if ( ! params.resolve ) {
				this.validatorError( element.displayPath + " does not satisfy the 'unique' constraint (has null/empty value)." , element ) ;
				return ;
			}

			if ( ! newData ) { newData = data.slice( 0 , i ) ; }
			continue ;
		}

		if ( params.convert ) { uniqueValue = doormen.sanitizers[ params.convert ].call( this , uniqueValue , params , true ) ; }

		if ( existing.has( uniqueValue ) ) {
			if ( ! params.resolve ) {
				this.validatorError( element.displayPath + " does not satisfy the 'unique' constraint." , element ) ;
				return ;
			}

			if ( ! newData ) { newData = data.slice( 0 , i ) ; }
			continue ;
		}

		if ( newData ) { newData.push( item ) ; }
		existing.add( uniqueValue ) ;
	}

	return newData || data ;
} ;



constraints.compound = function( data , params , element , clone ) {
	var target , sources , value ;

	if ( ! Array.isArray( params.sources ) || typeof params.target !== 'string' || typeof params.format !== 'string' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), the 'compound' constraint needs a 'sources' array, a 'target' and a 'format' string." ) ;
	}

	target = dotPath.get( data , params.target ) ;

	if ( target && params.ifEmpty ) { return data ; }

	sources = params.sources.map( s => dotPath.get( data , s ) ) ,
	value = format( params.format , ... sources ) ;

	if ( value === target ) { return data ; }

	if ( ! params.resolve ) {
		this.validatorError( element.displayPath + " does not satisfy the 'compound' constraint." , element ) ;
		return ;
	}

	dotPath.set( data , params.target , value ) ;
	return data ;
} ;



// Reciprocal of 'compound'
constraints.extraction = function( data , params , element , clone ) {
	var i , iMax , target , source , values , value , regexp ;

	if ( ! Array.isArray( params.targets ) || typeof params.source !== 'string' || ( typeof params.match !== 'string' && ! ( params.match instanceof RegExp ) ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), the 'extraction' constraint needs a 'targets' array, a 'source' string, and a 'match' string or RegExp." ) ;
	}

	source = dotPath.get( data , params.source ) ;

	if ( typeof source !== 'string' ) {
		this.validatorError( element.displayPath + " should have a string as its '" + params.source + "' child to satisfy the 'extraction' constraint." , element ) ;
		return ;
	}

	regexp = params.match instanceof RegExp ? params.match : new RegExp( params.match , params.flags || '' ) ;
	values = source.match( regexp ) ;

	if ( ! values ) {
		this.validatorError( element.displayPath + " 's child '" + params.source + "' does not match the regular expression, hence do not to satisfy the 'extraction' constraint." , element ) ;
		return ;
	}

	for ( i = 0 , iMax = params.targets.length ; i < iMax ; i ++ ) {
		target = dotPath.get( data , params.targets[ i ] ) ;
		value = values[ i + 1 ] ;	// Because values[ 0 ] is the whole match

		if ( target && params.ifEmpty ) { continue ; }
		if ( value === target ) { continue ; }

		if ( ! params.resolve ) {
			this.validatorError( element.displayPath + " does not satisfy the 'extraction' constraint." , element ) ;
			return ;
		}

		dotPath.set( data , params.targets[ i ] , value ) ;
	}

	return data ;
} ;


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./core.js":9,"string-kit/lib/format.js":25,"tree-kit/lib/dotPath.js":33}],9:[function(require,module,exports){
(function (global){(function (){
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



/*
	doormen( schema , data )
	doormen( options , schema , data )

	options:
		* userContext: a context that can be accessed by user-land type-checker and sanitizer
		* report: activate the report mode: report as many error as possible (same as doormen.report())
		* export: activate the export mode: sanitizers export into a new object (same as doormen.export())
		* onlyConstraints: only check constraints, typically: validate a patch, apply it, then check complex constraints only
*/
function doormen( ... args ) {
	var options , data , schema , context , sanitized ;

	if ( args.length < 2 || args.length > 3 ) {
		throw new Error( 'doormen() needs at least 2 and at most 3 arguments' ) ;
	}

	if ( args.length === 2 ) { schema = args[ 0 ] ; data = args[ 1 ] ; }
	else { options = args[ 0 ] ; schema = args[ 1 ] ; data = args[ 2 ] ; }

	if ( ! schema || typeof schema !== 'object' ) {
		throw new doormen.SchemaError( 'Bad schema, it should be an object or an array of object!' ) ;
	}

	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.patch || typeof options.patch !== 'object' || Array.isArray( options.patch ) ) { options.patch = false ; }


	context = {
		userContext: options.userContext ,
		validate: true ,
		onlyConstraints: !! options.onlyConstraints ,
		errors: [] ,
		patch: options.patch ,
		check: check ,
		validatorError: validatorError ,
		report: !! options.report ,
		export: !! options.export
	} ;

	sanitized = context.check( schema , data , {
		path: '' ,
		displayPath: data === null ? 'null' : ( Array.isArray( data ) ? 'array' : typeof data ) ,	// eslint-disable-line no-nested-ternary
		key: ''
	} , false ) ;

	if ( context.report ) {
		return {
			validate: context.validate ,
			sanitized: sanitized ,
			errors: context.errors
		} ;
	}

	return sanitized ;
}

module.exports = doormen ;



// Shorthand
doormen.report = doormen.bind( doormen , { report: true } ) ;
doormen.export = doormen.bind( doormen , { export: true } ) ;
doormen.checkConstraints = doormen.bind( doormen , { onlyConstraints: true } ) ;



// Submodules
doormen.ValidatorError = require( './ValidatorError.js' ) ;
doormen.SchemaError = require( './SchemaError.js' ) ;
doormen.AssertionError = require( './AssertionError.js' ) ;

var mask = require( './mask.js' ) ;
doormen.tierMask = mask.tierMask ;
doormen.tagMask = mask.tagMask ;
doormen.getAllSchemaTags = mask.getAllSchemaTags ;

doormen.isEqual = require( './isEqual.js' ) ;
doormen.schemaSchema = require( './schemaSchema.js' ) ;

doormen.validateSchema = function( schema ) { return doormen( doormen.schemaSchema , schema ) ; } ;
doormen.purifySchema = function( schema ) { return doormen.export( doormen.schemaSchema , schema ) ; } ;



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

// Extendable things
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers ) { global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers ) { global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.filters ) { global.DOORMEN_GLOBAL_EXTENSIONS.filters = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.constraints ) { global.DOORMEN_GLOBAL_EXTENSIONS.constraints = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.defaultFunctions ) { global.DOORMEN_GLOBAL_EXTENSIONS.defaultFunctions = {} ; }

doormen.typeCheckers = require( './typeCheckers.js' ) ;
doormen.sanitizers = require( './sanitizers.js' ) ;
doormen.filters = require( './filters.js' ) ;
doormen.constraints = require( './constraints.js' ) ;
doormen.defaultFunctions = require( './defaultFunctions.js' ) ;



doormen.topLevelFilters = [ 'instanceOf' , 'min' , 'max' , 'length' , 'minLength' , 'maxLength' , 'match' , 'in' , 'notIn' , 'eq' ] ;



function check( schema , data_ , element , isPatch ) {
	var i , key , newKey , sanitizerList , keyList , data = data_ , src , returnValue , alternativeErrors ,
		constraint , bkup , addToPath ;

	if ( ! schema || typeof schema !== 'object' ) {
		throw new doormen.SchemaError( element.displayPath + " is not a schema (not an object or an array of object)." ) ;
	}

	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) {
		alternativeErrors = [] ;

		for ( i = 0 ; i < schema.length ; i ++ ) {
			try {
				// using .export() is mandatory here: we should not modify the original data
				// since we should check against alternative (and sanitize can change things, for example)
				data = doormen.export( schema[ i ] , data_ ) ;
			}
			catch( error ) {
				alternativeErrors.push( error.message.replace( /\.$/ , '' ) ) ;
				continue ;
			}

			return data ;
		}

		this.validatorError(
			element.displayPath + " does not validate any schema alternatives: ( " + alternativeErrors.join( ' ; ' ) + " )." ,
			element ) ;

		return ;
	}

	if ( ! this.onlyConstraints ) {

		// 1) Forced value, default value or optional value
		if ( schema.value !== undefined ) { return schema.value ; }

		if ( data === null ) {
			if ( schema.nullIsUndefined ) {
				data = undefined ;
			}
			else if ( ! schema.nullIsValue ) {
				if ( schema.defaultFn ) {
					if ( typeof schema.defaultFn === 'function' ) { return schema.defaultFn( schema ) ; }

					if ( doormen.defaultFunctions[ schema.defaultFn ] ) { return doormen.defaultFunctions[ schema.defaultFn ]( schema ) ; }
					else if ( ! doormen.clientMode ) { throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant default function '" + schema.defaultFn + "'." ) ; }
				}
				if ( 'default' in schema ) { return clone( schema.default ) ; }
				if ( schema.optional ) { return data ; }
			}
		}

		if ( data === undefined ) {
			// if the data has default value or is optional and its value is null or undefined, it's ok!
			if ( schema.defaultFn ) {
				if ( typeof schema.defaultFn === 'function' ) { return schema.defaultFn( schema ) ; }

				if ( doormen.defaultFunctions[ schema.defaultFn ] ) { return doormen.defaultFunctions[ schema.defaultFn ]( schema ) ; }
				else if ( ! doormen.clientMode ) { throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant default function '" + schema.defaultFn + "'." ) ; }
			}
			if ( 'default' in schema ) { return clone( schema.default ) ; }
			if ( schema.optional ) { return data ; }
		}

		// 2) apply available sanitizers before anything else
		if ( schema.sanitize ) {
			sanitizerList = Array.isArray( schema.sanitize ) ? schema.sanitize : [ schema.sanitize ] ;

			bkup = data ;

			for ( i = 0 ; i < sanitizerList.length ; i ++ ) {
				if ( ! doormen.sanitizers[ sanitizerList[ i ] ] ) {
					if ( doormen.clientMode ) { continue ; }
					throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant sanitizer '" + sanitizerList[ i ] + "'." ) ;
				}

				data = doormen.sanitizers[ sanitizerList[ i ] ].call( this , data , schema , this.export && data === data_ ) ;
			}

			// if you want patch reporting
			if ( this.patch && bkup !== data ) {
				addToPatch( this.patch , element.path , data ) ;
			}
		}

		// 3) check the type
		if ( schema.type ) {
			if ( ! doormen.typeCheckers[ schema.type ] ) {
				if ( ! doormen.clientMode ) {
					throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant type '" + schema.type + "'." ) ;
				}
			}
			else if ( ! doormen.typeCheckers[ schema.type ].call( this , data , schema ) ) {
				this.validatorError( element.displayPath + " is not a " + schema.type + "." , element ) ;
			}
		}

		// 4) check top-level built-in filters, i.e. filters that are directly named, like 'min', 'max', etc
		for ( i = 0 ; i < doormen.topLevelFilters.length ; i ++ ) {
			key = doormen.topLevelFilters[ i ] ;

			if ( schema[ key ] !== undefined ) {
				doormen.filters[ key ].call( this , data , schema[ key ] , element ) ;
			}
		}

		// 5) check filters
		if ( schema.filter ) {
			if ( typeof schema.filter !== 'object' ) {
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'filter' should be an object." ) ;
			}

			for ( key in schema.filter ) {
				if ( ! doormen.filters[ key ] ) {
					if ( doormen.clientMode ) { continue ; }
					throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant filter '" + key + "'." ) ;
				}

				doormen.filters[ key ].call( this , data , schema.filter[ key ] , element ) ;
			}
		}


		// 6) Recursivity


		// keys
		if ( schema.keys !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) ) {
			if ( ! schema.keys || typeof schema.keys !== 'object' ) {
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'keys' should contain a schema object." ) ;
			}

			if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }

			for ( key in src ) {
				addToPath = ':' + key ;
				newKey = this.check( schema.keys , key , {
					path: element.path + addToPath ,
					displayPath: element.displayPath + addToPath ,
					key: key
				} , isPatch ) ;

				if ( newKey in data && newKey !== key ) {
					this.validatorError(
						"'keys' cannot overwrite another existing key: " + element.displayPath +
						" want to rename '" + key + "' to '" + newKey + "' but it already exists." ,
						element
					) ;
				}

				data[ newKey ] = src[ key ] ;
				if ( newKey !== key ) { delete data[ key ] ; }
			}
		}
	}	// End of non-constraint-block


	// of
	if ( schema.of !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) ) {
		if ( ! schema.of || typeof schema.of !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'of' should contain a schema object." ) ;
		}

		if ( Array.isArray( data ) ) {
			if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }

			for ( i = 0 ; i < src.length ; i ++ ) {
				addToPath = '[' + i + ']' ;
				data[ i ] = this.check( schema.of , src[ i ] , {
					path: element.path + addToPath ,
					displayPath: element.displayPath + addToPath ,
					key: i
				} , isPatch ) ;
			}
		}
		else {
			if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }

			for ( key in src ) {
				addToPath = '.' + key ;
				data[ key ] = this.check( schema.of , src[ key ] , {
					path: element.path ? element.path + addToPath : key ,
					displayPath: element.displayPath + addToPath ,
					key: key
				} , isPatch ) ;
			}
		}
	}

	// properties
	if ( schema.properties !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) ) {
		if ( ! schema.properties || typeof schema.properties !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'properties' should be an object." ) ;
		}

		if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }

		keyList = new Set() ;

		if ( Array.isArray( schema.properties ) ) {
			for ( i = 0 ; i < schema.properties.length ; i ++ ) {
				key = schema.properties[ i ] ;

				if ( ! ( key in src ) ) {
					this.validatorError( element.displayPath + " does not have all required properties (" +
						JSON.stringify( schema.properties ) + ")." ,
					element ) ;
				}

				data[ key ] = src[ key ] ;
				keyList.add( key ) ;
			}
		}
		else {
			for ( key in schema.properties ) {
				if ( ! schema.properties[ key ] || typeof schema.properties[ key ] !== 'object' ) {
					throw new doormen.SchemaError( element.displayPath + '.' + key + " is not a schema (not an object or an array of object)." ) ;
				}

				keyList.add( key ) ;
				addToPath = '.' + key ;
				returnValue = this.check( schema.properties[ key ] , src[ key ] , {
					path: element.path ? element.path + addToPath : key ,
					displayPath: element.displayPath + addToPath ,
					key: key
				} , isPatch ) ;

				// Do not create new properties with undefined
				if ( returnValue !== undefined || key in src ) { data[ key ] = returnValue ; }
			}
		}

		if ( ! this.onlyConstraints && ! schema.extraProperties ) {
			for ( key in src ) {
				if ( ! keyList.has( key ) ) {
					this.validatorError( element.displayPath + " has extra properties ('" + key + "' is not in " +
						JSON.stringify( [ ... keyList ] ) + ")." ,
					element ) ;
				}
			}
		}
	}

	// elements
	if ( schema.elements !== undefined && Array.isArray( data ) ) {
		if ( ! Array.isArray( schema.elements ) ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'elements' should be an array." ) ;
		}

		if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
		else { src = data ; }

		for ( i = 0 ; i < schema.elements.length ; i ++ ) {
			addToPath = '[' + i + ']' ;
			data[ i ] = this.check( schema.elements[ i ] , src[ i ] , {
				path: element.path + addToPath ,
				displayPath: element.displayPath + addToPath ,
				key: i
			} , isPatch ) ;
		}

		if ( ! schema.extraElements && src.length > schema.elements.length ) {
			this.validatorError( element.displayPath + " has extra elements (" +
				src.length + " instead of " + schema.elements.length + ")." ,
			element ) ;
		}
	}


	// 7) Constraints

	// There is no constraint check for patch: it's not possible since we only get partial data
	if ( schema.constraints && ! isPatch ) {
		if ( ! Array.isArray( schema.constraints ) ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'constraints' should be an object." ) ;
		}

		if ( ! data || typeof data !== 'object' ) {
			this.validatorError( element.displayPath + " has a constraints but is not an object." , element ) ;
		}

		bkup = data ;

		for ( i = 0 ; i < schema.constraints.length ; i ++ ) {
			constraint = schema.constraints[ i ] ;

			if ( ! constraint || typeof constraint !== 'object' ) {
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), constraints #" + i + " should be an object." ) ;
			}

			if ( ! doormen.constraints[ constraint.enforce ] ) {
				if ( doormen.clientMode ) { continue ; }
				throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), unexistant constraints '" + constraint.enforce + "'." ) ;
			}

			data = doormen.constraints[ constraint.enforce ].call( this , data , constraint , element , this.export && data === data_ ) ;
		}

		// if you want patch reporting
		if ( this.patch && bkup !== data ) {
			addToPatch( this.patch , element.path , data ) ;
		}
	}

	return data ;
}



const clone_ = require( 'tree-kit/lib/clone.js' ) ;

function clone( value ) {
	if ( value && typeof value === 'object' ) { return clone_( value ) ; }
	return value ;
}



// This function is used to add a new patch entry and discard any children entries
function addToPatch( patch , path , data ) {
	var innerPath , prefix ;

	patch[ path ] = data ;
	prefix = path + '.' ;

	for ( innerPath in patch ) {
		if ( innerPath.startsWith( prefix ) ) {
			// Found a child entry, delete it
			delete patch[ innerPath ] ;
		}
	}
}



doormen.path = function( schema , path , noSubmasking = false , noOpaque = false ) {
	var index = 0 ;

	if ( ! Array.isArray( path ) ) {
		if ( typeof path !== 'string' ) { throw new Error( "Argument #1 'path' should be a string or an array" ) ; }
		path = path.split( '.' ) ;
	}

	if ( ! schema || typeof schema !== 'object' ) {
		throw new doormen.SchemaError( schema + " is not a schema (not an object or an array of object)." ) ;
	}

	// Skip empty path
	while ( index < path.length && ! path[ index ] ) { index ++ ; }

	return schemaPath_( schema , path , index , noSubmasking , noOpaque ) ;
} ;



function schemaPath_( schema , path , index , noSubmasking , noOpaque ) {
	var key ;

	// Found it! return now!
	if ( index >= path.length ) { return schema ; }

	if ( noOpaque && schema.opaque ) {
		throw new doormen.ValidatorError( "Path leading inside an opaque object." ) ;
	}

	if ( noSubmasking && schema.noSubmasking ) { return null ; }

	key = path[ index ] ;


	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) { throw new Error( "Schema alternatives are not supported for path matching ATM." ) ; }

	// 1) Recursivity
	if ( schema.properties !== undefined ) {
		if ( ! schema.properties || typeof schema.properties !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + path + "), 'properties' should be an object." ) ;
		}

		if ( schema.properties[ key ] ) {
			//path.shift() ;
			return schemaPath_( schema.properties[ key ] , path , index + 1 , noSubmasking , noOpaque ) ;
		}
		else if ( ! schema.extraProperties ) {
			throw new doormen.SchemaError( "Bad path (at " + path + "), property '" + key + "' not found and the schema does not allow extra properties." ) ;
		}
	}

	if ( schema.of !== undefined ) {
		if ( ! schema.of || typeof schema.of !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + path + "), 'of' should contain a schema object." ) ;
		}

		//path.shift() ;
		return schemaPath_( schema.of , path , index + 1 , noSubmasking , noOpaque ) ;
	}

	// "element" is not supported ATM
	//if ( schema.elements !== undefined ) {}

	// Sub-schema not found, it should be open to anything, so return {}
	return {} ;
}



// Manage recursivity when dealing with schemas and data
// ----------------------------------------------------------------------------------------------------------- TODO ----------------------------------------------------
// The main check() function should use it
/*
doormen.dataWalker = function( ctx , fn ) {
	var key , ret , count , deleted , alternativeErrors ,
		schema = ctx.schema ;

	/*
	if ( Array.isArray( schema ) ) {
		alternativeErrors = [] ;
		count = deleted = 0 ;

		for ( key = 0 ; key < schema.length ; key ++ ) {
			count ++ ;

			try {
			ret = doormen.dataWalker( {
				schema: ctx.schema[ key ] ,
				schemaPath: ctx.schemaPath.concat( key ) ,
				alternative: true ,
				options: ctx.options
			} ) ;

			if ( ret !== ctx.schema[ key ] ) {
				if ( schema === ctx.schema ) { schema = Array.from( ctx.schema ) ; }

				schema[ key ] = ret ;
				if ( ret === undefined ) { deleted ++ ; }
			}
		}

		// Because deleted is true, schema is already a clone
		if ( deleted && count === deleted ) { schema = undefined ; }
		return schema ;
	}
	*//*

	if ( ctx.schema.properties && typeof ctx.schema.properties === 'object' ) {
		count = deleted = 0 ;

		for ( key in ctx.schema.properties ) {
			count ++ ;
			ret = fn( {
				schema: ctx.schema.properties[ key ] ,
				schemaPath: ctx.schemaPath.concat( 'properties' , key ) ,
				options: ctx.options
			} ) ;

			if ( ret !== ctx.schema.properties[ key ] ) {
				if ( schema === ctx.schema ) { schema = Object.assign( {} , ctx.schema ) ; }
				if ( schema.properties === ctx.schema.properties ) { schema.properties = Object.assign( {} , ctx.schema.properties ) ; }

				if ( ret === undefined ) {
					delete schema.properties[ key ] ;
					deleted ++ ;
					if ( ctx.options && ctx.options.extraProperties ) { schema.extraProperties = true ; }
				}
				else {
					schema.properties[ key ] = ret ;
				}
			}
		}

		// Because deleted is true, schema is already a clone
		if ( deleted && count === deleted ) { delete schema.properties ; }
		if ( deleted && ctx.options && ctx.options.extraProperties ) { schema.extraProperties = true ; }
	}

	if ( schema.of !== undefined && ( data && ( typeof data === 'object' || typeof data === 'function' ) ) ) {
		if ( ! schema.of || typeof schema.of !== 'object' ) {
			throw new doormen.SchemaError( "Bad schema (at " + element.displayPath + "), 'of' should contain a schema object." ) ;
		}

		if ( Array.isArray( data ) ) {
			if ( this.export && data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }

			for ( i = 0 ; i < src.length ; i ++ ) {
				addToPath = '[' + i + ']' ;
				data[ i ] = this.check( schema.of , src[ i ] , {
					path: element.path + addToPath ,
					displayPath: element.displayPath + addToPath ,
					key: i
				} , isPatch ) ;
			}
		}
		else {
			if ( this.export && data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }

			for ( key in src ) {
				addToPath = '.' + key ;
				data[ key ] = this.check( schema.of , src[ key ] , {
					path: element.path ? element.path + addToPath : key ,
					displayPath: element.displayPath + addToPath ,
					key: key
				} , isPatch ) ;
			}
		}

		// ----------------------------------------------------------------------------------------------------------

		ret = fn( {
			schema: ctx.schema.of ,
			schemaPath: ctx.schemaPath.concat( 'of' ) ,
			options: ctx.options
		} ) ;

		if ( ret !== ctx.schema.of ) {
			if ( schema === ctx.schema ) { schema = Object.assign( {} , ctx.schema ) ; }

			if ( ret === undefined ) { delete schema.of ; }
			else { schema.of = ret ; }
		}
	}

	if ( schema.elements && Array.isArray( schema.elements ) ) {
		count = deleted = 0 ;

		for ( key = 0 ; key < schema.elements.length ; key ++ ) {
			count ++ ;
			ret = fn( {
				schema: ctx.schema.elements[ key ] ,
				schemaPath: ctx.schemaPath.concat( 'elements' , key ) ,
				options: ctx.options
			} ) ;

			if ( ret !== ctx.schema.elements[ key ] ) {
				if ( schema === ctx.schema ) { schema = Object.assign( {} , ctx.schema ) ; }
				if ( schema.elements === ctx.schema.elements ) { schema.elements = Array.from( ctx.schema.elements ) ; }

				schema.elements[ key ] = ret ;
				if ( ret === undefined ) { deleted ++ ; }
			}
		}

		// Because deleted is true, schema is already a clone
		if ( deleted && count === deleted ) { delete schema.elements ; }
	}

	return schema ;
} ;
*/



// Manage recursivity when dealing with schemas
doormen.schemaWalker = function( ctx , fn ) {
	var key , ret , count , deleted ,
		schema = ctx.schema ;

	if ( Array.isArray( schema ) ) {
		count = deleted = 0 ;

		for ( key = 0 ; key < schema.length ; key ++ ) {
			count ++ ;
			ret = doormen.schemaWalker( {
				schema: ctx.schema[ key ] ,
				schemaPath: ctx.schemaPath.concat( key ) ,
				options: ctx.options
			} ) ;

			if ( ret !== ctx.schema[ key ] ) {
				if ( schema === ctx.schema ) { schema = Array.from( ctx.schema ) ; }

				schema[ key ] = ret ;
				if ( ret === undefined ) { deleted ++ ; }
			}
		}

		// Because deleted is true, schema is already a clone
		if ( deleted && count === deleted ) { schema = undefined ; }
		return schema ;
	}

	if ( ctx.schema.properties && typeof ctx.schema.properties === 'object' ) {
		count = deleted = 0 ;

		for ( key in ctx.schema.properties ) {
			count ++ ;
			ret = fn( {
				schema: ctx.schema.properties[ key ] ,
				schemaPath: ctx.schemaPath.concat( 'properties' , key ) ,
				options: ctx.options
			} ) ;

			if ( ret !== ctx.schema.properties[ key ] ) {
				if ( schema === ctx.schema ) { schema = Object.assign( {} , ctx.schema ) ; }
				if ( schema.properties === ctx.schema.properties ) { schema.properties = Object.assign( {} , ctx.schema.properties ) ; }

				if ( ret === undefined ) {
					delete schema.properties[ key ] ;
					deleted ++ ;
					if ( ctx.options && ctx.options.extraProperties ) { schema.extraProperties = true ; }
				}
				else {
					schema.properties[ key ] = ret ;
				}
			}
		}

		// Because deleted is true, schema is already a clone
		if ( deleted && count === deleted ) { delete schema.properties ; }
		if ( deleted && ctx.options && ctx.options.extraProperties ) { schema.extraProperties = true ; }
	}

	if ( schema.of && typeof schema.of === 'object' ) {
		ret = fn( {
			schema: ctx.schema.of ,
			schemaPath: ctx.schemaPath.concat( 'of' ) ,
			options: ctx.options
		} ) ;

		if ( ret !== ctx.schema.of ) {
			if ( schema === ctx.schema ) { schema = Object.assign( {} , ctx.schema ) ; }

			if ( ret === undefined ) { delete schema.of ; }
			else { schema.of = ret ; }
		}
	}

	if ( schema.elements && Array.isArray( schema.elements ) ) {
		count = deleted = 0 ;

		for ( key = 0 ; key < schema.elements.length ; key ++ ) {
			count ++ ;
			ret = fn( {
				schema: ctx.schema.elements[ key ] ,
				schemaPath: ctx.schemaPath.concat( 'elements' , key ) ,
				options: ctx.options
			} ) ;

			if ( ret !== ctx.schema.elements[ key ] ) {
				if ( schema === ctx.schema ) { schema = Object.assign( {} , ctx.schema ) ; }
				if ( schema.elements === ctx.schema.elements ) { schema.elements = Array.from( ctx.schema.elements ) ; }

				schema.elements[ key ] = ret ;
				if ( ret === undefined ) { deleted ++ ; }
			}
		}

		// Because deleted is true, schema is already a clone
		if ( deleted && count === deleted ) { delete schema.elements ; }
	}

	return schema ;
} ;



doormen.constraintSchema = function( schema ) {
	return constraintSchema_( {
		schema: schema ,
		schemaPath: [] ,
		options: { extraProperties: true }
	} ) ;
} ;



function constraintSchema_( ctx ) {
	var schema = doormen.schemaWalker( ctx , constraintSchema_ ) ;

	if ( Array.isArray( schema ) ) { return schema ; }

	if ( schema === ctx.schema ) {
		if ( ! schema.constraints ) { return ; }
		schema = Object.assign( {} , ctx.schema ) ;
	}

	delete schema.type ;
	delete schema.sanitize ;
	delete schema.filter ;

	return schema ;
}



// Get the tier of a patch, i.e. the highest tier for all path of the patch.
doormen.patchTier = function( schema , patch ) {
	var i , iMax , path ,
		maxTier = 1 ,
		paths = Object.keys( patch ) ;

	for ( i = 0 , iMax = paths.length ; i < iMax ; i ++ ) {
		path = paths[ i ].split( '.' ) ;

		while ( path.length ) {
			maxTier = Math.max( maxTier , doormen.path( schema , path ).tier || 1 ) ;
			path.pop() ;
		}
	}

	return maxTier ;
} ;



// Check if a patch is allowed by a tag-list
doormen.checkPatchByTags = function( schema , patch , allowedTags ) {
	var path ;

	if ( ! ( allowedTags instanceof Set ) ) {
		if ( Array.isArray( allowedTags ) ) { allowedTags = new Set( allowedTags ) ; }
		else { allowedTags = new Set( [ allowedTags ] ) ; }
	}

	for ( path in patch ) {
		checkOnePatchPathByTags( schema , path , allowedTags , patch[ path ] ) ;
	}
} ;



function checkOnePatchPathByTags( schema , path , allowedTags , element ) {
	var subSchema , tag , found ;

	path = path.split( '.' ) ;

	while ( path.length ) {
		subSchema = doormen.path( schema , path ) ;

		if ( subSchema.tags ) {
			found = false ;

			for ( tag of subSchema.tags ) {
				if ( allowedTags.has( tag ) ) {
					found = true ;
					break ;
				}
			}

			if ( ! found ) {
				if ( this && this.validatorError ) { this.validatorError( "Not allowed by tags" , element ) ; }
				else { throw new doormen.ValidatorError( "Not allowed by tags" , element ) ; }
			}
		}

		path.pop() ;
	}
}



/*
	doormen.patch( schema , patch )
	doormen.patch( options , schema , patch )

	Validate the 'patch' format
*/
doormen.patch = function( ... args ) {
	var patch , path , value ,
		schema , subSchema ,
		sanitized , options , context , patchCommandName ;


	// Share a lot of code with the doormen() function


	if ( args.length < 2 || args.length > 3 ) {
		throw new Error( 'doormen.patch() needs at least 2 and at most 3 arguments' ) ;
	}

	if ( args.length === 2 ) { schema = args[ 0 ] ; patch = args[ 1 ] ; }
	else { options = args[ 0 ] ; schema = args[ 1 ] ; patch = args[ 2 ] ; }

	if ( ! schema || typeof schema !== 'object' ) {
		throw new doormen.SchemaError( 'Bad schema, it should be an object or an array of object!' ) ;
	}

	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	// End of common part

	if ( ! patch || typeof patch !== 'object' ) { throw new Error( 'The patch should be an object' ) ; }

	// If in the 'export' mode, create a new object, else modify it in place

	sanitized = options.export ? {} : patch ;

	context = {
		userContext: options.userContext ,
		validate: true ,
		errors: [] ,
		check: check ,
		checkAllowed: options.allowedTags ? checkOnePatchPathByTags : null ,
		allowedTags: options.allowedTags ?
			new Set( Array.isArray( options.allowedTags ) ? options.allowedTags : [ options.allowedTags ] ) :
			null ,
		validatorError: validatorError ,
		report: !! options.report ,
		export: !! options.export
	} ;

	for ( path in patch ) {
		value = patch[ path ] ;

		// Don't try-catch! Let it throw!
		if ( context.checkAllowed ) { context.checkAllowed( schema , path , context.allowedTags , value ) ; }

		if ( ( patchCommandName = isPatchCommand( value ) ) ) {
			value = value[ patchCommandName ] ;

			if ( patchCommands[ patchCommandName ].getValue ) {
				value = patchCommands[ patchCommandName ].getValue( value ) ;
			}

			if ( patchCommands[ patchCommandName ].applyToChildren ) {
				subSchema = doormen.path( schema , path , undefined , true ).of || {} ;
			}
			else {
				subSchema = doormen.path( schema , path , undefined , true ) ;
			}

			if ( patchCommands[ patchCommandName ].sanitize ) {
				sanitized[ path ][ patchCommandName ] = patchCommands[ patchCommandName ].sanitize( value ) ;
				context.check( subSchema , value , {
					displayPath: 'patch.' + path ,
					path: path ,
					key: path
				} , true ) ;
			}
			else {
				sanitized[ path ][ patchCommandName ] = context.check( subSchema , value , {
					displayPath: 'patch.' + path ,
					path: path ,
					key: path
				} , true ) ;
			}
		}
		else {
			subSchema = doormen.path( schema , path , undefined , true ) ;

			//sanitized[ path ] = doormen( options , subSchema , value ) ;
			sanitized[ path ] = context.check( subSchema , value , {
				displayPath: 'patch.' + path ,
				path: path ,
				key: path
			} , true ) ;
		}
	}

	if ( context.report ) {
		return {
			validate: context.validate ,
			sanitized: sanitized ,
			errors: context.errors
		} ;
	}

	return sanitized ;
} ;



// Shorthand
doormen.patch.report = doormen.patch.bind( doormen , { report: true } ) ;
doormen.patch.export = doormen.patch.bind( doormen , { export: true } ) ;



const dotPath = require( 'tree-kit/lib/dotPath.js' ) ;

doormen.applyPatch = function( data , patch ) {
	var path , value , patchCommandName ;

	if ( ! patch || typeof patch !== 'object' ) { throw new Error( 'The patch should be an object' ) ; }

	for ( path in patch ) {
		value = patch[ path ] ;

		if ( ( patchCommandName = isPatchCommand( value ) ) ) {
			patchCommands[ patchCommandName ]( data , path , value[ patchCommandName ] ) ;
		}
		else {
			dotPath.set( data , path , value ) ;
		}
	}

	return data ;
} ;



function isPatchCommand( value ) {
	var key ;

	if ( ! value || typeof value !== 'object' ) { return false ; }

	for ( key in value ) {
		if ( key[ 0 ] !== '$' ) { return false ; }

		if ( ! patchCommands[ key ] ) {
			throw new Error( "Bad command '" + key + "'" ) ;
		}

		return key ;
	}
}

const patchCommands = {} ;

patchCommands.$set = ( data , path , value ) => dotPath.set( data , path , value ) ;

patchCommands.$delete = patchCommands.$unset = ( data , path ) => dotPath.delete( data , path ) ;
patchCommands.$delete.getValue = () => undefined ;
patchCommands.$delete.sanitize = () => true ;

patchCommands.$push = ( data , path , value ) => dotPath.append( data , path , value ) ;
patchCommands.$push.applyToChildren = true ;



/* Specific Error class */



function validatorError( message , element ) {
	var error = new doormen.ValidatorError( message , element ) ;

	this.validate = false ;

	if ( this.report ) {
		this.errors.push( error ) ;
	}
	else {
		throw error ;
	}
}



/* Extend */



function extend( base , extension , overwrite ) {
	var key ;

	if ( ! extension || typeof extension !== 'object' || Array.isArray( extension ) ) {
		throw new TypeError( '[doormen] .extend*(): Argument #0 should be a plain object' ) ;
	}

	for ( key in extension ) {
		if ( ( ( key in base ) && ! overwrite ) || typeof extension[ key ] !== 'function' ) { continue ; }
		base[ key ] = extension[ key ] ;
	}
}



doormen.extendTypeCheckers = function( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers , extension , overwrite ) ; } ;
doormen.extendSanitizers = function( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers , extension , overwrite ) ; } ;
doormen.extendFilters = function( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.filters , extension , overwrite ) ; } ;
doormen.extendConstraints = function( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.constraints , extension , overwrite ) ; } ;
doormen.extendDefaultFunctions = function( extension , overwrite ) { extend( global.DOORMEN_GLOBAL_EXTENSIONS.defaultFunctions , extension , overwrite ) ; } ;

// Client mode does not throw when type checker, a sanitizer or a filter is not found
doormen.clientMode = false ;
doormen.setClientMode = function( clientMode ) { doormen.clientMode = !! clientMode ; } ;





/* Assertion specific utilities */



doormen.shouldThrow = function shouldThrow( fn , from ) {
	var thrown = false ;
	from = from || shouldThrow ;

	try { fn() ; }
	catch ( error ) { thrown = true ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown." , from ) ;
	}
} ;



doormen.shouldReject = async function shouldReject( fn , from ) {
	var thrown = false ;
	from = from || shouldReject ;

	try { await fn() ; }
	catch ( error ) { thrown = true ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have rejected." , from ) ;
	}
} ;



// For internal usage or dev only
doormen.shouldThrowAssertion = function shouldThrowAssertion( fn , from ) {
	var error , thrown = false ;
	from = from || shouldThrowAssertion ;

	try { fn() ; }
	catch ( error_ ) { thrown = true ; error = error_ ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown." , from ) ;
	}
	if ( ! ( error instanceof doormen.AssertionError ) ) {
		// Throw a new error? Seems better to re-throw with a modified message, or the stack trace would be lost?
		//throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown an AssertionError, but have thrown: " + error , from ) ;
		error.message = "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown an AssertionError, instead it had thrown: " + error.message ;
		throw error ;
	}

	return error ;
} ;



// For internal usage or dev only
doormen.shouldRejectAssertion = async function shouldRejectAssertion( fn , from ) {
	var error , thrown = false ;
	from = from || shouldRejectAssertion ;

	try { await fn() ; }
	catch ( error_ ) { thrown = true ; error = error_ ; }

	if ( ! thrown ) {
		throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have rejected." , from ) ;
	}
	if ( ! ( error instanceof doormen.AssertionError ) ) {
		// Throw a new error? Seems better to re-throw with a modified message, or the stack trace would be lost?
		//throw new doormen.AssertionError( "Function '" + ( fn.name || '(anonymous)' ) + "' should have thrown an AssertionError, but have thrown: " + error , from ) ;
		error.message = "Function '" + ( fn.name || '(anonymous)' ) + "' should have rejected with an AssertionError, instead it had rejected with: " + error.message ;
		throw error ;
	}

	return error ;
} ;



// Inverse validation
doormen.not = function not( ... args ) {
	doormen.shouldThrow( () => {
		doormen( ... args ) ;
	} , not ) ;
} ;



// Inverse of constraints-only validation
doormen.checkConstraints.not = function checkConstraintsNot( ... args ) {
	doormen.shouldThrow( () => {
		doormen.constraints( ... args ) ;
	} , checkConstraintsNot ) ;
} ;



// Inverse validation for patch
doormen.patch.not = function patchNot( ... args ) {
	doormen.shouldThrow( () => {
		doormen.patch( ... args ) ;
	} , patchNot ) ;
} ;



// DEPRECATED assertions! Only here for backward compatibility

doormen.equals = function equals( left , right ) {
	if ( ! doormen.isEqual( left , right ) ) {
		throw new doormen.AssertionError( 'should have been equal' , equals , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;



// Inverse of equals
doormen.not.equals = function notEquals( left , right ) {
	if ( doormen.isEqual( left , right ) ) {
		throw new doormen.AssertionError( 'should not have been equal' , notEquals , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;



const IS_EQUAL_LIKE = { like: true } ;

doormen.alike = function alike( left , right ) {
	if ( ! doormen.isEqual( left , right , IS_EQUAL_LIKE ) ) {
		throw new doormen.AssertionError( 'should have been alike' , alike , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;



// Inverse of alike
doormen.not.alike = function notAlike( left , right ) {
	if ( doormen.isEqual( left , right , IS_EQUAL_LIKE ) ) {
		throw new doormen.AssertionError( 'should not have been alike' , notAlike , {
			actual: left ,
			expected: right ,
			showDiff: true
		} ) ;
	}
} ;


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AssertionError.js":1,"./SchemaError.js":4,"./ValidatorError.js":5,"./constraints.js":8,"./defaultFunctions.js":10,"./filters.js":13,"./isEqual.js":14,"./mask.js":15,"./sanitizers.js":16,"./schemaSchema.js":17,"./typeCheckers.js":18,"tree-kit/lib/clone.js":32,"tree-kit/lib/dotPath.js":33}],10:[function(require,module,exports){
(function (global){(function (){
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



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.defaultFunctions ) { global.DOORMEN_GLOBAL_EXTENSIONS.defaultFunctions = {} ; }

const defaultFunctions = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.defaultFunctions ) ;
module.exports = defaultFunctions ;

defaultFunctions.now = () => new Date() ;


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
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
module.exports = doormen ;

doormen.isBrowser = false ;



// Other modules that are not necessary required for browser (for smallest build)
doormen.assert = require( './assert.js' ) ;
doormen.expect = require( './expect.js' ) ;

doormen.Form = require( './Form.js' ) ;


},{"./Form.js":2,"./assert.js":6,"./core.js":9,"./expect.js":12}],12:[function(require,module,exports){
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



//const AssertionError = require( './AssertionError.js' ) ;
const assert = require( './assert.js' ) ;



const ExpectPrototype = {} ;
ExpectPrototype.inspect = function() { return this ; } ;
ExpectPrototype.toString = function() { return '' + this ; } ;



function factory( hooks = {} ) {

	var ExpectFn = function Expect( value , expectationType , ... args ) {

		// Direct usage, e.g.: expect( actual , "to equal" , expected )
		if ( expectationType ) {
			if ( ! assert[ expectationType ] ) {
				throw new Error( "Unknown expectationType '" + expectationType + "'." ) ;
			}

			return assert[ expectationType ]( Expect , value , ... args ) ;
		}

		// Sadly, Proxy are not callable on regular object, so the target has to be a function.
		// The name is purposedly the same.
		var assertion = function Expect() {} ;	// eslint-disable-line no-shadow

		if ( arguments.length ) { assertion.value = value ; }
		else { assertion.value = assert.NONE ; }

		assertion.expectationType = null ;
		assertion.fnArgs = null ;	// Extra-values, for function arguments
		assertion.isPromise = false ;	// true if it is asynchronous
		assertion.expectFn = ExpectFn ;
		assertion.proxy = new Proxy( assertion , handler ) ;

		return assertion.proxy ;
	} ;

	ExpectFn.hooks = hooks ;
	ExpectFn.stats = {
		ok: 0 ,
		fail: 0
	} ;
	ExpectFn.prototype = ExpectPrototype ;

	return ExpectFn ;
}



module.exports = factory() ;
module.exports.factory = factory ;



var expectation = {} ;

// Set arguments for a function call
expectation['with args'] =
expectation.with =
expectation.args =
expectation.withArgs = ( expect , ... args ) => {
	if ( ! expect.fnArgs ) { expect.fnArgs = [ null , ... args ] ; }
	else { expect.fnArgs = [ expect.fnArgs[ 0 ] , ... args ] ; }
} ;

// Set the 'this' binding of a method
expectation['method of'] = ( expect , object ) => {
	if ( ! expect.fnArgs ) { expect.fnArgs = [ object ] ; }
	else { expect.fnArgs[ 0 ] = object ; }

	if ( typeof expect.value !== 'function' ) {
		expect.value = object[ expect.value ] ;
	}
} ;



var handler = {
	get: ( target , property ) => {
		// First, check special flags
		if ( property === 'eventually' ) {
			target.isPromise = true ;
			return target.proxy ;
		}

		if ( typeof property === 'string' && ! Function.prototype[ property ] && ! Object.prototype[ property ] && ! ExpectPrototype[ property ] ) {
			//console.error( ">>> inside" ) ;
			if ( target.expectationType ) { target.expectationType += ' ' + property ; }
			else { target.expectationType = property ; }

			return target.proxy ;
		}

		if ( ExpectPrototype[ property ] && ! target[ property ] ) {
			target[ property ] = ExpectPrototype[ property ] ;
		}

		if ( typeof target[ property ] === 'function' ) {
			return target[ property ].bind( target ) ;
		}

		return target[ property ] ;
	} ,
	apply: ( target , thisArg , args ) => {
		var fn , promise , traceError ;

		fn = expectation[ target.expectationType ] ;

		if ( fn ) {
			// Composition operators
			target.expectationType = null ;
			fn( target , ... args ) ;
			return target.proxy ;
		}

		fn = assert[ target.expectationType ] ;

		if ( ! fn ) {
			throw new Error( "Unknown expectationType '" + target.expectationType + "'." ) ;
		}

		if ( target.isPromise ) {
			if ( ! fn.promise ) {
				// If it's a promise, resolve it and then call the proxy again

				// First keep the stack trace
				traceError = new Error() ;
				if ( Error.captureStackTrace ) { Error.captureStackTrace( traceError , handler.apply ) ; }

				return Promise.resolve( target.value )
					.then(
						value => {
							target.value = value ;
							target.isPromise = false ;
							target.proxy( ... args ) ;
						} ,
						() => {
							target.expectFn.stats.fail ++ ;
							if ( target.expectFn.hooks.fail ) { target.expectFn.hooks.fail() ; }
							throw assert.__assertionError__( traceError , target.value , "to resolve" ) ;
						}
					) ;
			}

			if ( typeof fn.promise === 'function' ) { fn = fn.promise ; }
		}

		if ( fn.async ) {
			// First keep the stack trace
			traceError = new Error() ;
			if ( Error.captureStackTrace ) { Error.captureStackTrace( traceError , handler.apply ) ; }

			if ( fn.fnParams ) {
				promise = fn( traceError , target.value , target.fnArgs , ... args ) ;
			}
			else {
				promise = fn( traceError , target.value , ... args ) ;
			}

			return promise.then(
				() => {
					target.expectFn.stats.ok ++ ;
					if ( target.expectFn.hooks.ok ) { target.expectFn.hooks.ok() ; }
				} ,
				error => {
					target.expectFn.stats.fail ++ ;
					if ( target.expectFn.hooks.fail ) { target.expectFn.hooks.fail() ; }
					throw error ;
				}
			) ;
		}

		try {
			if ( fn.fnParams ) {
				fn( handler.apply , target.value , target.fnArgs , ... args ) ;
			}
			else {
				fn( handler.apply , target.value , ... args ) ;
			}

			target.expectFn.stats.ok ++ ;
			if ( target.expectFn.hooks.ok ) { target.expectFn.hooks.ok() ; }
		}
		catch ( error ) {
			target.expectFn.stats.fail ++ ;
			if ( target.expectFn.hooks.fail ) { target.expectFn.hooks.fail() ; }
			throw error ;
		}
	}
} ;


},{"./assert.js":6}],13:[function(require,module,exports){
(function (global){(function (){
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



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.filters ) { global.DOORMEN_GLOBAL_EXTENSIONS.filters = {} ; }

const filters = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.filters ) ;
module.exports = filters ;

const doormen = require( './core.js' ) ;



filters.instanceOf = function( data , params , element ) {
	if ( typeof params === 'string' ) {
		params = doormen.isBrowser ?
			window[ params ] :
			global[ params ] ;
	}

	if ( typeof params !== 'function' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'instanceOf' should be a function or a global function's name." ) ;
	}

	if ( ! ( data instanceof params ) ) {
		this.validatorError( element.path + " is not an instance of " + params + "." , element ) ;
	}
} ;



filters.eq = filters[ '===' ] = function( data , params , element ) {
	if ( data !== params ) {
		this.validatorError( element.path + " is not stricly equal to " + params + "." , element ) ;
	}
} ;



filters.min = filters.gte = filters.greaterThanOrEqual = filters[ '>=' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'min' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data >= params ) )	{
		this.validatorError( element.path + " is not greater than or equal to " + params + "." , element ) ;
	}
} ;



filters.max = filters.lte = filters.lesserThanOrEqual = filters[ '<=' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'max' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data <= params ) )	{
		this.validatorError( element.path + " is not lesser than or equal to " + params + "." , element ) ;
	}
} ;



filters.gt = filters.greaterThan = filters[ '>' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'greaterThan' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data > params ) ) {
		this.validatorError( element.path + " is not greater than " + params + "." , element ) ;
	}
} ;



filters.lt = filters.lesserThan = filters[ '<' ] = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'lesserThan' should be a number." ) ;
	}

	// Negative test here, because of NaN
	if ( typeof data !== 'number' || ! ( data < params ) ) {
		this.validatorError( element.path + " is not lesser than " + params + "." , element ) ;
	}
} ;



filters.length = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'length' should be a number." ) ;
	}

	// Nasty tricks ;)
	try {
		if ( ! ( data.length === params ) ) { throw true ; }
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length equal to " + params + "." , element ) ;
	}
} ;



filters.minLength = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'minLength' should be a number." ) ;
	}

	// Nasty tricks ;)
	try {
		if ( ! ( data.length >= params ) ) { throw true ; }
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length greater than or equal to " + params + "." , element ) ;
	}
} ;



filters.maxLength = function( data , params , element ) {
	if ( typeof params !== 'number' ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'maxLength' should be a number." ) ;
	}

	// Nasty tricks ;)
	try {
		if ( ! ( data.length <= params ) ) { throw true ; }
	}
	catch ( error ) {
		this.validatorError( element.path + " has not a length lesser than or equal to " + params + "." , element ) ;
	}
} ;



filters.match = function( data , params , element ) {
	if ( typeof params !== 'string' && ! ( params instanceof RegExp ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'match' should be a RegExp or a string." ) ;
	}

	if ( params instanceof RegExp ) {
		if ( typeof data !== 'string' || ! data.match( params ) ) {
			this.validatorError( element.path + " does not match " + params + " ." , element ) ;
		}
	}
	else if ( typeof data !== 'string' || ! data.match( new RegExp( params ) ) ) {
		this.validatorError( element.path + " does not match /" + params + "/ ." , element ) ;
	}
} ;



filters.in = function( data , params , element ) {
	var i , found = false ;

	if ( ! Array.isArray( params ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'in' should be an array." ) ;
	}

	for ( i = 0 ; i < params.length ; i ++ ) {
		if ( doormen.isEqual( data , params[ i ] ) ) { found = true ; break ; }
	}

	if ( ! found ) {
		this.validatorError( element.path + " should be in " + JSON.stringify( params ) + "." , element ) ;
	}
} ;



filters.notIn = function( data , params , element ) {
	var i ;

	if ( ! Array.isArray( params ) ) {
		throw new doormen.SchemaError( "Bad schema (at " + element.path + "), 'not-in' should be an array." ) ;
	}

	for ( i = 0 ; i < params.length ; i ++ ) {
		if ( doormen.isEqual( data , params[ i ] ) ) {
			this.validatorError( element.path + " should not be in " + JSON.stringify( params ) + "." , element ) ;
		}
	}
} ;


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./core.js":9}],14:[function(require,module,exports){
(function (Buffer){(function (){
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



const DEFAULT_OPTIONS = {} ;
const EPSILON_DELTA_RATE = 1 + 4 * Number.EPSILON ;
const EPSILON_ZERO_DELTA = 4 * Number.MIN_VALUE ;

/*
	Should be FAST! Some critical application parts are depending on it.
	When a reporter will be coded, it should be plugged in a way that does not slow it down.

	Options:
		like: if true, the prototype of object are not compared
		oneWay: if true, check partially, e.g.:
			{ a: 1 , b: 2 } and { a: 1 , b: 2 , c: 3 } DOES pass the test
			but the reverse { a: 1 , b: 2 , c: 3 } and { a: 1 , b: 2 } DOES NOT pass the test
		around: numbers are checked epsilon-aware
		unordered: arrays are equals whenever they have all elements in common, whatever the order
*/
function isEqual( left , right , options = DEFAULT_OPTIONS ) {
	var runtime = {
		leftStack: [] ,
		rightStack: [] ,
		like: !! options.like ,
		oneWay: !! options.oneWay ,
		around: !! options.around ,
		unordered: !! options.unordered
	} ;

	return isEqual_( runtime , left , right ) ;
}



function isEqual_( runtime , left , right ) {
	var index , indexMax , index2 , index2Max , found , indexUsed , keys , key , leftIndexOf , rightIndexOf , recursiveTest ,
		valueOfLeft , valueOfRight , leftProto , rightProto , leftConstructor , rightConstructor ;

	// If it's strictly equals, then early exit now.
	if ( left === right ) { return true ; }

	// If the type mismatch exit now.
	if ( typeof left !== typeof right ) { return false ; }

	// Below, left and rights have the same type

	if ( typeof left === 'number' ) {
		// NaN check
		if ( Number.isNaN( left ) && Number.isNaN( right ) ) { return true ; }

		// Epsilon error
		if ( runtime.around ) {
			if ( left === 0 || right === 0 ) {
				if ( left <= right + EPSILON_ZERO_DELTA && right <= left + EPSILON_ZERO_DELTA ) { return true ; }
			}
			else if ( left <= right * EPSILON_DELTA_RATE && right <= left * EPSILON_DELTA_RATE ) { return true ; }
		}
	}

	// Should comes after the number check
	// If one is truthy and the other falsy, early exit now
	// It is an important test since it catch the "null is an object" case that can confuse things later
	if ( ! left !== ! right ) { return false ; }

	// Should come after the NaN check
	if ( ! left ) { return false ; }

	// Objects and arrays
	if ( typeof left === 'object' ) {
		// First, check circular references
		leftIndexOf = runtime.leftStack.indexOf( left ) ;
		rightIndexOf = runtime.rightStack.indexOf( right ) ;

		if ( leftIndexOf >= 0 ) { runtime.leftCircular = true ; }
		if ( rightIndexOf >= 0 ) { runtime.rightCircular = true ; }

		if ( runtime.leftCircular && runtime.rightCircular ) { return true ; }

		if ( ! runtime.like && Object.getPrototypeOf( left ) !== Object.getPrototypeOf( right ) ) { return false ; }

		if ( Array.isArray( left ) ) {
			// Arrays
			if ( ! Array.isArray( right ) || left.length !== right.length ) { return false ; }

			if ( runtime.unordered ) {
				if ( indexUsed ) { indexUsed.length = 0 ; }
				else { indexUsed = new Array( left.length ) ; }

				indexMax = left.length ;
				index2Max = right.length ;

				for ( index = 0 ; index < indexMax ; index ++ ) {
					// Optimization heuristic: first search using the same index, because when using this option blindly,
					// both array may be ordered or almost ordered.
					// Since unordered comparison is O(2n), it can help a lot...
					if ( ! indexUsed[ index ] ) {
						if ( left[ index ] === right[ index ] ) { continue ; }

						runtime.leftStack.push( left ) ;
						runtime.rightStack.push( right ) ;
						recursiveTest = isEqual_( runtime , left[ index ] , right[ index ] ) ;
						runtime.leftStack.pop() ;
						runtime.rightStack.pop() ;

						if ( recursiveTest ) {
							indexUsed[ index ] = true ;
							continue ;
						}
					}

					found = false ;

					for ( index2 = 0 ; index2 < index2Max ; index2 ++ ) {
						// Continue if already checked just above (in the optimization heuristic part)
						// or if the index have been used already.
						if ( index === index2 || indexUsed[ index2 ] ) {
							continue ;
						}

						if ( left[ index ] === right[ index2 ] ) {
							found = true ;
							indexUsed[ index2 ] = true ;
							break ;
						}

						runtime.leftStack.push( left ) ;
						runtime.rightStack.push( right ) ;
						recursiveTest = isEqual_( runtime , left[ index ] , right[ index2 ] ) ;
						runtime.leftStack.pop() ;
						runtime.rightStack.pop() ;

						if ( recursiveTest ) {
							found = true ;
							indexUsed[ index2 ] = true ;
							break ;
						}
					}

					if ( ! found ) { return false ; }
				}
			}
			else {
				for ( index = 0 , indexMax = left.length ; index < indexMax ; index ++ ) {
					if ( left[ index ] === right[ index ] ) { continue ; }

					runtime.leftStack.push( left ) ;
					runtime.rightStack.push( right ) ;
					recursiveTest = isEqual_( runtime , left[ index ] , right[ index ] ) ;
					runtime.leftStack.pop() ;
					runtime.rightStack.pop() ;

					if ( ! recursiveTest ) { return false ; }
				}
			}
		}
		else if ( Buffer.isBuffer( left ) ) {
			return Buffer.isBuffer( right ) && left.equals( right ) ;
		}
		else {
			// Objects
			if ( Array.isArray( right ) ) { return false ; }

			if ( typeof left.valueOf === 'function' && typeof right.valueOf === 'function' ) {
				valueOfLeft = left.valueOf() ;
				valueOfRight = right.valueOf() ;

				if ( valueOfLeft !== left && valueOfRight !== right ) {
					leftProto = Object.getPrototypeOf( left ) ;
					leftConstructor = leftProto && leftProto.constructor ;
					rightProto = Object.getPrototypeOf( right ) ;
					rightConstructor = rightProto && rightProto.constructor ;

					// We only compare .valueOf() if the prototype are compatible
					if (
						leftConstructor && rightConstructor &&
						( leftConstructor === rightConstructor || ( left instanceof rightConstructor ) || ( right instanceof leftConstructor ) )
					) {
						// .valueOf() must return a primitive value, so we wouldn't have to call recursively,
						// but there are NaN check to be performed, and nothing prevent userland from returning an object...

						runtime.leftStack.push( left ) ;
						runtime.rightStack.push( right ) ;
						recursiveTest = isEqual_( runtime , valueOfLeft , valueOfRight ) ;
						//if ( ! recursiveTest ) { return false ; }
						runtime.leftStack.pop() ;
						runtime.rightStack.pop() ;
						if ( ! recursiveTest ) { return false ; }
					}
				}
			}

			keys = Object.keys( left ) ;

			for ( index = 0 , indexMax = keys.length ; index < indexMax ; index ++ ) {
				key = keys[ index ] ;

				if ( left[ key ] === undefined ) { continue ; }			// undefined and no key are considered the same
				if ( right[ key ] === undefined ) { return false ; }
				if ( left[ key ] === right[ key ] ) { continue ; }

				runtime.leftStack.push( left ) ;
				runtime.rightStack.push( right ) ;
				recursiveTest = isEqual_( runtime , left[ key ] , right[ key ] ) ;
				//if ( ! recursiveTest ) { return false ; }
				runtime.leftStack.pop() ;
				runtime.rightStack.pop() ;
				if ( ! recursiveTest ) { return false ; }
			}

			if ( ! runtime.oneWay ) {
				keys = Object.keys( right ) ;

				for ( index = 0 , indexMax = keys.length ; index < indexMax ; index ++ ) {
					key = keys[ index ] ;

					if ( right[ key ] === undefined ) { continue ; }		// undefined and no key are considered the same
					if ( left[ key ] === undefined ) { return false ; }
					// No need to check equality: already done in the previous loop
				}
			}
		}

		return true ;
	}

	return false ;
}

module.exports = isEqual ;


}).call(this)}).call(this,{"isBuffer":require("../node_modules/is-buffer/index.js")})
},{"../node_modules/is-buffer/index.js":20}],15:[function(require,module,exports){
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



// tierMask( schema , data , tier )
exports.tierMask = function( schema , data , tier = 0 , depthLimit = Infinity ) {
	if ( ! schema || typeof schema !== 'object' ) {
		throw new TypeError( 'Bad schema, it should be an object or an array of object!' ) ;
	}

	var context = {
		mask: exports.tierMask ,
		tier: tier ,
		iterate: iterate ,
		check: checkTier ,
		depth: 0 ,
		depthLimit: depthLimit
	} ;

	return context.iterate( schema , data ) ;
} ;



// tagMask( schema , data , tags )
exports.tagMask = function( schema , data , tags , depthLimit = Infinity ) {
	if ( ! schema || typeof schema !== 'object' ) {
		throw new TypeError( 'Bad schema, it should be an object or an array of object!' ) ;
	}

	if ( ! ( tags instanceof Set ) ) {
		if ( Array.isArray( tags ) ) { tags = new Set( tags ) ; }
		else { tags = new Set( [ tags ] ) ; }
	}

	var context = {
		mask: exports.tagMask ,
		tags: tags ,
		iterate: iterate ,
		check: checkTags ,
		depth: 0 ,
		depthLimit: depthLimit
	} ;

	return context.iterate( schema , data ) ;
} ;



function iterate( schema , data_ ) {
	var i , key , data = data_ , src , returnValue , checkValue ;

	if ( ! schema || typeof schema !== 'object' ) { return ; }

	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) {
		for ( i = 0 ; i < schema.length ; i ++ ) {
			try {
				data = this.mask( schema[ i ] , data_ , this.tier || this.tags , this.depthLimit - this.depth ) ;
			}
			catch( error ) {
				continue ;
			}

			return data ;
		}

		return ;
	}


	// 1) Mask
	checkValue = this.check( schema ) ;

	if ( checkValue === false ) { return ; }
	else if ( checkValue === true && schema.noSubmasking ) { return data ; }

	// if it's undefined or there is submasking, then recursivity can be checked

	// 2) Recursivity
	if ( this.depth >= this.depthLimit ) { return data ; }

	if ( schema.of && typeof schema.of === 'object' ) {
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) ) { return data ; }

		if ( Array.isArray( data ) ) {
			if ( data === data_ ) { data = [] ; src = data_ ; }
			else { src = data ; }

			for ( i = 0 ; i < src.length ; i ++ ) {
				this.depth ++ ;
				data[ i ] = this.iterate( schema.of , src[ i ] ) ;
				this.depth -- ;
			}
		}
		else {
			if ( data === data_ ) { data = {} ; src = data_ ; }
			else { src = data ; }

			for ( key in src ) {
				this.depth ++ ;
				data[ key ] = this.iterate( schema.of , src[ key ] ) ;
				this.depth -- ;
			}
		}
	}

	if ( schema.properties && typeof schema.properties === 'object' ) {
		if ( ! data || ( typeof data !== 'object' && typeof data !== 'function' ) ) { return data ; }

		if ( data === data_ ) { data = {} ; src = data_ ; }
		else { src = data ; }

		if ( Array.isArray( schema.properties ) ) {
			for ( i = 0 ; i < schema.properties.length ; i ++ ) {
				key = schema.properties[ i ] ;
				data[ key ] = src[ key ] ;
			}
		}
		else {
			for ( key in schema.properties ) {
				if ( ! schema.properties[ key ] || typeof schema.properties[ key ] !== 'object' ) {
					continue ;
				}

				this.depth ++ ;
				returnValue = this.iterate( schema.properties[ key ] , src[ key ] ) ;
				this.depth -- ;

				// Do not create new properties with undefined
				if ( returnValue !== undefined ) { data[ key ] = returnValue ; }
			}

			if ( schema.extraProperties ) {
				for ( key in src ) {
					if ( ! schema.properties[ key ] ) {
						data[ key ] = src[ key ] ;
					}
				}
			}
		}
	}

	if ( Array.isArray( schema.elements ) ) {
		if ( ! Array.isArray( data ) ) { return data ; }

		if ( data === data_ ) { data = [] ; src = data_ ; }
		else { src = data ; }

		for ( i = 0 ; i < schema.elements.length ; i ++ ) {
			this.depth ++ ;
			data[ i ] = this.iterate( schema.elements[ i ] , src[ i ] ) ;
			this.depth -- ;
		}
	}

	return data ;
}



function checkTier( schema ) {
	if ( schema.tier === undefined ) { return ; }
	if ( this.tier < schema.tier ) { return false ; }
	return true ;
}



function checkTags( schema ) {
	var i , iMax ;

	if ( ! Array.isArray( schema.tags ) || ! schema.tags.length ) { return ; }

	iMax = schema.tags.length ;

	for ( i = 0 ; i < iMax ; i ++ ) {
		if ( this.tags.has( schema.tags[ i ] ) ) { return true ; }
	}

	return false ;
}



// Return a Set of all existing tag in a schema
exports.getAllSchemaTags = function( schema , tags = new Set() , depthLimit = 10 ) {
	var i , key ;

	if ( ! schema || typeof schema !== 'object' || depthLimit <= 0 ) { return tags ; }

	// 0) Arrays are alternatives
	if ( Array.isArray( schema ) ) {
		for ( i = 0 ; i < schema.length ; i ++ ) {
			this.getAllSchemaTags( schema[ i ] , tags , depthLimit - 1 ) ;
		}

		return tags ;
	}


	// 1) Mask
	if ( schema.tags ) { schema.tags.forEach( tag => tags.add( tag ) ) ; }

	if ( schema.noSubmasking ) { return tags ; }

	// if it's undefined or there is submasking, then recursivity can be checked

	// 2) Recursivity
	if ( schema.of && typeof schema.of === 'object' ) {
		this.getAllSchemaTags( schema.of , tags , depthLimit - 1 ) ;
	}

	if ( schema.properties && typeof schema.properties === 'object' && ! Array.isArray( schema.properties ) ) {
		for ( key in schema.properties ) {
			if ( schema.properties[ key ] || typeof schema.properties[ key ] === 'object' ) {
				this.getAllSchemaTags( schema.properties[ key ] , tags , depthLimit - 1 ) ;
			}
		}
	}

	if ( Array.isArray( schema.elements ) ) {
		for ( i = 0 ; i < schema.elements.length ; i ++ ) {
			this.getAllSchemaTags( schema.elements[ i ] , tags , depthLimit - 1 ) ;
		}
	}

	return tags ;
} ;


},{}],16:[function(require,module,exports){
(function (global){(function (){
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



const latinize = require( 'string-kit/lib/latinize.js' ) ;
const toTitleCase = require( 'string-kit/lib/toTitleCase.js' ) ;



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers ) { global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers = {} ; }

const sanitizers = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.sanitizers ) ;
module.exports = sanitizers ;

const doormen = require( './core.js' ) ;



/* Cast sanitizers */



sanitizers.toString = data => {
	if ( typeof data === 'string' ) { return data ; }

	// Calling .toString() may throw an error
	try {
		return '' + data ;
	}
	catch ( error ) {
		return data ;
	}
} ;



sanitizers.toNumber = data => {
	if ( typeof data === 'number' ) { return data ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return parseFloat( data ) ; }
	return NaN ;
} ;



sanitizers.toBoolean = data => {
	if ( typeof data === 'boolean' ) { return data ; }

	switch ( data ) {
		case 1 :
		case '1' :
		case 'on' :
		case 'On' :
		case 'ON' :
		case 'true' :
		case 'True' :
		case 'TRUE' :
		case 'yes' :
		case 'Yes' :
		case 'YES' :
			return true ;
		case 0 :
		case '0' :
		case 'off' :
		case 'Off' :
		case 'OFF' :
		case 'false' :
		case 'False' :
		case 'FALSE' :
		case 'no' :
		case 'No' :
		case 'NO' :
			return false ;
		default :
			return !! data ;
	}
} ;



sanitizers.toInteger = data => {
	if ( typeof data === 'number' ) { return Math.round( data ) ; }
	else if ( ! data ) { return NaN ; }
	else if ( typeof data === 'string' ) { return Math.round( parseFloat( data ) ) ; }	// parseInt() is more capricious
	return NaN ;
} ;



sanitizers.toArray = data => {
	if ( Array.isArray( data ) ) { return data ; }

	if ( data === undefined ) { return [] ; }

	if ( data && typeof data === 'object' && doormen.typeCheckers.arguments( data ) ) {
		return Array.prototype.slice.call( data ) ;
	}

	return [ data ] ;
} ;



sanitizers.toDate = data => {
	var parsed ;

	if ( data instanceof Date ) { return data ; }

	if ( typeof data === 'number' || typeof data === 'string' || ( data && typeof data === 'object' && data.constructor.name === 'Date' ) ) {
		parsed = new Date( data ) ;
		return isNaN( parsed ) ? data : parsed ;
	}

	return data ;
} ;



/* Object sanitizers */



sanitizers.removeExtraProperties = ( data , schema , clone ) => {
	var i , key , newData ;

	if (
		! data || ( typeof data !== 'object' && typeof data !== 'function' ) ||
		! schema.properties || typeof schema.properties !== 'object'
	) {
		return data ;
	}

	if ( clone ) {
		newData = Array.isArray( data ) ? data.slice() : {} ;

		if ( Array.isArray( schema.properties ) ) {
			for ( i = 0 ; i < schema.properties.length ; i ++ ) {
				key = schema.properties[ i ] ;
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}
		else {
			for ( key in schema.properties ) {
				if ( key in data ) { newData[ key ] = data[ key ] ; }
			}
		}

		return newData ;
	}

	if ( Array.isArray( schema.properties ) ) {
		for ( key in data ) {
			if ( schema.properties.indexOf( key ) === -1 ) { delete data[ key ] ; }
		}
	}
	else {
		for ( key in data ) {
			if ( ! ( key in schema.properties ) ) { delete data[ key ] ; }
		}
	}

	return data ;
} ;



/* String sanitizers */



sanitizers.trim = data => typeof data === 'string' ? data.trim() : data ;

sanitizers.toUpperCase = data => typeof data === 'string' ? data.toUpperCase() : data ;

sanitizers.toLowerCase = data => typeof data === 'string' ? data.toLowerCase() : data ;

sanitizers.capitalize = data => typeof data === 'string' ? toTitleCase( data , sanitizers.capitalize.toTitleCaseOptions ) : data ;
sanitizers.capitalize.toTitleCaseOptions = {} ;

sanitizers.titleCase = data => typeof data === 'string' ? toTitleCase( data , sanitizers.titleCase.toTitleCaseOptions ) : data ;
sanitizers.titleCase.toTitleCaseOptions = { zealous: 1 , preserveAllCaps: true } ;

sanitizers.latinize = data => typeof data === 'string' ? latinize( data ) : data ;

sanitizers.dashToCamelCase = data => typeof data === 'string' ? data.replace( /-(.)/g , ( match , letter ) => letter.toUpperCase() ) : data ;



/* Filter compliance sanitizers */



function padding( data , schema , count ) {
	if ( schema.leftPadding ) {
		return schema.leftPadding[ 0 ].repeat( count ) + data ;
	}

	if ( schema.rightPadding ) {
		return data + schema.rightPadding[ 0 ].repeat( count ) ;
	}

	// Else, pad with space to the right...
	return data + ' '.repeat( count ) ;
}



// Resize a string (later: various other data, like array and Buffer?)
// It is used to comply to filters: length, maxLength and minLength.
// To enlarge, it used the subSchema.padding property, or a space if not found.
sanitizers.resize = ( data , schema ) => {
	if ( typeof data !== 'string' ) { return data ; }

	if ( schema.length ) {
		if ( data.length > schema.length ) { return data.slice( 0 , schema.length ) ; }
		if ( data.length < schema.length ) { return padding( data , schema , schema.length - data.length ) ; }
		return data ;
	}

	if ( schema.maxLength && data.length > schema.maxLength ) {
		return data.slice( 0 , schema.maxLength ) ;
	}

	if ( schema.minLength && data.length < schema.minLength ) {
		return padding( data , schema , schema.minLength - data.length ) ;
	}

	return data ;
} ;



/* Misc sanitizers */



sanitizers.nullToUndefined = data => data === null ? undefined : data ;



// Convert a string to a MongoDB ObjectID
sanitizers.mongoId = data => {
	if ( typeof data !== 'string' ) { return data ; }
	if ( doormen.isBrowser ) { return data ; }

	try {
		var mongodb = require( 'mongodb' ) ;
		return mongodb.ObjectID( data ) ;
	}
	catch ( error ) {
		return data ;
	}
} ;


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./core.js":9,"mongodb":19,"string-kit/lib/latinize.js":28,"string-kit/lib/toTitleCase.js":30}],17:[function(require,module,exports){
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



const singleSchema = {
	optional: true ,	// For recursivity...
	type: 'strictObject' ,
	extraProperties: true ,
	properties: {
		type: { optional: true , type: 'string' } ,
		optional: { optional: true , type: 'boolean' } ,
		extraProperties: { optional: true , type: 'boolean' } ,
		default: { optional: true } ,
		value: { optional: true } ,
		sanitize: {
			optional: true , sanitize: 'toArray' , type: 'array' , of: { type: 'string' }
		} ,
		filter: { optional: true , type: 'strictObject' } ,
		constraints: {
			optional: true ,
			type: 'array' ,
			of: {
				type: 'strictObject' ,
				extraProperties: true ,
				properties: {
					enforce: { type: 'string' } ,
					resolve: { type: 'boolean' , default: false } ,
					ifEmtpy: { type: 'boolean' , default: false }
				}
			}
		} ,

		tier: { optional: true , type: 'integer' } ,
		tags: {
			optional: true , sanitize: 'toArray' , type: 'array' , of: { type: 'string' }
		} ,

		// Top-level filters
		instanceOf: { optional: true , type: 'classId' } ,
		min: { optional: true , type: 'integer' } ,
		max: { optional: true , type: 'integer' } ,
		length: { optional: true , type: 'integer' } ,
		minLength: { optional: true , type: 'integer' } ,
		maxLength: { optional: true , type: 'integer' } ,
		match: { optional: true , type: 'regexp' } ,
		in: {
			optional: true ,
			type: 'array'
		} ,
		notIn: {
			optional: true ,
			type: 'array'
		} ,

		// Commons
		hooks: {
			optional: true ,
			type: 'strictObject' ,
			of: {
				type: 'array' ,
				sanitize: 'toArray' ,
				of: { type: 'function' }
			}
		}
	}
} ;

const schemaSchema = [
	singleSchema ,
	{ type: 'array' , of: singleSchema }
] ;

// Recursivity
singleSchema.properties.of = schemaSchema ;

singleSchema.properties.properties = [
	{
		optional: true ,
		type: 'strictObject' ,
		of: schemaSchema
	} ,
	{
		optional: true ,
		type: 'array' ,
		of: { type: 'string' }
	}
] ;

singleSchema.properties.elements = {
	optional: true ,
	type: 'array' ,
	of: schemaSchema
} ;

module.exports = schemaSchema ;


},{}],18:[function(require,module,exports){
(function (global,Buffer){(function (){
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



// For browsers...
if ( ! global ) { global = window ; }	// eslint-disable-line no-global-assign

if ( ! global.DOORMEN_GLOBAL_EXTENSIONS ) { global.DOORMEN_GLOBAL_EXTENSIONS = {} ; }
if ( ! global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers ) { global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers = {} ; }

const typeCheckers = Object.create( global.DOORMEN_GLOBAL_EXTENSIONS.typeCheckers ) ;
module.exports = typeCheckers ;

const doormen = require( './core.js' ) ;



// Basic types
// Primitive types
typeCheckers.undefined = data => data === undefined ;
typeCheckers.null = data => data === null ;
typeCheckers.boolean = data => typeof data === 'boolean' ;
typeCheckers.number = data => typeof data === 'number' ;
typeCheckers.string = data => typeof data === 'string' ;
typeCheckers.object = data => data && typeof data === 'object' ;
typeCheckers.function = data => typeof data === 'function' ;

// Built-in type
typeCheckers.array = data => Array.isArray( data ) ;
typeCheckers.error = data => data instanceof Error ;
typeCheckers.date = data => data instanceof Date ;
typeCheckers.arguments = data => Object.prototype.toString.call( data ) === '[object Arguments]' ;

typeCheckers.buffer = data => {
	try {
		// If we run in a browser, this does not exist
		return data instanceof Buffer ;
	}
	catch ( error ) {
		return false ;
	}
} ;

// Mixed
typeCheckers.strictObject = data => data && typeof data === 'object' && ! Array.isArray( data ) ;
typeCheckers.looseObject = data => ( data && typeof data === 'object' ) || typeof data === 'function' ;	// object+function
typeCheckers.classId = data => typeof data === 'function' || ( typeof data === 'string' && data.length ) ;
typeCheckers.unset = data => data === undefined || data === null ;

typeCheckers.regexp = data => {
	if ( data instanceof RegExp ) { return true ; }
	if ( typeof data !== 'string' ) { return false ; }

	try {
		new RegExp( data ) ;
		return true ;
	}
	catch ( error ) {
		return false ;
	}
} ;



typeCheckers.schema = data => {
	try {
		doormen.validateSchema( data ) ;
	}
	catch ( error ) {
		return false ;
	}

	return true ;
} ;



// Meta type of numbers
typeCheckers.real = data => typeof data === 'number' && ! isNaN( data ) && isFinite( data ) ;
typeCheckers.integer = data => typeof data === 'number' && isFinite( data ) && data === Math.round( data ) ;



typeCheckers.hex = data => typeof data === 'string' && /^[0-9a-fA-F]+$/.test( data ) ;



// IP
typeCheckers.ip = ( data , schema ) => typeCheckers.ipv4( data , schema ) || typeCheckers.ipv6( data , schema ) ;



// IPv4
typeCheckers.ipv4 = ( data , schema , skipRegExp ) => {
	var i , parts , tmp ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( ! skipRegExp && ! /^[0-9.]+$/.test( data ) ) { return false ; }

	parts = data.split( '.' ) ;

	if ( parts.length !== 4 ) { return false ; }

	for ( i = 0 ; i < parts.length ; i ++ ) {
		if ( ! parts[ i ].length || parts[ i ].length > 3 ) { return false ; }

		tmp = parseInt( parts[ i ] , 10 ) ;

		// NaN compliant check
		if ( ! ( tmp >= 0 && tmp <= 255 ) ) { return false ; }	// jshint ignore:line
	}

	return true ;
} ;



// IPv6
typeCheckers.ipv6 = ( data , schema , skipRegExp ) => {
	var i , parts , hasDoubleColon = false , startWithDoubleColon = false , endWithDoubleColon = false ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( ! skipRegExp && ! /^[0-9a-f:]+$/.test( data ) ) { return false ; }

	parts = data.split( ':' ) ;

	// 9 instead of 8 because of starting double-colon
	if ( parts.length > 9 && parts.length < 3 ) { return false ; }

	for ( i = 0 ; i < parts.length ; i ++ ) {
		if ( ! parts[ i ].length ) {
			if ( i === 0 ) {
				// an IPv6 can start with a double-colon, but not with a single colon
				startWithDoubleColon = true ;
				if ( parts[ 1 ].length ) { return false ; }
			}
			else if ( i === parts.length - 1 ) {
				// an IPv6 can end with a double-colon, but with a single colon
				endWithDoubleColon = true ;
				if ( parts[ i - 1 ].length ) { return false ; }
			}
			else {
				// the whole IP should have at most one double-colon, for consecutive 0 group
				if ( hasDoubleColon ) { return false ; }
				hasDoubleColon = true ;
			}
		}
		else if ( parts[ i ].length > 4 ) {
			// a group has at most 4 letters of hexadecimal
			return false ;
		}
	}

	if ( parts.length < 8 && ! hasDoubleColon ) { return false ; }
	if ( parts.length - ( startWithDoubleColon ? 1 : 0 ) - ( endWithDoubleColon ? 1 : 0 ) > 8 ) { return false ; }

	return true ;
} ;



typeCheckers.hostname = ( data , schema , skipRegExp ) => {
	var i , parts ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( ! skipRegExp && ! /^[^\s/$?#@:]+$/.test( data ) ) { return false ; }

	parts = data.split( '.' ) ;

	for ( i = 0 ; i < parts.length ; i ++ ) {
		// An hostname can have a '.' after the TLD, but it should not have empty part anywhere else
		if ( ! parts[ i ].length && i !== parts.length - 1 ) { return false ; }

		// A part cannot exceed 63 chars
		if ( parts[ i ].length > 63 ) { return false ; }
	}

	return true ;
} ;



// hostname or ip
typeCheckers.host = ( data , schema ) => typeCheckers.ip( data , schema ) || typeCheckers.hostname( data , schema ) ;



// URLs
typeCheckers.url = ( data , schema , restrictToWebUrl ) => {
	if ( typeof data !== 'string' ) { return false ; }

	var matches = data.match( /^([a-z+.-]+):\/\/((?:([^\s@/:]+)(?::([^\s@/:]+))?@)?(([0-9.]+)|([0-9a-f:]+)|([^\s/$?#@:]+))(:[0-9]+)?)?(\/[^\s]*)?$/ ) ;

	if ( ! matches ) { return false ; }

	// If we only want http, https and ftp...
	if ( restrictToWebUrl && matches[ 1 ] !== 'http' &&  matches[ 1 ] !== 'https' && matches[ 1 ] !== 'ftp' ) { return false ; }

	if ( ! matches[ 2 ] && matches[ 1 ] !== 'file' ) { return false ; }

	if ( matches[ 6 ] ) {
		if ( ! typeCheckers.ipv4( matches[ 6 ] , schema , true ) ) { return false ; }
	}

	if ( matches[ 7 ] ) {
		if ( ! typeCheckers.ipv6( matches[ 7 ] , schema , true ) ) { return false ; }
	}

	if ( matches[ 8 ] ) {
		if ( ! typeCheckers.hostname( matches[ 8 ] , schema , true ) ) { return false ; }
	}

	return true ;
} ;

typeCheckers.weburl = ( data , schema ) => typeCheckers.url( data , schema , true ) ;



// Emails
typeCheckers.email = ( data , schema ) => {
	var matches , i , parts ;

	if ( typeof data !== 'string' ) { return false ; }

	if ( data.length > 254 ) { return false ; }

	// It only matches the most common email address
	//var matches = data.match( /^([a-z0-9._-]+)@([^\s\/$?#.][^\s\/$?#@:]+)$/ ) ;

	// It matches most email address, and reject really bizarre one
	matches = data.match( /^([a-zA-Z0-9._#~!$&*+=,;:\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF-]+)@([^\s/$?#@:]+)$/ ) ;

	// /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i

	if ( ! matches ) { return false ; }

	if ( matches[ 1 ].length > 64 ) { return false ; }

	parts = matches[ 1 ].split( '.' ) ;

	for ( i = 0 ; i < parts.length ; i ++ ) {
		if ( ! parts[ i ].length ) { return false ; }
	}

	if ( ! typeCheckers.hostname( matches[ 2 ] , schema , true ) ) { return false ; }

	return true ;
} ;



// MongoDB ObjectID
typeCheckers.mongoId = data => {
	if ( data && typeof data === 'object' && data.constructor.name === 'ObjectID' && data.id && typeof data.toString === 'function' ) {
		data = data.toString() ;
	}

	return typeof data === 'string' && data.length === 24 && /^[0-9a-f]{24}$/.test( data ) ;
} ;


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./core.js":9,"buffer":19}],19:[function(require,module,exports){

},{}],20:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],21:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],22:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



/*
	Number formatting class.
	.format() should entirely use it for everything related to number formatting.
	It avoids unsolvable rounding error with epsilon.
	It is dedicated to number display to user, not computing.
*/



function StringNumber( number ) {
	this.sign = 1 ;
	this.digits = [] ;
	this.exposant = 0 ;
	this.special = null ;
	this.set( number ) ;
}

module.exports = StringNumber ;



StringNumber.prototype.set = function( number ) {
	var matches , digits , exposant , v , i , iMax , index , hasNonZeroHead , tailIndex ;

	number = + number ;

	if ( ! Number.isFinite( number ) ) {
		this.special = number ;
		return null ;
	}

	number = '' + number ;
	matches = number.match( /(-)?([0-9]+)(?:.([0-9]+))?(?:e([+-][0-9]+))?/ ) ;
	if ( ! matches ) { throw new Error( 'Unexpected error' ) ; }

	this.sign = matches[ 1 ] ? -1 : 1 ;
	this.exposant = matches[ 2 ].length + ( parseInt( matches[ 4 ] , 10 ) || 0 ) ;

	// Copy each digits and cast them back into a number
	index = 0 ;
	hasNonZeroHead = false ;
	tailIndex = 0 ;	// used to cut trailing zero

	for ( i = 0 , iMax = matches[ 2 ].length ; i < iMax ; i ++ ) {
		v = + matches[ 2 ][ i ] ;
		if ( v !== 0 ) {
			hasNonZeroHead = true ;
			this.digits[ index ] = v ;
			index ++ ;
			tailIndex = index ;
		}
		else if ( hasNonZeroHead ) {
			this.digits[ index ] = v ;
			index ++ ;
		}
		else {
			this.exposant -- ;
		}
	}

	if ( matches[ 3 ] ) {
		for ( i = 0 , iMax = matches[ 3 ].length ; i < iMax ; i ++ ) {
			v = + matches[ 3 ][ i ] ;

			if ( v !== 0 ) {
				hasNonZeroHead = true ;
				this.digits[ index ] = v ;
				index ++ ;
				tailIndex = index ;
			}
			else if ( hasNonZeroHead ) {
				this.digits[ index ] = v ;
				index ++ ;
			}
			else {
				this.exposant -- ;
			}
		}
	}

	if ( tailIndex !== index ) {
		this.digits.length = tailIndex ;
	}
} ;



StringNumber.prototype.toNumber = function() {
	// Using a string representation
	if ( this.special !== null ) { return this.special ; }
	return parseFloat( ( this.sign < 0 ? '-' : '' ) + '0.' + this.digits.join( '' ) + 'e' + this.exposant ) ;
} ;



StringNumber.prototype.toString = function( ... args ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( this.exposant > 20 || this.exposant < -20 ) { return this.toScientificString( ... args ) ; }
	return this.toNoExpString( ... args ) ;
} ;



StringNumber.prototype.toScientific =
StringNumber.prototype.toScientificString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += '.' + this.digits.join( '' ).slice( 1 ) ;
	}

	str += 'e' + ( this.exposant > 1 ? '+' : this.exposant < 1 ? '-' : '' ) + ( this.exposant - 1 ) ;
	return str ;
} ;



// leadingZero = minimal number of number before the dot, they will be left-padded with zero if needed.
// trailingZero = minimal number of number before the dot, they will be right-padded with zero if needed.
// onlyIfDecimal: set it to true if you don't want right padding zero when there is no decimal
StringNumber.prototype.toNoExp =
StringNumber.prototype.toNoExpString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , exposant = this.exposant ) {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;

	if ( ! this.digits.length ) {
		str += '0'.repeat( leadingZero ) ;
		if ( trailingZero && ! onlyIfDecimal ) { str += '.' + '0'.repeat( trailingZero ) ; }
		return str ;
	}

	var digits = this.digits.join( '' ) ;

	if ( exposant <= 0 ) {
		// This number is of type 0.[0...]xyz
		str += '0'.repeat( leadingZero ) + '.' + '0'.repeat( -exposant ) + digits ;
		if ( trailingZero && digits.length - exposant < trailingZero ) {
			str += '0'.repeat( trailingZero - digits.length + exposant ) ;
		}
		return str ;
	}

	if ( exposant >= this.digits.length ) {
		// This number is of type xyz[0...]
		if ( exposant < leadingZero ) { str += '0'.repeat( leadingZero - exposant ) ; }
		str += digits + '0'.repeat( exposant - this.digits.length ) ;
		if ( trailingZero && ! onlyIfDecimal ) { str += '.' + '0'.repeat( trailingZero ) ; }
		return str ;
	}

	// Here the digits are splitted with a dot in the middle
	if ( exposant < leadingZero ) { str += '0'.repeat( leadingZero - exposant ) ; }
	str += digits.slice( 0 , exposant ) + '.' + digits.slice( exposant ) ;

	if (
		trailingZero && digits.length - exposant < trailingZero
		&& ( ! onlyIfDecimal || digits.length - exposant > 0 )
	) {
		str += '0'.repeat( trailingZero - digits.length + exposant ) ;
	}

	return str ;
} ;



// Metric prefix
const MUL_PREFIX = [ '' , 'k' , 'M' , 'G' , 'T' , 'P' , 'E' , 'Z' , 'Y' ] ;
const SUB_MUL_PREFIX = [ '' , 'm' , 'µ' , 'n' , 'p' , 'f' , 'a' , 'z' , 'y' ] ;



StringNumber.prototype.toMetric =
StringNumber.prototype.toMetricString = function() {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( ! this.digits.length ) { return this.sign > 0 ? '0' : '-0' ; }

	var prefix = '' , fakeExposant ;

	if ( this.exposant > 0 ) {
		fakeExposant = 1 + ( ( this.exposant - 1 ) % 3 ) ;
		prefix = MUL_PREFIX[ Math.floor( ( this.exposant - 1 ) / 3 ) ] ;
		// Fallback to scientific if the number is to big
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}
	else {
		fakeExposant = 3 - ( -this.exposant % 3 ) ;
		prefix = SUB_MUL_PREFIX[ 1 + Math.floor( -this.exposant / 3 ) ] ;
		// Fallback to scientific if the number is to small
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}

	return this.toNoExpString( undefined , undefined , undefined , fakeExposant ) + prefix ;
} ;



StringNumber.prototype.precision = function( n ) {
	if ( this.special !== null || n >= this.digits.length ) { return this ; }

	if ( n < 0 ) { this.digits.length = 0 ; return this ; }

	if ( this.digits[ n ] >= 5 ) {
		let i = n - 1 ,
			done = false ;

		// Cascading increase
		for ( ; i >= 0 ; i -- ) {
			if ( this.digits[ i ] < 9 ) { this.digits[ i ] ++ ; done = true ; break ; }
			else { this.digits[ i ] = 0 ; }
		}

		if ( ! done ) {
			this.exposant ++ ;
			this.digits[ 0 ] = 1 ;
			this.digits.length = 1 ;
		}
		else {
			this.digits.length = i + 1 ;
		}
	}
	else {
		this.digits.length = n ;
		this.removeTrailingZero() ;
	}

	return this ;
} ;



StringNumber.prototype.round = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n ) ;
} ;



StringNumber.prototype.removeTrailingZero = function() {
	var i = this.digits.length - 1 ;
	while( i >= 0 && this.digits[ i ] === 0 ) { i -- ; }
	this.digits.length = i + 1 ;
} ;


},{}],23:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



// To solve dependency hell, we do not rely on terminal-kit anymore.
module.exports = {
	reset: '\x1b[0m' ,
	bold: '\x1b[1m' ,
	dim: '\x1b[2m' ,
	italic: '\x1b[3m' ,
	underline: '\x1b[4m' ,
	inverse: '\x1b[7m' ,

	defaultColor: '\x1b[39m' ,
	black: '\x1b[30m' ,
	red: '\x1b[31m' ,
	green: '\x1b[32m' ,
	yellow: '\x1b[33m' ,
	blue: '\x1b[34m' ,
	magenta: '\x1b[35m' ,
	cyan: '\x1b[36m' ,
	white: '\x1b[37m' ,
	grey: '\x1b[90m' ,
	gray: '\x1b[90m' ,
	brightBlack: '\x1b[90m' ,
	brightRed: '\x1b[91m' ,
	brightGreen: '\x1b[92m' ,
	brightYellow: '\x1b[93m' ,
	brightBlue: '\x1b[94m' ,
	brightMagenta: '\x1b[95m' ,
	brightCyan: '\x1b[96m' ,
	brightWhite: '\x1b[97m' ,

	defaultBgColor: '\x1b[49m' ,
	bgBlack: '\x1b[40m' ,
	bgRed: '\x1b[41m' ,
	bgGreen: '\x1b[42m' ,
	bgYellow: '\x1b[43m' ,
	bgBlue: '\x1b[44m' ,
	bgMagenta: '\x1b[45m' ,
	bgCyan: '\x1b[46m' ,
	bgWhite: '\x1b[47m' ,
	bgGrey: '\x1b[100m' ,
	bgGray: '\x1b[100m' ,
	bgBrightBlack: '\x1b[100m' ,
	bgBrightRed: '\x1b[101m' ,
	bgBrightGreen: '\x1b[102m' ,
	bgBrightYellow: '\x1b[103m' ,
	bgBrightBlue: '\x1b[104m' ,
	bgBrightMagenta: '\x1b[105m' ,
	bgBrightCyan: '\x1b[106m' ,
	bgBrightWhite: '\x1b[107m'
} ;


},{}],24:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Escape collection.
*/



"use strict" ;



// From Mozilla Developper Network
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
exports.regExp = exports.regExpPattern = str => str.replace( /([.*+?^${}()|[\]/\\])/g , '\\$1' ) ;

// This replace any single $ by a double $$
exports.regExpReplacement = str => str.replace( /\$/g , '$$$$' ) ;

// Escape for string.format()
// This replace any single % by a double %%
exports.format = str => str.replace( /%/g , '%%' ) ;

exports.jsSingleQuote = str => exports.control( str ).replace( /'/g , "\\'" ) ;
exports.jsDoubleQuote = str => exports.control( str ).replace( /"/g , '\\"' ) ;

exports.shellArg = str => '\'' + str.replace( /'/g , "'\\''" ) + '\'' ;



var escapeControlMap = {
	'\r': '\\r' ,
	'\n': '\\n' ,
	'\t': '\\t' ,
	'\x7f': '\\x7f'
} ;

// Escape \r \n \t so they become readable again, escape all ASCII control character as well, using \x syntaxe
exports.control = ( str , keepNewLineAndTab = false ) => str.replace( /[\x00-\x1f\x7f]/g , match => {
	if ( keepNewLineAndTab && ( match === '\n' || match === '\t' ) ) { return match ; }
	if ( escapeControlMap[ match ] !== undefined ) { return escapeControlMap[ match ] ; }
	var hex = match.charCodeAt( 0 ).toString( 16 ) ;
	if ( hex.length % 2 ) { hex = '0' + hex ; }
	return '\\x' + hex ;
} ) ;



var escapeHtmlMap = {
	'&': '&amp;' ,
	'<': '&lt;' ,
	'>': '&gt;' ,
	'"': '&quot;' ,
	"'": '&#039;'
} ;

// Only escape & < > so this is suited for content outside tags
exports.html = str => str.replace( /[&<>]/g , match => escapeHtmlMap[ match ] ) ;

// Escape & < > " so this is suited for content inside a double-quoted attribute
exports.htmlAttr = str => str.replace( /[&<>"]/g , match => escapeHtmlMap[ match ] ) ;

// Escape all html special characters & < > " '
exports.htmlSpecialChars = str => str.replace( /[&<>"']/g , match => escapeHtmlMap[ match ] ) ;

// Percent-encode all control chars and codepoint greater than 255 using percent encoding
exports.unicodePercentEncode = str => str.replace( /[\x00-\x1f\u0100-\uffff\x7f%]/g , match => {
	try {
		return encodeURI( match ) ;
	}
	catch ( error ) {
		// encodeURI can throw on bad surrogate pairs, but we just strip those characters
		return '' ;
	}
} ) ;

// Encode HTTP header value
exports.httpHeaderValue = str => exports.unicodePercentEncode( str ) ;


},{}],25:[function(require,module,exports){
(function (Buffer){(function (){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	String formater, inspired by C's sprintf().
*/



"use strict" ;



const inspect = require( './inspect.js' ).inspect ;
const inspectError = require( './inspect.js' ).inspectError ;
const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;
const unicode = require( './unicode.js' ) ;
const naturalSort = require( './naturalSort.js' ) ;
const StringNumber = require( './StringNumber.js' ) ;



/*
	%%		a single %
	%s		string
	%S		string, interpret ^ formatting
	%r		raw string: without sanitizer
	%n		natural: output the most natural representation for this type, object entries are sorted by keys
	%N		even more natural: avoid type hinting marks like bracket for array
	%f		float
	%e		for scientific notation
	%d	%i	integer
	%u		unsigned integer
	%U		unsigned positive integer (>0)
	%k		number with metric system prefixes
	%t		time duration, convert ms into H:min:s
	%m		convert degree into degree, minutes and seconds
	%h		hexadecimal (input is a number)
	%x		hexadecimal (input is a number), force pair of symbols (e.g. 'f' -> '0f')
	%o		octal
	%b		binary
	%X		hexadecimal: convert a string into hex charcode, force pair of symbols (e.g. 'f' -> '0f')
	%z		base64
	%Z		base64url
	%O		object (like inspect, but with ultra minimal options)
	%I		call string-kit's inspect()
	%Y		call string-kit's inspect(), but do not inspect non-enumerable
	%E		call string-kit's inspectError()
	%J		JSON.stringify()
	%D		drop
	%F		filter function existing in the 'this' context, e.g. %[filter:%a%a]F
	%a		argument for a function

	Candidate format:
	%A		for automatic type? probably not good: it's like %n Natural
	%c		for char? (can receive a string or an integer translated into an UTF8 chars)
	%C		for currency formating?
	%B		for Buffer objects?
*/

exports.formatMethod = function( ... args ) {
	var str = args[ 0 ] ;

	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var arg , autoIndex = 1 , length = args.length ,
		hasMarkup = false , shift = null , markupStack = [] ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	//str = str.replace( /\^(.?)|%(?:([+-]?)([0-9]*)(?:\/([^\/]*)\/)?([a-zA-Z%])|\[([a-zA-Z0-9_]+)(?::([^\]]*))?\])/g ,
	str = str.replace( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/g ,
		( match , markup , doublePercent , relative , index , modeArg , mode ) => {

			var replacement , i , tmp , fn , fnArgString , argMatches , argList = [] ;

			//console.log( 'replaceArgs:' , arguments ) ;
			if ( doublePercent ) { return '%' ; }

			if ( markup ) {
				if ( this.noMarkup ) { return '^' + markup ; }
				if ( markup === '^' ) { return '^' ; }

				if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
					shift = this.shiftMarkup[ markup ] ;
					return '' ;
				}

				if ( shift ) {
					if ( ! this.shiftedMarkup || ! this.shiftedMarkup[ shift ] || ! this.shiftedMarkup[ shift ][ markup ] ) {
						return '' ;
					}

					hasMarkup = true ;

					if ( typeof this.shiftedMarkup[ shift ][ markup ] === 'function' ) {
						replacement = this.shiftedMarkup[ shift ][ markup ]( markupStack ) ;
						// method should manage markup stack themselves
					}
					else {
						replacement = this.shiftedMarkup[ shift ][ markup ] ;
						markupStack.push( replacement ) ;
					}

					shift = null ;
				}
				else {
					if ( ! this.markup || ! this.markup[ markup ] ) {
						return '' ;
					}

					hasMarkup = true ;

					if ( typeof this.markup[ markup ] === 'function' ) {
						replacement = this.markup[ markup ]( markupStack ) ;
						// method should manage markup stack themselves
					}
					else {
						replacement = this.markup[ markup ] ;
						markupStack.push( replacement ) ;
					}
				}

				return replacement ;
			}


			if ( index ) {
				index = parseInt( index , 10 ) ;

				if ( relative ) {
					if ( relative === '+' ) { index = autoIndex + index ; }
					else if ( relative === '-' ) { index = autoIndex - index ; }
				}
			}
			else {
				index = autoIndex ;
			}

			autoIndex ++ ;

			if ( index >= length || index < 1 ) { arg = undefined ; }
			else { arg = args[ index ] ; }

			if ( modes[ mode ] ) {
				replacement = modes[ mode ]( arg , modeArg , this ) ;
				if ( this.argumentSanitizer && ! modes[ mode ].noSanitize ) { replacement = this.argumentSanitizer( replacement ) ; }
				if ( modeArg && ! modes[ mode ].noCommonModeArg ) { replacement = commonModeArg( replacement , modeArg ) ; }
				return replacement ;
			}

			// Function mode
			if ( mode === 'F' ) {
				autoIndex -- ;	// %F does not eat any arg

				if ( modeArg === undefined ) { return '' ; }
				tmp = modeArg.split( ':' ) ;
				fn = tmp[ 0 ] ;
				fnArgString = tmp[ 1 ] ;
				if ( ! fn ) { return '' ; }

				if ( fnArgString && ( argMatches = fnArgString.match( /%([+-]?)([0-9]*)[a-zA-Z]/g ) ) ) {
					//console.log( argMatches ) ;
					//console.log( fnArgString ) ;
					for ( i = 0 ; i < argMatches.length ; i ++ ) {
						relative = argMatches[ i ][ 1 ] ;
						index = argMatches[ i ][ 2 ] ;

						if ( index ) {
							index = parseInt( index , 10 ) ;

							if ( relative ) {
								if ( relative === '+' ) { index = autoIndex + index ; }		// jshint ignore:line
								else if ( relative === '-' ) { index = autoIndex - index ; }	// jshint ignore:line
							}
						}
						else {
							index = autoIndex ;
						}

						autoIndex ++ ;

						if ( index >= length || index < 1 ) { argList[ i ] = undefined ; }
						else { argList[ i ] = args[ index ] ; }
					}
				}

				if ( ! this || ! this.fn || typeof this.fn[ fn ] !== 'function' ) { return '' ; }
				return this.fn[ fn ].apply( this , argList ) ;
			}

			return '' ;
		}
	) ;

	if ( hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ;
	}

	if ( this.extraArguments ) {
		for ( ; autoIndex < length ; autoIndex ++ ) {
			arg = args[ autoIndex ] ;
			if ( arg === null || arg === undefined ) { continue ; }
			else if ( typeof arg === 'string' ) { str += arg ; }
			else if ( typeof arg === 'number' ) { str += arg ; }
			else if ( typeof arg.toString === 'function' ) { str += arg.toString() ; }
		}
	}

	return str ;
} ;



// --- MODES ---

const modes = {} ;



// string
modes.s = arg => {
	if ( typeof arg === 'string' ) { return arg ; }
	if ( arg === null || arg === undefined || arg === true || arg === false ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
	return '(' + arg + ')' ;
} ;

modes.r = arg => modes.s( arg ) ;
modes.r.noSanitize = true ;



// string, interpret ^ formatting
modes.S = ( arg , modeArg , options ) => {
	// We do the sanitizing part on our own
	var interpret = str => exports.markupMethod.call( options , options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) ;

	if ( typeof arg === 'string' ) { return interpret( arg ) ; }
	if ( arg === null || arg === undefined || arg === true || arg === false ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return interpret( arg.toString() ) ; }
	return interpret( '(' + arg + ')' ) ;
} ;

modes.S.noSanitize = true ;
modes.S.noCommonModeArg = true ;



// natural (WIP)
modes.N = ( arg , isSubCall ) => {
	if ( typeof arg === 'string' ) { return arg ; }

	if ( arg === null || arg === undefined || arg === true || arg === false || typeof arg === 'number' ) {
		return '' + arg ;
	}

	if ( Array.isArray( arg ) ) {
		arg = arg.map( e => modes.N( e , true ) ) ;

		if ( isSubCall ) {
			return '[' + arg.join( ',' ) + ']' ;
		}

		return arg.join( ', ' ) ;
	}

	if ( Buffer.isBuffer( arg ) ) {
		arg = [ ... arg ].map( e => {
			e = e.toString( 16 ) ;
			if ( e.length === 1 ) { e = '0' + e ; }
			return e ;
		} ) ;
		return '<' + arg.join( ' ' ) + '>' ;
	}

	var proto = Object.getPrototypeOf( arg ) ;

	if ( proto === null || proto === Object.prototype ) {
		// Plain objects
		arg = Object.entries( arg ).sort( naturalSort )
			.map( e => e[ 0 ] + ': ' + modes.N( e[ 1 ] , true ) ) ;

		if ( isSubCall ) {
			return '{' + arg.join( ', ' ) + '}' ;
		}

		return arg.join( ', ' ) ;
	}

	if ( typeof arg.inspect === 'function' ) { return arg.inspect() ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }

	return '(' + arg + ')' ;
} ;

modes.n = arg => modes.N( arg , true ) ;



// float
modes.f = ( arg , modeArg ) => {
	var match , k , v , lv , sn ,
		leftPadding = 1 ,
		rightPadding = 0 ,
		rightPaddingOnlyIfDecimal = false ,
		rounding = null ,
		precision = null ;

	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	if ( modeArg ) {
		MODE_ARG_FORMAT_REGEX.lastIndex = 0 ;

		while ( ( match = MODE_ARG_FORMAT_REGEX.exec( modeArg ) ) ) {
			[ , k , v ] = match ;

			if ( k === 'z' ) {
				// Zero-left padding
				leftPadding = + v ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						rounding = rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) ;
					}
					else if ( lv === '?' ) {
						rounding = rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) ;
						rightPaddingOnlyIfDecimal = true ;
					}
					else {
						rounding = parseInt( v.slice( 1 ) , 10 ) ;
					}
				}
				else if ( v[ v.length - 1 ] === '.' ) {
					// Rounding before the decimal
					rounding = -parseInt( v.slice( 0 , -1 ) , 10 ) ;
				}
				else {
					// Precision
					precision = parseInt( v , 10 ) ;
				}
			}
		}
	}

	sn = new StringNumber( arg ) ;
	if ( rounding !== null ) { sn.round( rounding ) ; }
	if ( precision !== null ) { sn.precision( precision ) ; }
	return sn.toString( leftPadding , rightPadding , rightPaddingOnlyIfDecimal ) ;
} ;

modes.f.noSanitize = true ;



// metric system
modes.k = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '0' ; }
	//return metricPrefix( arg ) ;

	var sn = new StringNumber( arg ) ;
	sn.precision( 3 ) ;
	return sn.toMetricString() ;
} ;

modes.k.noSanitize = true ;



// /!\ Should use StringNumber
// scientific notation
modes.e = ( arg , modeArg ) => {
	var match , k , v ;

	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	if ( modeArg ) {
		MODE_ARG_FORMAT_REGEX.lastIndex = 0 ;

		if ( ( match = MODE_ARG_FORMAT_REGEX.exec( modeArg ) ) ) {
			[ , k , v ] = match ;

			if ( ! k ) {
				return '' + arg.toExponential( parseInt( v , 10 ) - 1 ) ;
			}
		}
	}

	return '' + arg.toExponential() ;

} ;

modes.e.noSanitize = true ;



// integer
modes.d = modes.i = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
	return '0' ;
} ;

modes.i.noSanitize = true ;



// unsigned integer
modes.u = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
	return '0' ;
} ;

modes.u.noSanitize = true ;



// unsigned positive integer
modes.U = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
	return '1' ;
} ;

modes.U.noSanitize = true ;



// /!\ Should use StringNumber???
// Degree, minutes and seconds.
// Unlike %t which receive ms, here the input is in degree.
modes.m = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var minus = '' ;
	if ( arg < 0 ) { minus = '-' ; arg = -arg ; }

	var degrees = epsilonFloor( arg ) ,
		frac = arg - degrees ;

	if ( ! frac ) { return minus + degrees + '°' ; }

	var minutes = epsilonFloor( frac * 60 ) ,
		seconds = epsilonFloor( frac * 3600 - minutes * 60 ) ;

	if ( seconds ) {
		return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' + ( '' + seconds ).padStart( 2 , '0' ) + '″' ;
	}

	return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' ;

} ;

modes.m.noSanitize = true ;



// /!\ Should use StringNumber???
// time duration, transform ms into H:min:s
// Later it should format Date as well: number=duration, date object=date
// Note that it would not replace moment.js, but it could uses it.
modes.t = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var s = Math.floor( arg / 1000 ) ;
	if ( s < 60 ) { return s + 's' ; }

	var min = Math.floor( s / 60 ) ;
	s = s % 60 ;
	if ( min < 60 ) { return min + 'min' + ( '' + s ).padStart( 2 , '0' ) + 's' ; }

	var h = Math.floor( min / 60 ) ;
	min = min % 60 ;
	//if ( h < 24 ) { return h + 'h' + zeroPadding( min ) +'min' + zeroPadding( s ) + 's' ; }

	return h + 'h' + ( '' + min ).padStart( 2 , '0' ) + 'min' + ( '' + s ).padStart( 2 , '0' ) + 's' ;
} ;

modes.t.noSanitize = true ;



// unsigned hexadecimal
modes.h = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
	return '0' ;
} ;

modes.h.noSanitize = true ;



// unsigned hexadecimal, force pair of symboles
modes.x = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '00' ; }

	var value = '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ;

	if ( value.length % 2 ) { value = '0' + value ; }
	return value ;
} ;

modes.x.noSanitize = true ;



// unsigned octal
modes.o = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
	return '0' ;
} ;

modes.o.noSanitize = true ;



// unsigned binary
modes.b = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
	return '0' ;
} ;

modes.b.noSanitize = true ;



// String to hexadecimal, force pair of symboles
modes.X = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'hex' ) ;
} ;

modes.X.noSanitize = true ;



// base64
modes.z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ) ;
} ;



// base64url
modes.Z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ).replace( /\+/g , '-' )
		.replace( /\//g , '_' )
		.replace( /[=]{1,2}$/g , '' ) ;
} ;



// Inspect
const I_OPTIONS = {} ;
modes.I = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , I_OPTIONS ) ;
modes.I.noSanitize = true ;



// More minimalist inspect
const Y_OPTIONS = {
	noFunc: true ,
	enumOnly: true ,
	noDescriptor: true ,
	useInspect: true ,
	useInspectPropertyBlackList: true
} ;
modes.Y = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , Y_OPTIONS ) ;
modes.Y.noSanitize = true ;



// Even more minimalist inspect
const O_OPTIONS = { minimal: true , noIndex: true } ;
modes.O = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , O_OPTIONS ) ;
modes.O.noSanitize = true ;



// Inspect error
const E_OPTIONS = {} ;
modes.E = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , E_OPTIONS , true ) ;
modes.E.noSanitize = true ;



// JSON
modes.J = arg => arg === undefined ? 'null' : JSON.stringify( arg ) ;



// drop
modes.D = () => '' ;
modes.D.noSanitize = true ;



var defaultFormatter = {
	argumentSanitizer: str => escape.control( str , true ) ,
	extraArguments: true ,
	color: false ,
	noMarkup: false ,
	endingMarkupReset: true ,
	startingMarkupReset: false ,
	markupReset: ansi.reset ,
	shiftMarkup: {
		'#': 'background'
	} ,
	markup: {
		":": ansi.reset ,
		" ": ansi.reset + " " ,

		"-": ansi.dim ,
		"+": ansi.bold ,
		"_": ansi.underline ,
		"/": ansi.italic ,
		"!": ansi.inverse ,

		"b": ansi.blue ,
		"B": ansi.brightBlue ,
		"c": ansi.cyan ,
		"C": ansi.brightCyan ,
		"g": ansi.green ,
		"G": ansi.brightGreen ,
		"k": ansi.black ,
		"K": ansi.brightBlack ,
		"m": ansi.magenta ,
		"M": ansi.brightMagenta ,
		"r": ansi.red ,
		"R": ansi.brightRed ,
		"w": ansi.white ,
		"W": ansi.brightWhite ,
		"y": ansi.yellow ,
		"Y": ansi.brightYellow
	} ,
	shiftedMarkup: {
		background: {
			":": ansi.reset ,
			" ": ansi.reset + " " ,

			"b": ansi.bgBlue ,
			"B": ansi.bgBrightBlue ,
			"c": ansi.bgCyan ,
			"C": ansi.bgBrightCyan ,
			"g": ansi.bgGreen ,
			"G": ansi.bgBrightGreen ,
			"k": ansi.bgBlack ,
			"K": ansi.bgBrightBlack ,
			"m": ansi.bgMagenta ,
			"M": ansi.bgBrightMagenta ,
			"r": ansi.bgRed ,
			"R": ansi.bgBrightRed ,
			"w": ansi.bgWhite ,
			"W": ansi.bgBrightWhite ,
			"y": ansi.bgYellow ,
			"Y": ansi.bgBrightYellow
		}
	}
} ;

exports.createFormatter = ( options ) => exports.formatMethod.bind( Object.assign( {} , defaultFormatter , options ) ) ;
exports.format = exports.formatMethod.bind( defaultFormatter ) ;
exports.format.default = defaultFormatter ;



// /!\ Should upgrade that with Terminal-Kit Markup parser /!\
// It supports complex markup, see: Terminal-Kit/lib/misc.js misc.parseMarkup().

exports.markupMethod = function( str ) {
	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var hasMarkup = false , shift = null , markupStack = [] ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	str = str.replace( /\^(.?)/g , ( match , markup ) => {
		var replacement ;

		if ( markup === '^' ) { return '^' ; }

		if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
			shift = this.shiftMarkup[ markup ] ;
			return '' ;
		}

		if ( shift ) {
			if ( ! this.shiftedMarkup || ! this.shiftedMarkup[ shift ] || ! this.shiftedMarkup[ shift ][ markup ] ) {
				return '' ;
			}

			hasMarkup = true ;

			if ( typeof this.shiftedMarkup[ shift ][ markup ] === 'function' ) {
				replacement = this.shiftedMarkup[ shift ][ markup ]( markupStack ) ;
				// method should manage markup stack themselves
			}
			else {
				replacement = this.shiftedMarkup[ shift ][ markup ] ;
				markupStack.push( replacement ) ;
			}

			shift = null ;
		}
		else {
			if ( ! this.markup || ! this.markup[ markup ] ) {
				return '' ;
			}

			hasMarkup = true ;

			if ( typeof this.markup[ markup ] === 'function' ) {
				replacement = this.markup[ markup ]( markupStack ) ;
				// method should manage markup stack themselves
			}
			else {
				replacement = this.markup[ markup ] ;
				markupStack.push( replacement ) ;
			}
		}

		return replacement ;
	} ) ;

	if ( hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ;
	}

	return str ;
} ;



exports.createMarkup = ( options ) => exports.markupMethod.bind( Object.assign( {} , defaultFormatter , options ) ) ;
exports.markup = exports.markupMethod.bind( defaultFormatter ) ;



// Count the number of parameters needed for this string
exports.format.count = function( str ) {
	var match , index , relative , autoIndex = 1 , maxIndex = 0 ;

	if ( typeof str !== 'string' ) { return 0 ; }

	// This regex differs slightly from the main regex: we do not count '%%' and %F is excluded
	var regexp = /%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-EG-Z])/g ;


	while ( ( match = regexp.exec( str ) ) !== null ) {
		//console.log( match ) ;
		relative = match[ 1 ] ;
		index = match[ 2 ] ;

		if ( index ) {
			index = parseInt( index , 10 ) ;

			if ( relative ) {
				if ( relative === '+' ) { index = autoIndex + index ; }
				else if ( relative === '-' ) { index = autoIndex - index ; }
			}
		}
		else {
			index = autoIndex ;
		}

		autoIndex ++ ;

		if ( maxIndex < index ) { maxIndex = index ; }
	}

	return maxIndex ;
} ;



// Tell if this string contains formatter chars
exports.format.hasFormatting = function( str ) {
	if ( str.search( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/ ) !== -1 ) { return true ; }
	return false ;
} ;



// ModeArg formats

// The format for commonModeArg
const COMMON_MODE_ARG_FORMAT_REGEX = /([a-zA-Z])(.[^a-zA-Z]*)/g ;

// The format for specific mode arg
const MODE_ARG_FORMAT_REGEX = /([a-zA-Z]|^)(.[^a-zA-Z]*)/g ;



// Called when there is a modeArg and the mode allow common mode arg
// CONVENTION: reserve upper-cased letters for common mode arg
function commonModeArg( str , modeArg ) {
	var match , k , v ;

	COMMON_MODE_ARG_FORMAT_REGEX.lastIndex = 0 ;

	while ( ( match = COMMON_MODE_ARG_FORMAT_REGEX.exec( modeArg ) ) ) {
		[ , k , v ] = match ;

		if ( k === 'L' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = ' '.repeat( v - width ) + str ; }
		}
		else if ( k === 'R' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = str + ' '.repeat( v - width ) ; }
		}
	}

	return str ;
}



// Generic inspect
function genericInspectMode( arg , modeArg , options , modeOptions , isInspectError = false ) {
	var match , k , v ,
		outputMaxLength ,
		maxLength ,
		depth = 3 ,
		style = options && options.color ? 'color' : 'none' ;

	if ( modeArg ) {
		MODE_ARG_FORMAT_REGEX.lastIndex = 0 ;

		while ( ( match = MODE_ARG_FORMAT_REGEX.exec( modeArg ) ) ) {
			[ , k , v ] = match ;

			if ( k === 'c' ) {
				if ( v === '+' ) { style = 'color' ; }
				else if ( v === '-' ) { style = 'none' ; }
			}
			else if ( k === 'l' ) {
				// total output max length
				outputMaxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( k === 's' ) {
				// string max length
				maxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( ! k ) {
				depth = parseInt( v , 10 ) || 1 ;
			}
		}
	}

	if ( isInspectError ) {
		return inspectError( Object.assign( {
			depth , style , outputMaxLength , maxLength
		} , modeOptions ) , arg ) ;
	}

	return inspect( Object.assign( {
		depth , style , outputMaxLength , maxLength
	} , modeOptions ) , arg ) ;
}



// From math-kit module
// /!\ Should be updated with the new way the math-kit module do it!!! /!\
const EPSILON = 0.0000000001 ;
const INVERSE_EPSILON = Math.round( 1 / EPSILON ) ;

function epsilonRound( v ) {
	return Math.round( v * INVERSE_EPSILON ) / INVERSE_EPSILON ;
}

function epsilonFloor( v ) {
	return Math.floor( v + EPSILON ) ;
}

// Round with precision
function round( v , step ) {
	// use: v * ( 1 / step )
	// not: v / step
	// reason: epsilon rounding errors
	return epsilonRound( step * Math.round( v * ( 1 / step ) ) ) ;
}


}).call(this)}).call(this,require("buffer").Buffer)
},{"./StringNumber.js":22,"./ansi.js":23,"./escape.js":24,"./inspect.js":26,"./naturalSort.js":29,"./unicode.js":31,"buffer":19}],26:[function(require,module,exports){
(function (Buffer,process){(function (){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Variable inspector.
*/

"use strict" ;



const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;

const EMPTY = {} ;



/*
	Inspect a variable, return a string ready to be displayed with console.log(), or even as an HTML output.

	Options:
		* style:
			* 'none': (default) normal output suitable for console.log() or writing in a file
			* 'inline': like 'none', but without newlines
			* 'color': colorful output suitable for terminal
			* 'html': html output
			* any object: full controle, inheriting from 'none'
		* depth: depth limit, default: 3
		* maxLength: length limit for strings, default: 250
		* outputMaxLength: length limit for the inspect output string, default: 5000
		* noFunc: do not display functions
		* noDescriptor: do not display descriptor information
		* noArrayProperty: do not display array properties
		* noIndex: do not display array indexes
		* noType: do not display type and constructor
		* enumOnly: only display enumerable properties
		* funcDetails: display function's details
		* proto: display object's prototype
		* sort: sort the keys
		* minimal: imply noFunc: true, noDescriptor: true, noType: true, noArrayProperty: true, enumOnly: true, proto: false and funcDetails: false.
		  Display a minimal JSON-like output
		* protoBlackList: `Set` of blacklisted object prototype (will not recurse inside it)
		* propertyBlackList: `Set` of blacklisted property names (will not even display it)
		* useInspect: use .inspect() method when available on an object (default to false)
		* useInspectPropertyBlackList: if set and if the object to be inspected has an 'inspectPropertyBlackList' property which value is a `Set`,
		  use it like the 'propertyBlackList' option
*/

function inspect( options , variable ) {
	if ( arguments.length < 2 ) { variable = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	var runtime = { depth: 0 , ancestors: [] } ;

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }
	// Too slow:
	//else { options.style = Object.assign( {} , inspectStyle.none , options.style ) ; }

	if ( options.depth === undefined ) { options.depth = 3 ; }
	if ( options.maxLength === undefined ) { options.maxLength = 250 ; }
	if ( options.outputMaxLength === undefined ) { options.outputMaxLength = 5000 ; }

	// /!\ nofunc is deprecated
	if ( options.nofunc ) { options.noFunc = true ; }

	if ( options.minimal ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noType = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	var str = inspect_( runtime , options , variable ) ;

	if ( str.length > options.outputMaxLength ) {
		str = options.style.truncate( str , options.outputMaxLength ) ;
	}

	return str ;
}



function inspect_( runtime , options , variable ) {
	var i , funcName , length , proto , propertyList , constructor , keyIsProperty ,
		type , pre , indent , isArray , isFunc , specialObject ,
		str = '' , key = '' , descriptorStr = '' , descriptor , nextAncestors ;


	// Prepare things (indentation, key, descriptor, ... )

	type = typeof variable ;
	indent = options.style.tab.repeat( runtime.depth ) ;

	if ( type === 'function' && options.noFunc ) { return '' ; }

	if ( runtime.key !== undefined ) {
		if ( runtime.descriptor ) {
			descriptorStr = [] ;

			if ( ! runtime.descriptor.configurable ) { descriptorStr.push( '-conf' ) ; }
			if ( ! runtime.descriptor.enumerable ) { descriptorStr.push( '-enum' ) ; }

			// Already displayed by runtime.forceType
			//if ( runtime.descriptor.get || runtime.descriptor.set ) { descriptorStr.push( 'getter/setter' ) ; } else
			if ( ! runtime.descriptor.writable ) { descriptorStr.push( '-w' ) ; }

			//if ( descriptorStr.length ) { descriptorStr = '(' + descriptorStr.join( ' ' ) + ')' ; }
			if ( descriptorStr.length ) { descriptorStr = descriptorStr.join( ' ' ) ; }
			else { descriptorStr = '' ; }
		}

		if ( runtime.keyIsProperty ) {
			if ( keyNeedingQuotes( runtime.key ) ) {
				key = '"' + options.style.key( runtime.key ) + '": ' ;
			}
			else {
				key = options.style.key( runtime.key ) + ': ' ;
			}
		}
		else if ( ! options.noIndex ) {
			key = options.style.index( runtime.key ) ;
		}

		if ( descriptorStr ) { descriptorStr = ' ' + options.style.type( descriptorStr ) ; }
	}

	pre = runtime.noPre ? '' : indent + key ;


	// Describe the current variable

	if ( variable === undefined ) {
		str += pre + options.style.constant( 'undefined' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === EMPTY ) {
		str += pre + options.style.constant( '[empty]' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === null ) {
		str += pre + options.style.constant( 'null' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === false ) {
		str += pre + options.style.constant( 'false' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === true ) {
		str += pre + options.style.constant( 'true' ) + descriptorStr + options.style.newline ;
	}
	else if ( type === 'number' ) {
		str += pre + options.style.number( variable.toString() ) +
			( options.noType ? '' : ' ' + options.style.type( 'number' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'string' ) {
		if ( variable.length > options.maxLength ) {
			str += pre + '"' + options.style.string( escape.control( variable.slice( 0 , options.maxLength - 1 ) ) ) + '…"' +
				( options.noType ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ' - TRUNCATED)' ) ) +
				descriptorStr + options.style.newline ;
		}
		else {
			str += pre + '"' + options.style.string( escape.control( variable ) ) + '"' +
				( options.noType ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ')' ) ) +
				descriptorStr + options.style.newline ;
		}
	}
	else if ( Buffer.isBuffer( variable ) ) {
		str += pre + options.style.inspect( variable.inspect() ) +
			( options.noType ? '' : ' ' + options.style.type( 'Buffer' ) + options.style.length( '(' + variable.length + ')' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'object' || type === 'function' ) {
		funcName = length = '' ;
		isFunc = false ;

		if ( type === 'function' ) {
			isFunc = true ;
			funcName = ' ' + options.style.funcName( ( variable.name ? variable.name : '(anonymous)' ) ) ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		isArray = false ;

		if ( Array.isArray( variable ) ) {
			isArray = true ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		if ( ! variable.constructor ) { constructor = '(no constructor)' ; }
		else if ( ! variable.constructor.name ) { constructor = '(anonymous)' ; }
		else { constructor = variable.constructor.name ; }

		constructor = options.style.constructorName( constructor ) ;
		proto = Object.getPrototypeOf( variable ) ;

		str += pre ;

		if ( ! options.noType ) {
			if ( runtime.forceType ) { str += options.style.type( runtime.forceType ) ; }
			else { str += constructor + funcName + length + ' ' + options.style.type( type ) + descriptorStr ; }

			if ( ! isFunc || options.funcDetails ) { str += ' ' ; }	// if no funcDetails imply no space here
		}

		if ( isArray && options.noArrayProperty ) {
			propertyList = [ ... Array( variable.length ).keys() ] ;
		}
		else {
			propertyList = Object.getOwnPropertyNames( variable ) ;
		}

		if ( options.sort ) { propertyList.sort() ; }

		// Special Objects
		specialObject = specialObjectSubstitution( variable , runtime , options ) ;

		if ( options.protoBlackList && options.protoBlackList.has( proto ) ) {
			str += options.style.limit( '[skip]' ) + options.style.newline ;
		}
		else if ( specialObject !== undefined ) {
			if ( typeof specialObject === 'string' ) {
				str += '=> ' + specialObject + options.style.newline ;
			}
			else {
				str += '=> ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					specialObject
				) ;
			}
		}
		else if ( isFunc && ! options.funcDetails ) {
			str += options.style.newline ;
		}
		else if ( ! propertyList.length && ! options.proto ) {
			str += ( isArray ? '[]' : '{}' ) + options.style.newline ;
		}
		else if ( runtime.depth >= options.depth ) {
			str += options.style.limit( '[depth limit]' ) + options.style.newline ;
		}
		else if ( runtime.ancestors.indexOf( variable ) !== -1 ) {
			str += options.style.limit( '[circular]' ) + options.style.newline ;
		}
		else {
			str += ( isArray && options.noType && options.noArrayProperty ? '[' : '{' ) + options.style.newline ;

			// Do not use .concat() here, it doesn't works as expected with arrays...
			nextAncestors = runtime.ancestors.slice() ;
			nextAncestors.push( variable ) ;

			for ( i = 0 ; i < propertyList.length && str.length < options.outputMaxLength ; i ++ ) {
				if ( ! isArray && (
					( options.propertyBlackList && options.propertyBlackList.has( propertyList[ i ] ) )
					|| ( options.useInspectPropertyBlackList && ( variable.inspectPropertyBlackList instanceof Set ) && variable.inspectPropertyBlackList.has( propertyList[ i ] ) )
				) ) {
					//str += options.style.limit( '[skip]' ) + options.style.newline ;
					continue ;
				}

				if ( isArray && options.noArrayProperty && ! ( propertyList[ i ] in variable ) ) {
					// Hole in the array (sparse array, item deleted, ...)
					str += inspect_(
						{
							depth: runtime.depth + 1 ,
							ancestors: nextAncestors ,
							key: propertyList[ i ] ,
							keyIsProperty: false
						} ,
						options ,
						EMPTY
					) ;
				}
				else {
					try {
						descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
						if ( ! descriptor.enumerable && options.enumOnly ) { continue ; }
						keyIsProperty = ! isArray || ! descriptor.enumerable || isNaN( propertyList[ i ] ) ;

						if ( ! options.noDescriptor && descriptor && ( descriptor.get || descriptor.set ) ) {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: descriptor ,
									forceType: 'getter/setter'
								} ,
								options ,
								{ get: descriptor.get , set: descriptor.set }
							) ;
						}
						else {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: options.noDescriptor ? undefined : descriptor
								} ,
								options ,
								variable[ propertyList[ i ] ]
							) ;
						}
					}
					catch ( error ) {
						str += inspect_(
							{
								depth: runtime.depth + 1 ,
								ancestors: nextAncestors ,
								key: propertyList[ i ] ,
								keyIsProperty: keyIsProperty ,
								descriptor: options.noDescriptor ? undefined : descriptor
							} ,
							options ,
							error
						) ;
					}
				}

				if ( i < propertyList.length - 1 ) { str += options.style.comma ; }
			}

			if ( options.proto ) {
				str += inspect_(
					{
						depth: runtime.depth + 1 ,
						ancestors: nextAncestors ,
						key: '__proto__' ,
						keyIsProperty: true
					} ,
					options ,
					proto
				) ;
			}

			str += indent + ( isArray && options.noType && options.noArrayProperty ? ']' : '}' ) ;
			str += options.style.newline ;
		}
	}


	// Finalizing


	if ( runtime.depth === 0 ) {
		if ( options.style.trim ) { str = str.trim() ; }
		if ( options.style === 'html' ) { str = escape.html( str ) ; }
	}

	return str ;
}

exports.inspect = inspect ;



function keyNeedingQuotes( key ) {
	if ( ! key.length ) { return true ; }
	return false ;
}



var promiseStates = [ 'pending' , 'fulfilled' , 'rejected' ] ;



// Some special object are better written down when substituted by something else
function specialObjectSubstitution( object , runtime , options ) {
	if ( typeof object.constructor !== 'function' ) {
		// Some objects have no constructor, e.g.: Object.create(null)
		//console.error( object ) ;
		return ;
	}

	if ( object instanceof String ) {
		return object.toString() ;
	}

	if ( object instanceof RegExp ) {
		return object.toString() ;
	}

	if ( object instanceof Date ) {
		return object.toString() + ' [' + object.getTime() + ']' ;
	}

	if ( typeof Set === 'function' && object instanceof Set ) {
		// This is an ES6 'Set' Object
		return Array.from( object ) ;
	}

	if ( typeof Map === 'function' && object instanceof Map ) {
		// This is an ES6 'Map' Object
		return Array.from( object ) ;
	}

	if ( object instanceof Promise ) {
		if ( process && process.binding && process.binding( 'util' ) && process.binding( 'util' ).getPromiseDetails ) {
			let details = process.binding( 'util' ).getPromiseDetails( object ) ;
			let state =  promiseStates[ details[ 0 ] ] ;
			let str = 'Promise <' + state + '>' ;

			if ( state === 'fulfilled' ) {
				str += ' ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					details[ 1 ]
				) ;
			}
			else if ( state === 'rejected' ) {
				if ( details[ 1 ] instanceof Error ) {
					str += ' ' + inspectError(
						{
							style: options.style ,
							noErrorStack: true
						} ,
						details[ 1 ]
					) ;
				}
				else {
					str += ' ' + inspect_(
						{
							depth: runtime.depth ,
							ancestors: runtime.ancestors ,
							noPre: true
						} ,
						options ,
						details[ 1 ]
					) ;
				}
			}

			return str ;
		}
	}

	if ( object._bsontype ) {
		// This is a MongoDB ObjectID, rather boring to display in its original form
		// due to esoteric characters that confuse both the user and the terminal displaying it.
		// Substitute it to its string representation
		return object.toString() ;
	}

	if ( options.useInspect && typeof object.inspect === 'function' ) {
		return object.inspect() ;
	}

	return ;
}



/*
	Options:
		noErrorStack: set to true if the stack should not be displayed
*/
function inspectError( options , error ) {
	var str = '' , stack , type , code ;

	if ( arguments.length < 2 ) { error = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! ( error instanceof Error ) ) {
		return "inspectError(): it's not an error, using regular variable inspection: " + inspect( options , error ) ;
	}

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( error.stack && ! options.noErrorStack ) { stack = inspectStack( options , error.stack ) ; }

	type = error.type || error.constructor.name ;
	code = error.code || error.name || error.errno || error.number ;

	str += options.style.errorType( type ) +
		( code ? ' [' + options.style.errorType( code ) + ']' : '' ) + ': ' ;
	str += options.style.errorMessage( error.message ) + '\n' ;

	if ( stack ) { str += options.style.errorStack( stack ) + '\n' ; }

	if ( error.from ) {
		str += options.style.newline + options.style.errorFromMessage( 'From error:' ) + options.style.newline + inspectError( options , error.from ) ;
	}

	return str ;
}

exports.inspectError = inspectError ;



function inspectStack( options , stack ) {
	if ( arguments.length < 2 ) { stack = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! stack ) { return ; }

	if ( ( options.browser || process.browser ) && stack.indexOf( '@' ) !== -1 ) {
		// Assume a Firefox-compatible stack-trace here...
		stack = stack
			.replace( /[</]*(?=@)/g , '' )	// Firefox output some WTF </</</</< stuff in its stack trace -- removing that
			.replace(
				/^\s*([^@]*)\s*@\s*([^\n]*)(?::([0-9]+):([0-9]+))?$/mg ,
				( matches , method , file , line , column ) => {
					return options.style.errorStack( '    at ' ) +
						( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
						options.style.errorStack( '(' ) +
						( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
						( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
						( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
						options.style.errorStack( ')' ) ;
				}
			) ;
	}
	else {
		stack = stack.replace( /^[^\n]*\n/ , '' ) ;
		stack = stack.replace(
			/^\s*(at)\s+(?:(?:(async|new)\s+)?([^\s:()[\]\n]+(?:\([^)]+\))?)\s)?(?:\[as ([^\s:()[\]\n]+)\]\s)?(?:\(?([^:()[\]\n]+):([0-9]+):([0-9]+)\)?)?$/mg ,
			( matches , at , keyword , method , as , file , line , column ) => {
				return options.style.errorStack( '    at ' ) +
					( keyword ? options.style.errorStackKeyword( keyword ) + ' ' : '' ) +
					( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
					( as ? options.style.errorStack( '[as ' ) + options.style.errorStackMethodAs( as ) + options.style.errorStack( '] ' ) : '' ) +
					options.style.errorStack( '(' ) +
					( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
					( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
					( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
					options.style.errorStack( ')' ) ;
			}
		) ;
	}

	return stack ;
}

exports.inspectStack = inspectStack ;



// Inspect's styles

var inspectStyle = {} ;

var inspectStyleNoop = str => str ;



inspectStyle.none = {
	trim: false ,
	tab: '    ' ,
	newline: '\n' ,
	comma: '' ,
	limit: inspectStyleNoop ,
	type: str => '<' + str + '>' ,
	constant: inspectStyleNoop ,
	funcName: inspectStyleNoop ,
	constructorName: str => '<' + str + '>' ,
	length: inspectStyleNoop ,
	key: inspectStyleNoop ,
	index: str => '[' + str + '] ' ,
	number: inspectStyleNoop ,
	inspect: inspectStyleNoop ,
	string: inspectStyleNoop ,
	errorType: inspectStyleNoop ,
	errorMessage: inspectStyleNoop ,
	errorStack: inspectStyleNoop ,
	errorStackKeyword: inspectStyleNoop ,
	errorStackMethod: inspectStyleNoop ,
	errorStackMethodAs: inspectStyleNoop ,
	errorStackFile: inspectStyleNoop ,
	errorStackLine: inspectStyleNoop ,
	errorStackColumn: inspectStyleNoop ,
	errorFromMessage: inspectStyleNoop ,
	truncate: ( str , maxLength ) => str.slice( 0 , maxLength - 1 ) + '…'
} ;



inspectStyle.inline = Object.assign( {} , inspectStyle.none , {
	trim: true ,
	tab: '' ,
	newline: ' ' ,
	comma: ', ' ,
	length: () => '' ,
	index: () => ''
	//type: () => '' ,
} ) ;



inspectStyle.color = Object.assign( {} , inspectStyle.none , {
	limit: str => ansi.bold + ansi.brightRed + str + ansi.reset ,
	type: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	constant: str => ansi.cyan + str + ansi.reset ,
	funcName: str => ansi.italic + ansi.magenta + str + ansi.reset ,
	constructorName: str => ansi.magenta + str + ansi.reset ,
	length: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	key: str => ansi.green + str + ansi.reset ,
	index: str => ansi.blue + '[' + str + ']' + ansi.reset + ' ' ,
	number: str => ansi.cyan + str + ansi.reset ,
	inspect: str => ansi.cyan + str + ansi.reset ,
	string: str => ansi.blue + str + ansi.reset ,
	errorType: str => ansi.red + ansi.bold + str + ansi.reset ,
	errorMessage: str => ansi.red + ansi.italic + str + ansi.reset ,
	errorStack: str => ansi.brightBlack + str + ansi.reset ,
	errorStackKeyword: str => ansi.italic + ansi.bold + str + ansi.reset ,
	errorStackMethod: str => ansi.brightYellow + str + ansi.reset ,
	errorStackMethodAs: str => ansi.yellow + str + ansi.reset ,
	errorStackFile: str => ansi.brightCyan + str + ansi.reset ,
	errorStackLine: str => ansi.blue + str + ansi.reset ,
	errorStackColumn: str => ansi.magenta + str + ansi.reset ,
	errorFromMessage: str => ansi.yellow + ansi.underline + str + ansi.reset ,
	truncate: ( str , maxLength ) => {
		var trail = ansi.gray + '…' + ansi.reset ;
		str = str.slice( 0 , maxLength - trail.length ) ;

		// Search for an ansi escape sequence at the end, that could be truncated.
		// The longest one is '\x1b[107m': 6 characters.
		var lastEscape = str.lastIndexOf( '\x1b' ) ;
		if ( lastEscape >= str.length - 6 ) { str = str.slice( 0 , lastEscape ) ; }

		return str + trail ;
	}
} ) ;



inspectStyle.html = Object.assign( {} , inspectStyle.none , {
	tab: '&nbsp;&nbsp;&nbsp;&nbsp;' ,
	newline: '<br />' ,
	limit: str => '<span style="color:red">' + str + '</span>' ,
	type: str => '<i style="color:gray">' + str + '</i>' ,
	constant: str => '<span style="color:cyan">' + str + '</span>' ,
	funcName: str => '<i style="color:magenta">' + str + '</i>' ,
	constructorName: str => '<span style="color:magenta">' + str + '</span>' ,
	length: str => '<i style="color:gray">' + str + '</i>' ,
	key: str => '<span style="color:green">' + str + '</span>' ,
	index: str => '<span style="color:blue">[' + str + ']</span> ' ,
	number: str => '<span style="color:cyan">' + str + '</span>' ,
	inspect: str => '<span style="color:cyan">' + str + '</span>' ,
	string: str => '<span style="color:blue">' + str + '</span>' ,
	errorType: str => '<span style="color:red">' + str + '</span>' ,
	errorMessage: str => '<span style="color:red">' + str + '</span>' ,
	errorStack: str => '<span style="color:gray">' + str + '</span>' ,
	errorStackKeyword: str => '<i>' + str + '</i>' ,
	errorStackMethod: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackMethodAs: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackFile: str => '<span style="color:cyan">' + str + '</span>' ,
	errorStackLine: str => '<span style="color:blue">' + str + '</span>' ,
	errorStackColumn: str => '<span style="color:gray">' + str + '</span>' ,
	errorFromMessage: str => '<span style="color:yellow">' + str + '</span>'
} ) ;


}).call(this)}).call(this,{"isBuffer":require("../../is-buffer/index.js")},require('_process'))
},{"../../is-buffer/index.js":20,"./ansi.js":23,"./escape.js":24,"_process":21}],27:[function(require,module,exports){
module.exports={"߀":"0","́":""," ":" ","Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ɓ":"B","ｃ":"C","Ⓒ":"C","Ｃ":"C","Ꜿ":"C","Ḉ":"C","Ç":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ɗ":"D","Ɖ":"D","ᴅ":"D","Ꝺ":"D","Ð":"Dh","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","ɛ":"E","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","ᴇ":"E","ꝼ":"F","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","ɢ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","ȷ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","ϻ":"M","Ꞥ":"N","Ƞ":"N","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ɲ":"N","Ꞑ":"N","ᴎ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Œ":"OE","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Þ":"Th","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ɑ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","Ƃ":"b","ⓒ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","C":"c","Ć":"c","Ĉ":"c","Ċ":"c","Č":"c","Ƈ":"c","Ȼ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","Ƌ":"d","Ꮷ":"d","ԁ":"d","Ɦ":"d","ð":"dh","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ﬀ":"ff","ﬁ":"fi","ﬂ":"fl","ﬃ":"ffi","ﬄ":"ffl","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ꝿ":"g","ᵹ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ɭ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ԉ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ɔ":"o","ᴑ":"o","œ":"oe","ƣ":"oi","ꝏ":"oo","ȣ":"ou","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ρ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ʂ":"s","ß":"ss","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","þ":"th","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z"}
},{}],28:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



var map = require( './latinize-map.json' ) ;

module.exports = function( str ) {
	return str.replace( /[^\u0000-\u007e]/g , ( c ) => { return map[ c ] || c ; } ) ;
} ;



},{"./latinize-map.json":27}],29:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



/*
 * Natural Sort algorithm for Javascript - Version 0.8 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 */
module.exports = function( a , b ) {
	var re = /(^([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)?$|^0x[\da-fA-F]+$|\d+)/g ,
		sre = /^\s+|\s+$/g ,   // trim pre-post whitespace
		snre = /\s+/g ,        // normalize all whitespace to single ' ' character
		dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[/-]\d{1,4}[/-]\d{1,4}|^\w+, \w+ \d+, \d{4})/ ,
		hre = /^0x[0-9a-f]+$/i ,
		ore = /^0/ ,
		i = function( s ) {
			return ( '' + s ).toLowerCase().replace( sre , '' ) ;
		} ,
		// convert all to strings strip whitespace
		x = i( a ) || '' ,
		y = i( b ) || '' ,
		// chunk/tokenize
		xN = x.replace( re , '\0$1\0' ).replace( /\0$/ , '' )
			.replace( /^\0/ , '' )
			.split( '\0' ) ,
		yN = y.replace( re , '\0$1\0' ).replace( /\0$/ , '' )
			.replace( /^\0/ , '' )
			.split( '\0' ) ,
		// numeric, hex or date detection
		xD = parseInt( x.match( hre ) , 16 ) || ( xN.length !== 1 && Date.parse( x ) ) ,
		yD = parseInt( y.match( hre ) , 16 ) || xD && y.match( dre ) && Date.parse( y ) || null ,
		normChunk = function( s , l ) {
			// normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
			return ( ! s.match( ore ) || l === 1 ) && parseFloat( s ) || s.replace( snre , ' ' ).replace( sre , '' ) || 0 ;	// jshint ignore:line
		} ,
		oFxNcL , oFyNcL ;
	// first try and sort Hex codes or Dates
	if ( yD ) {
		if ( xD < yD ) { return -1 ; }
		else if ( xD > yD ) { return 1 ; }
	}
	// natural sorting through split numeric strings and default strings
	for( var cLoc = 0 , xNl = xN.length , yNl = yN.length , numS = Math.max( xNl , yNl ) ; cLoc < numS ; cLoc ++ ) {
		oFxNcL = normChunk( xN[cLoc] , xNl ) ;
		oFyNcL = normChunk( yN[cLoc] , yNl ) ;
		// handle numeric vs string comparison - number < string - (Kyle Adams)
		if ( isNaN( oFxNcL ) !== isNaN( oFyNcL ) ) { return ( isNaN( oFxNcL ) ) ? 1 : -1 ; }
		// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
		else if ( typeof oFxNcL !== typeof oFyNcL ) {
			oFxNcL += '' ;
			oFyNcL += '' ;
		}
		if ( oFxNcL < oFyNcL ) { return -1 ; }
		if ( oFxNcL > oFyNcL ) { return 1 ; }
	}
	return 0 ;
} ;


},{}],30:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



module.exports = function toTitleCase( str , options ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	options = options || {} ;

	return str.replace( /[^\s_-]+/g , ( part ) => {
		if ( options.zealous ) {
			if ( options.preserveAllCaps && part === part.toUpperCase() ) {
				// This is a ALLCAPS word
				return part ;
			}

			return part[ 0 ].toUpperCase() + part.slice( 1 ).toLowerCase() ;

		}

		return part[ 0 ].toUpperCase() + part.slice( 1 ) ;

	} ) ;
} ;



},{}],31:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



/*
	Javascript does not use UTF-8 but UCS-2.
	The purpose of this module is to process correctly strings containing UTF-8 characters that take more than 2 bytes.

	Since the punycode module is deprecated in Node.js v8.x, this is an adaptation of punycode.ucs2.x
	as found on Aug 16th 2017 at: https://github.com/bestiejs/punycode.js/blob/master/punycode.js.
*/



// Create the module and export it
const unicode = {} ;
module.exports = unicode ;



unicode.encode = array => String.fromCodePoint( ... array ) ;



// Decode a string into an array of unicode codepoints
unicode.decode = str => {
	var value , extra , counter = 0 , output = [] ,
		length = str.length ;

	while ( counter < length ) {
		value = str.charCodeAt( counter ++ ) ;

		if ( value >= 0xD800 && value <= 0xDBFF && counter < length ) {
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;

			if ( ( extra & 0xFC00 ) === 0xDC00 ) {	// Low surrogate.
				output.push( ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000 ) ;
			}
			else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push( value ) ;
				counter -- ;
			}
		}
		else {
			output.push( value ) ;
		}
	}

	return output ;
} ;



// Decode only the first char
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.firstCodePoint = str => {
	var extra ,
		value = str.charCodeAt( 0 ) ;

	if ( value >= 0xD800 && value <= 0xDBFF && str.length >= 2 ) {
		// It's a high surrogate, and there is a next character.
		extra = str.charCodeAt( 1 ) ;

		if ( ( extra & 0xFC00 ) === 0xDC00 ) {	// Low surrogate.
			return ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000 ;
		}
	}

	return value ;
} ;



// Extract only the first char
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.firstChar = str => {
	var extra ,
		value = str.charCodeAt( 0 ) ;

	if ( value >= 0xD800 && value <= 0xDBFF && str.length >= 2 ) {
		// It's a high surrogate, and there is a next character.
		extra = str.charCodeAt( 1 ) ;

		if ( ( extra & 0xFC00 ) === 0xDC00 ) {	// Low surrogate.
			return str.slice( 0 , 2 ) ;
		}
	}

	return str[ 0 ] ;
} ;



// Decode a string into an array of unicode characters
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.toArray = str => {
	var value , extra , counter = 0 , output = [] ,
		length = str.length ;

	while ( counter < length ) {
		value = str.charCodeAt( counter ++ ) ;

		if ( value >= 0xD800 && value <= 0xDBFF && counter < length ) {
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;

			if ( ( extra & 0xFC00 ) === 0xDC00 ) {	// Low surrogate.
				output.push( str.slice( counter - 2 , counter ) ) ;
			}
			else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push( str[ counter - 2 ] ) ;
				counter -- ;
			}
		}
		else {
			output.push( str[ counter - 1 ] ) ;
		}
	}

	return output ;
} ;



// Decode a string into an array of unicode characters
// Wide chars have an additionnal filler cell, so position is correct
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.toCells = ( Cell , str , tabWidth = 4 , linePosition = 0 , ... extraCellArgs ) => {
	var value , extra , counter = 0 , output = [] ,
		fillSize ,
		length = str.length ;

	while ( counter < length ) {
		value = str.charCodeAt( counter ++ ) ;

		if ( value === 0x0a ) {	// New line
			linePosition = 0 ;
		}
		else if ( value === 0x09 ) {	// Tab
			// Depends upon the next tab-stop
			fillSize = tabWidth - ( linePosition % tabWidth ) - 1 ;
			output.push( new Cell( '\t' , ... extraCellArgs ) ) ;
			linePosition += 1 + fillSize ;
			while ( fillSize -- ) { output.push( new Cell( null , ... extraCellArgs ) ) ; }
		}
		else if ( value >= 0xD800 && value <= 0xDBFF && counter < length ) {
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;

			if ( ( extra & 0xFC00 ) === 0xDC00 ) {	// Low surrogate.
				value = ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000 ;
				output.push(  new Cell( str.slice( counter - 2 , counter ) , ... extraCellArgs )  ) ;
				linePosition ++ ;

				if ( unicode.codePointWidth( value ) === 2 ) {
					linePosition ++ ;
					output.push( new Cell( null , ... extraCellArgs ) ) ;
				}
			}
			else {
				// It's an unmatched surrogate, remove it.
				// Preserve current char in case the next code unit is the high surrogate of a surrogate pair.
				counter -- ;
			}
		}
		else {
			output.push(  new Cell( str[ counter - 1 ] , ... extraCellArgs )  ) ;
			linePosition ++ ;

			if ( unicode.codePointWidth( value ) === 2 ) {
				output.push( new Cell( null , ... extraCellArgs ) ) ;
				linePosition ++ ;
			}
		}
	}

	return output ;
} ;



unicode.fromCells = ( cells ) => {
	return cells.map( cell => cell.filler ? '' : cell.char ).join( '' ) ;
} ;



// Get the length of an unicode string
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.length = str => {
	var value , extra , counter = 0 , uLength = 0 ,
		length = str.length ;

	while ( counter < length ) {
		value = str.charCodeAt( counter ++ ) ;

		if ( value >= 0xD800 && value <= 0xDBFF && counter < length ) {
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;

			if ( ( extra & 0xFC00 ) !== 0xDC00 ) {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				counter -- ;
			}
		}

		uLength ++ ;
	}

	return uLength ;
} ;



// Return the width of a string in a terminal/monospace font
unicode.width = str => {
	var count = 0 ;
	unicode.decode( str ).forEach( code => count += unicode.codePointWidth( code ) ) ;
	return count ;
} ;



// Return the width of an array of string in a terminal/monospace font
unicode.arrayWidth = ( array , limit ) => {
	var index , count = 0 ;

	if ( limit === undefined ) { limit = array.length ; }

	for ( index = 0 ; index < limit ; index ++ ) {
		count += unicode.isFullWidth( array[ index ] ) ? 2 : 1 ;
	}

	return count ;
} ;



// Userland may use this, it is more efficient than .truncateWidth() + .width(),
// and BTW even more than testing .width() then .truncateWidth() + .width()
var lastTruncateWidth = 0 ;
unicode.getLastTruncateWidth = () => lastTruncateWidth ;



// Return a string that does not exceed the limit
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.widthLimit =	// DEPRECATED
unicode.truncateWidth = ( str , limit ) => {
	var value , extra , charWidth , counter = 0 , lastCounter = 0 ,
		length = str.length ;

	lastTruncateWidth = 0 ;

	while ( counter < length ) {
		value = str.charCodeAt( counter ++ ) ;

		if ( value >= 0xD800 && value <= 0xDBFF && counter < length ) {
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;

			if ( ( extra & 0xFC00 ) === 0xDC00 ) {	// Low surrogate.
				value = ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000 ;
			}
			else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				counter -- ;
			}
		}

		charWidth = unicode.codePointWidth( value ) ;

		if ( lastTruncateWidth + charWidth > limit ) {
			return str.slice( 0 , lastCounter ) ;
		}

		lastTruncateWidth += charWidth ;
		lastCounter = counter ;
	}

	// The string remains unchanged
	return str ;
} ;



/*
	Returns:
		0: single char
		1: leading surrogate
		-1: trailing surrogate

	Note: it does not check input, to gain perfs.
*/
unicode.surrogatePair = char => {
	var code = char.charCodeAt( 0 ) ;

	if ( code < 0xd800 || code >= 0xe000 ) { return 0 ; }
	else if ( code < 0xdc00 ) { return 1 ; }
	return -1 ;
} ;



/*
	Check if a character is a full-width char or not.
*/
unicode.isFullWidth = char => {
	if ( char.length <= 1 ) { return unicode.isFullWidthCodePoint( char.codePointAt( 0 ) ) ; }
	return unicode.isFullWidthCodePoint( unicode.firstCodePoint( char ) ) ;
} ;


// Return the width of a char, leaner than .width() for one char
unicode.charWidth = char => {
	if ( char.length <= 1 ) { return unicode.codePointWidth( char.codePointAt( 0 ) ) ; }
	return unicode.codePointWidth( unicode.firstCodePoint( char ) ) ;
} ;



/*
	Check if a codepoint represent a full-width char or not.

	Borrowed from Node.js source, from readline.js.
*/
unicode.codePointWidth = code => {
	// Code points are derived from:
	// http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	if ( code >= 0x1100 && (
		code <= 0x115f ||	// Hangul Jamo
			0x2329 === code || // LEFT-POINTING ANGLE BRACKET
			0x232a === code || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			( 0x2e80 <= code && code <= 0x3247 && code !== 0x303f ) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			0x3250 <= code && code <= 0x4dbf ||
			// CJK Unified Ideographs .. Yi Radicals
			0x4e00 <= code && code <= 0xa4c6 ||
			// Hangul Jamo Extended-A
			0xa960 <= code && code <= 0xa97c ||
			// Hangul Syllables
			0xac00 <= code && code <= 0xd7a3 ||
			// CJK Compatibility Ideographs
			0xf900 <= code && code <= 0xfaff ||
			// Vertical Forms
			0xfe10 <= code && code <= 0xfe19 ||
			// CJK Compatibility Forms .. Small Form Variants
			0xfe30 <= code && code <= 0xfe6b ||
			// Halfwidth and Fullwidth Forms
			0xff01 <= code && code <= 0xff60 ||
			0xffe0 <= code && code <= 0xffe6 ||
			// Kana Supplement
			0x1b000 <= code && code <= 0x1b001 ||
			// Enclosed Ideographic Supplement
			0x1f200 <= code && code <= 0x1f251 ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			0x20000 <= code && code <= 0x3fffd ) ) {
		return 2 ;
	}

	return 1 ;
} ;

// For a true/false type of result
unicode.isFullWidthCodePoint = code => unicode.codePointWidth( code ) === 2 ;



// Convert normal ASCII chars to their full-width counterpart
unicode.toFullWidth = str => {
	return String.fromCodePoint( ... unicode.decode( str ).map( code =>
		code >= 33 && code <= 126  ?  0xff00 + code - 0x20  :  code
	) ) ;
} ;


},{}],32:[function(require,module,exports){
/*
	Tree Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



/*
	Stand-alone fork of extend.js, without options.
*/

function clone( originalObject , circular ) {
	// First create an empty object with
	// same prototype of our original source

	var originalProto = Object.getPrototypeOf( originalObject ) ;

	// Opaque objects, like Date
	if ( clone.opaque.has( originalProto ) ) { return clone.opaque.get( originalProto )( originalObject ) ; }

	var propertyIndex , descriptor , keys , current , nextSource , proto ,
		copies = [ {
			source: originalObject ,
			target: Array.isArray( originalObject ) ? [] : Object.create( originalProto )
		} ] ,
		cloneObject = copies[ 0 ].target ,
		refMap = new Map() ;

	refMap.set( originalObject , cloneObject ) ;


	// First in, first out
	while ( ( current = copies.shift() ) ) {
		keys = Object.getOwnPropertyNames( current.source ) ;

		for ( propertyIndex = 0 ; propertyIndex < keys.length ; propertyIndex ++ ) {
			// Save the source's descriptor
			descriptor = Object.getOwnPropertyDescriptor( current.source , keys[ propertyIndex ] ) ;


			if ( ! descriptor.value || typeof descriptor.value !== 'object' ) {
				Object.defineProperty( current.target , keys[ propertyIndex ] , descriptor ) ;
				continue ;
			}

			nextSource = descriptor.value ;

			if ( circular ) {
				if ( refMap.has( nextSource ) ) {
					// The source is already referenced, just assign reference
					descriptor.value = refMap.get( nextSource ) ;
					Object.defineProperty( current.target , keys[ propertyIndex ] , descriptor ) ;
					continue ;
				}
			}

			proto = Object.getPrototypeOf( descriptor.value ) ;

			// Opaque objects, like Date, not recursivity for them
			if ( clone.opaque.has( proto ) ) {
				descriptor.value = clone.opaque.get( proto )( descriptor.value ) ;
				Object.defineProperty( current.target , keys[ propertyIndex ] , descriptor ) ;
				continue ;
			}

			descriptor.value = Array.isArray( nextSource ) ? [] : Object.create( proto ) ;

			if ( circular ) { refMap.set( nextSource , descriptor.value ) ; }

			Object.defineProperty( current.target , keys[ propertyIndex ] , descriptor ) ;
			copies.push( { source: nextSource , target: descriptor.value } ) ;
		}
	}

	return cloneObject ;
}

module.exports = clone ;



clone.opaque = new Map() ;
clone.opaque.set( Date.prototype , src => new Date( src ) ) ;


},{}],33:[function(require,module,exports){
/*
	Tree Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



const dotPath = {} ;
module.exports = dotPath ;



const EMPTY_PATH = [] ;
const PROTO_POLLUTION_MESSAGE = 'This would pollute prototype' ;



function toPathArray( path ) {
	if ( Array.isArray( path ) ) { return path ; }
	else if ( ! path ) { return EMPTY_PATH ; }
	else if ( typeof path === 'string' ) { return path.split( '.' ) ; }

	throw new TypeError( '[tree.dotPath]: the path argument should be a string or an array' ) ;
}



// Walk the tree using the path array.
function walk( object , pathArray , maxOffset = 0 ) {
	var i , iMax , key ,
		pointer = object ;

	for ( i = 0 , iMax = pathArray.length + maxOffset ; i < iMax ; i ++ ) {
		key = pathArray[ i ] ;

		if ( key === '__proto__' || typeof pointer === 'function' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }
		if ( ! pointer || typeof pointer !== 'object' ) { return undefined ; }

		pointer = pointer[ key ] ;
	}

	return pointer ;
}



// Walk the tree, create missing element: pave the path up to before the last part of the path.
// Return that before-the-last element.
// Object MUST be an object! no check are performed for the first step!
function pave( object , pathArray ) {
	var i , iMax , key ,
		pointer = object ;

	for ( i = 0 , iMax = pathArray.length - 1 ; i < iMax ; i ++ ) {
		key = pathArray[ i ] ;

		if ( key === '__proto__' || typeof pointer[ key ] === 'function' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }
		if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = {} ; }

		pointer = pointer[ key ] ;
	}

	return pointer ;
}



dotPath.get = ( object , path ) => walk( object , toPathArray( path ) ) ;



dotPath.set = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	pointer[ key ] = value ;

	return value ;
} ;



dotPath.define = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! ( key in pointer ) ) { pointer[ key ] = value ; }

	return value ;
} ;



dotPath.inc = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( typeof pointer[ key ] === 'number' ) { pointer[ key ] ++ ; }
	else if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = 1 ; }

	return value ;
} ;



dotPath.dec = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( typeof pointer[ key ] === 'number' ) { pointer[ key ] -- ; }
	else if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = -1 ; }

	return value ;
} ;



dotPath.concat = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = value ; }
	else if ( Array.isArray( pointer[ key ] ) && Array.isArray( value ) ) {
		pointer[ key ] = pointer[ key ].concat( value ) ;
	}
	//else ? do nothing???

	return value ;
} ;



dotPath.insert = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = value ; }
	else if ( Array.isArray( pointer[ key ] ) && Array.isArray( value ) ) {
		pointer[ key ] = value.concat( pointer[ key ] ) ;
	}
	//else ? do nothing???

	return value ;
} ;



dotPath.delete = ( object , path ) => {
	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = walk( object , pathArray , -1 ) ;

	if ( ! pointer || typeof pointer !== 'object' ) { return false ; }

	return delete pointer[ key ] ;
} ;



dotPath.autoPush = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( pointer[ key ] === undefined ) { pointer[ key ] = value ; }
	else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].push( value ) ; }
	else { pointer[ key ] = [ pointer[ key ] , value ] ; }

	return pointer[ key ] ;
} ;



dotPath.append = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = [ value ] ; }
	else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].push( value ) ; }
	//else ? do nothing???

	return pointer[ key ] ;
} ;



dotPath.prepend = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) {
		// Throw?
		return undefined ;
	}

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = [ value ] ; }
	else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].unshift( value ) ; }
	//else ? do nothing???

	return pointer[ key ] ;
} ;


},{}]},{},[7])(7)
});
