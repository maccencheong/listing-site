const perPage = 50;

let page = 1;
let allData = [];
let filteredData = [];
let currentVersion = "";

const id = new URLSearchParams(window.location.search).get("id");

function parsePriceNumber(p){
  if(!p) return 0;

  let text = p.toString().toLowerCase().trim();
  let num = 0;

  if(text.includes("k")){
    num = parseFloat(text) * 1000;
  }else if(text.includes("m")){
    num = parseFloat(text) * 1000000;
  }else{
    num = parseFloat(text.replace(/,/g, ""));
  }

  return isNaN(num) ? 0 : num;
}

function formatPrice(p){
  let num = parsePriceNumber(p);
  if(!num) return "";
  return "RM " + Math.round(num).toLocaleString();
}

function formatRooms(r,b,p){
  let parts = [];

  if(r) parts.push(r + "R");
  if(b) parts.push(b + "B");
  if(p) parts.push(p + "P");

  return parts.join(" ");
}

function makePriceSearchTokens(price){
  let num = parsePriceNumber(price);
  if(!num) return [];

  let rounded = Math.round(num);
  let thousand = Math.round(num / 1000);

  return [
    String(price || "").toLowerCase(),
    String(rounded),
    rounded.toLocaleString(),
    "rm" + rounded,
    "rm " + rounded,
    "rm" + rounded.toLocaleString(),
    "rm " + rounded.toLocaleString(),
    String(thousand),
    thousand + "k",
    "rm " + thousand + "k"
  ];
}

function makeSearchText(item){
  let priceTokens = makePriceSearchTokens(item.price || "");

  return [
    ...priceTokens,
    item.type || "",
    item.floor || "",
    item.rooms ? item.rooms + "r" : "",
    item.baths ? item.baths + "b" : "",
    item.parking ? item.parking + "p" : "",
    item.rooms || "",
    item.baths || "",
    item.parking || "",
    item.size || "",
    formatRooms(item.rooms, item.baths, item.parking)
  ].join(" ").toLowerCase();
}

