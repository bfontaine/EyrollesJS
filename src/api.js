
var objects = require( './objects' ),
    utils   = require( './utils' ),
    config  = require( './config' ).variables;

function Query( q ) {

    if (!( this instanceof Query )) {

        return new Query( q );

    }

    var str = '' + q,
        // Only basic queries are supported right now
        url = config.urls.root
                + config.urls.basic
                + utils.makeParams({ q: str });

    this.results = [];
    this.fetched = false;

    this.fetch = function() {

        utils.getURL( url, function( $ ) {

            this.results = utils.parser.parseBooks( $ );
            this.fetched = true;

        });

    }
}

exports.Query = Query;

