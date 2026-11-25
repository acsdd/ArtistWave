'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const wait=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
function archiveFixture(items){
 const start=app.indexOf('async function loadMore(){'),end=app.indexOf('\n// Browse the MusicBrainz',start);assert.ok(start>0&&end>start);
 const S={loading:false,artist:'Band',requestId:0,providerErrors:{},providerChecked:{},onlineTracks:[],tracks:[],page:0};
 const snapshots=[],nodes={loadMore:{hidden:false},includeLive:{checked:true}};
 const context={S,$:id=>nodes[id],sourceMode:()=> 'both',providerEnabled:name=>name==='archive',syncArchiveLoadMore(){nodes.loadMore.hidden=!!S.loading||!S.archiveMoreAvailable||context.sourceMode()==='local'||!context.providerEnabled('archive')},creatorMatches:()=>true,encodeURIComponent,Error,
   getJSON:async()=>({response:{docs:items.map(id=>({identifier:id,creator:'Band'})),numFound:items.length}}),
   tracksFromItem:id=>context.promises[id].promise,promises:Object.fromEntries(items.map(id=>[id,deferred()])),
   dedupeTracks:tracks=>tracks.filter((x,i)=>tracks.findIndex(y=>y.id===x.id)===i),
   rebuildPlaylist(){S.tracks=S.onlineTracks.slice();snapshots.push(Array.from(S.tracks,x=>x.id))},refreshProviderStatus(){},render(){}};
 const load=vm.runInNewContext(app.slice(start,end)+'\nloadMore',context);
 return {S,context,load,snapshots,nodes};
}
test('Archive search publishes early songs while later recordings are still loading',async()=>{
 const f=archiveFixture(['first','second']);const operation=f.load();await wait();
 f.context.promises.first.resolve([{id:'one'}]);await wait();
 assert.deepEqual(f.snapshots,[['one']]);assert.equal(f.S.loading,true);
 f.context.promises.second.resolve([{id:'two'}]);await operation;
 assert.deepEqual(f.snapshots,[['one'],['one','two']]);assert.equal(f.S.loading,false);assert.equal(f.S.providerChecked.archive,true);
});
test('a previous artist search cannot publish songs after the selection changes',async()=>{
 const f=archiveFixture(['first']);const operation=f.load();await wait();f.S.requestId++;f.S.artist='Another';f.context.promises.first.resolve([{id:'stale'}]);await operation;
 assert.deepEqual(f.snapshots,[]);assert.equal(f.S.onlineTracks.length,0);
});
test('Archive reports partial and complete recording failures instead of silently hiding them',async()=>{
 const f=archiveFixture(['first','second']);const operation=f.load();await wait();f.context.promises.first.resolve([{id:'one'}]);await wait();f.context.promises.second.reject(Error('offline'));await operation;
 assert.equal(f.S.tracks.length,1);assert.match(f.S.providerErrors.archive,/Some recordings/);assert.equal(f.S.page,0);assert.equal(f.nodes.loadMore.hidden,false);assert.match(f.nodes.loadMore.textContent,/Retry/);
 const all=archiveFixture(['only']);const operation2=all.load();await wait();all.context.promises.only.reject(Error('offline'));await operation2;
 assert.equal(all.S.page,0);assert.match(all.S.providerErrors.archive,/Could not load recordings/);assert.equal(all.nodes.loadMore.hidden,false);assert.match(all.nodes.loadMore.textContent,/Retry/);
});
test('finishing an older Archive request does not clear the new search busy state',async()=>{
 const start=app.indexOf('async function loadOnlineProviders('),end=app.indexOf('\nfunction handleOnlineProviderChange()',start);const gate=deferred();
 const S={artist:'Old',matchRequest:1,archiveItemView:false,page:0,loading:false,providerBusy:{},providerChecked:{}};
 const run=vm.runInNewContext(app.slice(start,end)+'\nloadOnlineProviders',{S,sourceMode:()=> 'both',providerEnabled:name=>name==='archive',loadMore:()=>gate.promise,refreshProviderStatus(){},Promise});
 const old=run('Old',1);S.artist='New';S.matchRequest=2;S.providerBusy={archive:true};gate.resolve();await old;
 assert.equal(S.providerBusy.archive,true);
});

test('Archive pages request and count the same number of recordings',async()=>{
 const f=archiveFixture(['first']);let requestUrl='';
 f.context.getJSON=async url=>{requestUrl=url;return {response:{docs:[{identifier:'first',creator:'Band'}],numFound:16}}};
 const operation=f.load();await wait();f.context.promises.first.resolve([{id:'one'}]);await operation;
 const params=new URL(requestUrl).searchParams;assert.equal(params.get('rows'),'15');assert.equal(params.get('page'),'1');
 assert.equal(f.nodes.loadMore.hidden,false);assert.equal(f.S.page,1);
});

test('Archive retry remains hidden while the source is disabled and reappears when enabled',async()=>{
 const f=archiveFixture(['only']);let enabled=true;f.context.providerEnabled=()=>enabled;const operation=f.load();await wait();enabled=false;f.context.promises.only.reject(Error('offline'));await operation;
 assert.equal(f.nodes.loadMore.hidden,true);enabled=true;f.context.syncArchiveLoadMore();assert.equal(f.nodes.loadMore.hidden,false);
});
