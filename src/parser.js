

var objs = require( './objects' ),

    // shortcut
    text = function( e ) { return e.children[0].data; },

    Author    = objs.Author,
    Book      = objs.Book,
    Publisher = objs.Publisher;


exports.parseBook = function( book, $ ) {

    var infos        = $( '.contenu' ),
        desc         = $( '#description', infos ),
        minis        = $( '.mini-info', desc ),

        authors      = $( 'a', minis.first().children[0] ),
        publisher    = $( 'a', minis.first().children[1] );

    book.img         = $( 'img.livre', infos ).attr( 'src' );
    book.title       = text( $( 'h1', desc ).first() );
    book.short_desc  = text( $( 'h2', desc ).first() );
    book.pages_count = parseInt(minis.last().children[0].data);
    book.date        = minis.last().children[1].data;

    book.publisher   = new Publisher({
        url: publisher.attr( 'href' ),
        name: text( publisher )
    });

    book.authors     = authors.map(function( i, a ) {

        return new Author({
            url: a.attr( 'href' ),
            name: text( a )
        });

    });

    if ( book.authors.length === 1 ) {

        // syntaxic sugar
        book.author = book.authors[0];

    }

    // TODO add params (cf '.tab-content' )

    return book;

};

exports.parseAuthor = function( author, $ ) {
    //TODO

    return author;
};

exports.parsePublisher = function( publisher, $ ) {
    //TODO

    return publisher;
};

// parse books query’s results
exports.parseBooks = function( $ ) {

    return $( 'li.listePrincipale .centre h2 a' ).map(function( i, a ) {

        return new Book({ url: e.src}).fetch();

    });

};
