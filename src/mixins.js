var utils = require( './utils' );


/**
 * Call it in a prototype definition:
 *     mixins.fetchAndParse( this );
 *
 *  It add a .fetch() method to `this`, which
 *  calls utils.getURL with `this.url`, and then
 *  extends `this` with some values parsed from the response’s
 *  body.
 **/
exports.fetchAndParse = function( that ) {

    var fetchAndParseFn = function() {

        if ( !this.url ) {
            throw new Error( 'No URL provided!' );
        }

        utils.getURL( this.url, function( $ ) {

            // parseBook, parseAuthor, etc
            utils.parser[ 'parse' + this.constructor.name ]( this, $ );

        });

        return this;

    };

    that.fetch = fetchAndParseFn.bind( that );
};

exports.extends = function( that, obj ) {

    var k;

    for ( k in obj ) {
        if ( obj.hasOwnProperty( k ) ) {

            that[ k ] = obj[ k ];

        }
    }

};
