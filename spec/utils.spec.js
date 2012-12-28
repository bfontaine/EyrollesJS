var utils = require( '../src/utils' );


describe( 'clone function', function() {

    it( 'should work on every type', function() {

        expect( utils.clone( null ) ).toEqual( {} );
        expect( utils.clone( undefined ) ).toEqual( {} );
        expect( utils.clone( 0 ) ).toEqual( {} );
        expect( utils.clone( true ) ).toEqual( {} );
        expect( utils.clone( false ) ).toEqual( {} );
        expect( utils.clone( [] ) ).toEqual( {} );
        expect( utils.clone( {} ) ).toEqual( {} );
        expect( utils.clone( /e/ ) ).toEqual( {} );
        expect( utils.clone( function(){} ) ).toEqual( {} );

    });

    it( 'should not copy object’s vars', function() {

        var original = { a: 42 },
            copy     = utils.clone( original );

        expect( 'a' in copy ).toBeTruthy();
        expect( copy.a ).toEqual( original.a );
        expect( copy.hasOwnProperty( 'a' ) ).toBeFalsy();

    });

});

describe( 'extends function', function() {

    it( 'should work on very type', function() {

        [

            utils.extends( {}, null )
          , utils.extends( {}, undefined )
          , utils.extends( {}, 0 )
          , utils.extends( {}, true )
          , utils.extends( {}, false )
          , utils.extends( {}, [] )
          , utils.extends( {}, {} )
          , utils.extends( {}, /e/ )
          , utils.extends( {}, function(){} ) 

        ].forEach(function( e ) {

            expect( e ).toEqual( {} );

        });

    });

    it( 'should work with one object', function() {

        expect( utils.extends( {}, { a:2 } ) ).toEqual({ a:2 });
        expect( utils.extends( {}, { b:'foo' } ) ).toEqual({ b:'foo' });

    });

    it( 'should work with multiple objects', function() {

        expect( utils.extends( {}, { a:2 }, {a:3} ) ).toEqual({ a:3 });
        expect( utils.extends( {}, { a:1 }, { b:'foo' } ) ).toEqual({ a:1, b:'foo' });

    });

});
