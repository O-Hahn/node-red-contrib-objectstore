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
 * Implements the Object Storage Class for communication
 **/

'use strict'; 
var Request = require('./Request');

// Constructor for new ObjectStorage
function ObjectStorage (userId, password, projectId, container, region) {
	var accessPoint;
    
	this.credentials = require('../config/credentials.json');
	this.userId = userId;
	this.password = password;
	this.projectId = projectId;
	this.container = container;
	
	this.region = region || 'dallas';
	if (region == 'london') {
		accessPoint = 'https://lon.objectstorage.open.softlayer.com';
	} else {
		accessPoint = 'https://dal.objectstorage.open.softlayer.com';
	}
	this.endpoint = accessPoint + '/v1/AUTH_'+ projectId;
	this.token = null;
	this.url = this.endpoint + '/'+ this.container;
}

// Method to create a new Container - if exists nothing happens
ObjectStorage.prototype.createContainer = function () {
	var options = {
			url : this.url,
			method : 'put',
			headers : {'x-auth-token': this.token},
			json : true
	};
	
	return Request(options, this).then(function () {});
};
	
// Method to list the Files of a container
ObjectStorage.prototype.listContainerFiles = function () {
	var options = {
			url : this.url,
			method : 'get',
			headers : {'x-auth-token': this.token},
			json : true
	};
	
	return Request(options, this).then(function (res) {
		var response = res.response;
		var body = res.body;

		var files = [];
		if (body === 'string') {
			files = [];
		} else {
			for (var i =0, len = body.length; i < len; i++) {
				files.push(options.url + '/' + body[i].name);
			}
		}
		return files;
	});
};

// Method to check if a File exists
ObjectStorage.prototype.existsFile  = function (filename) {
	var options = {
			url : this.url + '/' + filename,
			method : 'head',
			headers : {'x-auth-token': this.token},
			json : true
	};

    return Request(options, this).then(function (res) {
    	var response = res.response;
    	var body = res.body;
    	
    	var len = typeof response === 'string' ? -1 : parseInt(response.headers['content-length']);

    	return (len === -1 || len === 0);
    });
};
  
//Method to delete File if  exists
ObjectStorage.prototype.deleteFile  = function (filename) {
	var options = {
			url : this.url + '/' + filename,
			method : 'delete',
			headers : {'x-auth-token': this.token},
			json : true
	};

    return Request(options, this).then(function (res) {
    	var response = res.response;
 
    	var len = typeof response === 'string' ? -1 : parseInt(response.headers['content-length']);

    	return (len ===  0);
    });
};

// Method to set a container readable for public 
ObjectStorage.prototype.setContainerPublicReadable = function () {
	var options = {
			url : this.url,
			method : 'post',
			headers : {'x-auth-token': this.token, 'x-container-read': '.r:*, .rlistings'},
			json : true
	};

    return Request(options, this).then(function () {} );
};
	
// Method to upload a file to a container
ObjectStorage.prototype.uploadFile = function (filename, mimetype, buffer, size){
	var options = {
			url : this.url + '/' + filename,
			method : 'put',
			headers : {'x-auth-token': this.token, 'content_type': mimetype, 'content-length': size},
			body : buffer
	};
		
	return Request(options, this).then(function (res) {		
		return options.url;
	});
};

// Method to download a file from a Container
ObjectStorage.prototype.downloadFile = function (filename) {
	var options = {
			url : this.url + '/' + filename,
			method : 'get',
			headers : {'x-auth-token': this.token},
			encoding : null, 
			json : false
	};
    
    return Request(options, this).then(function (res) {
    	var response = res.response;
    	var body = res.body;

    	var ret = {
    			"filename" : filename,
    			"type" : response.headers['content-type'],
    			"length" : response.headers['content-length'],
    			"body" : body
    	};

    	return ret;
    });
};


// Export the Class
module.exports = ObjectStorage;
