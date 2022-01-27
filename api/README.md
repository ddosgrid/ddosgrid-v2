 # ddosgrid API

## Environment variables consumed

`PORT`: Port on which the http server will listen.

`CLIENT_APP_ORIGIN`: Origin of a frontend that may send credentials in CORS requests.

`OAUTH2_AUTHORIZE`: Authorization endpoint provided by the OAuth2 auth server.

`OAUTH2_TOKEN` Token endpoint provided by the OAuth2 auth server.

`OAUTH2_CLIENTID` Client ID for this API (needs to be registered in auth server).

`OAUTH2_CLIENTSECRET` Client secret for this API (needs to be registered in auth server).

`OAUTH2_CALLBACK` Callback where a successful auth shall be redirected towards (needs to be registered in auth server).

`DDOSDB_HOST` The host where the DDoSDB instance is deployed

`DDOSDB_PROFILEINFO` Endpoint/URL where user info can be queried using the Bearer token, may be a resource server that uses that auth server.

`NODE_ENV`

`DDOSDB_ATTACKTRACE_PATH` Path where attack traces can be fetched for if a Bearer token is set.
