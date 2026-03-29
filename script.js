const perPage = 50;

let page = 1;
let allData = [];
let filteredData = [];
let currentVersion = "";
let currentSort = "default";
let activeSearchPrice = 0;
let propertyViewState = null;

const id = new URLSearchParams(window.location.search).get("id");

function parsePriceNumber(p){
  if(p === null || p === undefined) return 0;
  let text = p.toString().toLowerCase().trim();
  text = text.replace(/rm/g, "").replace(/\s+/g, "").replace(/,/g, "");
  if(!text) return 0;
  let num = 0;
  if(text.endsWith("m")){
    num = parseFloat(text.slice(0, -1)) * 1000000;
  }else if(text.endsWith("k")){
    num = parseFloat(text.slice(0, -1)) * 1000;
  }else{
    num = parseFloat(text);
  }
  return isNaN(num) ? 0 : Math.round(num);
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

function withVersion(url){
  if(!url) return "";
  let secureUrl = url.replace("http://", "https://");
  if(!currentVersion) return secureUrl;
  return secureUrl + (secureUrl.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(currentVersion);
}

function withImageSize(url, size){
  if(!url) return "";

  // 1. 拦截空照片
  if(url.includes("profile/picture/0") || url.includes("profile/picture/2")){
     return "https://placehold.co/600x400/eeeeee/999999?text=No+Photo";
  }

  // 2. 官方极速通道：让照片秒开且无拦截报错
  let match = url.match(/[-\w]{25,}/);
  if(match){
    let fileId = match[0];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
  }

  return withVersion(url);
}

function preloadImage(url){
  if(!url) return;
  let img = new Image();
  img.src = url;
}

// 将下载链接转换为预览链接以解决视频黑屏
function getDrivePreviewUrl(url) {
  if (!url) return "";
  let match = url.match(/id=([-\w]{25,})/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url.replace("http://", "https://");
}

function getSearchInputValue(){
  const search = document.getElementById("searchInput");
  return search ? search.value : "";
}

function normalizeSearchPriceInput(q){
  return parsePriceNumber(q);
}

function cloneData(arr){
  return Array.isArray(arr) ? [...arr] : [];
}

function sortListings(data){
  let result = cloneData(data);
  if(activeSearchPrice > 0){
    result.sort((a, b) => {
      let aPrice = parsePriceNumber(a.price || "");
      let bPrice = parsePriceNumber(b.price || "");
      let aDiff = Math.abs(aPrice - activeSearchPrice);
      let bDiff = Math.abs(bPrice - activeSearchPrice);
      if(aDiff !== bDiff) return aDiff - bDiff;
      return bPrice - aPrice;
    });
    return result;
  }
  if(currentSort === "price-low-high"){
    result.sort((a, b) => parsePriceNumber(a.price || "") - parsePriceNumber(b.price || ""));
  }else if(currentSort === "price-high-low"){
    result.sort((a, b) => parsePriceNumber(b.price || "") - parsePriceNumber(a.price || ""));
  }else if(currentSort === "size-low-high"){
    result.sort((a, b) => Number(a.size || 0) - Number(b.size || 0));
  }else if(currentSort === "size-high-low"){
    result.sort((a, b) => Number(b.size || 0) - Number(a.size || 0));
  }
  return result;
}

function updateResults(){
  filteredData = sortListings(allData);
  page = 1;
  showListings();
}

async function fetchJsonNoCache(url){
  let res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error("Failed to fetch " + url);
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

function applySearch(){
  activeSearchPrice = normalizeSearchPriceInput(getSearchInputValue());
  updateResults();
}

function applySort(){
  const sort = document.getElementById("sortSelect");
  currentSort = sort ? sort.value : "default";
  updateResults();
}

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
        <div class="image-wrap">
          <div class="img-skeleton"></div>
          <img src="${cover ? withImageSize(cover, 'w600') : ''}" loading="lazy" referrerpolicy="no-referrer">
        </div>
        <div class="info">
          <div class="price">${formatPrice(item.price)}</div>
          <div>${item.type || ""}</div>
          <div>${item.floor || ""}</div>
          <div>${formatRooms(item.rooms, item.baths, item.parking)}</div>
          <div>${item.size || ""} sqft</div>
        </div>
      </a>
    `;
    let img = card.querySelector("img");
    let skeleton = card.querySelector(".img-skeleton");
    if(img){
      img.addEventListener("load", () => { img.classList.add("loaded"); if(skeleton) skeleton.classList.add("hidden"); });
      img.addEventListener("error", () => { if(skeleton) skeleton.classList.add("hidden"); });
    }
    container.appendChild(card);
  });
  renderPagination();
}

function renderPagination(){
  let nav = document.getElementById("pagination");
  nav.innerHTML = "";
  let totalPages = Math.ceil(filteredData.length / perPage);
  if(totalPages <= 1) return;
  function addButton(label, targetPage, isActive = false, isDisabled = false){
    let button = document.createElement("button");
    button.textContent = label;
    if(isActive) button.className = "active-page";
    if(isDisabled) button.disabled = true;
    if(!isDisabled && !isActive) button.addEventListener("click", () => changePage(targetPage));
    nav.appendChild(button);
  }
  addButton("Previous", page - 1, false, page === 1);
  let pagesToShow = new Set([1, totalPages, page - 1, page, page + 1]);
  Array.from(pagesToShow).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b).forEach((p, index, arr) => {
    if(index > 0 && p - arr[index - 1] > 1){
      let span = document.createElement("span"); span.textContent = "..."; nav.appendChild(span);
    }
    addButton(String(p), p, p === page, false);
  });
  addButton("Next", page + 1, false, page === totalPages);
}

function changePage(p){
  page = p;
  showListings();
  window.scrollTo(0, 0);
}

/* PROPERTY PAGE (智能识别视频，没有就不显示) */

function showProperty(){
  document.getElementById("listings").innerHTML = "";
  document.getElementById("pagination").innerHTML = "";
  const container = document.getElementById("property");
  const listing = allData.find(l => l.id === id);
  if(!listing){
    container.innerHTML = `<div class="info">Listing not found.</div>`;
    return;
  }

  let photos = Array.isArray(listing.photos) ? listing.photos : [];
  
  // 严格检测视频：只有里面真的有链接，才判定为有视频
  let hasVideo = listing.video && typeof listing.video === 'string' && listing.video.trim() !== "";
  
  // 如果有视频，序列总长度就是照片数+1；如果没有视频，总长度就等于照片数
  let totalItems = photos.length + (hasVideo ? 1 : 0);

  propertyViewState = { listing, index: 0, isDownloading: false };

  container.innerHTML = `
    <div class="topbar">
      <button id="backBtn">← Back
