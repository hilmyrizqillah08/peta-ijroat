(function(){
"use strict";
var KEY="peta-ijroat-v1";
var FAC={lat:30.0616054,lng:31.3125855}; // OSM: Faculty Of Shariah And Law Cairo

/* Koordinat awal dari OpenStreetMap. Pos di dalam fakultas masih perkiraan:
   kunci ke lokasi asli lewat "Pakai lokasiku sekarang" atau geser pin. */
var PLACES={
  syuun:   {name:"Syuun Syariah", sub:"Loket tingkat 1, paling ujung", icon:"doc",     lat:30.06163, lng:31.31252},
  khozinah:{name:"Khozinah", sub:"Kas pembayaran kitab", icon:"coin",                  lat:30.06180, lng:31.31285},
  rusum:   {name:"Loket Rusum Dirosi", sub:"Belakang Fakultas Syariah", icon:"receipt",lat:30.06137, lng:31.31238},
  kutub:   {name:"Manfadz Kutub", sub:"Kantor kecil, ujung belakang fakultas", icon:"book", lat:30.06128, lng:31.31277},
  tibb:    {name:"Kulliyat Tibb", sub:"Fakultas Kedokteran (carousel: Hay Sadis)", icon:"drop", lat:30.0578770, lng:31.3122432}
};
var STEPS=[
 {phase:"Fase 1 · Medical checkup",place:"syuun",title:"Ambil istimaroh tahlil dam & kasyfu tibb",obj:"Ambil istimaroh di <b>Syuun Syariah</b>",
  hours:"09.00–14.00",hoursWarn:"Carousel bilang tutup Kamis–Jumat, padahal libur resmi Mesir Jumat–Sabtu. Pastikan lagi.",
  req:["Paspor asli","Fotokopi paspor 2 lembar","Ifadah najah asli","Pas foto 4x6, 2 lembar"],
  tips:["Pastikan namamu sudah muqoyyad sebelum datang.","Formulir diambil di loket tingkat 1 yang paling ujung."],got:"Formulir istimaroh tahlil dam & kasyfu tibb"},
 {phase:"Fase 1 · Medical checkup",place:"tibb",title:"Tahlil dam (cek darah)",obj:"Cek darah di <b>Kulliyat Tibb</b>",
  hours:"Pagi hari · tutup Jumat–Sabtu",req:["Istimaroh dari langkah 1","Bukti bayar Fawry"],
  tips:["Alurnya: bayar lewat Fawry, serahkan berkas, lalu ambil darah.","Datang pagi, antrean cepat penuh."],got:"Hasil tahlil dam (tunggu sampai keluar)"},
 {phase:"Fase 1 · Medical checkup",place:"tibb",title:"Isi istimaroh kasyfu tibb",obj:"Kembali ke <b>Kulliyat Tibb</b> untuk kasyfu tibb",
  hours:"Pagi hari · tutup Jumat–Sabtu",req:["Hasil tahlil dam","Istimaroh kasyfu tibb"],
  tips:["Datang setelah hasil tahlil dam keluar.","Formulir diisi petugas, kamu tinggal serahkan."],got:"Istimaroh kasyfu tibb yang sudah diisi"},
 {phase:"Fase 2 · Administrasi & pembayaran",place:"syuun",title:"Serahkan berkas ke Syuun",obj:"Serahkan berkas medis ke <b>Syuun Syariah</b>",
  hours:"09.00–14.00",req:["Hasil tahlil dam","Istimaroh kasyfu tibb yang sudah diisi"],
  tips:["Serahkan setelah tahlil dam dan kasyfu tibb selesai semua."],got:"Ishol rusum iqomah + ishol rusum kitab"},
 {phase:"Fase 2 · Administrasi & pembayaran",place:"khozinah",title:"Bayar biaya kitab",obj:"Bayar biaya kitab di <b>Khozinah</b>",
  hours:"Belum ada di carousel",req:["Ishol rusum kitab","Uang untuk biaya kitab"],tips:["Simpan fatūrah-nya, dipakai untuk ambil kitab."],got:"Fatūrah pembayaran kitab"},
 {phase:"Fase 2 · Administrasi & pembayaran",place:"rusum",title:"Bayar rusum dirosi",obj:"Bayar rusum dirosi di <b>belakang fakultas</b>",
  hours:"Belum ada di carousel",req:["Uang biaya pendaftaran"],tips:["Lokasinya di belakang Fakultas Syariah.","Simpan fatūrah-nya baik-baik."],got:"Fatūrah rusum dirosi"},
 {phase:"Fase 3 · Penutup",place:"kutub",title:"Ambil kitab",obj:"Ambil kitab di <b>Manfadz Kutub</b>",
  hours:"Belum ada di carousel",req:["Salah satu fatūrah yang kamu punya"],tips:["Kantor kecil di ujung belakang fakultas."],got:"Beberapa kitab + kartu daftar buku"},
 {phase:"Fase 3 · Penutup",place:"syuun",title:"Taqdim berkas terakhir",obj:"Taqdim berkas terakhir di <b>Syuun Syariah</b>",
  hours:"09.00–14.00",req:["Hasil tahlil dam","Ishol rusum","Fotokopi ishol tansiq","Paspor + iqomah atau visa"],
  tips:["Setelah ini kamu resmi jadi mahasiswa Al-Azhar."],got:"Status resmi mahasiswa Al-Azhar Kairo"}
];
var ICONS={
 doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
 drop:'<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',
 coin:'<circle cx="12" cy="12" r="8.5"/><path d="M9 10h6M9 14h6"/>',
 receipt:'<path d="M7 3h10v18l-2.5-1.6L12 21l-2.5-1.6L7 21z"/><path d="M10 8h4M10 12h4"/>',
 book:'<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>'
};

/* ---------- state ---------- */
function fresh(){return{done:{},reqs:{},notes:{},pos:{}};}
var state=fresh();
try{var raw=localStorage.getItem(KEY);if(raw)state=Object.assign(fresh(),JSON.parse(raw));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){toast("Penyimpanan HP penuh atau diblokir.");}}
function P(id){var p=state.pos[id];return p?{lat:p.lat,lng:p.lng,ok:true}:{lat:PLACES[id].lat,lng:PLACES[id].lng,ok:false};}
function currentIndex(){for(var i=0;i<STEPS.length;i++){if(!state.done[i+1])return i;}return STEPS.length;}
var selected=Math.min(currentIndex(),STEPS.length-1), editing=null, me=null, tracking=false, watchId=null;
var $=function(id){return document.getElementById(id);};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
var toastT;function toast(t){var el=$("toast");el.textContent=t;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){el.hidden=true;},3500);}

