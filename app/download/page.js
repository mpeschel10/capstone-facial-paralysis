import fs from "node:fs";
import path from "node:path";

import { UPLOADS_DIR } from "@/constants";

export const dynamic = 'force-dynamic' // defaults to auto

export default async function Home() {
  const uploadNames = await fs.promises.readdir( UPLOADS_DIR );
  const imgs = [];

  for (const uploadName of uploadNames) {
    const uploadPath = path.join("api/image", uploadName);
    imgs.push(<img key={uploadName} src={uploadPath} />);
  }
  
  return (
    <div>
      <p><a href="/">Home</a></p>
      <h3>Download!</h3>
      {imgs}
    </div>
  );
}
  
