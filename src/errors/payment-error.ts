import { ApplicationError } from "@/protocols";

export function paymentErrors (message: string): ApplicationError {
    return { name: 'PaymentErrors', message,}
  }