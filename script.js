const perPage = 50;

let page = 1;
let allData = [];
let currentVersion = null;

let cache={};


/* PRICE FORMAT */

function formatPrice(p){

if(!p) return "";

let text=p.toString().toLowerCase().replace("rm","").trim();

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


/* LOAD JSON */

function loadPage(){

if(cache[page]){

render(cache[page]);
return;

}

fetch(`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${page}.json?v=`+Date.now())

.then(r=>r.json())
.then(data=>{

cache[page]=data;

render(data);

});

}


function render(data){

allData=data;

if(id){
showProperty(data);
}else{
showListings(data);
}

}


/* VERSION CHECK */

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
cache={};

loadPage();

}

});

}
