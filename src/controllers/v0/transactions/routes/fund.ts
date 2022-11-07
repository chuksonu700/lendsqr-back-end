const  got = require("got");
import dotenv from 'dotenv';

dotenv.config();
const fundAccount2= async (email:string,amount:Number,transId:string,full_name:string)=>{
try {
    console.log("Sending Payment got");
    console.log(process.env.FLW_SECRET_KEY);
    
    const response = await got.post("https://api.flutterwave.com/v3/payments", {
        headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        },
        json: {
            tx_ref: transId,
            amount,
            currency: "NGN",
            redirect_url: `http://localhost:8000/api/v0/transaction/fund-account-callback`,
            customer: {
                email,
                name: full_name,
            },
            customizations: {
                title: "Demo Credit Add Funds",
                logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
            },
            payment_options: "card, ussd, banktransfer,account"
        }
    }).json();
    return response;
} catch (err:any) {
    console.log("err.code",err.code);
    console.log("err.response.body",err.response.body);
}
}
export default fundAccount2;