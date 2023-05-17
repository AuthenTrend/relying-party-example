
const express = require('express')
const app = express()
const https = require('https')
const bodyParser = require('body-parser')
const fs = require("fs")
const jwt = require('jsonwebtoken')
const base64url = require('base64url')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const db = new JsonDB(new Config('db/userdb', true, false, '/'))
const config = require('config')
const webauthn = require('./webauthn')

const certPath = config.get('certPath')
const keyPath = config.get('keyPath')

const jwtSecret = "just for demo"

const responseTemplate = {
  status: null,
  msg: null
}

const userLoginDataTemplate = {
  username: null,
  password: null,
  credential: null
}

const userDbItemTemplate = {
  username: null,
  password: null,
  authfi_uid: null,
  authfi_keys: null
}

////////////////////////////////////////////////////////////////////////////////

function createSuccessResponse(msg = null) {
  var resp = Object.assign({}, responseTemplate)
  resp.status = "ok"
  resp.msg = msg
  return resp
}

function createFailureResponse(msg) {
  let resp = Object.assign({}, responseTemplate)
  resp.status = "fail"
  resp.msg = msg
  return resp
}

function isEmpty(obj) {
  return ((obj === '') || (obj == null))
}

async function getUserIndex(username) {
  var index = null
  try {
    index = await db.getIndex("/userlist", username, "username")
    if (index < 0) { index = null }
  } catch(error) {}
  return index
}

async function userExists(username) {
  const index = await getUserIndex(username)
  return !isEmpty(index)
}

async function addUser(userDbItem) {
  var ret = false
  try {
    await db.push("/userlist[]", userDbItem, true)
    ret = true
  } catch(error) {
    console.log(error)
  }
  return ret
}

async function deleteUser(username) {
  var ret = false
  try {
    const index = await getUserIndex(username)
    if (!isEmpty(index)) {
      await db.delete("/userlist[" + index + "]")
      ret = true
    }
  } catch(error) {
    console.log(error)
  }
  return ret
}

async function getUserData(username) {
  let userData = null
  try {
    let index = await getUserIndex(username)
    if (!isEmpty(index)) {
      userData = await db.getData("/userlist[" + index + "]")
    }
  } catch(error) {
    console.log(error)
  }
  return userData
}

async function updateUserData(userData) {
  let result = false
  try {
    let index = await getUserIndex(userData.username)
    if (!isEmpty(index)) {
      await db.push("/userlist[" + index + "]", userData, true)
      result = true
    }
  } catch(error) {
    console.log(error)
  }
  return result
}

async function verifyUserPassword(username, password) {
  var ret = false
  let userData = await getUserData(username)
  if (!isEmpty(userData)) {
    ret = (userData.password == password)
  }
  return ret
}

async function generateSessionToken(username, ip, authfi_uid = null) {
  var token = null
  try {
    let index = await getUserIndex(username)
    let payload = {
      username: username,
      ip: ip
    }
    if (authfi_uid != null) { payload.authfi_uid = authfi_uid }
    token = jwt.sign(payload, jwtSecret, {expiresIn: '1h'})
  } catch(error) {
    console.log(error)
  }
  return token
}

async function getAuthorizedUser(authorization, ip) {
  if (isEmpty(authorization)) { return null }
  let userData = null
  const token = authorization.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, jwtSecret)
    if (!isEmpty(decoded) && decoded.ip == ip) {
      userData = await getUserData(decoded.username)
      if (decoded.authfi_uid != null && userData.authfi_uid != userData.authfi_uid) {
        userData = null
      }
    }
  } catch(error) {}
  return userData
}

async function checkUserCredential(username, authfi_uid, credential_id) {
  let pass = false
  const userData = await getUserData(username)
  if (!isEmpty(userData)) {
    pass = (userData.authfi_uid == authfi_uid) && userData.authfi_keys.includes(credential_id)
  }
  return pass
}

////////////////////////////////////////////////////////////////////////////////

app.use(bodyParser.json())

app.get('/', function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  res.redirect('/index.html')
})

app.get('/index.html', function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  fs.readFile('./web/html/index.html', function(err, content) {
    if (err) { throw err }
    res.writeHeader(200, {"Content-Type": "text/html"})
    res.write(content)
    res.end()
  })
})

app.get('/mindex.html', function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  fs.readFile('./web/html/mindex.html', function(err, content) {
    if (err) { throw err }
    res.writeHeader(200, {"Content-Type": "text/html"})
    res.write(content)
    res.end()
  })
})

app.get('/js/base64.js', function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  fs.readFile('./web/js/base64.js', function(err, content) {
    if (err) { throw err }
    res.writeHeader(200, {"Content-Type": "text/javascript"})
    res.write(content)
    res.end()
  })
})

app.get('/js/tools.js', function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  fs.readFile('./web/js/tools.js', function(err, content) {
    if (err) { throw err }
    res.writeHeader(200, {"Content-Type": "text/javascript"})
    res.write(content)
    res.end()
  })
})

