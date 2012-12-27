var jasmine = require( 'jasmine-node' ),

    cwd     = process.cwd();

desc( 'test all modules' );
task( 'test', function() {

    jasmine.executeSpecsInFolder( cwd );
    
});
