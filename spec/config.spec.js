var conf = require( '../src/config' ).vars;

describe( 'configuration', function() {

    it( 'should have a `vars` attribute', function() {

        expect( conf ).toBeDefined();
        expect( conf ).not.toBeNull();

    });

    it( 'should have a variables.urls.root attribute', function() {

        expect( conf.urls ).toBeDefined();
        expect( conf.urls.root ).toBeDefined();

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

        it( 'should set boolean config variables when called with one string',
                function() {

            api.set( 'foo' )
               .set( 'bar' );

            expect( conf.globals ).toEqual({ 'foo': true, 'bar': true });

        });

        it( 'should set config variables when called with one object',
                function() {

            api.set({ 'foo': 42, 'bar': {} });

            expect( conf.globals ).toEqual({ 'foo': 42, 'bar': {} });

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

    });

    describe( 'has a `.unset()` method, which', function() {

        expect( typeof api.unset ).toEqual( 'function' );

        it( 'should unset a variable if called with its name', function() {

            conf.globals.foo = true;

            api.unset( 'foo' );
            expect( conf.globals.foo ).not.toBeDefined();

        });

        it( 'should unset multiple variables if called with multiple args',
                function() {

            conf.globals.bar = conf.globals.foo = true;

            api.unset( 'bar', 'foo' );

            expect( conf.globals.foo ).not.toBeDefined();
            expect( conf.globals.bar ).not.toBeDefined();

        });

        it( 'should unset multiple variables if called with one array',
                function() {

            conf.globals.bar = conf.globals.foo = true;

            api.unset([ 'foo', 'bar' ]);

            expect( conf.globals.foo ).not.toBeDefined();
            expect( conf.globals.bar ).not.toBeDefined();

        });


    });

    describe( 'has a `.getVar()` method, which', function() {

        expect( typeof api.getVar ).toEqual( 'function' );

        it( 'should return a variable value', function() {

            conf.globals.foo = 'bar';

            expect( api.getVar( 'foo' ) ).toEqual( 'bar' );

        });

    });

});
