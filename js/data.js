/* Single data source. Swap localStorage calls for fetch() to move to a real API. */
const VS=(()=>{
const K='vs_apps_v2';
const cats=[['productivity','Productivity','Notes, tasks and focus tools'],['photography','Photography','Cameras and editors'],['education','Education','Languages and study'],['entertainment','Entertainment','Video, reading and fun'],['tools','Tools','Utilities for your phone'],['music','Music & Audio','Players and recorders'],['personalization','Personalization','Launchers and wallpapers'],['games','Games','Casual to competitive']].map(([id,name,desc])=>({id,name,desc}));
const A=[['Notely','productivity'],['SnapLab','photography'],['Lingua','education'],['TuneBox','music'],['PixelPaint','photography'],['FocusFlow','productivity'],['ClipBoard Plus','tools'],['Wallcraft','personalization'],['CloudSync','tools'],['QuickScan','tools'],['Tempo','music'],['MindMap','education']];
const G=['Orbit Runner','Hex Tactics','Mosaic Quest','Drift Valley','Pocket Chess Club','Rune Lantern','Skyline Tycoon','Echo Maze','Tiny Kingdoms','Paddle Pop','Word Harbor','Ember Racers'].map(n=>[n,'games']);
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const seed=()=>[...A.map(x=>[...x,'app']),...G.map(x=>[...x,'game'])].map(([name,cat,type],i)=>({id:slug(name),name,cat,type,dev:'Demo Studio '+(i%5+1),ver:`${1+i%4}.${i%10}.0`,size:(8+i*3)+' MB',android:'8.0+',pkg:'com.demo.'+slug(name).replace(/-/g,''),short:type==='game'?'A calm, polished game you can play in short sessions.':'A fast, tidy app that does one job well.',desc:name+' is a placeholder entry for the VOIDSTORE demo. It shows how a full description, feature notes and requirements read on the details page. Replace this text in the admin dashboard.',metaTitle:name+' for Android: v'+(1+i%4)+'.'+(i%10)+'.0 | VOIDSTORE',metaDesc:'Get '+name+' for Android from the official source. Check the version, file size and Android requirements before you download.',keywords:name.toLowerCase()+', android '+type+', '+cat,rating:(3.5+(i*7%15)/10).toFixed(1),views:500+i*7919%9000,status:i===5?'draft':'published',featured:i%4===0,updated:'2026-10-'+String(1+i*2%28).padStart(2,'0'),url:'https://example.com/'+slug(name),changelog:'Bug fixes and performance improvements.'}));
const put=d=>{try{localStorage.setItem(K,JSON.stringify(d));return true}catch(e){return false}};
const all=()=>{try{const d=JSON.parse(localStorage.getItem(K));if(d)return d}catch(e){}const s=seed();put(s);return s};
return{cats,slug,all,
pub:()=>all().filter(a=>a.status==='published'),
get:id=>all().find(a=>a.id===id),
catName:id=>(cats.find(c=>c.id===id)||{}).name||id,
save(a){const d=all();if(!a.id){const b=slug(a.name);let id=b,n=2;while(d.some(x=>x.id===id))id=b+'-'+n++;a.id=id;a.views=0;d.unshift(a)}else d[d.findIndex(x=>x.id===a.id)]=a;return put(d)?a:null},
remove(id){put(all().filter(a=>a.id!==id))},
reset(){try{localStorage.removeItem(K)}catch(e){}}}})();
