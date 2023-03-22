const db = require('../db.js');
const url = require('url');

// api/users?name=hoge
const users = (req,res) => {
  const q = url.parse(req.url, true)
  res.writeHead(200, {'Content-Type': 'text/plain'})
  // TODO userIDを返す
  return res.end(q.query.name)
}

module.exports = {
    users:users, 
}