/* ---------- photos: IndexedDB ---------- */
var dbp=new Promise(function(res){
  try{var r=indexedDB.open("peta-ijroat",1);
    r.onupgradeneeded=function(){r.result.createObjectStore("photos");};
    r.onsuccess=function(){res(r.result);};r.onerror=function(){res(null);};
  }catch(e){res(null);}
});
function idb(mode,fn){return dbp.then(function(db){if(!db)return null;return new Promise(function(res,rej){
  var tx=db.transaction("photos",mode),st=tx.objectStore("photos"),q=fn(st);
  tx.oncomplete=function(){res(q&&q.result);};tx.onerror=function(){rej(tx.error);};});});}
var photoUrls={};
function loadPhoto(id){return idb("readonly",function(s){return s.get(id);}).then(function(b){
  if(photoUrls[id]){URL.revokeObjectURL(photoUrls[id]);delete photoUrls[id];}
  if(b)photoUrls[id]=URL.createObjectURL(b);return photoUrls[id]||null;}).catch(function(){return null;});}
function shrink(file){return new Promise(function(res){var img=new Image(),u=URL.createObjectURL(file);
  img.onload=function(){var k=Math.min(1,1400/Math.max(img.width,img.height)),c=document.createElement("canvas");
    c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    URL.revokeObjectURL(u);c.toBlob(function(b){res(b||file);},"image/jpeg",.82);};
  img.onerror=function(){URL.revokeObjectURL(u);res(file);};img.src=u;});}

/* ---------- map ---------- */
var map=L.map("map",{zoomControl:true,attributionControl:true}).setView([FAC.lat,FAC.lng],17);
/* Tile standar OpenStreetMap (tanpa API key), digelapkan lewat CSS filter di style.css */
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
  maxZoom:19,
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
}).addTo(map);
map.zoomControl.setPosition("topright");
function zoomCls(){map.getContainer().classList.toggle("z-low",map.getZoom()<18);}
map.on("zoomend",zoomCls);zoomCls();

