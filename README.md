

# Doormen

Validate, sanitize and assert.

Early alpha.

**/!\\ This documentation is still a Work In Progress /!\\**



## Basic validation

* sanitize `Array` of `string` the sanitizer's name to apply before any type checking
* optional `boolean` the data can be `null` or `undefined`, if so the data validate immediately
* default (anything) the data can be `null` or `undefined`, if so it is overwritten by the default value and it validates immediately
* type `string` the name of the type checker
* min
* max
* length
* minLength
* maxLength
* match
* in
* notIn
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
   - [Optional and default data](#optional-and-default-data)
   - [Basic types](#basic-types)
   - [Built-in types](#built-in-types)
   - [Top-level filters](#top-level-filters)
   - [Children and recursivity](#children-and-recursivity)
   - [Numbers meta types](#numbers-meta-types)
   - [Sanitize](#sanitize)
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
	doormen.not( 'text' , { type: 'string' } ) ;
}
catch ( error ) {
	thrown = true ;
}

if ( ! thrown ) { throw new Error( 'It should throw' ) ; }


thrown = false ;

try {
	doormen.not( 1 , { type: 'string' } ) ;
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
doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 } ) ;
doormen.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: undefined } ) ;
doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , c: undefined } ) ;
doormen.equals( { a: 2 , b: 5 , c: undefined } , { a: 2 , b: 5 , d: undefined } ) ;
doormen.not.equals( { a: 2 , b: 5 , c: null } , { a: 2 , b: 5 } ) ;
doormen.not.equals( { a: 2 , b: 5 } , { a: 2 , b: 5 , c: null } ) ;

doormen.not.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 } ) ;
doormen.equals( { a: 2 , b: 5 , c: {} } , { a: 2 , b: 5 , c: {} } ) ;
doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' } } ) ;
doormen.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'titi' , e: undefined } } ) ;
doormen.not.equals( { a: 2 , b: 5 , c: { d: 'titi' } } , { a: 2 , b: 5 , c: { d: 'toto' } } ) ;
doormen.equals(
	{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } } ,
	{ a: 2 , b: 5 , c: { d: 'titi' , e: { f: 'f' , g: 7 } } }
) ;

// Should test equality of object with different prototype
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

<a name="optional-and-default-data"></a>
# Optional and default data
data should validate when null or undefined if the optional flag is set.

```js
doormen.not( null , { type: 'string' } ) ;
doormen( null , { optional: true, type: 'string' } ) ;
doormen.not( undefined , { type: 'string' } ) ;
doormen( undefined , { optional: true, type: 'string' } ) ;

doormen( 'text' , { type: 'string' } ) ;
doormen( 'text' , { optional: true, type: 'string' } ) ;
doormen.not( 1 , { type: 'string' } ) ;
doormen.not( 1 , { optional: true, type: 'string' } ) ;

doormen.not( {} , { properties: { a: { type: 'string' } } } ) ;
doormen( {} , { properties: { a: { optional: true, type: 'string' } } } ) ;
```

data should validate when null or undefined if a default value is specified, the default should overwrite the original one.

```js
doormen.equals( doormen( null , { type: 'string' , "default": 'default!' } ) , 'default!' ) ;
doormen.equals(
	doormen(
		{ a: null } ,
		{ properties: { a: { type: 'string' , "default": 'default!' } } } ) ,
	{ a: 'default!' }
) ;
doormen.equals(
	doormen(
		{ a: null } ,
		{ properties: { a: { type: 'string' , "default": 'default!' } , b: { type: 'object' , "default": { c: 5 } } } } ) ,
	{ a: 'default!' , b: { c: 5 } }
) ;
```

<a name="basic-types"></a>
# Basic types
should validate undefined accordingly.

```js
doormen( undefined , { type: 'undefined' } ) ;
doormen.not( null , { type: 'undefined' } ) ;
doormen.not( false , { type: 'undefined' } ) ;
doormen.not( true , { type: 'undefined' } ) ;
doormen.not( 0 , { type: 'undefined' } ) ;
doormen.not( 1 , { type: 'undefined' } ) ;
doormen.not( '' , { type: 'undefined' } ) ;
doormen.not( 'text' , { type: 'undefined' } ) ;
doormen.not( {} , { type: 'undefined' } ) ;
doormen.not( [] , { type: 'undefined' } ) ;
```

