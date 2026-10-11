let deferredInstallPrompt=null;
const bar=document.getElementById('installBar');
const btn=document.getElementById('installBtn');
const closeBtn=document.getElementById('installClose');

function isInstalled(){
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches ||
         window.navigator.standalone === true ||
         document.referrer.startsWith('android-app://');
}
function hideInstall(){
  if(bar){bar.hidden=true;bar.style.display='none';}
}
function showInstall(){
  if(bar && !isInstalled()){
    bar.hidden=false;
    bar.style.display='flex';
  }
}
if(isInstalled()) hideInstall();

window.addEventListener('DOMContentLoaded',()=>{
  if(isInstalled()) hideInstall();
  else hideInstall(); // stay hidden until browser confirms installability
});
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  if(!isInstalled()) showInstall();
});
btn?.addEventListener('click',async()=>{
  if(!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;
  hideInstall();
});
closeBtn?.addEventListener('click',hideInstall);
window.addEventListener('appinstalled',()=>{
  deferredInstallPrompt=null;
  hideInstall();
});
