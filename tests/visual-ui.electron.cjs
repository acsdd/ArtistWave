'use strict';
/* Run with the project's existing Electron runtime; uses a disposable profile. */
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const root=path.resolve(__dirname,'..');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'artistwave-ui-smoke-')));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(win,expression){for(let i=0;i<100;i++){if(await win.webContents.executeJavaScript(expression))return;await wait(100)}throw Error('Timed out waiting for '+expression)}
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,width:1180,height:850});await win.loadFile(path.join(root,'index.html'));
 await until(win,"!!window.ArtistWavePlaylists && !!document.getElementById('themePreviews').children.length");
 await win.webContents.executeJavaScript(`(()=>{
   document.getElementById('providerAudius').checked=false;document.getElementById('providerArchive').checked=true;
   window.__archiveRequests=[];
   window.fetch=url=>{url=String(url);const json=data=>({ok:true,json:async()=>data});
     if(url.includes('advancedsearch.php'))return Promise.resolve(json({response:{numFound:2,docs:[{identifier:'first',creator:'Band'},{identifier:'second',creator:'Band'}]}}));
     if(url.includes('/metadata/'))return new Promise(resolve=>window.__archiveRequests.push({id:url.split('/').pop(),resolve:data=>resolve(json(data))}));
     return Promise.resolve({ok:false,status:404,json:async()=>({})});};
   chooseArtist('Band',null);
 })()`);
 await until(win,"window.__archiveRequests.length===1");
 await win.webContents.executeJavaScript(`window.__archiveRequests.shift().resolve({metadata:{title:'First album',album:'First album'},files:[{name:'one.mp3',title:'First song'}]})`);
 await until(win,"S.tracks.length===1 && window.__archiveRequests.length===1");
 const early=await win.webContents.executeJavaScript(`(()=>{let summary=document.querySelector('.track-more summary');summary.click();const next=document.querySelector('.track-queue-next');next.focus();return {status:document.getElementById('statusMessage').textContent,open:summary.parentElement.open,focus:document.activeElement.dataset.trackAction}})()`);
 if(!/1 found so far/.test(early.status)||!early.open||early.focus!=='next')throw Error('First results are not interactive: '+JSON.stringify(early));
 await win.webContents.executeJavaScript(`window.__archiveRequests.shift().resolve({metadata:{title:'Second album',album:'Second album'},files:[{name:'two.mp3',title:'Second song'}]})`);
 await until(win,"S.tracks.length===2 && !S.loading");
 const result=await win.webContents.executeJavaScript(`(()=>({status:document.getElementById('statusMessage').textContent,open:document.querySelector('.track-more').open,focus:document.activeElement.dataset.trackAction,track:document.activeElement.closest('.track-row')?.querySelector('.track-info strong')?.textContent}))()`);
 if(!result.open||result.focus!=='next'||result.track!=='First song')throw Error('Track interaction was lost: '+JSON.stringify(result));
 const escape=await win.webContents.executeJavaScript(`(()=>{let menu=document.querySelector('.track-more');document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return {open:menu.open,focus:document.activeElement.dataset.trackAction}})()`);
 if(escape.open||escape.focus!=='more')throw Error('Escape did not return focus to the menu: '+JSON.stringify(escape));
 console.log('VISUAL UI SMOKE PASSED',JSON.stringify({early,result,escape}));app.quit();
}).catch(error=>{console.error(error);app.exit(1)});
setTimeout(()=>{console.error('Visual UI smoke timed out');app.exit(1)},90000);
