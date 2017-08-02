var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var app = express();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");

// Let's us use Bodyparser
app.use(bodyParser.urlencoded({extended: true}));
// Use ejs as the extension
app.set("view engine", "ejs");
// Use the static files in the public directory
app.use(express.static(__dirname + "/public"));
// Use the method override function (Update route)
app.use(methodOverride("_method"));
// Set port to 5000
app.set("port", (process.env.PORT || 5000));
// Routing on port 5000
var server = app.listen(app.get("port"), function() {
  console.log("Social media application has started on port", app.get("port"));
});
// Setup for Login Auth
var session = require("express-session")({
    secret: "srhserhsrsrh",
    resave: false,
    saveUninitialized: false
});
// Authentication
app.use(session);
// Need anytime you use passport (required)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// Encoding and decoding the session (required)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Database Handling
mongoose.connect("mongodb://vihanga:qwe123@ds127883.mlab.com:27883/social_media");
// =========================
// LOGIN ROUTES
// =========================
// Login logic (post route)
app.post("/login", passport.authenticate("local", {
        successRedirect: "/feed",
        failureRedirect: "/login"
    }), function(req, res){
});
// Logout logic
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});
// =========================
// ISLOGGEDIN MIDDLEWARE
// =========================
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

/////////////////////////////////////////////////////////
//////////////////////// Routes /////////////////////////
/////////////////////////////////////////////////////////

// Get routes
app.get("/", function(req, res){
    res.render("landing");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register", {userTaken: false});
});

app.get("/feed", isLoggedIn, function(req, res){
    currUser = req.user;
    var friendsArrPromises = currUser.friends.map(function(eachFriend){
        return new Promise(function(resolve, reject){
            User.findById(eachFriend, function(err, friend){
                if(err){
                    reject(err);
                } else {
                    console.log("This is my friend I'm adding" + friend);
                    resolve(friend);
                }        
            });
        });
    });
    Promise.all(friendsArrPromises).then(function(friendsArr){
        console.log("This is the final friends list" + friendsArr);        
        res.render("feed", {uData: req.user, friends: friendsArr});
    });
});

app.get("/follow/:id", isLoggedIn, function(req, res){
    req.user.friends.push(req.params.id);
    req.user.save()
    console.log(req.user);
    res.redirect("/feed");
});

app.get("/about", isLoggedIn, function(req, res){
    res.render("about", {uData: req.user});
})

app.get("/friends", isLoggedIn, function(req, res){
    currUser = req.user;
    var friendsArrPromises = currUser.friends.map(function(eachFriend){
        return new Promise(function(resolve, reject){
            User.findById(eachFriend, function(err, friend){
                if(err){
                    reject(err);
                } else {
                    console.log("This is my friend I'm adding" + friend);
                    resolve(friend);
                }        
            });
        });
    });
    Promise.all(friendsArrPromises).then(function(friendsArr){
        console.log("This is the final friends list" + friendsArr);
        res.render("friends", {uData: req.user, friends: friendsArr});
    });
});

app.get("/profile/:id", isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, oData){
        res.render("showprofile", {uData: req.user, oData: oData});
    });    
});

app.get("/edit", isLoggedIn, function(req, res){
    console.log(req.user);
    res.render("editprofile", {uData: req.user});
});

// Post routes
app.post("/feed", isLoggedIn, function(req, res){
    console.log("Post route was a success!");
    User.findById(req.user.id, function(err, user){
        console.log(user);
        console.log(req.body.statusUpdate);
        if(err){
            console.log(err);
            res.redirect("/feed");
        } else {
            var post = {
                body: req.body.statusUpdate,
                likes: []
            }
            user.posts.push(post);
            console.log(user.posts);
            user.save()
            res.redirect("/feed");
        }
    })
});

app.post("/search", isLoggedIn, function(req, res){
    var searchPromise = new Promise(function(resolve, reject){
        User.find({name: {"$regex" : req.body.searchValue, "$options": "i"}}, function(err, users){
            if(err){
                console.log("Promise was rejected");
                reject(err);
            } else {
                console.log("Promise was resolved");
                resolve(users);
            }
        });
    });
    
    searchPromise.then(function(fromResolve){
        console.log(fromResolve);
        res.render("search", {uData: req.user, users: fromResolve, searchString: req.body.searchValue});
    });
});

// Update routes
app.put("/edit", isLoggedIn, function(req, res){
    User.findByIdAndUpdate(req.user.id, req.body.data, function(err, updatedUser){
        if(err){
            res.redirect("/feed");
        } else {
            res.redirect("/edit");
        }
    });
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username, name: req.body.name, email: req.body.email, gender: req.body.gender, birthday: req.body.birthday}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {userTaken: true});
        } else {
            passport.authenticate("local")(req,res, function(){
                res.redirect("/feed");
            });
        }
    });
});