var markers={}, routeLayer=L.layerGroup().addTo(map), meMarker=null, meCircle=null;
function stepsAt(id){var r=[];STEPS.forEach(function(s,i){if(s.place===id)r.push(i);});return r;}
function blipHtml(id){
  var c=currentIndex(),target=c<STEPS.length?STEPS[c].place:null,idx=stepsAt(id);
  var cleared=idx.every(function(i){return state.done[i+1];}),p=P(id);
  var cls="blip"+(id===target?" target":"")+(cleared?" cleared":"")+(id===STEPS[selected].place?" sel":"");
  var badge=cleared?'<span class="badge ok">✓</span>':(p.ok?'':'<span class="badge q" title="Lokasi perkiraan">?</span>');
  return '<div class="'+cls+'"><div class="ring"><svg viewBox="0 0 24 24">'+ICONS[PLACES[id].icon]+'</svg></div>'+badge+'<div class="lbl">'+esc(PLACES[id].name)+'</div></div>';
}
function drawMarkers(){
  Object.keys(PLACES).forEach(function(id){
    var p=P(id),icon=L.divIcon({className:"",html:blipHtml(id),iconSize:[44,44],iconAnchor:[22,22]});
    if(!markers[id]){
      markers[id]=L.marker([p.lat,p.lng],{icon:icon,keyboard:true,title:PLACES[id].name,draggable:false}).addTo(map);
      markers[id].on("click",function(){selectPlace(id);});
      markers[id].on("dragend",function(e){var ll=e.target.getLatLng();setPos(id,ll.lat,ll.lng,"Pos dipindah.");});
    }else{markers[id].setLatLng([p.lat,p.lng]);markers[id].setIcon(icon);}
    if(markers[id].dragging){ if(editing===id)markers[id].dragging.enable(); else markers[id].dragging.disable(); }
  });
}
function setPos(id,lat,lng,msg){state.pos[id]={lat:+lat.toFixed(7),lng:+lng.toFixed(7)};save();drawMarkers();drawPos();updateRoute();if(msg)toast(msg);}

/* route to current target */
var routeSeq=0;
function fmtDist(m){return m<1000?Math.round(m/10)*10+" m":(m/1000).toFixed(1)+" km";}
function updateRoute(){
  routeLayer.clearLayers();var c=currentIndex();$("dist").textContent="";
  if(c>=STEPS.length)return;
  var to=P(STEPS[c].place),from=null,fromLabel="";
  if(me&&me.acc<300){from=me;fromLabel="dari posisimu";}
  else if(c>0){var pp=P(STEPS[c-1].place);if(STEPS[c-1].place!==STEPS[c].place){from=pp;fromLabel="dari "+PLACES[STEPS[c-1].place].name;}}
  if(!from)return;
  var straight=map.distance([from.lat,from.lng],[to.lat,to.lng]);
  if(straight<15){$("dist").textContent="Kamu sudah di lokasi";return;}
  var guess=L.polyline([[from.lat,from.lng],[to.lat,to.lng]],{className:"route-guess",interactive:false}).addTo(routeLayer);
  $("dist").textContent="± "+fmtDist(straight)+" "+fromLabel;
  var seq=++routeSeq;
  var url="https://routing.openstreetmap.de/routed-foot/route/v1/foot/"+from.lng+","+from.lat+";"+to.lng+","+to.lat+"?overview=full&geometries=geojson";
  fetch(url).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
    if(seq!==routeSeq||!j.routes||!j.routes[0])return;
    var rt=j.routes[0],ll=rt.geometry.coordinates.map(function(c){return[c[1],c[0]];});
    routeLayer.clearLayers();
    L.polyline(ll,{className:"route-glow",interactive:false}).addTo(routeLayer);
    L.polyline(ll,{className:"route-now",interactive:false}).addTo(routeLayer);
    var mins=Math.max(1,Math.round(rt.duration/60));
    $("dist").textContent=fmtDist(rt.distance)+" · "+mins+" menit jalan "+fromLabel;
  }).catch(function(){ if(seq===routeSeq) $("dist").textContent="± "+fmtDist(straight)+" garis lurus "+fromLabel; });
}

/* GPS */
function meIcon(h){return L.divIcon({className:"",iconSize:[34,34],iconAnchor:[17,17],
  html:'<div class="me"><svg viewBox="0 0 24 24" style="transform:rotate('+(h||0)+'deg)"><path d="M12 2 L20 21 L12 16.5 L4 21 Z" fill="#FF3EA5" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg></div>'});}
