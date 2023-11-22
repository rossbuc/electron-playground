import FileExplorer from "./components/FileExplorer"
import Versions from "./components/Versions"
import { useState } from "react"

function App(): JSX.Element {
  const [filePath, setFilePath] = useState<string>("")

  const handleOnClick = async (): Promise<void> => {
    const newFilePath: string = await window.api.openFile()
    setFilePath(newFilePath)
  }

  return (
    <>
      <Versions />
      <button onClick={handleOnClick}>Upload a file</button>
      <h1>
        the file path is <strong>{filePath}</strong>
      </h1>
      <FileExplorer />
    </>
  )
}

export default App
