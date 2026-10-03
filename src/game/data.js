export const NPCS=[
{id:'npc001',name:'晏川',rarity:'SSR',color:'#6d8cff',accent:'#dce5ff',personality:'嘴硬、慢熟、記仇，但其實很會照顧人',likes:['咖啡','深夜','安靜'],quote:'你來就來，不用特別說。'},
{id:'npc002',name:'祈安',rarity:'SR',color:'#56c596',accent:'#d6ffeb',personality:'外向、愛聊天、很會製造事件',likes:['甜點','公園','聚餐'],quote:'走啦，出去晃一下。'},
{id:'npc003',name:'洛辰',rarity:'SSR',color:'#c86cf0',accent:'#f2dcff',personality:'冷靜、觀察力強、偶爾毒舌',likes:['閱讀','雨天','百貨'],quote:'我只是剛好有空。'},
{id:'npc004',name:'以澄',rarity:'R',color:'#f09d51',accent:'#ffe6cb',personality:'生活派、容易餓、情緒寫在臉上',likes:['料理','早餐','沙發'],quote:'先吃飯，其他等等再說。'},
{id:'npc005',name:'季白',rarity:'SR',color:'#54b8d4',accent:'#d7f7ff',personality:'安靜、喜歡一個人行動，熟了很黏',likes:['夜景','音樂','咖啡'],quote:'你坐這邊就好。'},
{id:'npc006',name:'時遠',rarity:'R',color:'#d7c75e',accent:'#fff8c9',personality:'有點散漫、很好相處、很愛買東西',likes:['百貨','新衣服','下午茶'],quote:'我剛好看到一個很適合你的。'}
]
export const ROOMS=[
{id:'player',name:'101｜你的房間',cost:0,level:1},
{id:'room102',name:'102｜住戶房',cost:1,level:1},
{id:'room103',name:'103｜住戶房',cost:1,level:2},
{id:'room104',name:'104｜住戶房',cost:2,level:3},
{id:'room105',name:'105｜住戶房',cost:2,level:4},
{id:'room106',name:'106｜住戶房',cost:3,level:5}
]
export const SCENES=[
{id:'apartment',name:'公寓樓層',icon:'APT',level:1,theme:'home'},
{id:'lounge',name:'公共客廳',icon:'LNG',level:2,theme:'lounge'},
{id:'cafe',name:'巷口咖啡廳',icon:'CAF',level:3,theme:'cafe',card:'scene_cafe'},
{id:'park',name:'城市公園',icon:'PRK',level:3,theme:'park',card:'scene_park'},
{id:'mall',name:'百貨公司',icon:'MAL',level:5,theme:'mall',card:'scene_mall'}
]
export const CLOTHES=[
{id:'cloth_sleep',name:'寬鬆睡衣',rarity:'R'},
{id:'cloth_date',name:'約會外套',rarity:'SR'},
{id:'cloth_sport',name:'運動套裝',rarity:'R'},
{id:'cloth_formal',name:'正式西裝',rarity:'SSR'}
]
export const EVENTS=[
{id:'event_blackout',name:'深夜停電',rarity:'SSR',cg:'cg_blackout',text:'整層樓突然停電，住戶全聚到走廊。'},
{id:'event_noodle',name:'深夜泡麵',rarity:'SR',cg:'cg_noodle',text:'有人半夜在公共廚房煮泡麵。'},
{id:'event_rain',name:'突然下雨',rarity:'SR',cg:'cg_rain',text:'外出時突然下大雨，只剩一把傘。'},
{id:'event_movie',name:'電影之夜',rarity:'R',cg:'cg_movie',text:'住戶決定把客廳變成小型電影院。'}
]
export const CGS=[
{id:'cg_blackout',name:'停電之夜',hint:'擁有「深夜停電」事件卡並觸發事件'},
{id:'cg_noodle',name:'凌晨 00:47',hint:'擁有「深夜泡麵」事件卡並觸發事件'},
{id:'cg_rain',name:'共傘',hint:'擁有「突然下雨」事件卡並觸發事件'},
{id:'cg_movie',name:'電影之夜',hint:'擁有「電影之夜」事件卡並觸發事件'},
{id:'cg_001_30',name:'晏川｜第一次談心',hint:'晏川好感達 30'},
{id:'cg_001_60',name:'晏川｜房間裡的深夜',hint:'晏川好感達 60'},
{id:'cg_003_30',name:'洛辰｜雨天書店',hint:'洛辰好感達 30'},
{id:'cg_005_30',name:'季白｜夜景',hint:'季白好感達 30'}
]
export const GACHA_POOLS={
character:{id:'character',name:'住戶招募',subtitle:'抽到角色後，可安排入住已解鎖房間',type:'character'},
scene:{id:'scene',name:'城市擴張',subtitle:'咖啡廳、公園、百貨等場景卡',type:'scene'},
clothes:{id:'clothes',name:'衣櫥補給',subtitle:'服裝卡會進入角色換裝庫',type:'clothes'},
event:{id:'event',name:'生活事件',subtitle:'讓城市真的發生特殊事件並解鎖 CG',type:'event'}
}
export const DAILY_TASKS=[
{id:'draw',name:'抽卡 1 次',target:1,reward:{coins:120}},
{id:'talk',name:'和住戶互動 3 次',target:3,reward:{coins:150}},
{id:'visit',name:'造訪 2 個場景',target:2,reward:{keys:1}},
{id:'event',name:'觸發 1 次生活事件',target:1,reward:{tickets:2}}
]
