import { getCarteira, postEntrada, postSaida } from '../controllers/transitions.controller.js';
import {Router} from 'express';

const router = Router();


router.get("/carteira", getCarteira)

router.post("/entrada", postEntrada )

router.post("/saida", postSaida)

export default router;