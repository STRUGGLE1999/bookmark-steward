import {sortNewBookmark,undoAutoBookmark} from './autosort.js';
import {classifyNewAI} from './ai.js';
import {saveSmart,undoSmart} from './smart.js';
const smartCreated=new Set();
let queue=Promise.resolve(),importing=false,paused=false;
chrome.bookmarks.onImportBegan.addListener(()=>{importing=true;});
chrome.bookmarks.onImportEnded.addListener(()=>{importing=false;});
async function log(record){const {autoHistory=[]}=await chrome.storage.local.get('autoHistory');await chrome.storage.local.set({autoHistory:[record,...autoHistory].slice(0,20)});}
chrome.bookmarks.onCreated.addListener((id,node)=>{
 if(!node.url||importing||paused)return;
 queue=queue.then(async()=>{const {autoConfig}=await chrome.storage.local.get('autoConfig');if(!autoConfig?.enabled||paused)return;const {recovery}=await chrome.storage.local.get('recovery');if(['applying','interrupted','undoing'].includes(recovery?.status))return;
 await new Promise(resolve=>setTimeout(resolve,1200));if(smartCreated.delete(id)||paused)return;let settings=(await chrome.storage.session.get('autoAI')).autoAI;
 try{const r=await sortNewBookmark(chrome.bookmarks,id,autoConfig,autoConfig.engine==='ai'?async(row,paths)=>{if(!settings)throw Error('AI会话已过期');return classifyNewAI(row,paths,settings);}:null,()=>smartCreated.has(id));smartCreated.delete(id);if(r)await log(r);}catch(e){await log({id,title:node.title,time:Date.now(),error:'未能归类，书签保留在原位置：'+e.message});}
 }).catch(()=>{});
});
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
 if(sender.id!==chrome.runtime.id)return;
 if(message.type==='SAVE_SMART'){(async()=>{try{const record=await saveSmart(chrome.bookmarks,message.data,id=>smartCreated.add(id));sendResponse({record});}catch(e){sendResponse({error:e.message});}})();return true;}
 if(message.type==='UNDO_SMART'){undoSmart(chrome.bookmarks,message.record).then(()=>sendResponse({ok:true}),e=>sendResponse({error:e.message}));return true;}
 if(message.type==='PAUSE_AUTO'){paused=true;chrome.storage.local.get('autoConfig').then(async({autoConfig})=>{if(autoConfig)await chrome.storage.local.set({autoConfig:{...autoConfig,enabled:false}});await queue;sendResponse({ok:true});});return true;}
 if(message.type==='RESUME_AUTO'){paused=false;sendResponse({ok:true});}
 if(message.type==='UNDO_AUTO'){queue=queue.then(async()=>{try{const {autoHistory=[]}=await chrome.storage.local.get('autoHistory');const r=autoHistory.find(x=>!x.error&&!x.undone);if(!r)throw Error('没有可撤销的自动归类');await undoAutoBookmark(chrome.bookmarks,r);r.undone=true;await chrome.storage.local.set({autoHistory});sendResponse({ok:true});}catch(e){sendResponse({error:e.message});}});return true;}
});
