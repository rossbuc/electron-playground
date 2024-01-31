import { Howl, Howler } from "howler"
import { useEffect, useState } from "react"

const DataDisplay = ({ library }): JSX.Element => {
  const [playingSong, setPlayingSong] = useState(undefined)
  useEffect(() => {
    playingSong ? playingSong.play() : console.log("playing song is undefined")
  }, [playingSong])
  console.log("The array is an array true/false, ", Array.isArray(library))
  const handlePause: void = () => {
    playingSong ? playingSong.pause() : console.log("there is no song playing")
  }

  const songNodes = library
    ? library.map((song, index) => (
        <button
          key={index}
          onClick={() =>
            setPlayingSong(
              new Howl({
                src: [song.songPath],
                onend: setPlayingSong(undefined)
              })
            )
          }
        >
          {song.songMetaData.title}
        </button>
      ))
    : "loading"

  console.log(songNodes)
  return (
    <>
      <button onClick={handlePause}>Pause</button>
      {songNodes}
    </>
  )
}

// const handleSongPlay: void = (song) => {
//   // play the song
//   song.play()
// }

export default DataDisplay
