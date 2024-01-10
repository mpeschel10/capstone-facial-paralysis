const SERVER_URL = "http://127.0.0.1:3000";
import { decode } from "urlsafe-base64";

export async function testPostApiLoginJson() {
    const endpoint = SERVER_URL + "/api/login.json";
    
    const username = "jmiranda";
    const password = "jmiranda_password";
    const Authorization = `Basic ${btoa(username + ":" + password)}`;

    try {
        const result = await fetch(endpoint,
            {
                method: "POST",
                headers: {Authorization},
            }
        );
        
        // If response.status === 401, then authentication failed e.g. wrong username or password.
        // In this case, I assume response.status === 200
        
        const jwt = await result.json();
        const payloadString = decode(jwt.split(".")[1]).toString("utf-8");
        const payload = JSON.parse(payloadString);
        console.debug("Got payload as user", payload.username);
        
        return payload.username === "jmiranda" && payload.user_id === 3 && payload.kind === "ADMIN";
    } catch (error) {
        // Error may be thrown if server is not up.
        console.error("Error:", error);
    }
    return false;
    
}
