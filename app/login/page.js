export default function Login() {
    return (<div>
        <h3>Log in</h3>
        <form id="form-login" action="/api/login" method="POST" encType="multipart/form-data">
            <label htmlFor="text-username">Username: <input type="text" id="text-username" name="username" /></label>
            <label htmlFor="password-password">Password: <input type="password" id="password-password" name="password" /></label>
            <input type="submit" id="submit-login" value="Log in" />
        </form>
    </div>);
}