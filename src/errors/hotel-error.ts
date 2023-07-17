import { ApplicationError } from "@/protocols";

export function allHotel(): ApplicationError {
 return { name: 'NotFoundError', message: 'N/A , reload'}
}

export function semHotel(id: number): ApplicationError {
  return {name: 'NotFoundError',message: `Registo de id=${id} não encontrado`}
  }

