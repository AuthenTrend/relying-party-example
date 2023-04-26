
const https = require('https');
const url = require('url');
const config = require('config')

const ACCESS_POINT = config.get('accessPoint');
const API_KEY = config.get('apiKey');

function getFromAuthFi(accessPath) {
    return new Promise(function(resolve, reject) {
        let urlForm = url.parse(ACCESS_POINT);
        let options = {
            hostname: urlForm.hostname,
            port: 443,
            method: 'GET',
            path: `${urlForm.path}${accessPath}`,
            headers: {
                "Accept": "application/json",
                "Accept-Charset": "utf-8",
                'AT-X-Key': API_KEY
            }
        };

        var req = https.request(options, (res) => {
            var body = [];
            res.on("data", (d) => {
                body.push(d);
            });
            res.on("end", () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch(err) {
                    reject(err)
                }
                resolve({headers: res.headers, body});
            });
        });
        req.end();
    });
}

function postToAuthFi(accessPath, postData) {
    return new Promise(function(resolve, reject) {
        let urlForm = url.parse(ACCESS_POINT);
        let options = {
            hostname: urlForm.hostname,
            port: 443,
            method: 'POST',
            path: `${urlForm.path}${accessPath}`,
            headers: {
                "Accept": "application/json",
                "Accept-Charset": "utf-8",
                'AT-X-Key': API_KEY
            }
        };
        if (postData) {
            options.headers["Content-Type"] = "application/json";
            options.headers["Content-Length"] = postData.length;
        }

        var req = https.request(options, (res) => {
            var body = [];
            res.on("data", (d) => {
                body.push(d);
            });
            res.on("end", () => {
                try {
                    if (body.length)
                      body = JSON.parse(Buffer.concat(body).toString());
                } catch(err) {
                    reject(err)
                }
                resolve({headers: res.headers, body});
            });
        });
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

function putToAuthFi(accessPath, postData) {
    return new Promise(function(resolve, reject) {
        let urlForm = url.parse(ACCESS_POINT);
        let options = {
            hostname: urlForm.hostname,
            port: 443,
            method: 'PUT',
            path: `/${urlForm.path}${accessPath}`,
            headers: {
                "Accept": "application/json",
                "Accept-Charset": "utf-8",
                'AT-X-Key': API_KEY
            }
        };
        if (postData) {
            options.headers["Content-Type"] = "application/json";
            options.headers["Content-Length"] = postData.length;
        }

        var req = https.request(options, (res) => {
            var body = [];
            res.on("data", (d) => {
                body.push(d);
            });
            res.on("end", () => {
                try {
                    if (body.length)
                      body = JSON.parse(Buffer.concat(body).toString());
                } catch(err) {
                    reject(err)
                }
                resolve({headers: res.headers, body});
            });
        });
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

function deleteFromAuthFi(accessPath) {
    return new Promise(function(resolve, reject) {
        let urlForm = url.parse(ACCESS_POINT)
        let options = {
            hostname: urlForm.hostname,
            port: 443,
            method: 'DELETE',
            path: `${urlForm.path}${accessPath}`,
            headers: {
                "Accept": "application/json",
                "Accept-Charset": "utf-8",
                'AT-X-Key': API_KEY
            }
        };

        var req = https.request(options, (res) => {
            var body = [];
            res.on("data", (d) => {
                body.push(d);
            });
            res.on("end", () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch(err) {
                    reject(err)
                }
                resolve({headers: res.headers, body});
            });
        });
        req.end();
    });
}

module.exports = {
    getFromAuthFi, postToAuthFi, putToAuthFi, deleteFromAuthFi
};