should validate null accordingly.

```js
doormen.not( undefined , { type: 'null' } ) ;
doormen( null , { type: 'null' } ) ;
doormen.not( false , { type: 'null' } ) ;
doormen.not( true , { type: 'null' } ) ;
doormen.not( 0 , { type: 'null' } ) ;
doormen.not( 1 , { type: 'null' } ) ;
doormen.not( '' , { type: 'null' } ) ;
doormen.not( 'text' , { type: 'null' } ) ;
doormen.not( {} , { type: 'null' } ) ;
doormen.not( [] , { type: 'null' } ) ;
```

should validate boolean accordingly.

```js
doormen.not( undefined , { type: 'boolean' } ) ;
doormen.not( null , { type: 'boolean' } ) ;
doormen( false , { type: 'boolean' } ) ;
doormen( true , { type: 'boolean' } ) ;
doormen.not( 0 , { type: 'boolean' } ) ;
doormen.not( 1 , { type: 'boolean' } ) ;
doormen.not( '' , { type: 'boolean' } ) ;
doormen.not( 'text' , { type: 'boolean' } ) ;
doormen.not( {} , { type: 'boolean' } ) ;
doormen.not( [] , { type: 'boolean' } ) ;
```

should validate number accordingly.

```js
doormen.not( undefined , { type: 'number' } ) ;
doormen.not( null , { type: 'number' } ) ;
doormen.not( false , { type: 'number' } ) ;
doormen.not( true , { type: 'number' } ) ;
doormen( 0 , { type: 'number' } ) ;
doormen( 1 , { type: 'number' } ) ;
doormen( Infinity , { type: 'number' } ) ;
doormen( NaN , { type: 'number' } ) ;
doormen.not( '' , { type: 'number' } ) ;
doormen.not( 'text' , { type: 'number' } ) ;
doormen.not( {} , { type: 'number' } ) ;
doormen.not( [] , { type: 'number' } ) ;
```

should validate string accordingly.

```js
doormen.not( undefined , { type: 'string' } ) ;
doormen.not( null , { type: 'string' } ) ;
doormen.not( false , { type: 'string' } ) ;
doormen.not( true , { type: 'string' } ) ;
doormen.not( 0 , { type: 'string' } ) ;
doormen.not( 1 , { type: 'string' } ) ;
doormen( '' , { type: 'string' } ) ;
doormen( 'text' , { type: 'string' } ) ;
doormen.not( {} , { type: 'string' } ) ;
doormen.not( [] , { type: 'string' } ) ;
```

should validate object accordingly.

```js
doormen.not( undefined , { type: 'object' } ) ;
doormen.not( null , { type: 'object' } ) ;
doormen.not( false , { type: 'object' } ) ;
doormen.not( true , { type: 'object' } ) ;
doormen.not( 0 , { type: 'object' } ) ;
doormen.not( 1 , { type: 'object' } ) ;
doormen.not( '' , { type: 'object' } ) ;
doormen.not( 'text' , { type: 'object' } ) ;
doormen( {} , { type: 'object' } ) ;
doormen( { a:1 , b:2 } , { type: 'object' } ) ;
doormen( [] , { type: 'object' } ) ;
doormen( [ 1,2,3 ] , { type: 'object' } ) ;
doormen( new Date() , { type: 'object' } ) ;
doormen.not( function(){} , { type: 'object' } ) ;
```

should validate function accordingly.

```js
doormen.not( undefined , { type: 'function' } ) ;
doormen.not( null , { type: 'function' } ) ;
doormen.not( false , { type: 'function' } ) ;
doormen.not( true , { type: 'function' } ) ;
doormen.not( 0 , { type: 'function' } ) ;
doormen.not( 1 , { type: 'function' } ) ;
doormen.not( '' , { type: 'function' } ) ;
doormen.not( 'text' , { type: 'function' } ) ;
doormen.not( {} , { type: 'function' } ) ;
doormen.not( [] , { type: 'function' } ) ;
doormen( function(){} , { type: 'function' } ) ;
```

