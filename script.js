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
  if(!currentVersion) return url;
  return url + (url.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(currentVersion);
}

function withImageSize(url, size){
  if(!url) return "";
  let finalUrl = withVersion(url);
  return finalUrl + (finalUrl.includes("?") ? "&" : "?") + size;
}

function preloadImage(url){
  if(!url) return;
  let img = new Image();
  img.src = url;
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
          <img src="${cover ? withImageSize(cover, 'w600') : ''}" loading="lazy">
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

/* PROPERTY PAGE (修复视频黑屏逻辑) */

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
  let hasVideo = !!listing.video;
  let totalItems = photos.length + (hasVideo ? 1 : 0);

  propertyViewState = {
    listing,
    index: 0,
    isDownloading: false
  };

  container.innerHTML = `
    <div class="topbar">
      <button id="backBtn">← Back</button>
      <button id="copyBtn">Copy URL</button>
      <button id="downloadBtn">Download</button>
      ${hasVideo ? `<button id="viewVideoBtn" style="background:#ff6600;">Watch Video</button>` : ""}
    </div>

    <div class="gallery" id="galleryContainer">
      <img id="propertyImage" src="">
      ${hasVideo ? `
        <div id="videoContainer" style="display:none; width:100%; height:100%;">
          <video id="listingVideo" controls playsinline preload="auto" style="width:100%; max-height:520px; background:#000; display:block;">
            <source src="${listing.video}" type="video/mp4">
            Your browser does not support video.
          </video>
        </div>
      ` : ""}
      <button class="prev" id="prevBtn">❮</button>
      <button class="next" id="nextBtn">❯</button>
    </div>

    <div class="info">
      <div class="price">${formatPrice(listing.price)}</div>
      <div>${listing.type || ""}</div>
      <div>${listing.floor || ""}</div>
      <div>${formatRooms(listing.rooms, listing.baths, listing.parking)}</div>
      <div>${listing.size || ""} sqft</div>
    </div>
  `;

  const image = document.getElementById("propertyImage");
  const videoContainer = document.getElementById("videoContainer");
  const listingVideo = document.getElementById("listingVideo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const viewVideoBtn = document.getElementById("viewVideoBtn");
  const gallery = document.getElementById("galleryContainer");

  function updateGallery(){
    if(propertyViewState.index < photos.length){
      image.style.display = "block";
      if(videoContainer) videoContainer.style.display = "none";
      if(listingVideo) listingVideo.pause();
      
      let currentPhoto = photos[propertyViewState.index] || "";
      image.src = currentPhoto ? withImageSize(currentPhoto, "w1200") : "";
      if(viewVideoBtn) viewVideoBtn.textContent = "Watch Video";
      
      let nextPhoto = photos[propertyViewState.index + 1] || "";
      if(nextPhoto) preloadImage(withImageSize(nextPhoto, "w1200"));
    } else {
      image.style.display = "none";
      if(videoContainer) {
        videoContainer.style.display = "block";
        // 关键修复：强制重载视频流并尝试播放
        if(listingVideo) {
          listingVideo.load(); 
          listingVideo.play().catch(e => console.log("Autoplay blocked or error"));
        }
      }
      if(viewVideoBtn) viewVideoBtn.textContent = "Show Photos";
    }
    prevBtn.disabled = propertyViewState.index <= 0;
    nextBtn.disabled = propertyViewState.index >= totalItems - 1;
  }

  prevBtn.addEventListener("click", () => {
    if(propertyViewState.index > 0){ propertyViewState.index--; updateGallery(); }
  });

  nextBtn.addEventListener("click", () => {
    if(propertyViewState.index < totalItems - 1){ propertyViewState.index++; updateGallery(); }
  });

  if(viewVideoBtn){
    viewVideoBtn.addEventListener("click", () => {
      propertyViewState.index = (propertyViewState.index === photos.length) ? 0 : photos.length;
      updateGallery();
    });
  }

  let touchStartX = 0;
  gallery.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, {passive: true});
  gallery.addEventListener('touchend', e => {
    let diff = touchStartX - e.changedTouches[0].clientX;
    if(Math.abs(diff) > 50){
      if(diff > 0 && !nextBtn.disabled) nextBtn.click();
      else if(diff < 0 && !prevBtn.disabled) prevBtn.click();
    }
  }, {passive: true});

  document.getElementById("backBtn").addEventListener("click", () => window.location = "./");
  document.getElementById("copyBtn").addEventListener("click", () => {
    const url = window.location.origin + "/listing-site/listing/" + id + ".html";
    navigator.clipboard.writeText(url).then(() => alert("URL Copied"));
  });

  document.getElementById("downloadBtn").addEventListener("click", async () => {
    if(propertyViewState.isDownloading) return;
    const btn = document.getElementById("downloadBtn");
    propertyViewState.isDownloading = true;
    btn.textContent = "Downloading..."; btn.disabled = true;
    try {
      let zip = new JSZip(); let folder = zip.folder("photos");
      for(let i = 0; i < photos.length; i++){
        let resp = await fetch(withVersion(photos[i]), { cache: "no-store" });
        folder.file(`photo-${i+1}.jpg`, await resp.blob());
      }
      let content = await zip.generateAsync({type:"blob"});
      let a = document.createElement("a"); a.href = URL.createObjectURL(content); a.download = "photos.zip"; a.click();
      btn.textContent = "Done";
    } catch(e) { alert("Failed"); }
    setTimeout(() => { btn.textContent = "Download"; btn.disabled = false; propertyViewState.isDownloading = false; }, 1200);
  });

  updateGallery();
}

async function init(){
  await loadAll();
  if(id) showProperty();
  else {
    const s = document.getElementById("searchInput");
    const o = document.getElementById("sortSelect");
    if(s) s.addEventListener("input", applySearch);
    if(o) o.addEventListener("change", applySort);
    filteredData = [...allData];
    showListings();
  }
}
init();
