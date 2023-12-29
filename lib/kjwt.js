import jwt from "jsonwebtoken";

export function signUser(user_id, username, kind) {
    return jwt.sign(
        { user_id, username, kind },
        process.env.FA_TEST_JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "2h",
        }
    );
}