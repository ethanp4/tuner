import { PitchDetector } from "https://esm.sh/pitchy@4";

function updatePitch(analyserNode, detector, input, sampleRate) {
  analyserNode.getFloatTimeDomainData(input);
  const [pitch, clarity] = detector.findPitch(input, sampleRate);


  updatePage(pitch)

  window.setTimeout(
    () => updatePitch(analyserNode, detector, input, sampleRate),
    500,
  );
}

function updatePage(pitch) {
  document.getElementById("pitch").textContent = `Frequency ${Math.round(pitch * 10) / 10
    } Hz`;
  freqToNote(pitch)
  // document.getElementById("clarity").textContent = `Clarity: ${Math.round(
  //   clarity * 100,
  // )} %`;
}

document.addEventListener("DOMContentLoaded", () => {
  const audioContext = new window.AudioContext();
  const analyserNode = audioContext.createAnalyser();

  //audio context can stop working if the page is refreshed, this fixes it
  //https://ianjohnson.dev/pitchy/
  document
    .getElementById("resume-button")
    .addEventListener("click", () => audioContext.resume());

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioContext.createMediaStreamSource(stream).connect(analyserNode);
    const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
    detector.minVolumeDecibels = -30;
    const input = new Float32Array(detector.inputLength);
    updatePitch(analyserNode, detector, input, audioContext.sampleRate);
  });
});

// f = 2^n/12 * 440
// n = semitones from A4
function freqToNote(freq) {
  let notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
  let note_number = Math.round(12 * Math.log2(freq / 440) + 49)
  // get a number corresponding to the note in the array
  // https://stackoverflow.com/questions/64505024/turning-frequencies-into-notes-in-python
  let note = notes[(note_number - 1) % notes.length]

  let octave = Math.round((note_number + 8) / notes.length)

  let semitones = 12 * Math.log2(freq / 440)
  // this formula calculates the number of semitones the pitch is from 440hz
  let cents = Math.round((semitones + (-Math.round(semitones))) * 100)
  // 1 cent is 1/100th of a semitone
  // remove the ones and tens place while keeping the sign (semitones % 1 doesnt work)
  // then multiply by 100 and round to integer

  document.getElementById("note").innerHTML = `${note}${octave - 1}`

  if (cents > 0) {
    document.getElementById("diff").innerHTML = `You're ${cents} cents sharp`
  } else {
    document.getElementById("diff").innerHTML = `You're ${Math.abs(cents)} cents flat`
  }
}