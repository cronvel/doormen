

# Doormen

Validate, sanitize and assert.

Early alpha.

** /!\ This documentation is still a Work In Progress /!\ **



## Basic validation

* sanitize `Array` of `string` the sanitizer's name to apply before any type checking
* optional `boolean` if the data can be `null` or `undefined` as an alternative to the following type
* type `string` the name of the type checker
* min
* max
* min-length
* max-length
* in
* not-in
* properties

* only-properties



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
* date: the data should be an instance of `Date`
* buffer: the data should be a Node.js `Buffer`
                                        

Common meta types:

* real: a `number` that is not `NaN` nor +/- `Infinity`
* integer: a `number` that is not `NaN` nor +/- `Infinity`, and that do not have decimal part



## Sanitizers

* to-number: try to convert a `string` to a `number`




