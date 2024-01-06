export default function Login() {
    return (<div>
        <h3>Log in</h3>
        <form id="form-login">
            <label htmlFor="text-username">Username: <input type="text" id="text-username"></input></label>
            <label htmlFor="password-password">Password: <input type="password" id="password-password"></input></label>
        </form>
    </div>);
}