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



var keyWords = {
	it: {},
	a: {},
	an: {},
	to: {},
	that: {},
	has: {},
	have: {},
	having: {},
	at: {},
	with: {},
	than: {},
	or: {},
	equal: {},
	":": {},
	should: { reset: true },
	expect: { reset: true },
	expected: { reset: true },
	be: { expected: 'typeOrClass' },
	is: { expected: 'typeOrClass' },
	optional: { flag: true },
	after: { expected: 'sanitizer' },
	sanitize: { expected: 'sanitizer' },
	sanitizer: { expected: 'sanitizer' },
	sanitizers: { expected: 'sanitizer' },
	sanitizing: { expected: 'sanitizer' },
	least: { expected: 'minValue' },
	greater: { expected: 'minValue' , needKeyWord: 'equal' },
	">=": { expected: 'minValue' },
	gte: { expected: 'minValue' },
	most: { expected: 'maxValue' },
	"<=": { expected: 'maxValue' },
	lte: { expected: 'maxValue' },
	lower: { expected: 'maxValue' , needKeyWord: 'equal' },
	lesser: { expected: 'maxValue' , needKeyWord: 'equal' },
	between: { expected: 'minValue', nextActions: [ { expected: 'maxValue' } ] },
	within: { expected: 'minValue', nextActions: [ { expected: 'maxValue' } ] },
	and: { next: true, restoreOverride: true, restoreExpected: true },
	',': { next: true, restoreOverride: true, restoreExpected: true },
	';': { reset: true },
	'.': { reset: true },
	length: { expected: 'lengthValue' , override: {
		of: {},
		least: { expected: 'minLengthValue' },
		most: { expected: 'maxLengthValue' },
		between: { expected: 'minLengthValue', nextActions: [ { expected: 'maxLengthValue' } ] },
	} },
	letter: { minMaxAreLength: true },
	letters: { minMaxAreLength: true },
	char: { minMaxAreLength: true },
	chars: { minMaxAreLength: true },
	character: { minMaxAreLength: true },
	characters: { minMaxAreLength: true },
	of: { expected: 'typeOrClass' , toChild: 'of' },
} ;



function sentence( str )
{
	var i , word , wordList , expected , lastExpected , schema , pointer , stack , nextActions ,
		keyWordsOverride , noOverride , lastOverride ,
		needKeyWord , needKeyWordFor ;
	
	wordList = str.split( / +|(?=[,;.:])/ ) ;
	//console.log( wordList ) ;
	
	schema = {} ;
	pointer = schema ;
	stack = [ schema ] ;
	
	nextActions = [] ;
	noOverride = {} ;
	keyWordsOverride = lastOverride = noOverride ;
	
	lastExpected = null ;
	expected = 'typeOrClass' ;
	
	needKeyWord = null ;
	needKeyWordFor = null ;
	
	
	
	var applyAction = function applyAction( action , word ) {
	
		if ( action.reset )
		{
			nextActions = [] ;
			keyWordsOverride = lastOverride = noOverride ;
			lastExpected = null ;
			expected = 'typeOrClass' ;
			needKeyWord = null ;
			needKeyWordFor = null ;
		}
		
		if ( action.toChild )
		{
			pointer[ action.toChild ] = {} ;
			stack.push( pointer[ action.toChild ] ) ;
			pointer = pointer[ action.toChild ] ;
		}
		
		if ( action.expected )
		{
			expected = action.expected ;
			needKeyWord = null ;
		}
		
		if ( action.needKeyWord ) { needKeyWord = action.needKeyWord ; needKeyWordFor = word ; }
		else if ( needKeyWord && needKeyWord === word ) { needKeyWord = null ; needKeyWordFor = null ; }
		
		if ( action.flag ) { pointer[ action.flag ] = true ; }
		
		if ( action.override ) { keyWordsOverride = action.override ; }
		
		if ( action.restoreOverride ) { keyWordsOverride = lastOverride ; }
		
		if ( action.restoreExpected ) { expected = lastExpected ; }
		
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
		
		if ( keyWordsOverride[ word ] || keyWords[ word ] )
		{
			applyAction( keyWordsOverride[ word ] || keyWords[ word ] , word ) ;
		}
		else if ( ! expected )
		{
			throw new Error(
				"Can't understand the word #" + i + " '" + word + "'" +
				( i > 0 ? ", just after '" + wordList[ i - 1 ] + "'" : '' ) +
				", in the sentence '" + str + "'."
			) ;
		}
		else if ( needKeyWord )
		{
			throw new Error(
				"Keyword '" + needKeyWord + "' is required after keyword '" + needKeyWordFor + "'" +
				", in the sentence '" + str + "'."
			) ;
		}
		else
		{
			word = doormen.sanitizer.dashToCamelCase( word ) ;
			
			switch ( expected )
			{
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
			
			lastExpected = expected ;
			expected = null ;
			
			if ( ! nextActions.length )
			{
				if ( keyWordsOverride !== noOverride )
				{
					lastOverride = keyWordsOverride ;
					keyWordsOverride = noOverride ;
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



module.exports = sentence ;
sentence.keyWords = keyWords ;


