var express = require( "express" );
var githubAuth = require( "../../index" );

// ===============================
// == APPLICATION CONFIGURATION ==
// ===============================
// Fill in the following data to get this example to run

// Don't have a GitHub application yet?
// Create one at https://github.com/settings/applications/new
var clientId = "your GitHub application's client id";
var clientSecret = "your GitHub application's client secret";
var callbackUrl = "/route/to/your-GitHub-application-callback-URL";
var port = 5000;



// =======================
// == APPLICATION LOGIC ==
// =======================

// Initialize the Express application
// The application must have sessions enabled
var app = express();
app.use( express.cookieParser() );
app.use( express.cookieSession({
	secret: "your secret goes here"
}));

// Initialize the GitHub OAuth client
var gha = githubAuth.createClient({
	id: clientId,
	secret: clientSecret
});

// Add the route for the GitHub authorization callback
// The path must match authorization callback URL for the GitHub application
app.get( callbackUrl, gha.handshake );

// Create a standard route which doesn't require any authorization
app.get( "/", function( request, response ) {
	response.send( "Welcome! Would you like to view a page with " +
		"<a href='/required'>required authorization</a> or " +
		"<a href='/optional'>optional authorization</a>?" );
});

// Create a route which requires authorization
app.get( "/required", gha.authorize, function( request, response ) {
	var accessToken = gha.users[ request.sessionID ].accessToken;
	response.send( "Your access token is " + accessToken );
});

// Create a route with optional authorization
app.get( "/optional", function( request, response ) {
	gha.isAuthorized( request, function( error, isAuthorized ) {
		if ( error ) {
			response.send( 500 );
		}

		var name = isAuthorized ?
			gha.users[ request.sessionID ].accessToken :
			"anonymous";

		response.send( "Hello, " + name );
	});
});

// Start listening for requests
app.listen( port );
