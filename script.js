console.log("Lets write JavaScript");

const songPauseSrc = "svgImages/pause.svg"
const songPlaySrc = "svgImages/play.svg"
const song_is_pause = `<img class="invert resize-icons playIcon-in-List" src="${songPauseSrc}" alt="play">`
const song_is_play = `<img class="invert resize-icons playIcon-in-List" src="${songPlaySrc}" alt="play">`
const mainPlay = document.getElementById("play");
const mainPrevious = document.getElementById("previous");
const mainNext = document.getElementById("next");
const circle = document.querySelector(".seekBar-circle");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// function to get songs
async function getSongs(folderName) {
    // let a = await fetch("http://127.0.0.1:3000/Songs/");
    let a = await fetch(folderName);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = {};
    // this part can be considered as bad code writing! 
    oppositeSongs = {};
    songsArray_urlIndex = {};
    songsArray_indexUrl = {};
    let temp = -1;
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        // console.log(element)
        if (element.href.endsWith(".mp3")) {
            temp += 1;
            // console.log(element);
            songName = element.innerText.split(".mp3")[0];
            songs[songName] = element.href;
            oppositeSongs[element.href] = songName;
            songsArray_urlIndex[element.href] = temp;
            songsArray_indexUrl[temp] = element.href;
        }
    }
    return songs;
}


// function to populate all the songs..
async function populateSongs(songObject) {
    songListCards = document.getElementsByClassName("songsListCards")[0];
    songListCards.innerHTML = '';
    // now add the first song as our current song
    let firstSongSelected = false;
    for (var key in songObject) {
        if (songObject.hasOwnProperty(key)) {
            if (firstSongSelected == false) {
                currentTargetedSong = new Audio(songs[key]);
                updateTimeline();
                firstSongSelected = true;
            }
            // console.log(key, songs[key]); // key - song name, songs[key] - song address.
            songListCards.innerHTML = songListCards.innerHTML + `
            <div class="songList-innerCard borderBox roundedBorder p-1 flex justifyBetween white-border pointer">
                <div class="flex maxwidth80 alignCenter justifyCenter">
                    <div>
                        <img class="invert resize-icons" src="svgImages/music-note-2-svgrepo-com.svg"
                                    alt="music">
                    </div>
                    <div class="innerCard-SongInfo pointer pleft-2 flex flex-col whiteText noUnderline">
                        <span class="songName font15 mbottom-1">${key}</span>
                    </div>
                </div>
                
                <img class="invert resize-icons playIcon-in-List" src="${songPlaySrc}" alt="play">
            </div>`
        }
    }
}

// function to get all the playlist.
async function getPlaylists(folderName) {
    let a = await fetch(folderName);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let folders = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("/")) {
            folders.push(element.href);
        }
    }
    folders.shift();


    // part to update covers
    covers = {};
    await Promise.all(folders.map(async (folder) => {
        let a = await fetch(folder);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".jpg")) {
                covers[folder] = element.href;
            }
        }
    }));
    return folders;

}

// function to populate all the playlist..
// also this thing populate the playlists and in the div it saves the path for which each playlist card is created!
async function populatePlaylist(playlistObject) {
    // to select the first playlist.
    let firstPlaylistSelected = "activePlaylist";
    for (var key in playlistObject) {
        if (playlistObject.hasOwnProperty(key)) {
            // i will add the address of the playlist to its corresponding div.

            // console.log(key, playlistObject[key]); // key - playlist name, playlistObject[key] - playlist address.
            let response = await fetch(playlistObject[key] + "/playlist.json");
            if (response.ok) { // if HTTP-status is 200-299
                // get the response body
                let json = await response.json();
                playlistName = json.playlistName;
                playlistAuthor = json.playlistAuthor;
            } else {
                playlistName = key;
                playlistAuthor = "None"
            }



            playlistArea = document.getElementsByClassName("cards")[0];
            playlistArea.innerHTML = playlistArea.innerHTML + `
            <div data-url='${playlistObject[key]}' class="songCard ${firstPlaylistSelected} white-border">
                <div class="thumbnailContainer pointer">
                    <img src='${covers[playlistObject[key]]}' alt="Thumbnail" class="thumbnail">
                </div>
                <div class="songInfo">
                    <div class="cardSongName font16">${playlistName}</div>
                    <div class="songAuthor font15 overflowText">${playlistAuthor}</div>
                </div>
            </div>`
            firstPlaylistSelected = "";
        }
    }
}


