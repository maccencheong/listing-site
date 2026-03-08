fetch("listings.json")
.then(res => res.json())
.then(data => {

const container = document.getElementById("listings")

data.forEach(item => {

const card = document.createElement("div")
card.className = "card"

card.innerHTML = `
<a href="l/${item.id}.html">

<img src="${item.photo}">

<div class="card-body">

<div class="price">RM ${item.price}</div>

<div>${item.type}</div>
<div>${item.area}</div>

</div>

</a>
`

container.appendChild(card)

})

})
