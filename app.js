let data={businesses:[],capacity:200};
const FAVKEY='e360-product-offers-favourites-v3';let favourites=new Set(JSON.parse(localStorage.getItem(FAVKEY)||'[]'));
function toggleFavourite(id){const detailWasOpen=!$('#detail').hidden;id=Number(id);if(favourites.has(id))favourites.delete(id);else favourites.add(id);localStorage.setItem(FAVKEY,JSON.stringify([...favourites]));render();if(detailWasOpen)openBusiness(id)}
function sortedProducts(items){const mode=$('#sortProducts')?.value||'default';return [...items].sort((a,b)=>mode==='name'?String(a.name).localeCompare(String(b.name)):mode==='low'?(price(a)??Infinity)-(price(b)??Infinity):mode==='high'?(price(b)??-Infinity)-(price(a)??-Infinity):mode==='discount'?pct(b)-pct(a):0)}const sessionRefresh=Date.now();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
async function load(){
 try{const r=await fetch(`businesses.json?fresh=${Date.now()}`,{cache:'no-store'});data=await r.json();}
 catch(e){console.warn('Using cached/offline data if available',e)}
 render();
}
function active(){return (data.businesses||[]).filter(b=>b.active!==false)}
function img(b){return `${b.image}?v=${encodeURIComponent((data.version||'1.4.0')+'-'+sessionRefresh)}`}
function price(b){const n=Number(b.address);return b.address!==undefined&&String(b.address).trim()!==''&&Number.isFinite(n)&&n>=0?n:null}
function pct(b){return Math.max(0,Math.min(100,Number(b.discount)||0))}
function availability(b){const raw=String(b.openingHours||'').trim();const m=raw.match(/^(?:stock\s*[:=]\s*)?(\d+)$/i);if(m){const n=Number(m[1]);return {label:n===0?'Out of stock':n<=5?`Only ${n} left`:`${n} in stock`,out:n===0}}return {label:raw||'Contact business for availability',out:/out of stock|sold out|unavailable/i.test(raw)}}
function prices(b){const n=price(b);if(n===null)return '<div class="product-price">Ask for price</div>';const off=n*(1-pct(b)/100);return `<div class="product-price"><span class="was">£${n.toFixed(2)}</span><strong class="now">£${off.toFixed(2)}</strong>${pct(b)>0?` <span class="save">Save £${(n-off).toFixed(2)}</span>`:''}</div>`}
function render(){
 const bs=active(), featured=bs.filter(b=>b.featured);
 $('#updated').textContent=`Offers updated: ${data.updated||'recently'}`;
 $('#count').textContent=`${bs.length} available products`;
 $('#adminCount').textContent=`Product spaces: ${bs.length} / ${data.capacity||200}`;
 const cats=['All',...new Set(bs.map(b=>b.category).filter(Boolean))];
 $('#categories').innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" data-cat="${c}">${c}</button>`).join('');
 $$('#categories button').forEach(x=>x.onclick=()=>{ $$('#categories button').forEach(y=>y.classList.remove('active'));x.classList.add('active');filter()});
 $('#featuredWrap').style.display=featured.length?'block':'none';
 $('#featured').innerHTML=featured.map(card).join('');
 $('#grid').innerHTML=sortedProducts(bs).map(card).join('');
 $$('.deal-card').forEach(c=>c.onclick=e=>{if(e.target.closest('.fav-btn,.enquiry-add'))return;openBusiness(+c.dataset.id)});$$('.fav-btn').forEach(x=>x.onclick=e=>{e.stopPropagation();toggleFavourite(x.dataset.id)});$$('.enquiry-add').forEach(x=>x.onclick=e=>{e.stopPropagation();toggleEnquiry(+x.dataset.id)});filter();updateEnquiryCount();
}
function card(b){return `<article class="deal-card" data-id="${b.id}">
 <img src="${img(b)}" alt="${b.name}">
 <div class="cardbody"><button type="button" class="fav-btn" data-id="${b.id}" aria-label="Toggle favourite">${favourites.has(Number(b.id))?'♥ Saved':'♡ Save'}</button><span class="category">${b.category||'Product'}</span>
 <h3>${b.name}</h3>${prices(b)}<div class="discount">${pct(b)}% OFF</div><div class="stock ${availability(b).out?'out':''}">${availability(b).label}</div>
 <p>${b.offer||''}</p><button type="button" class="enquiry-add" data-id="${b.id}">${enquiry.has(Number(b.id))?'✓ On enquiry list':'+ Add to enquiry'}</button></div></article>`}
