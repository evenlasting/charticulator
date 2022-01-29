function generateH5Scrolly (domString,functionString,pageTextArr){
  const pageDomArr=pageTextArr.map((pageText,index)=>{
    return `<div class="step" data-step="${index+1}" data-scrollama-index="${index}" style="min-height: 400px;">
       ${pageText}
  </div>`
  })

  return `<html><head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>scroll demo</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="text/javascript" src="https://d3js.org/d3.v7.min.js"></sc`+`ript>
<style id="compiled-css" type="text/css">
#scrolly {
 position: relative;
 display: -webkit-box;
display: -ms-flexbox;
display: flex;
 background-color: #f3f3f3;
 padding: 1rem;
}
#scrolly > * {
 -webkit-box-flex: 1;
-ms-flex: 1;
flex: 1;
}
article {
 position: relative;
 padding: 0 1rem;
 max-width: 20rem;
}
figure {
 position: -webkit-sticky;
 position: sticky;
 width: 100%;
 margin: 0;
 -webkit-transform: translate3d(0, 0, 0);
 -moz-transform: translate3d(0, 0, 0);
 transform: translate3d(0, 0, 0);
}
figure p {
 text-align: center;
 padding: 1rem;
 position: absolute;
 top: 50%;
 left: 50%;
 -moz-transform: translate(-50%, -50%);
 -webkit-transform: translate(-50%, -50%);
 transform: translate(-50%, -50%);
 font-size: 8rem;
 font-weight: 900;
 color: #000000;
}
.step {
 margin: 0 auto 2rem auto;
 background-color: #3b3b3b;
 color: #fff;
}
.step:last-child {
 margin-bottom: 0;
}
.step.is-active {
 background-color: goldenrod;
 color: #3b3b3b;
}

.container {
}
svg{
display: flex;
}

</style>
</head>
<body>
<main>
<section id="scrolly">
 <article>
  ${pageDomArr.join("")}
 </article>
 <figure style="height: 564.5px; top: 282.25px;">
    <p>3</p>
    <svg width="800" height="800"  class="container">
      ${domString}  
    </svg>
 </figure>
</section>
<section id="outro"></section>
</main>
<script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"></sc`+`ript>
<script src="https://cdnjs.cloudflare.com/ajax/libs/stickyfill/2.1.0/stickyfill.min.js" integrity="sha512-dmLpQXesGDP0ZM/s8zGKQU3Xlbix57QfwFNFh+BY5Ad/afObQ/lBo200mHWuHu8LOoI7tlK09yP3L/4DjdQ5Xw==" crossorigin="anonymous" referrerpolicy="no-referrer"></sc`+`ript>
<script src="https://cdnjs.cloudflare.com/ajax/libs/scrollama/2.2.3/scrollama.min.js" integrity="sha512-VA88R5xDavOzWJuU2OsnYC0Y6SkKgP/wo9MqwoB1yW2xpybccfamAIvDlz0MzzFo3M1ooy1SvbW06MrT+RNW3g==" crossorigin="anonymous" referrerpolicy="no-referrer"></sc`+`ript>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.8.0/gsap.min.js"></sc`+`ript>
<script type="text/javascript">
// using d3 for convenience
var main = d3.select("main")
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");
var width = 200;
var height = 300;
var margin = { top: 40, bottom: 40, left: 70, right: 40 };


${functionString}

// initialize the scrollama
var scroller = scrollama();
// generic window resize listener event
function handleResize() {
// 1. update height of step elements
var stepH = Math.floor(window.innerHeight);
step.style("height", stepH + "px");
var figureHeight = window.innerHeight / 2
var figureMarginTop = (window.innerHeight - figureHeight) / 2
figure
.style("height", figureHeight + "px")
.style("top", figureMarginTop + "px");
// 3. tell scrollama to update new element dimensions
scroller.resize();
}
// scrollama event handlers
function handleStepEnter(response) {
// response = { element, direction, index }
// add color to current step only
step.classed("is-active", function (d, i) {
return i === response.index;
})
// update graphic based on step
figure.select("p").text(response.index + 1);
figure.call(activateFunctions[response.index])
}
function setupStickyfill() {
d3.selectAll(".sticky").each(function () {
Stickyfill.add(this);
});
}
function init() {
setupStickyfill();
// 1. force a resize on load to ensure proper dimensions are sent to scrollama
handleResize();
// 2. setup the scroller passing options
//       this will also initialize trigger observations
// 3. bind scrollama event handlers (this can be chained like below)
scroller.setup({
step: "#scrolly article .step",
offset: 0.33,
debug: true,
})
.onStepEnter(handleStepEnter)
// setup resize event
window.addEventListener("resize", handleResize);
}
// kick things off
init();
</sc`+`ript><div id="scrollama__debug-offset--mtg1637828596155" class="scrollama__debug-offset" style="position: fixed; left: 0px; width: 100%; height: 0px; border-top: 2px dashed black; z-index: 9999; top: 372.57px;"><p style="font-size: 12px; font-family: monospace; color: black; margin: 0px; padding: 6px;">".step" trigger: <span>0.33</span></p></div>


</body></html>`
}

