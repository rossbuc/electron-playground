import { useState } from "react"

const FileExplorer = (): JSX.Element => {
  const [files, setFiles] = useState<[]>([])

  const fileNodes: JSX.Element[] = files.map((file, index) => {
    return <li key={index}>{file}</li>
  })

  const handleButtonClick = (): void => {
    // file explorer logic here
  }
  return (
    <>
      <button onClick={handleButtonClick}>Select File</button>
      <ul>{fileNodes}</ul>
    </>
  )
}

export default FileExplorer
