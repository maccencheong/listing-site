const perPage = 50;

let page = 1;
let allData = [];

function getID(){

const url=new URL(window.location.href);
return url.searchParams.get("id");

}

const id=getID();

fetch("listings.json")

.then(r=>r.json())

.then(data=>{

allData=data;

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
let bedroom="";
let bathroom="";
let parking="";
let build="";

let priceMatch=text.match(/(RM)?\s*\d+(\.\d+)?\s*(K|M)|\b\d{3,7}\b/);

if(priceMatch){

let p=priceMatch[0].replace("RM","").replace(/\s/g,"");

let num=parseFloat(p);

if(p.includes("K")) num*=1000;
if(p.includes("M")) num*=1000000;

if(!p.includes("K")&&!p.includes("M")) num=parseInt(p);

price="RM "+Math.round(num)
.toString()
.replace(/\B(?=(\d{3})+(?!\d))/g,",");

}

const types={
SA:"Service Apartment",
P:"Apartment",
A:"Apartment",
C:"Condo",
T:"Terrace",
S:"Shop Lot",
F:"Factory",
O:"Office"
};

for(let key in types){

if(text.includes("_"+key)){
type=types[key];
}

}

let s=text.match(/\d\s?(STY|STOREY)/);

if(s){

storey=s[0]
.replace("STY"," Storey")
.replace("STOREY"," Storey");

}

let r=text.match(/\b\d{3}\b/);

if(r){

let v=r[0];

bedroom=v[0]+" Bedroom";
bathroom=v[1]+" Bathroom";
parking=v[2]+" Parking";

}

let numbers=text.match(/\b\d{3,5}\b/g);

if(numbers){

numbers.forEach(n=>{

if(n!==r?.[0]){
build=n+" sqft";
}

});

}

return{
price,
type,
storey,
bedroom,
bathroom,
parking,
build
};

}



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

<img src="${item.photos[0]}">

<div class="info">

<div class="price">${item.info.price}</div>

<div>${item.info.type}</div>

<div>${item.info.bedroom} ${item.info.bathroom} ${item.info.parking}</div>

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

if(pages<=1) return;

if(page>1){

nav.innerHTML+=`<button onclick="page--;reload()">Prev</button>`;

}

for(let i=1;i<=pages;i++){

nav.innerHTML+=`<button onclick="page=${i};reload()">${i}</button>`;

}

if(page<pages){

nav.innerHTML+=`<button onclick="page++;reload()">Next</button>`;

}

}



function reload(){

showListings(allData);

}



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

<img src="${listing.photos[i]}">

<button class="prev" onclick="prev()">❮</button>
<button class="next" onclick="next()">❯</button>

</div>

<div class="info">

<div class="price">${listing.info.price}</div>

<div>${listing.info.type}</div>

<div>${listing.info.bedroom} ${listing.info.bathroom} ${listing.info.parking}</div>

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
alert("Listing URL copied");

}

render();

}



/* SEARCH */

document.addEventListener("DOMContentLoaded",function(){

const search=document.getElementById("searchInput");

if(!search) return;

search.addEventListener("input",function(){

let q=this.value.toLowerCase().replace(/[^a-z0-9]/g,"");

let filtered=allData.filter(item=>{

let info=parseFolder(item.name);

let text=(

info.price+" "+
info.type+" "+
info.bedroom+" "+
info.bathroom+" "+
info.parking+" "+
info.build

).toLowerCase().replace(/[^a-z0-9]/g,"");

return text.includes(q);

});

page=1;

showListings(filtered);

});

});
