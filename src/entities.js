var requests = require( './requests' );

/**
 * Return an object constructor for an entity. Entities
 * has a `fetch` function which retrieve their attributes
 * from an URL, and parse it.
 *
 * @baseUrl: the base URL for this entity
 * @parser: A function which take the current object and a cheerio object,
 * and extends the current object with parsed values.
 *
 * Example:
 *      createEntity( '/People/', function($, people){…} )
 *
 **/
function createEntity( baseUrl, parser ) {

   return function( path ) {

       var that = this, k;

       if (!( that instanceof arguments.callee )) {
           return new arguments.callee( path );
       }

       that.fetch = function() {

           requests.parseBody( baseUrl + path, function( $ ) {

               parser( that, $ );

           });

           return that;
       }

   };

}

var Author = createEntity( '', function( author, $ ) {
    //TODO
});

var Book = createEntity( '', function( book, $ ) {

    var infos        = $( '#contenu' ),
        desc         = infos.find( '#description' ),
        minis        = desc.find( '.mini-info' ),

        authors      = minis.first().children().first().find( 'a' ),
        publisher    = minis.first().children().last().find( 'a' );

    book.img         = infos.find( 'img.livre' ).attr( 'src' );
    book.title       = desc.find( 'h1' ).text();
    book.short_desc  = desc.find( 'h2' ).first().text();
    book.pages_count = parseInt( minis.last().children()
                                        .first().text().split( ':' )[1] )
    book.date        = minis.last().children()[1].children[1].data.trim();

    book.publisher   = new Publisher( publisher.attr( 'href' ) );

    book.authors     = authors.map(function( i, a ) {

        return new Author( a.attribs.href );

    });

    if ( book.authors.length === 1 ) {

        // syntaxic sugar
        book.author = book.authors[0];

    }

});

var BooksList = createEntity( '/Accueil/Recherche/', function( books, $ ) {

    // TODO handle pagination

    books.results = $( 'li.listePrincipale .centre h2 a' ).map(function( i, a ) {

        return new Book( a.attribs.href ).fetch();

    });

});

var Publisher = createEntity( '', function( publisher, $ ) {
    //TODO
});

exports.Author = Author;
exports.Book = Book;
exports.BooksList = BooksList;
exports.Publisher = Publisher;