var lastRouteAt=0,firstFix=true;
function onPos(pos){
  var c=pos.coords;me={lat:c.latitude,lng:c.longitude,acc:c.accuracy};
  if(!meMarker){meMarker=L.marker([me.lat,me.lng],{icon:meIcon(c.heading),interactive:false,zIndexOffset:1000}).addTo(map);
    meCircle=L.circle([me.lat,me.lng],{radius:c.accuracy,color:"#FF3EA5",weight:1,fillOpacity:.08,interactive:false}).addTo(map);}
  else{meMarker.setLatLng([me.lat,me.lng]);meMarker.setIcon(meIcon(c.heading));meCircle.setLatLng([me.lat,me.lng]).setRadius(c.accuracy);}
  if(firstFix){firstFix=false;map.setView([me.lat,me.lng],Math.max(map.getZoom(),17));}
  if(Date.now()-lastRouteAt>15000){lastRouteAt=Date.now();updateRoute();}
  updateLive();
}
function updateLive(){
  var pid=STEPS[selected].place,p=P(pid),b=$("hereBtn"),d=$("meDist");if(!b||!d)return;
  if(me){b.disabled=false;b.removeAttribute("title");b.textContent="Pakai lokasiku sekarang (±"+Math.round(me.acc)+" m)";
    d.hidden=false;d.textContent="Jarakmu ke pos ini: "+fmtDist(map.distance([me.lat,me.lng],[p.lat,p.lng]));}
}
function onErr(e){
  toast(e.code===1?"Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini di pengaturan browser.":"Lokasi belum didapat. Coba di luar ruangan atau nyalakan GPS.");
  if(e.code===1)stopGps();
}
function startGps(){
  if(!("geolocation" in navigator)){toast("Browser ini tidak mendukung GPS.");return;}
  tracking=true;firstFix=true;$("gpsBtn").classList.add("on");$("gpsBtn").textContent="Berhenti lacak";
  watchId=navigator.geolocation.watchPosition(onPos,onErr,{enableHighAccuracy:true,maximumAge:5000,timeout:20000});
}
function stopGps(){
  tracking=false;if(watchId!=null)navigator.geolocation.clearWatch(watchId);watchId=null;
  $("gpsBtn").classList.remove("on");$("gpsBtn").textContent="Lacak lokasiku";
  if(meMarker){map.removeLayer(meMarker);map.removeLayer(meCircle);meMarker=meCircle=null;}me=null;updateRoute();drawPos();
}
$("gpsBtn").onclick=function(){tracking?stopGps():startGps();};
$("fitBtn").onclick=function(){var b=L.latLngBounds(Object.keys(PLACES).map(function(id){var p=P(id);return[p.lat,p.lng];}));if(me)b.extend([me.lat,me.lng]);map.fitBounds(b,{padding:[60,60]});};

