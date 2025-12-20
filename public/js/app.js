// Frontend app: sliders, footprint calc, quests, leaderboard, badges, VR scene
const travel = document.getElementById('travel');
const food = document.getElementById('food');
const energy = document.getElementById('energy');
const travelVal = document.getElementById('travelVal');
const foodVal = document.getElementById('foodVal');
const energyVal = document.getElementById('energyVal');
const saveBtn = document.getElementById('saveHabits');
const footprintEl = document.getElementById('footprint');
const questList = document.getElementById('questList');
const leaderboardList = document.getElementById('leaderboardList');
const badgesEl = document.getElementById('badges');
const vrCanvas = document.getElementById('vrCanvas');

// --- persistence and UI helpers ---
function showToast(msg, timeout=2500){
	try{
		const t = document.createElement('div');
		t.className = 'px-4 py-2 bg-slate-900 text-white rounded shadow-lg mb-2 opacity-0 transform transition-all';
		t.style.transition = 'transform 300ms, opacity 300ms';
		t.textContent = msg;
		const container = document.getElementById('toast') || document.body;
		container.appendChild(t);
		// enter
		requestAnimationFrame(()=>{ t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
		setTimeout(()=>{ t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; setTimeout(()=>t.remove(),350); }, timeout);
	}catch(e){console.warn(e)}
}

function saveHabitsLocal(payload){
	try{ localStorage.setItem('ecoverse:habits', JSON.stringify(payload)); showToast('Habits saved locally'); }catch(e){console.error(e)}
}

function loadHabitsLocal(){
	try{
		const raw = localStorage.getItem('ecoverse:habits');
		if (!raw) return null;
		return JSON.parse(raw);
	}catch(e){ return null; }
}

function bindShortcuts(){
	window.addEventListener('keydown',(e)=>{
		if (e.key === ' ' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); calculateAndSave(); }
		if (e.key.toLowerCase() === 'v') document.getElementById('btnVR').click();
	});
}

travel.addEventListener('input', ()=> travelVal.textContent = travel.value);
food.addEventListener('input', ()=> foodVal.textContent = food.value);
energy.addEventListener('input', ()=> energyVal.textContent = energy.value);

async function calculateAndSave() {
	const payload = { travel: +travel.value, food: +food.value, energy: +energy.value };
	try {
		const res = await fetch('/api/calc', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
		const json = await res.json();
		const fp = (json.footprint||0).toFixed(2);
		footprintEl.textContent = fp;
		updateBadges(parseFloat(fp));
		updateScene(parseFloat(fp));
	} catch (e) { console.error(e); }
}

document.getElementById('ctaCalc').addEventListener('click', calculateAndSave);
saveBtn.addEventListener('click', ()=>{ const payload = { travel:+travel.value, food:+food.value, energy:+energy.value }; saveHabitsLocal(payload); calculateAndSave(); });

// bind quest search
const questSearch = document.getElementById('questSearch');
if (questSearch) questSearch.addEventListener('input', ()=>{ filterQuests(questSearch.value); });

bindShortcuts();

async function loadQuests() {
	try {
		const res = await fetch('/api/quests');
		const json = await res.json();
		questList.innerHTML = '';
		(json.quests||[]).forEach((q, i)=>{
			const div = document.createElement('div');
			div.className = 'quest-card card-enter card-temp';
			div.innerHTML = `<div class="mr-3"><strong class=\"block text-sm font-semibold\">${q.title}</strong><div class=\"text-sm text-slate-500\">${q.description}</div><div class=\"w-full bg-slate-100 h-2 rounded mt-2 overflow-hidden\"><div class=\"bg-emerald-500 h-2 rounded\" style=\"width:0%\" data-progress></div></div></div>`;
			const btn = document.createElement('button');
			btn.className = 'btn btn-accent small';
			btn.textContent = 'Start';
			btn.onclick = ()=> {
				const bar = div.querySelector('[data-progress]');
				animateProgress(bar, 25, ()=>{
					const p = parseInt(bar.style.width)||0;
					if (p >= 100) {
						btn.textContent = 'Complete'; btn.disabled = true; spawnBadgeEffect(div); postScore(q.reward || 10);
						const rect = div.getBoundingClientRect(); launchConfetti(rect.left + rect.width/2, rect.top + rect.height/2);
					}
				});
			};
			div.appendChild(btn);
			questList.appendChild(div);
			// entrance animation
			requestAnimationFrame(()=>{ div.classList.add('show'); div.classList.remove('card-temp'); });
		})
	} catch (e) { console.error(e); }
}

function filterQuests(term){
	term = (term||'').toLowerCase().trim();
	const items = Array.from(document.querySelectorAll('#questList > div'));
	items.forEach(item=>{
		const txt = item.innerText.toLowerCase();
		item.style.display = txt.includes(term) ? '' : 'none';
	});
}

function animateProgress(bar, amount, cb){
	const start = parseInt(bar.style.width)||0;
	const target = Math.min(100, start + amount);
	const step = ()=>{
		const cur = parseInt(bar.style.width)||0;
		if (cur < target){
			bar.style.width = (cur + 2) + '%';
			requestAnimationFrame(step);
		} else { if (cb) cb(); }
	};
	step();
}

function spawnBadgeEffect(anchor){
	addBadge('Quest Hero','Completed a quest');
	const pop = document.createElement('div');
	pop.className = 'absolute rounded-full bg-emerald-400/80 w-8 h-8 flex items-center justify-center text-white text-xs pointer-events-none';
	pop.style.transform = 'translate(-50%,-50%)';
	const rect = anchor.getBoundingClientRect();
	document.body.appendChild(pop);
	pop.style.left = (rect.left + rect.width/2) + 'px';
	pop.style.top = (rect.top + rect.height/2) + 'px';
	pop.animate([{ transform: 'translate(-50%,-50%) scale(0.6)', opacity:1 }, { transform: 'translate(-50%,-180%) scale(1.6)', opacity:0 }], { duration:900, easing:'cubic-bezier(.2,.9,.3,1)' });
	setTimeout(()=>pop.remove(), 1000);
}

// Confetti small effect
function launchConfetti(x, y, count=18){
	const container = document.createElement('div');
	container.className = 'confetti';
	document.body.appendChild(container);
	for(let i=0;i<count;i++){
		const el = document.createElement('div');
		el.className = 'confetti';
		const w = 6 + Math.random()*8; el.style.width = w+'px'; el.style.height = (8 + Math.random()*8)+'px';
		el.style.left = (x + (Math.random()-0.5)*60)+'px';
		el.style.top = (y + (Math.random()-0.5)*10)+'px';
		el.style.background = ['#10b981','#06b6d4','#f59e0b','#ef4444'][Math.floor(Math.random()*4)];
		el.style.position = 'absolute';
		el.style.borderRadius = '2px';
		el.style.opacity = '0.95';
		el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
		el.style.transition = `transform ${1000 + Math.random()*800}ms cubic-bezier(.2,.9,.3,1), opacity 900ms`;
		container.appendChild(el);
		// fall
		requestAnimationFrame(()=>{
			el.style.transform = `translateY(${140 + Math.random()*160}px) rotate(${Math.random()*720}deg)`;
			el.style.opacity = '0';
		});
	}
	setTimeout(()=>container.remove(), 2200);
}

// --- leaderboard persistence ---
function ensureUsername(){
	try{
	// prefer username from auth token if present
	const token = localStorage.getItem('ecoverse:token');
	if (token){ try{ const p = JSON.parse(atob(token.split('.')[1])); if (p && p.username) return p.username; }catch(e){}
	}
	let u = localStorage.getItem('ecoverse:username');
	if (!u){ u = prompt('Pick a display name for leaderboard (optional):','Player'); if (!u) u = 'Anon'; localStorage.setItem('ecoverse:username', u); }
	return u;
	}catch(e){ return 'Anon'; }
}

async function postScore(points){
	try{
		const token = localStorage.getItem('ecoverse:token');
		const headers = {'Content-Type':'application/json'};
		if (token) headers['Authorization'] = 'Bearer ' + token;
		const res = await fetch('/api/leaderboard', { method:'POST', headers, body: JSON.stringify({ points }) });
		const json = await res.json();
		if (json.ok){ showToast(`+${points} pts submitted`); loadLeaderboard(); }
		else {
			if (json.error === 'missing token' || json.error === 'invalid token') showToast('Please sign in to submit scores');
			else showToast('Score submission failed');
		}
	}catch(e){ showToast('Score submission error'); console.error(e); }
}

async function loadLeaderboard() {
	try {
		const res = await fetch('/api/leaderboard');
		const json = await res.json();
		leaderboardList.innerHTML = '';
		const rows = (json.leaderboard||[]);
		const maxPoints = rows.length ? Math.max(...rows.map(x=>x.points||0)) : 1;
		rows.forEach((r,i)=>{
			const pct = Math.round(((r.points||0) / Math.max(1, maxPoints)) * 100);
			const d = document.createElement('div');
			d.className = 'p-3 border rounded flex items-center gap-3 bg-white hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer';

			// rank badge
			const badge = document.createElement('div');
			badge.className = 'w-10 text-center';
			const medal = i===0? '🥇' : i===1? '🥈' : i===2? '🥉' : `<div class="text-sm text-slate-500">${i+1}</div>`;
			badge.innerHTML = `<div class=\"text-xl\">${medal}</div>`;

			// avatar (initials)
			const avatar = document.createElement('div');
			avatar.className = 'avatar sparkle';
			const uname = (r.user && r.user.username) ? r.user.username : 'Anon';
			const initials = uname.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
			avatar.textContent = initials;
			// color from hash
			(function setAvatarColor(el, name){
				let h=0; for(let c of name) h = (h<<5)-h + c.charCodeAt(0);
				const hue = Math.abs(h) % 360; el.style.background = `linear-gradient(135deg,hsl(${hue} 60% 40%), hsl(${(hue+40)%360} 60% 45%))`;
			})(avatar, uname);

			// main info
			const info = document.createElement('div');
			info.className = 'flex-1 min-w-0';
			const name = document.createElement('div');
			name.className = 'font-semibold truncate';
			name.textContent = r.user?.username || 'Anon';
			const meta = document.createElement('div');
			meta.className = 'text-sm text-slate-500';
			meta.textContent = `${r.points} pts`;

			// spark bar
			const sparkWrap = document.createElement('div');
			sparkWrap.className = 'w-28 h-2 bg-slate-100 rounded overflow-hidden mt-1';
			const spark = document.createElement('div');
			spark.className = 'h-2 bg-emerald-500 rounded';
			spark.style.width = pct + '%';
			sparkWrap.appendChild(spark);

			info.appendChild(name);
			info.appendChild(meta);
			info.appendChild(sparkWrap);

			// actions
			const actions = document.createElement('div');
			actions.className = 'text-sm text-slate-700 text-right';
			actions.innerHTML = `<div class=\"font-medium\">${r.points}</div>`;

			d.appendChild(badge);
			d.appendChild(avatar);
			d.appendChild(info);
			d.appendChild(actions);

			d.addEventListener('click', ()=>{
				navigator.clipboard?.writeText(r.user?.username||'Anon').then(()=> showToast('Copied username to clipboard'));
			});

			leaderboardList.appendChild(d);
		});
		if ((json.leaderboard||[]).length===0) leaderboardList.innerHTML = '<div class="text-sm text-slate-500">No leaderboard data yet — be the first!</div>';
	} catch (e) { console.error(e); }
}

function updateBadges(footprint){
	badgesEl.innerHTML = '';
	if (footprint <= 10) addBadge('Carbon Saver','Used very low emissions');
	if (footprint <= 30) addBadge('Green Starter','Lowered footprint');
	if (footprint > 50) addBadge('Climate Alert','High footprint — take action');
}

function addBadge(name,desc){
	const b = document.createElement('div');
	b.className = 'badge-pill badge-anim';
	b.title = desc;
	b.textContent = name;
	b.style.marginLeft = '6px';
	b.animate([{ transform: 'translateY(6px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1)' });
	badgesEl.appendChild(b);
}

// === Three.js scene showing pollution level ===
let scene, camera, renderer, ground, water, smokeParticles=[], leavesParticles=[];
let _animTheta = 0;
function initScene(){
	renderer = new THREE.WebGLRenderer({ canvas: vrCanvas, antialias:true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio || 1);
	renderer.setSize(vrCanvas.clientWidth, vrCanvas.clientHeight, false);
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xbfeef4);
	camera = new THREE.PerspectiveCamera(55, vrCanvas.clientWidth/vrCanvas.clientHeight, 0.1, 1000);
	camera.position.set(0,2.2,4);

	// lights
	const hemi = new THREE.HemisphereLight(0xffffee, 0x080820, 0.8); scene.add(hemi);
	const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,10,7); dir.castShadow = false; scene.add(dir);

	// ground
	const geo = new THREE.PlaneGeometry(8,8);
	ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:0x2d6a4f, roughness:0.9, metalness:0 }));
	ground.rotation.x = -Math.PI/2; ground.position.y = -0.5; scene.add(ground);

	// subtle water plane (hidden by default)
	water = null;

	// particle groups
	smokeParticles = [];
	leavesParticles = [];

	animate();
}

