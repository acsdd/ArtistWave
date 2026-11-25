'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
test('now playing updates artwork, accessible controls and the selected track state',()=>{
  const a=app.indexOf('function updatePlayer(){'),b=app.indexOf('\nfunction makeLyricsActions',a);
  const make=()=>({dataset:{},attrs:{},hidden:false,textContent:'',classList:{values:new Map(),toggle(key,value){this.values.set(key,value)}},setAttribute(key,value){this.attrs[key]=value},removeAttribute(key){delete this[key]}});
  const ids=Object.fromEntries(['playlistSaveCurrent','nowTitle','nowArtist','playingSource','playButton','favoriteCurrent','shuffleButton','repeatButton','nowArtImage','nowArtPlaceholder'].map(id=>[id,make()]));
  const player=make(),row=make();let track={id:'1',title:'A song',artist:'An artist',source:'ARCHIVE',artwork:'https://example.org/a.jpg'};
  const S={activeSource:null,favorites:[],shuffle:true,repeat:2},audio={paused:false};
  const update=vm.runInNewContext(app.slice(a,b)+'\nupdatePlayer',{S,audio,current:()=>track,albumArtwork:value=>value||'',document:{querySelector:()=>player,querySelectorAll:()=>[row]},$:id=>ids[id]});
  update();assert.equal(ids.nowTitle.textContent,'A song');assert.equal(ids.playButton.attrs['aria-label'],'Pause');assert.equal(ids.shuffleButton.attrs['aria-pressed'],'true');assert.equal(ids.repeatButton.attrs['aria-label'],'Repeat one');assert.equal(player.classList.values.get('is-playing'),true);assert.equal(row.classList.values.get('is-playing'),true);assert.equal(ids.nowArtImage.src,'https://example.org/a.jpg');ids.nowArtImage.onload();assert.equal(ids.nowArtImage.hidden,false);
  audio.paused=true;track={...track,artwork:''};update();assert.equal(ids.playButton.attrs['aria-label'],'Play');assert.equal(player.classList.values.get('is-playing'),false);assert.equal(ids.nowArtImage.hidden,true);assert.equal(ids.nowArtPlaceholder.hidden,false);
});
