var entities = require( './entities' );

var SearchQuery = function SearchQuery( str ) {

    this.results = new entities.BooksList(
        '?q=' + encodeURIComponent( str )
    ).fetch();

};

exports.search = function( str ) {
    return new SearchQuery( str );
};
