var https = require( "https" );
var parseUrl = require( "url" ).parse;
var querystring = require( "querystring" );

exports = module.exports = simpleRequest;

function simpleRequest( options, callback ) {
	var url = parseUrl( options.url );
	var data = options.data;

	var request = https.request({
		hostname: url.hostname,
		path: url.pathname,
		method: options.method || "GET"
	}, function( response ) {
		if ( response.statusCode === 302 ) {
			return simpleRequest({
				url: response.headers.location,
			}, callback );
		}

		response.setEncoding( "utf8" );
		response.body = "";
		response.on( "data", function( data ) {
			response.body += data;
		});
		response.on( "end", function() {
			callback( null, response );
		});
	});

	request.on( "error", function( error ) {
		callback( error );
	});

	if ( data ) {
		if ( typeof data !== "string" ) {
			data = querystring.stringify( data );
		}
	}

	request.write( data );
	request.end();
}
