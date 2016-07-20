/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Author: Olaf Hahn
 * 
 * Implements the Request as Promise for communication
 **/

var Promise = require('bluebird');
var AuthenticationError = require('./Authentication-error');
var _Request = require('request');

var authUrl = 'https://identity.open.softlayer.com/v3/auth/tokens';

function Request(options, os) {
	
  return R(options).catch(AuthenticationError, function (e) {
    os.credentials.auth.identity.password.user.id = os.userId;
    os.credentials.auth.identity.password.user.password = os.password;
    os.credentials.auth.scope.project.id = os.projectId;
    
    var authOptions = {url: authUrl, method: 'post', body: os.credentials, json: true};
    
    return R(authOptions).then(function (res) {
    	var response = res.response;
    	var body = res.body;
    	
    	os.token = options.headers['x-auth-token'] = response.headers['x-subject-token'];
    	return R(options);
    });
  });

  function R(options) {
	  return new Promise(function (resolve, reject) {
		  _Request(options, function (err, response, body) {
    	  
			  //console.log('R - options', options);
			  //console.log('R - body', body);
			  
			  if(err) {
				  var ret = {
						  error : err,
						  response : response
				  };  
				  reject(ret);
			  } else if(response.statusCode === 401){
				  reject(new AuthenticationError());
			  } else {
				  var ret = {
						  response : response,
						  body : body
				  };  
				  resolve(ret);
			  }
		  });
    });
  }

}

module.exports = Request;
