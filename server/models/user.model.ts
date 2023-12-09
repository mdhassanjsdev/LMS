import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const emailRegexPatern: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export interface IUser extends Document {
    name: string,
    email: string,
    password: string,
    avatar: {
        url: string
    },
    role: string,
    isVerified: boolean,
    courses: Array<{ courseId: string }>,
    comparePassword: (password: string) => Promise<boolean>,
    signAccessToken: () => string;
    signrefreshToken: () => string;
}


const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        validate: {
            validator: function (value: string) {
                return emailRegexPatern.test(value)
            },
            message: 'please enter valid email'
        },
        unique: true
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    avatar: {
        url: String
    },
    role: {
        type: String,
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseId: String,
        }
    ]
}, {
    timestamps: true
})


userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


// compare Password 

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};


// access token 

userSchema.methods.signAccessToken = async function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
        expiresIn: '5m'
    })
};

// refresh toke 

userSchema.methods.signrefreshToken = async function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
        expiresIn: '3d'
    })
}



const userModel: Model<IUser> = mongoose.model("User", userSchema)

export default userModel