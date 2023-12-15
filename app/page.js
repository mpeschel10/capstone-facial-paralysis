import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <p><a href="/">Home</a></p>
      <h1>Hello!</h1>
      <p><a href="/upload">Upload an image</a></p>
      <p><a href="/download">See uploaded images</a></p>
    </div>
  );
}
