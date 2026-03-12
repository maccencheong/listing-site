const perPage = 50

let page = 1
let allData = []

const id = new URLSearchParams(window.location.search).get("id")



/* PRICE */

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



/* ROOMS */

function formatRooms(r,b,p){

let parts=[]

if(r) parts.push(r+"R")
if(b) parts.push(b+"B")
if(p) parts.push(p+"P")

return parts.join(" ")

}



/* LOAD JSON */

async function loadAll(){

let version=await fetch(
"https://raw.githubusercontent.com/maccencheong/listing-site/main/version.json"
).then(r=>r.json())

let pages=version.pages

for(let i=1;i<=pages;i++){

let url=`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${i}.json`

let res=await fetch(url)

let data=await res.json()

allData=allData.concat(data)

}

}



/* SHOW LISTINGS */

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

<img src="${cover}" loading="lazy">

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

if(page>1){
nav.innerHTML+=`<button onclick="changePage(${page-1})">Prev</button>`
}

nav.innerHTML+=`<span style="padding:8px;font-weight:bold">Page ${page}</span>`

if(page*perPage<allData.length){
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

<button onclick="downloadPhotos()">Download Photos</button>

</div>


<div class="gallery">

<img src="${listing.photos[i]}">

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



/* GALLERY */

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



/* COPY URL */

window.copyURL=function(){

navigator.clipboard.writeText(window.location.href)

alert("Listing URL copied")

}



/* DOWNLOAD */

window.downloadPhotos=function(){

listing.photos.forEach((url,i)=>{

setTimeout(()=>{

let a=document.createElement("a")

a.href=url

a.download="photo-"+(i+1)+".jpg"

a.click()

},i*300)

})

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
