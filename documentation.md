

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
* number: the data should be a `number`. **NOTE** that `Infinity` and `NaN` are ok, so you may consider using *real*/*float*
  instead of *number* in almost all cases
* string: the data should be a `string`
* object: the data should be an `Object`
* function: the data should be a `Function`


Javascript/Node.js built-in types:

* array: the data should be an `Array`
* error: the data should be an instance of `Error`
* date: the data should be an instance of `Date`
* regexp: a regular expression
* buffer: the data should be a Node.js `Buffer`
                                        

Common meta types:

* unset: `null` or `undefined`
* real or float: a `number` that is not `NaN` nor +/- `Infinity`
* integer: a `number` that is not `NaN` nor +/- `Infinity`, and that do not have decimal part
* hex: a `string` representing an hexadecimal number, having only 0-9, a-f and A-F characters
* strictObject: an object that is not an array
* looseObject: object-like: object or function


Internet:

* ipv4: a `string` that is a IPv4 address
* ipv6: a `string` that is a IPv6 address
* ip: an IPv4 or IPv6 address
* hostname: a `string` that is a valid hostname (domain + subdomain)
* host: a hostname or an ip address
* url: a `string` that is a valid URL (generic URL) including the scheme
* weburl: a valid web/internet URL, a subset of the URL type
* email: a `string` that is a valid email address


Misc:

* schema: an `object` which is a valid doormen schema
* mongoId: an `object` which is a MongoDB's `ObjectId` OR a `string` that is a correct `ObjectId` string representation



## Sanitizers

Common cast:

* toNumber: try to convert to a `number` (mostly from `string`)
* toReal or toFloat: try to convert to a float/real (not much difference with `toNumber`)
* toInteger: try to convert to an `integer`, rounding the number if necessary
* toString: try to convert to a `string`
* toBoolean: try to convert to a `boolean` very loosely, so it accepts strings like true/false,
  yes/no, on/off or numbers like 1/0, or fallback to truthy/falsy values.
* toArray: try to convert to an `array`, non-array are converted to an array with a single element
* toDate: try to convert to a `Date` (`number` are timestamp, `string` are parsed, `object` are considered like a Date-object)
* nullToUndefined: transform `null` to `undefined`


String modifiers:

* trim: trim the string, removing whitespace at the beginning and the end
* toUpperCase: transform all characters into their upper-case counterparts
* toLowerCase: transform all characters into theier lower-case counterparts
* capitalize: transform to title case, each word starts with an upper-case
* titleCase: transform to title case, each word starts with an upper-case following lower-case characters (except ALL-CAPS words)
* latinize: transform letter to latin (remove accent, transform modified letters to their latin counterparts)
* dashToCamelCase: transform identifiers having word separated by dash/hyphen to camelCase


Enforcers:

* resize: resize a string if it does not match the required length/minLength/maxLength (truncate,
  or use leftPadding/rightPadding properties of the schema)
* removeExtraProperties: remove extra-properties from the object that are not in the schema (clone it, not in-place)


Misc:

* mongoId: convert a string to a MongoDB's `ObjectId` if possible

