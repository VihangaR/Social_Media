var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    picture: {type: String, default: "https://ucarecdn.com/49a42193-c6c9-4d39-a583-32f818e2f072/-/crop/736x735/0,96/-/preview/"},
    background: {type: String, default: "http://demo.geekslabs.com/materialize-v1.0/images/user-bg.jpg"},
    name: String,
    gender: String,
    birthday: String,
    email: String,
    interests: {type: String, default: ""},
    favMovies: {type: String, default: ""},
    about: {type: String, default: ""},
    friends: [],
    posts: [{
        body: String,
        likes: [],
        created: {type: Date, default: Date.now}
    }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);