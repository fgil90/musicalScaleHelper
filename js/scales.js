/*
*
*TODO:
*
*Add wheel
*Show which keys are which tone
*
*DONE:
*
*Make it pretty
*Terminate a sound when let go of key
*Don't repeat sounds when holding down key
*Add reference keyboard 
*Map chromatic scale to top two rows of keyboard 
*Map chosen scale to bottom two rows of keyboard
*Add Sustain Mode
*
*BUGS:
*
*
*
*FIXED:
*
*Scale portion of the keyboard not playing the intended first tone.
*Fix shifting octaves incorrectly
*Chromatic keyboard octave is looping incorrectly
*Octave Selector not working

*/

// Scales Logic Part

const baseScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const naturalScale = [0, 2, 4, 5, 7, 9, 11]
const pentatonicScale = [0, 3, 5, 7, 10]
const harmonicMinorScale = [0, 2, 3, 5, 7, 8, 11]
const harmonicMajorScale = [0, 2, 4, 5, 7, 8, 11]
const melodicMinorScale = [0, 2, 3, 5, 7, 9, 11]
const melodicMajorScale = [0, 2, 4, 5, 7, 8, 10]
const chromaticScale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const wholeToneScale = [0, 2, 4, 6, 8, 10]
const octatonicScale = [0, 2, 3, 5, 6, 8, 9, 11]

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
    "Melodic Minor Scale": melodicMinorScale,
    "Melodic Major Scale": melodicMajorScale,
    "Chromatic": chromaticScale,
    "Whole Tone Scale": wholeToneScale,
    "Octatonic Scale": octatonicScale,
}

