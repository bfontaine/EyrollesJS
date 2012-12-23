var entities = require( './entities' );

var SearchQuery = function SearchQuery( str ) {

    this.books = new entities.BooksList(
        '?q=' + encodeURIComponent( str )
    ).fetch();

};

exports.search = function( str ) {
    return new SearchQuery( str );
};