/* ---------- panel ---------- */
function drawHud(){
  var c=currentIndex(),n=Object.keys(state.done).filter(function(k){return state.done[k];}).length;
  $("bar").style.width=(n/STEPS.length*100)+"%";$("prog").textContent=n+"/"+STEPS.length+" langkah";
  $("obj").innerHTML=c<STEPS.length?STEPS[c].obj:"Misi selesai. <b>Resmi mahasiswa Al-Azhar</b>";
}
function drawChips(){
  var c=currentIndex();$("chips").innerHTML=STEPS.map(function(s,i){
    return '<button type="button" class="chip'+(state.done[i+1]?" done":"")+(i===c?" now":"")+'" data-step="'+i+'"'+(i===selected?' aria-current="step"':'')+' aria-label="Langkah '+(i+1)+(state.done[i+1]?", selesai":"")+'">'+(i+1)+'</button>';
  }).join("");
}
function gmaps(p){return "https://www.google.com/maps/dir/?api=1&destination="+p.lat+","+p.lng+"&travelmode=walking";}
function drawCard(){
  var s=STEPS[selected],pl=PLACES[s.place],i=selected,done=!!state.done[i+1],p=P(s.place);
  $("card").innerHTML='<div class="phase">'+esc(s.phase)+' · Langkah '+(i+1)+' dari '+STEPS.length+'</div>'+
    '<h2>'+esc(s.title)+'</h2><div class="where">'+esc(pl.name)+' <small>· '+esc(pl.sub)+'</small></div>'+
    '<div class="actions"><button class="btn" type="button" id="goBtn">Tunjukkan di peta</button>'+
    '<a class="btn primary" href="'+gmaps(p)+'" target="_blank" rel="noopener">Navigasi di Google Maps ↗</a></div>'+
    '<dl class="meta"><div><dt>Jam buka</dt><dd>'+esc(s.hours)+(s.hoursWarn?'<span class="warn">'+esc(s.hoursWarn)+'</span>':'')+'</dd></div></dl>'+
    '<h3>Bawa</h3><ul class="req">'+s.req.map(function(r,k){var key=(i+1)+"-"+k;
      return '<li><label><input type="checkbox" id="req-'+key+'" data-req="'+key+'"'+(state.reqs[key]?" checked":"")+'><span>'+esc(r)+'</span></label></li>';}).join("")+'</ul>'+
    '<h3>Alur & tips</h3><ol class="tips">'+s.tips.map(function(t){return"<li>"+esc(t)+"</li>";}).join("")+'</ol>'+
    '<div class="got">Dapat: '+esc(s.got)+'</div>'+
    '<button type="button" class="donebtn'+(done?" undo":"")+'" id="doneBtn">'+(done?"Batalkan tanda selesai":"Misi selesai ✓")+'</button>';
}
var confirmDel=false;
function drawPos(){
  var pid=STEPS[selected].place,pl=PLACES[pid],p=P(pid);
  var meDist=me?map.distance([me.lat,me.lng],[p.lat,p.lng]):null;
  $("pos").innerHTML='<div class="phase" style="color:var(--teal)">Pos lokasi</div><h2>'+esc(pl.name)+'</h2>'+
    (p.ok?'<p class="verify ok">Lokasi sudah kamu pastikan.</p>':'<p class="verify q">Lokasi masih perkiraan dari OpenStreetMap. Pastikan saat kamu di sana.</p>')+
    '<div class="row">'+
      '<button class="btn" type="button" id="hereBtn"'+(me?'':' disabled title="Nyalakan Lacak lokasiku dulu"')+'>Pakai lokasiku sekarang'+(me?' (±'+Math.round(me.acc)+' m)':'')+'</button>'+
      '<button class="btn'+(editing===pid?" on":"")+'" type="button" id="dragBtn">'+(editing===pid?"Selesai geser":"Geser pin")+'</button>'+
      (p.ok?'<button class="btn danger" type="button" id="resetBtn">Kembalikan ke perkiraan</button>':'')+
    '</div>'+
    '<p class="verify" id="meDist" style="color:var(--muted);margin-top:8px"'+(meDist==null?' hidden':'')+'>'+(meDist==null?'':'Jarakmu ke pos ini: '+fmtDist(meDist))+'</p>'+
    '<form id="searchForm" class="row" role="search"><label class="sr" for="q">Cari tempat</label><input type="search" id="q" placeholder="Cari tempat di OpenStreetMap, misal: Al-Azhar"><button class="btn" type="submit">Cari</button></form>'+
    '<ul class="results" id="results"></ul>'+
    '<h3>Foto tempat</h3><div class="photo" id="photo"><p>Belum ada foto. Foto tempatnya waktu kamu ke sana, biar nanti nggak nyasar.</p></div>'+
    '<div class="row"><label class="btn" for="photoInput" style="cursor:pointer">Ambil / pilih foto</label><input class="sr" type="file" id="photoInput" accept="image/*">'+
    '<button class="btn danger" type="button" id="delPhoto" hidden>'+(confirmDel?"Yakin hapus foto?":"Hapus foto")+'</button></div>'+
    '<h3><label for="note">Catatan pos</label></h3><textarea id="note" placeholder="Misal: loket ke-3 dari kiri, mulai antre jam 7, bawa pulpen sendiri"></textarea>';
  $("note").value=state.notes[pid]||"";
  loadPhoto(pid).then(function(u){if(STEPS[selected].place!==pid||!u)return;
    $("photo").innerHTML='<img alt="Foto '+esc(pl.name)+'" src="'+u+'">';$("delPhoto").hidden=false;});
}
function render(){drawMarkers();drawHud();drawChips();drawCard();drawPos();}
function selectPlace(id){var idx=stepsAt(id),pick=idx.find(function(i){return!state.done[i+1];});selected=pick!=null?pick:idx[0];confirmDel=false;render();openSheet(true);}
function openSheet(on){var p=$("panel");p.classList.toggle("open",on);$("grab").setAttribute("aria-expanded",on?"true":"false");}

/* ---------- events ---------- */
$("grab").onclick=function(){openSheet(!$("panel").classList.contains("open"));};
$("chips").onclick=function(e){var b=e.target.closest("[data-step]");if(!b)return;selected=+b.dataset.step;confirmDel=false;render();
  var p=P(STEPS[selected].place);map.panTo([p.lat,p.lng]);};