const modesDict = {
    "Natural Scale": ["I (Ionian)", "II (Dorian)", "III (Phrygian)", "IV (Lydian)", "V (Mixolydian)", "VI (Aeolian)", "VII (Locrian)"],
    "Harmonic Minor Scale": ["I (Aeolian 7) ", "II (Locrian 6)", "III (Ionian #5)", "IV (Dorian #4)", "V (Phrygian Dominant)", "VI (Lydian #2)", "VII (Super Locrian bb7)"],
    "Harmonic Major Scale": ["I (Ionian b6)", "II (Dorian b5)", "III (Phrygian b4)", "IV (Lydian b3)", "V (Mixolydian b2", "VI (Lydian Augmented #2)", "VII (Locrian bb7)"],
    "Melodic Minor Scale": ["I (Ionian b3)", "II (Dorian b9)", "III (Lydian Augmented)", "IV (Lydian Dominant)", "V (Mixolydian b6)", "VI (Locrian #2)", "VII (Super Locrian)"],
    "Melodic Major Scale": ["I (Aeolian #3)", "II", "III", "IV", "V", "VI", "VII"],
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
    // newScale.sort((a,b) => a-b)
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
        option.value = "N/A"
        option.textContent = "N/A"
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

const totalWhiteKeys = 22;

const pianoRollCanvas = document.querySelector('#pianoRoll')
const pianoRollContext = pianoRollCanvas.getContext('2d')
const whiteKeyWidth = 50;
const whiteKeyHeight = 200;
const blackKeyWidth = whiteKeyWidth * 0.8;
const blackKeyHeight = whiteKeyHeight * 0.5;
const totalWidth = whiteKeyWidth * totalWhiteKeys;

function drawWhiteKey(x, y = whiteKeyHeight / 2) {
    pianoRollContext.lineWidth = 2
    pianoRollContext.strokeRect(x, y, whiteKeyWidth, whiteKeyHeight)
}

function drawBlackKey(x, y = whiteKeyHeight / 2) {
    pianoRollContext.fillStyle = "black"
    pianoRollContext.fillRect(x + (whiteKeyWidth + (whiteKeyWidth - blackKeyWidth)) / 2, y, blackKeyWidth, blackKeyHeight)
}

function drawPianoRoll() {
    pianoRollCanvas.width = window.innerWidth;
    pianoRollCanvas.height = 400;
    const positionOffset = (window.innerWidth - totalWidth) / 2
    pianoRollContext.fillStyle = "white"
    pianoRollContext.fillRect(positionOffset, whiteKeyHeight / 2, totalWidth, whiteKeyHeight)
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
            pianoRollContext.textAlign = "center"
            pianoRollContext.font = "bold 26px Arial"
            pianoRollContext.fillStyle = "#000"
            pianoRollContext.fillText(baseScale[whiteKey], whiteKeyTextPositionX, whiteKeyHeight + 80)
        }

        const blackKeysReferenceIndex = i % blackKeysReferenceScale.length
        const blackKey = blackKeysReferenceScale[blackKeysReferenceIndex]

        //skip E# and B# + the last black key.
        if (i % blackKeysReferenceScale.length == 2 || i % blackKeysReferenceScale.length == 6 || i == totalWhiteKeys - 1) {
            continue
        }

        if (newScale.includes(blackKey)) {
            const blackKeyTextPositionX = whiteKeyWidth * (i + 1) + positionOffset
            pianoRollContext.textAlign = "center"
            pianoRollContext.font = "bold 26px Arial"
            pianoRollContext.fillStyle = "#FFF"
            pianoRollContext.fillText(baseScale[blackKey], blackKeyTextPositionX, blackKeyHeight + 80)
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

function getNoteFromScale(index, scale, selectedOctave) {
    const baseScaleIndex = scale[index % scale.length]
    const currentKey = baseScale[baseScaleIndex]
    let currentOctave = selectedOctave + Math.floor(index / scale.length)
    if (baseScaleIndex < scale[0]) {
        currentOctave++
    }
    const soundToPlay = currentKey + currentOctave.toString()
    return soundToPlay
}

function mapKeysToSounds(keyOffset, modeOffset, scale) {
    buttonToSoundDict = {}
    const newScale = generateNewScale(keyOffset, modeOffset, scale)

    const selectedOctave = parseInt(octaveSelector.value)

    let naturalScaleModeOffset

    for (let mode = 0; mode < whiteKeysReferenceScale.length; mode++) {
        if (whiteKeysReferenceScale[mode] >= keyOffset) {
            naturalScaleModeOffset = mode
            break
        }
    }

    for (let i = 0; i < keyboardWidth; i++) {

        const whiteKeysReferenceIndex = naturalScaleModeOffset + i
        const blackKeysReferenceIndex = 6 + whiteKeysReferenceIndex
        const scaleReferenceIndex = i
        const secondRowOffset = 5

        //Scale Keyboard Part (last 2 rows)

        buttonToSoundDict[scaleKeys1[i]] = getNoteFromScale(scaleReferenceIndex, newScale, selectedOctave)
        buttonToSoundDict[scaleKeys2[i]] = getNoteFromScale(scaleReferenceIndex + secondRowOffset, newScale, selectedOctave)

        //Chromatic Keyboard Part (first 2 rows)

        buttonToSoundDict[chromaticWhiteKeys[i]] = getNoteFromScale(whiteKeysReferenceIndex, whiteKeysReferenceScale, selectedOctave)
        //skip E# and B#
        if (blackKeysReferenceIndex % blackKeysReferenceScale.length == 2 || blackKeysReferenceIndex % blackKeysReferenceScale.length == 6) {
            continue
        }
        buttonToSoundDict[chromaticBlackKeys[i]] = getNoteFromScale(blackKeysReferenceIndex, blackKeysReferenceScale, selectedOctave - 1)

    }
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
    // console.log(this.value);
    gainNode.gain.value = 6.0 * this.value
}

const volumeSlider = document.querySelector("#volume-slider");
const octaveSelector = document.querySelector("#octave-selector");
const sustainCheckbox = document.querySelector("#sustain-checkbox")

const currentlyPlaying = {}

//HandleKeyPresses

document.addEventListener('keydown', (event) => {
    if (!instruments['acoustic_grand_piano']) {
        return
    }
    if (!(event.code in buttonToSoundDict)) {
        return
    }
    if (event.code in currentlyPlaying) {
        if (currentlyPlaying[event.code].isPressed) {
            return
        }

        //deleting for sustain mode
        currentlyPlaying[event.code].stop()
        delete currentlyPlaying[event.code]
    }
    currentlyPlaying[event.code] = instruments['acoustic_grand_piano'].play(buttonToSoundDict[event.code]);
    currentlyPlaying[event.code].isPressed = true
    const currentKeyDown = document.querySelector("." + event.code)
    currentKeyDown.classList.add("keyIsPlaying")
});

document.addEventListener('keyup', (event) => {
    const currentKeyDown = document.querySelector("." + event.code)
    if (!(event.code in currentlyPlaying)) {
        return
    }
    if (sustainCheckbox.checked) {
        currentlyPlaying[event.code].isPressed = false
        currentKeyDown.classList.remove("keyIsPlaying")
        return
    }
    currentlyPlaying[event.code].stop()
    currentKeyDown.classList.remove("keyIsPlaying")
    delete currentlyPlaying[event.code]
});

//Draw computer keyboard part

const computerKeyboardContainer = document.querySelector('.computer-keyboard-display-container')
const computerKeyboardRowContainer = document.querySelectorAll('.computer-keyboard-row')

const computerKeyboardRow1 = chromaticBlackKeys
const computerKeyboardRow2 = chromaticWhiteKeys
const computerKeyboardRow3 = scaleKeys1
const computerKeyboardRow4 = scaleKeys2


function populateComputerKeyboardDivs(keyList, attachment) {
    keyList.forEach(element => {
        const computerKeyboardKey = document.createElement("div")
        computerKeyboardKey.classList.add("computer-keyboard-key")
        computerKeyboardKey.classList.add(element)
        computerKeyboardKey.innerText = element.slice(-1)
        if (element === "Comma") {
            computerKeyboardKey.innerText = ","
        }
        if (element === "Period") {
            computerKeyboardKey.innerText = "."
        }
        if (element === "Slash") {
            computerKeyboardKey.innerText = "/"
        }
        if (element === "Semicolon") {
            computerKeyboardKey.innerText = ";"
        }
        attachment.appendChild(computerKeyboardKey)
    });
}

populateComputerKeyboardDivs(computerKeyboardRow1, computerKeyboardRowContainer[0])
populateComputerKeyboardDivs(computerKeyboardRow2, computerKeyboardRowContainer[1])
populateComputerKeyboardDivs(computerKeyboardRow3, computerKeyboardRowContainer[2])
populateComputerKeyboardDivs(computerKeyboardRow4, computerKeyboardRowContainer[3])


//EventHandlers

function handleAnyKeyChange(event) {
    drawHighlightedScale(keySelector.selectedIndex, modeSelector.selectedIndex, scalesDict[scaleSelector.value])
    mapKeysToSounds(keySelector.selectedIndex, modeSelector.selectedIndex, scalesDict[scaleSelector.value])
}

scaleSelector.addEventListener("change", updateModeSelector)

keySelector.addEventListener("change", handleAnyKeyChange)
modeSelector.addEventListener("change", handleAnyKeyChange)
scaleSelector.addEventListener("change", handleAnyKeyChange)
octaveSelector.addEventListener("change", handleAnyKeyChange)

volumeSlider.addEventListener('change', volumeHandler)
window.addEventListener("resize", handleAnyKeyChange)

//initialized data

drawHighlightedScale(0, 0, naturalScale)
mapKeysToSounds(0, 0, naturalScale)