var entities = require( '../src/entities' );

describe( 'Exported objects', function() {

    var expected_entities = [
        'Author', 'Book', 'BooksList', 'Publisher' ],
        i = 0, len = expected_entities.length, e;

    for (; i<len; i++) {

        e = expected_entities[ i ];

        it( 'should include `' + e + '`', function() {
            
            expect( entities[ e ] ).toBeDefined();        
            expect( entities[ e ] ).not.toBeNull();

        });

    }

});
