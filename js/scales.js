//TODO:
/*

add reference keyboard  * doing it
map keys to sounds
add wheel
Make it pretty

1234567890
qwertyuiop
asdfghjkl;
zxcvbnm,./

*/

// Scales Logic Part

const baseScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const naturalScale = [0, 2, 4, 5, 7, 9, 11]
const pentatonicScale = [0, 3, 5, 7, 10]
const harmonicMinorScale = [0, 2, 3, 5, 7, 8, 11]
const harmonicMajorScale = [0, 2, 4, 5, 7, 8, 11]
const chromaticScale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

const whiteKeysReferenceScale = naturalScale
// const blackKeysReferenceScale = naturalScale.map(key =>{
//     return (key+6)%baseScale.length
// })
// blackKeysReferenceScale.sort((a,b) => a-b)
const blackKeysReferenceScale = [1, 3, 5, 6, 8, 10, 11]


const scalesDict = {
    "Natural Scale": naturalScale,
    "Pentatonic Scale": pentatonicScale,
    "Harmonic Minor Scale": harmonicMinorScale,
    "Harmonic Major Scale": harmonicMajorScale,
    "Chromatic": chromaticScale,
}

const modesDict = {
    "Natural Scale": ["I", "II", "III", "IV", "V", "VI", "VII"],
    "Harmonic Minor Scale": ["I", "II", "III", "IV", "V", "VI", "VII"],
    "Harmonic Major Scale": ["I", "II", "III", "IV", "V", "VI", "VII"],
}

function generateNewScale(keyOffset, modeOffset, scale) {
    let currentOffset
    const newScale = []
    for (i = 0; i < scale.length; i++) {
        currentOffset = keyOffset
            + baseScale.length //avoid negative values
            + scale[(i + modeOffset) % scale.length]  //rotate the key wheel + the mode scale mask
            - scale[modeOffset % scale.length]; // rotate the key back
        newScale[i] = (currentOffset) % baseScale.length;
    }
    return newScale;
}

function debugScales(scale, key = 0) {
    const checkScaleKeys = new Set()
    for (let mode = 0; mode < scale.length; mode++) {
        let newScale = generateNewScale(scale[mode] + key, mode, scale)
        console.log(newScale.map(key => baseScale[key]));
        checkScaleKeys.add(...newScale)
    }
    console.log(checkScaleKeys.size == scale.length);
}

//manipulating the dom to create required elements

const keySelector = document.querySelector('#key-selector')
const scaleSelector = document.querySelector('#scale-selector')
const modeSelector = document.querySelector('#mode-selector')

baseScale.forEach(key => {
    option = document.createElement("option")
    option.value = key
    option.textContent = key
    keySelector.appendChild(option)
})

for (const key in scalesDict) {
    option = document.createElement("option")
    option.value = key
    option.textContent = key
    scaleSelector.appendChild(option)
}

function updateModeSelector() {
    modeSelector.innerHTML = ""
    const scaleName = scaleSelector.value
    if (!(scaleName in modesDict)) {
        option = document.createElement("option")
        option.value = "Pentatonic Scale"
        option.textContent = "Pentatonic Scale"
        modeSelector.appendChild(option)
        return
    }
    modesDict[scaleName].forEach(mode => {
        option = document.createElement("option")
        option.value = mode
        option.textContent = mode
        modeSelector.appendChild(option)

    });
    modeSelector.classList.remove("hidden")
}

updateModeSelector()

// PianoRoll Draw part

const canvas = document.querySelector('#pianoRoll')

const context = canvas.getContext('2d')
const whiteKeyWidth = 50;
const whiteKeyHeight = 200;
const blackKeyWidth = whiteKeyWidth * 0.8;
const blackKeyHeight = whiteKeyHeight * 0.5;
const totalWhiteKeys = 22;
const totalWidth = whiteKeyWidth * totalWhiteKeys;


function drawWhiteKey(x, y = 100) {
    context.lineWidth = 2
    context.strokeRect(x, y, whiteKeyWidth, whiteKeyHeight)
}

function drawBlackKey(x, y = 100) {
    context.fillStyle = "black"
    context.fillRect(x + (whiteKeyWidth + (whiteKeyWidth - blackKeyWidth)) / 2, y, blackKeyWidth, blackKeyHeight)
}

function drawPianoRoll() {
    canvas.width = window.innerWidth;
    canvas.height = 400;
    const positionOffset = (window.innerWidth - totalWidth) / 2
    // context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "white"
    context.fillRect(positionOffset, 100, totalWidth, whiteKeyHeight)
    for (let i = 0; i < totalWhiteKeys; i++) {
        drawWhiteKey(whiteKeyWidth * i + positionOffset)
        if (i % blackKeysReferenceScale.length == 2 || i % blackKeysReferenceScale.length == 6 || i == totalWhiteKeys - 1) {
            continue
        }
        drawBlackKey(whiteKeyWidth * i + positionOffset)
    }
}

