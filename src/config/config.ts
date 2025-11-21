import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const config = {
    port: process.env.PORT || 3000,
    model: process.env.MODEL,
    jwtSecret: process.env.JWT_SECRET,
    apiBasedUrl: process.env.API_BASED_URL
}

export default config;