(function() {
// Globals (I'm so sorry about this ;_;)
var currentSong = undefined
var tick = undefined

// Dom elements
var $player = document.getElementById('js-audio')
var $app = document.getElementById('js-lyrics')
var $title = document.getElementById('js-title')
var $group = document.getElementById('js-group')
var $video = document.getElementById('js-video')

/**
 * When we got the song buffer, start playing it.
 */
$player.addEventListener('canplaythrough', play)


/**
 * On every time update, make sure the lyrics timer is in-sync with the player,
 */
$player.addEventListener('timeupdate', function(event) {
    if (!currentSong) return

    var currentTime = currentSong.time
    var playerTime = $player.currentTime
    var offset = 1

    if (currentTime > playerTime + offset || currentTime < playerTime - offset) {
        currentSong.time = playerTime
    }
})

/**
 * When the song pauses, stop the timer
 */
$player.addEventListener('pause', function() {
    currentSong.time = $player.currentTime

    clearInterval(tick)
})

/**
 * When the song starts playing, start the timer
 */
$player.addEventListener('play', function() {
    // We must keep this timer because the 'timeupdate'
    // event isn't constant, meaning that it could be
    // triggered each time at a different interval anywhere
    // between 200ms-600ms (at least on my pc), which really
    // fucks up the lyrics timing. So instead of relaying
    // on it, we use our own timer to keep the updates
    // happening at a constant rate.
    tick = setInterval(() => {
        currentSong.time = currentSong.time + .25
        renderSongLyrics()
    }, 250)
})

/**
 * When the song end, clear everything
 */
$player.addEventListener('ended', function() {
    if (tick) return

    clearInterval(tick)
    currentSong.time = 0
})

/**
 * Request the song and start playing.
 */
function start() {
    var songData = $app.getAttribute('data-song')

    if (!songData) return

    fetch(songData)
        .then(response => response.json())
        .then(data => {
            currentSong = data
            currentSong.time = 0

            $title.innerText = data.title
            $group.innerText = data.group

            if (data.color) {
                $title.setAttribute("style", `color:${data.color};`)
            }

            if (data.embedded) {
                appendScript(data.embedded, $video)
            }

            setSong(data.audioFile)
            renderSongLyrics()
        })
        .catch(console.log)
}

/**
 * Insert an script tag into the specified element.
 *
 * @param {String} src The src for the script tag.
 * @param {HtmlElement} dest Node to mount the script on.
 */
function appendScript(src, dest) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = src
    dest.appendChild(script)
}

/**
 * Set a song as the current one and request it.
 * Because we set the src here, the 'canplaythrought' event
 * will automatically play it as soon as it is downloaded.
 */
function setSong(url) {
    $player.pause()
    $player.src = url
}

/**
 * Start playing
 */
function play() {
    $player.play()
    renderSongLyrics()
}

/**
 * Iterate and render every word on the current song lyrics.
 *
 * @todo Optimize this, I think re-rendering everything each
 *       update is unnecessary.
 */
function renderSongLyrics() {
    var words = currentSong && currentSong.lyrics
    if (!words) return

    var template = ''
    var currentTime = currentSong.time
    var currentCalls = ''

    words.forEach(function(item) {
        var text = item[0]
        var start = item[1]
        var isCall = item[2]
        var mustBeHighlighted = (currentTime >= start)

        // If the item is empty, it's a line break, so we add the calls under it.
        if (!text || start === undefined) {
            template += `<br />${currentCalls}</br>`
            currentCalls = ''
            return
        }

        // Store the calls.
        if (isCall) {
            text = text.replace(/\s/g, '&nbsp;')

            currentCalls += mustBeHighlighted
                ? `<span style="color: red">${text} </span>`
                : `<span style="color: gray">${text} </span>`

            return
        }

        // Render the lyrics.
        template += mustBeHighlighted
            ? `<span style="color: #3737f3">${text} </span>`
            : `<span>${text} </span>`
    })

    $app.innerHTML = `<div> ${template} </div>`
}

// start !!
window.onload = function() {
    start()
}

})()
