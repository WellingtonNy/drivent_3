
import { Hotel } from "@prisma/client";
import { prisma } from "@/config";
import faker from "@faker-js/faker";


export async function hotelT (params: Partial<Hotel> = {}): Promise<Hotel> {

  const image: string= faker.image.dataUri() || params.image  
   const name: string = faker.company.companyName() || params.name   

   return prisma.hotel.create({ data: {name,image,}})
}