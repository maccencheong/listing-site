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


/* LOAD PAGE JSON */

function loadPage(p){

fetch(`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${p}.json?v=`+Date.now())

.then(r=>r.json())

.then(data=>{

allData=data;

showListings(data);

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

loadPage(page);

}

});

}


/* LISTING PAGE */

function showListings(data){

const container=document.getElementById("listings");

if(!container) return;

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


/* INIT */

loadPage(page);


/* AUTO CHECK UPDATE */

setInterval(checkVersion,10000);
