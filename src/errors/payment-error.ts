import { ApplicationError2 } from "@/protocols";

export function paymentErrors (message: string): ApplicationError2 {
    return { name: 'PaymentErrors2', message,statusCode:402}
  }
