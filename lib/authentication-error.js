var util = require('util');
var ExtendableError = require('es6-error');


function AuthenticationError (message) {
	message = message || 'Authentification Error';
	ExtendableError.call (this, message);
}

util.inherits(AuthenticationError, ExtendableError);

module.exports = AuthenticationError;