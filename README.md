# ldapauth
Simple ldap authentication using passportjs and then connect to Qlik Sense

## Configuration
*This project requires nodejs.  You can download and install nodejs here: [download Nodejs](https://nodejs.org/dist/v4.5.0/node-v4.5.0-x64.msi).*

### Windows Configuration
*On the Qlik Sense server running proxy services*   

1. Once nodejs is installed, unzip the contents of this repo into a new folder of your choosing.   

2. Open a command prompt as an administrator and point to the folder.   

3. Run npm install to install dependencies for running the module.   

4. Open the config folder, and open the config.js file in your favorite text editor.   

5. Update the certPath variable if necessary to point to where the Qlik Sense server generated certificates are stored.   

6. Update the ldapConfig property with the appropriate address and access to an ldap for authentication.   

7. Set the userDirectory variable to the domain users will log in from.   

8. Start the module by typing node ldapauth.js at the command prompt.   

9. Set up a virtual proxy by following this video: [Virtual Proxy Config](https://www.youtube.com/watch?v=BPT8_NM1dUk&list=PLW1uf5CQ_gSpUIEWu0-0TzzEaNVQo346i&index=7).


