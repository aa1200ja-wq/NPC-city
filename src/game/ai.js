let generator=null
let loadingPromise=null
export const AI_MODEL={id:'onnx-community/Qwen2.5-0.5B-Instruct',label:'Qwen2.5 0.5B｜瀏覽器本機',note:'首次下載約數百 MB，之後使用瀏覽器快取；WebGPU 裝置較適合。'}
const statusLines={hungry:['我現在比較在意晚餐。','先不要問太難的，我有點餓。'],eating:['我在吃東西，你要不要也去拿一份？','等我吃完這口。'],coffee:['這杯還不錯。你要喝就自己點。','我今天需要咖啡。'],reading:['我看到一半，你可以講。','你剛好打斷最精彩的地方。'],resting:['我只是坐一下。','今天不太想跑來跑去。'],shopping:['我只是看看，沒有要買很多。','你覺得這個適合我嗎？'],idle:['怎麼了？','你找我？']}
const pick=list=>list[Math.floor(Math.random()*list.length)]
export function ruleReply(npc,runtime,message){
 const base=statusLines[runtime.status]||statusLines.idle
 const affection=runtime.affinity||0
 const prefix=affection>=60?['你來啦。','我就知道你會過來。']:affection>=30?['又碰到了。','今天還好嗎？']:['嗯？','有事？']
 const echo=message.includes('吃')?'如果你也餓，就一起吧。':message.includes('去哪')?'我等等可能會再晃去別的地方。':message.includes('喜歡')?'這種問題你自己猜。':pick(base)
 return pick(prefix)+' '+echo
}
export async function loadLocalModel(onProgress=()=>{}){
 if(generator)return generator
 if(loadingPromise)return loadingPromise
 loadingPromise=(async()=>{
  const {pipeline,env}=await import('@huggingface/transformers')
  env.allowLocalModels=false
  env.useBrowserCache=true
  generator=await pipeline('text-generation',AI_MODEL.id,{device:navigator.gpu?'webgpu':'wasm',dtype:navigator.gpu?'q4f16':'q4',progress_callback:onProgress})
  return generator
 })()
 try{return await loadingPromise}finally{loadingPromise=null}
}
export async function modelReply(npc,runtime,message){
 if(!generator)throw new Error('模型尚未載入')
 const prompt=['你是生活模擬遊戲中的 NPC，請只用繁體中文回覆。','角色：'+npc.name,'個性：'+npc.personality,'喜好：'+npc.likes.join('、'),'目前狀態：'+runtime.status,'目前心情：'+runtime.mood,'對玩家好感：'+runtime.affinity+'/100','玩家：'+message,'請以角色口吻簡短回 1 到 2 句，不要解釋設定。'].join('\n')
 const out=await generator(prompt,{max_new_tokens:72,temperature:.85,top_p:.9,do_sample:true})
 const text=out?.[0]?.generated_text
 if(typeof text==='string')return text.slice(prompt.length).trim()||text.trim()
 if(Array.isArray(text)){const last=text[text.length-1];return last?.content||'……'}
 return '……'
}
