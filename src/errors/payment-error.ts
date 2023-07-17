import { ApplicationError2 } from "@/protocols";

export function paymentErrors (message: string): ApplicationError2 {
    return { name: 'PaymentErrors', message,statusCode:402}
  }