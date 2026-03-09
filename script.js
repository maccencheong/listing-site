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

let upper=name.toUpperCase();

let price="";
let type="";
let storey="";
let rooms="";
let build="";



let priceMatch=upper.match(/RM?\d+(K|M)?|\b\d+(K|M)\b/);

if(priceMatch){

let p=priceMatch[0].replace("RM","");

if(p.includes("K")){
price="RM "+Number(p.replace("K",""))*1000;
}
else if(p.includes("M")){
price="RM "+Number(p.replace("M",""))*1000000;
}
else{
price="RM "+Number(p);
}

price=price.replace(/\B(?=(\d{3})+(?!\d))/g,",");
}



const map={
P:"Apartment",
A:"Apartment",
C:"Condo",
T:"Terrace",
S:"Shop Lot",
F:"Factory",
SA:"Service Apartment",
O:"Office"
};

for(let key in map){

if(upper.includes("_"+key)){
type=map[key];
}

}



let sty=upper.match(/\d\s?STY|\d\s?STOREY/);

if(sty){
storey=sty[0].replace("STY"," Storey").replace("STOREY"," Storey");
}



let r=upper.match(/\b\d{3}\b/);

if(r){
let a=r[0];
rooms=a[0]+"R "+a[1]+"B "+a[2]+"P";
}



let b=upper.match(/\-\d{3,5}/);

if(b){
build=b[0].replace("-","")+" sqft";
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

<img loading="lazy" class="loading" src="${item.photos[0]}" onload="this.classList.remove('loading');this.classList.add('loaded');">

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

let prev=document.createElement("button");

prev.innerText="Prev";

prev.onclick=()=>{
page--;
reload();
};

nav.appendChild(prev);

}

for(let i=1;i<=pages;i++){

let b=document.createElement("button");

b.innerText=i;

b.onclick=()=>{
page=i;
reload();
};

nav.appendChild(b);

}

if(page<pages){

let next=document.createElement("button");

next.innerText="Next";

next.onclick=()=>{
page++;
reload();
};

nav.appendChild(next);

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

if(!listing)return;

let i=0;

function render(){

let nextPhoto=listing.photos[i+1];

if(nextPhoto){
let img=new Image();
img.src=nextPhoto;
}

container.innerHTML=`

<div class="topbar">

<button onclick="window.location='index.html'">← Back</button>

<button onclick="copyURL()">Copy Link</button>

</div>



<div class="gallery">

<button onclick="prev()">←</button>

<img src="${listing.photos[i]}">

<button onclick="next()">→</button>

</div>



<div class="info">

<div class="price">${listing.info.price}</div>
<div>${listing.info.type}</div>
<div>${listing.info.storey}</div>
<div>${listing.info.rooms}</div>
<div>${listing.info.build}</div>

</div>

`;

let startX=0;

document.querySelector(".gallery img").addEventListener("touchstart",e=>{
startX=e.touches[0].clientX;
});

document.querySelector(".gallery img").addEventListener("touchend",e=>{

let endX=e.changedTouches[0].clientX;

if(startX-endX>50){
next();
}

if(endX-startX>50){
prev();
}

});

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
