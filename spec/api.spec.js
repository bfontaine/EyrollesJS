var api  = require( '../src/api' ),
    nock = require( 'nock' );


describe( '.getBookByISBN function', function() {

    it( 'should fetch the book informations if the ISBN code is ok', function( done ) {

        var isbn = '9782212136081',

            url1 = '/Entreprise/Livre/le-guide-pratique-twitter-' + isbn,
            url2 = '/Informatique/Livre/le-guide-pratique-twitter-' + isbn;

        nock( 'http://www.eyrolles.com' )

            .get( '/Accueil/Recherche/?q=' + isbn )
                .reply( 302, '', { Location: url1 })

            .get( url1 )
                .reply( 301, '', { Location: url2 })

            .get( url2 )
                .replyWithFile( 200, __dirname + '/mocks/' + isbn + '.html' );


        api.getBookByISBN({

            query: isbn,
            callback: function( b ) {

                expect( b.title ).toEqual( 'Le guide pratique Twitter' );
                expect( b.isbn13 ).toEqual( isbn );

                done();

            }

        });

    });

    it( 'should gives a falsy book.exists value '
      + 'if the ISBN code is not a correct string', function( done ) {

        var isbn = '9782212136080',

            url1 = '/Accueil/Recherche/recherche_vad.php?q=' + isbn,
            url2 = '/Accueil/Recherche/?q=' + isbn + '&vad=false';

        nock( 'http://www.eyrolles.com' )

            .get( '/Accueil/Recherche/?q=' + isbn )
                .reply( 302, '', { Location: url1 })

            .get( url1 )
                .reply( 301, '', { Location: url2 })

            .get( url2 )
                .replyWithFile( 200, __dirname + '/mocks/' + isbn + '.html' );


        api.getBookByISBN({

            query: isbn,
            callback: function( b ) {

                expect( b.exists ).toBeFalsy();

                done();

            }

        });


    });


});
