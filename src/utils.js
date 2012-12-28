
function clone( target ) {

    var F = function(){};

    F.prototype = target;
    return new F();
    
}

function _extends( target ) {

    var i = 1,
        l = arguments.length,
        o;

    for ( ; i<l; i++ ) {

        o = arguments[ i ];

        for ( k in o ) {
            
            if (o.hasOwnProperty( k )) {

                target[ k ] = o[ k ];

            }

        }

    }

    return target;

}

function isArray( o ) {

    return o && o.hasOwnProperty('length') && typeof o.splice === 'function';

}

exports.clone   = clone;
exports.extends = _extends;
exports.isArray = isArray;
