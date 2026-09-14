'use strict';

const gallery=document.getElementById('slideGallery');
const player=document.getElementById('slidePlayer');
const playerImage=document.getElementById('playerImage');
const playerTitle=document.getElementById('playerTitle');
const playerCount=document.getElementById('playerCount');
let decks=[],activeDeck=null,slideIndex=0,playTimer=0,pointerStart=0;

function updatePlayer(){
 if(!activeDeck)return;
 const slide=activeDeck.slides[slideIndex];
 playerImage.src=slide.src;
 playerImage.alt=slide.alt;
 playerTitle.textContent=activeDeck.title;
 playerCount.textContent=`${slideIndex+1} / ${activeDeck.slides.length}`;
 document.getElementById('prevSlide').disabled=slideIndex===0;
 document.getElementById('nextSlide').disabled=slideIndex===activeDeck.slides.length-1;
 history.replaceState(null,'',`#${activeDeck.id}/${slideIndex+1}`);
 const next=activeDeck.slides[slideIndex+1];
 if(next){const preload=new Image();preload.src=next.src;}
}
function step(delta){if(!activeDeck)return;slideIndex=Math.max(0,Math.min(activeDeck.slides.length-1,slideIndex+delta));updatePlayer();}
function stopPlay(){clearInterval(playTimer);playTimer=0;document.getElementById('togglePlay').textContent='▶';document.getElementById('togglePlay').setAttribute('aria-label','Tự động trình chiếu');}
function togglePlay(){
 if(playTimer){stopPlay();return;}
 document.getElementById('togglePlay').textContent='Ⅱ';
 document.getElementById('togglePlay').setAttribute('aria-label','Dừng tự động trình chiếu');
 playTimer=setInterval(()=>{if(slideIndex>=activeDeck.slides.length-1){stopPlay();return;}step(1);},7000);
}
function openDeck(deck,start=0){activeDeck=deck;slideIndex=Math.max(0,Math.min(deck.slides.length-1,start));player.showModal();document.body.style.overflow='hidden';updatePlayer();document.getElementById('nextSlide').focus();}
function closePlayer(){stopPlay();player.close();document.body.style.overflow='';activeDeck=null;history.replaceState(null,'',location.pathname);}
function card(deck){
 const button=document.createElement('button');button.type='button';button.className='deck-card';button.setAttribute('aria-label',`Trình chiếu ${deck.title}`);
 const cover=document.createElement('div');cover.className='deck-cover';
 const image=document.createElement('img');image.src=deck.cover;image.alt='';image.loading='lazy';
 const play=document.createElement('div');play.className='deck-play';play.innerHTML='<span aria-hidden="true">▶</span>';
 const copy=document.createElement('div');copy.className='deck-copy';
 const title=document.createElement('h2');title.textContent=deck.title;
 const description=document.createElement('p');description.textContent=deck.description;
 const meta=document.createElement('div');meta.className='deck-meta';
 const author=document.createElement('span');author.textContent=deck.author;
 const count=document.createElement('span');count.textContent=`${deck.slides.length} slides`;
 meta.append(author,count);copy.append(title,description,meta);cover.append(image,play);button.append(cover,copy);button.onclick=()=>openDeck(deck);return button;
}
async function loadGallery(){
 try{
  const response=await fetch('./catalog.json',{cache:'no-store'});if(!response.ok)throw Error();
  decks=(await response.json()).decks||[];gallery.replaceChildren(...decks.map(card));
  document.getElementById('deckCount').textContent=`${decks.length} bộ slide`;
  const match=location.hash.match(/^#([^/]+)(?:\/(\d+))?/);if(match){const deck=decks.find(item=>item.id===match[1]);if(deck)openDeck(deck,Math.max(0,Number(match[2]||1)-1));}
 }catch{gallery.innerHTML='<p class="empty">Chưa thể tải thư viện slide. Vui lòng thử lại.</p>';document.getElementById('deckCount').textContent='0 bộ slide';}
}
document.getElementById('closePlayer').onclick=closePlayer;
document.getElementById('prevSlide').onclick=()=>step(-1);
document.getElementById('nextSlide').onclick=()=>step(1);
document.getElementById('stagePrev').onclick=()=>step(-1);
document.getElementById('stageNext').onclick=()=>step(1);
document.getElementById('togglePlay').onclick=togglePlay;
document.getElementById('fullScreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():player.requestFullscreen?.();
document.getElementById('playerStage').onpointerdown=event=>{pointerStart=event.clientX;};
document.getElementById('playerStage').onpointerup=event=>{const distance=event.clientX-pointerStart;if(Math.abs(distance)>60)step(distance<0?1:-1);};
player.addEventListener('cancel',event=>{event.preventDefault();closePlayer();});
document.addEventListener('keydown',event=>{if(!player.open)return;if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();step(1);}if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();step(-1);}if(event.key==='Escape'){event.preventDefault();closePlayer();}});
loadGallery();
