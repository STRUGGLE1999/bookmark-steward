export const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function flatten(root,path=[]) { return (root.children||[]).flatMap(n=>n.url?[{id:String(n.id),title:n.title||n.name||n.url,url:n.url,path:[...path],parentId:n.parentId,index:n.index,dateAdded:n.dateAdded}]:flatten(n,[...path,n.title||n.name||'未命名'])); }
export function privateURL(url) {
 try { const u=new URL(url),h=u.hostname.toLowerCase();return !['http:','https:'].includes(u.protocol)||h==='localhost'||h.endsWith('.local')||h.endsWith('.internal')||h.includes(':')||/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h)||h.endsWith('.feishu.cn')||h.endsWith('.larkoffice.com')||h.endsWith('.kdocs.cn')||h==='docs.qq.com'||h==='docs.google.com'||h==='exmail.qq.com'||h==='notion.so'||h.endsWith('.notion.so')||h.endsWith('.notion.site')||/token|secret|password|signature|check-code|session|api.key|personId/i.test(u.search)||/\/wp-admin|\/api-keys|\/dashboard|\/login|\/console/i.test(u.pathname); } catch{return true;}
}
export function sanitizeForAI(rows) {return rows.filter(r=>!privateURL(r.url)).map(r=>({id:r.id,title:r.title.slice(0,180),url:new URL(r.url).origin}));}
const rules=[
 [/github\.com\/(?:trending|EvanLi)|waytoagi|pmbaobao|fromgeek|sykv/i,['资讯阅读','资源导航'],'用于发现新资源'],
 [/jobs\.|面试|interview|leetcode|codeforces|luogu|nowcoder|cometoj|kamacoder|acmcoder|deep-ml|职位描述/i,['学习求职','面试与算法练习'],'学习训练或求职入口'],
 [/考试|认证|培训|ruankao|ntce|neea|91ke|学堂|知识中心|zjyun|hrss\.gd/i,['学习求职','课程与考试认证'],'培训课程或认证资料'],
 [/competition|竞赛|大赛|比赛|hackathon|codecraft|clockin|打卡营/i,['学习求职','竞赛与活动'],'竞赛平台与活动资料'],
 [/metaso|chatgpt|chat\.openai|claude\.ai|gemini\.google|monica|notebooklm|flowith|anygen|aimakex|airtap|coze\.(com|cn)/i,['AI创作','对话搜索与助手'],'直接使用的AI助手或搜索服务'],
 [/twitter.*download|x-twitter-downloader|downsub|y2mate|peanutdl|字幕下载|视频下载/i,['AI创作','视频与字幕下载'],'视频下载或字幕获取'],
 [/convertio|ilovepdf|remove\.bg|latexlive|mathpix|格式转换|pdf合并|md2wechat|md\.doocs|排版/i,['AI创作','办公排版与格式处理'],'文档、媒体加工工具'],
 [/prompt|提示词|tags\.novelai/i,['AI创作','提示词与案例'],'提示词参考'],
 [/lovart|liblib|gpt.image|nano.banana|stable.diffusion|aitubiao/i,['AI创作','图像与设计创作'],'图像设计与生成'],
 [/mermaid|drawio|draw\.io|xmind|dribbble|slidesgo|beautiful\.ai|islide|canva|配色|sliderabbit/i,['产品设计','原型流程与演示'],'设计素材或流程演示工具'],
 [/woshipm|pmcaff|ucdchina|uxbaike|qiaomu|chatprd|svpg|reforge|lennys|jobstobedone|jobs-to-be-done|ai.pm.guide|产品经理|产品设计|producthunt|a16z|mckinsey/i,['产品设计','产品方法与研究'],'产品方法、案例与行业研究'],
 [/codex|claude.code|opencode|trae|v0\.app|vibevibe|aicoding|codefather|aicode|harness.books/i,['开发研究','AI编程与Agent'],'AI编程工具或开发教程'],
 [/skills|agent|dify|openclaw|livetalking|wechatbot|智能微信机器人/i,['开发研究','AI编程与Agent'],'Agent或AI应用开发'],
 [/researchgate|alphaxiv|aminer|paperswithcode|huggingface\.co\/papers|论文|查重|chaessay/i,['开发研究','论文与学术'],'学术论文检索与研究'],
 [/github\.com|huggingface|kaggle|机器学习|opencv|yolo|目标检测|saliency|分割|数据集|数据分析|dataju|mendeley/i,['开发研究','算法代码与数据集'],'算法源码、数据或研究实现'],
 [/autodl|mindspore|hiascend|openi\.|昇腾|昇思|gitee\.com\/ascend|ai\.gitee/i,['开发研究','算力模型与昇腾'],'算力或模型开发生态'],
 [/spring|stackoverflow|runoob|itbaima|dolphinscheduler|mockaroo|子网|数据清洗|zybuluo|gitlink/i,['开发研究','工程文档与教程'],'软件工程或编程参考'],
 [/量子位|机器之心|qbitai|jiqizhixin|theverge|engadget|techcrunch|artificialintelligence-news|aihot|ofweek|AI资讯|ainews|latent\.space/i,['资讯阅读','AI科技新闻'],'科技新闻与信息聚合'],
 [/blog|medium|every\.to|oneusefulthing|chinaventure|宝玉|baiyu|baoyu/i,['资讯阅读','博客与商业洞察'],'作者专栏与商业阅读'],
 [/zlib|zlibrary|scribd|xuexi|cmpedu|阅读|地理|书籍/i,['资讯阅读','图书与泛读'],'图书与泛读资源'],
 [/netlify|uptimerobot|console\.aliyun|运维|hdfs|yarn|sparkcore|镜像清单/i,['工作项目','云服务与运维'],'部署或运维控制台'],
 [/v2ray|vpn|tttizi|cloud.*traffic|syu\d|kg\d|github\.moeyy|xmrth|cv2\.store|xmfaff|wj-kc|shadowrocket|fanqiang/i,['生活账号','网络与账号服务'],'网络服务及使用教程'],
 [/sms|seagm|pockyt|充值|代充|appleid|共享账号|bewild|getgpt|labnana/i,['生活账号','订阅与账号服务'],'账号、订阅或充值服务'],
 [/msoen|无人机制造|wp-admin|项目|需求|工时|kdocs|asr-home|\/asr\/|gogs|blood|客户/i,['工作项目','项目资料与业务系统'],'工作协作、项目资料或业务入口'],
 [/hrss|证件|相片|finalhopes|models\.com|juzia|youtube.*频道|szplayer/i,['生活账号','办事与兴趣'],'生活办事或个人兴趣'],
];
export function suggestLocal(rows){return rows.map(r=>{if(privateURL(r.url)&&/192\.168|^http:\/\/10\.|\/asr\/|gogs|HDFS|YARN|sparkCore/i.test(r.url+' '+r.title))return {id:r.id,destination:['工作项目','项目资料与业务系统'],reason:'本地或内部业务系统，不发送给模型',confidence:'high',source:'local'}; const hit=rules.find(([re])=>re.test(r.title+' '+r.url));return {id:r.id,destination:hit?hit[1]:['待确认','用途待确认'],reason:hit?hit[2]:'标题与网址不足以可靠判断，请确认用途',confidence:hit?'medium':'low',source:'local'};});}
export function validatePlan(rows,plan,maxTop=12){
 if(!Array.isArray(plan)||plan.length!==rows.length)throw Error('方案必须为每条书签保留一个位置');
 const ids=new Set(rows.map(r=>r.id)),seen=new Set(),tops=new Set();
 for(const p of plan){if(!ids.has(p.id)||seen.has(p.id))throw Error('方案包含未知或重复的书签ID');seen.add(p.id);if(!Array.isArray(p.destination)||p.destination.length<1||p.destination.length>2||p.destination.some(s=>typeof s!=='string'||!s.trim()||s.length>40||/[\x00-\x1f/\\]/.test(s)))throw Error('目录只能有1至2层，每层1至40字，不含斜杠');tops.add(p.destination[0]);}
 if(tops.size>maxTop)throw Error(`顶层分类不能超过 ${maxTop} 个`);return true;
}
export function summarize(rows,plan){const old=new Set(rows.flatMap(r=>r.path.map((_,i)=>r.path.slice(0,i+1).join('/')))),next=new Set(plan.flatMap(r=>r.destination.map((_,i)=>r.destination.slice(0,i+1).join('/'))));const urls=new Set(rows.map(r=>r.url)),rowById=new Map(rows.map(r=>[r.id,r]));return {count:rows.length,before:old.size,after:next.size,duplicates:rows.length-urls.size,review:plan.filter(p=>p.confidence==='low').length,moved:plan.filter(p=>p.destination.join('/')!==rowById.get(p.id)?.path.join('/')).length};}
export function exportHTML(rows,plan){validatePlan(rows,plan);const tree=new Map(),map=new Map(rows.map(r=>[r.id,r]));for(const p of plan){let branch=tree;for(const part of p.destination){if(!branch.has(part))branch.set(part,new Map());branch=branch.get(part);}if(!branch.has(null))branch.set(null,[]);branch.get(null).push(map.get(p.id));}const lines=['<!DOCTYPE NETSCAPE-Bookmark-file-1>','<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">','<TITLE>书签归位</TITLE>','<H1>Bookmarks</H1>','<DL><p>'];function render(t){for(const [key,val]of t){if(key===null){for(const r of val)lines.push(`<DT><A HREF="${escapeHTML(r.url)}"${r.dateAdded?` ADD_DATE="${Math.floor(r.dateAdded/1000)}"`:''}>${escapeHTML(r.title)}</A>`);}else{lines.push(`<DT><H3>${escapeHTML(key)}</H3>`,'<DL><p>');render(val);lines.push('</DL><p>');}}}render(tree);lines.push('</DL><p>');return lines.join('\n');}
export function parseHTML(text){const doc=new DOMParser().parseFromString(text,'text/html'),rows=[];let i=0;for(const a of doc.querySelectorAll('dt > a')){let dt=a.parentElement,dl=dt.parentElement,path=[];while(dl){const h=dl.parentElement?.tagName==='DT'?dl.parentElement.querySelector(':scope > h3'):dl.previousElementSibling?.matches('dt')?dl.previousElementSibling.querySelector('h3'):null;if(h)path.unshift(h.textContent.trim());dl=dl.parentElement?.closest('dl');}rows.push({id:`import-${++i}`,title:a.textContent.trim()||a.getAttribute('href'),url:a.getAttribute('href'),path,dateAdded:Number(a.getAttribute('add_date')||0)*1000});}return rows;}
export const demoRows=[
 ['秘塔AI搜索','https://metaso.cn/',['工具','PPT生成']],['MP4 转 GIF','https://convertio.co/zh/mp4-gif/',['工具','VPN']],['客户项目需求说明书','https://docs.qq.com/doc/example',['学习','博客']],['Claude','https://claude.ai/',['学习','学术']],['GitHub Trending','https://github.com/trending',['产品经理','网站']],['AI资讯日报','https://example.com/AI资讯',['工作','教程']],['draw.io','https://www.drawio.com/',['工具','杂项']],['教师资格考试报名','https://ntce.neea.edu.cn/',['提升']],['力扣算法练习','https://leetcode.cn/',['工作','项目']],['NotebookLM','https://notebooklm.google.com/',['AI工具']],['量子位','https://qbitai.com/',['产品经理','网站']],['Codex 使用指南','https://codexguide.ai/',['工具','配置','文档']],['未命名资料','https://example.org/a',['学习']],['draw.io','https://www.drawio.com/',['产品经理','设计']],['自动化部署 · Netlify','https://app.netlify.com/',['产品经理','项目']],['产品方法与体验研究','https://www.woshipm.com/',['阅读']],['Mermaid 流程图','https://mermaid.live/',['工作','博客']],['视频字幕下载','https://downsub.com/',['AI工具','PPT生成']],['论文检索 · alphaXiv','https://alphaxiv.org/',['工具']],['GPT Image 提示词','https://prompts.chat/',['提升']],['AutoDL GPU算力','https://autodl.com/',['学习']],['Jobs to be Done','https://jobstobedone.org/',['播客']],['个人笔记','https://team.feishu.cn/wiki/private',['网站']],['UptimeRobot','https://uptimerobot.com/',['比赛2025']]
].map(([title,url,path],i)=>({id:`demo-${i+1}`,title,url,path}));
