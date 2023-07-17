import { ApplicationError } from '@/protocols';



//not found
export function notFoundError(): ApplicationError {
  return {
    name: 'NotFoundError',
    message: 'No result for this search!',
  };
}
