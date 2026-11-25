'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('theme.js','utf8');
function scene(saved=null){
 const entries=new Map();if(saved!==null)entries.set('artistwave:appearance',saved);
 const listeners=new Map(),attributes={},eventListeners={};
 const button={textContent:'',title:'',attrs:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(name,fn){eventListeners[name]=fn}};
 const select={value:'',addEventListener(name,fn){eventListeners['select-'+name]=fn}};
 const meta={attrs:{},setAttribute(k,v){this.attrs[k]=v}};
 const iframe={contentWindow:{dispatchEvent:e=>{attributes.iframeEvent=e}}};
 const document={documentElement:{dataset:{},style:{}},querySelector:selector=>selector.includes('theme-color')?meta:null,getElementById:id=>id==='themeToggle'?button:id==='themeSelect'?select:id==='miniPlayerFallbackFrame'?iframe:null};
 const storage={getItem:key=>entries.get(key)||null,setItem:(key,val)=>entries.set(key,val)};
 const window={addEventListener:(name,fn)=>listeners.set(name,fn)};
 class CustomEvent{constructor(name,options){this.type=name;this.detail=options.detail}}
 vm.runInNewContext(source,{window,document,localStorage:storage,Set,CustomEvent});
 return {window,document,entries,button,select,meta,listeners,attributes,eventListeners};
}
test('labeled theme selector appears on main page and Mini Player',()=>{
 const main=fs.readFileSync('index.html','utf8');
 const mini=fs.readFileSync('mini-player.html','utf8');
 for(const html of [main,mini]){
   assert.match(html,/id="themeSelect"/);
   assert.match(html,/Select theme/);
   assert.doesNotMatch(html,/id="themeToggle"/);
   assert.match(html,/src="theme\.js" defer/);
 }
 const workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
 assert.match(workflow,/node --check theme\.js/);
 assert.match(workflow,/mini-player\.js theme\.js install\.js sw\.js manifest\.webmanifest icon-192\.png icon-512\.png styles\.css site\//);
});
test('extra palettes can be selected, saved and synchronized',()=>{
 const f=scene();for(const theme of ['bright-night','ocean','plum','bugs','daffy','tweety','sylvester','taz','roadrunner']){f.eventListeners['select-change']({target:{value:theme}});assert.equal(f.document.documentElement.dataset.theme,theme);assert.equal(f.entries.get('artistwave:appearance'),theme);assert.equal(f.attributes.iframeEvent.detail.theme,theme);assert.equal(f.select.value,theme)}
});
test('defaults to night, selects day and saves preference',()=>{
 const f=scene();
 assert.equal(f.document.documentElement.dataset.theme,'night');
 f.eventListeners['select-change']({target:{value:'day'}});
 assert.equal(f.document.documentElement.dataset.theme,'day');
 assert.equal(f.entries.get('artistwave:appearance'),'day');
 assert.equal(f.document.documentElement.style.colorScheme,'light');
 assert.equal(f.meta.attrs.content,'#f6f8f0');
 assert.equal(f.attributes.iframeEvent.detail.theme,'day');
 f.eventListeners['select-change']({target:{value:'night'}});
 assert.equal(f.entries.get('artistwave:appearance'),'night');
});
test('restores preference and synchronizes appearance from another window',()=>{
 const f=scene('day');
 assert.equal(f.document.documentElement.dataset.theme,'day');
 f.listeners.get('storage')({key:'artistwave:appearance',newValue:'night'});
 assert.equal(f.document.documentElement.dataset.theme,'night');
 f.listeners.get('artistwave:theme')({detail:{theme:'day'}});
 assert.equal(f.document.documentElement.dataset.theme,'day');
});
test('rejects unexpected preference value and retains the dark default',()=>{
 const f=scene('unknown');
 assert.equal(f.document.documentElement.dataset.theme,'night');
 assert.equal(f.window.ArtistWaveTheme.applyTheme('javascript:'),'night');
});
test('daylight CSS covers main player, genres, playlists, showdance and mini player',()=>{
 const styles=fs.readFileSync('styles.css','utf8');
 const mini=fs.readFileSync('mini-player.css','utf8');
 for(const selector of ['.player','.genre-node','.my-playlists-library','.youtube-head','.studio-intro','.sidebar']){
   assert.ok(styles.includes('[data-theme="day"] '+selector),selector);
 }
 for(const selector of ['.mini-shell','.mini-cover','.mini-queue','.queue-song']){
   assert.ok(mini.includes('[data-theme="day"] '+selector),selector);
 }
});
