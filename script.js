let page = 1;
let allData = [];
let currentVersion = null;


/* PRICE FORMAT */

function formatPrice(p){

if(!p) return "";

let text=p.toString().toLowerCase().trim();

let num=0;

if(text.includes("k")){
num=parseFloat(text.replace("k",""))*1000;
}
else if(text.includes("m")){
num=parseFloat(text.replace("m",""))*1000000;
}
else{
num=parseFloat(text);
}

return "RM "+Math.round(num).toLocaleString();

}


/* ROOM FORMAT */

function formatRooms(r,b,p){

let parts=[];

if(r) parts.push(r+"R");
if(b) parts.push(b+"B");
if(p) parts.push(p+"P");

return parts.join(" ");

}


/* GET URL ID */

function getID(){

const url=new URL(window.location.href);

return url.searchParams.get("id");

}

const id=getID();


/* LOAD ALL JSON */

async function loadAllListings(){

let page=1;
let results=[];
let keepLoading=true;

while(keepLoading){

try{

let res=await fetch(`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${page}.json?v=`+Date.now());

if(!res.ok){
keepLoading=false;
break;
}

let data=await res.json();

if(!data.length){
keepLoading=false;
break;
}

results=results.concat(data);

page++;

}catch(e){

keepLoading=false;

}

}

return results;

}


/* LOAD PAGE */

async function loadPage(){

allData=await loadAllListings();

if(id){
showProperty(allData);
}else{
showListings(allData);
}

}


/* CHECK VERSION */

function checkVersion(){

fetch("https://raw.githubusercontent.com/maccencheong/listing-site/main/version.json?v="+Date.now())

.then(r=>r.json())

.then(v=>{

if(!currentVersion){
currentVersion=v.version;
return;
}

if(v.version!==currentVersion){

currentVersion=v.version;

loadPage();

}

});

}


/* LISTINGS */

function showListings(data){

const container=document.getElementById("listings");

container.innerHTML="";

data.forEach(item=>{

let card=document.createElement("div");

card.className="card";

card.innerHTML=`

<a href="?id=${item.id}">

<img src="${item.photos?.[0]||""}" loading="lazy">

<div class="info">

<div class="price">${formatPrice(item.price)}</div>

<div>${item.type||""}</div>

<div>${formatRooms(item.rooms,item.baths,item.parking)}</div>

<div>${item.size||""} sqft</div>

</div>

</a>

`;

container.appendChild(card);

});

}


/* PROPERTY PAGE */

function showProperty(data){

const container=document.getElementById("property");

const listing=data.find(l=>l.id===id);

if(!listing){

container.innerHTML="<h2>Listing not found</h2>";
return;

}

let i=0;

function render(){

container.innerHTML=`

<div class="topbar">

<button onclick="window.location='./'">← Back</button>

<button onclick="copyURL()">Copy URL</button>

</div>

<div class="gallery">

<img src="${listing.photos?.[i]||""}">

<button class="prev" onclick="prev()">❮</button>

<button class="next" onclick="next()">❯</button>

</div>

<div class="info">

<div class="price">${formatPrice(listing.price)}</div>

<div>${listing.type||""}</div>

<div>${formatRooms(listing.rooms,listing.baths,listing.parking)}</div>

<div>${listing.size||""} sqft</div>

</div>

`;

}


/* gallery */

window.next=function(){

if(i<listing.photos.length-1){

i++;

render();

}

}

window.prev=function(){

if(i>0){

i--;

render();

}

}


/* COPY URL */

window.copyURL=function(){

let url="https://maccen.asiawai42.workers.dev/"+listing.id;

navigator.clipboard.writeText(url);

alert("Listing URL copied");

}

render();

}


/* SEARCH */

document.addEventListener("DOMContentLoaded",function(){

const search=document.getElementById("searchInput");

if(!search) return;

search.addEventListener("input",function(){

let q=this.value.toLowerCase();

let filtered=allData.filter(item=>{

let text=(

(item.price||"")+" "+
(item.type||"")+" "+
(item.rooms||"")+" "+
(item.baths||"")+" "+
(item.parking||"")+" "+
(item.size||"")

).toLowerCase();

return text.includes(q);

});

showListings(filtered);

});

});


/* INIT */

loadPage();


/* AUTO UPDATE */

setInterval(checkVersion,10000);