<a name="built-in-types"></a>
# Built-in types
should validate array accordingly.

```js
doormen.not( undefined , { type: 'array' } ) ;
doormen.not( null , { type: 'array' } ) ;
doormen.not( false , { type: 'array' } ) ;
doormen.not( true , { type: 'array' } ) ;
doormen.not( 0 , { type: 'array' } ) ;
doormen.not( 1 , { type: 'array' } ) ;
doormen.not( '' , { type: 'array' } ) ;
doormen.not( 'text' , { type: 'array' } ) ;
doormen.not( {} , { type: 'array' } ) ;
doormen.not( { a:1 , b:2 } , { type: 'array' } ) ;
doormen( [] , { type: 'array' } ) ;
doormen( [ 1,2,3 ] , { type: 'array' } ) ;
doormen.not( function(){} , { type: 'array' } ) ;
```

should validate date accordingly.

```js
doormen( new Date() , { type: 'date' } ) ;

doormen.not( undefined , { type: 'date' } ) ;
doormen.not( null , { type: 'date' } ) ;
doormen.not( false , { type: 'date' } ) ;
doormen.not( true , { type: 'date' } ) ;
doormen.not( 0 , { type: 'date' } ) ;
doormen.not( 1 , { type: 'date' } ) ;
doormen.not( '' , { type: 'date' } ) ;
doormen.not( 'text' , { type: 'date' } ) ;
doormen.not( {} , { type: 'date' } ) ;
doormen.not( { a:1 , b:2 } , { type: 'date' } ) ;
doormen.not( [] , { type: 'date' } ) ;
doormen.not( [ 1,2,3 ] , { type: 'date' } ) ;
doormen.not( function(){} , { type: 'date' } ) ;
```

should validate error accordingly.

```js
doormen( new Error() , { type: 'error' } ) ;

doormen.not( undefined , { type: 'error' } ) ;
doormen.not( null , { type: 'error' } ) ;
doormen.not( false , { type: 'error' } ) ;
doormen.not( true , { type: 'error' } ) ;
doormen.not( 0 , { type: 'error' } ) ;
doormen.not( 1 , { type: 'error' } ) ;
doormen.not( '' , { type: 'error' } ) ;
doormen.not( 'text' , { type: 'error' } ) ;
doormen.not( {} , { type: 'error' } ) ;
doormen.not( { a:1 , b:2 } , { type: 'error' } ) ;
doormen.not( [] , { type: 'error' } ) ;
doormen.not( [ 1,2,3 ] , { type: 'error' } ) ;
doormen.not( function(){} , { type: 'error' } ) ;
```

should validate arguments accordingly.

```js
var fn = function() { doormen( arguments , { type: 'arguments' } ) ; }

fn() ;
fn( 1 ) ;
fn( 1 , 2 , 3 ) ;

doormen.not( undefined , { type: 'arguments' } ) ;
doormen.not( null , { type: 'arguments' } ) ;
doormen.not( false , { type: 'arguments' } ) ;
doormen.not( true , { type: 'arguments' } ) ;
doormen.not( 0 , { type: 'arguments' } ) ;
doormen.not( 1 , { type: 'arguments' } ) ;
doormen.not( '' , { type: 'arguments' } ) ;
doormen.not( 'text' , { type: 'arguments' } ) ;
doormen.not( {} , { type: 'arguments' } ) ;
doormen.not( { a:1 , b:2 } , { type: 'arguments' } ) ;
doormen.not( [] , { type: 'arguments' } ) ;
doormen.not( [ 1,2,3 ] , { type: 'arguments' } ) ;
doormen.not( function(){} , { type: 'arguments' } ) ;
```

<a name="top-level-filters"></a>
# Top-level filters
min filter should validate accordingly, non-number should throw.

