
let currentsong = new Audio();
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Round down to remove milliseconds

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all song list in it
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    // Assuming songul is the ID of the <ul> element in your HTML
    //for  all song in palyist
    for (const song of songs) {
        songul.innerHTML += `<li>
          <img class="invert" src="music.svg" alt="">
          <div class="info">
              <div>${song.replaceAll("%20", " ")}</div>
              <div>Akhil</div>
          </div>
          <div class="playnow">
              <span>Play Now</span>
              <img class="invert" src="play.svg" alt="">
          </div>
          
          </li>`;
    }
    //attach an event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            /* console.log(e.querySelector("info").firstElementChild.innerHTML)*/
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

}

const playmusic = (track, pause = false) => {
    //let audio =  new Audio("/songs/" + track)
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track) //songinfo ka inner html ker do ye
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00" //iska ye
}

async function displayalbums() {
    try {
        let a = await fetch(`http://127.0.0.1:5500/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        for (let index = 0; index < anchors.length; index++) {
            const e = anchors[index];
            if (e.href.includes("/songs/")) {
                let folderName = e.href.split("/songs/")[1].split("/")[0]; // Extract folder name from URL

                let a = await fetch(`http://127.0.0.1:5500/songs/${folderName}/info.json`);
                let response = await a.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folderName}" class="card">
                        <div class="play">
                            <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="23" fill="#1DB954" />
                                <polygon points="22,16 22,34 34,25" fill="#00000" />
                            </svg>
                        </div>
                        <img src="/songs/${folderName}/cover.jpg" alt="">
                        <h2>${response.tittle}</h2>
                        <p>${response.description}</p>
                    </div>`;

                // Load the playlist when clicking the card
                Array.from(document.querySelectorAll(".card")).forEach(card => {
                    card.addEventListener("click", async () => {
                        const folder = card.dataset.folder;
                        songs = await getsongs(`songs/${folder}`);
                    });
                });
            }
        }
    } catch (error) {
        console.error("Error fetching or processing album data:", error);
    }
}


async function main() {
    //get the list of all the songs
    await getsongs("songs/ncs");
    playmusic(songs[0], true)
    //display all the albums on the page
    displayalbums()
    //Attach an event listner to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })

    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        const currentTime = Math.floor(currentsong.currentTime);
        const duration = Math.floor(currentsong.duration);

        const formattedTime = `${secondsToMinutesSeconds(currentTime)}/${secondsToMinutesSeconds(duration)}`;
        document.querySelector(".songtime").innerHTML = formattedTime;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    });

    //Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"//ye rect walla bataye ga kha per hau and seebar per click se x dega ye
        currentsong.currentTime = ((currentsong.duration) * percent) / 100//for duration updation on clicking that part
    })
    //Adding eventlistner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    //for closing the it
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })
    //Adding event listner for prev and next
    previous.addEventListener("click", () => {
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    //Adding an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (event) => {
        currentsong.volume = parseInt(event.target.value) / 100;
    });
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;

        // Update the background gradient width
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, #1DB954 0%, #1DB954 ${percent}%, #dad5d5 ${percent}%, #dad5d5 100%)`;
    });

    //Load the paly list when click to card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // Access the folder dataset directly from the clicked element
            const folder = item.currentTarget.dataset.folder;
            songs = await getsongs(`songs/${folder}`);
        })
    })
    //Adding event listner to mute the song
    document.querySelector(".volume > img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src =  e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = 0.20;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

main()