function updateScene(fp){
	if (!scene) initScene();
	const intensity = Math.min(1, fp/60);

	// change ground color from green => brownish depending on intensity
	const healthy = new THREE.Color(0x2d6a4f);
	const sick = new THREE.Color(0x7a4b2a);
	ground.material.color = healthy.clone().lerp(sick, intensity*0.9);

	// water appears when intense (simulating floods)
	if (!water && intensity>0.35){
		const wgeo = new THREE.CircleGeometry(2.8, 64);
		const wmat = new THREE.MeshStandardMaterial({ color:0x2aa6ff, transparent:true, opacity:0.15, roughness:0.8 });
		water = new THREE.Mesh(wgeo, wmat); water.rotation.x = -Math.PI/2; water.position.y = -0.49; scene.add(water);
	}
	if (water) water.material.opacity = Math.max(0.02, Math.min(0.9, (intensity-0.35)*1.6));

	// leaves particles when low footprint
	const targetLeaves = Math.round((1 - intensity) * 30);
	while (leavesParticles.length < targetLeaves) createLeaf();
	while (leavesParticles.length > targetLeaves) { const s = leavesParticles.pop(); scene.remove(s.mesh); }

	// smoke particles for high footprint
	const targetSmoke = Math.round(intensity*40);
	while (smokeParticles.length < targetSmoke) createSmoke();
	while (smokeParticles.length > targetSmoke) { const s = smokeParticles.pop(); scene.remove(s.mesh); }
}

