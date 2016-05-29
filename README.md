

# Doormen

Validate, sanitize and assert: the silver bullet of data!

Beta version.

**/!\\ This documentation is still a Work In Progress /!\\**



## Basic validation

* sanitize `Array` of `string` the sanitizer's name to apply before any type checking
* optional `boolean` the data can be `null` or `undefined`, if so the data validate immediately
* default (anything) the data can be `null` or `undefined`, if so it is overwritten by the default value and it validates immediately
* type `string` the name of the type checker
* instanceOf
* min
* max
* length
* minLength
* maxLength
* match
* in
* notIn
* when
* properties `object` of schema, it iterates through each properties and checks that they all match their own schema
* elements `Array` same than properties but for arrays
* only `boolean` used in conjunction with *properties* or *elements*, it checks that no properties other than those listed are present
* of `object` contains one schema that will check each elements of an array or each properties



## Type Checkers

Javascript primitive types:

* undefined: the data should be `undefined`
* null: the data should be `null`
* boolean: the data should be a `boolean`, i.e. `true` or `false`
* number: the data should be a `number`. **NOTE** that `Infinity` and `NaN` are ok, so you may consider using *real*
  instead of *number* in almost all cases
* string: the data should be a `string`
* object: the data should be an `Object`
* function: the data should be a `Function`


Javascript/Node.js built-in types:

* array: the data should be an `Array`
* error: the data should be an instance of `Error`
* date: the data should be an instance of `Date`
* buffer: the data should be a Node.js `Buffer`
                                        

Common meta types:

* real: a `number` that is not `NaN` nor +/- `Infinity`
* integer: a `number` that is not `NaN` nor +/- `Infinity`, and that do not have decimal part



## Sanitizers

* toNumber: try to convert a `string` to a `number`
* trim: trim a `string`, removing whitespace at the beginning and the end



