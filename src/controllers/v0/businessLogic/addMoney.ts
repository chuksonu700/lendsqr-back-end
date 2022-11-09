const  got = require("got");
import {ENV} from '../../../config'
import { createLogger } from '../../../utils/logger';

const logger =createLogger("Fund Account")
const addMoney= async (amount:Number,transId:string,full_name:string)=>{
try {
    logger.info("Generating Fund Link");
    console.log(ENV.FLW_SECRET_KEY);
    
    const response = await got.post("https://api.flutterwave.com/v3/payments", {
        headers: {
            Authorization: `Bearer ${ENV.FLW_SECRET_KEY}`
        },
        json: {
            tx_ref: transId,
            amount,
            currency: "NGN",
            redirect_url: `http://localhost:8000/api/v0/transaction/fund-account-callback`,
            customer: {
                email:ENV.PAYMENT_EMAIL,
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
export default addMoney;