function dom2string(dom){
const objE = document.createElement("div");
objE.appendChild(dom.cloneNode(true));
const string=objE.innerHTML;
return string;
}

function string2dom(string){
const objE = document.createElement("div");
objE.innerHTML=string;
return objE;
}

async function exportScrolly(){
d3.select('#output_scrolly')
    .on('click',async ()=>{
    const svgArr=[];
    const dataRowIndicesArr=[];
    for (let i=0;i<storeArr.length;i++){
        svgArr.push(await storeArr[i].renderLocalSVG());
        //第0个图层是最初始的图层
        dataRowIndicesArr.push(storeArr[i].chartState.elements[0].dataRowIndices);
    }
    // storeArr.forEach(async (store)=>{
    //   svgArr.push(await store.renderLocalSVG());
    //   dataRowIndicesArr.push(store.chartState.elements[0].dataRowIndices);
    // })
    const dataLength=storeArr[0].dataset.tables[0].rows.length;
    const viewLength=storeArr.length;
    const transitionArr=[];
    const markFlow=IDManager.generateMarkFlow();
    const iconFlow=IDManager.generateIconFlow();
    for (let i=0;i<viewLength;i++){
        transitionArr.push(createTransition(dataLength,i,markFlow));
    }
    const initDom=document.createElement("g");
    for (let i=0;i<dataLength;i++) {
        const types=IDManager.getMarksType();
        types.forEach((type,typeIndex)=>{
            const child=document.createElement(type);
            child.setAttribute('class',`C${i}_${typeIndex}`);
            if (type==='image'){
                child.setAttribute('xlink:href',markFlow[0]['sequece'][typeIndex][0]['xlink:href']);
            }
            initDom.appendChild(child);
        })
    }
    for (let pageIndex=0;pageIndex<viewLength;pageIndex+=1){
        iconArr=iconFlow[pageIndex];
        iconArr.forEach(icon=>initDom.appendChild(icon));
    }
    let generateActivateFunction="const activateFunctions=[];\n";
    transitionArr.forEach((transition,index)=>{
        generateActivateFunction+=`activateFunctions[${index}]=showView${index};\n`
    })
    const pageTextArr=storeArr.map(store=>store.pageText);
    // console.log('svgString',dom2string(initDom));
    const H5=generateH5Scrolly(
        dom2string(initDom),
        transitionArr.join("\n")+generateActivateFunction,
        pageTextArr
        );

    console.log(IDManager.generateMarkFlow());
    download("H5.html",H5);
    
    })
}

function download(filename,text){
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// function createTransition (string,data,length,viewId,markFlow){
function createTransition (length,viewId,markFlow){
    // const doms=string2dom(string).querySelectorAll('circle');
    const styleFlow=markFlow.map(mark=>mark['sequece']);
    const glyphNum=styleFlow[0].length;
    let ans=`var showView${viewId} = function(){`
    for (let id=0;id<length;id+=1){
        // domIndex=findDataById(id,data);
        // let styleObj={autoAlpha:1}
        // if (domIndex===null) styleObj['autoAlpha']=0;
        // else {
        // const dom=doms[domIndex];
        // styleObj=Object.assign(styleObj,dom2Style(dom));
        // }
        // ans+=createTransition4element(id,1,styleObj);
        for (let glyphIndex=0;glyphIndex<glyphNum;glyphIndex+=1) {
            let styleObj={autoAlpha:1};
            styleObj=Object.assign(styleObj,styleFlow[id][glyphIndex][viewId]);
            ans+=createTransition4element(`${id}_${glyphIndex}`,1,styleObj);
        }
    }
    return ans+'}\n';
}

function createTransition4element(id,duration,style){
    const styleBack=JSON.parse(JSON.stringify(style));
    delete styleBack['xlink:href']
    return `TweenLite.to(".C${id}",${duration},${JSON.stringify(styleBack)});\n`;
}

// function dom2Style(dom){
// const ans={};
// const props=['cx','cy','r'];
// const styles=['fill','opacity'];
// props.forEach((prop)=>{
//     ans[prop]=dom.getAttribute(prop);
// })
// styles.forEach((style)=>{
//     if (dom.style[style]!==undefined)
//     ans[style]=dom.style[style]
// })
// return ans;
// }

// function findDataById(id,data){
// for (let i=0;i<data.length;i++){
//     if (data[i].indexOf(id)!==-1)
//     return i;
// }
// return null;
// }

exportScrolly()