# TOC
   - [Assertion utilities](#assertion-utilities)
   - [Equality checker](#equality-checker)
   - [Basic types](#basic-types)
   - [Optional and default data](#optional-and-default-data)
   - [Built-in types](#built-in-types)
   - [Mixed types](#mixed-types)
   - [Top-level filters](#top-level-filters)
   - [Filters](#filters)
   - [Children and recursivity](#children-and-recursivity)
   - [Properties having 'when'](#properties-having-when)
   - [Mask](#mask)
   - [Numbers meta types](#numbers-meta-types)
   - [Strings meta types](#strings-meta-types)
   - [Sanitize](#sanitize)
   - [Sanitize + Patch reporting](#sanitize--patch-reporting)
   - [Full report mode](#full-report-mode)
   - [Patch validation](#patch-validation)
   - ['keys' attribute](#keys-attribute)
   - [Alternatives](#alternatives)
   - [Conditionnal schema.](#conditionnal-schema)
   - [Purify](#purify)
   - [Export mode](#export-mode)
   - [Schema as a sentence](#schema-as-a-sentence)
   - [Path in the schema](#path-in-the-schema)
   - [MongoDB's ObjectID](#mongodbs-objectid)
   - [Misc](#misc)
<a name=""></a>
 
<a name="assertion-utilities"></a>
# Assertion utilities
doormen.shouldThrow() should throw if the callback has not throw, and catch if it has throw.

```js
var thrown ;


thrown = false ;

try {
	doormen.shouldThrow( function() {} ) ;
}
catch ( error ) {
	thrown = true ;
}

if ( ! thrown ) { throw new Error( 'It should throw!' ) ; }


thrown = false ;

try {
	doormen.shouldThrow( function() { throw new Error( 'Fatal error' ) ; } ) ;
}
catch ( error ) {
	thrown = true ;
}

if ( thrown ) { throw new Error( 'It should *NOT* throw' ) ; }
```

doormen.not() should throw if the data validate, and catch if it has throw.

```js
var thrown ;


thrown = false ;

try {
	doormen.not( { type: 'string' } , 'text' ) ;
}
catch ( error ) {
	thrown = true ;
}

if ( ! thrown ) { throw new Error( 'It should throw' ) ; }


thrown = false ;

try {
	doormen.not( { type: 'string' } , 1 ) ;
}
catch ( error ) {
	thrown = true ;
}

if ( thrown ) { throw new Error( 'It should *NOT* throw' ) ; }
```

<a name="equality-checker"></a>
# Equality checker
Equality of simple type.

```js
doormen.equals( undefined , undefined ) ;
doormen.equals( null , null ) ;
doormen.equals( true , true ) ;
doormen.equals( false , false ) ;
doormen.not.equals( undefined , null ) ;
doormen.not.equals( true , false ) ;
doormen.not.equals( null , false ) ;
doormen.not.equals( undefined , false ) ;

doormen.equals( NaN , NaN ) ;
doormen.not.equals( NaN , null ) ;
doormen.not.equals( NaN , undefined ) ;

doormen.equals( Infinity , Infinity ) ;
doormen.equals( -Infinity , -Infinity ) ;
doormen.not.equals( Infinity , -Infinity ) ;

doormen.equals( 0 , 0 ) ;
doormen.equals( 123 , 123 ) ;
doormen.equals( 0.123 , 0.123 ) ;

doormen.equals( "" , "" ) ;
doormen.equals( "abc" , "abc" ) ;
doormen.equals( "   abc" , "   abc" ) ;
doormen.equals( "abc  " , "abc  " ) ;
doormen.equals( "     abc  " , "     abc  " ) ;

doormen.not.equals( 0 , "" ) ;
doormen.not.equals( false , "" ) ;
```

Equality of objects.

```js
var o = {} ;

doormen.equals( {} , {} ) ;
doormen.equals( o , o ) ;
doormen.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 } ) ;
doormen.not.equals( { a: 2 , b: 6 } , { a: 2 , b: 5 } ) ;
doormen.equals( { b: 5 , a: 2 } , { a: 2 , b: 5 } ) ;
doormen.not.equals( { a: 2 , b: 5 , c: null } , { a: 2 , b: 5 } ) ;
doormen.not.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: null } ) ;

doormen.not.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 } ) ;
doormen.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 , c: {} } ) ;
doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' } } ) ;
doormen.not.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'toto' } } ) ;
doormen.equals(
	{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } } ,
	{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } }
) ;
```

when a property is undefined in the left-side and non-existant in the right-side, they should be equals.

```js
doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 } ) ;
doormen.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: undefined } ) ;
doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , c: undefined } ) ;
doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , d: undefined } ) ;
doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' , e: undefined } } ) ;
```

Equality of arrays.

```js
var o = [] ;

doormen.equals( [] , [] ) ;
doormen.equals( o , o ) ;
doormen.equals( [ 1 ] , [ 1 ] ) ;
doormen.not.equals( [ 1 , undefined ] , [ 1 ] ) ;
doormen.not.equals( [ 1 ] , [ 1 , undefined ] ) ;
doormen.not.equals( [ 1 ] , [ 2 ] ) ;
doormen.equals( [ 1 , 2 , 3 ] , [ 1 , 2 , 3 ] ) ;
doormen.equals( [ 1 , [] , 3 ] , [ 1 , [] , 3 ] ) ;
doormen.equals( [ 1 , [ 2 ] , 3 ] , [ 1 , [ 2 ] , 3 ] ) ;
doormen.equals( [ 1 , [ 2 , 'a' ] , 3 ] , [ 1 , [ 2 , 'a' ] , 3 ] ) ;
doormen.not.equals( [ 1 , [ 2 , 'a' ] , 3 ] , [ 1 , [ 2 , 'b' ] , 3 ] ) ;
doormen.equals( [ 1 , [ 2 , [ null ] , 'a' ] , 3 ] , [ 1 , [ 2 , [ null ] , 'a' ] , 3 ] ) ;
doormen.not.equals( [ 1 , [ 2 , [ undefined ] , 'a' ] , 3 ] , [ 1 , [ 2 , [ null ] , 'a' ] , 3 ] ) ;
```

Equality of nested and mixed objects and arrays.

```js
doormen.not.equals( {} , [] ) ;
doormen.equals(
	{ a: 2 , b: 5 , c: [ 'titi' , { f: 'f' , g: 7 } ] } ,
	{ a: 2 , b: 5 , c: [ 'titi' , { f: 'f' , g: 7 } ] }
) ;
doormen.equals(
	[ 'a' , 'b' , { c: 'titi' , d: [ 'f' , 7 ] } ] ,
	[ 'a' , 'b' , { c: 'titi' , d: [ 'f' , 7 ] } ]
) ;
```

Circular references: stop searching when both part have reached circular references.

```js
var a , b ;

a = { a: 1, b: 2 } ;
a.c = a ;

b = { a: 1, b: 2 } ;
b.c = b ;

doormen.equals( a , b ) ;

a = { a: 1, b: 2 , c: { a: 1, b: 2 } } ;
a.c.c = a ;

b = { a: 1, b: 2 } ;
b.c = b ;

doormen.equals( a , b ) ;
```

<a name="basic-types"></a>
# Basic types
should validate undefined accordingly.

```js
doormen( { type: 'undefined' } , undefined ) ;
doormen.not( { type: 'undefined' } , null ) ;
doormen.not( { type: 'undefined' } , false ) ;
doormen.not( { type: 'undefined' } , true ) ;
doormen.not( { type: 'undefined' } , 0 ) ;
doormen.not( { type: 'undefined' } , 1 ) ;
doormen.not( { type: 'undefined' } , '' ) ;
doormen.not( { type: 'undefined' } , 'text' ) ;
doormen.not( { type: 'undefined' } , {} ) ;
doormen.not( { type: 'undefined' } , [] ) ;
```

should validate null accordingly.

```js
doormen.not( { type: 'null' } , undefined ) ;
doormen( { type: 'null' } , null ) ;
doormen.not( { type: 'null' } , false ) ;
doormen.not( { type: 'null' } , true ) ;
doormen.not( { type: 'null' } , 0 ) ;
doormen.not( { type: 'null' } , 1 ) ;
doormen.not( { type: 'null' } , '' ) ;
doormen.not( { type: 'null' } , 'text' ) ;
doormen.not( { type: 'null' } , {} ) ;
doormen.not( { type: 'null' } , [] ) ;
```

should validate boolean accordingly.

```js
doormen.not( { type: 'boolean' } , undefined ) ;
doormen.not( { type: 'boolean' } , null ) ;
doormen( { type: 'boolean' } , false ) ;
doormen( { type: 'boolean' } , true ) ;
doormen.not( { type: 'boolean' } , 0 ) ;
doormen.not( { type: 'boolean' } , 1 ) ;
doormen.not( { type: 'boolean' } , '' ) ;
doormen.not( { type: 'boolean' } , 'text' ) ;
doormen.not( { type: 'boolean' } , {} ) ;
doormen.not( { type: 'boolean' } , [] ) ;
```

should validate number accordingly.

```js
doormen.not( { type: 'number' } , undefined ) ;
doormen.not( { type: 'number' } , null ) ;
doormen.not( { type: 'number' } , false ) ;
doormen.not( { type: 'number' } , true ) ;
doormen( { type: 'number' } , 0 ) ;
doormen( { type: 'number' } , 1 ) ;
doormen( { type: 'number' } , Infinity ) ;
doormen( { type: 'number' } , NaN ) ;
doormen.not( { type: 'number' } , '' ) ;
doormen.not( { type: 'number' } , 'text' ) ;
doormen.not( { type: 'number' } , {} ) ;
doormen.not( { type: 'number' } , [] ) ;
```

should validate string accordingly.

```js
doormen.not( { type: 'string' } , undefined ) ;
doormen.not( { type: 'string' } , null ) ;
doormen.not( { type: 'string' } , false ) ;
doormen.not( { type: 'string' } , true ) ;
doormen.not( { type: 'string' } , 0 ) ;
doormen.not( { type: 'string' } , 1 ) ;
doormen( { type: 'string' } , '' ) ;
doormen( { type: 'string' } , 'text' ) ;
doormen.not( { type: 'string' } , {} ) ;
doormen.not( { type: 'string' } , [] ) ;
```

should validate object accordingly.

```js
doormen.not( { type: 'object' } , undefined ) ;
doormen.not( { type: 'object' } , null ) ;
doormen.not( { type: 'object' } , false ) ;
doormen.not( { type: 'object' } , true ) ;
doormen.not( { type: 'object' } , 0 ) ;
doormen.not( { type: 'object' } , 1 ) ;
doormen.not( { type: 'object' } , '' ) ;
doormen.not( { type: 'object' } , 'text' ) ;
doormen( { type: 'object' } , {} ) ;
doormen( { type: 'object' } , { a:1 , b:2 } ) ;
doormen( { type: 'object' } , [] ) ;
doormen( { type: 'object' } , [ 1,2,3 ] ) ;
doormen( { type: 'object' } , new Date() ) ;
doormen.not( { type: 'object' } , function(){} ) ;
```

should validate function accordingly.

```js
doormen.not( { type: 'function' } , undefined ) ;
doormen.not( { type: 'function' } , null ) ;
doormen.not( { type: 'function' } , false ) ;
doormen.not( { type: 'function' } , true ) ;
doormen.not( { type: 'function' } , 0 ) ;
doormen.not( { type: 'function' } , 1 ) ;
doormen.not( { type: 'function' } , '' ) ;
doormen.not( { type: 'function' } , 'text' ) ;
doormen.not( { type: 'function' } , {} ) ;
doormen.not( { type: 'function' } , [] ) ;
doormen( { type: 'function' } , function(){} ) ;
```

<a name="optional-and-default-data"></a>
# Optional and default data
when a data is null, undefined or unexistant, and the optional flag is set the schema, it should validate.

```js
doormen.not( { type: 'string' } , null ) ;
doormen( { optional: true, type: 'string' } , null ) ;
doormen.not( { type: 'string' } , undefined ) ;
doormen( { optional: true, type: 'string' } , undefined ) ;

doormen( { type: 'string' } , 'text' ) ;
doormen( { optional: true, type: 'string' } , 'text' ) ;
doormen.not( { type: 'string' } , 1 ) ;
doormen.not( { optional: true, type: 'string' } , 1 ) ;

doormen.not( { properties: { a: { type: 'string' } } } , {} ) ;
doormen( { properties: { a: { optional: true, type: 'string' } } } , {} ) ;
```

missing optional properties should not be created (i.e. with undefined)..

```js
var result ;

result = doormen( { properties: { a: { optional: true, type: 'string' } } } , {} ) ;

// {a:undefined} is equals to {} for doormen.equals() (this is the correct behaviour), but here we want to know for sure
// that a key is not defined, so we have to check it explicitly

doormen.equals( 'a' in result , false ) ;

result = doormen( {
		properties: {
			a: { optional: true, type: 'string' },
			b: { optional: true, type: 'string' },
			c: {
				optional: true,
				properties: {
					d: { optional: true, type: 'string' }
				}
			}
		}
	} ,
	{}
) ;

doormen.equals( 'a' in result , false ) ;
doormen.equals( 'b' in result , false ) ;
doormen.equals( 'c' in result , false ) ;

result = doormen( {
		properties: {
			a: { optional: true, type: 'string' },
			b: { optional: true, type: 'string' },
			c: {
				optional: true,
				properties: {
					d: { optional: true, type: 'string' }
				}
			}
		}
	} ,
	{ c: undefined }
) ;

doormen.equals( 'a' in result , false ) ;
doormen.equals( 'b' in result , false ) ;
doormen.equals( 'c' in result , true ) ;
doormen.equals( result.c , undefined ) ;

result = doormen( {
		properties: {
			a: { optional: true, type: 'string' },
			b: { optional: true, type: 'string' },
			c: {
				optional: true,
				properties: {
					d: { optional: true, type: 'string' }
				}
			}
		}
	} ,
	{ c: null }
) ;

doormen.equals( 'a' in result , false ) ;
doormen.equals( 'b' in result , false ) ;
doormen.equals( 'c' in result , true ) ;
doormen.equals( result.c , null ) ;

result = doormen( {
		properties: {
			a: { optional: true, type: 'string' },
			b: { optional: true, type: 'string' },
			c: {
				optional: true,
				properties: {
					d: { optional: true, type: 'string' }
				}
			}
		}
	} ,
	{ c: {} }
) ;

doormen.equals( 'a' in result , false ) ;
doormen.equals( 'b' in result , false ) ;
doormen.equals( 'c' in result , true ) ;
doormen.equals( 'd' in result.c , false ) ;
```

when a data is null, undefined or unexistant, and a default value is specified in the schema, that default value should overwrite the original one.

```js
doormen.equals( doormen( { type: 'string' , "default": 'default!' } , null ) , 'default!' ) ;
doormen.equals(
	doormen(
		{ properties: { a: { type: 'string' , "default": 'default!' } } } ,
		{ a: null } ) ,
	{ a: 'default!' }
) ;
doormen.equals(
	doormen(
		{ properties: { a: { type: 'string' , "default": 'default!' } , b: { type: 'object' , "default": { c: 5 } } } } ,
		{ a: null, b: undefined } ) ,
	{ a: 'default!' , b: { c: 5 } }
) ;
doormen.equals(
	doormen(
		{ properties: { a: { type: 'string' , "default": 'default!' } , b: { type: 'object' , "default": { c: 5 } } } } ,
		{} ) ,
	{ a: 'default!' , b: { c: 5 } }
) ;
```

<a name="built-in-types"></a>
# Built-in types
should validate array accordingly.

```js
doormen.not( { type: 'array' } , undefined ) ;
doormen.not( { type: 'array' } , null ) ;
doormen.not( { type: 'array' } , false ) ;
doormen.not( { type: 'array' } , true ) ;
doormen.not( { type: 'array' } , 0 ) ;
doormen.not( { type: 'array' } , 1 ) ;
doormen.not( { type: 'array' } , '' ) ;
doormen.not( { type: 'array' } , 'text' ) ;
doormen.not( { type: 'array' } , {} ) ;
doormen.not( { type: 'array' } , { a:1 , b:2 } ) ;
doormen( { type: 'array' } , [] ) ;
doormen( { type: 'array' } , [ 1,2,3 ] ) ;
doormen.not( { type: 'array' } , function(){} ) ;
```

should validate date accordingly.

```js
doormen( { type: 'date' } , new Date() ) ;

doormen.not( { type: 'date' } , undefined ) ;
doormen.not( { type: 'date' } , null ) ;
doormen.not( { type: 'date' } , false ) ;
doormen.not( { type: 'date' } , true ) ;
doormen.not( { type: 'date' } , 0 ) ;
doormen.not( { type: 'date' } , 1 ) ;
doormen.not( { type: 'date' } , '' ) ;
doormen.not( { type: 'date' } , 'text' ) ;
doormen.not( { type: 'date' } , {} ) ;
doormen.not( { type: 'date' } , { a:1 , b:2 } ) ;
doormen.not( { type: 'date' } , [] ) ;
doormen.not( { type: 'date' } , [ 1,2,3 ] ) ;
doormen.not( { type: 'date' } , function(){} ) ;
```

should validate error accordingly.

```js
doormen( { type: 'error' } , new Error() ) ;

doormen.not( { type: 'error' } , undefined ) ;
doormen.not( { type: 'error' } , null ) ;
doormen.not( { type: 'error' } , false ) ;
doormen.not( { type: 'error' } , true ) ;
doormen.not( { type: 'error' } , 0 ) ;
doormen.not( { type: 'error' } , 1 ) ;
doormen.not( { type: 'error' } , '' ) ;
doormen.not( { type: 'error' } , 'text' ) ;
doormen.not( { type: 'error' } , {} ) ;
doormen.not( { type: 'error' } , { a:1 , b:2 } ) ;
doormen.not( { type: 'error' } , [] ) ;
doormen.not( { type: 'error' } , [ 1,2,3 ] ) ;
doormen.not( { type: 'error' } , function(){} ) ;
```

should validate arguments accordingly.

```js
var fn = function() { doormen( { type: 'arguments' } , arguments ) ; } ;

fn() ;
fn( 1 ) ;
fn( 1 , 2 , 3 ) ;

doormen.not( { type: 'arguments' } , undefined ) ;
doormen.not( { type: 'arguments' } , null ) ;
doormen.not( { type: 'arguments' } , false ) ;
doormen.not( { type: 'arguments' } , true ) ;
doormen.not( { type: 'arguments' } , 0 ) ;
doormen.not( { type: 'arguments' } , 1 ) ;
doormen.not( { type: 'arguments' } , '' ) ;
doormen.not( { type: 'arguments' } , 'text' ) ;
doormen.not( { type: 'arguments' } , {} ) ;
doormen.not( { type: 'arguments' } , { a:1 , b:2 } ) ;
doormen.not( { type: 'arguments' } , [] ) ;
doormen.not( { type: 'arguments' } , [ 1,2,3 ] ) ;
doormen.not( { type: 'arguments' } , function(){} ) ;
```

<a name="mixed-types"></a>
# Mixed types
should validate 'strictObject' accordingly, i.e. objects that are *NOT* arrays.

```js
doormen.not( { type: 'strictObject' } , undefined ) ;
doormen.not( { type: 'strictObject' } , null ) ;
doormen.not( { type: 'strictObject' } , false ) ;
doormen.not( { type: 'strictObject' } , true ) ;
doormen.not( { type: 'strictObject' } , 0 ) ;
doormen.not( { type: 'strictObject' } , 1 ) ;
doormen.not( { type: 'strictObject' } , '' ) ;
doormen.not( { type: 'strictObject' } , 'text' ) ;
doormen( { type: 'strictObject' } , {} ) ;
doormen( { type: 'strictObject' } , { a:1 , b:2 } ) ;
doormen.not( { type: 'strictObject' } , [] ) ;
doormen.not( { type: 'strictObject' } , [ 1,2,3 ] ) ;
doormen.not( { type: 'strictObject' } , function(){} ) ;
```

should validate 'regexp' accordingly, i.e. RegExp instance or string convertible to RegExp.

```js
doormen( { type: 'regexp' } , /Random/ ) ;
doormen( { type: 'regexp' } , new RegExp( "Random" ) ) ;
doormen( { type: 'regexp' } , "Random" ) ;
doormen.not( { type: 'regexp' } , "(Random" ) ;

doormen.not( { type: 'regexp' } , undefined ) ;
doormen.not( { type: 'regexp' } , null ) ;
doormen.not( { type: 'regexp' } , false ) ;
doormen.not( { type: 'regexp' } , true ) ;
doormen.not( { type: 'regexp' } , 0 ) ;
doormen.not( { type: 'regexp' } , 1 ) ;
doormen( { type: 'regexp' } , '' ) ;
doormen( { type: 'regexp' } , 'text' ) ;
doormen.not( { type: 'regexp' } , {} ) ;
doormen.not( { type: 'regexp' } , { a:1 , b:2 } ) ;
doormen.not( { type: 'regexp' } , [] ) ;
doormen.not( { type: 'regexp' } , [ 1,2,3 ] ) ;
doormen.not( { type: 'regexp' } , function(){} ) ;
```

should validate 'classId' accordingly, i.e. function (constructor) or non-empty string.

```js
doormen.not( { type: 'classId' } , undefined ) ;
doormen.not( { type: 'classId' } , null ) ;
doormen.not( { type: 'classId' } , false ) ;
doormen.not( { type: 'classId' } , true ) ;
doormen.not( { type: 'classId' } , 0 ) ;
doormen.not( { type: 'classId' } , 1 ) ;
doormen.not( { type: 'classId' } , '' ) ;
doormen( { type: 'classId' } , 'text' ) ;
doormen.not( { type: 'classId' } , {} ) ;
doormen.not( { type: 'classId' } , { a:1 , b:2 } ) ;
doormen.not( { type: 'classId' } , [] ) ;
doormen.not( { type: 'classId' } , [ 1,2,3 ] ) ;
doormen( { type: 'classId' } , function(){} ) ;
```

<a name="top-level-filters"></a>
# Top-level filters
'instanceOf' should validate object accordingly.

```js
if ( doormen.isBrowser ) { window[ 'MyClass' ] = function MyClass(){} ; }
else { global[ 'MyClass' ] = function MyClass(){} ; }

doormen( { instanceOf: Date } , new Date ) ;
doormen( { instanceOf: Array } , new Array ) ;	// jshint ignore:line
doormen( { instanceOf: MyClass } , new MyClass() ) ;
doormen( { instanceOf: Object } , new MyClass() ) ;

doormen( { instanceOf: 'MyClass' } , new MyClass() ) ;
doormen( { instanceOf: 'Object' } , new MyClass() ) ;

doormen.not( { instanceOf: Date } , new Array ) ;
doormen.not( { instanceOf: 'Date' } , new Array ) ;
```

min filter should validate accordingly, non-number should throw.

```js
doormen( { min: 3 } , 10 ) ;
doormen( { min: 3 } , 3 ) ;
doormen.not( { min: 3 } , 1 ) ;
doormen.not( { min: 3 } , 0 ) ;
doormen.not( { min: 3 } , -10 ) ;
doormen( { min: 3 } , Infinity ) ;
doormen( { min: Infinity } , Infinity ) ;
doormen.not( { min: 3 } , -Infinity ) ;
doormen.not( { min: 3 } , NaN ) ;
doormen.not( { min: 3 } , true ) ;
doormen.not( { min: 3 } , false ) ;
doormen.not( { min: 3 } , undefined ) ;
doormen.not( { min: 0 } , undefined ) ;
doormen.not( { min: -3 } , undefined ) ;
doormen.not( { min: 3 } , '10' ) ;
```

max filter should validate accordingly, non-number should throw.

```js
doormen.not( { max: 3 } , 10 ) ;
doormen( { max: 3 } , 3 ) ;
doormen( { max: 3 } , 1 ) ;
doormen( { max: 3 } , 0 ) ;
doormen( { max: 3 } , -10 ) ;
doormen.not( { max: 3 } , Infinity ) ;
doormen( { max: 3 } , -Infinity ) ;
doormen( { max: -Infinity } , -Infinity ) ;
doormen.not( { max: 3 } , NaN ) ;
doormen.not( { max: 3 } , true ) ;
doormen.not( { max: 3 } , false ) ;
doormen.not( { max: 3 } , '1' ) ;
```

min + max filter should validate accordingly, non-number should throw.

```js
doormen.not( { min: 3, max: 10 } , 15 ) ;
doormen( { min: 3, max: 10 } , 10 ) ;
doormen( { min: 3, max: 10 } , 5 ) ;
doormen( { min: 3, max: 10 } , 3 ) ;
doormen.not( { min: 3, max: 10 } , 1 ) ;
doormen.not( { min: 3, max: 10 } , 0 ) ;
doormen.not( { min: 3, max: 10 } , -10 ) ;
doormen.not( { min: 3, max: 10 } , Infinity ) ;
doormen.not( { min: 3, max: 10 } , -Infinity ) ;
doormen.not( { min: 3, max: 10 } , NaN ) ;
doormen.not( { min: 3, max: 10 } , true ) ;
doormen.not( { min: 3, max: 10 } , false ) ;
doormen.not( { min: 3, max: 10 } , '6' ) ;
```

'length' filter should validate accordingly, data that do not have a length should throw.

```js
doormen( { length: 3 } , "abc" ) ;
doormen.not( { length: 3 } , "abcde" ) ;
doormen.not( { length: 3 } , "ab" ) ;
doormen.not( { length: 3 } , "" ) ;

doormen.not( { length: 3 } , 1 ) ;
doormen.not( { length: 0 } , 1 ) ;
doormen.not( { length: 3 } , NaN ) ;
doormen.not( { length: 3 } , true ) ;
doormen.not( { length: 3 } , false ) ;
```

minLength filter should validate accordingly, data that do not have a length should throw.

```js
doormen( { minLength: 3 } , "abc" ) ;
doormen( { minLength: 3 } , "abcde" ) ;
doormen.not( { minLength: 3 } , "ab" ) ;
doormen.not( { minLength: 3 } , "" ) ;

doormen.not( { minLength: 3 } , 1 ) ;
doormen.not( { minLength: 0 } , 1 ) ;
doormen.not( { minLength: 3 } , NaN ) ;
doormen.not( { minLength: 3 } , true ) ;
doormen.not( { minLength: 3 } , false ) ;
```

maxLength filter should validate accordingly, data that do not have a length should throw.

```js
doormen( { maxLength: 3 } , "abc" ) ;
doormen.not( { maxLength: 3 } , "abcde" ) ;
doormen( { maxLength: 3 } , "ab" ) ;
doormen( { maxLength: 3 } , "" ) ;

doormen.not( { maxLength: 3 } , 1 ) ;
doormen.not( { maxLength: 0 } , 1 ) ;
doormen.not( { maxLength: 3 } , NaN ) ;
doormen.not( { maxLength: 3 } , true ) ;
doormen.not( { maxLength: 3 } , false ) ;
```

minLength + maxLength filter should validate accordingly, data that do not have a length should throw.

```js
doormen( { minLength: 3 , maxLength: 5 } , "abc" ) ;
doormen( { minLength: 3 , maxLength: 5 } , "abcd" ) ;
doormen( { minLength: 3 , maxLength: 5 } , "abcde" ) ;
doormen.not( { minLength: 3 , maxLength: 5 } , "abcdef" ) ;
doormen.not( { minLength: 3 , maxLength: 5 } , "ab" ) ;
doormen.not( { minLength: 3 , maxLength: 5 } , "" ) ;

doormen.not( { minLength: 3 , maxLength: 5 } , 1 ) ;
doormen.not( { maxLength: 0 } , 1 ) ;
doormen.not( { minLength: 3 , maxLength: 5 } , NaN ) ;
doormen.not( { minLength: 3 , maxLength: 5 } , true ) ;
doormen.not( { minLength: 3 , maxLength: 5 } , false ) ;
```

'match' filter should validate accordingly using a RegExp.

```js
doormen( { match: "^[a-f]*$" } , "" ) ;
doormen.not( { match: "^[a-f]+$" } , "" ) ;
doormen( { match: "^[a-f]*$" } , "abc" ) ;
doormen( { match: "^[a-f]*$" } , "abcdef" ) ;
doormen.not( { match: "^[a-f]*$" } , "ghi" ) ;
doormen.not( { match: /^[a-f]*$/ } , "ghi" ) ;

doormen.not( { match: "^[a-f]*$" } , 1 ) ;
doormen.not( { match: "^[a-f]*$" } , NaN ) ;
doormen.not( { match: "^[a-f]*$" } , true ) ;
doormen.not( { match: "^[a-f]*$" } , false ) ;
```

'in' filter should validate if the value is listed.

```js
doormen.not( { in: [ 1,5,7 ] } , 10 ) ;
doormen( { in: [ 1,5,7 ] } , 5 ) ;
doormen( { in: [ 1,5,7 ] } , 1 ) ;
doormen.not( { in: [ 1,5,7 ] } , 0 ) ;
doormen.not( { in: [ 1,5,7 ] } , -10 ) ;
doormen.not( { in: [ 1,5,7 ] } , Infinity ) ;
doormen( { in: [ 1,5,Infinity,7 ] } , Infinity ) ;
doormen.not( { in: [ 1,5,7 ] } , -Infinity ) ;
doormen.not( { in: [ 1,5,7 ] } , NaN ) ;
doormen( { in: [ 1,5,NaN,7 ] } , NaN ) ;

doormen( { in: [ 1,true,5,7 ] } , true ) ;
doormen.not( { in: [ 1,5,7 ] } , true ) ;
doormen( { in: [ 1,false,5,7 ] } , false ) ;
doormen.not( { in: [ 1,5,7 ] } , false ) ;

doormen.not( { in: [ 1,5,7 ] } , "text" ) ;
doormen( { in: [ 1,"text",5,7 ] } , "text" ) ;
doormen( { in: [ "string", "text", "bob" ] } , "text" ) ;
doormen.not( { in: [ "string", "text", "bob" ] } , "bobby" ) ;
doormen( { in: [ "string", "text", "" ] } , "" ) ;
doormen.not( { in: [ "string", "text", "bob" ] } , "" ) ;
```

'notIn' filter should validate if the value is listed.

```js
doormen( { notIn: [ 1,5,7 ] } , 10 ) ;
doormen.not( { notIn: [ 1,5,7 ] } , 5 ) ;
doormen.not( { notIn: [ 1,5,7 ] } , 1 ) ;
doormen( { notIn: [ 1,5,7 ] } , 0 ) ;
doormen( { notIn: [ 1,5,7 ] } , -10 ) ;
doormen( { notIn: [ 1,5,7 ] } , Infinity ) ;
doormen.not( { notIn: [ 1,5,Infinity,7 ] } , Infinity ) ;
doormen( { notIn: [ 1,5,7 ] } , -Infinity ) ;
doormen( { notIn: [ 1,5,7 ] } , NaN ) ;
doormen.not( { notIn: [ 1,5,NaN,7 ] } , NaN ) ;

doormen.not( { notIn: [ 1,true,5,7 ] } , true ) ;
doormen( { notIn: [ 1,5,7 ] } , true ) ;
doormen.not( { notIn: [ 1,false,5,7 ] } , false ) ;
doormen( { notIn: [ 1,5,7 ] } , false ) ;

doormen( { notIn: [ 1,5,7 ] } , "text" ) ;
doormen.not( { notIn: [ 1,"text",5,7 ] } , "text" ) ;
doormen.not( { notIn: [ "string", "text", "bob" ] } , "text" ) ;
doormen( { notIn: [ "string", "text", "bob" ] } , "bobby" ) ;
doormen.not( { notIn: [ "string", "text", "" ] } , "" ) ;
doormen( { notIn: [ "string", "text", "bob" ] } , "" ) ;
```

'in' filter containing object and arrays.

```js
doormen( { in: [ 1 , { a: 2 } , 5 , 7 ] } , { a: 2 } ) ;
doormen.not( { in: [ 1 , { a: 2 } , 5 , 7 ] } , { a: 2 , b: 5 } ) ;
doormen.not( { in: [ 1 , { a: 2 } , { b: 5 } , 7 ] } , { a: 2 , b: 5 } ) ;
doormen( { in: [ 1 , { a: 2 } , { a: 2 , b: 5 } , { b: 5 } , 7 ] } , { a: 2 , b: 5 } ) ;
doormen( { in: [ 1 , [ 'a', 2 ] , 5 , 7 ] } , [ 'a' , 2 ] ) ;
doormen.not( { in: [ 1 , [ 'a', 2 , 3 ] , 5 , 7 ] } , [ 'a' , 2 ] ) ;
```

<a name="filters"></a>
# Filters
'greaterThan' and aliases ('gt' and '>') filter should validate accordingly, non-number should throw.

```js
doormen( { filter: { greaterThan: 3 } } , 10 ) ;
doormen( { filter: { greaterThan: 3 } } , 3.00001 ) ;
doormen.not( { filter: { greaterThan: 3 } } , 3 ) ;
doormen.not( { filter: { greaterThan: 3 } } , 1 ) ;
doormen.not( { filter: { greaterThan: 3 } } , 0 ) ;
doormen.not( { filter: { greaterThan: 3 } } , -10 ) ;
doormen( { filter: { greaterThan: 3 } } , Infinity ) ;
doormen.not( { filter: { greaterThan: Infinity } } , Infinity ) ;
doormen.not( { filter: { greaterThan: 3 } } , -Infinity ) ;
doormen.not( { filter: { greaterThan: 3 } } , NaN ) ;
doormen.not( { filter: { greaterThan: 3 } } , true ) ;
doormen.not( { filter: { greaterThan: 3 } } , false ) ;
doormen.not( { filter: { greaterThan: 3 } } , undefined ) ;
doormen.not( { filter: { greaterThan: 0 } } , undefined ) ;
doormen.not( { filter: { greaterThan: -3 } } , undefined ) ;
doormen.not( { filter: { greaterThan: 3 } } , '10' ) ;

doormen( { filter: { gt: 3 } } , 3.00001) ;
doormen.not( { filter: { gt: 3 } } , 3 ) ;
doormen( { filter: { '>': 3 } } , 3.00001 ) ;
doormen.not( { filter: { '>': 3 } } , 3 ) ;
```

'lesserThan' and aliases ('lt' and '<') filter should validate accordingly, non-number should throw.

```js
doormen.not( { filter: { lesserThan: 3 } } , 10 ) ;
doormen( { filter: { lesserThan: 3 } } , 2.999 ) ;
doormen.not( { filter: { lesserThan: 3 } } , 3 ) ;
doormen( { filter: { lesserThan: 3 } } , 1 ) ;
doormen( { filter: { lesserThan: 3 } } , 0 ) ;
doormen( { filter: { lesserThan: 3 } } , -10 ) ;
doormen.not( { filter: { lesserThan: 3 } } , Infinity ) ;
doormen( { filter: { lesserThan: 3 } } , -Infinity ) ;
doormen.not( { filter: { lesserThan: -Infinity } } , -Infinity ) ;
doormen.not( { filter: { lesserThan: 3 } } , NaN ) ;
doormen.not( { filter: { lesserThan: 3 } } , true ) ;
doormen.not( { filter: { lesserThan: 3 } } , false ) ;
doormen.not( { filter: { lesserThan: 3 } } , '1' ) ;

doormen( { filter: { lt: 3 } } , 2.999 ) ;
doormen.not( { filter: { lt: 3 } } , 3 ) ;
doormen( { filter: { '<': 3 } } , 2.999 ) ;
doormen.not( { filter: { '<': 3 } } , 3 ) ;
```

<a name="children-and-recursivity"></a>
# Children and recursivity
'of' should perform the check recursively for each children, using the same given schema for all of them..

```js
var schema ;

schema = {
	of: { type: 'string' }
} ;

// Object
doormen( schema , { b: 'text' } ) ;
doormen.not( schema , { a: 1 } ) ;
doormen.not( schema , { a: 1, b: 'text' } ) ;
doormen.not( schema , { a: 'text', b: 3 } ) ;
doormen( schema , { a: 'text', b: 'string' } ) ;
doormen.not( schema , { A: 'TEXT', b: 'text' , c: undefined } ) ;

// Array
doormen( schema , [ 'text' ] ) ;
doormen( schema , [] ) ;
doormen( schema , [ 'text' , 'string' ] ) ;
doormen.not( schema , [ 'text' , 'string' , null ] ) ;
doormen.not( schema , [ 1 , 'text' , 'string' ] ) ;
doormen.not( schema , [ 'text' , 'string' , null ] ) ;
doormen.not( schema , [ true ] ) ;
```

when 'properties' is an array, it should check if the value has all listed properties, no extra properties are allowed.

```js
var schema = {
	properties: [ 'a' , 'b' ]
} ;

doormen( schema , { a: 1, b: 'text' } ) ;
doormen( schema , { a: 'text', b: 3 } ) ;
doormen.not( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
doormen.not( schema , { b: 'text' } ) ;
doormen.not( schema , { a: 1 } ) ;
```

when 'properties' is an array and 'extraProperties' is set, it should allow non-listed extra-properties.

```js
var schema = {
	properties: [ 'a' , 'b' ],
	extraProperties: true
} ;

doormen( schema , { a: 1, b: 'text' } ) ;
doormen( schema , { a: 'text', b: 3 } ) ;
doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
doormen.not( schema , { b: 'text' } ) ;
doormen.not( schema , { a: 1 } ) ;
```

when 'properties' is an object, it should perform the check recursively for each listed child, no extra properties are allowed.

```js
var schema = {
	properties: {
		a: { type: 'number' },
		b: { type: 'string' }
	}
} ;

doormen( schema , { a: 1, b: 'text' } ) ;
doormen.not( schema , { a: 'text', b: 3 } ) ;
doormen.not( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
doormen.not( schema , { b: 'text' } ) ;
doormen.not( schema , { a: 1 } ) ;
```

when 'properties' is an object and 'extraProperties' is set, it should allow extra-properties.

```js
var schema = {
	properties: {
		a: { type: 'number' },
		b: { type: 'string' }
	},
	extraProperties: true
} ;

doormen( schema , { a: 1, b: 'text' } ) ;
doormen.not( schema , { a: 'text', b: 3 } ) ;
doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) ;
doormen.not( schema , { b: 'text' } ) ;
doormen.not( schema , { a: 1 } ) ;
```

'elements' should perform the check recursively for each children elements, using a specific schema for each one, extra-element are not allowed.

```js
var schema = {
	elements: [
		{ type: 'string' },
		{ type: 'number' },
		{ type: 'boolean' }
	]
} ;

doormen( schema , [ 'text' , 3 , false ] ) ;
doormen.not( schema , [ 'text' , 3 , false , 'extra' , true ] ) ;
doormen.not( schema , [] ) ;
doormen.not( schema , [ 'text' , 3 ] ) ;
doormen.not( schema , [ true ] ) ;
```

when 'elements' is used in conjunction with 'extraElements', extra-elements are allowed.

```js
var schema = {
	elements: [
		{ type: 'string' },
		{ type: 'number' },
		{ type: 'boolean' }
	],
	extraElements: true
} ;

doormen( schema , [ 'text' , 3 , false ] ) ;
doormen( schema , [ 'text' , 3 , false , 'extra' , true ] ) ;
doormen.not( schema , [] ) ;
doormen.not( schema , [ 'text' , 3 ] ) ;
doormen.not( schema , [ true ] ) ;
```

<a name="properties-having-when"></a>
# Properties having 'when'
when 'properties' is an object and one child's schema contains a 'when' properties, it should be deleted if the 'verify' condition is met for the 'sibling'.

```js
var schema = {
	properties: {
		a: {
			type: 'number'
		},
		b: {
			type: 'string' ,
			when: {
				sibling: 'a',
				verify: { in: [ 1 ] },
				set: undefined
			}
		}
	}
} ;

doormen.equals(
	doormen( schema , { a: 0, b: 'text' } ) ,
	{ a: 0, b: 'text' }
) ;

doormen.equals(
	doormen( schema , { a: 1, b: 'text' } ) ,
	{ a: 1 }
) ;

doormen.not( schema , { a: 0 } ) ;

doormen.equals(
	doormen( schema , { a: 1 } ) ,
	{ a: 1 }
) ;


var schema = {
	properties: {
		b: {
			type: 'string' ,
			when: {
				sibling: 'a',
				verify: { in: [ 1 ] },
				set: undefined
			}
		},
		a: {
			type: 'number'
		}
	}
} ;

doormen.equals(
	doormen( schema , { a: 0, b: 'text' } ) ,
	{ a: 0, b: 'text' }
) ;

doormen.equals(
	doormen( schema , { a: 1, b: 'text' } ) ,
	{ a: 1 }
) ;

doormen.not( schema , { a: 0 } ) ;

doormen.equals(
	doormen( schema , { a: 1 } ) ,
	{ a: 1 }
) ;
```

complex dependencies tests.

```js
var schema = {
	properties: {
		c: {
			type: 'string' ,
			when: {
				sibling: 'b',
				verify: { in: [ undefined , 'text' ] },
				set: undefined
			}
		},
		b: {
			type: 'string' ,
			when: {
				sibling: 'a',
				verify: { in: [ 1 ] },
				set: undefined
			}
		},
		a: {
			type: 'number'
		}
	}
} ;

doormen.equals(
	doormen( schema , { a: 0, b: 'text', c: 'toto' } ) ,
	{ a: 0, b: 'text' }
) ;

doormen.equals(
	doormen( schema , { a: 0, b: 'text' } ) ,
	{ a: 0, b: 'text' }
) ;

doormen.equals(
	doormen( schema , { a: 1, b: 'text' } ) ,
	{ a: 1 }
) ;

doormen.equals(
	doormen( schema , { a: 1, b: undefined } ) ,
	{ a: 1 }
) ;

doormen.not( schema , { a: 0, b: undefined } ) ;
doormen.not( schema , { a: 0 } ) ;

doormen.equals(
	doormen( schema , { a: 1 } ) ,
	{ a: 1 }
) ;
```

when circular 'when' properties exists, it should throw.

```js
var schema = {
	properties: {
		a: {
			type: 'number',
			when: {
				sibling: 'b',
				verify: { in: [ 'text' ] },
				set: undefined
			}
		},
		b: {
			type: 'string' ,
			when: {
				sibling: 'a',
				verify: { in: [ 1 ] },
				set: undefined
			}
		}
	}
} ;

// Circular 'when' throw
doormen.not( schema , { a: 0, b: 'text' } ) ;

var schema = {
	properties: {
		a: {
			type: 'number',
			when: {
				sibling: 'a',
				verify: { in: [ 1 ] },
				set: undefined
			}
		}
	}
} ;

// Circular 'when' throw
doormen.not( schema , { a: 0, b: 'text' } ) ;
```

<a name="mask"></a>
# Mask
Should mask data using a tier-level.

```js
var schema = {
	properties: {
		a: {
			type: 'number' ,
			tier: 1
		} ,
		b: {
			type: 'boolean' ,
			tier: 3
		} ,
		c: {
			type: 'string' ,
			tier: 2
		}
	}
} ;

var data = {
	a: 1 ,
	b: true ,
	c: 'blah!'
} ;

doormen.equals(
	doormen.mask( schema , data , { tier: 0 } ) ,
	{} 
) ;
doormen.equals(
	doormen.mask( schema , data , { tier: 1 } ) ,
	{ a: 1 } 
) ;
doormen.equals(
	doormen.mask( schema , data , { tier: 2 } ) ,
	{ a: 1 , c: 'blah!' } 
) ;
doormen.equals(
	doormen.mask( schema , data , { tier: 3 } ) ,
	{ a: 1 , b: true , c: 'blah!' } 
) ;
doormen.equals(
	doormen.mask( schema , data , { tier: 4 } ) ,
	{ a: 1 , b: true , c: 'blah!' } 
) ;
```

Should mask nested data using a tier-level.

```js
var schema = {
	properties: {
		a: {
			type: 'number' ,
			tier: 1
		} ,
		b: {
			type: 'boolean' ,
			tier: 3
		} ,
		c: {
			type: 'string' ,
			tier: 2
		} ,
		d: {
			type: 'strictObject' ,
			properties: {
				e: {
					type: 'number' ,
					tier: 1
				} ,
				f: {
					type: 'boolean' ,
					tier: 3
				} ,
				g: {
					type: 'string' ,
					tier: 2
				}
			}
		} ,
		d2: {
			type: 'strictObject' ,
			tier: 2 ,
			properties: {
				e: {
					type: 'number' ,
					tier: 1
				} ,
				f: {
					type: 'boolean' ,
					tier: 3
				} ,
				g: {
					type: 'string' ,
					tier: 2
				}
			}
		}
	}
} ;

var data = {
	a: 1 ,
	b: true ,
	c: 'blah!' ,
	d: {
		e: 7 ,
		f: false ,
		g: 'bob'
	} ,
	d2: {
		e: 7 ,
		f: false ,
		g: 'bob'
	}
} ;

doormen.equals(
	doormen.mask( schema , data , { tier: 1 } ) ,
	{ a: 1 , d: { e: 7 } } 
) ;
doormen.equals(
	doormen.mask( schema , data , { tier: 2 } ) ,
	{ a: 1 , c: 'blah!' , d: { e: 7 , g: 'bob' } , d2: { e: 7 , f: false , g: 'bob' } } 
) ;
doormen.equals(
	doormen.mask( schema , data , { tier: 3 } ) ,
	{ a: 1 , b: true , c: 'blah!' , d: { e: 7 , f: false , g: 'bob' } , d2: { e: 7 , f: false , g: 'bob' } } 
) ;
```

Should mask data using tags.

```js
var schema = {
	properties: {
		_id: { tags: [] } ,
		slug: { tags: [ 'internal' , 'meta' ] } ,
		access: { tags: [ 'internal' ] } ,
		title: { tags: [ 'meta' ] } ,
		post: { tags: [ 'content' ] }
	}
} ;

var data = {
	_id: '1978f09ac3e' ,
	slug: 'ten-things-about-nothing' ,
	access: 'public' ,
	title: '10 things you should know about nothing' ,
	post: 'blah blah blah blah'
} ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'meta' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		title: '10 things you should know about nothing'
	}
) ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'internal' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		access: 'public'
	}
) ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'internal' , 'content' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		access: 'public' ,
		post: 'blah blah blah blah'
	}
) ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'internal' , 'meta' , 'content' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		access: 'public' ,
		title: '10 things you should know about nothing' ,
		post: 'blah blah blah blah'
	}
) ;
```

Should mask nested data using tags.

```js
var schema = {
	properties: {
		_id: {} ,
		slug: { tags: [ 'internal' , 'meta' ] } ,
		accesses: {
			of: {
				properties: {
					userId: {} ,
					accessLevel: { tags: [ 'internal' ] }
				}
			}
		} ,
		title: { tags: [ 'meta' ] } ,
		post: { tags: [ 'content' ] }
	}
} ;

var data = {
	_id: '1978f09ac3e' ,
	slug: 'ten-things-about-nothing' ,
	accesses: [
		{
			userId: 'bob' ,
			accessLevel: 2
		} ,
		{
			userId: 'bill' ,
			accessLevel: 3
		}
	] ,
	title: '10 things you should know about nothing' ,
	post: 'blah blah blah blah'
} ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'meta' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		accesses: [ { userId: 'bob' }, { userId: 'bill' } ],
		title: '10 things you should know about nothing'
	}
) ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'internal' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		accesses: [
			{ userId: 'bob', accessLevel: 2 },
			{ userId: 'bill', accessLevel: 3 }
		]
	}
) ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'internal' , 'content' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		accesses: [
			{ userId: 'bob', accessLevel: 2 },
			{ userId: 'bill', accessLevel: 3 }
		] ,
		post: 'blah blah blah blah'
	}
) ;

doormen.equals(
	doormen.mask( schema , data , { tags: [ 'internal' , 'meta' , 'content' ] } ) ,
	{
		_id: '1978f09ac3e' ,
		slug: 'ten-things-about-nothing' ,
		accesses: [
			{ userId: 'bob', accessLevel: 2 },
			{ userId: 'bill', accessLevel: 3 }
		] ,
		title: '10 things you should know about nothing' ,
		post: 'blah blah blah blah'
	}
) ;
```

<a name="numbers-meta-types"></a>
# Numbers meta types
should validate real accordingly.

```js
doormen( { type: 'real' } , 0 ) ;
doormen( { type: 'real' } , 1 ) ;
doormen( { type: 'real' } , -1 ) ;
doormen( { type: 'real' } , 0.3 ) ;
doormen( { type: 'real' } , 18.36 ) ;
doormen.not( { type: 'real' } , 1/0 ) ;
doormen.not( { type: 'real' } , -1/0 ) ;
doormen.not( { type: 'real' } , Infinity ) ;
doormen.not( { type: 'real' } , -Infinity ) ;
doormen.not( { type: 'real' } , NaN ) ;

doormen.not( { type: 'real' } , undefined ) ;
doormen.not( { type: 'real' } , null ) ;
doormen.not( { type: 'real' } , false ) ;
doormen.not( { type: 'real' } , true ) ;
doormen.not( { type: 'real' } , '' ) ;
doormen.not( { type: 'real' } , 'text' ) ;
doormen.not( { type: 'real' } , {} ) ;
doormen.not( { type: 'real' } , [] ) ;
```

should validate integer accordingly.

```js
doormen( { type: 'integer' } , 0 ) ;
doormen( { type: 'integer' } , 1 ) ;
doormen( { type: 'integer' } , 123456789 ) ;
doormen( { type: 'integer' } , -1 ) ;
doormen.not( { type: 'integer' } , 0.00001 ) ;
doormen.not( { type: 'integer' } , -0.00001 ) ;
doormen.not( { type: 'integer' } , 123456.00001 ) ;
doormen.not( { type: 'integer' } , 123456.99999 ) ;
doormen.not( { type: 'integer' } , 0.3 ) ;
doormen.not( { type: 'integer' } , 18.36 ) ;
doormen.not( { type: 'integer' } , 1/0 ) ;
doormen.not( { type: 'integer' } , Infinity ) ;
doormen.not( { type: 'integer' } , -Infinity ) ;
doormen.not( { type: 'integer' } , NaN ) ;

doormen.not( { type: 'integer' } , undefined ) ;
doormen.not( { type: 'integer' } , null ) ;
doormen.not( { type: 'integer' } , false ) ;
doormen.not( { type: 'integer' } , true ) ;
doormen.not( { type: 'integer' } , '' ) ;
doormen.not( { type: 'integer' } , 'text' ) ;
doormen.not( { type: 'integer' } , {} ) ;
doormen.not( { type: 'integer' } , [] ) ;
```

<a name="strings-meta-types"></a>
# Strings meta types
should validate hex accordingly.

```js
doormen( { type: 'hex' } , '1234' ) ;
doormen( { type: 'hex' } , '12af34' ) ;
doormen( { type: 'hex' } , '12AF34' ) ;
doormen.not( { type: 'hex' } , '12g34' ) ;
```

should validate ipv4 accordingly.

```js
doormen( { type: 'ipv4' } , '127.0.0.1' ) ;
doormen( { type: 'ipv4' } , '127.000.00.001' ) ;
doormen.not( { type: 'ipv4' } , '127.0000.00.001' ) ;
doormen.not( { type: 'ipv4' } , '0127.000.00.001' ) ;
doormen.not( { type: 'ipv4' } , '127.0.0.0001' ) ;
doormen.not( { type: 'ipv4' } , '127.0.0.' ) ;
doormen.not( { type: 'ipv4' } , '127.0.0.256' ) ;
doormen.not( { type: 'ipv4' } , '127.0.0.1.' ) ;
doormen.not( { type: 'ipv4' } , '.127.0.0.1' ) ;
doormen.not( { type: 'ipv4' } , '.127.0.0.' ) ;
```

should validate ipv6 accordingly.

```js
doormen( { type: 'ipv6' } , '2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
doormen.not( { type: 'ipv6' } , ':2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
doormen.not( { type: 'ipv6' } , 'abcd:2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
doormen.not( { type: 'ipv6' } , '2001:0db8:0000:0000:0000:ff00:0042:8329:' ) ;
doormen.not( { type: 'ipv6' } , '2001:0000:0000:0000:ff00:0042:8329:' ) ;
doormen.not( { type: 'ipv6' } , ':2001:0000:0000:0000:ff00:0042:8329' ) ;
doormen( { type: 'ipv6' } , '2001:db8:0:0:0:ff00:0042:8329' ) ;
doormen( { type: 'ipv6' } , '2001:db8::ff00:0042:8329' ) ;
doormen.not( { type: 'ipv6' } , '2001:db8:::0042:8329' ) ;
doormen.not( { type: 'ipv6' } , '2001:db8::ff00::0042:8329' ) ;
doormen.not( { type: 'ipv6' } , '2001::ff00::0042:8329' ) ;
doormen( { type: 'ipv6' } , '::1' ) ;
doormen( { type: 'ipv6' } , '1::' ) ;
```

should validate ip accordingly.

```js
doormen( { type: 'ip' } , '127.0.0.1' ) ;
doormen( { type: 'ip' } , '127.000.00.001' ) ;
doormen.not( { type: 'ip' } , '127.0000.00.001' ) ;
doormen.not( { type: 'ip' } , '0127.000.00.001' ) ;
doormen.not( { type: 'ip' } , '127.0.0.0001' ) ;
doormen.not( { type: 'ip' } , '127.0.0.' ) ;
doormen.not( { type: 'ip' } , '127.0.0.256' ) ;
doormen.not( { type: 'ip' } , '127.0.0.1.' ) ;
doormen.not( { type: 'ip' } , '.127.0.0.1' ) ;
doormen.not( { type: 'ip' } , '.127.0.0.' ) ;

doormen( { type: 'ip' } , '2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
doormen.not( { type: 'ip' } , ':2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
doormen.not( { type: 'ip' } , 'abcd:2001:0db8:0000:0000:0000:ff00:0042:8329' ) ;
doormen.not( { type: 'ip' } , '2001:0db8:0000:0000:0000:ff00:0042:8329:' ) ;
doormen.not( { type: 'ip' } , '2001:0000:0000:0000:ff00:0042:8329:' ) ;
doormen.not( { type: 'ip' } , ':2001:0000:0000:0000:ff00:0042:8329' ) ;
doormen( { type: 'ip' } , '2001:db8:0:0:0:ff00:0042:8329' ) ;
doormen( { type: 'ip' } , '2001:db8::ff00:0042:8329' ) ;
doormen.not( { type: 'ip' } , '2001:db8:::0042:8329' ) ;
doormen.not( { type: 'ip' } , '2001:db8::ff00::0042:8329' ) ;
doormen.not( { type: 'ip' } , '2001::ff00::0042:8329' ) ;
doormen( { type: 'ip' } , '::1' ) ;
doormen( { type: 'ip' } , '1::' ) ;
```

should validate url accordingly.

```js
doormen( { type: 'url' } , 'http://google.com' ) ;
doormen( { type: 'url' } , 'http://google.com/' ) ;
doormen( { type: 'url' } , 'https://stackoverflow.com/questions/1303872/url-validation-using-javascript' ) ;
doormen( { type: 'url' } , 'http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2' ) ;
doormen( { type: 'url' } , 'https://uk.reuters.com/article/2013/02/25/rosneft-tender-idUKL6N0BPJZC20130225' ) ;
doormen( { type: 'url' } , 'http://grooveshark.com/#!/massive_attack' ) ;
doormen( { type: 'url' } , 'http://::1/#!/massive_attack' ) ;
doormen( { type: 'url' } , 'http://127.0.0.1/' ) ;
doormen( { type: 'url' } , 'http://localhost/' ) ;
doormen( { type: 'url' } , 'http://localhost:8080/' ) ;
doormen( { type: 'url' } , 'http://bob@localhost/' ) ;
doormen( { type: 'url' } , 'http://bob:pw@localhost/' ) ;
doormen.not( { type: 'url' } , 'http://127.0.0.1/spaces not allowed' ) ;
doormen.not( { type: 'url' } , 'http://127.0.0/' ) ;
doormen.not( { type: 'url' } , 'http://192.168.0.256/' ) ;
doormen.not( { type: 'url' } , 'http://19.16.33.25.6/' ) ;
doormen( { type: 'url' } , 'file:///home/toto/TODO.txt' ) ;
doormen.not( { type: 'url' } , 'http:///google.com/' ) ;
doormen.not( { type: 'url' } , 'google.com' ) ;
```

should validate web url accordingly.

```js
doormen( { type: 'weburl' } , 'http://google.com' ) ;
doormen( { type: 'weburl' } , 'https://stackoverflow.com/questions/1303872/url-validation-using-javascript' ) ;
doormen( { type: 'weburl' } , 'http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2' ) ;
doormen( { type: 'weburl' } , 'https://uk.reuters.com/article/2013/02/25/rosneft-tender-idUKL6N0BPJZC20130225' ) ;
doormen( { type: 'weburl' } , 'http://grooveshark.com/#!/massive_attack' ) ;
doormen( { type: 'weburl' } , 'http://127.0.0.1/#!/massive_attack' ) ;
doormen( { type: 'weburl' } , 'http://::1/#!/massive_attack' ) ;
doormen( { type: 'weburl' } , 'http://127.0.0.1/' ) ;
doormen.not( { type: 'weburl' } , 'http://127.0.0.1/spaces not allowed' ) ;
doormen.not( { type: 'weburl' } , 'http://127.0.0/' ) ;
doormen.not( { type: 'weburl' } , 'http://192.168.0.256/' ) ;
doormen.not( { type: 'weburl' } , 'http://19.16.33.25.6/' ) ;
doormen.not( { type: 'weburl' } , 'file:///home/toto/TODO.txt' ) ;
doormen.not( { type: 'weburl' } , 'google.com' ) ;
```

should validate email accordingly.

```js
doormen( { type: 'email' } , 'bob@gmail.com' ) ;
doormen( { type: 'email' } , 'cedric.ronvel@gmail.com' ) ;
doormen( { type: 'email' } , 'cédric.ronvel@gmail.com' ) ;
doormen( { type: 'email' } , 'Cédric.Ronvel@gmail.com' ) ;
doormen( { type: 'email' } , 'söm3-2än.dOm+çH4r@g33-mail.ninja' ) ;
doormen.not( { type: 'email' } , 'bobgmail.com' ) ;
doormen.not( { type: 'email' } , 'bob.@gmail.com' ) ;
doormen.not( { type: 'email' } , '.bob@gmail.com' ) ;
doormen.not( { type: 'email' } , 'bob..bob@gmail.com' ) ;
doormen( { type: 'email' } , 'bob.a.bob@gmail.com' ) ;
doormen.not( { type: 'email' } , 'bob @gmail.com' ) ;
doormen.not( { type: 'email' } , ' bob@gmail.com' ) ;
doormen.not( { type: 'email' } , 'b b@gmail.com' ) ;
```

<a name="sanitize"></a>
# Sanitize
should sanitize to 'toBoolean' accordingly.

```js
doormen.equals( doormen( { sanitize: 'toBoolean' } , 0 ) , false ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , '0' ) , false ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , 1 ) , true ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , '1' ) , true ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , 123 ) , true ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , "on" ) , true ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , "On" ) , true ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , "ON" ) , true ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , "off" ) , false ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , "Off" ) , false ) ;
doormen.equals( doormen( { sanitize: 'toBoolean' } , "OFF" ) , false ) ;

doormen.equals( doormen( { sanitize: 'toBoolean' } , '123' ) , true ) ;
```

should sanitize to 'toNumber' accordingly.

```js
doormen.equals( doormen( { sanitize: 'toNumber' } , 0 ) , 0 ) ;
doormen.equals( doormen( { sanitize: 'toNumber' } , '0' ) , 0 ) ;
doormen.equals( doormen( { sanitize: 'toNumber' } , 1 ) , 1 ) ;
doormen.equals( doormen( { sanitize: 'toNumber' } , '1' ) , 1 ) ;
doormen.equals( doormen( { sanitize: 'toNumber' } , 123 ) , 123 ) ;
doormen.equals( doormen( { sanitize: 'toNumber' } , '123' ) , 123 ) ;
doormen.equals( doormen( { sanitize: 'toNumber' } , 123.456 ) , 123.456 ) ;
doormen.equals( doormen( { sanitize: 'toNumber' } , '123.456' ) , 123.456 ) ;
```

should sanitize to 'toInteger' accordingly.

```js
doormen.equals( doormen( { sanitize: 'toInteger' } , 0 ) , 0 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , '0' ) , 0 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , 1 ) , 1 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , '1' ) , 1 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , 123 ) , 123 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , '123' ) , 123 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , 123.456 ) , 123 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , '123.456' ) , 123 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , 123.789 ) , 124 ) ;
doormen.equals( doormen( { sanitize: 'toInteger' } , '123.789' ) , 124 ) ;
```

should sanitize to 'toArray' accordingly.

```js
doormen.equals( doormen( { sanitize: 'toArray' } , [] ) , [] ) ;
doormen.equals( doormen( { sanitize: 'toArray' } , [ 1,2,3 ] ) , [ 1,2,3 ] ) ;
doormen.equals( doormen( { sanitize: 'toArray' } , { a: 'Ah!' , b: 'bee' } ) , [ { a: 'Ah!' , b: 'bee' } ] ) ;
doormen.equals( doormen( { sanitize: 'toArray' } , 0 ) , [ 0 ] ) ;
doormen.equals( doormen( { sanitize: 'toArray' } , 'a' ) , [ 'a' ] ) ;

var fn = function() { return doormen( { sanitize: 'toArray' } , arguments ) ; } ;
doormen.equals( fn() , [] ) ;
doormen.equals( fn( 1,2,3 ) , [ 1,2,3 ] ) ;
doormen.equals( fn( { yeepee: 'yaa' } , 'yeah' , true ) , [ { yeepee: 'yaa' } , 'yeah' , true ] ) ;
doormen.equals( Array.isArray( fn( 1,2,3 ) ) , true ) ;
doormen.equals( Array.isArray( arguments ) , false ) ;
```

should sanitize to 'toDate' accordingly.

```js
var date = new Date() ;
var timestamp = date.getTime() ;
var dateString = date.toString() ;
doormen.equals( doormen( { sanitize: 'toDate' } , date ) , date ) ;
doormen.equals( doormen( { sanitize: 'toDate' } , timestamp ) , date ) ;
doormen.equals( doormen( { sanitize: 'toDate' } , dateString ) , date ) ;

//console.log( doormen( { sanitize: 'toDate' } , 123456789 ) ) ;
//console.log( doormen( { sanitize: 'toDate' } , timestamp ) ) ;
//console.log( doormen( { sanitize: 'toDate' } , dateString ) ) ;
//console.log( doormen( { sanitize: 'toDate' } , 'bob' ) ) ;

doormen.equals( doormen( { sanitize: 'toDate' } , 'bob' ) , 'bob' ) ;
doormen.equals( doormen( { sanitize: 'toDate' } , [] ) , [] ) ;
doormen.equals( doormen( { sanitize: 'toDate' } , [ 1,2,3 ] ) , [ 1,2,3 ] ) ;
doormen.equals( doormen( { sanitize: 'toDate' } , { a: 'Ah!' , b: 'bee' } ) , { a: 'Ah!' , b: 'bee' } ) ;
```

should remove extra properties accordingly.

```js
var schema ;

schema = {
	sanitize: 'removeExtraProperties',
	properties: [ 'a' , 'b' ]
} ;

doormen( schema , { a: 1, b: 'text' } ) ;
doormen( schema , { a: 'text', b: 3 } ) ;
doormen.equals( doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;
doormen.equals( doormen( schema , { omg: 'noob!', A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;


schema = {
	sanitize: 'removeExtraProperties',
	properties: {
		a: { type: 'number' },
		b: { type: 'string' }
	}
} ;

doormen( schema , { a: 1, b: 'text' } ) ;
doormen.not( schema , { a: 'text', b: 3 } ) ;
doormen.equals( doormen( schema , { A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;
doormen.equals( doormen( schema , { omg: 'noob!', A: 'TEXT', a: 1, b: 'text' , c: 5 } ) , { a: 1, b: 'text' } ) ;
```

should trim a string accordingly.

```js
doormen.equals( doormen( { sanitize: 'trim' } , 'a' ) , 'a' ) ;
doormen.equals( doormen( { sanitize: 'trim' } , '  a' ) , 'a' ) ;
doormen.equals( doormen( { sanitize: 'trim' } , 'a   ' ) , 'a' ) ;
doormen.equals( doormen( { sanitize: 'trim' } , '  a   ' ) , 'a' ) ;
doormen.equals( doormen( { sanitize: 'trim' } , 'ab  cd' ) , 'ab  cd' ) ;
doormen.equals( doormen( { sanitize: 'trim' } , '   ab  cd' ) , 'ab  cd' ) ;
doormen.equals( doormen( { sanitize: 'trim' } , 'ab  cd   ' ) , 'ab  cd' ) ;
doormen.equals( doormen( { sanitize: 'trim' } , '   ab  cd  ' ) , 'ab  cd' ) ;
```

should sanitize to 'toUpperCase' accordingly.

```js
doormen.equals( doormen( { sanitize: 'toUpperCase' } , 'aBc dE f' ) , 'ABC DE F' ) ;
```

should sanitize to 'toLowerCase' accordingly.

```js
doormen.equals( doormen( { sanitize: 'toLowerCase' } , 'aBc dE f' ) , 'abc de f' ) ;
```

should sanitize to 'capitalize' accordingly.

```js
doormen.equals( doormen( { sanitize: 'capitalize' } , 'oneTWOthree' ) , 'Onetwothree' ) ;
```

should sanitize to 'dashToCamelCase' accordingly.

```js
doormen.equals( doormen( { sanitize: 'dashToCamelCase' } , 'to-upper-case' ) , 'toUpperCase' ) ;
doormen.equals( doormen( { sanitize: 'dashToCamelCase' } , 'toUpperCase' ) , 'toUpperCase' ) ;
```

should sanitize to 'latinize' accordingly.

```js
doormen.equals( doormen( { sanitize: 'latinize' } , 'éàèùâêîôûÂÊÎÔÛäëïöüÄËÏÖÜæÆŧøþßðđħł' ) , 'eaeuaeiouAEIOUaeiouAEIOUaeAEtothssdhdhl' ) ;
```

sanitize should work recursively as well.

```js
doormen.equals( doormen( { of: { sanitize: 'trim' } } , {} ) , {} ) ;
doormen.equals( doormen( { of: { sanitize: 'trim' } } , { a: ' toto  ' } ) , { a: 'toto' } ) ;
doormen.equals( doormen( { of: { sanitize: 'trim' } } , { a: ' toto  ' , b: 'text  ' } ) , { a: 'toto' , b: 'text' } ) ;
doormen.equals( doormen(
		{ of: { sanitize: 'trim' } } ,
		{ a: ' toto  ' , b: 'text  ' } ) ,
	{ a: 'toto' , b: 'text' }
) ;
doormen.equals( doormen(
		{ extraProperties: true, properties: { a: { sanitize: 'trim' } } } ,
		{ a: ' toto  ' , b: 'text  ' } ) ,
	{ a: 'toto' , b: 'text  ' }
) ;
doormen.equals( doormen(
		{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
		{ a: ' toto  ' , b: 'text  ' } ) ,
	{ a: 'toto' , b: 'text' }
) ;
```

<a name="sanitize--patch-reporting"></a>
# Sanitize + Patch reporting
sanitize should should report in the provided patch object.

```js
var schema , patch ;

patch = {} ;
doormen(
	{ patch: patch } ,
	{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
	{ a: ' toto  ' , b: 'text  ' }
) ;
doormen.equals( patch , { a: 'toto' , b: 'text' } ) ;

patch = {} ;
doormen(
	{ patch: patch } ,
	{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
	{ a: 'toto' , b: 'text  ' }
) ;
doormen.equals( patch , { b: 'text' } ) ;

patch = {} ;
doormen(
	{ patch: patch } ,
	{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ,
	{ a: 'toto' , b: 'text' }
) ;
doormen.equals( patch , {} ) ;

schema = {
	properties: {
		a: { sanitize: 'trim' } ,
		sub: {
			properties: {
				b: { sanitize: 'trim' } ,
				sub: {
					properties: {
						c: { sanitize: 'trim' }
					}
				}
			}
		}
	}
} ;

patch = {} ;
doormen(
	{ patch: patch } ,
	schema ,
	{ a: ' toto  ' , sub: { b: 'text  ' , sub: { c: ' weee! ' } } }
) ;
doormen.equals( patch , { "a": "toto" , "sub.b": "text" , "sub.sub.c": "weee!" } ) ;

patch = {} ;
doormen(
	{ patch: patch } ,
	schema ,
	{ a: 'toto' , sub: { b: 'text  ' , sub: { c: 'weee!' } } }
) ;
doormen.equals( patch , { "sub.b": "text" } ) ;

patch = {} ;
doormen(
	{ patch: patch } ,
	schema ,
	{ a: ' toto  ' , sub: { b: 'text' , sub: { c: ' weee! ' } } }
) ;
doormen.equals( patch , { "a": "toto" , "sub.sub.c": "weee!" } ) ;
```

<a name="full-report-mode"></a>
# Full report mode
should return an object with all containing weither it valid or not, the sanitized data, and an array of errors.

```js
var report , schema ;

schema = {
	of: { type: 'string' , sanitize: 'trim' }
} ;

report = doormen.report( schema , { a: 'abc', b: '  def  ' } ) ;
//console.log( report ) ;
doormen.equals( report.validate , true ) ;
doormen.equals( report.sanitized , { a: 'abc', b: 'def' } ) ;
doormen.equals( report.errors.length , 0 ) ;

report = doormen.report( schema , { a: true, b: 3 } ) ;
//console.log( report ) ;
doormen.equals( report.validate , false ) ;
doormen.equals( report.sanitized , { a: true, b: 3 } ) ;
doormen.equals( report.errors.length , 2 ) ;

schema = {
	properties: {
		a: { type: 'string' , sanitize: 'trim' } ,
		b: { type: 'string' , sanitize: 'trim' } ,
		c: { of: { type: 'string' , sanitize: 'trim' } }
	}
} ;

report = doormen.report( schema , { a: '  abc  ', b: 3 , c: { d: true , e: 'def  ' } } ) ;
//console.log( report ) ;
doormen.equals( report.validate , false ) ;
doormen.equals( report.sanitized , { a: 'abc', b: 3 , c: { d: true , e: 'def' } } ) ;
doormen.equals( report.errors.length , 2 ) ;
```

<a name="patch-validation"></a>
# Patch validation
should validate a patch.

```js
var schema ;

schema = {
	type: 'strictObject' ,
	properties: {
		a: { type: 'string' , sanitize: 'toString' } ,
		b: { type: 'string' } ,
		c: { type: 'string' }
	}
} ;

doormen( schema , { a: 'one', b: 'two' , c: 'three' } ) ;
doormen.equals( doormen( schema , { a: 1, b: 'two' , c: 'three' } ) , { a: '1', b: 'two' , c: 'three' } ) ;
doormen.not( schema , { a: 'one', b: 'two' } ) ;

doormen.patch( schema , {} ) ;
doormen.patch( schema , { a: 'one', b: 'two' , c: 'three' } ) ;
doormen.equals( doormen.patch( schema , { a: 1, b: 'two' , c: 'three' } ) , { a: '1', b: 'two' , c: 'three' } ) ;
doormen.patch( schema , { a: 'one', b: 'two' } ) ;
doormen.equals( doormen.patch( schema , { a: 1, b: 'two' } ) , { a: '1', b: 'two' } ) ;
```

forbidden path in a patch should throw.

```js
var schema ;

schema = {
	type: 'strictObject' ,
	properties: {
		a: { type: 'string' , sanitize: 'toString' } ,
		b: { type: 'string' } ,
		c: { type: 'string' }
	}
} ;

doormen.patch.not( schema , { d: 'four' } ) ;
doormen.patch.not( schema , { c: 'three' , d: 'four' } ) ;

// Now allow extra properties, it should be ok
schema.extraProperties = true ;

doormen.equals( doormen.patch( schema , { d: 'four' } ) , { d: 'four' } ) ;
doormen.equals( doormen.patch( schema , { c: 'three' , d: 'four' } ) , { c: 'three' , d: 'four' } ) ;

// Now allow any properties, it should still be ok
schema = {
	type: 'strictObject' ,
	of: { type: 'string' , sanitize: 'toString' }
} ;

doormen.equals( doormen.patch( schema , { d: 'four' } ) , { d: 'four' } ) ;
doormen.equals( doormen.patch( schema , { c: 'three' , d: 'four' } ) , { c: 'three' , d: 'four' } ) ;
```

non-object patch should not validate.

```js
var schema ;

schema = {
	type: 'strictObject' ,
	properties: {
		a: { type: 'string' , sanitize: 'toString' } ,
		b: { type: 'string' } ,
		c: { type: 'string' }
	}
} ;

doormen.patch.not( schema , null ) ;
doormen.patch.not( schema , false ) ;
doormen.patch.not( schema , 'mldjsr' ) ;
doormen.patch.not( schema , 8 ) ;
```

should validate a patch with deep path.

```js
var schema ;

schema = {
	type: 'strictObject' ,
	properties: {
		a: { type: 'string' , sanitize: 'toString' } ,
		sub: {
			type: 'strictObject' ,
			properties: {
				b: { type: 'string' } ,
				c: { type: 'string' }
			}
		}
	}
} ;

doormen( schema , { a: "one", sub: { b: "two" , c: "three" } } ) ;
doormen.equals( doormen( schema , { a: 1, sub: { b: "two" , c: "three" } } ) , { a: "1", sub: { b: "two" , c: "three" } } ) ;
doormen.not( schema , { a: "one", sub: { b: "two" } } ) ;

doormen.patch( schema , {} ) ;
doormen.patch( schema , { a: "one", sub: { b: "two" , c: "three" } } ) ;
doormen.equals( doormen.patch( schema , { a: 1, sub: { b: "two" , c: "three" } } ) , { a: "1", sub: { b: "two" , c: "three" } } ) ;

// Shall not pass! This patch means: replace "sub" by { b: "two" }, thus sub.c is missing
doormen.patch.not( schema , { a: "one", sub: { b: "two" } } ) ;

// Pass: only replace sub.b, but keep existing value for sub.c
doormen.patch( schema , { a: "one", "sub.b": "two" } ) ;
doormen.equals( doormen.patch( schema , { a: 1, "sub.b": "two" } ) , { a: "1", "sub.b": "two" } ) ;

doormen.patch.not( schema , { a: "one", "sub.d": "four" } ) ;

// Now allow extra-properties
schema.properties.sub.extraProperties = true ;
doormen.patch( schema , { a: "one", "sub.d": "four" } ) ;
doormen.equals( doormen.patch( schema , { a: 1, "sub.d": "four" } ) , { a: "1", "sub.d": "four" } ) ;
```

<a name="keys-attribute"></a>
# 'keys' attribute
'keys' should perform the check recursively for key itself, using the same given schema for all of them..

```js
var schema = {
	keys: { match: /^[a-z]+$/ }
} ;

// Object
doormen( schema , { a: 'text' } ) ;
doormen.not( schema , { a2: 1 } ) ;
doormen( schema , { a: 'text', b: 'string' } ) ;
doormen.not( schema , { a: 'text', b2: 'string' } ) ;
```

'keys' and sanitizer..

```js
var schema = {
	keys: { sanitize: 'dashToCamelCase' }
} ;

doormen.equals(
	doormen( schema , { "camel-case": "?" , "or-not-camel-case": "?" } ) ,
	{ camelCase: "?" , orNotCamelCase: "?" }
) ;
```

'keys' should throw in case of overwrite..

```js
var schema = {
	keys: { sanitize: 'dashToCamelCase' }
} ;

doormen.not( schema , { camelCase: "!" , "camel-case": "?" } ) ;
```

<a name="alternatives"></a>
# Alternatives
Basic schema alternatives.

```js
doormen( [ { type: 'boolean' } , { type: 'number' } ] , true ) ;
doormen( [ { type: 'boolean' } , { type: 'number' } ] , 5 ) ;
doormen.not( [ { type: 'boolean' } , { type: 'number' } ] , 'toto' ) ;
```

<a name="conditionnal-schema"></a>
# Conditionnal schema.
'if - verify - then' syntaxe using an object in the 'if'.

```js
var schema = {
	if: {
		verify: {
			extraProperties: true ,
			properties: {
				type: { eq: 'alt1' }
			}
		} ,
		then: {
			extraProperties: true ,
			properties: {
				a: { type: 'string' }
			}
		}
	} ,
	extraProperties: true ,
	properties: {
		type: { type: 'string' } ,
		c: { type: 'string' }
	}
} ;

doormen.not( schema , { type: 'std' , a: 'bob' } ) ;
doormen( schema , { type: 'std' , a: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'std' , b: 'bob' } ) ;
doormen( schema , { type: 'std' , b: 'bob' , c: 'jack' } ) ;

doormen.not( schema , { type: 'alt1' , a: 'bob' } ) ;
doormen( schema , { type: 'alt1' , a: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'alt1' , b: 'bob' } ) ;
doormen.not( schema , { type: 'alt1' , b: 'bob' , c: 'jack' } ) ;
```

'if - verify - then' syntaxe using an array of object in the 'if'.

```js
var schema = {
	if: [
		{
			verify: {
				extraProperties: true ,
				properties: {
					type: { eq: 'alt1' }
				}
			} ,
			then: {
				extraProperties: true ,
				properties: {
					a: { type: 'string' }
				}
			}
		} ,
		{
			verify: {
				extraProperties: true ,
				properties: {
					type: { eq: 'alt2' }
				}
			} ,
			then: {
				extraProperties: true ,
				properties: {
					b: { type: 'string' }
				}
			}
		}
	] ,
	extraProperties: true ,
	properties: {
		type: { type: 'string' } ,
		c: { type: 'string' }
	}
} ;

doormen.not( schema , { type: 'std' , a: 'bob' } ) ;
doormen( schema , { type: 'std' , a: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'std' , b: 'bob' } ) ;
doormen( schema , { type: 'std' , b: 'bob' , c: 'jack' } ) ;

doormen.not( schema , { type: 'alt1' , a: 'bob' } ) ;
doormen( schema , { type: 'alt1' , a: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'alt1' , b: 'bob' } ) ;
doormen.not( schema , { type: 'alt1' , b: 'bob' , c: 'jack' } ) ;

doormen.not( schema , { type: 'alt2' , b: 'bob' } ) ;
doormen( schema , { type: 'alt2' , b: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'alt2' , a: 'bob' } ) ;
doormen.not( schema , { type: 'alt2' , a: 'bob' , c: 'jack' } ) ;
```

'switch - case' syntaxe.

```js
var schema = {
	switch: 'type' ,
	case: {
		alt1: {
			extraProperties: true ,
			properties: {
				a: { type: 'string' }
			}
		} ,
		alt2: {
			extraProperties: true ,
			properties: {
				b: { type: 'string' }
			}
		}
	} ,
	extraProperties: true ,
	properties: {
		type: { type: 'string' } ,
		c: { type: 'string' }
	}
} ;

doormen.not( schema , { type: 'std' , a: 'bob' } ) ;
doormen( schema , { type: 'std' , a: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'std' , b: 'bob' } ) ;
doormen( schema , { type: 'std' , b: 'bob' , c: 'jack' } ) ;

doormen.not( schema , { type: 'alt1' , a: 'bob' } ) ;
doormen( schema , { type: 'alt1' , a: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'alt1' , b: 'bob' } ) ;
doormen.not( schema , { type: 'alt1' , b: 'bob' , c: 'jack' } ) ;

doormen.not( schema , { type: 'alt2' , b: 'bob' } ) ;
doormen( schema , { type: 'alt2' , b: 'bob' , c: 'jack' } ) ;
doormen.not( schema , { type: 'alt2' , a: 'bob' } ) ;
doormen.not( schema , { type: 'alt2' , a: 'bob' , c: 'jack' } ) ;
```

<a name="purify"></a>
# Purify
Purify a basic schema.

```js
doormen.equals( doormen.purifySchema( { type: 'string' } ) , { type: 'string' } ) ;
doormen.equals( doormen.purifySchema( { type: 'string' , random: 'stuff' } ) , { type: 'string' } ) ;
doormen.equals( 'default' in doormen.purifySchema( { default: null } ) , true ) ;
doormen.equals( 'default' in doormen.purifySchema( { default: undefined } ) , true ) ;

doormen.equals( doormen.purifySchema(
	{
		extraProperties: true,
		properties: {
			a: { optional: true , type: 'object' , of: { type: 'string' } },
			b: { type: 'array' , sanitize: 'toArray' , of: { type: 'integer' , min: 4 , max: 7 , random: 'stuff' } },
			c: { default: 'default' , type: 'string' },
			d: { filter: { blah: 'blih' } },
			e: { properties: [ 'one' , 'two' , 'three' ] },
			f: { random: 'stuff' , type: 'integer' , sanitize: [ 'some' , 'sanitizers' ] },
			g: { in: [ { some: 'data' } , { some: 'other data' } ] },
			h: { notIn: [ { some: 'data' } , { some: 'other data' } ] },
			i: { match: /a regexp/ , minLength: 4 , maxLength: 11 , length: 6 },
			j: { match: "a regexp compatible string" },
			k: { instanceOf: 'Date' },
			l: { instanceOf: Date },
			m: { of: [ { type: 'array' } , { type: 'string' } ] },
			n: { properties: { a: [ { type: 'array' } , { type: 'string' } ] } },
			o: { elements: [ { type: 'array' } , { type: 'string' } ] },
			p: { elements: [ [ { type: 'array' } , { type: 'string' } ] ] },
			q: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] }, set: 'bob' } },
			r: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] } } },
			s: { if: { verify: { type: 'string' } , then: { in: [ 'toto' ] } } },
			t: { if: [ { verify: { type: 'string' } , then: { in: [ 'toto' ] } } , { verify: { type: 'number' } , then: { in: [ 3 ] } } ] },
		}
	}
	) ,
	{
		extraProperties: true,
		properties: {
			a: { optional: true , type: 'object' , of: { type: 'string' } },
			b: { type: 'array' , sanitize: [ 'toArray' ] , of: { type: 'integer' , min: 4 , max: 7 } },
			c: { default: 'default' , type: 'string' },
			d: { filter: { blah: 'blih' } },
			e: { properties: [ 'one' , 'two' , 'three' ] },
			f: { type: 'integer' , sanitize: [ 'some' , 'sanitizers' ] },
			g: { in: [ { some: 'data' } , { some: 'other data' } ] },
			h: { notIn: [ { some: 'data' } , { some: 'other data' } ] },
			i: { match: /a regexp/ , minLength: 4 , maxLength: 11 , length: 6 },
			j: { match: "a regexp compatible string" },
			k: { instanceOf: 'Date' },
			l: { instanceOf: Date },
			m: { of: [ { type: 'array' } , { type: 'string' } ] },
			n: { properties: { a: [ { type: 'array' } , { type: 'string' } ] } },
			o: { elements: [ { type: 'array' } , { type: 'string' } ] },
			p: { elements: [ [ { type: 'array' } , { type: 'string' } ] ] },
			q: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] }, set: 'bob' } },
			r: { type: 'string' , when: { sibling: 'a', verify: { in: [ null , false ] } } },
			s: { if: { verify: { type: 'string' } , then: { in: [ 'toto' ] } } },
			t: { if: [ { verify: { type: 'string' } , then: { in: [ 'toto' ] } } , { verify: { type: 'number' } , then: { in: [ 3 ] } } ] },
		}
	}
) ;
```

<a name="export-mode"></a>
# Export mode
.export() and 'of'.

```js
var data , schema , returned ;

schema = {
	of: { type: 'string' , sanitize: 'trim' }
} ;

data = { a: 'abc', b: '  def  ' } ;
returned = doormen.export( schema , data ) ;
doormen.equals( data , { a: 'abc', b: '  def  ' } ) ;
doormen.equals( returned , { a: 'abc', b: 'def' } ) ;

returned = doormen( schema , data ) ;
doormen.equals( data , { a: 'abc', b: 'def' } ) ;
doormen.equals( returned , { a: 'abc', b: 'def' } ) ;
```

.export() and 'properties'.

```js
var data , schema , returned ;

schema = {
	properties: {
		a: { type: 'string' , sanitize: 'toUpperCase' },
		b: { type: 'string' , sanitize: 'trim' }
	}
} ;

data = { a: 'abc', b: '  def  ' } ;
returned = doormen.export( schema , data ) ;
doormen.equals( data , { a: 'abc', b: '  def  ' } ) ;
doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;

returned = doormen( schema , data ) ;
doormen.equals( data , { a: 'ABC', b: 'def' } ) ;
doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;

data = { a: 'abc', b: '  def  ', c: 'toto' } ;
doormen.shouldThrow( function() {
	returned = doormen.export( schema , data ) ;
} ) ;

schema.extraProperties = true ;
data = { a: 'abc', b: '  def  ', c: 'toto' } ;
returned = doormen.export( schema , data ) ;
doormen.equals( data , { a: 'abc', b: '  def  ', c: 'toto' } ) ;
doormen.equals( returned , { a: 'ABC', b: 'def' } ) ;

returned = doormen( schema , data ) ;
doormen.equals( data , { a: 'ABC', b: 'def', c: 'toto' } ) ;
doormen.equals( returned , { a: 'ABC', b: 'def', c: 'toto' } ) ;
```

.export() and 'elements'.

```js
var data , schema , returned ;

schema = {
	elements: [
		{ type: 'string' , sanitize: 'toUpperCase' },
		{ type: 'string' , sanitize: 'trim' }
	]
} ;

data = [ 'abc', '  def  ' ] ;
returned = doormen.export( schema , data ) ;
doormen.equals( data , [ 'abc', '  def  ' ] ) ;
doormen.equals( returned , [ 'ABC', 'def' ] ) ;

returned = doormen( schema , data ) ;
doormen.equals( data , [ 'ABC', 'def' ] ) ;
doormen.equals( returned , [ 'ABC', 'def' ] ) ;

data = [ 'abc', '  def  ', 'toto' ] ;
doormen.shouldThrow( function() {
	returned = doormen.export( schema , data ) ;
} ) ;

schema.extraElements = true ;
data = [ 'abc', '  def  ', 'toto' ] ;
returned = doormen.export( schema , data ) ;
doormen.equals( data , [ 'abc', '  def  ', 'toto' ] ) ;
doormen.equals( returned , [ 'ABC', 'def' ] ) ;

returned = doormen( schema , data ) ;
doormen.equals( data , [ 'ABC', 'def', 'toto' ] ) ;
doormen.equals( returned , [ 'ABC', 'def', 'toto' ] ) ;
```

<a name="schema-as-a-sentence"></a>
# Schema as a sentence
should transform a sentence into a schema.

```js
doormen.equals( doormen.sentence( 'array' ) , { type: 'array' } ) ;
doormen.equals( doormen.sentence( 'Array' ) , { instanceOf: 'Array' } ) ;
doormen.equals( doormen.sentence( 'it should be an array' ) , { type: 'array' } ) ;
doormen.equals( doormen.sentence( 'it should have type of array' ) , { type: 'array' } ) ;
doormen.equals( doormen.sentence( 'it should have type of Uppercasetype' ) , { type: 'Uppercasetype' } ) ;
doormen.equals( doormen.sentence( 'it should be an Array' ) , { instanceOf: 'Array' } ) ;
doormen.equals( doormen.sentence( 'it should be an instance of Array' ) , { instanceOf: 'Array' } ) ;
doormen.equals( doormen.sentence( 'it should be an instance of lowercaseclass' ) , { instanceOf: 'lowercaseclass' } ) ;

doormen.equals( doormen.sentence( 'it should be an Array of string' ) ,
	{ instanceOf: 'Array' , of: { type: 'string' } }
) ;

doormen.equals( doormen.sentence( 'it should be an Array of Array of string' ) ,
	{ instanceOf: 'Array' , of: { instanceOf: 'Array' , of: { type: 'string' } } }
) ;

doormen.equals( doormen.sentence( 'it should be a number at least 5' ) ,
	{ type: 'number', min: 5 }
) ;

doormen.equals( doormen.sentence( 'it should be a number at most 7' ) ,
	{ type: 'number', max: 7 }
) ;

doormen.equals( doormen.sentence( 'it should be a number at least 5 and at most 7' ) ,
	{ type: 'number', min: 5, max: 7 }
) ;

doormen.equals( doormen.sentence( 'it should be a number at least 5, at most 7' ) ,
	{ type: 'number', min: 5, max: 7 }
) ;

doormen.equals( doormen.sentence( 'it should be a number between 3 and 11' ) ,
	{ type: 'number', min: 3, max: 11 }
) ;

doormen.equals( doormen.sentence( 'it should be a number greater than or equal to 4' ) ,
	{ type: 'number', min: 4 }
) ;

// equals is required
doormen.shouldThrow( function() { doormen.sentence( 'it should be a number greater than 4' ) ; } ) ;



doormen.equals( doormen.sentence( 'it should be an empty string' ) ,
	{ type: 'string', length: 0 }
) ;

doormen.equals( doormen.sentence( 'it should be a string and it should have a length of 6' ) ,
	{ type: 'string', length: 6 }
) ;

doormen.equals( doormen.sentence( 'it should be a string and it should have a length of at least 8' ) ,
	{ type: 'string', minLength: 8 }
) ;

doormen.equals( doormen.sentence( 'it should be a string and it should have a length of at most 18' ) ,
	{ type: 'string', maxLength: 18 }
) ;

doormen.equals( doormen.sentence( 'it should be a string and it should have a length of at least 9 and at most 17' ) ,
	{ type: 'string', minLength: 9, maxLength: 17 }
) ;

doormen.equals( doormen.sentence( 'it should be a string and it should have a length between 4 and 7' ) ,
	{ type: 'string', minLength: 4, maxLength: 7 }
) ;

doormen.equals( doormen.sentence( 'it should have between 4 and 7 letters' ) ,
	{ minLength: 4, maxLength: 7 }
) ;



doormen.equals( doormen.sentence( 'after trim, it should be a string between 5 and 8 chars' ) ,
	{ sanitize: [ 'trim' ] , type: 'string', minLength: 5, maxLength: 8 }
) ;

doormen.equals( doormen.sentence( 'after trim and toUpperCase it should be a string between 5 and 8 chars' ) ,
	{ sanitize: [ 'trim' , 'toUpperCase' ] , type: 'string', minLength: 5, maxLength: 8 }
) ;

doormen.equals( doormen.sentence( 'after trim and to-upper-case, it is expected to be a string between 5 and 8 chars' ) ,
	{ sanitize: [ 'trim' , 'toUpperCase' ] , type: 'string', minLength: 5, maxLength: 8 }
) ;

doormen.equals( doormen.sentence( 'after sanitizers: trim and to-upper-case, it is expected to be a string between 5 and 8 chars' ) ,
	{ sanitize: [ 'trim' , 'toUpperCase' ] , type: 'string', minLength: 5, maxLength: 8 }
) ;
```

should accept a sentence instead of a schema.

```js
doormen( 'should be a string' , "" ) ;
doormen( 'should be an empty string' , "" ) ;
doormen( 'should be a string' , "one two three" ) ;
doormen.not( 'should be an empty string' , "one two three" ) ;
doormen( 'after trim, it should be an empty string' , "    " ) ;
doormen.not( 'after trim, it should be an empty string' , "  !  " ) ;

doormen( 'should be an array' , [] ) ;
doormen( 'should be an Array' , [] ) ;
doormen( 'should be an empty array' , [] ) ;
doormen( 'should be an empty Array' , [] ) ;
doormen.not( 'should be an empty array' , [ 1,2,3 ] ) ;
doormen( 'should be an array' , [ 1,2,3 ] ) ;
```

<a name="path-in-the-schema"></a>
# Path in the schema
should find the schema for an object path.

```js
var schema = {
	type: 'strictObject' ,
	properties: {
		key1: {
			type: 'integer' ,
			custom: 'field'
		} ,
		key2: {
			type: 'string' ,
			another: 'custom'
		} ,
		key3: {
			type: 'strictObject' ,
			properties: {
				subkey1: {
					type: 'integer' ,
					some: 'data'
				}
			}
		} ,
		key4: {
			type: 'strictObject' ,
			of: {
				type: 'string' ,
				another: 'custom'
			}
		}
	}
} ;

doormen.equals(
	doormen.path( schema , '' ) ,
	schema
) ;

doormen.equals(
	doormen.path( schema , 'key1' ) ,
	schema.properties.key1
) ;

doormen.equals(
	doormen.path( schema , 'key2' ) ,
	schema.properties.key2
) ;

doormen.equals(
	doormen.path( schema , 'key3' ) ,
	schema.properties.key3
) ;

doormen.shouldThrow( function() {
	doormen.path( schema , 'unexistant' ) ;
} ) ;

doormen.equals(
	doormen.path( schema , 'key3.subkey1' ) ,
	schema.properties.key3.properties.subkey1
) ;

doormen.equals(
	doormen.path( schema , 'key4.anything' ) ,
	schema.properties.key4.of
) ;

doormen.equals(
	doormen.path( schema , 'key4.anythingelse' ) ,
	schema.properties.key4.of
) ;

doormen.shouldThrow( function() {
	doormen.path( schema , 'unexistant.unexistant' ) ;
} ) ;

doormen.equals(
	doormen.path( schema , 'key2.unexistant' ) ,
	{}
) ;

doormen.shouldThrow( function() {
	doormen.path( schema , 'key3.unexistant' ) ;
} ) ;
```

<a name="mongodbs-objectid"></a>
# MongoDB's ObjectID
should validate MongoDB's ObjectID.

```js
var mongodb ;

doormen( { type: 'mongoId' } , '1234567890abcd1234567890' ) ;

try {
	mongodb = require( 'mongodb' ) ;
}
catch ( error ) {
	console.log( 'WARNING: MongoDB module not found, the end of the test is skipped.' ) ;
	return ;
}	// skip the remaining tests if the module is not found

doormen( { type: 'mongoId' } , new mongodb.ObjectID() ) ;
```

should sanitize string to MongoDB's ObjectID.

```js
var mongodb ;

try {
	mongodb = require( 'mongodb' ) ;
}
catch ( error ) {
	console.log( 'WARNING: MongoDB module not found, the end of the test is skipped.' ) ;
	return ;
}	// skip the remaining tests if the module is not found

doormen( { instanceOf: mongodb.ObjectID } , doormen( { type: 'mongoId' , sanitize: 'mongoId' } , '1234567890abcd1234567890' ) ) ;
```

<a name="misc"></a>
# Misc
should support custom data in the schema for third party lib.

```js
doormen(
	{ a: 1, b: 'text' } ,
	{
		custom: 'field',
		another: { custom: 'field' },
		properties: {
			a: {
				type: 'number',
				yet: 'another custom field'
			},
			b: {
				type: 'string'
			}
		}
	}
) ;
```

pathsMaxTier().

```js
var schema = {
	type: 'strictObject' ,
	properties: {
		a: {
			type: 'number',
			tier: 3
		},
		b: {
			type: 'string',
			tier: 1
		},
		c: {
			type: 'string',
			tier: 4
		},
		embedded: {
			type: 'strictObject',
			tier: 3 ,
			extraProperties: true,
			properties: {
				d: {
					type: 'number',
					tier: 2
				},
				e: {
					type: 'string',
					tier: 4
				}
			}
		}
	}
} ;

doormen.equals(  doormen.patchTier( schema , {} )  ,  1  ) ;
doormen.equals(  doormen.patchTier( schema , { a: 'some' , b: 'useless' , c: 'values' } )  ,  4  ) ;
doormen.equals(  doormen.patchTier( schema , { a: 'some' } )  ,  3  ) ;
doormen.equals(  doormen.patchTier( schema , { b: 'some' } )  ,  1  ) ;
doormen.equals(  doormen.patchTier( schema , { a: 'some' , c: 'values' } )  ,  4  ) ;
doormen.equals(  doormen.patchTier( schema , { a: 'some' , b: 'useless' } )  ,  3  ) ;
doormen.equals(  doormen.patchTier( schema , { embedded: 'useless' } )  ,  3  ) ;
doormen.equals(  doormen.patchTier( schema , { b: 'some' , 'embedded.e': 'useless' } )  ,  4  ) ;
doormen.equals(  doormen.patchTier( schema , { b: 'some' , 'embedded.unexistant': 'useless' } )  ,  3  ) ;
doormen.equals(  doormen.patchTier( schema , { 'embedded.e': 'useless' } )  ,  4  ) ;
doormen.equals(  doormen.patchTier( schema , { 'embedded.d': 'useless' } )  ,  3  ) ;
doormen.equals(  doormen.patchTier( schema , { 'embedded.unexistant': 'useless' } )  ,  3  ) ;
```

real world use case.

```js
doormen.typeChecker.password = function( data ) {
	if ( typeof data !== 'string' ) { return false ; }
	if ( data.length < 8 ) { return false ; }
	if ( ! data.match( /[a-z]/ ) || ! data.match( /[A-Z]/ ) || ! data.match( /[0-9.,;!?*%$#+-]/ ) ) { return false ; }
	return true ;
} ;

var userSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: {
			type: 'string',
			minLength: 2,
			maxLength: 50
		},
		email: { type: 'email' },
		password: { type: 'password' },
		contact: {
			optional: true,
			type: 'object',
			properties: {
				address: { optional: true, type: 'string' },
				phone: { optional: true, type: 'string' },
				fax: { optional: true, type: 'string' }
			}
		},
		custom: {
			optional: true,
			type: 'object',
			of: { type: 'string' }
		}
	}
} ;

doormen( userSchema , {
	id: 'alacon',
	name: 'Doug',
	email: 'doug@java.net',
	password: 'myJavaCodeIsFasterThanYourC!',
} ) ;

doormen( userSchema , {
	id: 'alanoix',
	name: 'Étienne Jabert',
	email: 'etienne-jabert@java.net',
	password: 'superJabert!',
	contact: {
		fax: '0142559833'
	}
} ) ;
```