```js
doormen( 10 , { min: 3 } ) ;
doormen( 3 , { min: 3 } ) ;
doormen.not( 1 , { min: 3 } ) ;
doormen.not( 0 , { min: 3 } ) ;
doormen.not( -10 , { min: 3 } ) ;
doormen( Infinity , { min: 3 } ) ;
doormen.not( -Infinity , { min: 3 } ) ;
doormen.not( NaN , { min: 3 } ) ;
doormen.not( true , { min: 3 } ) ;
doormen.not( false , { min: 3 } ) ;
doormen.not( undefined , { min: 3 } ) ;
doormen.not( undefined , { min: 0 } ) ;
doormen.not( undefined , { min: -3 } ) ;
doormen.not( '10' , { min: 3 } ) ;
```

max filter should validate accordingly, non-number should throw.

```js
doormen.not( 10 , { max: 3 } ) ;
doormen( 3 , { max: 3 } ) ;
doormen( 1 , { max: 3 } ) ;
doormen( 0 , { max: 3 } ) ;
doormen( -10 , { max: 3 } ) ;
doormen.not( Infinity , { max: 3 } ) ;
doormen( -Infinity , { max: 3 } ) ;
doormen.not( NaN , { max: 3 } ) ;
doormen.not( true , { max: 3 } ) ;
doormen.not( false , { max: 3 } ) ;
doormen.not( '1' , { max: 3 } ) ;
```

min + max filter should validate accordingly, non-number should throw.

```js
doormen.not( 15 , { min: 3, max: 10 } ) ;
doormen( 10 , { min: 3, max: 10 } ) ;
doormen( 5 , { min: 3, max: 10 } ) ;
doormen( 3 , { min: 3, max: 10 } ) ;
doormen.not( 1 , { min: 3, max: 10 } ) ;
doormen.not( 0 , { min: 3, max: 10 } ) ;
doormen.not( -10 , { min: 3, max: 10 } ) ;
doormen.not( Infinity , { min: 3, max: 10 } ) ;
doormen.not( -Infinity , { min: 3, max: 10 } ) ;
doormen.not( NaN , { min: 3, max: 10 } ) ;
doormen.not( true , { min: 3, max: 10 } ) ;
doormen.not( false , { min: 3, max: 10 } ) ;
doormen.not( '6' , { min: 3, max: 10 } ) ;
```

'length' filter should validate accordingly, data that do not have a length should throw.

```js
doormen( "abc" , { length: 3 } ) ;
doormen.not( "abcde" , { length: 3 } ) ;
doormen.not( "ab" , { length: 3 } ) ;
doormen.not( "" , { length: 3 } ) ;

doormen.not( 1 , { length: 3 } ) ;
doormen.not( 1 , { length: 0 } ) ;
doormen.not( NaN , { length: 3 } ) ;
doormen.not( true , { length: 3 } ) ;
doormen.not( false , { length: 3 } ) ;
```

minLength filter should validate accordingly, data that do not have a length should throw.

```js
doormen( "abc" , { minLength: 3 } ) ;
doormen( "abcde" , { minLength: 3 } ) ;
doormen.not( "ab" , { minLength: 3 } ) ;
doormen.not( "" , { minLength: 3 } ) ;

doormen.not( 1 , { minLength: 3 } ) ;
doormen.not( 1 , { minLength: 0 } ) ;
doormen.not( NaN , { minLength: 3 } ) ;
doormen.not( true , { minLength: 3 } ) ;
doormen.not( false , { minLength: 3 } ) ;
```

maxLength filter should validate accordingly, data that do not have a length should throw.

```js
doormen( "abc" , { maxLength: 3 } ) ;
doormen.not( "abcde" , { maxLength: 3 } ) ;
doormen( "ab" , { maxLength: 3 } ) ;
doormen( "" , { maxLength: 3 } ) ;

doormen.not( 1 , { maxLength: 3 } ) ;
doormen.not( 1 , { maxLength: 0 } ) ;
doormen.not( NaN , { maxLength: 3 } ) ;
doormen.not( true , { maxLength: 3 } ) ;
doormen.not( false , { maxLength: 3 } ) ;
```