function filter(){
 const q=$('#search').value.trim().toLowerCase(), onlyStock=$('#stockOnly')?.checked||false, favOnly=$('#favouritesOnly')?.checked||false, cat=$('#categories .active')?.dataset.cat||'All';
 $$('#grid .deal-card').forEach(el=>{const b=active().find(x=>x.id==el.dataset.id);el.style.display=(!q||`${b.name} ${b.description||''} ${b.category||''}`.toLowerCase().includes(q))&&(cat==='All'||b.category===cat)&&(!onlyStock||!availability(b).out)&&(!favOnly||favourites.has(Number(b.id)))?'':'none'})
}
$('#sortProducts').addEventListener('change',render);$('#favouritesOnly').addEventListener('change',filter);$('#clearFilters').addEventListener('click',()=>{$('#search').value='';$('#stockOnly').checked=false;$('#favouritesOnly').checked=false;$('#sortProducts').value='default';render()});$('#search').addEventListener('input',filter);$('#stockOnly')?.addEventListener('change',filter);
function openBusiness(id){
 const b=active().find(x=>x.id===id); if(!b)return;
 $('#directory').hidden=true; $('#detail').hidden=false;
 $('#detail').innerHTML=`<button class="back" onclick="back()">← Back to products</button>
 <div class="detailHero"><img src="${img(b)}" alt="${b.name}"></div>
 <div class="detailBody"><span class="category">${b.category||''}</span><h2>${b.name}</h2>
 ${prices(b)}<div class="bigDiscount">${pct(b)}% OFF</div><div class="stock ${availability(b).out?'out':''}">${availability(b).label}</div><p class="lead">${b.description||''}</p>
 <button class="enquiry-add" onclick="toggleEnquiry(${b.id})">${enquiry.has(Number(b.id))?'✓ Remove from enquiry':'+ Add to enquiry'}</button><button class="fav-btn" onclick="toggleFavourite(${b.id})">${favourites.has(Number(b.id))?'♥ Remove favourite':'♡ Save favourite'}</button><button class="showOffer" onclick="showOffer(${b.id})">SHOW THIS APP IN STORE</button>
 <div class="actions">
 ${b.phone?`<a href="tel:${b.phone.replace(/[^+\d]/g,'')}">Call</a>`:''}
 ${b.website?`<a href="${b.website}" target="_blank" rel="noopener">Website</a>`:''}
 
 <button onclick="shareDeal(${b.id})">Share</button></div>
 <div class="info"><p><b>Price:</b> ${price(b)!==null?'£'+price(b).toFixed(2):'Ask in store'}</p><p><b>Availability:</b> ${availability(b).label}</p>
 <p><b>Offer:</b> ${b.offer||''}</p><p><b>Terms:</b> ${b.terms||'Show this discount before payment.'}</p>
 ${b.expires?`<p><b>Valid until:</b> ${b.expires}</p>`:''}</div></div>`;
 scrollTo(0,0);
}
function back(){ $('#detail').hidden=true;$('#enquiryPage').hidden=true;$('#directory').hidden=false;scrollTo(0,0)}
function showOffer(id){
 const b=active().find(x=>x.id===id);
 $('#offerModal').innerHTML=`<div class="offerBox"><img src="elevore360d-logo.jpg"><div class="valid">PRODUCT DISCOUNT</div><h2>${b.name}</h2><div class="offerPct">${pct(b)}% OFF</div><p>${b.offer||''}</p><strong>SHOW THIS SCREEN BEFORE PAYMENT</strong><small>${b.terms||''}${b.expires?' • Valid until '+b.expires:''}</small><button onclick="closeOffer()">Close</button></div>`;
 $('#offerModal').classList.add('open');
}
function closeOffer(){$('#offerModal').classList.remove('open')}
async function shareDeal(id){const b=active().find(x=>x.id===id),t=`${b.name}: ${b.discount}% off with Elevore360D Product Offers`;if(navigator.share){try{await navigator.share({title:b.name,text:t,url:location.href})}catch(e){}}else{navigator.clipboard?.writeText(t+' '+location.href);alert('Deal copied to clipboard.');}}
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js');
load();

