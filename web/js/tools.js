
function getData(url) {
  console.log('get from: ', url)
  return fetch(url)
  .then((res) => {
    console.log('got response')
    return res.json();
  })
}

function postData(url, content) {
  console.log('post to: ', url)
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(content)
  })
  .then((res) => {
    console.log('got response')
    return res.json();
  })
}

function putData(url, content) {
  console.log('put to: ', url)
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(content)
  })
  .then((res) => {
    console.log('got response')
    return res.json();
  })
}

function stringToArrayBuffer(str) {
  return Uint8Array.from(str, c => c.charCodeAt(0)).buffer;
}

function arrayBufferToString(arrayBuffer) {
  return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
}

function preformatMakeCredReq(makeCredReq) {
  /* ----- DO NOT MODIFY THIS CODE ----- */
  makeCredReq.challenge = base64url.decode(makeCredReq.challenge);
  makeCredReq.user.id   = base64url.decode(makeCredReq.user.id);

  for(let excludeCred of makeCredReq.excludeCredentials) {
    excludeCred.id = base64url.decode(excludeCred.id);
  }

  return makeCredReq
}

function publicKeyCredentialToJSON(pubKeyCred) {
  /* ----- DO NOT MODIFY THIS CODE ----- */
  if(pubKeyCred instanceof Array) {
    let arr = [];
    for(let i of pubKeyCred)
      arr.push(publicKeyCredentialToJSON(i));

    return arr
  }

  if(pubKeyCred instanceof ArrayBuffer) {
    return base64url.encode(pubKeyCred)
  }

  if(pubKeyCred instanceof Object) {
    let obj = {};

    for (let key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key])
    }

    return obj
  }

  return pubKeyCred
}

function preformatGetAssertReq(getAssert) {
  /* ----- DO NOT MODIFY THIS CODE ----- */
  getAssert.challenge = base64url.decode(getAssert.challenge);

  for(let allowCred of getAssert.allowCredentials) {
    allowCred.id = base64url.decode(allowCred.id);
  }

  return getAssert
}
