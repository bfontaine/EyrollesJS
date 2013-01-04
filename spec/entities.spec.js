var entities = require( '../src/entities' ),
    conf     = require( '../src/config' ).vars,
    iconv    = require( 'iconv-lite' ),
    nock     = require( 'nock' ),
    
    root_url = 'http://www.eyrolles.com';

describe( 'BooksList', function() {

    it( 'should have a .fetch method', function() {

            var bl = new entities.BooksList();

            expect( typeof bl.fetch ).toEqual( 'function' );

    });

    it( 'should have a .fetchAll method', function( done ) {

            var bl   = new entities.BooksList(),
                book = new entities.Book( 'foo' ),
                body = '<p id="contenu"><p id="description"><h1>Foo</h1>'
                     + '<h2>Bar</h2></p></p>';

            expect( typeof bl.fetchAll ).toEqual( 'function' );

            bl.push( book );

            nock( root_url )
                .get( '/foo' ).reply( 200, iconv.encode( body, 'latin1' ) );

            bl.fetchAll({
                callback: function( books ) {

                    expect( books ).toBeDefined();
                    expect( books ).not.toBeNull();
                    expect( books.length ).toEqual( 1 );

                    expect( books[0].title ).toEqual( 'Foo' );
                    expect( books[0].short_desc ).toEqual( 'Bar' );
                    expect( books[0].exists ).toBeTruthy();

                    done();

                }
            });
        
    });

    it( 'should behave like an array', function( done ) {

        var bl = new entities.BooksList( 'Accueil/Recherche/?q=foo' );

        expect( entities.BooksList.prototype ).toEqual( [] );
        expect( bl.length ).toEqual( 0 );

        nock( root_url )
           .get( '/Accueil/Recherche/?ajax=on&q=foo&page=1' )
               .replyWithFile( 200,
                   __dirname + '/mocks/search-for-foo-p1.html' );

        bl.fetch({

            limit: 5,

            callback: function() {

                expect( bl.length ).toEqual( 5 );
                expect( bl[0] instanceof entities.Book ).toBeTruthy();

                done();

            }

        });

    });

    it( 'should use pagination to fetch large results', function( done ) {

        var _n = nock( root_url ), p;

        for ( p = 1; p <= 5; p++ ) {

            _n = _n.get( '/Accueil/Recherche/?ajax=on&q=foo&page=' + p )
                    .replyWithFile( 200,
                        __dirname + '/mocks/search-for-foo-p' + p + '.html' );

        }

        var bl = new entities.BooksList( 'Accueil/Recherche/?q=foo' );

        bl.fetch({

            limit: false,

            callback: function() {

                expect( bl.length ).toEqual( 91 );

                done();

            }

        });

    });

    it( 'can be limited using the "limit" option', function( done ) {

        var _n = nock( root_url ), p;

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

                expect( bl.length ).toEqual( 30 );

                done();

            }

        });

    });

    it( 'should look at the "offset" option', function( done ) {

        var _n = nock( root_url ), p;

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

                expect( bl.length ).toEqual( 25 );

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

        nock( root_url )
            .get( '/' + path )
                .replyWithFile( 200, __dirname + '/mocks/' + isbn + '.html' );

        book.fetch({ callback: function( b ) {

            expect( b ).not.toBeNull();

            expect( b.title ).toEqual( 'Le guide pratique Twitter' );
            expect( b.short_desc ).toEqual( 'Publier des tweets, gérer les'
                                          + ' abonnés - Services et applis'
                                          + ' pour doper Twitter - Maîtriser'
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

            expect( b.exists ).toBeTruthy();

            done();

        }});

    });

    it( 'should not fail '
      + 'if the website doesn’t have all informations', function( done ) {

        var body = '<p id="contenu"><p id="description"><h1>Foo</h1></p></p>',
            book = new entities.Book( 'foo' );

        nock( root_url )
            .get( '/foo' )
            .reply( 200, iconv.encode( body, 'latin1' ) );

        book.fetch({ callback: function( b ) {

            expect( b ).not.toBeNull();
            expect( b.title ).toEqual( 'Foo' );
            expect( b.exists ).toBeTruthy();

            done();

        }});

    });

});

describe( 'Caching', function() {

    beforeEach(function() {

        conf.globals.cache = true;

    });

    it( 'should work on books', function( done ) {

        var isbn = '9782212136081',
            path = 'Informatique/Livre/le-guide-pratique-twitter-' + isbn,
            book = new entities.Book( path ),
            
            url_called_again = false;

        nock( root_url )
            .get( '/' + path )
                .replyWithFile( 200, __dirname + '/mocks/' + isbn + '.html' );


        book.fetch({

            callback: function ( b ) {

                expect( b.exists ).toBeTruthy();

                nock( root_url )
                    .get( '/' + path )
                        .reply( 200, function() {
                            url_called_again = true; return '-';
                        });

                book.fetch({

                    callback: function() {

                        expect( url_called_again ).toBeFalsy();
                        done();

                    }

                });

            }

        });

    });

});
