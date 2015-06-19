/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



var doormen = require( './doormen.js' ) ;



function expect( data )
{
	var context = Object.create( Object.prototype , {
		data: { value: data } ,
		schema: { value: {} }
	} ) ;
	
	var carryOver = [] ;
	var action = {} ;
	
	var apply = apply.bind( context , action ) ;
	
	populate( apply , context , carryOver ) ;
	
	return apply ;
}



function apply( action )
{
	return doormen( this.data , this.schema ) ;
}



function populate( fn , context , carryOver )
{
	var key ;
	
	for ( key in doormen.keywords )
	{
		lazyLoad( fn , key , context , carryOver.slice() ) ;
	}
}

function lazyLoad( parent , key , context , carryOver )
{
	carryOver.push( key ) ;
	
	Object.defineProperty( fn , key , {
		configurable: true,
		//enumerable: true,
		get: function() {
			updateAction( context.schema , carryOver ) ;
			var fn = apply.bind( context , carryOver ) ;
			populate( fn , context , carryOver ) ;
			Object.defineProperty( fn , key , { value: fn } ) ;
			return fn ;
		}
	} ) ;
}

function updateAction( schema , carryOver )
{
	
}



function sentence( str )
{
	var i , word , wordList , expected , lastExpected , schema , pointer , stack , nextActions ,
		keywordsOverride , noOverride , lastOverride ,
		needKeyword , needKeywordFor ;
	
	wordList = str.split( / +|(?=[,;.:])/ ) ;
	//console.log( wordList ) ;
	
	schema = {} ;
	pointer = schema ;
	stack = [ schema ] ;
	
	nextActions = [] ;
	noOverride = {} ;
	keywordsOverride = lastOverride = noOverride ;
	
	lastExpected = null ;
	expected = [ 'typeOrClass' ] ;
	
	needKeyword = null ;
	needKeywordFor = null ;
	
	
	
	var applyAction = function applyAction( action , word ) {
	
		var key ;
		
		if ( action.reset )
		{
			nextActions = [] ;
			keywordsOverride = lastOverride = noOverride ;
			lastExpected = null ;
			expected = [ 'typeOrClass' ] ;
			needKeyword = null ;
			needKeywordFor = null ;
		}
		
		if ( action.toChild )
		{
			pointer[ action.toChild ] = {} ;
			stack.push( pointer[ action.toChild ] ) ;
			pointer = pointer[ action.toChild ] ;
		}
		
		if ( action.expected )
		{
			expected = Array.isArray( action.expected ) ? action.expected.slice() : [ action.expected ] ;
			needKeyword = null ;
		}
		
		if ( action.needKeyword ) { needKeyword = action.needKeyword ; needKeywordFor = word ; }
		else if ( needKeyword && needKeyword === word ) { needKeyword = null ; needKeywordFor = null ; }
		
		if ( action.set )
		{
			for ( key in action.set ) { pointer[ key ] = action.set[ key ] ; }
		}
		
		if ( action.flag ) { pointer[ action.flag ] = true ; }
		
		if ( action.override ) { keywordsOverride = action.override ; }
		
		if ( action.restoreOverride ) { keywordsOverride = lastOverride ; }
		
		if ( action.restoreExpected && ! expected.length ) { expected.unshift( lastExpected ) ; }
		
		if ( action.nextActions ) { nextActions = action.nextActions.slice() ; }
		
		if ( action.minMaxAreLength )
		{
			if ( 'min' in pointer ) { pointer.minLength = pointer.min ; delete pointer.min ; }
			if ( 'max' in pointer ) { pointer.maxLength = pointer.max ; delete pointer.max ; }
		}
		
		if ( action.next && nextActions.length ) { applyAction( nextActions.shift() ) ; }
	} ;
	
	
	
	for ( i = 0 ; i < wordList.length ; i ++ )
	{
		word = wordList[ i ] ;
		//console.log( 'word:' , word , '- expected:' , expected ) ;
		
		if ( keywordsOverride[ word ] || doormen.keywords[ word ] )
		{
			applyAction( keywordsOverride[ word ] || doormen.keywords[ word ] , word ) ;
		}
		else if ( ! expected.length )
		{
			throw new Error(
				"Can't understand the word #" + i + " '" + word + "'" +
				( i > 0 ? ", just after '" + wordList[ i - 1 ] + "'" : '' ) +
				", in the sentence '" + str + "'."
			) ;
		}
		else if ( needKeyword )
		{
			throw new Error(
				"Keyword '" + needKeyword + "' is required after keyword '" + needKeywordFor + "'" +
				", in the sentence '" + str + "'."
			) ;
		}
		else
		{
			word = doormen.sanitizer.dashToCamelCase( word ) ;
			
			switch ( expected[ 0 ] )
			{
				case 'type' :
					pointer.type = word ;
					break ;
				case 'class' :
					pointer.instanceOf = word ;
					break ;
				case 'typeOrClass' :
					if ( word[ 0 ].toLowerCase() === word[ 0 ] ) { pointer.type = word ; }
					else { pointer.instanceOf = word ; }
					break ;
				case 'sanitizer' :
					if ( ! pointer.sanitize ) { pointer.sanitize = [] ; }
					pointer.sanitize.push( word ) ;
					break ;
				case 'minValue' :
					pointer.min = parseInt( word , 10 ) ;
					break ;
				case 'maxValue' :
					pointer.max = parseInt( word , 10 ) ;
					break ;
				case 'lengthValue' :
					pointer.length = parseInt( word , 10 ) ;
					break ;
				case 'minLengthValue' :
					pointer.minLength = parseInt( word , 10 ) ;
					break ;
				case 'maxLengthValue' :
					pointer.maxLength = parseInt( word , 10 ) ;
					break ;
				/*
				case 'matchValue' :
				case 'inValues' :
				case 'notInValues' :
				case 'properties' :
				case 'elements' :
					break ;
				case 'default' :
					pointer.default = 
					expected = null ;
					break ;
				*/
			}
			
			lastExpected = expected.shift() ;
			//expected = null ;
			
			if ( ! nextActions.length )
			{
				if ( keywordsOverride !== noOverride )
				{
					lastOverride = keywordsOverride ;
					keywordsOverride = noOverride ;
				}
				else
				{
					lastOverride = noOverride ;
				}
			}
		}
	}
	
	return schema ;
}



module.exports = expect ;


