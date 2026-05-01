// src/lib/amplify-config.ts
// 🟢 จุดฝังชิป Amplify จุดเดียว! ไม่ต้องก๊อปซ้ำทุกไฟล์อีกต่อไป
import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID as string,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
        }
    }
});
