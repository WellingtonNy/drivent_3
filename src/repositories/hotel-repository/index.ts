import { prisma } from "../../config";
import { Room , Hotel } from "@prisma/client";


async function listaHotel(): Promise <Hotel[]>  {
    const result = prisma.hotel.findMany()
    return result
   }


async function quarto(hotelId: number): Promise <Hotel & { Rooms: Room[]}> {

    return prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {Rooms: true},
    })
   }
   
   
   const hotelObj = {quarto, listaHotel}

   export default hotelObj