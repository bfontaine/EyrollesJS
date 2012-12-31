var jasmine = require( 'jasmine-node' ),

    cwd     = process.cwd();

desc( 'test all modules' );
task( 'test', function() {

    jasmine.executeSpecsInFolder( cwd );
    
});

desc( 'publish the module' );
task( 'publish', { async: true }, function() {

    jake.exec([ 'npm publish .' ], function() {

        complete();

    }, { printStdout: true });

})
