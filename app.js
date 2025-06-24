const express = require('express');
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', function (req, res) {
    res.render("index");
});

app.get('/login', function (req, res) {
    res.render("login");
});

app.get('/profile',isloggedIn, function (req, res) {
      console.log(req.user);
      res.render("login");
});

app.get('/register', function (req, res) {
    res.render("index");
});

// ✅ Register Route
app.post('/register', async (req, res) => {
    let { email, username, password, name, age } = req.body;

    let existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).send("User already registered");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let newUser = await userModel.create({
        username,
        email,
        age,
        name,
        password: hash,
    });

    const token = jwt.sign({ email: newUser.email, userid: newUser._id }, "shhhh");
    res.cookie("token", token);
    res.send("registered successfully");
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).send("Incorrect password");

    // ✅ Optional: Create token after login
    const token = jwt.sign({ email: user.email, userid: user._id }, "shhhh");
    res.cookie("token", token);

    // ✅ Show success message
    res.status(200).send("You can login");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


app.get('/logout', function (req, res) {
    res.cookie("token","");
    res.redirect("/login");
});

function isloggedIn(req,res,next){
   if(req.cookies.token === "") {res.send("you must be logged in")
   }
else
{
    let data = jwt.verify(req.cookies.token,"shhhh");
    req.user =  data;
    next();
}
}
app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
