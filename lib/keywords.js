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



module.exports = {
	it: { filler: true },
	its: { filler: true },
	a: { filler: true },
	an: { filler: true },
	the: { filler: true },
	to: { filler: true },
	that: { filler: true },
	has: { filler: true },
	have: { filler: true },
	having: { filler: true },
	at: { filler: true },
	with: { filler: true },
	than: { filler: true },
	or: { filler: true },
	equal: { filler: true },
	":": { filler: true },
	should: { reset: true },
	expect: { reset: true },
	expected: { reset: true },
	be: { expected: 'typeOrClass' },
	is: { expected: 'typeOrClass' },
	instance: { expected: 'class', override: { of: { filler: true } } },
	type: { expected: 'type', override: { of: { filler: true } } },
	optional: { flag: true },
	empty: { set: { length: 0 } },
	after: { expected: 'sanitizer' },
	sanitize: { expected: 'sanitizer' },
	sanitizer: { expected: 'sanitizer' },
	sanitizers: { expected: 'sanitizer' },
	sanitizing: { expected: 'sanitizer' },
	least: { expected: 'minValue' },
	greater: { expected: 'minValue' , needKeyword: 'equal' },
	">=": { expected: 'minValue' },
	gte: { expected: 'minValue' },
	most: { expected: 'maxValue' },
	"<=": { expected: 'maxValue' },
	lte: { expected: 'maxValue' },
	lower: { expected: 'maxValue' , needKeyword: 'equal' },
	lesser: { expected: 'maxValue' , needKeyword: 'equal' },
	between: { expected: [ 'minValue', 'maxValue' ] },
	within: { expected: [ 'minValue', 'maxValue' ] },
	and: { next: true, restoreOverride: true, restoreExpected: true },
	',': { next: true, restoreOverride: true, restoreExpected: true },
	';': { reset: true },
	'.': { reset: true },
	length: { expected: 'lengthValue' , override: {
		of: { filler: true },
		least: { expected: 'minLengthValue' },
		most: { expected: 'maxLengthValue' },
		between: { expected: [ 'minLengthValue' , 'maxLengthValue' ] },
	} },
	letter: { minMaxAreLength: true },
	letters: { minMaxAreLength: true },
	char: { minMaxAreLength: true },
	chars: { minMaxAreLength: true },
	character: { minMaxAreLength: true },
	characters: { minMaxAreLength: true },
	of: { expected: 'typeOrClass' , toChild: 'of' },
} ;
