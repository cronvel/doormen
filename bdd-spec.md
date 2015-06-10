# TOC
   - [Assertion utilities](#assertion-utilities)
   - [Optional and default data](#optional-and-default-data)
   - [Basic types](#basic-types)
   - [Built-in types](#built-in-types)
   - [Built-in filters](#built-in-filters)
   - [Properties and recursivity](#properties-and-recursivity)
   - [Numbers meta types](#numbers-meta-types)
   - [Common sanitizers](#common-sanitizers)
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

<a name="optional-and-default-data"></a>
# Optional and default data
optional data should validate when null or undefined even if the type check would have failed.

```js
doormen.not( null , { type: 'string' } ) ;
doormen( null , { optional: true, type: 'string' } ) ;
doormen.not( undefined , { type: 'string' } ) ;
doormen( undefined , { optional: true, type: 'string' } ) ;

doormen( 'text' , { type: 'string' } ) ;
doormen( 'text' , { optional: true, type: 'string' } ) ;
doormen.not( 1 , { type: 'string' } ) ;
doormen.not( 1 , { optional: true, type: 'string' } ) ;
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

<a name="built-in-filters"></a>
# Built-in filters
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

min-length filter should validate accordingly, data that do not have a length should throw.

```js
doormen( "abc" , { "min-length": 3 } ) ;
doormen( "abcde" , { "min-length": 3 } ) ;
doormen.not( "ab" , { "min-length": 3 } ) ;
doormen.not( "" , { "min-length": 3 } ) ;

doormen.not( 1 , { "min-length": 3 } ) ;
doormen.not( 1 , { "min-length": 0 } ) ;
doormen.not( NaN , { "min-length": 3 } ) ;
doormen.not( true , { "min-length": 3 } ) ;
doormen.not( false , { "min-length": 3 } ) ;
```

max-length filter should validate accordingly, data that do not have a length should throw.

```js
doormen( "abc" , { "max-length": 3 } ) ;
doormen.not( "abcde" , { "max-length": 3 } ) ;
doormen( "ab" , { "max-length": 3 } ) ;
doormen( "" , { "max-length": 3 } ) ;

doormen.not( 1 , { "max-length": 3 } ) ;
doormen.not( 1 , { "max-length": 0 } ) ;
doormen.not( NaN , { "max-length": 3 } ) ;
doormen.not( true , { "max-length": 3 } ) ;
doormen.not( false , { "max-length": 3 } ) ;
```

min-length + max-length filter should validate accordingly, data that do not have a length should throw.

```js
doormen( "abc" , { "min-length": 3 , "max-length": 5 } ) ;
doormen( "abcd" , { "min-length": 3 , "max-length": 5 } ) ;
doormen( "abcde" , { "min-length": 3 , "max-length": 5 } ) ;
doormen.not( "abcdef" , { "min-length": 3 , "max-length": 5 } ) ;
doormen.not( "ab" , { "min-length": 3 , "max-length": 5 } ) ;
doormen.not( "" , { "min-length": 3 , "max-length": 5 } ) ;

doormen.not( 1 , { "min-length": 3 , "max-length": 5 } ) ;
doormen.not( 1 , { "max-length": 0 } ) ;
doormen.not( NaN , { "min-length": 3 , "max-length": 5 } ) ;
doormen.not( true , { "min-length": 3 , "max-length": 5 } ) ;
doormen.not( false , { "min-length": 3 , "max-length": 5 } ) ;
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

'not-in' filter should validate if the value is listed.

```js
doormen( 10 , { "not-in": [ 1,5,7 ] } ) ;
doormen.not( 5 , { "not-in": [ 1,5,7 ] } ) ;
doormen.not( 1 , { "not-in": [ 1,5,7 ] } ) ;
doormen( 0 , { "not-in": [ 1,5,7 ] } ) ;
doormen( -10 , { "not-in": [ 1,5,7 ] } ) ;
doormen( Infinity , { "not-in": [ 1,5,7 ] } ) ;
doormen.not( Infinity , { "not-in": [ 1,5,Infinity,7 ] } ) ;
doormen( -Infinity , { "not-in": [ 1,5,7 ] } ) ;
doormen( NaN , { "not-in": [ 1,5,7 ] } ) ;
doormen.not( NaN , { "not-in": [ 1,5,NaN,7 ] } ) ;

doormen.not( true , { "not-in": [ 1,true,5,7 ] } ) ;
doormen( true , { "not-in": [ 1,5,7 ] } ) ;
doormen.not( false , { "not-in": [ 1,false,5,7 ] } ) ;
doormen( false , { "not-in": [ 1,5,7 ] } ) ;

doormen( "text" , { "not-in": [ 1,5,7 ] } ) ;
doormen.not( "text" , { "not-in": [ 1,"text",5,7 ] } ) ;
doormen.not( "text" , { "not-in": [ "string", "text", "bob" ] } ) ;
doormen( "bobby" , { "not-in": [ "string", "text", "bob" ] } ) ;
doormen.not( "" , { "not-in": [ "string", "text", "" ] } ) ;
doormen( "" , { "not-in": [ "string", "text", "bob" ] } ) ;
```

<a name="properties-and-recursivity"></a>
# Properties and recursivity
when 'properties' is an array, it should check if the value has all listed properties.

```js
var schema = {
	type: 'object',
	properties: [ 'a' , 'b' ]
} ;

doormen( { a: 1, b: 'text' } , schema ) ;
doormen( { a: 'text', b: 3 } , schema ) ;
doormen( { A: 'TEXT', a: 1, b: 'text' , c: 5 } , schema ) ;
doormen.not( { b: 'text' } , schema ) ;
doormen.not( { a: 1 } , schema ) ;
```

when 'properties' is an object, it performs the check recursively for each listed child.

```js
var schema = {
	type: 'object',
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

<a name="common-sanitizers"></a>
# Common sanitizers
should sanitize to 'to-number' accordingly.

```js
doormen.equals( doormen( 0 , { sanitize: 'to-number' } ) , 0 ) ;
doormen.equals( doormen( '0' , { sanitize: 'to-number' } ) , 0 ) ;
doormen.equals( doormen( 1 , { sanitize: 'to-number' } ) , 1 ) ;
doormen.equals( doormen( '1' , { sanitize: 'to-number' } ) , 1 ) ;
```