// adding event listeners to all the songs so that any song when clicked, starts playing... (this function will trigger every time whenever we will go in new playlist.)
async function songPlayFunctionalityEventListener(songs) {
    Array.from(document.getElementsByClassName("songList-innerCard")).forEach((song) => {
        song.addEventListener('click', () => {
            // code to extract song address according to song name
            toPlay = song.innerText; // get song name
            toPlaySongAddress = songs[toPlay]; // get song address from the songs object!
            if (song.querySelector(".playIcon-in-List").outerHTML == song_is_play) {
                stopMusic(toPlaySongAddress);
                changeAllPauseToPlay();
                song.querySelector(".playIcon-in-List").outerHTML = song_is_pause;
                playMusic(toPlaySongAddress);
            }
            else if (song.querySelector(".playIcon-in-List").outerHTML == song_is_pause) {
                changeAllPauseToPlay();
                stopMusic(toPlaySongAddress);
            }
        })
    });
}


// this function will be used in the playlistClicked function to remove all activePlaylist class.
async function removeAllActivePlaylistClass() {
    // try {
    //     let activePlaylist = document.querySelector(".activePlaylist")
    //     activePlaylist.classList.remove("activePlaylist");
    // } catch (error) {
    //     console.log(error)
    // }
    let activePlaylist = document.querySelector(".activePlaylist")
    activePlaylist.classList.remove("activePlaylist");
    // let allPlaylists = document.getElementsByClassName("songCard");
    // Array.from(allPlaylists).forEach((playlist) => {
    //     playlist.classList.remove("activePlaylist");
    // })
}


// function to check when a playlist is clicked and then accordingly return the value of the playlist to populate all the songs from this 
async function playlistClicked() {
    let allPlaylists = document.getElementsByClassName("songCard");
    Array.from(allPlaylists).forEach((playlist) => {
        playlist.addEventListener('click', async function () {
            stopMusic();
            console.log("Clicked on the following playlist: ")
            console.log(playlist);
            await removeAllActivePlaylistClass()
            playlist.classList.add("activePlaylist"); // this one will change the color of the playlist
            let path = playlist.getAttribute('data-url');
            console.log("Here is the path, that is returned by the function!");
            console.log(path);
            songsInside = await getSongs(path)
            await populateSongs(songsInside);
            await songPlayFunctionalityEventListener(songsInside);

            mainPlaySubFunc();





        })
    })
}



// functions to make action of the side bar
// function to play a music -> from the side bar
async function playMusic(songURL) {
    try {
        currentTargetedSong = new Audio(songURL);
        currentTargetedSong.play();
        mainPlay.src = songPauseSrc;
        updateTimeline();
    }
    catch (error) {
        console.log(`The following error occurred - ${error}`)

    }
}
// function to stop a music -> from the side bar
async function stopMusic() {
    // currentTargetedSong.pause();
    try {
        currentTargetedSong.pause();
        mainPlay.src = songPlaySrc;
    } catch (error) {
        console.log(`Error occurred during pausing the song - ${error}`);
    }
}

// function to change all pause icons to play -> from the side bar
function changeAllPauseToPlay() {
    // console.log("I am running...")
    Array.from(document.querySelectorAll(".playIcon-in-List")).forEach(elem => {
        elem.outerHTML = song_is_play;
    });
}

// listen for timeupdate event
async function updateTimeline() {

    currentTargetedSong.onloadedmetadata = function () {
        document.querySelector(".songPlayed").innerText = `${secondsToMinutesSeconds(currentTargetedSong.currentTime)} / ${secondsToMinutesSeconds(currentTargetedSong.duration)}`
        let songName = oppositeSongs[currentTargetedSong.src];
        document.querySelector(".musicInfo").innerText = `${songName}`
    }
    currentTargetedSong.addEventListener("timeupdate", () => {
        document.querySelector(".songPlayed").innerText = `${secondsToMinutesSeconds(currentTargetedSong.currentTime)} / ${secondsToMinutesSeconds(currentTargetedSong.duration)}`
        document.querySelector(".seekBar-circle").style.left = (currentTargetedSong.currentTime / currentTargetedSong.duration) * 100 + "%";
        if (currentTargetedSong.currentTime == currentTargetedSong.duration) {
            mainNext.click();
        }
    });
}



// this function is because of the reason that this part will be used in the playlistClicked function due to which i have made a function of it!
function mainPlaySubFunc() {
    console.log(currentTargetedSong);
    // this part make sure to change icon of that particular song which is going to be played!
    let index = songsArray_urlIndex[currentTargetedSong.src];
    let allSongs = document.getElementsByClassName("songList-innerCard");
    Array.from(allSongs).forEach((songCard) => {
        let tempSongName = songCard.querySelector(".songName").innerText;
        if (tempSongName == oppositeSongs[songsArray_indexUrl[index]]) {
            console.log(oppositeSongs[songsArray_indexUrl[index]])
            songCard.querySelector(".playIcon-in-List").src = songPauseSrc;
        }
    })
    currentTargetedSong.play()
    mainPlay.src = songPauseSrc;
    updateTimeline();
}

