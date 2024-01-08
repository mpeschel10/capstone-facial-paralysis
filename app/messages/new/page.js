export default function MessagesNew() {
    return (<div>
        <h2>New message</h2>
        <form encType="multipart/form-data" method="POST" action="/api/image">
            <label>At rest <input type="file" id="file-at-rest"></input></label><br />
            <label>Eyebrows up <input type="file" id="file-eyebrows-up"></input></label><br />
            <label>Eyes closed <input type="file" id="file-eyes-closed"></input></label><br />
            <label>Wrinkled nose <input type="file" id="file-nose-wrinkle"></input></label><br />
            <label>Big smile <input type="file" id="file-big-smile"></input></label><br />
            <label>Lips puckered <input type="file" id="file-lips-puckered"></input></label><br />
            <label>Lower teeth bared <input type="file" id="file-lower-teeth-bared"></input></label><br />
            <button id="submit-message" type="submit">Send files</button>
        </form>
    </div>)
}