function createSmoke(){
	const geom = new THREE.PlaneGeometry(0.3,0.3);
	const mat = new THREE.MeshBasicMaterial({ color:0x444444, transparent:true, opacity:0.5, side:THREE.DoubleSide });
	const mesh = new THREE.Mesh(geom, mat); mesh.position.set((Math.random()-0.5)*3, Math.random()*1+0.2, (Math.random()-0.5)*3); mesh.rotation.y = Math.random()*Math.PI;
	scene.add(mesh); smokeParticles.push({mesh,vel:0.005+Math.random()*0.01});
}

function createLeaf(){
	const geom = new THREE.CircleGeometry(0.08, 6);
	const mat = new THREE.MeshBasicMaterial({ color:0x6fbf73, transparent:true, opacity:0.95, side:THREE.DoubleSide });
	const mesh = new THREE.Mesh(geom, mat);
	mesh.position.set((Math.random()-0.5)*3, -0.2 + Math.random()*0.5, (Math.random()-0.5)*3);
	mesh.rotation.z = Math.random()*Math.PI;
	scene.add(mesh);
	leavesParticles.push({mesh,vel:0.002+Math.random()*0.004, rot: (Math.random()-0.5)*0.02});
}

function animate(){
	requestAnimationFrame(animate);
	_animTheta += 0.002;
	// orbit camera slowly
	if (camera){
		const r = 4.0;
		camera.position.x = Math.cos(_animTheta) * r;
		camera.position.z = Math.sin(_animTheta) * r;
		camera.lookAt(0,0.8,0);
	}
	smokeParticles.forEach(s=>{ s.mesh.position.y += s.vel; s.mesh.material.opacity *= 0.997; if (s.mesh.position.y>3){ s.mesh.position.y = -0.2; s.mesh.material.opacity = 0.5; } });
	leavesParticles.forEach(l=>{ l.mesh.position.y -= l.vel; l.mesh.rotation.z += l.rot; if (l.mesh.position.y < -0.6){ l.mesh.position.y = 1.2 + Math.random()*0.2; } });
	renderer.render(scene,camera);
}

