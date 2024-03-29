/*
	Doormen

	Copyright (c) 2015 - 2021 Cédric Ronvel

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

