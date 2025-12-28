import lamejs from '@breezystack/lamejs';
import JSZip from 'jszip'
import SparkMD5 from 'spark-md5'
import './style.css'

const ctx = (document.getElementById('canvas') as HTMLCanvasElement).getContext('2d')!
const video = document.getElementById('video') as HTMLVideoElement
const download = document.getElementById('download') as HTMLAnchorElement
const input = document.getElementById('input') as HTMLInputElement

let arrayBuffer: ArrayBuffer
let x: number
let ratio: number
let zip: JSZip
let project: string
let canPlay = false

async function seeked() {
    if (video.ended) {
        // When the costumes are done loading
        project += '],"sounds":['
        download.text = 'Converting to mp3...'
        // Now we convert the video's audio into an mp3 via lamejs
        const audioCtx = new AudioContext()
        const buffer = await audioCtx.decodeAudioData(arrayBuffer)
        // Boring conversion code
        const sampleRate = buffer.sampleRate
        const samples = buffer.getChannelData(0)
        const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 64)
        const mp3Data = []
        const blockSize = 1152

        for (let i = 0; i < samples.length; i += blockSize) {
            const chunk = samples.subarray(i, i + blockSize)
            const mp3Buffer = mp3Encoder.encodeBuffer(
                new Int16Array(chunk.map(s => Math.max(-1, Math.min(1, s)) * 32767))
            )
            if (mp3Buffer.length) mp3Data.push(mp3Buffer)
        }
        mp3Data.push(mp3Encoder.flush())
        // Now we add it to JSZip and the project.json
        const blob = new Blob(mp3Data as BlobPart[], { type: "audio/mp3" })
        const md5 = SparkMD5.hash(await blob.text())
        project += '{"name":"Audio","dataFormat":"mp3","assetId":"' + md5 + '","md5ext":"' + md5 + '.mp3"},'
        zip.file(md5 + '.mp3', blob)
        // Finally we can finish the project.json and zip it!
        zip.file('project.json', project + '],"volume":100,"layerOrder":1,"visible":true,"x":0,"y":0,"size":100,"direction":90,"draggable":false,"rotationStyle":"all around"}],"monitors":[],"extensions":[],"meta":{"semver":"3.0.0","vm":"0.2.0","agent":""}}')
        zip.generateAsync({type: 'blob'})
            .then((content) => {
                download.text = 'Your project is ready; click here to download it!'
                download.href = URL.createObjectURL(content)
            })
        return
    } else {
        // Draw the video image to a canvas, convert to jpg, advance video, repeat
        ctx.drawImage(video, x, 0, ratio, 360)
        const frame = Math.round(video.currentTime * 10)
        ctx.canvas.toBlob(async (blob) => {
            if (blob) {
                // Stores the current frame as a JPG blob and adds it to the JSZip filesystem
                const md5 = SparkMD5.hash(await blob.text())
                project += '{"name":"' + frame + '","bitmapResolution":1,"dataFormat":"jpg","assetId":"' + md5 + '","md5ext":"' + md5 + '.jpg","rotationCenterX":240,"rotationCenterY":180},'
                zip.file(md5 + '.jpg', blob)
                video.currentTime += .1
            }
        }, 'image/jpeg', .7)
    }
}

video.addEventListener('seeked', seeked)

video.addEventListener('canplay', () => {
    // Only runs start up code if the event hasn't been triggered already
    if (!canPlay) {
        canPlay = true
        // Does some calculations to fit the video inside Scratch's 4:3 aspect ratio
        ratio = (video.videoWidth / video.videoHeight) * 360
        x = 240 - (ratio / 2)
        // Starts the seeking loop
        seeked()
    }
})

input.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files![0]

    if (file) {
        canPlay = false
        download.text = 'Getting array buffer...'
        arrayBuffer = await file.arrayBuffer() // This is important for audio conversion
        download.text = 'Converting video frames... (This takes a while; feel free to do something else while you wait)'
        download.download = file.name + '.sb3'
        // Sets up the basic project so that we can add the frames and sound to it later
        project = '{"targets":[{"isStage":true,"name":"Stage","variables":{},"lists":{},"broadcasts":{},"blocks":{},"comments":{},"currentCostume":0,"costumes":[{"name":"backdrop1","dataFormat":"svg","assetId":"cd21514d0531fdffb22204e0ec5ed84a","md5ext":"cd21514d0531fdffb22204e0ec5ed84a.svg","rotationCenterX":240,"rotationCenterY":180}],"sounds":[],"volume":100,"layerOrder":0,"tempo":60,"videoTransparency":50,"videoState":"on","textToSpeechLanguage":null},{"isStage":false,"name":"video2sb3","variables":{},"lists":{},"broadcasts":{},"blocks":{"h":{"opcode":"event_whenflagclicked","next":"c","parent":null,"inputs":{},"fields":{},"shadow":false,"topLevel":true,"x":48,"y":64},"c":{"opcode":"sensing_resettimer","next":"d","parent":"h","inputs":{},"fields":{},"shadow":false,"topLevel":false},"d":{"opcode":"control_forever","next":null,"parent":"c","inputs":{"SUBSTACK":[2,"a"]},"fields":{},"shadow":false,"topLevel":false},"a":{"opcode":"looks_switchcostumeto","next":null,"parent":"d","inputs":{"COSTUME":[3,"e","i"]},"fields":{},"shadow":false,"topLevel":false},"e":{"opcode":"operator_add","next":null,"parent":"a","inputs":{"NUM1":[3,"f",[4,""]],"NUM2":[1,[4,"1"]]},"fields":{},"shadow":false,"topLevel":false},"f":{"opcode":"operator_mathop","next":null,"parent":"e","inputs":{"NUM":[3,"g",[4,""]]},"fields":{"OPERATOR":["floor",null]},"shadow":false,"topLevel":false},"g":{"opcode":"operator_multiply","next":null,"parent":"f","inputs":{"NUM1":[3,"j",[4,""]],"NUM2":[1,[4,"10"]]},"fields":{},"shadow":false,"topLevel":false},"j":{"opcode":"sensing_timer","next":null,"parent":"g","inputs":{},"fields":{},"shadow":false,"topLevel":false},"i":{"opcode":"looks_costume","next":null,"parent":"a","inputs":{},"fields":{"COSTUME":["1",null]},"shadow":true,"topLevel":false},"k":{"opcode":"event_whenflagclicked","next":"b","parent":null,"inputs":{},"fields":{},"shadow":false,"topLevel":true,"x":48,"y":384},"b":{"opcode":"sound_playuntildone","next":"l","parent":"k","inputs":{"SOUND_MENU":[1,"m"]},"fields":{},"shadow":false,"topLevel":false},"m":{"opcode":"sound_sounds_menu","next":null,"parent":"b","inputs":{},"fields":{"SOUND_MENU":["Audio",null]},"shadow":true,"topLevel":false},"l":{"opcode":"control_stop","next":null,"parent":"b","inputs":{},"fields":{"STOP_OPTION":["other scripts in sprite",null]},"shadow":false,"topLevel":false,"mutation":{"tagName":"mutation","children":[],"hasnext":"true"}}},"comments":{},"currentCostume":0,"costumes":['
        zip = new JSZip() // Initializes JSZip so it can store the frames and compress them later
        const blob = URL.createObjectURL(file)
        video.src = blob // Setting video.src eventually fires the canplay event; this is used to reduce unnecessary frames
    }
})