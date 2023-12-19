import { pool } from "../../../lib/database.js";

export const dynamic = true;

export async function GET(request) {
    console.debug('GET /api/user', request.url);
    
    const [rows, fields] = await pool.promise().query('SELECT id, username, kind, clinician_id FROM user LEFT OUTER JOIN patient ON user.id = patient.patient_id');
    const response = Response.json(rows);
    
    console.debug('Respond', response.status, Object.fromEntries(response.headers));
    return response;
}
