var Author, Book, Publisher;

// FIXME this is used to avoid a dependency loop:
// objects → parser
// parser → objects
exports.setObjs = function( A, B, P ) {

    Author    = A;
    Book      = B;
    Publisher = P;

}

function text( e, n ) {

    if ( n === undefined ) { n = 0; }

    var firstchild = e && e.children[ n ];

    return firstchild ? firstchild.data : '';

};

exports.parseBook = function( book, $ ) {

    _$ = $;

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
    book.date        = text( minis.last().children()[1], 1 ).trim();

    book.publisher   = new Publisher({
        url: publisher.attr( 'href' ),
        name: text( publisher )
    });

    book.authors     = authors.map(function( i, a ) {

        return new Author({
            url: a.attribs.href,
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

        return new Book({ url: a.attribs.href }).fetch();

    });

};
