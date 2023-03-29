const db = require('../db.js');

const top = (req,res) => {
    ;(async () => {
        try {
          // TODO sessionIDで引く(session tabelにuser名追加?)
          const client = await db.pgPool
                        .connect()
          const q1 = 'SELECT name,passhash from users where name=$1'
          const user = await client
                      .query(q1,['miura'])
          if (user.rowCount == 1) {
            // sessionID照会成功
            const q2 = 'SELECT okini from records where name=$1'
            const record = await client
                              .query(q2, [user.rows[0].name])
            const people = record.rows.map(x => x.okini)
            res.render('top', {people: people})
          } else { // sessionIDは登録されているがDB照会に失敗(ある??)
            res.redirect('/login');
            return;
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
}

module.exports = {top: top}