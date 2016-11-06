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


module.exports = function(RED) {
    "use strict";

    // require any external libraries ....
    
    // Object Storage Get Node - Main Function
    function ObjectStorageGetNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.mode = n.mode;
        this.objectname = n.objectname;
        this.container = n.container;
        this.filename = n.filename;
        this.filepath = n.filepath;
        this.name = n.name;

        // Retrieve the Object Storage config node
        this.osconfig = RED.nodes.getNode(n.osconfig);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Check if the Config to the Service is given 
        if (this.osconfig) {
            // Do something with:
         	node.status({fill:"green",shape:"ring",text:"ready"});
        } else {
            // No config node configured
	        node.status({fill:"red",shape:"ring",text:"error"});
	        node.error('Object Storage Put (err): No object storage configuration found!');
	        return;
        }

        // respond to inputs....
        this.on('input', function (msg) {
         	// Local Vars and Modules
	    	var ObjectStore = require('./lib/ObjectStorage');
         	var fsextra = require("fs-extra");
         	var fs = require("fs");
         	var localdir = __dirname;
        	var uuid = require('node-uuid').v4();

         	var mode;
			var filename;
			var filepath;
			var objectname; 
			var filefqn;
			var container;

			// Help Debug
	        console.log('ObjectStorage Get (log): Init done');

	        // Set the status to green
         	node.status({fill:"green",shape:"dot",text:"connected"});
         	
			// Check mode
         	if ((msg.mode) && (msg.mode.trim() !== "")) {
         		mode = msg.mode;
         	} else {
         		if (node.mode) {
         			mode = node.mode;
         		} else {
         			mode = "1";
         		}
         	}

         	// Check ObjectName 
         	if ((msg.objectname) && (msg.objectname.trim() !== "")) {
         		objectname = msg.objectname;
         	} else {
     			objectname = node.objectname;
         	}

         	// Check Filename
         	if ((msg.filename) && (msg.filename.trim() !== "")) {
         		filename = msg.filename;
         	} else {
     			filename = node.filename;
         	}

			// Check filepath
         	if ((msg.filepath) && (msg.filepath.trim() !== "")) {
         		filepath = msg.filepath;
         	} else {
         		if (node.filepath) {
         			filepath = node.filepath;
         		} else {
         			filepath = localdir;
         		}
         	}

         	// Set FQN for this file
     		filefqn = filepath + filename;
         	
 			// Check container
         	if ((msg.container) && (msg.container.trim() !== "")) {
         		container = msg.container;
         	} else {
         		if (node.container) {
         			container = node.container;
         		} else {
         			container = "Pictures";
         		}
         	}
         	
     		// Enable the Object Storage Service Call
     		var os = new ObjectStore(node.osconfig.userId, node.osconfig.password, node.osconfig.tendantId, container, node.osconfig.region);

         	// mode is buffermode or filebased
	        if (mode == "0") {
	        	// If File exists with objectname - write to file the content 
		        var sess = os.existsFile(objectname);
		        sess.then(function(r) {
		        	if (r === true) {
		        		var getsess = os.downloadFileFromContainer(objectname);
		        		getsess.then(function (r) {
		    	        	// Download into new File 
		    		        var opt = {
		    		        		encoding : null
		    		        };
		    		        fs.writeFileSync(filefqn, r.body, opt);
		    		        msg.payload = filefqn;
		    		        msg.objectname = objectname;
		    		        
		    		        // Set the node-status
		    		        node.status({fill:"green",shape:"ring",text:"ready"});

		    		        // Send the output back 
		    	            node.send(msg);
		        		});
		        	} else {
	    		        // Send error back 
	    	            node.error("objstore store get (err): Object not found", msg);	        		
		        	}
		        });
		        
		        // console log
		        console.log('objstore store get (log): write into file - ', filefqn);
		    } else {
				// store the obj directly from msg.payload
				// var buf = new Buffer(msg.payload, "binary");	 
	        
	        	// If File exists with objectname - write to file the content 
		        var sess = os.existsFile(objectname);
		        sess.then(function(r) {
		            if (r === true) {
		        		var getsess = os.downloadFileFromContainer(objectname);
		        		getsess.then(function (r) {
		        			msg.objectname = objectname;
		    		        msg.payload = r.body;
		    		        console.log('objectstore get (log): object loaded');
		    		        
		    		        // Set the node-status
		    		        node.status({fill:"green",shape:"ring",text:"ready"});

		    		        // Send the output back 
		    	            node.send(msg);
		        		});
		        	} else {
	    		        // Send error back 
	    	            node.error("objstore store get (err): Object not found", msg);	        		
		        	}
		        });		        
		        // console log
		        console.log('objstore store get (log): write into msg.payload');
	        }
        });

        // respond to close....
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }
    RED.nodes.registerType("os-get",ObjectStorageGetNode);

    // Object Storage Put Node - Main Function
    function ObjectStoragePutNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.filename = n.filename;
        this.mode = n.mode;
        this.formattype = n.formattype;
        this.audioformat = n.audioformat;
        this.imageformat = n.imageformat;
        this.filepath = n.filepath;
        this.objectmode = n.objectmode;
        this.objectname = n.objectname;
        this.container = n.container;
        this.name = n.name;

        // Retrieve the Object Storage config node
        this.osconfig = RED.nodes.getNode(n.osconfig);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Check if the Config to the Service is given 
        if (this.osconfig) {
            // Do something with:
         	node.status({fill:"green",shape:"ring",text:"ready"});
        } else {
            // No config node configured
	        node.status({fill:"red",shape:"ring",text:"error"});
	        node.error('Object Storage Put (err): No object storage configuration found!');
	        return;
        }

        // respond to inputs....
        this.on('input', function (msg) {
         	// Local Vars and Modules
	    	var ObjectStore = require('./lib/ObjectStorage');
         	var fsextra = require("fs-extra");
         	var fs = require("fs");
         	var localdir = __dirname;
        	var uuid = require('node-uuid').v4();

         	var mode;
         	var formattype;
			var filename;
			var filepath;
			var audioformat;
			var imageformat;
			var fileformat;
			var objectname; 
			var filefqn;
			var container;
			var objectmode;
			var mimetype;

	        // Set the status to green
         	node.status({fill:"green",shape:"dot",text:"connected"});
         	
			// Check mode
         	if ((msg.mode) && (msg.mode.trim() !== "")) {
         		mode = msg.mode;
         	} else {
         		if (node.mode) {
         			mode = node.mode;
         		} else {
         			mode = "1";
         		}
         	}

         	// Check if audio or file to set right format
         	if ((msg.formattype) && (msg.formattype.trim() !== "")) {
         		if (formattype == "0") {         			
                 	// Check fileformat
                 	if ((msg.imageformat) && (msg.imageformat.trim() !== "")) {
                 		imageformat = msg.imageformat;
                 	} else {
                 		if (node.imageformat) {
                 			imageformat = node.imageformat;
                 		} else {
                 			imageformat = "jpeg";
                 		}
                 	}
                 	fileformat = imageformat;
         		} else {         			
                 	// Check audioformat
                 	if ((msg.audioformat) && (msg.audioformat.trim() !== "")) {
                 		audioformat = msg.audioformat;
                 	} else {
                 		if (node.audioformat) {
                 			audioformat = node.audioformat;
                 		} else {
                 			audioformat = "jpeg";
                 		}
                 	}
                 	fileformat = audioformat;
         		}
         	}

         	// Check Filename
         	if ((msg.filename) && (msg.filename.trim() !== "")) {
         		filename = msg.filename;
         	} else {
         		if (node.filename) {
         			filename = node.filename;
         		} else {
         			if (fileformat == 'jpeg') {
         				filename = "pic_" + uuid + '.jpg';         				
         			} else {
         				filename = "pic_" + uuid + '.' + fileformat;         				         				
         			}
         		}
         	}

			// Check filepath
         	if ((msg.filepath) && (msg.filepath.trim() !== "")) {
         		filepath = msg.filepath;
         	} else {
         		if (node.filepath) {
         			filepath = node.filepath;
         		} else {
         			filepath = localdir;
         		}
         	}
         	
         	// Set the right mime-format
         	if (formattype == "0") {         		
             	mimetype = 'image/' + fileformat;
         	} else {
             	mimetype = 'audio/' + fileformat;
         	}

         	// Set FQN for this file
     		filefqn = filepath  + filename;

         	// Check objectmode
         	if ((msg.objectmode) && (msg.objectmode.trim() !== "")) {
         		objectmode = msg.objectmode;
         	} else {
         		if (node.objectmode) {
         			objectmode = node.objectmode;
         		} 
         	}
         	
         	// Check objectname and define against objectmode
         	if (objectmode == "0") {
     			objectname = filename;
         	} else if (objectmode == "1") {
         		if (formattype == "0") {
         			objectname = "pic_" + uuid + '.jpg';         		         		         			
         		} else {
         			objectname = "audio_" + uuid + '.wav';         		         		
         		}
         	} else {
             	if ((msg.objectname) && (msg.objectname.trim() !== "")) {
             		objectname = msg.objectname;
             	} else {
             		if (node.objectname) {
             			objectname = node.objectname;
             		} else {
             			if (formattype == "0") {
                 			objectname = "imgage_" + uuid + '.jpg';             				
             			} else {
                 			objectname = "audio_" + uuid + '.wav';
             			}
             		}
             	}
         	}

 			// Check container
         	if ((msg.container) && (msg.container.trim() !== "")) {
         		container = msg.container;
         	} else {
         		if (node.container) {
         			container = node.container;
         		} else {
         			if (formattype == "0") {
             			container = "Image";         				
         			} else {
             			container = "Audio";         				
         			}
         		}
         	}
         	
     		// Enable the Object Storage Service Call
     		var os = new ObjectStore(node.osconfig.userId, node.osconfig.password, node.osconfig.tendantId, container, node.osconfig.region);
     		
         	// mode is buffermode or filebased
	        if (mode == "0") {
	        	// Upload from File 
		        var readStream = fs.createReadStream(filefqn);
		        
		        // get Filesize
		        var stats = fs.statSync(filefqn);
		        var fileSizeInBytes = stats['size'];
		        
		        var sess = os.createContainer();
		        sess.then(function() {
		        	return os.setContainerPublicReadable();
		        })
		        .then(function() {
		        	return os.uploadFile(objectname, mimetype, readStream, fileSizeInBytes);
		        })
		        .then(function(url){
			        console.log('objstore store put (log): Url to uploaded file:', url);

			        // Provide the needed Feedback
			        msg.payload = msg.file;
			        msg.objectname = objectname;
			        msg.filefqn = filefqn;
			        msg.url = url;
	
			        // Set the node-status
			        node.status({fill:"green",shape:"ring",text:"ready"});
			        
		            // Send the output back 
		            node.send(msg);
		        });

		        // console log
			        console.log('objstore store put (log): write - ', filefqn);
		    } else {
				// store the obj directly from msg.payload
				var buf = new Buffer(msg.payload, "binary");	 
	        
				var sess = os.createContainer();
				sess.then(function() {
					return os.setContainerPublicReadable();
				})
				.then(function() {
					return os.uploadFile(objectname, mimetype, buf, buf.length);
				})
				.then(function(url){
					console.log('objstore store put (log): Url to uploaded file:', url);

					// Provide the needed Feedback
			        msg.payload = msg.file;
			        msg.objectname = objectname;
			        msg.filefqn = filefqn;
					msg.url = url;

			        // Set the node-status
			        node.status({fill:"green",shape:"ring",text:"ready"});
			        
		            // Send the output back 
		            node.send(msg);
				});
	        }
        });

        // respond to close....
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }
    RED.nodes.registerType("os-put",ObjectStoragePutNode);

    // Object Storage Del Node - Main Function
    function ObjectStorageDelNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.objectname = n.objectname;
        this.container = n.container;
        this.name = n.name;

        // Retrieve the Object Storage config node
        this.osconfig = RED.nodes.getNode(n.osconfig);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Check if the Config to the Service is given 
        if (this.osconfig) {
            // Do something with:
         	node.status({fill:"green",shape:"ring",text:"ready"});
        } else {
            // No config node configured
	        node.status({fill:"red",shape:"ring",text:"error"});
	        node.error('Object Storage Del (err): No object storage configuration found!');
	        return;
        }

        // respond to inputs....
        this.on('input', function (msg) {
         	// Local Vars and Modules
	    	var ObjectStore = require('./lib/ObjectStorage');

			var objectname; 
			var container;

	        // Set the status to green
         	node.status({fill:"green",shape:"dot",text:"connected"});         	
         	
                // Check ObjectName
                if ((msg.objectname) && (msg.objectname.trim() !== "")) {
	            objectname = msg.objectname;
                } else {
	            objectname = node.objectname;
                }

 			// Check container
         	if ((msg.container) && (msg.container.trim() !== "")) {
         		container = msg.container;
         	} else {
         		if (node.container) {
         			container = node.container;
         		} else {
         			container = "Pictures";
         		}
         	}
         	
     		// Enable the Object Storage Service Call
     		var os = new ObjectStore(node.osconfig.userId, node.osconfig.password, node.osconfig.tendantId, container, node.osconfig.region);
     		
		    // Delete the file if exists    
	        var sess = os.existsFile(objectname);
	        sess.then(function() {
	        	console.log('Object Storage Del (log): file exists:', objectname);
	        	return os.deleteFile(objectname);
	        })
	        .then(function(res){
	        	console.log('Object Storage Del (log): file deleted:', objectname);
	        });

         	node.status({fill:"green",shape:"ring",text:"ready"});

         	// console log
	        
            // Send the output back - here no feedback
            // node.send(msg);
        });

        // respond to close....
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }
    RED.nodes.registerType("os-del",ObjectStorageDelNode);

    // Object Storage Config Node
	function ObjectStorageConfigNode(n) {
        // Create a RED node
		RED.nodes.createNode(this,n);
		
		// check the cfgtype
		this.cfgtype = n.cfgtype;

		if (this.cfgtype == 'bluemix') {
			// get the VCAP_SERVICES
			var vcapServices = require('./lib/vcap');
			console.log('VCAP: ', vcapServices);
			var osCred = vcapServices.Object-Storage.credentials;
			
			// Get them
			this.region = osCred.region;
			this.userId = osCred.userId;
			this.tendantId = osCred.tendantId;
			this.userName = osCred.userName;
			this.password = osCred.password;		
		} else {			
			// Store local copies of the node configuration (as defined in the .html)
			this.region = n.region;
			this.userId = n.userId;
			this.tendantId = n.tendantId;
			this.userName = n.userName;
			this.password = n.password;		
		}
		this.name = n.name;
	}
	RED.nodes.registerType("os-config",ObjectStorageConfigNode);
};
