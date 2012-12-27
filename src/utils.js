
function clone( target ) {

    var F = function(){};

    F.prototype = target;
    return new F();
    
}

exports.clone = clone;
