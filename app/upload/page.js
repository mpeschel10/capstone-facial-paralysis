
export default function Home() {
  return (
    <div>
      <p><a href="/">Home</a></p>
      <h3>Upload!</h3>
      <form action="/api/image" method="POST" encType="multipart/form-data">
        <label htmlFor="file-photo">Photograph to upload: </label>
        <input type="file" name="photo" id="file-photo"></input>
        <input type="submit" value="Submit"></input>
      </form>
    </div>
  );
}
