const perPage = 50;

let page = 1;
let allData = [];

const id = new URLSearchParams(window.location.search).get("id");


/* PRICE FORMAT */

function formatPrice(p){

if(!p) return "";

let text=p.toString().toLowerCase().replace("rm","").trim();

let num=0;

if(text.includes("k")){
num=parseFloat(text)*1000;
}
else if(text.includes("m")){
num=parseFloat(text)*1000000;
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


/* LOAD ALL JSON */

async function loadAll(){

let i=1;

while(true){

let url=`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${i}.json`;

try{

let res=await fetch(url);

if(!res.ok){
break;
}

let data=await res.json();

allData=allData.concat(data);

i++;

}catch(e){

break;

}

}

}


/* SHOW LISTINGS */

function showListings(){

const container=document.getElementById("listings");

container.innerHTML="";

let start=(page-1)*perPage;

let data=allData.slice(start,start+perPage);

data.forEach(item=>{

let card=document.createElement("div");

card.className="card";

let cover=item.photos?.[0] || "";

card.innerHTML=`

<a href="?id=${item.id}">

<img src="${cover}" loading="lazy">

<div class="info">

<div class="price">${formatPrice(item.price)}</div>

<div>${item.type || ""}</div>

<div>${formatRooms(item.rooms,item.baths,item.parking)}</div>

<div>${item.size || ""} sqft</div>

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

nav.innerHTML="";

if(page>1){

nav.innerHTML+=`<button onclick="changePage(${page-1})">Prev</button>`;

}

nav.innerHTML+=`<span style="padding:8px;font-weight:bold">Page ${page}</span>`;

if(page*perPage < allData.length){

nav.innerHTML+=`<button onclick="changePage(${page+1})">Next</button>`;

}

}


function changePage(p){

page=p;

showListings();

window.scrollTo(0,0);

}


/* PROPERTY PAGE */

function showProperty(){

const container=document.getElementById("property");

const listing=allData.find(l=>l.id===id);

if(!listing) return;

let i=0;

function render(){

container.innerHTML=`

<div class="topbar">

<button onclick="window.location='./'">← Back</button>

<button onclick="copyURL()">Copy URL</button>

<button onclick="downloadPhotos()">Download Photos</button>

</div>

<div class="gallery">

<img src="${listing.photos[i]}">

<button class="prev" onclick="prev()">❮</button>

<button class="next" onclick="next()">❯</button>

</div>

<div class="info">

<div class="price">${formatPrice(listing.price)}</div>

<div>${listing.type || ""}</div>

<div>${formatRooms(listing.rooms,listing.baths,listing.parking)}</div>

<div>${listing.size || ""} sqft</div>

</div>

`;

}


/* GALLERY */

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

navigator.clipboard.writeText(window.location.href);

alert("Listing URL copied");

}


/* DOWNLOAD ALL */

window.downloadPhotos=function(){

listing.photos.forEach((url,i)=>{

setTimeout(()=>{

let a=document.createElement("a");

a.href=url;

a.download="photo-"+(i+1)+".jpg";

a.click();

},i*500);

});

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

const container=document.getElementById("listings");

container.innerHTML="";

filtered.forEach(item=>{

let card=document.createElement("div");

card.className="card";

card.innerHTML=`

<a href="?id=${item.id}">

<img src="${item.photos?.[0]||""}">

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

});

});


/* INIT */

async function init(){

await loadAll();

if(id){

showProperty();

}else{

showListings();

}

}

init();