minLength + maxLength filter should validate accordingly, data that do not have a length should throw.

```js
doormen( "abc" , { minLength: 3 , maxLength: 5 } ) ;
doormen( "abcd" , { minLength: 3 , maxLength: 5 } ) ;
doormen( "abcde" , { minLength: 3 , maxLength: 5 } ) ;
doormen.not( "abcdef" , { minLength: 3 , maxLength: 5 } ) ;
doormen.not( "ab" , { minLength: 3 , maxLength: 5 } ) ;
doormen.not( "" , { minLength: 3 , maxLength: 5 } ) ;

doormen.not( 1 , { minLength: 3 , maxLength: 5 } ) ;
doormen.not( 1 , { maxLength: 0 } ) ;
doormen.not( NaN , { minLength: 3 , maxLength: 5 } ) ;
doormen.not( true , { minLength: 3 , maxLength: 5 } ) ;
doormen.not( false , { minLength: 3 , maxLength: 5 } ) ;
```

'match' filter should validate accordingly using a RegExp.

```js
doormen( "" , { match: "^[a-f]*$" } ) ;
doormen.not( "" , { match: "^[a-f]+$" } ) ;
doormen( "abc" , { match: "^[a-f]*$" } ) ;
doormen( "abcdef" , { match: "^[a-f]*$" } ) ;
doormen.not( "ghi" , { match: "^[a-f]*$" } ) ;
doormen.not( "ghi" , { match: /^[a-f]*$/ } ) ;

doormen.not( 1 , { match: "^[a-f]*$" } ) ;
doormen.not( 1 , { maxLength: 0 } ) ;
doormen.not( NaN , { match: "^[a-f]*$" } ) ;
doormen.not( true , { match: "^[a-f]*$" } ) ;
doormen.not( false , { match: "^[a-f]*$" } ) ;
```

'in' filter should validate if the value is listed.

```js
doormen.not( 10 , { in: [ 1,5,7 ] } ) ;
doormen( 5 , { in: [ 1,5,7 ] } ) ;
doormen( 1 , { in: [ 1,5,7 ] } ) ;
doormen.not( 0 , { in: [ 1,5,7 ] } ) ;
doormen.not( -10 , { in: [ 1,5,7 ] } ) ;
doormen.not( Infinity , { in: [ 1,5,7 ] } ) ;
doormen( Infinity , { in: [ 1,5,Infinity,7 ] } ) ;
doormen.not( -Infinity , { in: [ 1,5,7 ] } ) ;
doormen.not( NaN , { in: [ 1,5,7 ] } ) ;
doormen( NaN , { in: [ 1,5,NaN,7 ] } ) ;

doormen( true , { in: [ 1,true,5,7 ] } ) ;
doormen.not( true , { in: [ 1,5,7 ] } ) ;
doormen( false , { in: [ 1,false,5,7 ] } ) ;
doormen.not( false , { in: [ 1,5,7 ] } ) ;

doormen.not( "text" , { in: [ 1,5,7 ] } ) ;
doormen( "text" , { in: [ 1,"text",5,7 ] } ) ;
doormen( "text" , { in: [ "string", "text", "bob" ] } ) ;
doormen.not( "bobby" , { in: [ "string", "text", "bob" ] } ) ;
doormen( "" , { in: [ "string", "text", "" ] } ) ;
doormen.not( "" , { in: [ "string", "text", "bob" ] } ) ;
```

'notIn' filter should validate if the value is listed.

