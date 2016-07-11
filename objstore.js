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
    // require any external libraries we may need....
    //var foo = require("foo-library");

    // Object Storage Put Node - Main Function
    function ObjectStoragePutNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.filename = n.filename;
        this.container = n.container;
        this.name = n.name;

        // Retrieve the Object Storage config node
        this.osconfig = RED.nodes.getNode(n.osconfig);

        if (this.osconfig) {
            // Do something with:
        	console.log('ObjectStorage Put (log):', this.osconfig);
        } else {
            // No config node configured
        }

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Do whatever you need to do in here - declare callbacks etc
        var msg = {};
        msg.topic = this.topic;
        msg.payload = "Hello world !"

        // respond to inputs....
        this.on('input', function (msg) {
            node.warn("I saw a payload: "+msg.payload);
            // in this example just send it straight on... should process it here really
            node.send(msg);
        });

        // respond to close....
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }
    RED.nodes.registerType("os-put",ObjectStoragePutNode);

    // Object Storage Config Node
	function ObjectStorageConfigNode(n) {
        // Create a RED node
		RED.nodes.createNode(this,n);

		// Store local copies of the node configuration (as defined in the .html)
		this.region = n.region;
		this.name = n.name;
	}
	RED.nodes.registerType("os-config",ObjectStorageConfigNode);
}