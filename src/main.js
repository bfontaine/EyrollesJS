var entities = require( './entities' );

var SearchQuery = function SearchQuery( str ) {

    var that = this;

    that.results = [];

    new entities.BooksList(

        'Accueil/Recherche/?q=' + encodeURIComponent( str )

    ).fetch({

        limit: 20,

        callback: function( bl ) {
             that.results = bl.books;
        }

    });

};

exports.search = function( str ) {
    return new SearchQuery( str );
};