app.get('/.well-known/assetlinks.json', function (req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  fs.readFile('./web/res/assetlinks.json', function(err, content) {
    if (err) { throw err }
    res.writeHeader(200, {"Content-Type": "application/json"})
    res.write(content)
    res.end()
  })
})

app.get('/.well-known/apple-app-site-association', function (req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  fs.readFile('./web/res/apple-app-site-association', function(err, content) {
    if (err) { throw err }
    res.writeHeader(200, {"Content-Type": "application/json"})
    res.write(content)
    res.end()
  })
})

app.get('/bg.png', function (req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  fs.readFile('./web/res/bg.png', function(err, content) {
    if (err) { throw err }
    res.writeHeader(200, {"Content-Type": "image/png"})
    res.write(content)
    res.end()
  })
})

app.get('/signup', async function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  const username = req.query.u
  const passwordLess = !(req.query.p == '1')
  const authenticatorAttachment = req.query.at
  const exist = await userExists(username)
  if (exist) {
    res.json(createFailureResponse("Username already exists"))
    return
  }
  var resp = createFailureResponse("Unknown error")
  if (!passwordLess) {
    resp = createSuccessResponse()
  }
  else {
    const accountName = username
    const userName = username
    try {
      let result = await webauthn.doRegisterOption(accountName, userName, {authenticatorAttachment})
      if (result.code === 0) {
        const options = result.fido_register_request
        resp = createSuccessResponse({options: options})
      }
      else {
        resp = createFailureResponse("Error code: " + result.code)
      }
    } catch(error) {
      console.log(error);
      resp = createFailureResponse(error.message)
    }
  }
  console.log("Resp: ", resp)
  res.json(resp)
})

app.post('/signup', async function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Body: ", req.body)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  if (req.body == null) {
    res.json(createFailureResponse("Invalid user data"))
    return
  }
  let username = req.body.username
  let password = req.body.password
  let credential= req.body.credential
  if (isEmpty(username) || (isEmpty(password) && isEmpty(credential))) {
    res.json(createFailureResponse("Invalid user data"))
    return
  }
  const exist = await userExists(username)
  if (exist) {
    res.json(createFailureResponse("Username already exists"))
    return
  }
  var resp = createFailureResponse("Unknown error")
  if (isEmpty(credential)) { // password
    let userDbItem = Object.assign({}, userDbItemTemplate)
    userDbItem.username = username
    userDbItem.password = password
    if (addUser(userDbItem)) {
      let token = await generateSessionToken(username, req.ip)
      resp = createSuccessResponse({token: token})
    }
    else {
      resp = createFailureResponse("Failed to sign up")
    }
  }
  else {
    try {
      let result = await webauthn.registerResult(credential)
      if (result.code === 0) {
        const authfi_uid = result.uid
        const keyInfo = result.key_info
        let userDbItem = Object.assign({}, userDbItemTemplate)
        userDbItem.username = username
        userDbItem.authfi_uid = authfi_uid
        userDbItem.authfi_keys = [keyInfo.credential_id]
        if (addUser(userDbItem)) {
          let token = await generateSessionToken(username, req.ip, authfi_uid)
          resp = createSuccessResponse({token: token})
        }
        else {
          // TODO: deal with addUser failure
          resp = createFailureResponse("Failed to sign up")
        }
      }
      else {
        resp = createFailureResponse("Error code: " + result.code)
      }
    } catch(error) {
      console.log(error);
      resp = createFailureResponse(error.messsage)
    }
  }
  console.log("Resp: ", resp)
  res.json(resp)
})

app.get('/signin', async function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  const username = req.query.u
  const fidoAuth = (req.query.t == '1')
  let passwordAuth = false
  if (!isEmpty(username)) {
    passwordAuth = (req.query.p == '1')
    const exist = await userExists(username)
    if (!exist) {
      res.json(createFailureResponse("User not found"))
      return
    }
  }

  var resp = createFailureResponse("Unknown error")
  if (passwordAuth && !fidoAuth) {
    resp = createSuccessResponse()
  }
  else {
    const accountName = username
    try {
      let result = isEmpty(accountName) ? await webauthn.loginOption() : await webauthn.verifyOption(accountName)
      if (result.code === 0) {
        const options = isEmpty(accountName) ? result.fido_login_request : result.fido_auth_request
        resp = createSuccessResponse({options: options})
      }
      else {
        resp = createFailureResponse("Error code: " + result.code)
      }
    } catch(error) {
      console.log(error);
      resp = createFailureResponse(error.message)
    }
  }
  console.log("Resp: ", resp)
  res.json(resp)
})

