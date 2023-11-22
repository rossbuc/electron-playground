import { useState } from "react"

const FileDropZone = (): JSX.Element => {
  const [files, setFiles] = useState("")

  return (
    <>
      <div className="dropzone">
        <h1>Please drag your files here</h1>
      </div>

      <ul>
        <li>{files}</li>
      </ul>
    </>
  )
}

export default FileDropZone