// Parallax for decorative SVG groups and subtle canvas tilt
;(function bindParallax(){
	const svg = document.querySelector('.decor-svg');
	if (!svg) return;
	window.addEventListener('mousemove', (ev)=>{
		const w = window.innerWidth, h = window.innerHeight;
		const nx = (ev.clientX / w - 0.5) * 2; // -1..1
		const ny = (ev.clientY / h - 0.5) * 2;
		// move float groups
		svg.querySelectorAll('.float-group').forEach((g, i)=>{
			const depth = (i+1) * 6; // parallax multiplier
			g.style.transform = `translate(${nx*depth}px, ${ny*depth}px)`;
		});
		// tilt canvas slightly
		if (vrCanvas) vrCanvas.style.transform = `rotateX(${ny*3}deg) rotateY(${nx*3}deg)`;
	});
})();

document.getElementById('btnVR').addEventListener('click', ()=> alert('WebXR placeholder: use a compatible device to enter VR.'));

window.addEventListener('resize', ()=>{ if (renderer) renderer.setSize(vrCanvas.clientWidth, vrCanvas.clientHeight, false); });

// Init
const _saved = loadHabitsLocal(); if (_saved){ travel.value=_saved.travel||0; food.value=_saved.food||0; energy.value=_saved.energy||0; travelVal.textContent = travel.value; foodVal.textContent = food.value; energyVal.textContent = energy.value; }
loadQuests(); loadLeaderboard(); initScene();

