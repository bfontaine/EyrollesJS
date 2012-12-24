var conf = require( '../src/config' );

describe( 'configuration', function() {

    it( 'should have a `variables` attribute', function() {

        expect( conf.variables ).toBeDefined();
        expect( conf.variables ).not.toBeNull();
        expect( conf.variables.urls ).toBeDefined();

    });

});
