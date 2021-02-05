import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { generateToken } from './utils.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@relation.msbei.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(()=>{
    console.log('Database Connected');
});


//routers


app.post('/api/users/signin', expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if(user) {
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                interest: user.interest,
                token: generateToken(user)
            });
            return;
        }else{
            res.status(401).send({message:"Invalid password"});
            return;
        }
    }else{
        res.status(401).send({message:"Invalid email"});
    }
}))


app.get('/api/users', expressAsyncHandler(async (req, res) =>{
    const user = await User.find();
    if(user){
        res.send(user);
    }else{
        res.status(401).send({message:"No user exists"});
    }
}));

app.post('/api/users/register', expressAsyncHandler(async(req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        interest: req.body.interest
    });
    const createdUser = await user.save();
    res.send({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        interest: createdUser.interest,
        token: generateToken(createdUser)
    });
}));

app.use((err,req,res,next) => {
    res.status(500).send({message:err.message});
});

// if(process.env.NODE_ENV === 'production'){
//     app.use(express.static('frontend/build'));
// }

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
});