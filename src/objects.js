
var mixins = require( './mixins' ),
    parser = require( './parser' ),
    utils  = require( './utils' ),
    config = require( './config' ).variables;

parser.setObjs( Author, Book, Publisher );

function Author( attrs ) {

    if (!( this instanceof arguments.callee )) {
        return new arguments.callee( attrs );
    }

    mixins.fetchAndParse( this, parser, utils.getURL );
    utils.extends( this, attrs );

}

function Book( attrs ) {

    if (!( this instanceof arguments.callee )) {
        return new arguments.callee( attrs );
    }

    mixins.fetchAndParse( this, parser, utils.getURL );
    utils.extends( this, attrs );

}

function Publisher( attrs ) {

    if (!( this instanceof arguments.callee )) {
        return new arguments.callee( attrs );
    }

    mixins.fetchAndParse( this, parser, utils.getURL );
    utils.extends( this, attrs );

}

function Query( q ) {

    if (!( this instanceof arguments.callee )) {
        return new arguments.callee( q );
    }

    var str = '' + q,
        // Only basic queries are supported right now
        url = config.urls.root
                + config.urls.basic
                + utils.makeParams({ q: str });

    this.results = [];
    this.fetched = false;

    //TODO handle multiple pages

    var that = this;

    this.fetch = function() {

        utils.getURL( url, function( $ ) {

            that.results = parser.parseBooks( $ );
            that.fetched = true;

        });

        return this;
    }

}

exports.Author    = Author;
exports.Book      = Book;
exports.Publisher = Publisher;
exports.Query     = Query;
