export default function Home() {
    return (<div>
        <h3>Home page for users</h3>
        <h4>Take a picture + Send pictures to clinician</h4>
        {/* <a id="a-uploads-new" href="/uploads/new">New upload</a> */}
        <h4>Messages to clinicians + new</h4>
        <a id="a-progress-new" href="/messages/new">New progress report</a>
        <h4>Messages from clinicians</h4>
        <h4>View own report (set time span etc), export to pdf</h4>
    </div>);
}