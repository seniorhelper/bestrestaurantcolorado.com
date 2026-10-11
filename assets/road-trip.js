(function(){
"use strict";
/* Five drives from Denver (order as published in /colorado-road-trip-dining/). wp = waypoint with no recognized restaurant. */
var ROUTES={
 i70:{name:"I-70 west to Grand Junction",stops:[{t:"Breckenridge",detour:"south from I-70 at Frisco"},{t:"Vail"},{t:"Avon"},{t:"Beaver Creek",detour:"up the hill from Avon"},{wp:"Glenwood Springs",note:"No recognized restaurant yet; turn south here for Aspen."},{wp:"Palisade",note:"Orchards, farm stands and wineries, best July to September."},{t:"Grand Junction"}],time:"About four hours from Denver to Grand Junction without stops in good conditions."},
 aspen:{name:"Denver to Aspen",stops:[{wp:"Independence Pass or Glenwood Springs",note:"Summer: Highway 82 over Independence Pass (closed in winter). Winter: I-70 to Glenwood Springs, then Highway 82 up the valley."},{t:"Aspen"}],time:""},
 i25:{name:"I-25 south to Colorado Springs",stops:[{t:"Parker",detour:"east of I-25"},{t:"Colorado Springs"},{wp:"Pueblo",note:"No recognized restaurant; the heart of chile country from August to October."}],time:"About an hour from Denver to Colorado Springs in light traffic, with Pueblo roughly an hour further."},
 north:{name:"Foothills north to Lyons",stops:[{t:"Edgewater"},{t:"Boulder"},{t:"Lyons"},{wp:"Estes Park",note:"Gateway to Rocky Mountain National Park; no recognized restaurant so far."}],time:""},
 telluride:{name:"Southwest to Telluride",stops:[{wp:"Several mountain passes",note:"A full day's drive, best split with an overnight. Many visitors fly into Montrose or Telluride instead."},{t:"Telluride"}],time:""}
};
var RANK={"2star":5,"1star":4,"bib":3,"rec":2,"beard":2};
var VAL={"bib":5,"beard":4,"rec":2,"1star":1,"2star":0};
var LBL={"2star":"Two MICHELIN Stars","1star":"One MICHELIN Star","bib":"Bib Gourmand","rec":"MICHELIN Recommended","beard":"James Beard"};
var st={r:"i70",n:"2",s:"any",d:"1"},D=null;
var $=function(s){return document.querySelector(s)};
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]})}
function readURL(){var p=new URLSearchParams(location.search);if(ROUTES[p.get("route")])st.r=p.get("route");if(/^[123]$/.test(p.get("nights")||""))st.n=p.get("nights");if(p.get("style")==="value")st.s="value";if(p.get("detours")==="0")st.d="0"}
function writeURL(){var p=new URLSearchParams();p.set("route",st.r);p.set("nights",st.n);if(st.s!=="any")p.set("style",st.s);if(st.d!=="1")p.set("detours","0");history.replaceState(null,"",location.pathname+"?"+p.toString()+location.hash)}
function sync(){document.querySelectorAll(".rt .chip").forEach(function(b){var g=b.dataset.g,on=g==="d"?st.d==="1":st[g]===b.dataset.v;b.setAttribute("aria-pressed",on?"true":"false")})}
function rest(town){return D.restaurants.filter(function(r){return r.town===town})}
var NOTDINNER=["Poulette Bakeshop","Van Atta","Lady Jane","Yacht Club","Traveling Mercies","Odell's Bagel"];
function dinners(town){var l=rest(town).filter(function(r){return NOTDINNER.indexOf(r.name)<0});return l.length?l:rest(town)}
function best(list){var w=st.s==="value"?VAL:RANK;return list.filter(function(r){return NOTDINNER.indexOf(r.name)<0}).concat(list.filter(function(r){return NOTDINNER.indexOf(r.name)>-1})).slice().sort(function(a,b){return(w[b.tier]-w[a.tier])||a.name.localeCompare(b.name)})[0]}
function render(){
 var R=ROUTES[st.r],stops=R.stops.filter(function(s){return st.d==="1"||!s.detour});
 var towns=stops.filter(function(s){return s.t});
 var n=Math.min(+st.n,towns.length),last=towns.length-1,w=st.s==="value"?VAL:RANK;
 /* last night at the far end; other nights in the towns with the strongest dinner options, kept in drive order */
 var cand=towns.map(function(s,i){var l=dinners(s.t);return{i:i,sc:(l.length?Math.max.apply(null,l.map(function(r){return w[r.tier]})):0)*10+l.length}}).filter(function(c){return c.i!==last});
 cand.sort(function(a,b){return b.sc-a.sc||a.i-b.i});
 var nights=cand.slice(0,Math.max(0,n-1)).map(function(c){return c.i}).concat(n>0?[last]:[]).sort(function(a,b){return a-b});
 var total=0;towns.forEach(function(s){total+=rest(s.t).length});
 $("#rtSummary").textContent=R.name+": "+towns.length+" town"+(towns.length===1?"":"s")+" with "+total+" recognized restaurant"+(total===1?"":"s")+(n<+st.n?". Only "+n+" overnight town"+(n===1?"":"s")+" on this route.":".");
 $("#rtPlan").innerHTML=nights.map(function(ti,k){var s=towns[ti],r=best(dinners(s.t)),el=D.towns[s.t].elev_ft;
   return '<li class="rt-day"><span class="rt-dn">Night '+(k+1)+'</span><h3>'+esc(s.t)+' <i>'+el.toLocaleString("en-US")+' ft</i></h3><p><b>Anchor dinner:</b> '+esc(r.name)+'<br><span class="rt-tier">'+LBL[r.tier]+'</span></p>'+(r.link?'<p class="rt-link"><a href="'+esc(r.link)+'" rel="nofollow noopener">'+esc(r.link_label)+'</a></p>':'')+(el>8000&&!nights.slice(0,k).some(function(j){return D.towns[towns[j].t].elev_ft>8000})?'<p class="rt-alt">First night above 8,000 ft: keep this dinner light if you have just arrived from low elevation.</p>':'')+'</li>'}).join("");
 var maxE=9600,minE=4583;
 $("#rtProfile").innerHTML='<div class="rt-bar"><span style="height:'+Math.round((5280-minE)/(maxE-minE)*100+8)+'%"></span><i>Denver</i></div>'+towns.map(function(s){var e=D.towns[s.t].elev_ft;return '<div class="rt-bar"><span style="height:'+Math.round((e-minE)/(maxE-minE)*100+8)+'%"></span><i>'+esc(s.t)+'</i></div>'}).join("");
 $("#rtStops").innerHTML=stops.map(function(s){
   if(s.wp)return '<li class="rt-wp"><strong>'+esc(s.wp)+'</strong><p>'+esc(s.note)+'</p></li>';
   var list=rest(s.t),el=D.towns[s.t].elev_ft;
   return '<li><strong>'+esc(s.t)+'</strong> <span class="rt-el">'+el.toLocaleString("en-US")+' ft</span>'+(s.detour?' <span class="rt-det">Detour: '+esc(s.detour)+'</span>':'')+'<ul>'+list.map(function(r){return '<li>'+(r.link?'<a href="'+esc(r.link)+'" rel="nofollow noopener">'+esc(r.name)+'</a>':esc(r.name))+' <span class="rt-tier">'+LBL[r.tier]+'</span></li>'}).join("")+'</ul></li>'}).join("");
 $("#rtNote").textContent=(R.time?R.time+" ":"")+"Check COtrip.org for roads and each restaurant for hours before you set off. Last verified "+D.updated+".";
 writeURL();if(window.__rtMap)window.__rtMap.highlight(towns.map(function(s){return s.t}))}
