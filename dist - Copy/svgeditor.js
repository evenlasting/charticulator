//switch
const editorModeArr=['dataDriven','svgEditor'];
let editorModeIndex=0;
function mode2svgEditorDisplay(index){
    return ['none',''][index];
}
d3.select('#svgEditor')
.attr('style',`left: 10%;top:10%;bottom: 0%;right: 0%;position: fixed;`)
.style('display','none');

const IDManager=new GlobalIdManager();

function dom2string(dom){
    const objE = document.createElement("div");
    objE.appendChild(dom.cloneNode(true));
    const string=objE.innerHTML;
    return string;
}

function string2dom(string){
    const objE = document.createElement("div");
    objE.innerHTML=string;
    return objE.firstChild;
}

const svgDomArr=[];

d3.select('#switch_edit')
.on('click',async ()=>{
    editorModeIndex=1-editorModeIndex;
    d3.select('#svgEditor')
    .style('display',mode2svgEditorDisplay(editorModeIndex));
    if ('svgEditor'===editorModeArr[editorModeIndex]){
        const svgString=await storeArr[storeActiveIndex].renderLocalSVG();
        const svgDom=string2dom(svgString);
        svgDomArr[storeActiveIndex] =  new SvgChart(svgDom,
            storeArr[storeActiveIndex].chartState.elements.map(x=>x.dataRowIndices),
            IDManager,
            storeActiveIndex);
        
        editor.import.loadSvgString(dom2string(svgDom));
    }
    else{
        const svgDom=document.querySelector('#svg_2');
        // new SvgChart(svgDom,
        //     storeArr[storeActiveIndex].chartState.elements.map(x=>x.dataRowIndices),
        //     IDManager,
        //     storeActiveIndex);
        // svgDomArr[storeActiveIndex]=svgDom.cloneNode(true);
        svgDomArr[storeActiveIndex].updateDom(svgDom);
        const svgString=dom2string(svgDom);
        const svgbase64='data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        document.querySelector(`#page${storeActiveIndex}`).firstChild.setAttribute('src',svgbase64);
    }
})