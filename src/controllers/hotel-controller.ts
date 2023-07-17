import httpStatus from "http-status";
import { AuthenticatedRequest } from "../middlewares";
import { Response , NextFunction } from "express";
import { Hotel } from "@prisma/client";
import { hotelObjServ } from "../services";


export async function hotelC (req: AuthenticatedRequest, res: Response, next: NextFunction) {
 
        try {
     const cliente = req.userId
     const resultado: Hotel[] = await hotelObjServ.quartoHotel(cliente)
     return res.status(httpStatus.OK).json(resultado)
   } 
   catch (error) {
    if (error.name === 'PaymentErrors2') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message)
    }
     next(error)
     console.log('error')
   }
 }

 //status 402

 export async function quartoC (req: AuthenticatedRequest, res: Response, next: NextFunction) {
   try {
     const cliente = req.userId
     const hotelId = req.params.hotelId
     const resultado = await hotelObjServ.escolhaQuarto(cliente, Number(hotelId));
     return res.status(httpStatus.OK).json(resultado);
   } 
   catch (error) {
    if (error.name === 'PaymentErrors2') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message)
    }
     next(error)
     console.log('error')
   }
 }