// add event listeners to the play pause functionality;
function mainPlayFunc() {
    mainPlay.addEventListener('click', () => {
        if (currentTargetedSong.paused) {
            mainPlaySubFunc();
        }
        else {
            stopMusic();
        }
    })
}

// add event listeners for the functionality of previous song
function mainPreviousFunc() {
    mainPrevious.addEventListener('click', async () => {
        console.log(currentTargetedSong)
        console.log(currentTargetedSong.src);
        // console.log(songsArray)
        // let index = songsArray.indexOf(currentTargetedSong.src);

        // this will return the index of the current playing song.
        let index = songsArray_urlIndex[currentTargetedSong.src];
        console.log(index)
        lengthOfTotalSongs = Object.keys(songsArray_urlIndex).length;
        if (index == 0) {
            index = 0;
            await stopMusic();
            playMusic(currentTargetedSong.src);
        }
        else if (index + 1 == lengthOfTotalSongs) {
            index = 0;
            stopMusic();
        }

        else {
            console.log(`index is ${index}`)
            console.log(currentTargetedSong.src);
            index -= 1;
            await stopMusic();
            changeAllPauseToPlay();


            // this part make sure to change icon of that particular song which is going to be played!
            let allSongs = document.getElementsByClassName("songList-innerCard");
            Array.from(allSongs).forEach((songCard) => {
                let tempSongName = songCard.querySelector(".songName").innerText;
                if (tempSongName == oppositeSongs[songsArray_indexUrl[index]]) {
                    console.log(oppositeSongs[songsArray_indexUrl[index]])
                    songCard.querySelector(".playIcon-in-List").src = songPauseSrc;
                }
            })
            playMusic(songsArray_indexUrl[index])
        }
    })
}

// add event listeners for the functionality of next song
function mainNextFunc() {
    mainNext.addEventListener('click', async () => {
        console.log(currentTargetedSong)
        console.log(currentTargetedSong.src);
        // console.log(songsArray)
        // let index = songsArray.indexOf(currentTargetedSong.src);

        // this will return the index of the current playing song.
        let index = songsArray_urlIndex[currentTargetedSong.src];
        console.log(index)
        lengthOfTotalSongs = Object.keys(songsArray_urlIndex).length;

        console.log(`index is ${index}`)
        console.log(currentTargetedSong.src);
        index += 1;
        await stopMusic();
        changeAllPauseToPlay();
        if (index == lengthOfTotalSongs) {
            index = 0;
        }

        // this part make sure to change icon of that particular song which is going to be played!
        let allSongs = document.getElementsByClassName("songList-innerCard");
        Array.from(allSongs).forEach((songCard) => {
            let tempSongName = songCard.querySelector(".songName").innerText;
            if (tempSongName == oppositeSongs[songsArray_indexUrl[index]]) {
                console.log(oppositeSongs[songsArray_indexUrl[index]])
                songCard.querySelector(".playIcon-in-List").src = songPauseSrc;
            }
        })
        playMusic(songsArray_indexUrl[index])

    })
}

// this function is responsible for custom seeking the song.
document.querySelector(".seekBar").addEventListener("click", (e) => {
    percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    console.log(percentage);
    circle.style.left = percentage + "%";
    currentTargetedSong.currentTime = (currentTargetedSong.duration * percentage) / 100;

})

// hamburger icon and cross icon functionality;
document.querySelector(".hamburgerIcon").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
    document.querySelector(".left").style.width = "90vw";
})

document.querySelector(".crossIcon").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-150vw"
})




// this function contains code about how the website will respond on pressing space bar, left arrow , right arrow
// this one for better interaction.

function keyBoardInteraction() {
    window.addEventListener('keydown', (event) => {
        switch (event.code) {
            case "Space":
                mainPlay.click();
                break;

            case "ArrowLeft":
                mainPrevious.click();
                break;

            case "ArrowRight":
                mainNext.click();
                break;

            default:
                break;
        }
    })
}

async function main() {
    // to populate all the playlist
    let temp = await getPlaylists("songs");
    await populatePlaylist(temp) // this songs is the name of the folder all the playlist will be placed!

    // to populate all the songs
    let songs = await getSongs(folderName = temp[0]);
    await populateSongs(songs);
    songPlayFunctionalityEventListener(songs)
    playlistClicked();
    // code to check when a playlist is selected
    mainPlayFunc();
    mainPreviousFunc();
    mainNextFunc();
    keyBoardInteraction();
}




main();

