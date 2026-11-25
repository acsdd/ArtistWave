'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('experience.js','utf8');
function harness(){
 const store=new Map(),nodes=new Map(),listeners={};
 const element=()=>({children:[],dataset:{},style:{},hidden:false,value:'',attrs:{},classList:{add(){},remove(){}},append(...xs){this.children.push(...xs)},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this['on'+k]=fn},querySelectorAll(){return this.children},scrollIntoView(){}});
 for(const id of ['themePreviews','themeSelect','displayDensity','glassIntensity','gettingStarted','dismissGettingStarted','showGettingStarted','actionToast'])nodes.set(id,element());
 nodes.get('themeSelect').querySelectorAll=()=>[{value:'night',textContent:'Night'},{value:'ocean',textContent:'Ocean'}];
 const root={dataset:{theme:'night'}},document={documentElement:root,getElementById:id=>nodes.get(id),createElement:element};
 const localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
 const window={ArtistWaveTheme:{applyTheme(t,persist){root.dataset.theme=t;if(persist)store.set('artistwave:appearance',t)}}};
 vm.runInNewContext(source,{document,window,localStorage,MutationObserver:class{observe(){}},matchMedia:()=>({matches:true}),clearTimeout(){},setTimeout:()=>1});
 return {nodes,store,root,window};
}
test('appearance controls apply and persist theme, spacing and glass choices',()=>{
 const h=harness(),buttons=h.nodes.get('themePreviews').children;
 assert.equal(buttons.length,2);buttons[1].onclick();assert.equal(h.root.dataset.theme,'ocean');assert.equal(h.store.get('artistwave:appearance'),'ocean');
 const density=h.nodes.get('displayDensity');density.value='compact';density.onchange();assert.equal(h.root.dataset.density,'compact');assert.equal(h.store.get('artistwave:display-density'),'compact');
 const glass=h.nodes.get('glassIntensity');glass.value='strong';glass.onchange();assert.equal(h.root.dataset.glass,'strong');assert.equal(h.store.get('artistwave:glass-intensity'),'strong');
});
test('getting started can be dismissed and action feedback stays text-only',()=>{
 const h=harness();h.nodes.get('dismissGettingStarted').onclick();assert.equal(h.nodes.get('gettingStarted').hidden,true);assert.equal(h.store.get('artistwave:guide-dismissed'),'yes');
 h.window.ArtistWaveFeedback.show('<img onerror=bad>');assert.equal(h.nodes.get('actionToast').textContent,'<img onerror=bad>');
});

test('new presentation code is packaged for desktop and offline web use',()=>{
 const html=fs.readFileSync('index.html','utf8'),worker=fs.readFileSync('sw.js','utf8'),workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
 assert.match(html,/src="experience\.js" defer/);assert.ok(worker.includes("'./experience.js'"));assert.ok(workflow.includes('experience.js site/'));
});
