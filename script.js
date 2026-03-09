function getID(){
  const url=new URL(window.location.href);
  return url.searchParams.get("id");
}

const id=getID();

fetch("listings.json")
.then(r=>r.json())
.then(data=>{

if(id){
showProperty(data);
}else{
showListings(data);
}

});


function showListings(data){

const container=document.getElementById("listings");

container.innerHTML="";

data.forEach(item=>{

let card=document.createElement("div");

card.className="card";

card.innerHTML=`

<a href="?id=${item.id}">

<img loading="lazy" src="${item.photos[0]}">

<h3>${item.name}</h3>

</a>

`;

container.appendChild(card);

});

}


function showProperty(data){

const container=document.getElementById("property");

const listing=data.find(l=>l.id===id);

if(!listing) return;

let gallery="";

listing.photos.forEach(p=>{
gallery+=`<img src="${p}">`;
});

let videoHTML="";

if(listing.video){

videoHTML=`

<video width="100%" controls>
<source src="${listing.video}">
</video>

`;

}

container.innerHTML=`

<h1>${listing.name}</h1>

<div class="gallery">

${gallery}

</div>

${videoHTML}

<a href="/">Back</a>

`;

}
