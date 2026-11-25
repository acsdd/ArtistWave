'use strict';
const {app,BrowserWindow,session}=require('electron'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const root=path.resolve(__dirname,'..');app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'artistwave-queue-smoke-')));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(win,expression){for(let i=0;i<100;i++){if(await win.webContents.executeJavaScript(expression))return;await wait(100)}throw Error('Timed out waiting for '+expression)}
app.whenReady().then(async()=>{
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(details,callback)=>callback({cancel:true}));
 const win=new BrowserWindow({show:false,width:1180,height:850,webPreferences:{backgroundThrottling:false}});await win.loadFile(path.join(root,'index.html'));
 await until(win,"document.querySelectorAll('.genre-top-button').length>5");
 const genre=await win.webContents.executeJavaScript(`(()=>{const tree=document.getElementById('genreTree'),buttons=tree.querySelectorAll('.genre-top-button'),target=buttons[buttons.length-2];target.scrollIntoView({block:'nearest'});target.focus();const name=target.textContent,scroll=tree.scrollTop;target.click();return {name,scroll,after:tree.scrollTop,focused:document.activeElement.textContent,expanded:document.activeElement.getAttribute('aria-expanded')}})()`);
 if(genre.focused!==genre.name||genre.expanded!=='true'||Math.abs(genre.scroll-genre.after)>2)throw Error('Genre focus or position changed: '+JSON.stringify(genre));
 await win.webContents.executeJavaScript(`(()=>{window.__mockSelected=0;window.ArtistWaveMiniHost={state:()=>({title:'Track',artist:'Band',source:'LOCAL',playing:false,favorite:false,shuffle:false,repeat:'Repeat: off',currentTime:0,duration:100,volume:.5,hasTrack:true,cover:'',playlists:[],selected:window.__mockSelected,queue:Array.from({length:80},(_,i)=>({title:'Track '+i,artist:'Band',index:i})),smartQueue:[]}),command(){}};const f=document.createElement('iframe');f.id='miniSmokeFrame';f.style.cssText='position:fixed;width:430px;height:700px;top:0;left:0;z-index:9999';f.src='mini-player.html?embedded=1';document.body.append(f)})()`);
 await until(win,"document.getElementById('miniSmokeFrame').contentDocument?.querySelectorAll('.queue-song').length===80");
 const before=await win.webContents.executeJavaScript(`(()=>{const d=document.getElementById('miniSmokeFrame').contentDocument,list=d.getElementById('miniQueueList');list.scrollTop=900;const item=list.querySelectorAll('.queue-song')[22];item.focus({preventScroll:true});return {scroll:list.scrollTop,key:item.dataset.queueKey,focused:d.activeElement.dataset.queueKey}})()`);
 await win.webContents.executeJavaScript('window.__mockSelected=1');await wait(800);
 const after=await win.webContents.executeJavaScript(`(()=>{const d=document.getElementById('miniSmokeFrame').contentDocument,list=d.getElementById('miniQueueList');return {scroll:list.scrollTop,focused:d.activeElement.dataset.queueKey,selected:list.querySelector('.queue-song.active')?.dataset.queueKey}})()`);
 if(before.scroll<1||Math.abs(after.scroll-before.scroll)>2||after.focused!==before.key||!after.selected?.includes('Track 1'))throw Error('Mini queue focus or position changed: '+JSON.stringify({before,after}));
 console.log('BROWSING AND MINI QUEUE SMOKE PASSED',JSON.stringify({genre,before,after}));app.quit();
}).catch(error=>{console.error(error);app.exit(1)});setTimeout(()=>{console.error('UI smoke timed out');app.exit(1)},60000);