function withVersion(url){
  if(!currentVersion) return url;
  return url + (url.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(currentVersion);
}

function withImageSize(url, size){
  if(!url) return "";
  let finalUrl = withVersion(url);
  return finalUrl + (finalUrl.includes("?") ? "&" : "?") + size;
}

/* LOAD DATA WITH CACHE-BUST */

async function fetchJsonNoCache(url){
  let res = await fetch(url, {
    cache: "no-store"
  });

  if(!res.ok){
    throw new Error("Failed to fetch " + url + " | " + res.status);
  }

  return res.json();
}

async function loadAll(){
  let versionUrl = "https://raw.githubusercontent.com/maccencheong/listing-site/main/version.json?t=" + Date.now();
  let version = await fetchJsonNoCache(versionUrl);

  currentVersion = String(version.version || "");
  let cacheVersion = localStorage.getItem("listingVersion");

  if(cacheVersion === currentVersion){
    let cached = localStorage.getItem("listingData");

    if(cached){
      allData = JSON.parse(cached);
      filteredData = [...allData];
      return;
    }
  }

  let pages = Number(version.pages || 0);
  allData = [];

  for(let i = 1; i <= pages; i++){
    let url = withVersion(`https://raw.githubusercontent.com/maccencheong/listing-site/main/listings-page-${i}.json`);
    let data = await fetchJsonNoCache(url);
    allData = allData.concat(data);
  }

  filteredData = [...allData];

  localStorage.setItem("listingVersion", currentVersion);
  localStorage.setItem("listingData", JSON.stringify(allData));
}

/* SEARCH */

function applySearch(){
  const search = document.getElementById("searchInput");
  if(!search) return;

  let q = search.value.trim().toLowerCase();

  if(!q){
    filteredData = [...allData];
    page = 1;
    showListings();
    return;
  }

  let keywords = q.split(/\s+/).filter(Boolean);

  filteredData = allData.filter(item => {
    let text = makeSearchText(item);
    let priceText = makePriceSearchTokens(item.price || "").join(" ").toLowerCase();

    return keywords.every(k => {
      if(/^\d+(\.\d+)?k?$/.test(k)){
        return priceText.includes(k) || text.includes(k);
      }
      return text.includes(k);
    });
  });

  page = 1;
  showListings();
}

/* LISTING PAGE */

function showListings(){
  document.getElementById("property").innerHTML = "";

  const container = document.getElementById("listings");
  container.innerHTML = "";

  let source = filteredData;
  let start = (page - 1) * perPage;
  let items = source.slice(start, start + perPage);

  if(items.length === 0){
    container.innerHTML = `<div class="info">No listings found.</div>`;
    renderPagination();
    return;
  }

  items.forEach(item => {
    let card = document.createElement("div");
    card.className = "card";

    let cover = item.photos?.[0] || "";

    card.innerHTML = `
      <a href="?id=${item.id}">
        <img src="${cover ? withImageSize(cover, 'w600') : ''}" loading="lazy">
        <div class="info">
          <div class="price">${formatPrice(item.price)}</div>
          <div>${item.type || ""}</div>
          <div>${item.floor || ""}</div>
          <div>${formatRooms(item.rooms, item.baths, item.parking)}</div>
          <div>${item.size || ""} sqft</div>
        </div>
      </a>
    `;

    container.appendChild(card);
  });

  renderPagination();
}

/* PAGINATION */

function renderPagination(){
  let nav = document.getElementById("pagination");
  nav.innerHTML = "";

  let totalPages = Math.ceil(filteredData.length / perPage);

  if(totalPages <= 1) return;

  if(page > 1){
    nav.innerHTML += `<button onclick="changePage(${page-1})">Previous</button>`;
  }

  for(let i = 1; i <= totalPages; i++){
    if(i === page){
      nav.innerHTML += `<button class="active-page">${i}</button>`;
    }else{
      nav.innerHTML += `<button onclick="changePage(${i})">${i}</button>`;
    }
  }

  if(page < totalPages){
    nav.innerHTML += `<button onclick="changePage(${page+1})">Next</button>`;
  }
}

function changePage(p){
  page = p;
  showListings();
  window.scrollTo(0, 0);
}

/* PROPERTY PAGE */

function showProperty(){
  document.getElementById("listings").innerHTML = "";
  document.getElementById("pagination").innerHTML = "";

  const container = document.getElementById("property");
  const listing = allData.find(l => l.id === id);

  if(!listing){
    container.innerHTML = `<div class="info">Listing not found.</div>`;
    return;
  }

  let i = 0;

  function render(){
    let currentPhoto = listing.photos[i] || "";

    container.innerHTML = `
      <div class="topbar">
        <button onclick="window.location='./'">← Back</button>
        <button onclick="copyURL()">Copy URL</button>
        <button onclick="downloadPhotos()">Download</button>
      </div>

      <div class="gallery">
        <img src="${currentPhoto ? withImageSize(currentPhoto, 'w1200') : ''}">
        <button class="prev" onclick="prev()">❮</button>
        <button class="next" onclick="next()">❯</button>
      </div>

      <div class="info">
        <div class="price">${formatPrice(listing.price)}</div>
        <div>${listing.type || ""}</div>
        <div>${listing.floor || ""}</div>
        <div>${formatRooms(listing.rooms, listing.baths, listing.parking)}</div>
        <div>${listing.size || ""} sqft</div>
      </div>
    `;
  }

  window.next = function(){
    if(i < listing.photos.length - 1){
      i++;
      render();
    }
  };

  window.prev = function(){
    if(i > 0){
      i--;
      render();
    }
  };

  window.copyURL = function(){
    navigator.clipboard.writeText(window.location.href);
    alert("Listing URL copied");
  };

  window.downloadPhotos = async function(){
    let zip = new JSZip();
    let folder = zip.folder("photos");

    for(let i = 0; i < listing.photos.length; i++){
      let url = listing.photos[i];

      try{
        let response = await fetch(withVersion(url), { cache: "no-store" });
        let blob = await response.blob();
        folder.file(`photo-${i+1}.jpg`, blob);
      }catch(e){}
    }

    let content = await zip.generateAsync({type:"blob"});

    let a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "listing-photos.zip";
    a.click();
  };

  render();
}

/* INIT */

async function init(){
  await loadAll();

  if(id){
    showProperty();
  }else{
    const search = document.getElementById("searchInput");
    if(search){
      search.addEventListener("input", applySearch);
    }

    filteredData = [...allData];
    showListings();
  }
}

init();
