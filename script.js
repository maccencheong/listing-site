let allData=[];
let page=1;
const perPage=50;

const id=new URLSearchParams(window.location.search).get("id");


function formatPrice(p){

if(!p) return "";

let text=p.toString().toLowerCase();

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


/* LOAD JSON */

async function loadAll(){

let version=await fetch(
"https://raw.githubusercontent.com/maccencheong/listing-site/main/version.json"
).then(r=>r.json());

let pages=version.pages;

for(let i=1;i<=pages;i++){

let url=`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${i}.json`;

let res=await fetch(url);

let data=await res.json();

allData=allData.concat(data);

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

card.innerHTML=`

<a href="?id=${item.id}">

<img src="${item.photos?.[0]||""}" loading="lazy">

<div class="info">

<div class="price">${formatPrice(item.price)}</div>
<div>${item.type||""}</div>
<div>${item.rooms||""}R ${item.baths||""}B</div>
<div>${item.size||""} sqft</div>

</div>

</a>
`;

container.appendChild(card);

});

}


/* PROPERTY PAGE */

function showProperty(){

const container=document.getElementById("property");

const listing=allData.find(x=>x.id===id);

if(!listing) return;

let i=0;

function render(){

container.innerHTML=`

<div class="gallery">

<img src="${listing.photos[i]}">

<button onclick="prev()">❮</button>
<button onclick="next()">❯</button>

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

render();

}


async function init(){

await loadAll();

if(id){
showProperty();
}else{
showListings();
}

}

init();
