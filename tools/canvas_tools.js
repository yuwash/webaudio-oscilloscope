const DEFAULT_FILL   = "#111111";
const DEFAULT_STROKE = "#11ff11"; 
const HLINE_COLOR    = "#555555";
class Renderer{
    fillStyle = DEFAULT_FILL
    strokeStyle = DEFAULT_STROKE
    hlineStyle = HLINE_COLOR
    constructor(canvasElement){
        this.analyzer = null;
        this.cvs = canvasElement;
        let {width = 300, height = 150} = this.cvs;
        this.width = width;
        this.height = height;
        this.cctx = this.cvs.getContext("2d");
        this.canvasXArray = null;  // only needs to be calculated once
    }
    init(analyzer){
        this.analyzer = analyzer;
        this.canvasXArray = this.getCanvasXArray();
    }
    primer(){
        if(this.fillStyle){
            this.cctx.fillStyle = this.fillStyle;
            this.cctx.fillRect(0,0,this.width,this.height);
        }
        if(this.hlineStyle){
            this.cctx.strokeStyle = this.hlineColor;
            this.cctx.beginPath();
            this.cctx.moveTo(0, this.height / 2);
            this.cctx.lineTo(this.width, this.height / 2);
            this.cctx.stroke();
            this.cctx.strokeStyle = this.strokeStyle;
        }
    }
    getCanvasXArray(){
        const length = this.analyzer.FFT;
        const result = new Uint16Array(length);
        for(let i=0; i < length; i++){
            result[i] = i * (this.width * 1.0 / length); // need to fix x
        }
        return result;
    }
    getCanvasYArray(){
        const canvasFactor = this.height / 2 / this.analyzer.middleValue;
        const result = new Uint16Array(this.analyzer.FFT);
        // uint16 should suffice to represent pixels (but not uint8)
        this.analyzer.u8ar.forEach((v, i) => {
            result[i] = v * canvasFactor;
        });
        return result;
    }
    osc(){
        if(!(this.analyzer && this.strokeStyle)){
            return;
        }
        const canvasYArray = this.getCanvasYArray();
        this.cctx.beginPath();
        for(let i=0; i < canvasYArray.length; i++){
            let x = this.canvasXArray[i];
            let y = canvasYArray[i];
            if(i === 0) this.cctx.moveTo(x,y);
            else this.cctx.lineTo(x,y);
        }
        this.cctx.stroke();
    }
    reset(){
        this.cctx.clearRect(0 , 0, this.width, this.height);
    }
}
export {
    Renderer
}
