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

