var requests = require( './requests' ),
    utils    = require( './utils' ),

    colon_re    = /\s*:\s*/,
    no_img_re   = /\/novisuel\.gif$/,
    hyphen_re   = /-/g,

    remove_hyphens = function( s ) { return s.replace( hyphen_re, '' ); },

    // Parser shortcuts
    getPrice = function( e ) {
        return parseFloat( e.text().replace( ',', '.' ) );
    },
    
    trim = function( s ) {
        return s ? s.trim() : '';
    },

    details_labels = {

        // website label: [ api label, map func ]
        'Type produit': [ 'type',   trim ],
        'ISBN13':       [ 'isbn13', remove_hyphens ],
        'EAN13':        [ 'ean13',  remove_hyphens ],
        'ISBN10':       [ 'isbn10', remove_hyphens ],
        'Format':       [ 'format', trim ],
        'Poids':        [ 'weight', function( w ) { return parseInt( w, 10 ); } ]

    };

function parseBooksList( $ ) {

    if ( $( '#noSearchResult' ).length > 0 || $( '.noresult' ).length > 0 ) {

        return [];

    }

    return $( 'li.listePrincipale .centre h2 a' ).map(function( _, a ) {

        return new Book( a.attribs.href, { title: $(a).text() } );

    });

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
function createEntity( baseUrl, parser, entity_opts ) {

    return function( path, attrs ) {

       var that = this, fetching = false;

       if (!( that instanceof arguments.callee )) {
           return new arguments.callee( path );
       }

       that.fetch = function( opts ) {

           if ( fetching ) { return; }
           else { fetching = true; }

           if ( opts === undefined ) {

               opts = {};

           } else if ( typeof opts === 'function' ) {

               opts = { callback: opts };

           }

           requests.parseBody( baseUrl + path, function( $ ) {

               parser( that, $, {

                   limit:  opts.limit,
                   offset: opts.offset

               });

               fetching = false;

               if ( typeof opts.callback === 'function' ) {

                   opts.callback( that );

               }

           });

           return that;
       };

       utils.extends( that, attrs );
    };

}

var Author = createEntity( '', function( author, $ ) {

    author.name = $( '#contenu h1' ).text().split( colon_re )[1].trim();

    author.books = parseBooksList( $ );
});

var Book = createEntity( '', function( book, $ ) {

    if ( $( '#noSearchResult' ).length > 0 ) {

        return book.exists = false;

    }

    var infos        = $( '#contenu' ),
        desc         = infos.find( '#description' ),
        minis        = desc.find( '.mini-info' ),

        img_src      = infos.find( 'img.livre' ).attr( 'src' ),

        authors      = minis.first().children().first().find( 'a' ),
        publisher    = minis.first().children().last().find( 'a' ),
        details      = $( '.tab-content' ).last()
                                .find( 'ul li' )
                                    .map(function( _, e ) {
                                        return $( e ).text().split( colon_re ); }),

        i, len,
        d_website_label, d_label, d_value, d_fn;

    book.img         = no_img_re.test( img_src ) ? null : img_src;
    book.title       = desc.find( 'h1' ).text();
    book.short_desc  = desc.find( 'h2' ).first().text();
    book.pages_count = parseInt( minis.last().children()
                                        .first().text().split( ':' )[1] );
    book.date        = minis.last().children()[1].children[1].data.trim();

    book.publisher   = new Publisher( publisher.attr( 'href' ) );

    book.authors     = authors.map(function( _, a ) {

        return new Author( a.attribs.href );

    });

    if ( book.authors.length === 1 ) {

        // syntaxic sugar
        book.author = book.authors[0];

    }

    for ( i = 0, len = details.length; i < len; i++ ) {

        d_website_label = details[ i ][0];
        d_value = details[ i ][1]

        if ( details_labels.hasOwnProperty( d_website_label ) ) {

            d_label = details_labels[ d_website_label ][ 0 ];
            d_fn =    details_labels[ d_website_label ][ 1 ];

            book[ d_label ] = d_fn( d_value );

        }


    }

    book.prices = {
        website: getPrice( $( '.prixremise' ).children() ),
        bookstore: getPrice( $( '.prixediteur' ).children() )
    };

    book.isAvailable = $( '.period .spacer' )
                                .text().indexOf( 'indisponible' ) === -1;

    return book.exists = true;
});

var BooksList = function BL( path, attrs ) {

       var that = this;

       if (!( that instanceof arguments.callee )) {
           return new arguments.callee( path );
       }

       that.length = 0;

       that.fetch = function( opts ) {

           if ( opts === undefined ) {

               opts = {};

           } else if ( typeof opts === 'function' ) {

               opts = { callback: opts };

           }

           requests.paginate( path, {

               limit: opts.limit,
               offset: opts.offset,
               parser: parseBooksList,
               callback: function( books ) {

                   var i   = 0,
                       len = books.length;

                   for (; i < len; i++ ) {

                        that[ i ] = books[ i ];

                   }

                   that.length = len;

                   if ( typeof opts.callback === 'function' ) {

                       opts.callback( that );

                   }

               },
               error: opts.error

           });

       };

       that.fetchAll = function( opts ) {
           //TODO
       };

}

BooksList.prototype = new Array();


var Publisher = createEntity( '', function( publisher, $ ) {

    publisher.name = $( '#contenu h1' ).text().split( colon_re )[1].trim();

    publisher.books = parseBooksList( $ );

});

exports.Author = Author;
exports.Book = Book;
exports.BooksList = BooksList;
exports.Publisher = Publisher;
