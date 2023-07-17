
import ticket from "@/repositories/tickets-repository";
import { paymentErrors } from "../../errors/payment-error";
import {  notFoundError } from "@/errors";
import { Room ,  Hotel } from "@prisma/client";
import hotelObj from "@/repositories/hotel-repository";
import { allHotel, semHotel } from "../../errors/hotel-error";
import enrollmentRepository from "@/repositories/enrollment-repository";



export async function escolhaQuarto (userId: number, hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
   const cliente = await enrollmentRepository.findWithAddressByUserId(userId)
   if (!cliente) throw notFoundError()
   const buyTicket = await ticket.ticketClient(userId)
   if (!buyTicket) throw notFoundError()

   //olk
   const buyTicketS = buyTicket.status;
   if (buyTicket.TicketType.isRemote) throw paymentErrors('Ticket não é para evento presencial');
   if (!buyTicket.TicketType.includesHotel) throw paymentErrors('Ticket não inclui hotel')
   if (buyTicketS !== 'PAID'){
      throw paymentErrors('Ticket aguardando Pagamento')
   } 
    
   const clientRoom = await hotelObj.quarto(hotelId)
   if (!clientRoom) throw semHotel(hotelId)
   return clientRoom;


 }



export async function quartoHotel (userId: number): Promise<Hotel[]> {


   const userRegister = await enrollmentRepository.findWithAddressByUserId(userId)
   if (!userRegister) throw notFoundError()


   const buyTicket = await ticket.ticketClient(userId)
   if (!buyTicket) throw notFoundError()

   //olk
   const buyTicketS = buyTicket.status;
   if (buyTicket.TicketType.isRemote) throw paymentErrors('Ticket não é para evento presencial')
   if (!buyTicket.TicketType.includesHotel) throw paymentErrors('Ticket não inclui hotel');
   if (buyTicketS !== 'PAID') throw paymentErrors('Ticket aguardando Pagamento')


   const allHotelsIntheList: Hotel[] = await hotelObj.listaHotel()
           if (allHotelsIntheList.length < 1) throw allHotel()
 return allHotelsIntheList
 }

export const hotelObjServ = { escolhaQuarto , quartoHotel}