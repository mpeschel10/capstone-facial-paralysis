// import styles from './page.module.css'

export default function Home() {
  return (
    <div>
      <p><a href="/">Home</a></p>
      <h3>Upload!</h3>
      <form action="/api/image" method="POST" encType="multipart/form-data">
        <input type="text" defaultValue="Example text" name="input-name"></input>
      </form>
    </div>
  );
}
