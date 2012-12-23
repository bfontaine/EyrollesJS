/**
 * Call it in a prototype definition:
 *     mixins.fetchAndParse( this, parser, getURL );
 *
 *  It add a .fetch() method to `this`, which
 *  calls utils.getURL with `this.url`, and then
 *  extends `this` with some values parsed from the response’s
 *  body.
 **/
exports.fetchAndParse = function( that, parser, getURL ) {

    that.fetch = function fetchAndParseFn() {

        if ( !that.url ) {
            throw new Error( 'No URL provided!' );
        }

        getURL( that.url, function( $ ) {

            // parseBook, parseAuthor, etc
            parser[ 'parse' + that.constructor.name ]( that, $ );

        });

        return that;

    }
};
