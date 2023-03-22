'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser   = require('body-parser');
// const multer = require('multer');  
// const pgSession = require('connect-pg-simple')(session);
// const parseurl = require('parseurl');
const crypto = require('crypto');
const db = require('./db.js');
const getHandler = require('./handlers/get');
const postHandler = require('./handlers/post');
const apiHandler = require('./handlers/api');

// TODO client formからユーザの有無などをfetch取得するAPI実装(token用意)
const app = express()
const development = process.env.DEVELOPMENT ? true : false;

app.set('port', process.env.PORT || 5000)
app.set("view engine", 'ejs')
// if(process.env.DEVELOPMENT) {
//   app.set('env', 'development');
// }
if(!development){
  app.set('trust proxy', 1)
}

// TODO HTTP only?
app.use('/static', express.static(__dirname + '/public'))
app.use(session({
  // store: new pgSession({
  //   pool: db.pgPool,
  // }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 60 * 60 * 1000, // 1hour
    secure: !development,
  }
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(multer())

app.get('/get', getHandler.top);

app.get('/', (req,res) => {
  // console.log(req.session.id);
  const user_name = req.session.name;
  // req内のsessionIDを保存されたものと照合
  if(!user_name || 
    !db.logined_users.get(user_name)===req.session.id){
    res.redirect('/login');
    return;
  }

  ;(async () => {
    try {
      const client = await db.pgPool
                    .connect();
      const q1 = 'SELECT name,passhash from users where name=$1';
      const user = await client
                  .query(q1,[user_name]);
      switch(user.rowCount) {
        case 1: // DB照会成功
          const q2 = 'SELECT okini from records where name=$1'
          const record = await client
                          .query(q2, [user.rows[0].name])
          const people = record.rows.map(x => x.okini)
          res.render('top', {people: people})
          return;
        case 0:
          res.redirect('/login');  
          return;      
        default: // sessionIDは登録されているがDB照会に失敗(ある??)
          // ユーザ重複してたら管理者用にログ残す
          console.log('user name ' + user_name + ' is doubled')
          res.redirect('/login');
          return; // redirect後にreturnしないと処理が継続する
      }
    } catch (e) { // DBへの接続エラー
      // if (e.code == 'ECONNREFUSED') {
        console.error(e.stack)
        res.writeHead(500, {'Content-Type': 'text/html'})
        return res.end("500 Internal Server Error")
    // } finally {
    //   client.release()
    }
  })()
})

// ログインページの公開
app.get('/login', (req,res) => {
  res.render('login',{})
})

// 登録ページの公開
app.get('/register', (req,res) => {
  res.render('register',{})
})

// request <http.IncomingMessage>
// response <http.ServerResponse>
app.post('/login_confirm', (req,res) => {
  if (!req.body) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end("404 Not Found");
  }
  const user_name = req.body.user_name
  const password = req.body.password
  const passhash = crypto.createHash('sha256').update(password, 'utf8').digest('hex')

  ;(async () => {
    try {
    // TODO returnとfinally? clientはtry内に?
    // async関数の戻り値はPromise.resolveでwrapされる
      const client = await db.pgPool
                     .connect()
      const q = 'SELECT passhash from users where name=$1 AND passhash=$2'
      const user = await client
                     .query(q, [user_name,passhash])
      if(user.rowCount!==1){ // ユーザ取得失敗
        console.log("there is no user " + user_name)
        res.redirect('/login');
        return;
      }
      if(!db.logined_users.has(user_name)){
          db.logined_users.set(user_name,req.sessionID);
      }
      req.session.name = user_name;
      req.session.save(err => {
        if(err){
          throw err;
          // res.end('session save error: ' + err)
          // return
        }
        res.redirect('/');
        return;
      })
    } catch(e) { // DB接続失敗
      // if (e.code == 'ECONNREFUSED') {
      console.error(e.stack)
      res.writeHead(500, {'Content-Type': 'text/html'})
      return res.end("500 Internal Server Error")  
    // TODO why??    
          // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
    // } finally {
    //   client.release()
    }
  })() // Promise.resolve(res)が返ってくる
})

// 会員登録処理
app.post('/register_confirm', (req, res) => {
  if (!req.body) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end("404 Not Found");
  }
  const user_name = req.body.user_name
  const password = req.body.password
  const passhash = crypto.createHash('sha256').update(password, 'utf8').digest('hex')

  ;(async () => {
    const client = await db.pgPool
                    .connect()
                    // .catch(e => {throw(e)})
    let q = 'SELECT passhash from users where name=$1'
    
    try {
      const user = await client
                  .query(q, [user_name])
      switch(user.rowCount) {
        case 0:
          q = 'INSERT INTO users(name,passhash) VALUES($1,$2)'
          break;
        case 1:
          // 既存だったらpasswordの再設定画面
          res.render('password_update',{user_name: user_name})
          return;
        default:
          // ユーザ重複してたら管理者用にログ残す
          console.log('user name ' + user_name + ' is doubled')
          res.render('password_update',{user_name: user_name})
          return;        
      }
      await client.query(q, [user_name,passhash])

      if(!db.logined_users.has(user_name)){
        db.logined_users.set(user_name,req.sessionID)
      }
      req.session.name = user_name;
      req.session.save(err => {
        if(err){
          throw err;
          // res.end('session save error: ' + err)
          // return
        }
        res.redirect('/');
        return;
      })
    } catch (e) {
      console.log(e.stack)
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");  
    }
  })()
})

// app.post('/logout', (req,res) => {
//   const sessionID = req.sessionID
//   if(logined_sessions.indexOf(sessionID)>=0){
//     logined_sessions.splice(
//       logined_sessions.indexOf(sessionID),1
//     )
//   }
//   res.writeHead(303, {
//     'Location': '/login'
//   })
//   return res.end()
// })

app.post('/logout', postHandler.logout);

app.get('/api/users', apiHandler.users);

module.exports = app



// const handleDBConnectError = e => {
//   console.error("DBConnect", e)
//   process.exit(1)
// }
