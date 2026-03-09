function getID(){
const url=new URL(window.location.href);
return url.searchParams.get("id");
}

const id=getID();

fetch("listings.json")
.then(r=>r.json())
.then(data=>{

data.forEach(item=>{
item.info=parseFolder(item.name);
});

if(id){
showProperty(data);
}else{
showListings(data);
}

});


function parseFolder(name){

let text=name.toUpperCase();

let price="";
let type="";
let storey="";
let rooms="";
let build="";


// price

let priceMatch=text.match(/RM?\s?\d+(K|M)|\b\d+(K|M)\b|\b\d{3,7}\b/);

if(priceMatch){

let p=priceMatch[0].replace("RM","").trim();

if(p.includes("K")){

price="RM "+(parseInt(p)*1000);

}

else if(p.includes("M")){

price="RM "+(parseInt(p)*1000000);

}

else{

price="RM "+parseInt(p);

}

price=price.replace(/\B(?=(\d{3})+(?!\d))/g,",");

}



// property type

const types={

P:"Apartment",
A:"Apartment",
C:"Condo",
T:"Terrace",
S:"Shop Lot",
F:"Factory",
SA:"Service Apartment",
O:"Office"

};

for(let key in types){

if(text.includes("_"+key)){

type=types[key];

}

}



// storey

let s=text.match(/\d\s?STY|\d\s?STOREY/);

if(s){

storey=s[0].replace("STY"," Storey").replace("STOREY"," Storey");

}



// rooms bathrooms parking

let r=text.match(/\b\d{3}\b/);

if(r){

let v=r[0];

rooms=v[0]+" Bedroom • "+v[1]+" Bathroom • "+v[2]+" Parking";

}



// build up

let b=text.match(/\-\d{3,5}/);

if(b){

let val=b[0].replace("-","");

if(val!==r?.[0]){

build=val+" sqft";

}

}

return{

price:price,
type:type,
storey:storey,
rooms:rooms,
build:build

};

}



let page=1;
const perPage=20;



function showListings(data){

const container=document.getElementById("listings");

container.innerHTML="";

let start=(page-1)*perPage;
let end=start+perPage;

let items=data.slice(start,end);

items.forEach(item=>{

let card=document.createElement("div");

card.className="card";

card.innerHTML=`

<a href="?id=${item.id}">

<img loading="lazy" src="${item.photos[0]}">

<div class="info">

<div class="price">${item.info.price}</div>

<div>${item.info.type}</div>

<div>${item.info.storey}</div>

<div>${item.info.rooms}</div>

<div>${item.info.build}</div>

</div>

</a>

`;

container.appendChild(card);

});

renderPagination(data.length);

}



function renderPagination(total){

let pages=Math.ceil(total/perPage);

let nav=document.getElementById("pagination");

nav.innerHTML="";

if(page>1){

nav.innerHTML+=`<button onclick="page--;reload()">Prev</button>`;

}

nav.innerHTML+=` Page ${page} of ${pages} `;

if(page<pages){

nav.innerHTML+=`<button onclick="page++;reload()">Next</button>`;

}

}



function reload(){

fetch("listings.json")

.then(r=>r.json())

.then(data=>{

data.forEach(item=>{
item.info=parseFolder(item.name);
});

showListings(data);

});

}



function showProperty(data){

const container=document.getElementById("property");

const listing=data.find(l=>l.id===id);

let i=0;

function render(){

container.innerHTML=`

<div class="topbar">

<button onclick="window.location='index.html'">← Back</button>

<button onclick="copyURL()">Copy URL</button>

</div>

<div class="gallery">

<img src="${listing.photos[i]}">

<button class="prev" onclick="prev()">❮</button>

<button class="next" onclick="next()">❯</button>

</div>

<div class="info">

<div class="price">${listing.info.price}</div>

<div>${listing.info.type}</div>

<div>${listing.info.storey}</div>

<div>${listing.info.rooms}</div>

<div>${listing.info.build}</div>

</div>

`;

}

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

window.copyURL=function(){

navigator.clipboard.writeText(window.location.href);

alert("URL copied");

}

render();

}
