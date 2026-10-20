import {cp,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
for(const f of ['index.html','styles.css','app.js','core.js','ai.js','bookmarks.js','autosort.js','privacy.html','research.html'])await cp('dist/'+f,'extension/'+f);
await mkdir('dist/downloads',{recursive:true});
execFileSync('zip',['-q','-r','../dist/downloads/bookmark-steward-extension.zip','manifest.json','background.js','smart.js','popup.html','popup.js','popup.css','index.html','styles.css','app.js','core.js','ai.js','bookmarks.js','autosort.js','privacy.html','research.html'],{cwd:'extension'});
console.log('静态网站和扩展安装包已生成');
