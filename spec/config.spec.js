var conf = require( '../src/config' ),
    api  = require( '../src/api' );

describe( 'configuration', function() {

    it( 'should have a `variables` attribute', function() {

        expect( conf.variables ).toBeDefined();
        expect( conf.variables ).not.toBeNull();

    });

    it( 'should have a variables.urls.root attribute', function() {

        expect( conf.variables.urls ).toBeDefined();
        expect( conf.variables.urls.root ).toBeDefined();

    });

});

describe( 'API module', function() {

    beforeEach(function() {

        conf.globals = {};

    });

    describe( 'has a `.set()` method, which', function() {

        expect( typeof api.set ).toEqual( 'function' );

        it( 'should return the API module', function() {

            expect( api.set() ).toEqual( api );
            expect( api.set().set() ).toEqual( api );

        });

        it( 'should set boolean config variables when called with 1 string',
                function() {

            api.set( 'foo' )
               .set( 'bar' );

            expect( conf.globals ).toEqual({ 'foo': true, 'bar': true });

        });

        it( 'should set key/value config variables when called with 2 args',
                function() {

            api.set( 'foo', 'bar' )
               .set( 'bar', 42 );

            expect( conf.globals ).toEqual({ 'foo': 'bar', 'bar': 42 });

        });

        it( 'should override existing values', function() {

            api.set( 'foo', 'bar' )
               .set( 'foo', 42 );

            expect( conf.globals ).toEqual({ 'foo': 42 });

        });

        //TODO called with 1 object

    });

    it( 'should have a `.unset()` method', function() {

        expect( typeof api.unset ).toEqual( 'function' );

        //TODO

    });

    it( 'should have a `.getVar()` method', function() {

        expect( typeof api.getVar ).toEqual( 'function' );

        //TODO
    });

});
