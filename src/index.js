import express, { application } from 'express';
import cors from 'cors';
import joi from 'joi';
import dotenv from 'dotenv';
import { MongoClient } from "mongodb";
import bcrypt from 'bcrypt';

const userSchema = joi.object({
    name: joi.string().required().min(3).max(100),
    password: joi.string().required(),
    email: joi.string().email().required(),
})

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);

try{
    await mongoClient.connect();
} catch (err) {
    console.log(err);
};

const db = mongoClient.db("autenticacao");
const userCollection = db.collection("users");

app.post("/cadastro", async (req,res)=>{
    const user = req.body;

    try{
        const userExists = await userCollection.findOne({
            email: user.email
        });

        if(userExists){
            return res.sendStatus(409).send({message: "Esse e-mail já é cadastrado!"});
        }

        const {error} = userSchema.validate(user, {abortEarly: false});

        if(error){
        const errors = error.details.map(detail=> detail.message);
        return res.status(400).send(errors);
        }

        const hashPassword = bcrypt.hashSync(user.password, 10);

        await userCollection.insertOne({...user, password : hashPassword});
        res.sendStatus(201);

    }catch(err){
        res.status(500).send(err);
    }
})


app.listen(5000, ()=> console.log("server running in port 5000"));
