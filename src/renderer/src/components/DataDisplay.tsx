const fs = require("fs")

const DataDisplay = (): JSX.Element => {
  const JSONData = fs.readFileSync(
    "/Users/rossbuchan/personal_projects/electron-playground/data.json"
  )

  console.log(JSONData)
  return <></>
}

export default DataDisplay
