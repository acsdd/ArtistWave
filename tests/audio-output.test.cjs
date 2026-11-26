'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('audio-output.js','utf8');
const wait=()=>new Promise(resolve=>setImmediate(resolve));
async function ready(){await wait();await wait();await wait()}
function harness({saved='',devices=[{deviceId:'default',label:'Default'},{deviceId:'speaker-a',label:'Desk speakers'},{deviceId:'speaker-b',label:'Headphones'}],fails=[]}={}){
 const values=new Map(saved?[['artistwave:audio-output',saved]]:[]),nodes={},deviceEvents={};
 function node(){return {value:'',disabled:false,textContent:'',options:[],listeners:{},addEventListener(event,fn){this.listeners[event]=fn},replaceChildren(...options){this.options=options;this.value=options[0]?.value||''},add(option){this.options.push(option)},fire(event){this.listeners[event]?.()}}}
 for(const id of ['audioOutputSelect','audioOutputRefresh','audioOutputStatus'])nodes[id]=node();
 const players=['audio','studioAudio'].map(id=>nodes[id]={sinkId:'',calls:[],async setSinkId(value){this.calls.push(value);if(fails.includes(value))throw Error('failed');this.sinkId=value}});
 let current=devices;
 const context={document:{getElementById:id=>nodes[id]},window:{AudioWaveOutputs:{list:async()=>current}},navigator:{mediaDevices:{addEventListener:(event,fn)=>deviceEvents[event]=fn}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},Option:function(text,value){this.text=text;this.value=value},Promise,Set};
 vm.runInNewContext(source,context);return {nodes,players,values,setDevices(value){current=value},deviceEvents};
}
test('choosing an output routes both audio players and persists the choice',async()=>{
 const h=harness();await ready();assert.equal(h.nodes.audioOutputSelect.options.length,3);
 h.nodes.audioOutputSelect.value='speaker-b';h.nodes.audioOutputSelect.fire('change');await ready();
 assert.deepEqual(h.players.map(x=>x.sinkId),['speaker-b','speaker-b']);assert.equal(h.values.get('artistwave:audio-output'),'speaker-b');
 h.nodes.audioOutputSelect.value='';h.nodes.audioOutputSelect.fire('change');await ready();assert.deepEqual(h.players.map(x=>x.sinkId),['','']);assert.equal(h.values.has('artistwave:audio-output'),false);
});
test('a saved output is restored, falls back when unplugged, and reconnects',async()=>{
 const h=harness({saved:'speaker-a'});await ready();assert.deepEqual(h.players.map(x=>x.sinkId),['speaker-a','speaker-a']);
 h.setDevices([{deviceId:'speaker-b',label:'Headphones'}]);h.deviceEvents.devicechange();await ready();assert.deepEqual(h.players.map(x=>x.sinkId),['','']);assert.match(h.nodes.audioOutputStatus.textContent,/unavailable/i);assert.equal(h.values.get('artistwave:audio-output'),'speaker-a');
 h.setDevices([{deviceId:'speaker-a',label:'Desk speakers'}]);h.deviceEvents.devicechange();await ready();assert.deepEqual(h.players.map(x=>x.sinkId),['speaker-a','speaker-a']);
});
test('a failed switch leaves the previous output and saved choice intact',async()=>{
 const h=harness({saved:'speaker-a',fails:['speaker-b']});await ready();h.nodes.audioOutputSelect.value='speaker-b';h.nodes.audioOutputSelect.fire('change');await ready();
 assert.deepEqual(h.players.map(x=>x.sinkId),['speaker-a','speaker-a']);assert.equal(h.values.get('artistwave:audio-output'),'speaker-a');assert.equal(h.nodes.audioOutputSelect.value,'speaker-a');assert.match(h.nodes.audioOutputStatus.textContent,/could not/i);
});
test('the output selector is shipped to desktop and offline website',()=>{
 const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
 assert.match(html,/id="audioOutputSelect"/);assert.match(html,/src="audio-output\.js" defer/);assert.ok(sw.includes("'./audio-output.js'"));assert.ok(workflow.includes('audio-output.js site/'));
});
