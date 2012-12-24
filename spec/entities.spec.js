var entities = require( '../src/entities' ),

    expected_entities = [
    'Author', 'Book', 'BooksList', 'Publisher' ],
    i, len = expected_entities.length, e;

describe( 'Exported objects', function() {

    for ( i = 0; i < len; i++ ) {

        e = expected_entities[ i ];

        it( 'should include `' + e + '`', function() {
            
            expect( entities[ e ] ).toBeDefined();        
            expect( entities[ e ] ).not.toBeNull();

        });

    }

});

for ( i = 0; i < len; i++ ) {

    e = expected_entities[ i ];

    describe( e, function() {

        it( 'should have a .fetch method', function() {

            var o = new entities[ e ]();

            expect( o ).toBeDefined();
            expect( o ).not.toBeNull();

        });

    });

}
