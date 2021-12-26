"use strict";
import {Renderer} from "./tools/canvas_tools";

class AudioAnalyzer{
    middleValue = 128  // Uint8Array is always filled in a scale of 0..255 (2^8)
    constructor(audioContext, audioSource, audioDest = null, analyzerFFT = 2048){
        this.actx   = audioContext;
        this.FFT    = analyzerFFT;
        this.anl    = this.actx.createAnalyser();
        this.ctx    = audioContext;
        this.src    = audioSource;
        this.dest   = audioDest;
        // Configure Analyzer
        this.anl.fftSize = this.FFT;
        this.bufferLength = this.anl.frequencyBinCount;
        this.src.connect(this.anl);
        if(this.dest) this.anl.connect(this.dest);
        // We have to use Uint8Array because that’s the only type
        // supported by the AnalyserNode methods
        this.u8ar = new Uint8Array(this.FFT);
        this.frequencyU8ar = new Uint8Array(this.bufferLength);
    }
    reset(){
        this.u8ar = new Uint8Array(this.FFT).fill(0);
    }
    update(){
        this.anl.getByteTimeDomainData(this.u8ar);
        this.anl.getByteFrequencyData(this.frequencyU8ar);
    }
}

class Oscilloscope {
    constructor(renderer) {
        this.analyzer = null;
        this.renderer = renderer;
        this.paused = true;
    }
    draw = () => {
        if(!this.paused) requestAnimationFrame(this.draw);
        this.renderer.reset();
        this.renderer.primer();
        this.analyzer.update();
        this.renderer.osc();
    }
    start = analyzer => {
        this.analyzer = analyzer;
        // Set up Canvas
        this.renderer.init(analyzer);
        this.paused = false;
        this.draw();
    }
    pause = () => {
        this.paused = true;
    }
    reset = () => {
        this.paused = true;
        requestAnimationFrame(() => {
            this.analyzer?.reset();
            this.renderer.reset();
            this.renderer.primer();
            this.renderer.osc();
        });
    }
}

function createAudioContext(){
    return new (window.AudioContext || window.webkitAudioContext)();
}

function MediaStreamAnalyzer(mediaStream, audioDest = null, analyzerFFT = 2048){
    let ctx = createAudioContext();
    let src = ctx.createMediaStreamSource(mediaStream);
    return new AudioAnalyzer(ctx, src, audioDest, analyzerFFT);
}

function getUserMedia(constraints){
    return new Promise((resolve)=>{
        if(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia(constraints).then(resolve).catch(()=>resolve(null));
        }
        else if(navigator.getUserMedia){
            navigator.getUserMedia(constraints, resolve, ()=>resolve(null));
        }
        else if(navigator.webkitGetUserMedia){
            navigator.webkitGetUserMedia(constraints, resolve, ()=>resolve(null));
        }
        else if(navigator.mozGetUserMedia){
            navigator.mozGetUserMedia(constraints, resolve, ()=>resolve(null));
        }
        else resolve(null);
    });
}
export {
    Oscilloscope,
    MediaStreamAnalyzer,
    createAudioContext,
    getUserMedia,
    Renderer
}
