"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCharge = void 0;
const AddCharge = (amount) => {
    let newAmount = Math.ceil(amount * 0.01) + amount;
    return newAmount;
};
exports.AddCharge = AddCharge;
