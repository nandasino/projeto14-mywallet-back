import { getCarteira, postEntrada, postSaida } from '../controllers/transitions.controller.js';
import {Router} from 'express';
import { getToken } from '../middlewares/token.middleware.js';

const router = Router();
router.use(getToken);

router.get("/carteira", getCarteira)

router.post("/entrada", postEntrada )

router.post("/saida", postSaida)

export default router;