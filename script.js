const perPage = 50

let page = 1
let allData = []
let cache = {}

const id = new URLSearchParams(window.location.search).get("id")

function formatPrice(p){

if(!p) return ""

let text=p.toString().toLowerCase()

let num=0

if(text.includes("k")){
num=parseFloat(text)*1000
}
else if(text.includes("m")){
num=parseFloat(text)*1000000
}
else{
num=parseFloat(text)
}

return "RM "+Math.round(num).toLocaleString()

}

function formatRooms(r,b,p){

let parts=[]

if(r) parts.push(r+"R")
if(b) parts.push(b+"B")
if(p) parts.push(p+"P")

return parts.join(" ")

}


/* LOAD DATA WITH CACHE */

async function loadAll(){

let version=await fetch(
"https://raw.githubusercontent.com/maccencheong/listing-site/main/version.json"
).then(r=>r.json())

let cacheVersion=localStorage.getItem("listingVersion")

if(cacheVersion==version.version){

let cached=localStorage.getItem("listingData")

if(cached){
allData=JSON.parse(cached)
return
}

}

let pages=version.pages

allData=[]

for(let i=1;i<=pages;i++){

let url=`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${i}.json`

let res=await fetch(url)

let data=await res.json()

allData=allData.concat(data)

}

localStorage.setItem("listingVersion",version.version)
localStorage.setItem("listingData",JSON.stringify(allData))

}


/* LISTING PAGE */

function showListings(){

document.getElementById("property").innerHTML=""

const container=document.getElementById("listings")

container.innerHTML=""

let start=(page-1)*perPage

let items=allData.slice(start,start+perPage)

items.forEach(item=>{

let card=document.createElement("div")

card.className="card"

let cover=item.photos?.[0] || ""

card.innerHTML=`
<a href="?id=${item.id}">
<img src="${cover ? cover+'=w600' : ''}" loading="lazy">
<div class="info">
<div class="price">${formatPrice(item.price)}</div>
<div>${item.type||""}</div>
<div>${formatRooms(item.rooms,item.baths,item.parking)}</div>
<div>${item.size||""} sqft</div>
</div>
</a>
`

container.appendChild(card)

})

renderPagination()

}


/* PAGINATION */

function renderPagination(){

let nav=document.getElementById("pagination")

nav.innerHTML=""

let totalPages=Math.ceil(allData.length/perPage)

/* Previous */

if(page>1){
nav.innerHTML+=`<button onclick="changePage(${page-1})">Previous</button>`
}

/* Page Numbers */

for(let i=1;i<=totalPages;i++){

if(i===page){

nav.innerHTML+=`<button style="font-weight:bold;backgrou

}else{

nav.innerHTML+=`<button class="active-page">${i}</button>`

}

}

/* Next */

if(page<totalPages){
nav.innerHTML+=`<button onclick="changePage(${page+1})">Next</button>`
}

}

function changePage(p){

page=p

showListings()

window.scrollTo(0,0)

}


/* PROPERTY PAGE */

function showProperty(){

document.getElementById("listings").innerHTML=""
document.getElementById("pagination").innerHTML=""

const container=document.getElementById("property")

const listing=allData.find(l=>l.id===id)

if(!listing) return

let i=0

function render(){

container.innerHTML=`
<div class="topbar">
<button onclick="window.location='./'">← Back</button>
<button onclick="copyURL()">Copy URL</button>
<button onclick="downloadPhotos()">Download</button>
</div>

<div class="gallery">
<img src="${listing.photos[i]}=w1200">
<button class="prev" onclick="prev()">❮</button>
<button class="next" onclick="next()">❯</button>
</div>

<div class="info">
<div class="price">${formatPrice(listing.price)}</div>
<div>${listing.type||""}</div>
<div>${formatRooms(listing.rooms,listing.baths,listing.parking)}</div>
<div>${listing.size||""} sqft</div>
</div>
`
}

window.next=function(){
if(i<listing.photos.length-1){
i++
render()
}
}

window.prev=function(){
if(i>0){
i--
render()
}
}

window.copyURL=function(){
navigator.clipboard.writeText(window.location.href)
alert("Listing URL copied")
}

window.downloadPhotos = async function(){

let zip = new JSZip()
let folder = zip.folder("photos")

for(let i=0;i<listing.photos.length;i++){

let url = listing.photos[i]

try{

let response = await fetch(url)
let blob = await response.blob()
folder.file(`photo-${i+1}.jpg`, blob)

}catch(e){}

}

let content = await zip.generateAsync({type:"blob"})

let a = document.createElement("a")
a.href = URL.createObjectURL(content)
a.download = "listing-photos.zip"
a.click()

}

render()

}


/* INIT */

async function init(){

await loadAll()

if(id){
showProperty()
}else{
showListings()
}

}

init()
