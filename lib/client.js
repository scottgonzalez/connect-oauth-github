var querystring = require( "querystring" );
var simpleRequest = require( "./request" );

exports.createClient = createClient;
exports.Client = Client;

function createClient( options ) {
	return new Client( options );
}

function Client( options ) {
	this.id = options.id;
	this.secret = options.secret;
	this.scope = options.scope;

	this.users = {};

	// Bind all methods to the instance
	Object.keys( Client.prototype )
		.filter(function( property ) {
			return typeof Client.prototype[ property ] === "function";
		})
		.forEach(function( method ) {
			this[ method ] = this[ method ].bind( this );
		}.bind( this ));
}

Client.prototype.authorize = function( request, response, next ) {
	this.isAuthorized( request, function( error, isAuthorized ) {
		if ( error ) {
			return this.error( error );
		}

		if ( isAuthorized ) {
			return next();
		}

		request.session._cogOriginalUrl = request.originalUrl;
		response.redirect( "https://github.com/login/oauth/authorize?" +
			querystring.stringify({
				client_id: this.id,
				scope: this.scope
			})
		);
	}.bind( this ));
};

Client.prototype.isAuthorized = function( request, callback ) {
	process.nextTick(function() {
		callback( null, this.users.hasOwnProperty( request.sessionID ) );
	}.bind( this ));
};

Client.prototype.handshake = function( request, response ) {
	if ( !request.query.code ) {
		return this.error( request, response,
			new Error( "No code provided in request from GitHub." ) );
	}

	simpleRequest({
		url: "https://github.com/login/oauth/access_token",
		method: "POST",
		data: {
			client_id: this.id,
			client_secret: this.secret,
			code: request.query.code
		}
	}, function( error, githubResponse ) {
		if ( error ) {
			return this.error( request, response, error );
		}

		var data = querystring.parse( githubResponse.body );
		var accessToken = data.access_token;

		var originalUrl = request.session._cogOriginalUrl;
		delete request.session._cogOriginalUrl;

		if ( !accessToken ) {
			return this.error( request, response,
				new Error( "No access token in response from GitHub." ) );
		}

		this.success( request, response, {
			originalUrl: originalUrl,
			accessToken: accessToken
		});
	}.bind( this ));
};

Client.prototype.error = function( request, response ) {
	response.send( 500 );
};

Client.prototype.success = function( request, response, data ) {
	this.users[ request.sessionID ] = data;
	response.redirect( data.originalUrl );
};
