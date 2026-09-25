const CONFIG = globalThis.YAHTZEE_FIREBASE_CONFIG;
const channels = new Map();

class LocalRooms {
  async create(room){ localStorage.setItem(`gasf-room-${room.code}`,JSON.stringify(room)); return room; }
  async get(code){ const x=localStorage.getItem(`gasf-room-${code}`); return x?JSON.parse(x):null; }
  async save(room){ localStorage.setItem(`gasf-room-${room.code}`,JSON.stringify(room)); channels.get(room.code)?.postMessage(room); window.dispatchEvent(new StorageEvent('storage',{key:`gasf-room-${room.code}`,newValue:JSON.stringify(room)})); }
  subscribe(code,cb){ const ch=new BroadcastChannel(`gasf-room-${code}`); channels.set(code,ch); ch.onmessage=e=>cb(e.data); const h=e=>{if(e.key===`gasf-room-${code}`&&e.newValue)cb(JSON.parse(e.newValue))}; window.addEventListener('storage',h); return()=>{ch.close();window.removeEventListener('storage',h)}; }
}

class FirebaseRooms {
  constructor(){this.ready=this.init()}
  async init(){const app=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');const db=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');this.dbapi=db;this.db=db.getDatabase(app.initializeApp(CONFIG));}
  async create(room){await this.ready;await this.dbapi.set(this.dbapi.ref(this.db,`rooms/${room.code}`),room);return room}
  async get(code){await this.ready;const s=await this.dbapi.get(this.dbapi.ref(this.db,`rooms/${code}`));return s.exists()?s.val():null}
  async save(room){await this.ready;await this.dbapi.set(this.dbapi.ref(this.db,`rooms/${room.code}`),room)}
  subscribe(code,cb){let off=()=>{};this.ready.then(()=>{off=this.dbapi.onValue(this.dbapi.ref(this.db,`rooms/${code}`),s=>s.exists()&&cb(s.val()))});return()=>off()}
}

export const rooms = CONFIG ? new FirebaseRooms() : new LocalRooms();
export const mode = CONFIG ? 'online' : 'local demo';