// V4: a local, non-transactional product enquiry list. No payment or checkout.
const ENQUIRY_KEY='e360-product-enquiry-v4';
let enquiry=new Set(JSON.parse(localStorage.getItem(ENQUIRY_KEY)||'[]').map(Number));
function updateEnquiryCount(){document.getElementById('enquiryCount').textContent=`(${enquiry.size})`}
function toggleEnquiry(id){id=Number(id);if(enquiry.has(id))enquiry.delete(id);else enquiry.add(id);localStorage.setItem(ENQUIRY_KEY,JSON.stringify([...enquiry]));const wasDetail=!$('#detail').hidden;render();if(wasDetail)openBusiness(id);if(!$('#enquiryPage').hidden)renderEnquiry();updateEnquiryCount()}
function renderEnquiry(){const products=active().filter(b=>enquiry.has(Number(b.id)));$('#enquiryItems').innerHTML=products.length?products.map(b=>`<div class="enquiry-item"><img src="${img(b)}" alt=""><div><b>${b.name}</b><p>${prices(b)}</p><small>${availability(b).label}</small></div><button onclick="toggleEnquiry(${Number(b.id)})">Remove</button></div>`).join(''):'No products added yet.'}
function enquiryText(){const products=active().filter(b=>enquiry.has(Number(b.id)));return 'Hello, I would like to enquire about these products:\n\n'+products.map(b=>`${b.name} — ${price(b)===null?'Price on request':'£'+(price(b)*(1-pct(b)/100)).toFixed(2)} (${pct(b)}% off)`).join('\n')+'\n\nPlease confirm current prices and availability. Thank you.'}
$('#openEnquiry').onclick=()=>{$('#directory').hidden=true;$('#detail').hidden=true;$('#enquiryPage').hidden=false;renderEnquiry();scrollTo(0,0)};
$('#enquiryBack').onclick=back;
$('#clearEnquiry').onclick=()=>{if(confirm('Clear your enquiry list?')){enquiry.clear();localStorage.setItem(ENQUIRY_KEY,'[]');render();renderEnquiry();updateEnquiryCount()}};
$('#copyEnquiry').onclick=async()=>{try{await navigator.clipboard.writeText(enquiryText());alert('Enquiry copied.')}catch(e){alert('Copy not available on this device.')}};
$('#emailEnquiry').onclick=()=>{if(!enquiry.size)return alert('Add a product first.');const subject=encodeURIComponent('Product enquiry from Elevore360D Product Offers');const body=encodeURIComponent(enquiryText());location.href=`mailto:${encodeURIComponent(shopSettings.email||'')}?subject=${subject}&body=${body}`};
updateEnquiryCount();

// V5 single-business contact settings. Remote JSON wins when published; local editing stays private until exported.
const SHOP_KEY='e360-product-business-settings-v5';
let shopSettings={name:'Your Business',email:'',phone:'',address:'',logo:'elevore360d-logo.jpg'};
const shopFields={name:'shopName',email:'shopEmail',phone:'shopPhone',address:'shopAddress',logo:'shopLogo'};
function displayShop(){const title=document.getElementById('businessHeading');if(title)title.textContent=shopSettings.name||'Product Offers';for(const [k,id] of Object.entries(shopFields)){const el=document.getElementById(id);if(el)el.value=shopSettings[k]||''}}
async function loadShop(){try{const response=await fetch('business-settings.json',{cache:'no-store'});if(response.ok){shopSettings={...shopSettings,...await response.json()}}else throw Error('no settings')}catch(e){try{shopSettings={...shopSettings,...JSON.parse(localStorage.getItem(SHOP_KEY)||'{}')}}catch(e){}}displayShop()}
const settingsPage=document.getElementById('businessSettings');
document.getElementById('openBusinessSettings').onclick=()=>{document.getElementById('directory').hidden=true;document.getElementById('detail').hidden=true;document.getElementById('enquiryPage').hidden=true;settingsPage.hidden=false;displayShop();window.scrollTo(0,0)};
document.getElementById('settingsBack').onclick=()=>{settingsPage.hidden=true;back()};
document.getElementById('businessSettingsForm').onsubmit=e=>{e.preventDefault();for(const [k,id] of Object.entries(shopFields))shopSettings[k]=document.getElementById(id).value.trim();localStorage.setItem(SHOP_KEY,JSON.stringify(shopSettings));displayShop();alert('Saved on this device. Download and upload business-settings.json to publish these settings to customers.')};
document.getElementById('downloadSettings').onclick=()=>{for(const [k,id] of Object.entries(shopFields))shopSettings[k]=document.getElementById(id).value.trim();localStorage.setItem(SHOP_KEY,JSON.stringify(shopSettings));const blob=new Blob([JSON.stringify(shopSettings,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='business-settings.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
loadShop();
