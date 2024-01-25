import { Howl, Howler } from "howler"

const DataDisplay = ({ library }): JSX.Element => {
  console.log("The array is an array true/false, ", Array.isArray(library))
  const songNodes = library
    ? library.map((song, index) => (
        <button key={index} onClick={handleSongClick(song)}>
          {song.songMetaData.title}
        </button>
      ))
    : "loading"

  console.log(songNodes)
  return <>{songNodes}</>
}

const handleSongClick: void = (song) => {
  // play the song
  let playingSong = new Howl({
    src: [song.songPath]
  })
  playingSong.play()
}

export default DataDisplay
