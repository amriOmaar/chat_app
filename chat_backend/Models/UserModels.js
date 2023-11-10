const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({

    username:{
        type: String,
        required:[true,'Please add your username '],
        unique: true,
        trim: true,
    },
    password:{
        type: String,
        required:[true,'Please add your password '],
        minlength: [6, 'Password must be at least 6 characters '],
    },
    nom: String,
    prenom: String,
    poste: String,
    role: String,
    tel: Number,
},
{
    timestamps: true,
});

module.exports = mongoose.model('User',UserSchema);