$("card").addEventListener("change",function(e){var k=e.target.dataset.req;if(!k)return;state.reqs[k]=e.target.checked;save();});
$("card").addEventListener("click",function(e){
  if(e.target.id==="goBtn"){var p=P(STEPS[selected].place);map.setView([p.lat,p.lng],18);openSheet(false);}
  if(e.target.id==="doneBtn"){var k=selected+1;state.done[k]=!state.done[k];
    if(state.done[k]){var c=currentIndex();if(c<STEPS.length)selected=c;toast("Misi selesai. Lanjut ke langkah berikutnya.");}
    save();render();updateRoute();}
});
var noteT;
$("pos").addEventListener("input",function(e){if(e.target.id!=="note")return;var pid=STEPS[selected].place;clearTimeout(noteT);noteT=setTimeout(function(){state.notes[pid]=e.target.value;save();},500);});
$("pos").addEventListener("change",function(e){
  if(e.target.id!=="photoInput"||!e.target.files||!e.target.files[0])return;var pid=STEPS[selected].place;
  shrink(e.target.files[0]).then(function(b){return idb("readwrite",function(s){return s.put(b,pid);});})
    .then(function(){toast("Foto tersimpan di HP ini.");drawPos();}).catch(function(){toast("Foto gagal disimpan. Memori browser mungkin penuh.");});
});
$("pos").addEventListener("click",function(e){
  var pid=STEPS[selected].place,id=e.target.id;
  if(id==="hereBtn"&&me){setPos(pid,me.lat,me.lng,"Pos dikunci ke lokasimu sekarang.");}
  if(id==="dragBtn"){editing=editing===pid?null:pid;drawMarkers();drawPos();if(editing){var p=P(pid);map.setView([p.lat,p.lng],18);toast("Geser pin "+PLACES[pid].name+" ke posisi aslinya.");openSheet(false);}}
  if(id==="resetBtn"){delete state.pos[pid];save();drawMarkers();drawPos();updateRoute();toast("Pos dikembalikan ke perkiraan.");}
  if(id==="delPhoto"){if(!confirmDel){confirmDel=true;e.target.textContent="Yakin hapus foto?";return;}
    confirmDel=false;idb("readwrite",function(s){return s.delete(pid);}).then(function(){toast("Foto dihapus.");drawPos();});}
  var r=e.target.closest("[data-lat]");if(r){setPos(pid,+r.dataset.lat,+r.dataset.lng,"Pos dipindah ke hasil pencarian.");map.setView([+r.dataset.lat,+r.dataset.lng],18);}
});
var lastSearch=0;
$("pos").addEventListener("submit",function(e){
  if(e.target.id!=="searchForm")return;e.preventDefault();
  var q=$("q").value.trim();if(!q)return;
  if(Date.now()-lastSearch<1500){toast("Tunggu sebentar sebelum cari lagi.");return;}lastSearch=Date.now();
  var url="https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=eg&viewbox=31.20,30.12,31.40,29.98&bounded=1&accept-language=ar,en&q="+encodeURIComponent(q);
  $("results").innerHTML='<li style="color:var(--muted);font-size:13px">Mencari…</li>';
  fetch(url).then(function(r){return r.json();}).then(function(j){
    $("results").innerHTML=j.length?j.map(function(x){return '<li><button type="button" data-lat="'+(+x.lat)+'" data-lng="'+(+x.lon)+'">'+esc(x.display_name)+'</button></li>';}).join("")
      :'<li style="color:var(--muted);font-size:13px">Tidak ketemu. Coba nama Arab atau Inggris lain.</li>';
  }).catch(function(){$("results").innerHTML='<li style="color:var(--muted);font-size:13px">Pencarian gagal. Cek koneksi internet.</li>';});
});
$("exportBtn").onclick=function(){
  var blob=new Blob([JSON.stringify({app:"peta-ijroat",v:1,state:state},null,2)],{type:"application/json"});
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cadangan-peta-ijroat.json";a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);},2000);toast("Cadangan diunduh (tanpa foto).");
};
$("importInput").onchange=function(e){var f=e.target.files&&e.target.files[0];if(!f)return;
  f.text().then(function(t){var j=JSON.parse(t);if(j.app!=="peta-ijroat"||!j.state)throw 0;state=Object.assign(fresh(),j.state);save();render();updateRoute();toast("Cadangan dipulihkan.");})
   .catch(function(){toast("File cadangan tidak dikenali.");});};

render();updateRoute();
})();
