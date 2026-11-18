const test=require('node:test'),assert=require('node:assert/strict');
const {identity,resolve,unique}=require('../library-data.js');
test('distinct recordings survive dedupe and repeated media references do not',()=>{
 const a={artist:'Band',title:'Song',source:'ARCHIVE',url:'https://example.org/studio.mp3'},b={...a,url:'https://example.org/live.mp3'};
 assert.notEqual(identity(a),identity(b));assert.equal(unique([a,b,a]).length,2);
});
test('local legacy references reject ambiguous recordings and opaque keys select exact files',()=>{
 const a={artist:'Band',title:'Song',collection:'Album',source:'LOCAL',url:'blob:a',localKey:'a'},b={...a,url:'blob:b',localKey:'b'};
 assert.equal(resolve({...a,localKey:undefined},[a,b]),null);assert.equal(resolve(a,[a,b]),a);assert.equal(resolve(a,[a,a]),a);
});
test('NAS references require the matching native connection and trusted media origin',()=>{
 const t={source:'PLEX',url:'https://acsdd.github.io/ArtistWave/__plex/server/stream?id=1'};
 assert.equal(resolve(t),null);assert.equal(resolve(t,[],{PLEX:{connected:true,id:'other'}}),null);
 const state={PLEX:{connected:true,id:'server'}};assert.equal(resolve(t,[],state),t);
 assert.equal(resolve({...t,url:t.url.replace('acsdd.github.io','evil.example')},[],state),null);
 assert.equal(resolve(t,[],{PLEX:{...state.PLEX,error:'Offline'}}),null);
});
