# node-red-contrib-objectstore

A <a href="http://nodered.org" target="_new">Node-RED</a> node to store, delete and receive objects from the <a href="http://bluemix.net" target="_new">IBM Bluemix</a> object storage service. 

## Install
-------

Run the following command in the root directory of your Node-RED install or home directory (usually ~/.node-red) and will also install needed libraries.
```sh
        npm install node-red-contrib-objectstore
```

## Usage
-----

Provides a few nodes to easily manage the accounts, containers, and objects for the <a href="http://bluemix.net" target="_new">IBM Bluemix</a> Object Storage service.
Your can specify the credentials from the Service if you run local on a device (e.g. Raspberry Pi) or it will use the VCAP for the credentials.
There are two regions (access points) supported: 
- https://dal.objectstorage.open.softlayer.com
- https://lon.objectstorage.open.softlayer.com

### ObjStore Put

Saves the given object to the IBM Object Storage Service into the given collection. 

### ObjStore Get

Restores the object into the <b>msg.object</b> from the given key <b>msg.payload</b>. 

### ObjStore Del

Deletes the given object (key is in <b>msg.payload</b> from the object storage service.
