import {withBookmarkLock} from './bookmarks.js';
import {flatten,suggestLocal,validatePlan} from './core.js';
const normalize=s=>s.replace(/[与和\s&]/g,'').toLowerCase();
async function sortUnlocked(api,id,config,classify){
 const root=(await api.getSubTree(config.rootId))[0],rows=flatten(root),row=rows.find(r=>r.id===id);if(!row)return null;
 // Reuse the current taxonomy wherever an equivalent directory already exists.
 const paths=[];function walk(folder,path=[]){for(const c of folder.children||[])if(!c.url){const p=[...path,c.title];if(p.length<=2)paths.push(p);if(p.length<2)walk(c,p);}}walk(root);
 let decision=suggestLocal([row])[0],notice='本地规则';if(config.engine==='ai'&&classify){try{decision=await classify(row,paths);validatePlan([row],[decision]);notice=decision.source==='ai'?'AI分类':'私人链接，仅在本地处理';}catch{notice='AI不可用，已用本地规则归类';}}
 const desired=[...decision.destination];let parentId=root.id,folder=root;
 for(let i=0;i<desired.length;i++){let next=(folder.children||[]).find(c=>!c.url&&normalize(c.title)===normalize(desired[i]));if(!next){next=await api.create({parentId,title:desired[i]});next={...next,children:[]};}desired[i]=next.title;parentId=next.id;folder=next;}
 const current=(await api.get(id))[0];if(current.parentId!==row.parentId||current.url!==row.url)return null;
 await api.move(id,{parentId});return {id,title:row.title,url:row.url,fromParentId:row.parentId,fromIndex:row.index,toParentId:parentId,destination:desired,reason:decision.reason,confidence:decision.confidence,notice,time:Date.now()};
}
async function undoUnlocked(api,record){const n=(await api.get(record.id))[0];if(n.url!==record.url||n.parentId!==record.toParentId)throw Error('这条书签已被你修改，未执行撤销');await api.get(record.fromParentId);await api.move(record.id,{parentId:record.fromParentId,index:record.fromIndex});}

export async function sortNewBookmark(api,id,config,classify,shouldSkip=()=>false){return withBookmarkLock(()=>shouldSkip()?null:sortUnlocked(api,id,config,classify));}
export async function undoAutoBookmark(...args){return withBookmarkLock(()=>undoUnlocked(...args));}
