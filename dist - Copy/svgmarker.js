
// 坐标轴
// mark
// 文字
// 形状

class SvgChart{
    constructor(dom,dataRowIndices,IDManager,page){
        this.IDManager=IDManager;
        this.page=page;
        this.dom=dom;
        const fatherLevel=[...dom.children[0].children[0].children[0].children].slice(2);
        dataRowIndices.forEach((dataRowIndex,index)=>{
            if (dataRowIndex===undefined){
                //文字，形状，link
                const node=fatherLevel[index];
                if (node.className.baseVal==='')
                    node.setAttribute('globalID',this.IDManager.askForID('icon',page,node));
            }
            else {
                //坐标轴，mark
                const axis=fatherLevel[index].children[0];
                if (axis.className.baseVal==='')
                    axis.setAttribute('globalID',this.IDManager.askForID('axis',page,axis));
                const nodes=this.findAllNewNode(fatherLevel[index].children[1]);
                nodes.forEach((node,nodeIndex)=>{
                    const nodeIndexForAllGlyph=nodeIndex % dataRowIndex.length;
                    const markIDinGlyph=Math.ceil(nodeIndex / dataRowIndex.length);
                    if (node.className.baseVal==='')
                        node.setAttribute('globalID',this.IDManager.askForID(dataRowIndex[nodeIndexForAllGlyph],page,node)); //有可能是数组
                        
                    })

            }
        })
    }

    updateDom(dom){
        this.dom=dom;
        const updateNodes=this.findALLOldNode(dom);
        this.IDManager.update(updateNodes);
        const nodes=this.findAllNewNode(dom);
        nodes.forEach(node=>{
            node.setAttribute('globalID',this.IDManager.askForID('icon',storeActiveIndex,node));
        })
    };

    checkEmpty(dom){
        if (dom.children.length===0 && dom.tagName==='g') return true;
        if (dom.children.length===0 && dom.tagName!=='g') return false;
        return [...dom.children].every(child=>this.checkEmpty(child));
    }

    findAllNewNode(dom){
        let ans=[];
        if (dom.hasAttribute('globalID')) return ans;
        if (dom.children.length===0 && dom.tagName!=='g') {
            ans.push(dom);
        }
        if (dom.children.length!==0){
            [...dom.children].forEach(child=>ans=[...ans,...this.findAllNewNode(child)]);
        }
        return ans;
    }

    findALLOldNode(dom){
        let ans=[];
        if (dom.hasAttribute('globalID')) return [dom];
        if (dom.children.length===0) return ans;
        [...dom.children].forEach(child=>ans=[...ans,...this.findALLOldNode(child)]);
        return ans;
    }


}


// 全局id
// 有一个id到数据行号的映射
// 有一个id到页数的映射
// 有一个数据行号+页数到id的映射
// 有一个可以做变换的数组的集合
// 每个glyph包括什么

class GlobalIdManager{
    constructor(){
        this.MaxID=-1;
        this.ID2dataRow=new Map();
        this.ID2page=new Map();
        this.ID2type=new Map();
        this.row_page2ID=new Map();

        this.longtext_page2ID=new Map();
        this.icon_page2IDArr=new Map();
        this.ID2dom=new Map();
        this.circleAttr=['cx','cy','r','fill'];
        this.circleStyle=['opacity'];
        this.imageAttr=['xlink:href','x','y','width','height']
    }

    update(domArr){
        domArr.forEach(dom=>{
            const ID=parseInt(dom.getAttribute('globalID'));
            const domClone=dom.cloneNode(true);
            let {x,y}=this.parseTranslate(dom.parentElement.getAttribute('transform'));
            if (x!==0 || y!==0) {
                domClone.setAttribute('x',parseFloat(domClone.getAttribute('x'))+x);
                domClone.setAttribute('y',parseFloat(domClone.getAttribute('y'))+y);
            }
            this.ID2dom.set(ID,domClone);
        })
    }

