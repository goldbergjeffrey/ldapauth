process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

var express      = require('express'),
    passport     = require('passport'),
    bodyParser   = require('body-parser'),
    LdapStrategy = require('passport-ldapauth');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var config = require('./config/config');
var https = require('https');
var fs = require('fs');
var url = require('url');
var path    = require("path");
var OPTS = config.ldapConfig;
var app = express();
var targetId;
var RESTURI; 

passport.use(new LdapStrategy(OPTS));
 

app.set('port', config.port);
app.use(session({ resave: true,
                    saveUninitialized: true,
                    secret: config.sessionSecret}));
app.use(cookieParser('Test'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());

app.post('/login', function(req, res, next) {
  //console.log(req.body.username);
  //console.log(req.body.password);
  passport.authenticate('ldapauth', {session: false}, function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
      return res.send({ success : false, message : 'authentication failed' });
    }
    //return res.send({ success : true, message : 'authentication succeeded' });
    var selectedUser = req.body.username;
    console.log(selectedUser);
    var userDirectory = config.userDirectory;
    
    //console.log("resturi: " + RESTURI);
    requestticket(req, res, selectedUser, userDirectory, RESTURI, targetId);
    req.session.destroy();
    return

  })(req, res, next);
});

app.get('/', function(req, res, next) {
  //return res.send(req.body.inputUserId + " " + req.body.inputPassword);
  targetId = req.query.targetId;
  RESTURI = req.query.proxyRestUri;
  res.sendFile(path.join(__dirname+'/signin.html'));
})

app.get('/logout', function (req, res) {
    console.log("Logout user "+selectedUser+" directory "+userDirectory);
  var selectedUser = req.query.selectedUser;
    var userDirectory = req.query.userDirectory;
  logout(req,res,selectedUser,userDirectory);
});


function logout(req, res, selectedUser, userDirectory) {
    //Configure parameters for the logout request
    var options = {
        host: url.parse(RESTURI).hostname,
        port: url.parse(RESTURI).port,
        path: url.parse(RESTURI).path+'/user/'+userDirectory.toString()+'/' + selectedUser.toString() + '?xrfkey=aaaaaaaaaaaaaaaa',
        method: 'DELETE',
        cert: fs.readFileSync(config.certificates.server),
      key: fs.readFileSync(config.certificates.server_key),
      ca: fs.readFileSync(config.certificates.root),
    passphrase: config.certificateConfig.passphrase,
        headers: { 'x-qlik-xrfkey': 'aaaaaaaaaaaaaaaa', 'Content-Type': 'application/json' },
    rejectUnauthorized: false,
        agent: false
    };

    console.log("Path:", options.path.toString());
    //Send request to get logged out
    var ticketreq = https.request(options, function (ticketres) {
        console.log("statusCode: ", ticketres.statusCode);
        //console.log("headers: ", ticketres.headers);

        ticketres.on('data', function (d) {
      console.log(selectedUser, " is logged out");
            console.log("DELETE Response:", d.toString());
      res.send("<HTML><HEAD></HEAD><BODY>"+selectedUser + " is logged out<BR><PRE>"+ d.toString()+"</PRE></BODY><HTML>");
        });

    });

    //Send request to logout
    ticketreq.end();

    ticketreq.on('error', function (e) {
        console.error('Error' + e);
    });
};


function requestticket(req, res, selecteduser, userdirectory, RESTURI, targetId) {

    //Configure parameters for the ticket request
    var options = {
        host: url.parse(RESTURI).hostname,
        port: url.parse(RESTURI).port,
        path: url.parse(RESTURI).path + '/ticket?xrfkey=aaaaaaaaaaaaaaaa',
        method: 'POST',
        headers: { 'X-qlik-xrfkey': 'aaaaaaaaaaaaaaaa', 'Content-Type': 'application/json' },
        cert: fs.readFileSync(config.certificates.server),
      key: fs.readFileSync(config.certificates.server_key),
      ca: fs.readFileSync(config.certificates.root),
    passphrase: config.certificateConfig.passphrase,
    rejectUnauthorized: false,
        agent: false
    };

  //console.log(targetId);
    //Send ticket request
    var ticketreq = https.request(options, function (ticketres) {
        console.log("statusCode: ", ticketres.statusCode);
        //console.log("headers: ", ticketres.headers);

        ticketres.on('data', function (d) {
            //Parse ticket response
      //console.log(d.toString());
            var ticket = JSON.parse(d.toString());

            //Build redirect including ticket
       if (ticket.TargetUri.indexOf("?") > 0) {
                redirectURI = ticket.TargetUri + '&QlikTicket=' + ticket.Ticket;
            } else {
                redirectURI = ticket.TargetUri + '?QlikTicket=' + ticket.Ticket;
            }


            console.log("Login redirect:", redirectURI);
            res.redirect(redirectURI);
        });
    });

    //Send JSON request for ticket
    var jsonrequest = JSON.stringify({ 'UserDirectory': userdirectory.toString() , 'UserId': selecteduser.toString(), 'Attributes': [], 'TargetId': targetId.toString() });
  //console.log(jsonrequest);
    ticketreq.write(jsonrequest);
    ticketreq.end();

    ticketreq.on('error', function (e) {
        console.error('Error' + e);
    });
};

//Server options to run an HTTPS server
var httpsoptions = {
            cert: fs.readFileSync(config.certificates.server),
      key: fs.readFileSync(config.certificates.server_key),
      ca: fs.readFileSync(config.certificates.root),
    passphrase: config.certificateConfig.passphrase
};

//Start listener
var server = https.createServer(httpsoptions, app);
server.listen(app.get('port'), function()
{
  console.log('Express server listening on port ' + app.get('port'));
});
