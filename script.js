function getID(){

const url=new URL(window.location.href)
return url.searchParams.get("id")

}

const id=getID()

fetch("listings.json")
.then(r=>r.json())
.then(data=>{

if(id){

showProperty(data)

}else{

showListings(data)

}

})



function showListings(data){

const container=document.getElementById("listings")

data.forEach(item=>{

let card=document.createElement("div")

card.className="card"

card.innerHTML=`

<a href="?id=${item.id}">

<img loading="lazy" src="${item.photo}">

<div class="card-body">

<div class="price">${item.name}</div>

</div>

</a>

`

container.appendChild(card)

})

}



function showProperty(data){

const container=document.getElementById("property")

const listing=data.find(l=>l.id===id)

if(!listing) return

let videoHTML=""

if(listing.video){

videoHTML=`

<video width="100%" controls>

<source src="${listing.video}">

</video>

`

}

container.innerHTML=`

<div class="property-page">

<h1>${listing.name}</h1>

<div class="gallery">

<img src="${listing.photo}">

</div>

${videoHTML}

</div>

`

}