app.post('/signin', async function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Body: ", req.body)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  if (req.body == null) {
    res.json(createFailureResponse("Invalid user data"))
    return
  }
  let username = req.body.username
  let password = req.body.password
  let credential= req.body.credential
  if ((!isEmpty(password) && isEmpty(username)) || (isEmpty(password) && isEmpty(credential))) {
    res.json(createFailureResponse("Invalid user data"))
    return
  }
  let isFailed = false
  var resp = createFailureResponse("Unknown error")
  if (!isEmpty(password)) {
    const pass = await verifyUserPassword(username, password)
    if (!pass) {
      resp = createFailureResponse("Incorrect username or password")
      isFailed = true
    }
  }
  let authfi_uid = null
  if (!isFailed && !isEmpty(credential)) {
    try {
      let result = isEmpty(username) ? await webauthn.loginResult(credential) : await webauthn.verifyResult(credential)
      if (result.code !== 0) {
        resp = createFailureResponse("Error code: " + result.code)
        isFailed = true
      }
      else if (isEmpty(username) && isEmpty(result.user)) {
        resp = createFailureResponse("User not found")
        isFailed = true
      }
      else {
        authfi_uid = result.uid
        if (isEmpty(username)) {
          username = result.user.name
          authfi_uid = result.user.id
        }
        const credential_id = result.key_info.credential_id
        const pass = await checkUserCredential(username, authfi_uid, credential_id)
        if (!pass) {
          resp = createFailureResponse("User verification failed")
          isFailed = true
        }
      }
    } catch(error) {
      console.log(error)
      resp = createFailureResponse(error.messsage)
      isFailed = true
    }
  }
  if (!isFailed) {
    let token = await generateSessionToken(username, req.ip, authfi_uid)
    resp = createSuccessResponse({token: token})
  }
  console.log("Resp: ", resp)
  res.json(resp)
})

app.get('/registerkey', async function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  const userData = await getAuthorizedUser(req.header('Authorization'), req.ip)
  if (isEmpty(userData)) {
    res.writeHeader(401, {"Content-Type": "application/json"})
    res.json(createFailureResponse("Unauthorized"))
    return
  }

  const accountName = userData.username
  const userName = userData.username
  const authenticatorAttachment = req.query.at
  let resp = createFailureResponse("Unknown error")
  try {
    let result = await webauthn.doRegisterOption(accountName, userName, {authenticatorAttachment})
    if (result.code === 0) {
      const options = result.fido_register_request
      resp = createSuccessResponse({options: options})
    }
    else {
      resp = createFailureResponse("Error code: " + result.code)
    }
  } catch(error) {
    console.log(error)
    resp = createFailureResponse(error.message)
  }
  console.log("Resp: ", resp)
  res.json(resp)
})

app.post('/registerkey', async function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Body: ", req.body)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  const userData = await getAuthorizedUser(req.header('Authorization'), req.ip)
  if (isEmpty(userData)) {
    res.writeHeader(401, {"Content-Type": "application/json"})
    res.json(createFailureResponse("Unauthorized"))
    return
  }

  const username = userData.username
  const credential= req.body.credential
  if (isEmpty(credential)) {
    res.json(createFailureResponse("Invalid credential"))
    return
  }
  var resp = createFailureResponse("Unknown error")
  try {
    let result = await webauthn.registerResult(credential)
    if (result.code === 0) {
      const authfi_uid = result.uid
      const keyInfo = result.key_info
      let userDbItem = userData
      if (isEmpty(userDbItem.authfi_uid)) { userDbItem.authfi_uid = authfi_uid }
      if (isEmpty(userDbItem.authfi_keys)) { userDbItem.authfi_keys = [keyInfo.credential_id] }
      else { userDbItem.authfi_keys.push(keyInfo.credential_id) }
      if (updateUserData(userDbItem)) {
        resp = createSuccessResponse()
      }
      else {
        // TODO: deal with updateUserData failure
        resp = createFailureResponse("Failed to sign up")
      }
    }
    else {
      resp = createFailureResponse("Error code: " + result.code)
    }
  } catch(error) {
    console.log(error);
    resp = createFailureResponse(error.messsage)
  }
  console.log("Resp: ", resp)
  res.json(resp)
})

app.get('/userinfo', async function(req, res) {
  console.log()
  console.log(req.method, req.path)
  console.log("Parameters: ", req.query)
  console.log("User-Agent: ", req.header('User-Agent'))
  console.log("IP: ", req.ip)

  const userData = await getAuthorizedUser(req.header('Authorization'), req.ip)
  let resp
  if (isEmpty(userData)) {
    res.writeHeader(401, {"Content-Type": "application/json"})
    resp = createFailureResponse("Unauthorized")
  }
  else {
    resp = createSuccessResponse(userData)
  }
  console.log("Resp: ", resp)
  res.json(resp)
})

////////////////////////////////////////////////////////////////////////////////

if (process.env.NODE_ENV == "dev") {
  app.listen(80, function() {
    console.log("listening port 80")
  })
}
else {
  let options = {key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath)}
  let server = https.createServer(options, app)
  server.listen(443, function() {
    console.log("listening port 443")
  })
}
