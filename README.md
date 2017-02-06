# node-red-contrib-objectstore

A <a href="http://nodered.org" target="_new">Node-RED</a> node to store, delete and restore objects from the <a href="http://bluemix.net" target="_new">IBM Bluemix</a> object storage service. 

## Install
-------

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red) and will also install needed libraries.
```sh
        npm install node-red-contrib-objectstore
```
This node was tested under Nodejs V4.x LTS and NPM 2.x on NodeRed.

## Usage
-----

Provides a few nodes to easily manage the containers and objects for the <a href="http://bluemix.net" target="_new">IBM Bluemix</a> Object Storage service.
Your can specify the credentials from the Service if you run local on a device (e.g. Raspberry Pi with the provided credentials) or it will use the VCAP_SERVICES on Bluemix.

There are two regions (access points) supported: 
- https://dal.objectstorage.open.softlayer.com
- https://lon.objectstorage.open.softlayer.com

This node helps to deliver images and audio files as a payload (up to 5MB) via the REST API Interface of Swift. 

### Object Storage Put

Saves the given object to the IBM Object Storage Service into the given container. This also will create the container if not existing (with public viewable rights).

### Object Storage Get

Restores the object from the IBM Object Storage Service as a payload or a local file.

### Object Storage Del

Deletes the given object of the given container from the IBM Object Storage Service.
