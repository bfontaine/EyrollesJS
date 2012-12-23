var requests = require( './requests' ),

    details_sep = /:|\n|(?:\s{5,})/,
    colon_re    = /\s*:\s*/,

    // Parser shortcut
    getPrice = function( e ) {
        return parseFloat( e.text().replace( ',', '.' ) );
    };

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

    author.name = $( '#contenu h1' ).text().split( colon_re )[1].trim();

    author.books = $( 'li.listePrincipale .centre h2 a' ).map(function( i, a ) {

        return new Book( a.attribs.href );//.fetch();

    });

});

var Book = createEntity( '', function( book, $ ) {

    var infos        = $( '#contenu' ),
        desc         = infos.find( '#description' ),
        minis        = desc.find( '.mini-info' ),

        authors      = minis.first().children().first().find( 'a' ),
        publisher    = minis.first().children().last().find( 'a' ),
        details      = $( '.tab-content' ).last()
                                .find( 'ul' ).text().split( details_sep );

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

    book.type   = details[3].trim();
    book.isbn13 = details[12].trim();
    book.ean13  = details[14].trim();
    book.isbn10 = details[16].trim();
    book.format = details[24].trim();
    book.weight = parseInt(details[28]);

    book.prices = {
        website: getPrice( $( '.prixremise' ).children() ),
        bookstore: getPrice( $( '.prixediteur' ).children() )
    };

    book.isAvailable = $( '.period .spacer' )
                                .text().indexOf( 'indisponible' ) === -1;

});

var BooksList = createEntity( '/Accueil/Recherche/', function( books, $ ) {

    books.results = $( 'li.listePrincipale .centre h2 a' ).map(function( i, a ) {

        return new Book( a.attribs.href ).fetch();

    });

});

var Publisher = createEntity( '', function( publisher, $ ) {

    publisher.name = $( '#contenu h1' ).text().split( colon_re )[1].trim();

    publisher.books = $( 'li.listePrincipale .centre h2 a' ).map(function( i, a ) {

        return new Book( a.attribs.href );//.fetch();

    });

});

exports.Author = Author;
exports.Book = Book;
exports.BooksList = BooksList;
exports.Publisher = Publisher;
