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

describe( 'copy function', function() {

    it( 'should work on every type', function() {

        expect( utils.copy( null ) ).toEqual( {} );
        expect( utils.copy( undefined ) ).toEqual( {} );
        expect( utils.copy( 0 ) ).toEqual( {} );
        expect( utils.copy( true ) ).toEqual( {} );
        expect( utils.copy( false ) ).toEqual( {} );
        expect( utils.copy( [ 42 ] ) ).toEqual( { 0: 42 } );
        expect( utils.copy( { a:'b' } ) ).toEqual( { a:'b' } );
        expect( utils.copy( /e/ ) ).toEqual( {} );
        expect( utils.copy( function(){} ) ).toEqual( {} );

    });

    it( 'should copy object’s vars', function() {

        var original = { a: 42 },
            copy     = utils.copy( original );

        expect( 'a' in copy ).toBeTruthy();
        expect( copy.a ).toEqual( original.a );
        expect( copy.hasOwnProperty( 'a' ) ).toBeTruthy();

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

describe( 'isArray function', function() {

    it( 'should return `false` for non-arrays', function() {

        expect( utils.isArray( 42 ) ).toBeFalsy();
        expect( utils.isArray( false ) ).toBeFalsy();
        expect( utils.isArray( true ) ).toBeFalsy();
        expect( utils.isArray( undefined ) ).toBeFalsy();
        expect( utils.isArray( null ) ).toBeFalsy();
        expect( utils.isArray( {} ) ).toBeFalsy();
        expect( utils.isArray( /e/ ) ).toBeFalsy();
        expect( utils.isArray( function(){} ) ).toBeFalsy();

    });

    it( 'should return `true` for arrays', function() {

        expect( utils.isArray( [] ) ).toBeTruthy();
        expect( utils.isArray( new Array() ) ).toBeTruthy();


    });

    it( 'should return `true` for fake arrays', function() {

        expect( utils.isArray({
            length: 12,
            splice: function(){}
        }) ).toBeTruthy();


    });

});
