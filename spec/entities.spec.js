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