function drawHighlightedScale(keyOffset, modeOffset, scale) {
    drawPianoRoll()
    const positionOffset = (window.innerWidth - totalWidth) / 2
    const newScale = generateNewScale(keyOffset, modeOffset, scale)
    for (let i = 0; i < totalWhiteKeys; i++) {
        const whiteKeysReferenceIndex = i % whiteKeysReferenceScale.length
        const whiteKey = whiteKeysReferenceScale[whiteKeysReferenceIndex]

        if (newScale.includes(whiteKey)) {
            const whiteKeyTextPositionX = whiteKeyWidth * i + 0.5 * whiteKeyWidth + positionOffset
            context.textAlign = "center"
            context.font = "bold 26px Arial"
            context.fillStyle = "#000"
            context.fillText(baseScale[whiteKey], whiteKeyTextPositionX, whiteKeyHeight + 80)
        }

        const blackKeysReferenceIndex = i % blackKeysReferenceScale.length
        const blackKey = blackKeysReferenceScale[blackKeysReferenceIndex]

        if (i % blackKeysReferenceScale.length == 2 || i % blackKeysReferenceScale.length == 6 || i == totalWhiteKeys - 1) {
            continue
        }

        if (newScale.includes(blackKey)) {
            const blackKeyTextPositionX = whiteKeyWidth * (i + 1) + positionOffset
            context.textAlign = "center"
            context.font = "bold 26px Arial"
            context.fillStyle = "#FFF"
            context.fillText(baseScale[blackKey], blackKeyTextPositionX, blackKeyHeight + 60)
        }
    }
}

//Audio part


const chromaticBlackKeys = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0"]
const chromaticWhiteKeys = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP"]
const scaleKeys1 = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon"]
const scaleKeys2 = ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"]


let buttonToSoundDict = {}

const keyboardWidth = chromaticBlackKeys.length

function mapKeysToSounds(keyOffset, modeOffset, scale) {

    buttonToSoundDict = {}
    
    //Chromatic Keyboard Part (first 2 rows)
    const selectedOctave = parseFloat(octaveSelector.value)
    let naturalScaleModeOffset

    for (let mode = 0; mode < whiteKeysReferenceScale.length; mode++) {
        if (whiteKeysReferenceScale[mode] >= keyOffset) {
            naturalScaleModeOffset = mode
            break
        }        
    }
    //loop for blackkeys

    for (let i = 0; i < keyboardWidth; i++) {

        const blackKeysReferenceIndex = (i+6) + naturalScaleModeOffset
        
        if (blackKeysReferenceIndex % blackKeysReferenceScale.length == 2 || blackKeysReferenceIndex % blackKeysReferenceScale.length == 6) {
            continue
        }
        let currentKey = baseScale[blackKeysReferenceScale[(blackKeysReferenceIndex) % blackKeysReferenceScale.length]]
        let soundToPlay = currentKey + (selectedOctave + Math.floor(blackKeysReferenceIndex / blackKeysReferenceScale.length)-1).toString()
        // console.log(soundToPlay);
        buttonToSoundDict[chromaticBlackKeys[i]] = soundToPlay
    }

    //loop for whitekeys
    for (let i = 0; i < keyboardWidth; i++) {
        let currentKey = baseScale[whiteKeysReferenceScale[(naturalScaleModeOffset + i) % whiteKeysReferenceScale.length]]
        let soundToPlay = currentKey + (selectedOctave + Math.floor(i / whiteKeysReferenceScale.length)).toString()
        // console.log(soundToPlay);
        buttonToSoundDict[chromaticWhiteKeys[i]] = soundToPlay

    }

    //Scale Keyboard Part (last 2 rows)

}

const instruments = {};
let sound;

const audioContext = new (window.AudioContext || window.webkitAudioContext);
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
gainNode.gain.value = 3.0;

Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (instrument) {
    instrument.connect(gainNode);
    instruments['acoustic_grand_piano'] = instrument;
});

function volumeHandler() {
    console.log(this.value);
    gainNode.gain.value = 6.0 * this.value
}

volumeSlider = document.querySelector("#volume-slider");
octaveSelector = document.querySelector("#octave-selector");

document.addEventListener('keydown', (event) => {
    if (!(event.code in buttonToSoundDict)){
        return
    }
    instruments['acoustic_grand_piano'].play(buttonToSoundDict[event.code]);
});

// document.addEventListener('keyup', (event) => {
//     sound.stop();
//     sound = null;
// });


//EventHandlers

function handleAnyKeyChange(event) {
    drawHighlightedScale(keySelector.selectedIndex, modeSelector.selectedIndex, scalesDict[scaleSelector.value])
    mapKeysToSounds(keySelector.selectedIndex, modeSelector.selectedIndex, scalesDict[scaleSelector.value])
}

scaleSelector.addEventListener("change", updateModeSelector)

keySelector.addEventListener("change", handleAnyKeyChange)
modeSelector.addEventListener("change", handleAnyKeyChange)
scaleSelector.addEventListener("change", handleAnyKeyChange)

volumeSlider.addEventListener('change', volumeHandler)
window.addEventListener("resize", handleAnyKeyChange)

//initialized data

drawHighlightedScale(0, 0, naturalScale)
mapKeysToSounds(0,0,naturalScale)