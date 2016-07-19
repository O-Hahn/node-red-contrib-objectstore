var Promise = require('bluebird');
var AuthenticationError = require('./Authentication-error');
var _Request = require('request');

var authUrl = 'https://identity.open.softlayer.com/v3/auth/tokens';

function Request(options, os) {
	
  return R(options).catch(function (AuthenticationError, e) {
    os.credentials.auth.identity.password.user.id = os.userId;
    os.credentials.auth.identity.password.user.password = os.password;
    os.credentials.auth.scope.project.id = os.projectId;
    
    var authOptions = {url: authUrl, method: 'post', body: os.credentials, json: true};
    
    return R(authOptions).then(function (response, body) {
      os.token = options.headers['x-auth-token'] = response.headers['x-subject-token'];
      return R(options);
    });
  });

  function R(options) {
	  return new Promise(function (resolve, reject) {
		  _Request(options, function (err, response, body) {
    	  
			  console.log('R - otions', options);
			  console.log('R - body', body);
			  
			  var ret = {};  
			  if(err) {
				  ret.err = err;
				  ret.response = response;
				  reject(ret);
			  } else if(response.statusCode === 401){
				  reject(new AuthenticationError());
			  } else {
				  ret.response = response;
				  ret.body = body;
				  resolve(ret);
			  }
		  });
    });
  }

}

module.exports = Request;
