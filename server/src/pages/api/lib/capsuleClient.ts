import { CapsuleWeb, Environment } from "@usecapsule/web-sdk";

const CAPSULE_ENV: Environment = process.env.VITE_CAPSULE_ENV as Environment;
const CAPSULE_API_KEY = process.env.VITE_CAPSULE_API_KEY;

const capsuleClient = new CapsuleWeb(CAPSULE_ENV, CAPSULE_API_KEY,{
    
});

export default capsuleClient;
