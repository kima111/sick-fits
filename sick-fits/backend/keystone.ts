import "dotenv/config";
import {createAuth} from "@keystone-next/auth"
import { config, createSchema } from "@keystone-next/keystone/schema";
import { User } from "./schemas/User";
import { Product } from "./schemas/Product";
import { ProductImage } from "./schemas/ProductImage";
import { OrderItem } from "./schemas/OrderItem";
import { Order } from "./schemas/Order";
import { CartItem } from "./schemas/CartItem";
import { Role } from "./schemas/Role";
import {withItemData, statelessSessions} from '@keystone-next/keystone/session'
import { insertSeedData } from "./seed-data";
import { sendPassswordResetEmail } from "./lib/mail";
import { extendGraphqlSchema } from "./mutations";
import { permissionsList } from "./schemas/fields";

const databaseURL = process.env.DATABASE_URL 

const sessionConfig = {
    maxAge: 60*60*24*360,
    secret: process.env.COOKIE_SECRET,
}

const {withAuth} = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    initFirstItem: {
        fields:['name', 'email', 'password'],
    },
    passwordResetLink:{
        async sendToken(args){
            //send the email
            await sendPassswordResetEmail(args.token, args.identity)
        }
    }
})

export default withAuth(config({
        server: {
            cors: {
                origin: [process.env.FRONTEND_URL],
                credentials: true,
            },
        },
        db: {
            adapter: 'mongoose',
            url: databaseURL,
            async onConnect(keystone){
                console.log('connected to the database!');
                if(process.argv.includes('--seed-data'))
                await insertSeedData(keystone);
            },
            
        },
        lists: createSchema({
            User,
            Product,
            ProductImage,
            CartItem,
            OrderItem,
            Order,
            Role,

        }),
        extendGraphqlSchema,
        ui: {
            //show only UI for people who pass this test
            isAccessAllowed: ({session})=> 
                // console.log(session);
                 !!session?.data,
            
        },
        session: withItemData(statelessSessions(sessionConfig),{
            User: `id name email role {${permissionsList.join(' ')}}`,
        }),
    })
);