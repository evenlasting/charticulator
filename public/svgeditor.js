//switch
const editorModeArr=['dataDriven','svgEditor'];
let editorModeIndex=0
function mode2svgEditorDisplay(index){
    return ['none',''][index];
}
d3.select('#svgEditor')
.style('display','none');

d3.select('#switch_edit')
.on('click',()=>{
    editorModeIndex=1-editorModeIndex;
    d3.select('#svgEditor')
    .style('display',mode2svgEditorDisplay(editorModeIndex));
})