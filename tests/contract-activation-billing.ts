import type {CheckoutContractActivation} from '../lib/contract-funding';
export const activationObservations:{calls:CheckoutContractActivation[];accept:boolean}={calls:[],accept:false};
export async function activateCheckoutContract(input:CheckoutContractActivation):Promise<boolean>{
 activationObservations.calls.push(input);return activationObservations.accept;
}
