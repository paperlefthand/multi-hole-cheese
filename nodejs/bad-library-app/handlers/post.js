const db = require('../db.js');

const logout = (req,res) => {
    const sessionID = req.sessionID
    if(db.logined_users.has(req.session.name)){
      db.logined_users.delete(req.session.name);
    }
    res.redirect('/login');
    return;
}

module.exports = {
    logout: logout,
}