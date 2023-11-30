import DataDisplay from "./components/DataDisplay"
import FileExplorer from "./components/FileExplorer"
import Versions from "./components/Versions"
import { useEffect, useState } from "react"
import fs from "fs"

function App(): JSX.Element {
  const [filePath, setFilePath] = useState<string>("")
  const [library, setLibrary] = useState<T>(null)

  useEffect(() => {
    loadLib()
  }, [])

  const handleOnClick = async (): Promise<void> => {
    const newFilePath: string = await window.api.openFile()
    setFilePath(newFilePath)
  }

  const loadLib = async (): Promise<void> => {
    const libData = await window.api.loadLib()
    console.log("The lib data, ", libData)
    setLibrary(libData)
  }

  return (
    <>
      <Versions />
      <button onClick={handleOnClick}>Upload a file</button>
      <h1>
        the file path is <strong>{filePath}</strong>
      </h1>
      <FileExplorer />

      <h1>JSON Data</h1>
      {/* <DataDisplay /> */}
      <p>{library}</p>
    </>
  )
}

export default App
