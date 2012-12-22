
var mixins = require( './mixins' ),
    utils  = require( './utils' ),

    Author = function( attrs ) {

        if (!( this instanceof arguments.callee )) {
            return new arguments.callee( attrs );
        }

        mixins.fetchAndParse( this );
        utils.extends( this, attrs );

    },

    Book   = function( attrs ) {

        if (!( this instanceof arguments.callee )) {
            return new arguments.callee( attrs );
        }

        mixins.fetchAndParse( this );
        utils.extends( this, attrs );

    },

    Publisher = function( attrs ) {

        if (!( this instanceof arguments.callee )) {
            return new arguments.callee( attrs );
        }

        mixins.fetchAndParse( this );
        utils.extends( this, attrs );

    };

exports.Author    = Author;
exports.Book      = Book;
exports.Publisher = Publisher;
