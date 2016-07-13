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
 **/

'use strict'; 
import Request from './Request';

// New Class Object Storage
class ObjectStorage {
	constructor(userId, password, projectId, container, accessPoint = 'https://dal.objectstorage.open.softlayer.com') {
    
	this.credentials = require('../config/credentials.json');
	this.userId = userId;
	this.password = password;
	this.projectId = projectId;
	this.container = container;
	this.endpoint = `${accessPoint}/v1/AUTH_${projectId}`;
	this.token = null;
	this.url = `${this.endpoint}/${this.container}`;
	}

	createContainer() {
		const url = this.url;
		const method = 'put';
		const headers = {'x-auth-token': this.token};
		return Request({url, method, headers, json: true}, this).then(() => null);
	}
	
	listContainerFiles(){
		const url = this.url;
		const method = 'get';
		const headers = {'x-auth-token': this.token};
		return Request({url, method, headers, json: true}, this).then(({response, body}) => {
		  return typeof body === 'string' ? [] : body.map(file => `${this.url}/${file.name}`);
		});
	}	
  
	existsFile(filename){
	    const url = `${this.url}/${filename}`;
	    const method = 'head';
	    const headers = {'x-auth-token': this.token};
	    return Request({url, method, headers, json: true}, this).then(({response, body}) => {
	    	var ret = {
	    			"url" : url,
	    			"length" : typeof response === 'string' ? false : response.headers['content-length']
	    	}
	      return ret;
	    });
	}
  
	setContainerPublicReadable(){
	    const url = this.url;
	    const method = 'post';
	    const headers = {'x-auth-token': this.token, 'x-container-read': '.r:*, .rlistings'};
	    return Request({url, method, headers, json: true}, this).then(() => null);
	}
	
	uploadFileToContainer(filename, mimetype, buffer, size){
		const url = `${this.url}/${filename}`;
		const method = 'put';
		const headers = {'x-auth-token': this.token, 'content_type': mimetype, 'content-length': size};
		return Request({url, method, headers, body: buffer}, this).then(() => `${this.url}/${filename}`);
	}
  
	downloadFile(filename, outname) {
	  	var https = require('https');
	  	var fs = require('fs');
	  	var file = fs.createWriteStream(outname);
	  	
	    const url = `${this.url}/${filename}`;
	    const method = 'head';
	    const headers = {'x-auth-token': this.token};
	    return Request({url, method, headers, json: true}, this).then(({response, body}) => {
	    	var donwloadlink = https.get(url, function(res) { 
	    		res.pipe(file);
	    	}) 	
	      return outname;
	    });
	}
	
	downloadFileFromContainer(filename){
	    const url = `${this.url}/${filename}`;
	    const method = 'get';
	    const headers = {'x-auth-token': this.token};
	    return Request({url, method, headers, json: false}, this).then(({response, body}) => {
	    	console.log('Test:', body);
	    	var ret = {
	    			"filename" : filename,
	    			"type" : response.headers['content-type'],
	    			"length" : response.headers['content-length'],
	    			"body" : body
	    	}
	      return ret;
	    });
	}
}

module.exports = ObjectStorage;
