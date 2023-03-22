const app = require("express")();
// const http = require("http").createServer(app);
const session = require("express-session");
const bodyParser = require("body-parser");

const session_option = {
  secret: "keyboard cat",
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 60 * 60 * 1000 }, // 1hour
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  session_option.cookie.secure = true;
}

app.use(session(session_option));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// loginフォーム
app.get("/login", (req, res) => {
  res.type("text/html").send(
    `<form method="POST" action="/login">
           <div>username<input type="text" name="username"></div>
           <div>password<input type="password" name="password"></div>
           <div><input type="submit" name="login"></div>
         </form>`
  );
});


// sessionの確認
// loginへのルーティング定義よりも後に書く
app.use((req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect("/login");
    }
});

// トップページ
app.get("/", (req, res) => {
  res.render("index", {
    name: req.query.name || "名無し",
  });
  // res.sendFile(__dirname + "/index.html");
});

app.listen(5001, () => {
  console.log("Listen start.");
});
