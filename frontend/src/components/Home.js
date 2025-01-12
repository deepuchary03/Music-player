import { useContext, useState } from "react";
import Navbar from "./Navbar";
import { MusicContext } from "../Context";
import "./Home.css";

function Home() {
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("Search your favorite song");
  const [tracks, setTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { isLoading, setIsLoading, resultOffset, setResultOffset } =
    useContext(MusicContext);

  const fetchAccessToken = async () => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            "200bcacaaa5a4e3f81f9ce5057705b91:ff85bde297c64fae98c3f663bc2e6d2b"
          )}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch access token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      return null;
    }
  };

  const fetchMusicData = async (query = "", offset = 0) => {
    const token = await fetchAccessToken();
    if (!token) {
      console.error("No token available");
      return;
    }

    setTracks([]);
    setMessage("");
    window.scrollTo(0, 0);
    setIsLoading(true);

    try {
      const searchQuery = query || keyword;
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch music data: ${response.statusText}`);
      }

      const jsonData = await response.json();
      setTracks(jsonData.tracks.items.slice(0, 50));
      setHasSearched(true);
    } catch (error) {
      setMessage("We couldn’t retrieve the music data. Please try again.");
      console.error("Error fetching music data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setResultOffset(0);
      fetchMusicData(keyword, 0);
    }
  };

  const handleSearchClick = () => {
    setResultOffset(0);
    fetchMusicData(keyword, 0);
  };

  const likeSong = (trackId) => {
    console.log(`Liked song with ID: ${trackId}`);
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      setLikedTracks([...likedTracks, track]);
    }
  };

  const addToPlaylist = (trackId) => {
    console.log(`Added song with ID: ${trackId} to playlist`);
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      setPlaylistTracks([...playlistTracks, track]);
    }
  };

  const togglePlayPause = (trackId) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null); // Pause the track
    } else {
      setPlayingTrackId(trackId); // Play the track
    }
  };

  const showLikedSongs = () => {
    setTracks(likedTracks);
    setHasSearched(true);
  };

  const showPlaylistedSongs = () => {
    setTracks(playlistTracks);
    setHasSearched(true);
  };

  return (
    <>
      <Navbar
        keyword={keyword}
        setKeyword={setKeyword}
        handleKeyPress={handleKeyPress}
        fetchMusicData={handleSearchClick}
        showLikedSongs={showLikedSongs}
        showPlaylistedSongs={showPlaylistedSongs}
      />

      <div className="container">
        <div className={`row ${isLoading ? "" : "d-none"}`}>
          <div className="col-12 py-5 text-center">
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>

      {!hasSearched && (
        <div className="row text-center default-message">
          <div className="col-12">
            <h5>{message}</h5>
          </div>
        </div>
      )}
      <div className="cont">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {hasSearched && tracks.length === 0 && (
            <div className="col-12 text-center">
              <h5>{message}</h5>
            </div>
          )}
          {tracks.map((track) => (
            <div className="col" key={track.id}>
              <div className="card h-100">
                <img
                  src={track.album.images[0]?.url}
                  alt={track.name}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title">{track.name}</h5>
                  <p className="card-text">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => togglePlayPause(track.id)}
                  >
                    {playingTrackId === track.id ? "Pause" : "Play"}
                  </button>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => likeSong(track.id)}
                  >
                    Like
                  </button>
                  <button
                    className="btn btn-info me-2"
                    onClick={() => addToPlaylist(track.id)}
                  >
                    Add to Playlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