```js
doormen( 10 , { notIn: [ 1,5,7 ] } ) ;
doormen.not( 5 , { notIn: [ 1,5,7 ] } ) ;
doormen.not( 1 , { notIn: [ 1,5,7 ] } ) ;
doormen( 0 , { notIn: [ 1,5,7 ] } ) ;
doormen( -10 , { notIn: [ 1,5,7 ] } ) ;
doormen( Infinity , { notIn: [ 1,5,7 ] } ) ;
doormen.not( Infinity , { notIn: [ 1,5,Infinity,7 ] } ) ;
doormen( -Infinity , { notIn: [ 1,5,7 ] } ) ;
doormen( NaN , { notIn: [ 1,5,7 ] } ) ;
doormen.not( NaN , { notIn: [ 1,5,NaN,7 ] } ) ;

doormen.not( true , { notIn: [ 1,true,5,7 ] } ) ;
doormen( true , { notIn: [ 1,5,7 ] } ) ;
doormen.not( false , { notIn: [ 1,false,5,7 ] } ) ;
doormen( false , { notIn: [ 1,5,7 ] } ) ;

doormen( "text" , { notIn: [ 1,5,7 ] } ) ;
doormen.not( "text" , { notIn: [ 1,"text",5,7 ] } ) ;
doormen.not( "text" , { notIn: [ "string", "text", "bob" ] } ) ;
doormen( "bobby" , { notIn: [ "string", "text", "bob" ] } ) ;
doormen.not( "" , { notIn: [ "string", "text", "" ] } ) ;
doormen( "" , { notIn: [ "string", "text", "bob" ] } ) ;
```

'in' filter containing object and arrays.

```js
doormen( { a: 2 } , { in: [ 1 , { a: 2 } , 5 , 7 ] } ) ;
doormen.not( { a: 2 , b: 5 } , { in: [ 1 , { a: 2 } , 5 , 7 ] } ) ;
doormen.not( { a: 2 , b: 5 } , { in: [ 1 , { a: 2 } , { b: 5 } , 7 ] } ) ;
doormen( { a: 2 , b: 5 } , { in: [ 1 , { a: 2 } , { a: 2 , b: 5 } , { b: 5 } , 7 ] } ) ;
doormen( [ 'a' , 2 ] , { in: [ 1 , [ 'a', 2 ] , 5 , 7 ] } ) ;
doormen.not( [ 'a' , 2 ] , { in: [ 1 , [ 'a', 2 , 3 ] , 5 , 7 ] } ) ;
```

<a name="children-and-recursivity"></a>
# Children and recursivity
'of' should perform the check recursively for each children, using the same given schema for all of them..

```js
var schema = {
	of: { type: 'string' }
} ;

// Object
doormen( { b: 'text' } , schema ) ;
doormen.not( { a: 1 } , schema ) ;
doormen.not( { a: 1, b: 'text' } , schema ) ;
doormen.not( { a: 'text', b: 3 } , schema ) ;
doormen( { a: 'text', b: 'string' } , schema ) ;
doormen.not( { A: 'TEXT', b: 'text' , c: undefined } , schema ) ;

// Array
doormen( [ 'text' ] , schema ) ;
doormen( [] , schema ) ;
doormen( [ 'text' , 'string' ] , schema ) ;
doormen.not( [ 'text' , 'string' , null ] , schema ) ;
doormen.not( [ 1 , 'text' , 'string' ] , schema ) ;
doormen.not( [ true ] , schema ) ;

doormen.not( 'text' , schema ) ;
doormen.not( 5 , schema ) ;
doormen.not( null , schema ) ;
doormen.not( undefined , schema ) ;
```

when 'properties' is an array, it should check if the value has all listed properties.

```js
var schema = {
	properties: [ 'a' , 'b' ]
} ;

doormen( { a: 1, b: 'text' } , schema ) ;
doormen( { a: 'text', b: 3 } , schema ) ;
doormen( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
doormen.not( { b: 'text' } , schema ) ;
doormen.not( { a: 1 } , schema ) ;

doormen.not( 'text' , schema ) ;
doormen.not( 5 , schema ) ;
doormen.not( null , schema ) ;
doormen.not( undefined , schema ) ;
```

when 'properties' is an object, it should perform the check recursively for each listed child.

