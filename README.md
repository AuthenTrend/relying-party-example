
# Relying Party Example for AT.AuthFi
This example supports that users register an account with password, FIDO2 Key or both.

## Prerequisites
- Node.js
- npm

## Installation
    npm install

## Configurations
### config/default.json
- `certPath`: The path of SSL certificate.
- `keyPath`: The path of certificate's private key.
- `accessPoint`: The access point for using [AT.AuthFi](https://authentrend.com/at-authfi/).
- `apiKey`: The API key for using [AT.AuthFi](https://authentrend.com/at-authfi/).

### web/res/asselinks.json
- `site`: The website's URL.
- `package_name`: The package name declared in the app's manifest.
- `sha256_cert_fingerprints`: The SHA256 fingerprints of your app's signing certificate.

### web/res/apple-app-site-association
- `apps`: The application identifiers for the apps that are available for use on this website.

## Run
    npm start

## Run for development
    npm run dev
