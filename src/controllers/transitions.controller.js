import {transationsSchema} from "../index.js"
import dayjs from 'dayjs';
import { userCollection, sessionsCollection, transitionsCollection } from "../database/db.js"

async function getCarteira (req, res){
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if(!token){
        return res.sendStatus(401);
    }

    try{
        const session = await sessionsCollection.findOne({token})
        const user = await userCollection.findOne({_id: session?.userId})

        if(!user){
            return res.sendStatus(401);
        }

        const usuario = user._id;

        const transitions = await transitionsCollection.find({userId: usuario}).toArray();
        
        /*const userTransitions = transitions.filter(
            (t)=> t.userId === usuario
        );*/

        res.send(transitions);
    }catch(err){
        res.sendStatus(500)
    }
}

async function postEntrada(req,res){
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
        const session = await sessionsCollection.findOne({token})
        const user = await userCollection.findOne({_id: session?.userId})
        const nome = await userCollection.findOne({_id: user._id})

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
        await transitionsCollection.insertOne(transition);
        res.send(transition);
    }catch(err){
        res.sendStatus(500);
    }

}

async function postSaida(req,res){
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
        const session = await sessionsCollection.findOne({token})
        const user = await userCollection.findOne({_id: session?.userId})
        const nome = await userCollection.findOne({_id: user._id})

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
        await transitionsCollection.insertOne(transition);
        res.send(transition);
    }catch(err){
        res.sendStatus(500);
    }

}

export{
    getCarteira,
    postEntrada,
    postSaida
}