// --- Auth UI & logic ---
const btnAuth = document.getElementById('btnAuth');
const authModal = document.getElementById('authModal');
const authUser = document.getElementById('authUser');
const authPass = document.getElementById('authPass');
const authLogin = document.getElementById('authLogin');
const authRegister = document.getElementById('authRegister');
const authClose = document.getElementById('authClose');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const authError = document.getElementById('authError');
const btnLogout = document.getElementById('btnLogout');

let authMode = 'login';

function showAuthMode(mode){
	authMode = mode || 'login';
	if (authMode === 'login'){
		tabLogin.classList.add('btn-accent'); tabLogin.classList.remove('btn-ghost');
		tabRegister.classList.remove('btn-accent'); tabRegister.classList.add('btn-ghost');
		authLogin.classList.remove('hidden'); authRegister.classList.add('hidden');
		authError.classList.add('hidden'); authError.textContent = '';
	} else {
		tabRegister.classList.add('btn-accent'); tabRegister.classList.remove('btn-ghost');
		tabLogin.classList.remove('btn-accent'); tabLogin.classList.add('btn-ghost');
		authRegister.classList.remove('hidden'); authLogin.classList.add('hidden');
		authError.classList.add('hidden'); authError.textContent = '';
	}
}


function setAuthState(){
	const token = localStorage.getItem('ecoverse:token');
	if (token){ try{ const p = JSON.parse(atob(token.split('.')[1])); btnAuth.textContent = p.username || 'Account'; btnAuth.classList.remove('bg-white'); btnAuth.classList.add('bg-emerald-600','text-white'); return; }catch(e){}
	}
	btnAuth.textContent = 'Log in'; btnAuth.classList.remove('bg-emerald-600','text-white'); btnAuth.classList.add('bg-white','text-slate-800');
}

btnAuth.addEventListener('click', ()=>{ authModal.classList.remove('hidden'); authModal.classList.add('flex'); authUser.focus(); authUser.select(); });
authClose.addEventListener('click', ()=>{ authModal.classList.add('hidden'); authModal.classList.remove('flex'); });

tabLogin.addEventListener('click', ()=> showAuthMode('login'));
tabRegister.addEventListener('click', ()=> showAuthMode('register'));

authRegister.addEventListener('click', async ()=>{
	const u = authUser.value.trim(); const p = authPass.value.trim();
	if (!u || !p) { authError.textContent = 'Enter username and password'; authError.classList.remove('hidden'); return; }
	try{
		authRegister.classList.add('btn-loading');
		const res = await fetch('/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username: u, password: p }) });
		const json = await res.json();
		authRegister.classList.remove('btn-loading');
		if (json.ok && json.token){ localStorage.setItem('ecoverse:token', json.token); localStorage.setItem('ecoverse:username', json.user?.username||u); setAuthState(); showToast('Registered and signed in'); authModal.classList.add('hidden'); } else { authError.textContent = json.error || 'Register failed'; authError.classList.remove('hidden'); }
	}catch(e){ authRegister.classList.remove('btn-loading'); authError.textContent = 'Register error'; authError.classList.remove('hidden'); console.error(e); }
});

authLogin.addEventListener('click', async ()=>{
	const u = authUser.value.trim(); const p = authPass.value.trim();
	if (!u || !p) { authError.textContent = 'Enter username and password'; authError.classList.remove('hidden'); return; }
	try{
		authLogin.classList.add('btn-loading');
		const res = await fetch('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username: u, password: p }) });
		const json = await res.json();
		authLogin.classList.remove('btn-loading');
		if (json.ok && json.token){ localStorage.setItem('ecoverse:token', json.token); localStorage.setItem('ecoverse:username', json.user?.username||u); setAuthState(); showToast('Signed in'); authModal.classList.add('hidden'); } else { authError.textContent = json.error || 'Sign in failed'; authError.classList.remove('hidden'); }
	}catch(e){ authLogin.classList.remove('btn-loading'); authError.textContent = 'Sign in error'; authError.classList.remove('hidden'); console.error(e); }
});

// Enter submits form
authModal.addEventListener('keydown', (ev)=>{
	if (ev.key === 'Enter'){
		ev.preventDefault();
		if (authMode === 'login') authLogin.click(); else authRegister.click();
	}
});

btnLogout.addEventListener('click', ()=>{
	localStorage.removeItem('ecoverse:token'); localStorage.removeItem('ecoverse:username'); setAuthState(); showToast('Signed out');
});

// shortcut: show auth state on load
setAuthMode = showAuthMode; // expose briefly
setAuthMode('login');
setTimeout(setAuthState, 200);

