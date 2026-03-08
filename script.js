fetch("data/listings.json")

.then(res=>res.json())

.then(data=>{

let html="";

data.forEach(p=>{

html+=`

<a href="l/${p.short}.html">

<div class="card">

<div class="price">${p.price}</div>

<div>

${p.type}
${p.bedroom}R
${p.bathroom}B
${p.parking}P
${p.size}sf

</div>

</div>

</a>

`;

});

document.getElementById("listings").innerHTML=html;

});
