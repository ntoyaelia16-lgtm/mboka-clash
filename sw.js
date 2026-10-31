// GROUPES + AUDIO MIX WHATSAPP/MESSENGER/INSTA/TIKTOK
let groups = JSON.parse(localStorage.getItem('mboka_groups')||'[{"id":1,"name":"👑 Rois de Gombe","members":127,"last":"Aïcha: Cest trop bien le live! 🎙️","img":1},{"id":2,"name":"🕶️ Sapeurs Kin","members":89,"last":"Crims: Nouveau drop sapé 🔥","img":2},{"id":3,"name":"💎 Vote Diamant","members":45,"last":"Toi: 🎙️ audio 0:12","img":3}]');
let currentGroup = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

function openGroups(){
  closeAll();
  document.getElementById('mGroups').classList.add('on');
  renderGroups();
}

function renderGroups(){
  document.getElementById('groupsList').innerHTML = groups.map(g=>`
    <div style="display:flex;gap:12px;padding:14px;border-bottom:1px solid rgba(0,0,0,0.06);align-items:center" onclick="openChat(${g.id})">
      <div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#FFE55C);display:flex;align-items:center;justify-content:center;font-weight:800">${g.name.slice(0,2)}</div>
      <div style="flex:1"><b style="font-size:14px">${g.name}</b><br><small style="color:rgba(0,0,0,0.5)">${g.last}</small></div>
      <div style="text-align:right"><small style="color:rgba(0,0,0,0.4)">${g.members} membres</small><br><span style="background:var(--gold);color:#000;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:800">Nouveau</span></div>
    </div>
  `).join('');
}

function openChat(id){
  currentGroup = groups.find(g=>g.id==id);
  document.getElementById('chatGroupName').innerText = currentGroup.name;
  document.getElementById('mGroups').classList.remove('on');
  document.getElementById('mChat').classList.add('on');
  let msgs = JSON.parse(localStorage.getItem('mboka_chat_'+id)||'[]');
  renderChatMessages(msgs);
}

function renderChatMessages(msgs){
  let box = document.getElementById('chatMessages');
  box.innerHTML = msgs.map(m=>{
    if(m.type=='audio'){
      return `<div class="msg-bubble ${m.me?'me':'other'}"><div style="display:flex;align-items:center;gap:10px"><button onclick="playAudio('${m.data}')" style="width:32px;height:32px;border-radius:50%;background:${m.me?'#000':'var(--gold)'};color:${m.me?'var(--gold)':'#000'};border:none">▶️</button><div class="audio-wave">${'<div class="audio-bar"></div>'.repeat(12)}</div><small>0:${m.duration}</small></div><small style="opacity:0.6">${m.time}</small></div>`;
    }
    return `<div class="msg-bubble ${m.me?'me':'other'}">${m.text}<br><small style="opacity:0.6">${m.time} ${m.me?'✓✓':''}</small></div>`;
  }).join('') || '<div style="text-align:center;color:rgba(0,0,0,0.4);margin-top:40px">👑 Début du Royaume<br>Envoie un vocal! 🎙️</div>';
  box.scrollTop = box.scrollHeight;
}

function sendGroupMessage(){
  let input = document.getElementById('chatInput');
  let txt = input.value.trim();
  if(!txt) return;
  let msgs = JSON.parse(localStorage.getItem('mboka_chat_'+currentGroup.id)||'[]');
  msgs.push({text:txt, me:true, time:new Date().toLocaleTimeString().slice(0,5)});
  localStorage.setItem('mboka_chat_'+currentGroup.id, JSON.stringify(msgs));
  currentGroup.last = 'Toi: '+txt.slice(0,30);
  renderChatMessages(msgs);
  input.value='';
  // Simule réponse
  setTimeout(()=>{msgs.push({text:'🔥 Reçu Roi! '+['Yes!','Top!','Validé 👑'][Math.floor(Math.random()*3)], me:false, time:new Date().toLocaleTimeString().slice(0,5)}); localStorage.setItem('mboka_chat_'+currentGroup.id, JSON.stringify(msgs)); renderChatMessages(msgs);},1000);
}

async function startAudioComment(){
  let btn = document.getElementById('audioBtn');
  if(!isRecording){
    try{
      let stream = await navigator.mediaDevices.getUserMedia({audio:true});
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e=>audioChunks.push(e.data);
      mediaRecorder.onstop = async ()=>{
        let blob = new Blob(audioChunks, {type:'audio/webm'});
        let reader = new FileReader();
        reader.onload = ()=>{
          let msgs = JSON.parse(localStorage.getItem('mboka_chat_'+currentGroup.id)||'[]');
          msgs.push({type:'audio', data:reader.result, duration:'12', me:true, time:new Date().toLocaleTimeString().slice(0,5)});
          localStorage.setItem('mboka_chat_'+currentGroup.id, JSON.stringify(msgs));
          renderChatMessages(msgs);
          currentGroup.last = 'Toi: 🎙️ audio 0:12';
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      isRecording = true;
      btn.innerHTML = '⏹️'; btn.style.background='#FF0033'; btn.style.animation='pulse 1s infinite';
      // Stop après 30s max
      setTimeout(()=>{if(isRecording) stopAudioComment();},30000);
    }catch(e){ alert('Micro refusé! Autorise le micro dans Chrome!'); }
  }else{
    stopAudioComment();
  }
}

function stopAudioComment(){
  if(mediaRecorder && isRecording){
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t=>t.stop());
    isRecording=false;
    let btn=document.getElementById('audioBtn');
    btn.innerHTML='🎙️'; btn.style.background='linear-gradient(135deg,#FFD700,#FFE55C)'; btn.style.animation='';
  }
}

function playAudio(data){
  let audio = new Audio(data);
  audio.play();
}

function createGroup(){
  let name = prompt('Nom du groupe? Ex: Rois de Bandal');
  if(!name) return;
  groups.unshift({id:Date.now(), name:name, members:1, last:'Groupe créé 👑', img:groups.length+1});
  localStorage.setItem('mboka_groups', JSON.stringify(groups));
  renderGroups();
}

// Ajoute bouton Groupes dans bottom nav
document.querySelector('.bottom').innerHTML = `
  <div class="nav on"><b>👑</b>Accueil</div>
  <div class="nav" onclick="openLive()"><b>●</b>Live</div>
  <div class="nav" onclick="openGroups()"><b>💬</b>Groupes</div>
  <div class="nav" onclick="openSettings()"><b>⚙</b>Param</div>
`;
