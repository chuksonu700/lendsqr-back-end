
export const AddCharge = (amount:number)=>{
    let newAmount:number = Math.ceil(amount*0.01) + amount
    return newAmount
}
