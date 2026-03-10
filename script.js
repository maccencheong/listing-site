const perPage=50;

let page=1;
let allData=[];
let currentVersion=null;


/* LOAD PAGE */

function loadPage(p){

fetch("https://maccen.asiawai42.workers.dev/api/listings?v="+Date.now())

.then(r=>r.json())

.then(data=>{

allData=data;

renderListings(data);

});

}



/* VERSION CHECK */

function checkVersion(){

fetch("https://maccen.asiawai42.workers.dev/api/version?v="+Date.now())

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



/* LISTINGS */

function renderListings(data){

const container=document.getElementById("listings");

if(!container) return;

container.innerHTML="";

data.forEach(item=>{

let card=document.createElement("div");

card.className="card";

card.innerHTML=`
<a href="?id=${item.id}">
<img src="${item.photos[0]||""}" loading="lazy">
<div>${item.price||""}</div>
</a>
`;

container.appendChild(card);

});

}



loadPage(page);

setInterval(checkVersion,10000);
