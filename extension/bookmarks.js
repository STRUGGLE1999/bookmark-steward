import {flatten,validatePlan} from './core.js';
export const fingerprint = root => JSON.stringify(root, (k,v)=>['dateGroupModified','dateLastUsed'].includes(k)?undefined:v);
// Original folders are archived intact so folder IDs and full rollback remain available.
async function applyUnlocked(api,storage,rootId,archiveParentId,expected,rows,plan){
 validatePlan(rows,plan);if(await storage.get())throw Error('已有一次整理备份，请先撤销上次整理');const root=(await api.getSubTree(rootId))[0];if(fingerprint(root)!==expected)throw Error('书签已发生变化，请重新读取并生成方案');
 const state={rootId,archiveParentId,original:structuredClone(root),created:[],status:'applying',createdAt:Date.now()};await storage.set(state);
 const save=()=>storage.set(state);const folders=new Map();
 try{for(const p of plan){let parentId=rootId,key='';for(const part of p.destination){key+='/'+part;if(!folders.has(key)){const n=await api.create({parentId,title:part});state.created.push(n.id);await save();folders.set(key,n.id);}parentId=folders.get(key);}await api.move(p.id,{parentId});}
 const archive=await api.create({parentId:archiveParentId,title:`书签归位·旧目录 ${new Date(state.createdAt).toLocaleString()}`});state.archiveId=archive.id;await save();for(const n of root.children||[])if(!n.url)await api.move(n.id,{parentId:archive.id});
 const after=(await api.getSubTree(rootId))[0],beforeURLs=rows.map(r=>r.id+':'+r.url).sort(),afterURLs=flatten(after).map(r=>r.id+':'+r.url).sort();if(JSON.stringify(beforeURLs)!==JSON.stringify(afterURLs))throw Error('整理后的书签核验不一致');state.status='applied';state.after=fingerprint(after);await save();return state;
 }catch(e){state.status='interrupted';await save();throw Error(`整理中断：${e.message}。备份已保留，请点击撤销恢复。`);}
}
async function undoUnlocked(api,storage){const state=await storage.get();if(!state)throw Error('没有可恢复的备份');const current=(await api.getSubTree(state.rootId))[0];if(state.status==='applied'&&fingerprint(current)!==state.after)throw Error('整理后书签已被修改，为保留新内容，请先导出当前备份，再手动恢复；未执行撤销');
 // Check every original bookmark before starting recovery.
 const original=flatten(state.original);for(const r of original){let n;try{n=(await api.get(r.id))[0];}catch{throw Error('原书签已被删除，请从导出的HTML备份恢复');}if(n.url!==r.url)throw Error('原书签网址被修改，停止自动撤销');}
 state.status='undoing';await storage.set(state);
 for(let i=0;i<(state.original.children||[]).length;i++){const n=state.original.children[i];await api.move(n.id,{parentId:state.rootId,index:i});}
 async function restore(folder){for(let i=0;i<(folder.children||[]).length;i++){const n=folder.children[i];await api.move(n.id,{parentId:folder.id,index:i});if(!n.url)await restore(n);}}await restore(state.original);
 for(const id of [...state.created].reverse()){try{const n=(await api.getSubTree(id))[0];if(!n.children?.length)await api.remove(id);}catch(e){if(!/find|exist|not found/i.test(e.message))throw e;}}
 if(state.archiveId){try{const a=(await api.getSubTree(state.archiveId))[0];if(!a.children?.length)await api.remove(a.id);}catch(e){if(!/find|exist|not found/i.test(e.message))throw e;}}await storage.clear();return true;
}

export const withBookmarkLock = work => navigator.locks.request('bookmark-steward-mutation',work);
export async function applyPlan(...args){return withBookmarkLock(()=>applyUnlocked(...args));}
export async function undoPlan(...args){return withBookmarkLock(()=>undoUnlocked(...args));}