    askForID(arg,page,dom){
        this.MaxID+=1;
        const domClone=dom.cloneNode(true);
        let {x,y}=this.parseTranslate(dom.parentElement.getAttribute('transform'));
        if (x!==0 || y!==0) {
            domClone.setAttribute('x',parseFloat(domClone.getAttribute('x'))+x);
            domClone.setAttribute('y',parseFloat(domClone.getAttribute('y'))+y);
        }

        this.ID2dom.set(this.MaxID,domClone);
        if (arg==='longtext'){
            this.ID2type.set(this.MaxID,arg);
            this.ID2page.set(this.MaxID,page);
            this.longtext_page2ID.set(page,this.MaxID);
        }
        else if (arg==="icon"){
            this.ID2type.set(this.MaxID,arg);
            this.ID2page.set(this.MaxID,page);
            if (this.icon_page2IDArr.has(page)){
                this.icon_page2IDArr.set(page,[...this.icon_page2IDArr.get(page),this.MaxID]);
            }
            else this.icon_page2IDArr.set(page,[this.MaxID]);
        }
        else if (arg==='no_data'){
            this.ID2type.set(this.MaxID,arg);
            this.ID2page.set(this.MaxID,page);
        }
        else if (arg==='axis'){
            this.ID2page.set(this.MaxID,page);
            this.ID2type.set(this.MaxID,arg);

        }
        else{
            const rows=arg;
            this.ID2type.set(this.MaxID,'mark');
            this.ID2page.set(this.MaxID,page);
            rows.forEach(row=>{
                this.ID2dataRow.set(this.MaxID,row);
                if (this.row_page2ID.has(`${row}_${page}`)){
                    this.row_page2ID.set(`${row}_${page}`,[...this.row_page2ID.get(`${row}_${page}`),this.MaxID])
                }
                else {
                    this.row_page2ID.set(`${row}_${page}`,[this.MaxID]);
                }
            }) 
        }
        return this.MaxID;
    }

    getMarksType(){
        const glyphType=[];
        for (let glyphMarkIndex=0;glyphMarkIndex<this.row_page2ID.get(`0_0`).length;glyphMarkIndex+=1){
            const ID=this.row_page2ID.get(`0_0`)[glyphMarkIndex];
            const type=this.ID2dom.get(ID).tagName;
            glyphType.push(type);
        }
        return glyphType;
    }

    generateMarkFlowForEachRow(row){
        const pageNum=storeArr.length;
        const glyphType=[];
        const glyphAttrSequece=[];//每个图标，在每一页
        for (let glyphMarkIndex=0;glyphMarkIndex<this.row_page2ID.get(`${row}_0`).length;glyphMarkIndex+=1){
            glyphAttrSequece.push([]);//加一个图标
            const sequece=glyphAttrSequece[glyphMarkIndex];
            const ID=this.row_page2ID.get(`${row}_0`)[glyphMarkIndex];
            const type=this.ID2dom.get(ID).tagName;
            glyphType.push(type);
            for (let pageIndex=0;pageIndex<pageNum;pageIndex+=1){
                const ID=this.row_page2ID.get(`${row}_${pageIndex}`)[glyphMarkIndex];
                const dom=this.ID2dom.get(ID);
                let markinSequece={};
                if (type==='circle'){
                    
                    this.circleAttr.forEach((attr)=>{
                        markinSequece[attr]=dom.getAttribute(attr);
                    })
                    this.circleStyle.forEach((style)=>{
                        if (dom.style[style]!==undefined)
                        markinSequece[style]=dom.style[style];
                    })
                }
                else if (type==='image'){
                    this.imageAttr.forEach((attr)=>{
                        markinSequece[attr]=dom.getAttribute(attr);
                    })
                }
                sequece.push(markinSequece);
            }
        }
        return ({'type':glyphType,'sequece':glyphAttrSequece})
    }

    generateMarkFlow(){
        const ans=[];
        for (let i=0;i<storeArr[0].dataset.tables[0].rows.length;i+=1){
            ans.push(this.generateMarkFlowForEachRow(i));
        }
        return ans;
    }

    generateIconFlow(){
        const pageNum=storeArr.length;
        const ans=[];
        for (let i=0;i<pageNum;i+=1){
            const IDArr=this.icon_page2IDArr.get(i);
            const domArr=IDArr.map(ID=>this.ID2dom.get(ID));
            ans.push(domArr);
        }
        return ans;
    }

    parseTranslate(string){
        if (!string) return {'x':0,'y':0};
        const commaPos=string.indexOf(',');
        const x=parseFloat(string.slice(10,commaPos));
        const y=parseFloat(string.slice(commaPos+1,-1));
        return {'x':x,'y':y};
    }
}