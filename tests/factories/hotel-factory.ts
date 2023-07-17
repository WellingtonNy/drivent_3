
import { Hotel } from "@prisma/client";
import { prisma } from "@/config";
import faker from "@faker-js/faker";



export async function criarHotel (): Promise<Hotel> {
   const image: string= faker.image.dataUri()
   const name: string = faker.company.companyName()   
   return prisma.hotel.create({ data: {name,image,}})
}



export async function deletarHotel(id: number) {
  await prisma.room.deleteMany({ where: { hotelId: id, } })
  await prisma.hotel.delete({ where: { id,} })
}



export async function criarQuarto(hotelId: number) {
  return prisma.room.create({
      data: {
      name: faker.address.cityName(),
      capacity: Number(faker.random.numeric()),
      hotelId }
  })
}


