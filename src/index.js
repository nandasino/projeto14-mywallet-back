import express, { application } from 'express';
import cors from 'cors';
import joi from 'joi';
import dotenv from 'dotenv';
import { MongoClient } from "mongodb";
import bcrypt from 'bcrypt';
import {v4 as uuidV4} from 'uuid';
import dayjs from 'dayjs';

const userSchema = joi.object({
    name: joi.string().required().min(3).max(100),
    password: joi.string().required(),
    email: joi.string().email().required(),
    check: joi.string().required()
})
const transationsSchema = joi.object({
    value: joi.string().required().min(1),
    description: joi.string().required().min(1),
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
            return res.sendStatus(401).send({message: "Esse e-mail já é cadastrado!"});
        }

        const {error} = userSchema.validate(user, {abortEarly: false});

        if(error){
        const errors = error.details.map(detail=> detail.message);
        return res.status(400).send(errors);
        }

        if(user.password!== user.check){
            return res.sendStatus(401).send({message: "senhas diferentes"});
        }

        const hashPassword = bcrypt.hashSync(user.password, 10);
        delete user.check;

        await userCollection.insertOne({...user, password : hashPassword});
        res.sendStatus(201);

    }catch(err){
        res.status(500).send(err);
    }
})

app.post("/", async (req, res)=>{
    const { email, password } = req.body;

    const token = uuidV4();

    try{
        const userExists = await userCollection.findOne({ email });
        if(!userExists){
            return res.sendStatus(401).send({message: "E-mail não cadastrado"})
        }
    
        const samePassword = bcrypt.compareSync(password, userExists.password)

        if(!samePassword){
            return res.sendStatus(401).send({message: "Senha incorreta"})
        }

        const session = {
            token,
            userId: userExists._id,
            name: userExists.name,
        }

        await db.collection("sessions").insertOne(session)
        
        res.send(session)
    }catch(err){
        res.sendStatus(500).send(err);
    }
});

app.get("/carteira", async (req, res)=>{
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if(!token){
        return res.sendStatus(401);
    }

    try{
        const session = await db.collection("sessions").findOne({token})
        const user = await userCollection.findOne({_id: session?.userId})

        if(!user){
            return res.sendStatus(401);
        }

        const usuario = user._id;

        const transitions = await db.collection("transitions").find({userId: usuario}).toArray();
        
        /*const userTransitions = transitions.filter(
            (t)=> t.userId === usuario
        );*/

        res.send(transitions);
    }catch(err){
        res.sendStatus(500)
    }
})

app.post("/entrada", async(req,res)=>{
    const {value, description} = req.body;

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if(!token){
        return res.sendStatus(401);
    }

    const validation = transationsSchema.validate(req.body, {abortEarly:false});

    if(validation.error){
        const errors = validation.error.details.map((detail)=>detail.message);
        res.status(422).send(errors);
        console.log(errors);
        return;
    }
    try{
        const session = await db.collection("sessions").findOne({token})
        const user = await userCollection.findOne({_id: session?.userId})
        const nome = await db.collection("users").findOne({_id: user._id})

        if(!user){
            return res.sendStatus(401);
        }

        const transition ={
            name: nome.name,
            userId: user._id,
            value,
            type: "entrada",
            description,
            day: dayjs().format('DD/MM')
        }
        await db.collection("transitions").insertOne(transition);
        res.send(transition);
    }catch(err){
        res.sendStatus(500);
    }

})
app.post("/saida", async(req,res)=>{
    const {value, description} = req.body;

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if(!token){
        return res.sendStatus(401);
    }

    const validation = transationsSchema.validate(req.body, {abortEarly:false});

    if(validation.error){
        const errors = validation.error.details.map((detail)=>detail.message);
        res.status(422).send(errors);
        console.log(errors);
        return;
    }
    try{
        const session = await db.collection("sessions").findOne({token})
        const user = await userCollection.findOne({_id: session?.userId})
        const nome = await db.collection("users").findOne({_id: user._id})

        if(!user){
            return res.sendStatus(401);
        }

        const transition ={
            name: nome.name,
            userId: user._id,
            value,
            type: "saida",
            description,
            day: dayjs().format('DD/MM')
        }
        await db.collection("transitions").insertOne(transition);
        res.send(transition);
    }catch(err){
        res.sendStatus(500);
    }

})


app.listen(5000, ()=> console.log("server running in port 5000"));
