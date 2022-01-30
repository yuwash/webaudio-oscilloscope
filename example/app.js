import {MediaStreamAnalyzer, Oscilloscope, getUserMedia, Renderer} from "../dist/index";

let stats = document.querySelector(".status");
let cvs   = document.querySelector(".cvs");

class FancyGraphRenderer extends Renderer{
    hlineStyle = null
    primer(){
        super.primer();
        this.cctx.strokeStyle = "#444";
        this.cctx.beginPath();
        for(let i=0; i<this.width; i+=10){
            this.cctx.moveTo(i,0);
            this.cctx.lineTo(i,this.height);
        }
        for(let j=0; j<this.height; j+=10){
            this.cctx.moveTo(0,j);
            this.cctx.lineTo(this.width,j);
        }
        this.cctx.stroke();
        this.cctx.strokeStyle = this.strokeStyle;
    }
}

const renderer = new FancyGraphRenderer(cvs);
const osc = new Oscilloscope(renderer);

function startOsc(){
    getUserMedia({audio: true})
        .then(stream=>{
            if(!stream) {
                stats.classList.add("err");
                stats.classList.remove("success");
                stats.innerHTML = "Could not Access microphone";
                return false;
            }
            stats.classList.add("success");
            stats.classList.remove("error");
            stats.innerHTML = "Listening to your microphone, Try saying something";
            const analyzer = new MediaStreamAnalyzer(stream, null, 2048);
            osc.start(analyzer);
            document.querySelector(".btn.pause").addEventListener("click",()=>{
                stats.innerHTML = "Oscilloscope Paused";
                osc.pause();
            });
            document.querySelector(".btn.reset").addEventListener("click",()=>{
                stats.innerHTML = "Oscilloscope Reset";
                osc.reset();
            });
        });
}
document.querySelector(".start").addEventListener("click",startOsc);