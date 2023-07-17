import { Router } from "express";
import { hotelC, quartoC } from "../controllers/hotel-controller";
import { authenticateToken } from "@/middlewares";


const hotelRoute = Router();
hotelRoute.all('/*', authenticateToken).get('/', hotelC).get('/:hotelId',quartoC)

export {hotelRoute}