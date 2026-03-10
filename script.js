const perPage = 50;

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


/* LOAD JSON PAGE */

function loadPage(){

fetch(`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${page}.json?v=`+Date.now())

.then(r=>r.json())

.then(data=>{

allData=data;

if(id){
showProperty(data);
}else{
showListings(data);
}

});

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


/* LISTINGS PAGE */

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

renderPagination();

}


/* PAGINATION */

function renderPagination(){

let nav=document.getElementById("pagination");

if(!nav) return;

nav.innerHTML="";

/* PREV */

if(page>1){

nav.innerHTML+=`<button onclick="changePage(${page-1})">Prev</button>`;

}


/* CURRENT PAGE */

nav.innerHTML+=`<span style="padding:8px;font-weight:bold">Page ${page}</span>`;


/* NEXT */

nav.innerHTML+=`<button onclick="changePage(${page+1})">Next</button>`;

}


function changePage(p){

page=p;

loadPage();

window.scrollTo(0,0);

}


/* PROPERTY PAGE */

function showProperty(data){

const container=document.getElementById("property");

const listing=data.find(l=>l.id===id);

if(!listing) return;

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
