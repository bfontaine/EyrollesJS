var requests = require( './requests' ),

    details_sep = /:|\n|(?:\s{5,})/,
    colon_re    = /\s*:\s*/,
    no_img_re   = /\/novisuel\.gif$/,

    // Parser shortcuts
    getPrice = function( e ) {
        return parseFloat( e.text().replace( ',', '.' ) );
    },
    trim = function( s ) {
        return s ? s.trim() : '';
    };

function parseBooksList( $, opts ) {

    opts = opts || {};

    var prefetch = opts.prefetch;

    if ( $( '#noSearchResult' ).length > 0 || $( '.noresult' ).length > 0 ) {

        return [];

    }

    var books = $( 'li.listePrincipale .centre h2 a' ).map(function( i, a ) {

        b = new Book( a.attribs.href, { title: a.children[0].data } );

        return prefetch ? b.fetch( opts ) : b;

    });

    return books;
}

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

    return function( path, attrs ) {

       var that = this, attr;

       if (!( that instanceof arguments.callee )) {
           return new arguments.callee( path );
       }

       that.fetch = function( opts ) {

           requests.parseBody( baseUrl + path, function( $ ) {

               parser( that, $, opts );

           });

           return that;
       }

       for ( attr in attrs ) {
           if ( attrs.hasOwnProperty( attr ) ) {

                that[ attr ] = attrs[ attr ];

           }
       }

   };

}

var Author = createEntity( '', function( author, $, opts ) {

    author.name = $( '#contenu h1' ).text().split( colon_re )[1].trim();

    author.books = parseBooksList( $, opts );
});

var Book = createEntity( '', function( book, $, opts ) {

    var infos        = $( '#contenu' ),
        desc         = infos.find( '#description' ),
        minis        = desc.find( '.mini-info' ),

        img_src      = infos.find( 'img.livre' ).attr( 'src' ),

        authors      = minis.first().children().first().find( 'a' ),
        publisher    = minis.first().children().last().find( 'a' ),
        details      = $( '.tab-content' ).last()
                                .find( 'ul' ).text().split( details_sep ),

        a, prefetch  = opts && opts.prefetch;

    book.img         = no_img_re.test( img_src ) ? null : img_src;
    book.title       = desc.find( 'h1' ).text();
    book.short_desc  = desc.find( 'h2' ).first().text();
    book.pages_count = parseInt( minis.last().children()
                                        .first().text().split( ':' )[1] )
    book.date        = minis.last().children()[1].children[1].data.trim();

    book.publisher   = new Publisher( publisher.attr( 'href' ) );

    book.authors     = authors.map(function( i, a ) {

        a = new Author( a.attribs.href );

        return prefetch ? a.fetch( opts ) : a;

    });

    if ( book.authors.length === 1 ) {

        // syntaxic sugar
        book.author = book.authors[0];

    }

    book.type   = trim(details[3]);
    book.isbn13 = trim(details[12]);
    book.ean13  = trim(details[14]);
    book.isbn10 = trim(details[16]);
    book.format = trim(details[24]);
    book.weight = parseInt(details[28]);

    book.prices = {
        website: getPrice( $( '.prixremise' ).children() ),
        bookstore: getPrice( $( '.prixediteur' ).children() )
    };

    book.isAvailable = $( '.period .spacer' )
                                .text().indexOf( 'indisponible' ) === -1;

});

var BooksList = createEntity( '/Accueil/Recherche/', function( books, $, opts ) {

    books.results = parseBooksList( $, opts );

});

var Publisher = createEntity( '', function( publisher, $, opts ) {

    publisher.name = $( '#contenu h1' ).text().split( colon_re )[1].trim();

    publisher.books = parseBooksList( $, opts );

});

exports.Author = Author;
exports.Book = Book;
exports.BooksList = BooksList;
exports.Publisher = Publisher;
