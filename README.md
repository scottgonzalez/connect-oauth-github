# connect-oauth-github

GitHub OAuth for Connect/Express.

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).



## Installation

```
npm install connect-oauth-github
```



## Usage

Basic usage is shown below. By default, the module will track authorization in memory and store the user data on the client instance. It is expected that most applications will override this behavior. See the [API documentation](#api) for more information.

There are additional examples provided in the examples diretory. Each example has a series of variables at the top that need to be filled in based on your application.

```javascript
var express = require( "express" );
var githubAuth = require( "../../lib/oath" );

// Initialize the Express application
// The application must have sessions enabled
var app = express();
app.use( express.cookieParser() );
app.use( express.cookieSession({
	secret: "your secret goes here"
}));

// Initialize the GitHub OAuth client
var gha = githubAuth.createClient({
	id: "your client id",
	secret: "your client secret"
});

// Add the route for the GitHub authorization callback
// The path must match authorization callback URL for the GitHub application
app.get( "/auth", gha.handshake );

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
app.listen( 5000 );
```



## API

### createClient( options )

Creates a new client instance.

* `options`: A hash of GitHub application settings
  * `id`: The client id of the GitHub application.
  * `secret`: The client secret of the GitHub application.
  * `scope` (optional; default: no scope): Which [scope(s)](http://developer.github.com/v3/oauth/#scopes) to request.



### client.authorize()

Middleware for authorizing access to GitHub.



### client.isAuthorized( request, callback )

Determines whether the current user is authorized to access GitHub.

* `request`: The incoming request for the user.
* `callback` (`function( error, isAuthorized )`): A callback to invoke when the authorization status is determined.
  * `isAuthorized`: Whether the user is authorized.

This method is intended to be overridden based on the application's session model.



### client.handshake( request, response )

Route for handling the GitHub OAuth handshake. This must be attached to a route matching the authorization callback URL for the GitHub application.



### client.error( request, response, error )

Handles authorization errors.

* `request`: The incoming request for the handshake.
* `response`: The pending response for the handshake.
* `error`: The error that occurred during the handshake.

This method can be overridden for more graceful error handling.



### client.success( request, response, data )

Handles successful authorization.

* `request`: The incoming request for the handshake.
* `response`: The pending response for the handshake.
* `data`: Information related to the handshake.
  * `originalUrl`: The original URL that was requested which required authorization.
  * `accessToken`: The user's GitHub access token.

This method is intended to be overridden based on the application's session model.



## GitHub Documentation

For detailed information about GitHub's OAuth workflow, please see the [GitHub documentation](http://developer.github.com/v3/oauth/) which covers:

* How to create an application and recieve the client id and secret.
* Which scopes are available.
* How to revoke authorizations for an application.



## License

Copyright 2013 Scott González. Released under the terms of the MIT license.

---

Support this project by [donating on Gittip](https://www.gittip.com/scottgonzalez/).
