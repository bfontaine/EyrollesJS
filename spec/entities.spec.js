var entities = require( '../src/entities' ),
    nock     = require( 'nock' );

describe( 'BooksList', function() {

    it( 'should have a .fetch method', function() {

            var bl = new entities.BooksList();

            expect( typeof bl.fetch ).toEqual( 'function' );

    });

    it( 'should use pagination to fetch large results', function( done ) {

        var _n = nock( 'http://www.eyrolles.com' ), p;

        for ( p = 1; p <= 5; p++ ) {

            _n = _n.get( '/Accueil/Recherche/?ajax=on&q=foo&page=' + p )
                    .replyWithFile( 200,
                        __dirname + '/mocks/search-for-foo-p' + p + '.html' );

        }

        var bl = new entities.BooksList( 'Accueil/Recherche/?q=foo' );

        bl.fetch({

            limit: false,

            callback: function() {

                expect( bl.books ).toBeDefined();
                expect( bl.books.length ).toEqual( 91 );

                done();

            }

        });

    });

    it( 'can be limited using the "limit" option', function( done ) {

        var _n = nock( 'http://www.eyrolles.com' ), p;

        _n.get( '/Accueil/Recherche/?ajax=on&q=foo&page=1' )
            .replyWithFile( 200,
                    __dirname + '/mocks/search-for-foo-p1.html' )
          .get( '/Accueil/Recherche/?ajax=on&q=foo&page=2' )
            .replyWithFile( 200,
                    __dirname + '/mocks/search-for-foo-p2.html' );

        var bl = new entities.BooksList( 'Accueil/Recherche/?q=foo' );

        bl.fetch({

            limit: 30,

            callback: function() {

                expect( bl.books ).toBeDefined();
                expect( bl.books.length ).toEqual( 30 );

                done();

            }

        });

    });

    it( 'should look at the "offset" option', function( done ) {

        var _n = nock( 'http://www.eyrolles.com' ), p;

        _n.get( '/Accueil/Recherche/?ajax=on&q=foo&page=1' )
            .replyWithFile( 200,
                    __dirname + '/mocks/search-for-foo-p1.html' )
          .get( '/Accueil/Recherche/?ajax=on&q=foo&page=2' )
            .replyWithFile( 200,
                    __dirname + '/mocks/search-for-foo-p2.html' );

        var bl = new entities.BooksList( 'Accueil/Recherche/?q=foo' );

        bl.fetch({

            limit: 30,
            offset: 5,

            callback: function() {

                expect( bl.books ).toBeDefined();
                expect( bl.books.length ).toEqual( 25 );

                done();

            }

        });

    });

});

describe( 'Book object', function() {

    it( 'should work with the "new" keyword and without it', function() {

        expect( entities.Book() instanceof entities.Book ).toBeTruthy();
        expect( new entities.Book() instanceof entities.Book ).toBeTruthy();

    });

    it( 'should fetch informations from the website', function( done ) {

        var isbn = '9782212136081',
            path = 'Informatique/Livre/le-guide-pratique-twitter-' + isbn,
            book = new entities.Book( path );

        nock( 'http://www.eyrolles.com' )
            .get( '/' + path )
                .replyWithFile( 200, __dirname + '/mocks/' + isbn + '.html' );

        book.fetch({ callback: function( b ) {

            expect( b ).not.toBeNull();

            expect( b.title ).toEqual( 'Le guide pratique Twitter' );
            expect( b.short_desc ).toEqual( 'Publier des tweets, gérer les'
                                          + ' abonnés - Services et applis'
                                          + 'pour doper Twitter - Maîtriser'
                                          + ', échanger, motiver' );
            expect( b.authors.length ).toEqual( 1 );
            expect( b.authors[0] ).toEqual( b.author );
            expect( b.pages_count ).toEqual( 158 );
            expect( b.date ).toEqual( '30/11/2012' );

            expect( b.img ).toEqual( 'http://static.eyrolles.com/img/2/2/1/'
                                   + '2/1/3/6/0/9782212136081_h180.gif' );

            expect( b.type ).toEqual( 'Ouvrage' );
            expect( b.isbn13 ).toEqual( isbn );
            expect( b.ean13 ).toEqual( isbn );
            expect( b.isbn10 ).toEqual( isbn.slice( 3, -1 ) + '0' );
            expect( b.weight ).toEqual( 740 );

            done();

        }});

    });


});
