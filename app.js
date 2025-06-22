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

app.get('/register', function (req, res) {
    res.render("register");
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
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            res.status(200).send("You can login");
        } else {
            res.redirect('/login');
        }
    });
});

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
