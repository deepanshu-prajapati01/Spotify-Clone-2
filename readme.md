---

# Spotify-Clone-2: Your Personal Music Player

---

Welcome to **Spotify-Clone**, a website that brings your favorite tunes to your fingertips. This website automatically detects songs from your local storage and organizes them into playlists for your convenience. Enjoy a clean UI and a responsive design that adapts to any device.

## 🎶 Features of Spotify-Clone:

- **Responsive Design**: The website can adapt to any device, providing a seamless music experience.
- **Automatic Song Detection**: The website automatically detects songs from your local storage.
- **Clean UI**: Navigate with ease thanks to the clean and straightforward UI.
- **Enjoy Music**: Listen to your favorite tunes without any interruptions.
- **Better Interaction**: You can interact with the music player using keyboard.

## To clone this repo, use the following command:

  ```shell
   git clone https://github.com/deepanshu-prajapati01/Spotify-Clone-2
   ```


## 📁 How to Use:

1. **Create a Folder Named 'Songs'**: This is where you will put your songs.
2. **Create Subfolder Inside the 'Songs' Folder**: Each subfolder will be detected as a playlist.
3. **Add Songs to the Subfolder**: Each song you add will be included in the playlist.
4. **Create a 'playlist.json' File in Each Subfolder**: This file will contain the metadata for your playlist. The structure of the `playlist.json` file should be as follows:

```json
{
    "playlistName": "Playlist Name",
    "playlistAuthor": "Artist Name"
}
```
Please replace `"Playlist Name"` with the name of your playlist and `"Artist Name"` with your name.

5. **Add a 'cover.jpg' File to Each Subfolder**: This will be the cover image for your playlist.


---
# IMPORTANT: Please note that to use this website, run this website via the "Live Preview" extension of VS Code.