```js
var schema = {
	properties: {
		a: { type: 'number' },
		b: { type: 'string' }
	}
} ;

doormen( { a: 1, b: 'text' } , schema ) ;
doormen.not( { a: 'text', b: 3 } , schema ) ;
doormen( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
doormen.not( { b: 'text' } , schema ) ;
doormen.not( { a: 1 } , schema ) ;

doormen.not( 'text' , schema ) ;
doormen.not( 5 , schema ) ;
doormen.not( null , schema ) ;
doormen.not( undefined , schema ) ;
```

when 'properties' is an array and 'only' is truthy, it should check if the value has all and ONLY listed properties.

```js
var schema = {
	properties: [ 'a' , 'b' ],
	only: true,
} ;

doormen( { a: 1, b: 'text' } , schema ) ;
doormen( { a: 'text', b: 3 } , schema ) ;
doormen.not( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
doormen.not( { b: 'text' } , schema ) ;
doormen.not( { a: 1 } , schema ) ;

doormen.not( 'text' , schema ) ;
doormen.not( 5 , schema ) ;
doormen.not( null , schema ) ;
doormen.not( undefined , schema ) ;
```

when 'properties' is an object and 'only' is truthy, it should perform the check recursively for each listed child and check if the value has ONLY listed properties.

```js
var schema = {
	properties: {
		a: { type: 'number' },
		b: { type: 'string' }
	},
	only: true
} ;

doormen( { a: 1, b: 'text' } , schema ) ;
doormen.not( { a: 'text', b: 3 } , schema ) ;
doormen.not( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
doormen.not( { b: 'text' } , schema ) ;
doormen.not( { a: 1 } , schema ) ;

doormen.not( 'text' , schema ) ;
doormen.not( 5 , schema ) ;
doormen.not( null , schema ) ;
doormen.not( undefined , schema ) ;
```

'elements' should perform the check recursively for each children elements, using a specific schema for each one.

```js
var schema = {
	elements: [
		{ type: 'string' },
		{ type: 'number' },
		{ type: 'boolean' }
	]
} ;

doormen( [ 'text' , 3 , false ] , schema ) ;
doormen( [ 'text' , 3 , false , 'extra' , true ] , schema ) ;
doormen.not( [] , schema ) ;
doormen.not( [ 'text' , 3 ] , schema ) ;
doormen.not( [ true ] , schema ) ;

doormen.not( {} , schema ) ;
doormen.not( { b: 'text' } , schema ) ;
doormen.not( 'text' , schema ) ;
doormen.not( 5 , schema ) ;
doormen.not( null , schema ) ;
doormen.not( undefined , schema ) ;
```

'elements' should perform the check recursively for each children elements, using a specific schema for each one.

```js
var schema = {
	elements: [
		{ type: 'string' },
		{ type: 'number' },
		{ type: 'boolean' }
	],
	only: true
} ;

doormen( [ 'text' , 3 , false ] , schema ) ;
doormen.not( [ 'text' , 3 , false , 'extra' , true ] , schema ) ;
doormen.not( [] , schema ) ;
doormen.not( [ 'text' , 3 ] , schema ) ;
doormen.not( [ true ] , schema ) ;

doormen.not( {} , schema ) ;
doormen.not( { b: 'text' } , schema ) ;
doormen.not( 'text' , schema ) ;
doormen.not( 5 , schema ) ;
doormen.not( null , schema ) ;
doormen.not( undefined , schema ) ;
```

<a name="numbers-meta-types"></a>
# Numbers meta types
should validate real accordingly.

```js
doormen( 0 , { type: 'real' } ) ;
doormen( 1 , { type: 'real' } ) ;
doormen( -1 , { type: 'real' } ) ;
doormen( 0.3 , { type: 'real' } ) ;
doormen( 18.36 , { type: 'real' } ) ;
doormen.not( 1/0 , { type: 'real' } ) ;
doormen.not( Infinity , { type: 'real' } ) ;
doormen.not( -Infinity , { type: 'real' } ) ;
doormen.not( NaN , { type: 'real' } ) ;

doormen.not( undefined , { type: 'real' } ) ;
doormen.not( null , { type: 'real' } ) ;
doormen.not( false , { type: 'real' } ) ;
doormen.not( true , { type: 'real' } ) ;
doormen.not( '' , { type: 'real' } ) ;
doormen.not( 'text' , { type: 'real' } ) ;
doormen.not( {} , { type: 'real' } ) ;
doormen.not( [] , { type: 'real' } ) ;
```

