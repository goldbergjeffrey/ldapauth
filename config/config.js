var path = require('path');
var config = {};

var certPath = 'C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates';

//Azure configuration
config.certificateConfig = {
    passphrase: 'secret'
};

config.sessionSecret='uwotm8';

config.port='3040';

config.ldapConfig = {
  server: {
    url: 'ldap://ldap.randomqliks.us:389',
    bindDn: 'cn=manager,dc=randomqliks,dc=us',
    bindCredentials: 'secret',
    searchBase: 'ou=people,dc=small,dc=randomqliks,dc=us',
    searchFilter: '(uid={{username}})'
  }
};

config.userDirectory = "qliks";

config.certificates = {
		client: path.resolve(certPath, 'client.pem'),
		client_key: path.resolve(certPath,'client_key.pem'),
		server: path.resolve(certPath, 'server.pem'),
		server_key: path.resolve(certPath, 'server_key.pem'),
		root: path.resolve(certPath,'root.pem')
	};

module.exports = config;
