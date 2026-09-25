// PeerJS brokers the introduction; game state then travels browser-to-browser.
class PeerRooms {
  constructor(){this.peer=null;this.connection=null;this.connections=new Set();this.listeners=new Set();this.current=null;this.isHost=false}
  peerId(code){return `generic-asf-yahtzee-${code.toLowerCase()}`}
  openPeer(id){return new Promise((resolve,reject)=>{if(!window.Peer)return reject(new Error('multiplayer library unavailable'));const peer=new window.Peer(id,{debug:0});const timer=setTimeout(()=>reject(new Error('connection timed out')),10000);peer.once('open',()=>{clearTimeout(timer);resolve(peer)});peer.once('error',err=>{clearTimeout(timer);reject(err)})})}
  async create(room){this.destroy();this.isHost=true;this.current=room;this.peer=await this.openPeer(this.peerId(room.code));this.peer.on('connection',conn=>this.accept(conn));return room}
  accept(conn){this.connections.add(conn);conn.on('open',()=>conn.send({type:'state',room:this.current}));conn.on('data',message=>{if(message?.type!=='update'||!message.room)return;this.current=message.room;this.emit(this.current);this.broadcast(this.current,conn)});conn.on('close',()=>this.connections.delete(conn))}
  async get(code){this.destroy();this.peer=await this.openPeer();const conn=this.peer.connect(this.peerId(code),{reliable:true});this.connection=conn;return new Promise((resolve,reject)=>{let settled=false;const fail=()=>{if(!settled){settled=true;reject(new Error('room not found'))}};const timer=setTimeout(fail,9000);this.peer.once('error',fail);conn.once('error',fail);conn.on('data',message=>{if(message?.type!=='state'||!message.room)return;this.current=message.room;this.emit(this.current);if(!settled){settled=true;clearTimeout(timer);resolve(this.current)}});conn.on('close',()=>window.dispatchEvent(new CustomEvent('room-connection',{detail:{connected:false}})))})}
  async save(room){this.current=room;if(this.isHost){this.broadcast(room);return}if(!this.connection?.open)throw new Error('connection lost');this.connection.send({type:'update',room})}
  broadcast(room,except=null){for(const conn of this.connections)if(conn!==except&&conn.open)conn.send({type:'state',room})}
  subscribe(code,callback){this.listeners.add(callback);return()=>this.listeners.delete(callback)}
  emit(room){for(const listener of this.listeners)listener(room)}
  destroy(){this.connection?.close();for(const conn of this.connections)conn.close();this.connections.clear();this.peer?.destroy();this.peer=null;this.connection=null;this.current=null;this.isHost=false}
}
export const rooms=new PeerRooms();
export const mode='online';