should validate integer accordingly.

```js
doormen( 0 , { type: 'integer' } ) ;
doormen( 1 , { type: 'integer' } ) ;
doormen( 123456789 , { type: 'integer' } ) ;
doormen( -1 , { type: 'integer' } ) ;
doormen.not( 0.00001 , { type: 'integer' } ) ;
doormen.not( -0.00001 , { type: 'integer' } ) ;
doormen.not( 123456.00001 , { type: 'integer' } ) ;
doormen.not( 123456.99999 , { type: 'integer' } ) ;
doormen.not( 0.3 , { type: 'integer' } ) ;
doormen.not( 18.36 , { type: 'integer' } ) ;
doormen.not( 1/0 , { type: 'integer' } ) ;
doormen.not( Infinity , { type: 'integer' } ) ;
doormen.not( -Infinity , { type: 'integer' } ) ;
doormen.not( NaN , { type: 'integer' } ) ;

doormen.not( undefined , { type: 'integer' } ) ;
doormen.not( null , { type: 'integer' } ) ;
doormen.not( false , { type: 'integer' } ) ;
doormen.not( true , { type: 'integer' } ) ;
doormen.not( '' , { type: 'integer' } ) ;
doormen.not( 'text' , { type: 'integer' } ) ;
doormen.not( {} , { type: 'integer' } ) ;
doormen.not( [] , { type: 'integer' } ) ;
```

<a name="sanitize"></a>
# Sanitize
should sanitize to 'toNumber' accordingly.

```js
doormen.equals( doormen( 0 , { sanitize: 'toNumber' } ) , 0 ) ;
doormen.equals( doormen( '0' , { sanitize: 'toNumber' } ) , 0 ) ;
doormen.equals( doormen( 1 , { sanitize: 'toNumber' } ) , 1 ) ;
doormen.equals( doormen( '1' , { sanitize: 'toNumber' } ) , 1 ) ;
```

should trim a string accordingly.

```js
doormen.equals( doormen( 'a' , { sanitize: 'trim' } ) , 'a' ) ;
doormen.equals( doormen( '  a' , { sanitize: 'trim' } ) , 'a' ) ;
doormen.equals( doormen( 'a  ' , { sanitize: 'trim' } ) , 'a' ) ;
doormen.equals( doormen( '  a  ' , { sanitize: 'trim' } ) , 'a' ) ;
doormen.equals( doormen( 'ab  cd' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
doormen.equals( doormen( '   ab  cd' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
doormen.equals( doormen( 'ab  cd   ' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
doormen.equals( doormen( '   ab  cd   ' , { sanitize: 'trim' } ) , 'ab  cd' ) ;
```

sanitize should work recursively as well.

```js
doormen.equals( doormen( {} , { of: { sanitize: 'trim' } } ) , {} ) ;
doormen.equals( doormen( { a: ' toto  ' } , { of: { sanitize: 'trim' } } ) , { a: 'toto' } ) ;
doormen.equals( doormen( { a: ' toto  ' , b: 'text  ' } , { of: { sanitize: 'trim' } } ) , { a: 'toto' , b: 'text' } ) ;
doormen.equals( doormen(
		{ a: ' toto  ' , b: 'text  ' } ,
		{ of: { sanitize: 'trim' } } ) ,
	{ a: 'toto' , b: 'text' }
) ;
doormen.equals( doormen(
		{ a: ' toto  ' , b: 'text  ' } ,
		{ properties: { a: { sanitize: 'trim' } } } ) ,
	{ a: 'toto' , b: 'text  ' }
) ;
doormen.equals( doormen(
		{ a: ' toto  ' , b: 'text  ' } ,
		{ properties: { a: { sanitize: 'trim' } , b: { sanitize: 'trim' } } } ) ,
	{ a: 'toto' , b: 'text' }
) ;
```

