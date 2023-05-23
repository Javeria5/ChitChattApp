const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
//name email password pic 

const userSchema = mongoose.Schema({
    name: { type:String, required: true},
    email: { type:String, required: true, unique: true},
    password: { type:String, required: true},
    pic: { type:String,  default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" },
},
    
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password);
}

//here pre said before adding we have to do this  //next isliye bcz yeh middleware treat kryga
userSchema.pre('save', async function(next){
    if(!this.isModified){
        next()
    }
    //before saving user in database it will encrypt the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
}) 
const User = mongoose.model("User", userSchema);
module.exports = User;