document.addEventListener("click",function(e){var b=e.target.closest(".rt .chip");if(!b)return;var g=b.dataset.g;if(g==="d")st.d=st.d==="1"?"0":"1";else st[g]=b.dataset.v;sync();render()});
/* ---- map: Leaflet + OpenStreetMap tiles, loaded only on request ---- */
function loadMap(){
 var btn=$("#mapBtn"),box=$("#map");btn.disabled=true;btn.textContent="Loading map…";box.hidden=false;
 box.innerHTML='<p class="rt-mapmsg">Loading OpenStreetMap…</p>';
 var css=document.createElement("link");css.rel="stylesheet";css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";css.integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";css.crossOrigin="";document.head.appendChild(css);
 var js=document.createElement("script");js.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";js.integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";js.crossOrigin="";
 js.onload=function(){box.innerHTML="";var L=window.L,map=L.map(box,{scrollWheelZoom:false}).setView([39.0,-105.6],7);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:12,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  var marks={};Object.keys(D.towns).forEach(function(t){var v=D.towns[t],list=rest(t);
   var m=L.circleMarker([v.lat,v.lng],{radius:Math.min(6+list.length*0.6,22),color:"#16191D",weight:1.5,fillColor:"#9A8FE0",fillOpacity:.8,keyboard:true}).addTo(map);
   m.bindPopup('<strong>'+esc(t)+'</strong> ('+v.elev_ft.toLocaleString("en-US")+' ft, town location)<br>'+list.slice(0,12).map(function(r){return esc(r.name)+' · '+LBL[r.tier]}).join("<br>")+(list.length>12?'<br>and '+(list.length-12)+' more in the register':''));marks[t]=m});
  window.__rtMap={highlight:function(ts){Object.keys(marks).forEach(function(t){marks[t].setStyle({fillColor:ts.indexOf(t)>-1?"#B8622F":"#9A8FE0"})})}};
  render();btn.textContent="Map loaded";};
 js.onerror=function(){box.innerHTML='<p class="rt-mapmsg">The map could not load (OpenStreetMap or the map library is unreachable). The stop list above has the same towns and restaurants.</p>';btn.disabled=false;btn.textContent="Try again"};
 document.head.appendChild(js)}
var mb=$("#mapBtn");if(mb)mb.addEventListener("click",loadMap);
readURL();sync();
fetch("/data/restaurants.json").then(function(r){return r.json()}).then(function(j){D=j;render()}).catch(function(){$("#rtSummary").textContent="Could not load the register. See the road-trip guide instead."});
})();
