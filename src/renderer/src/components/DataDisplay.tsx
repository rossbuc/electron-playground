const DataDisplay = ({ library }): JSX.Element => {
  return (
    <>
      {Object.entries(library).map(([songKey, song]) => (
        <div className="songBlock" key={songKey}>
          <h2>{song.songMetaData.title}</h2>
          <h3>{song.songMetaData.artist}</h3>
        </div>
      ))}
    </>
  )
}

export default DataDisplay
