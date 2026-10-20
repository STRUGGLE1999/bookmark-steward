import {withBookmarkLock} from './bookmarks.js';
export function folderChoices(root){const result=[];function walk(node,path=[]){if(node.url||node.unmodifiable)return;const next=[...path,node.title||'书签栏'];result.push({id:node.id,path:next});for(const child of node.children||[])walk(child,next);}walk(root);return result;}
export async function saveSmart(api,{rootId,parentId,destination,title,url},onCreated=()=>{}){return withBookmarkLock(async()=>{
 const parsed=new URL(url);if(!['https:','http:'].includes(parsed.protocol))throw Error('仅支持收藏普通网页');
 const root=(await api.getSubTree(rootId))[0],folders=folderChoices(root);let parent;
 if(parentId){if(!folders.some(f=>f.id===parentId))throw Error('目标文件夹已变化，请重新选择');parent=(await api.get(parentId))[0];}
 else{if(!Array.isArray(destination)||destination.length<1||destination.length>2||destination.some(x=>typeof x!=='string'||!x.trim()||x.length>40||/[\\/]/.test(x)))throw Error('推荐目录无效');parent=root;for(const name of destination){const children=await api.getChildren(parent.id);parent=children.find(c=>!c.url&&c.title===name)||await api.create({parentId:parent.id,title:name});}}
 const node=await api.create({parentId:parent.id,title:title.trim()||url,url});
 onCreated(node.id);
 const updated=(await api.getSubTree(rootId))[0],path=folderChoices(updated).find(f=>f.id===parent.id)?.path||[];
 return {id:node.id,parentId:node.parentId,url:node.url,title:node.title,path};
});}
export async function undoSmart(api,record){return withBookmarkLock(async()=>{const node=(await api.get(record.id))[0];if(node.url!==record.url||node.parentId!==record.parentId||node.title!==record.title)throw Error('书签已被修改，未撤销');await api.remove(node.id);});}
