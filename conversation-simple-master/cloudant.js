var vcapServices = require('vcap_services');

var cloudantCredentials = vcapServices.getCredentials('cloudantNoSQLDB');

var cloudantUrl = process.env.CLOUDANT_URL;

if (cloudantUrl) {
    // If the cloudantUrl has been configured then we will want to set up a nano client
    var nano = require('nano')(cloudantUrl);
    // add a new API which allows us to retrieve the logs (note this is not secure)
    nano.db.get('testconv', function(err) {
        if (err) {
            console.error(err);
            nano.db.create('testconv', function(errCreate) {
                console.error(errCreate);
                logs = nano.db.use('testconv');
                exports.logs = logs;
            });
        } else {
            logs = nano.db.use('testconv');
            exports.logs = logs;
        }
    });
}


