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
		accessPoint = 'https://dal.objectstorage.open.softlayer.com';
	} else {
		accessPoint = 'https://dal.objectstorage.open.softlayer.com';
	}
	this.endpoint = `${accessPoint}/v1/AUTH_${projectId}`;
	this.token = null;
	this.url = `${this.endpoint}/${this.container}`;
}

// Method to create a new Container - if exists nothing happens
ObjectStorage.prototype.createContainer = function () {
	var url = this.url;
	var method = 'put';
	var headers = {'x-auth-token': this.token};
	
	return Request({url, method, headers, json: true}, this).then(function () {});
}
	
// Method to list the Files of a container
ObjectStorage.prototype.listContainerFiles = function () {
	var url = this.url;
	var method = 'get';
	var headers = {'x-auth-token': this.token};
	
	return Request({url, method, headers, json: true}, this).then(function (response, body) {
	  return typeof body === 'string' ? [] : body.map(function (file) { `${this.url}/${file.name}` });
	});
}	

// Method to check if a File exists
ObjectStorage.prototype.existsFile  = function (filename) {
    var url = `${this.url}/${filename}`;
    var method = 'head';
    var headers = {'x-auth-token': this.token};
    
    return Request({url, method, headers, json: true}, this).then(function (response, body) {
    	var ret = {
    			"url" : url,
    			"length" : typeof response === 'string' ? false : response.headers['content-length']
    	}
      return ret;
    });
}
  
// Method to set a container readable for public 
ObjectStorage.prototype.setContainerPublicReadable = function () {
    var url = this.url;
    var method = 'post';
    var headers = {'x-auth-token': this.token, 'x-container-read': '.r:*, .rlistings'};
    
    return Request({url, method, headers, json: true}, this).then(function () {} );
}
	
// Method to upload a file to a container
ObjectStorage.prototype.uploadFileToContainer = function (filename, mimetype, buffer, size){
	var url = `${this.url}/${filename}`;
	var method = 'put';
	var headers = {'x-auth-token': this.token, 'content_type': mimetype, 'content-length': size};
	
	return Request({url, method, headers, body: buffer}, this).then(function () { `${this.url}/${filename}` });
}

// Method to download a file from a container
ObjectStorage.prototype.downloadFile = function (filename, outname) {
  	var https = require('https');
  	var fs = require('fs');
  	var file = fs.createWriteStream(outname);
  	
    var url = `${this.url}/${filename}`;
    var method = 'head';
    var headers = {'x-auth-token': this.token};
    
    return Request({url, method, headers, json: true}, this).then(function (response, body) {
    	var donwloadlink = https.get(url, function(res) { 
    		res.pipe(file);
    	}) 	
      return outname;
    });
}

// Method to download a file from a Container
ObjectStorage.prototype.downloadFileFromContainer = function (filename) {
    var url = `${this.url}/${filename}`;
    var method = 'get';
    var headers = {'x-auth-token': this.token};
    
    return Request({url, method, headers, json: false}, this).then(function (response, body) {
    	var ret = {
    			"filename" : filename,
    			"type" : response.headers['content-type'],
    			"length" : response.headers['content-length'],
    			"body" : body
    	}

    	return ret;
    });
}


// Export the Class
module.exports = ObjectStorage;
