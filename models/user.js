var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: String,
    awards: [{
        name: String,
        img: String
    }],
    userGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    userEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }]
});

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        var returnJson = {
            id: ret._id,
            email: ret.email,
            name: ret.name,
            userGroups: ret.userGroups
        };
        return returnJson;
    }
});

UserSchema.methods.authenticated = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null, res ? this : false);
        }
    });
};

UserSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
        next();
    } else {
        this.password = bcrypt.hashSync(this.password, 10);
        next();
    }
});

module.exports = mongoose.model('User', UserSchema);
