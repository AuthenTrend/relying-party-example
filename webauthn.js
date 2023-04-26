
const fs = require('fs');
const path = require('path');

const authfi = require('./authfi')

const WEBAUTHN_API_BASE = '/api/v1/webauthn';

async function doRegisterOption(userAccount, userName, options) {
    let params = {
        user: {
            name: userAccount,
            displayName: userName
        },
        authenticatorSelection: {
            //authenticatorAttachment: 'cross-platform',
            residentKey: 'preferred',
            requireResidentKey: true,
            userVerification: 'required'
        },
        attestation: 'direct'
    };

    if (typeof options === 'object') {
        if (typeof options.authenticatorAttachment === 'string') {
            switch (options.authenticatorAttachment) {
                case 'cross-platform':
                case 'platform': {
                    params.authenticatorSelection.authenticatorAttachment = options.authenticatorAttachment;
                    break;
                }
            }
        }
        if (typeof options.residentKey === 'string') {
            switch (options.residentKey) {
                case 'preferred':
                case 'required':
                case 'discouraged': {
                    params.authenticatorSelection.residentKey = options.residentKey;
                    break;
                }
            }
        }
        if (typeof options.requireResidentKey === 'boolean') {
            params.authenticatorSelection.requireResidentKey = options.requireResidentKey;
        }
        if (typeof options.userVerification === 'string') {
            switch (options.userVerification) {
                case 'preferred':
                case 'required':
                case 'discouraged': {
                    params.authenticatorSelection.userVerification = options.userVerification;
                    break;
                }
            }
        }
    }

    let response = await authfi.postToAuthFi(
        `${WEBAUTHN_API_BASE}/registration`, JSON.stringify({params})
    );
    return response.body;
}

async function registerResult(fido_response) {
    let response = await authfi.putToAuthFi(
        `${WEBAUTHN_API_BASE}/registration`,
        JSON.stringify({fido_register_response:fido_response})
    );
    return response.body;
}

async function loginOption(options) {
    let params = {
        userVerification: 'required',
    }

    if (typeof options === 'string') {
        if (typeof options.userVerification === 'string') {
            switch (options.userVerification) {
                case 'preferred':
                case 'required':
                case 'discouraged': {
                    params.userVerification = options.userVerification;
                    break;
                }
            }
        }
    }

    let response = await authfi.postToAuthFi(
        `${WEBAUTHN_API_BASE}/login`,
        JSON.stringify({params})
    );
    return response.body;
}

async function loginResult(fido_response) {
    let response = await authfi.putToAuthFi(
        `${WEBAUTHN_API_BASE}/login`,
        JSON.stringify({fido_login_response:fido_response})
    );
    return response.body;
}

async function verifyOption(userAccount, options) {
    let params = {
        userVerification: "required"
    }

    if (typeof options === 'object') {
        if (typeof options.userVerification === 'string') {
            switch (options.userVerification) {
                case 'preferred':
                case 'required':
                case 'discouraged': {
                    params.userVerification = options.userVerification;
                    break;
                }
            }
        }
    }

    let response = await authfi.postToAuthFi(
        `${WEBAUTHN_API_BASE}/verification`,
        JSON.stringify({uId:userAccount, params})
    );
    return response.body;
}

async function verifyResult(fido_response) {
    let response = await authfi.putToAuthFi(
        `${WEBAUTHN_API_BASE}/verification`,
        JSON.stringify({fido_auth_response:fido_response})
    );
    return response.body;
}

module.exports = {
    doRegisterOption, registerResult,
    loginOption, loginResult,
    verifyOption, verifyResult
}
