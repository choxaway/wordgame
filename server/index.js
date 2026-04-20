const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const cors=require('cors');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {v4:uuidv4}=require('uuid');
const path=require('path');
const fetch=require('node-fetch');
const app=express();
const server=http.createServer(app);
const CLIENT_URL=process.env.CLIENT_URL||'*';
const JWT_SECRET=process.env.JWT_SECRET||'wordgame-dev-secret';
const PORT=process.env.PORT||3001;
const MW_KEY=process.env.MW_KEY||'9b9783fd-caca-454a-b29b-814f52209132';
const io=new Server(server,{cors:{origin:CLIENT_URL,methods:['GET','POST']}});
app.use(cors({origin:CLIENT_URL}));
app.use(express.json());
const users={},byEmail={},byUsername={},rooms={},uid2sock={},queue=[];
const WORDS=new Set('able,acid,aged,back,bail,ball,band,bare,barn,base,bath,bear,beat,beef,bell,belt,bend,best,bind,bird,bite,blow,blue,blur,boat,body,bold,bolt,bond,bone,book,bore,born,bowl,buck,bull,bump,burn,bush,busy,cage,cake,call,calm,came,camp,cane,card,care,cart,case,cash,cast,cave,cell,chat,chef,chin,chip,chop,cite,city,clam,clap,clay,clip,club,clue,coal,coat,code,coil,cold,come,cone,cook,cool,cope,cord,core,corn,cost,cove,crew,crop,crow,cube,curb,cure,curl,cute,damp,dare,dark,dart,data,date,dawn,dead,deal,dear,debt,deck,deed,deep,dent,deny,desk,dice,diet,dire,dirt,disk,dive,dock,done,door,dose,dove,down,draw,drip,drop,drum,duel,dumb,dump,dune,dusk,dust,duty,each,earn,ease,east,easy,edge,edit,emit,epic,even,ever,evil,face,fact,fair,fake,fall,fame,fare,farm,fast,fate,fear,feat,feed,feel,feet,fell,felt,fend,fern,file,fill,film,find,fine,fire,firm,fish,fist,flag,flat,flip,flow,foam,fold,folk,fond,font,food,fool,foot,ford,fork,form,fort,foul,four,fowl,free,fuel,full,fume,fund,fuse,game,gang,gave,gear,gene,gift,girl,give,glad,glue,goal,gold,golf,gone,good,grew,grim,grin,grip,grit,grow,gulf,gust,hall,halt,hand,hang,hard,harm,harp,hash,haul,have,head,heal,heap,hear,heat,heel,held,helm,help,herd,here,hero,hide,high,hill,hint,hire,hold,hole,home,hood,hook,hope,horn,host,hour,huge,hull,hump,hunt,hurt,husk,icon,idea,idle,inch,into,iron,jack,jail,jest,join,joke,jolt,junk,jury,just,keen,keep,kick,kill,kind,king,knee,knew,knit,knob,know,lace,lack,laid,lake,land,lane,last,late,lawn,lead,leaf,lean,leap,left,lend,lens,less,lied,life,lift,like,limb,line,link,lion,list,live,load,loan,lock,loft,lone,long,look,loom,loop,lore,lose,loss,lost,love,luck,lull,lung,lurk,made,mail,main,make,male,mall,malt,many,mark,mast,maze,meal,mean,meat,meet,melt,memo,mere,mesh,mild,milk,mill,mind,mine,mint,mist,mock,mode,mold,moon,more,most,move,much,must,myth,nail,name,near,neat,need,nest,news,nice,nine,node,none,noon,norm,nose,note,noun,nude,null,once,only,open,oral,oven,over,owed,pack,page,paid,pain,pair,pale,palm,pane,park,part,past,path,pave,peak,peel,peer,pest,pine,pink,pipe,plan,plug,plus,poem,poet,poll,polo,pond,pool,poor,pore,port,pose,post,pour,prep,prey,prod,pull,pump,pure,push,race,rack,rage,raid,rail,rain,rake,ramp,rang,rank,rant,reap,reel,rein,rely,rent,rest,rice,rich,ride,ring,riot,rise,risk,road,roam,roar,robe,rock,rode,roll,roof,room,root,rose,rule,rush,rust,safe,sage,said,sail,sale,salt,same,sand,sang,sank,save,scan,scar,seal,seam,seat,seed,seek,seem,seen,seep,self,sell,send,sent,shed,ship,shoe,shop,shot,show,shut,sick,side,sigh,silk,sill,sink,site,size,skin,skip,slam,slap,slim,slip,slot,slow,slug,snap,snow,soak,soar,sock,soil,sold,sole,some,song,soon,sore,sort,soul,soup,sour,span,spar,spin,spit,spot,spur,star,stay,stem,step,stew,stop,stub,stun,such,suit,sung,sunk,sure,swan,swap,sway,swim,tail,take,tale,tall,tank,tape,task,team,tear,teen,tell,tend,tent,term,test,text,tide,tied,tier,tile,till,time,tiny,tire,toad,told,toll,tomb,tone,took,tool,torn,toss,tour,town,trap,tree,trim,trip,trod,true,tube,tuck,tune,turf,turn,tusk,twin,type,ugly,undo,unit,upon,urge,used,user,vain,vale,vane,vary,vase,vast,veil,vein,verb,very,vest,vial,view,vine,void,vote,wade,wage,wake,walk,wall,wand,ward,warm,warp,wary,wave,weak,wear,weed,week,weld,well,went,were,west,wide,wild,will,wilt,wind,wine,wing,wink,wire,wise,wish,with,woke,wolf,word,wore,work,worm,worn,wrap,wren,yawn,year,zero,zone,about,above,abuse,acute,adult,after,again,agent,agree,ahead,alarm,album,alert,alien,alive,allow,alone,along,alter,angel,anger,angle,angry,ankle,annoy,apart,apple,apply,arena,argue,arise,arrow,asset,atlas,attic,audio,audit,avoid,awake,award,aware,awful,badge,badly,baker,basic,basis,batch,beach,began,begin,being,below,bench,birth,black,blade,blame,blank,blast,blaze,bleed,blend,bless,blind,block,blood,bloom,board,boost,booth,bound,brain,brake,brand,brave,bread,break,bride,brief,bring,broad,broke,brook,brown,brush,build,built,bunch,burst,buyer,cable,camel,canal,candy,cargo,carry,catch,cause,cease,chain,chair,chalk,chaos,charm,chase,cheap,check,cheek,cheer,chess,chest,chief,child,choir,chose,civic,civil,claim,clash,class,clean,clear,clerk,click,cliff,climb,cling,clock,clone,close,cloth,cloud,coach,coast,color,comic,coral,count,court,cover,crack,craft,crash,crazy,cream,creek,crime,cross,crowd,crown,cruel,crush,curve,cycle,daily,dairy,dance,death,debut,decoy,delay,depot,depth,devil,dirty,dizzy,dodge,doubt,dough,draft,drain,drama,drank,drawn,dream,dress,drift,drink,drive,drove,dying,eager,eagle,early,earth,eight,elite,email,empty,enemy,enjoy,enter,entry,equal,error,essay,event,every,exact,exist,extra,fable,faith,false,fancy,fatal,fault,feast,fence,ferry,fetch,fever,field,fifth,fifty,fight,final,first,fixed,flame,flash,flesh,float,flock,floor,flour,fluid,flush,focus,force,forge,forth,forum,found,frame,frank,fraud,fresh,front,frost,fruit,fully,funny,ghost,giant,given,glass,globe,gloom,gloss,grace,grade,grain,grand,grant,grape,grasp,grass,grave,great,green,greet,grief,groan,gross,group,grove,guard,guess,guest,guide,guild,gusto,habit,happy,harsh,haven,heart,heavy,hence,herbs,hinge,hobby,holly,hotel,house,human,humor,hurry,image,imply,index,inner,input,issue,ivory,jewel,joint,judge,juice,juicy,karma,knife,knock,known,label,large,laser,later,laugh,layer,learn,lease,legal,level,light,limit,linen,liner,liver,local,lodge,logic,loose,lover,lower,lucid,lunar,lying,magic,major,maker,march,match,mayor,media,mercy,merit,metal,model,money,month,moral,motor,mount,mouse,mouth,movie,music,night,noble,noise,north,novel,nurse,occur,ocean,offer,often,orbit,order,other,outer,owner,oxide,ozone,paint,panel,panic,paper,party,pause,peace,pearl,penny,phase,phone,photo,piano,piece,pilot,pitch,pixel,pizza,place,plain,plane,plant,plate,plaza,plead,pluck,plume,point,polar,power,press,price,pride,prime,print,prior,prize,probe,prone,proof,prose,proud,prove,prowl,pulse,pupil,queen,query,quest,queue,quick,quiet,quota,quote,radar,radio,raise,rally,range,rapid,ratio,reach,react,realm,rebel,refer,relax,repay,repel,reply,rider,ridge,rifle,right,risky,rival,river,robot,rouge,rough,round,route,royal,rugby,ruler,rural,sadly,saint,sauce,scale,scene,scope,score,scout,sense,serve,seven,shade,shake,shall,shame,shape,share,shark,sharp,sheer,sheet,shelf,shell,shift,shore,short,shout,sight,since,sixth,sixty,skill,skull,slate,slave,sleek,sleep,sleet,slick,slide,slope,small,smart,smell,smile,smoke,snake,solar,solid,solve,sorry,sound,south,space,spare,speak,spear,speed,spell,spend,spice,spike,spine,spite,split,spoke,spoon,spore,spray,squad,stack,staff,stage,stain,stake,stale,stall,stamp,stand,stare,stark,start,state,steak,steal,steel,steep,steer,stick,stiff,still,stock,stone,stood,store,storm,story,stove,strap,straw,stray,strip,strut,study,stuff,style,sugar,suite,sunny,super,surge,sweet,swept,swift,sword,swore,sworn,table,taste,teach,teeth,tempo,tense,terms,thick,third,thorn,three,threw,throw,thumb,tiger,tight,timer,tired,title,today,token,topic,total,touch,tough,towel,tower,track,trade,trail,train,trait,trash,treat,trend,trial,tribe,trick,tried,troop,trove,truck,truly,trunk,trust,truth,ultra,uncle,under,union,until,upper,upset,urban,usual,utter,valid,value,video,vigor,viral,virus,visit,vista,vital,vivid,vocal,voice,waste,watch,water,weary,weave,wedge,weird,whale,wheat,wheel,where,while,white,whole,whose,wider,witch,woman,women,world,worry,worse,worst,worth,would,wound,wrist,write,wrote,yacht,yield,young,youth,strange,strong,stream,street,string,stripe,strategy,straight,struggle,stretch,strength,structure'.split(','));
const isWord=w=>w.length>=3&&WORDS.has(w.toLowerCase());
async function getDef(word){
  try{
    const r=await fetch('https://www.dictionaryapi.com/api/v3/references/collegiate/json/'+encodeURIComponent(word)+'?key='+MW_KEY);
    const d=await r.json();
    if(!d||!d[0]||typeof d[0]==='string')return null;
    const e=d[0];
    return (e.fl?e.fl+' — ':'')+((e.shortdef||[])[0]||'');
  }catch{return null;}
}
const authMW=(req,res,next)=>{
  const t=req.headers.authorization?.split(' ')[1];
  if(!t)return res.status(401).json({error:'No token'});
  try{req.user=jwt.verify(t,JWT_SECRET);next();}
  catch{res.status(401).json({error:'Invalid token'});}
};
app.post('/auth/register',async(req,res)=>{
  const{username,email,password}=req.body;
  if(!username||!email||!password)return res.status(400).json({error:'All fields required'});
  if(byEmail[email.toLowerCase()])return res.status(400).json({error:'Email already registered'});
  if(byUsername[username.toLowerCase()])return res.status(400).json({error:'Username taken'});
  if(username.length<2||username.length>20)return res.status(400).json({error:'Username must be 2-20 chars'});
  const id=uuidv4(),hash=await bcrypt.hash(password,10);
  users[id]={id,username,email:email.toLowerCase(),hash,elo:1000,wins:0,losses:0,games:0};
  byEmail[email.toLowerCase()]=id;
  byUsername[username.toLowerCase()]=id;
  const token=jwt.sign({id,username},JWT_SECRET,{expiresIn:'7d'});
  res.json({token,user:{id,username,email:email.toLowerCase(),elo:1000,wins:0,losses:0}});
});
app.post('/auth/login',async(req,res)=>{
  const{email,password}=req.body;
  const u=users[byEmail[email?.toLowerCase()]];
  if(!u||!await bcrypt.compare(password,u.hash))return res.status(401).json({error:'Invalid email or password'});
  const token=jwt.sign({id:u.id,username:u.username},JWT_SECRET,{expiresIn:'7d'});
  res.json({token,user:{id:u.id,username:u.username,email:u.email,elo:u.elo,wins:u.wins,losses:u.losses}});
});
app.get('/auth/me',authMW,(req,res)=>{
  const u=users[req.user.id];
  if(!u)return res.status(404).json({error:'Not found'});
  res.json({id:u.id,username:u.username,email:u.email,elo:u.elo,wins:u.wins,losses:u.losses,gamesPlayed:u.games});
});
function mkRoom(hostId){
  const code=Math.random().toString(36).substring(2,8).toUpperCase();
  rooms[code]={code,hostId,players:[],status:'lobby',chain:[],turn:0,round:1,ch:null,botId:null};
  return code;
}
function pub(r){
  const a=r.players.filter(p=>!p.out);
  const cp=a.length?a[r.turn%a.length]:null;
  return{code:r.code,status:r.status,chain:r.chain,currentPlayerIndex:a.length?r.turn%a.length:0,currentPlayerId:cp?cp.id:null,roundNumber:r.round,challengeActive:!!r.ch,players:r.players.map(p=>({id:p.id,username:p.username,lives:p.lives,isEliminated:p.out,isSpectator:p.out,isBot:!!p.isBot}))};
}
function getActive(r){return r.players.filter(p=>!p.out);}
function getCurrent(r){const a=getActive(r);return a.length?a[r.turn%a.length]:null;}
function advanceTurn(r){const a=getActive(r);r.turn=(r.turn+1)%Math.max(a.length,1);}
function getWinner(r){const a=getActive(r);return a.length===1?a[0]:null;}
const timers={};
function clearTimer(code){if(timers[code]){clearInterval(timers[code]);delete timers[code];}}
function startTimer(r,io){
  clearTimer(r.code);
  let s=20;
  timers[r.code]=setInterval(()=>{
    s--;
    io.to(r.code).emit('game:timer_tick',{secondsRemaining:s});
    if(s<=0){clearTimer(r.code);const c=getCurrent(r);if(c&&!c.isBot){loseLife(r,c.id,io);startNextRound(r,io);}}
  },1000);
}
function loseLife(r,pid,io){
  const p=r.players.find(x=>x.id===pid);
  if(!p||p.out)return;
  p.lives=Math.max(0,p.lives-1);
  io.to(r.code).emit('game:life_lost',{playerId:pid,livesRemaining:p.lives});
  if(p.lives===0){p.out=true;io.to(r.code).emit('game:player_eliminated',{playerId:pid,username:p.username});const u=users[pid];if(u)u.losses++;}
}
function startNextRound(r,io){
  clearTimer(r.code);
  r.chain=[];r.ch=null;r.round++;
  advanceTurn(r);
  const w=getWinner(r);
  if(w){
    r.status='finished';
    const u=users[w.id];
    if(u&&!w.isBot){u.wins++;u.games++;u.elo=Math.min(3000,u.elo+25);}
    r.players.filter(p=>p.id!==w.id).forEach(p=>{const u=users[p.id];if(u){u.games++;u.elo=Math.max(500,u.elo-10);}});
    io.to(r.code).emit('game:winner',{winnerId:w.id,username:w.username});
  }else{
    const nxt=getCurrent(r);
    io.to(r.code).emit('game:round_reset',{chain:[],roundNumber:r.round,currentPlayerId:nxt?nxt.id:null});
    if(nxt&&nxt.isBot)scheduleBotTurn(r,io);else startTimer(r,io);
  }
}
function afterLetterAdded(r,io){
  advanceTurn(r);
  const nxt=getCurrent(r);
  io.to(r.code).emit('game:turn_changed',{currentPlayerId:nxt?nxt.id:null});
  if(nxt&&nxt.isBot)scheduleBotTurn(r,io);else startTimer(r,io);
}
const BOT=['strange','strong','stream','street','string','stripe','straw','storm','stone','store','stock','stick','steam','steal','stand','stall','stain','stage','spray','split','spine','spell','speed','speak','space','smile','smell','slope','sleep','skill','shift','shell','shark','shade','serve','sense','scene','sauce','rough','round','route','royal','river','rider','ridge','right','react','realm','radio','raise','rally','range','rapid','reach','proud','prove','power','point','pilot','phone','phase','peace','pearl','nurse','north','noise','night','music','mouth','motor','mount','month','money','model','metal','merit','match','march','major','magic','lover','local','limit','level','legal','layer','laugh','laser','large','known','juice','joint','human','hotel','hobby','happy','guard','grove','group','grief','great','grave','grass','grape','grand','grain','grace','globe','glass','giant','funny','frost','fresh','fraud','frame','found','force','focus','floor','flesh','flame','fight','fever','fence','feast','false','fancy','faith','extra','exist','event','error','equal','entry','enjoy','enemy','empty','eight','cycle','curve','cruel','crown','crowd','cross','crime','cream','crash','craft','crack','cover','count','coral','coast','clone','close','cloth','cloud','clock','chess','chest','check','chaos','charm','chair','chain','catch','cable','burst','build','brush','broke','bring','break','bread','brave','brand','brain','bloom','blood','block','blend','blast','blank','blame','blade','black','bench','beach','badge','aware','avoid','arena','anger','angel','alone','allow','alive','alert','alarm','agree','after','about'];
function botLetter(chain){
  const pre=chain.join('').toLowerCase();
  const opts=BOT.filter(w=>w.startsWith(pre)&&w.length>pre.length);
  if(opts.length){const w=opts[Math.floor(Math.random()*Math.min(opts.length,5))];return w[pre.length].toUpperCase();}
  const any=Array.from(WORDS).filter(w=>w.startsWith(pre)&&w.length>pre.length);
  if(any.length){const w=any[Math.floor(Math.random()*Math.min(any.length,5))];return w[pre.length].toUpperCase();}
  return null;
}
function scheduleBotTurn(r,io){
  setTimeout(()=>{
    const rm=rooms[r.code];
    if(!rm||rm.status!=='playing'||rm.ch)return;
    const c=getCurrent(rm);
    if(!c||!c.isBot)return;
    const letter=botLetter(rm.chain);
    if(!letter){startNextRound(rm,io);return;}
    const nc=[...rm.chain,letter];
    const cs=nc.join('').toLowerCase();
    rm.chain=nc;
    io.to(rm.code).emit('game:letter_added',{letter,chain:nc,playerId:c.id,username:c.username});
    if(nc.length>=4&&isWord(cs)){
      getDef(cs).then(def=>io.to(rm.code).emit('game:word_completed',{word:cs,definition:def||'A valid English word.',penalty:true}));
      loseLife(rm,c.id,io);
      setTimeout(()=>startNextRound(rm,io),2000);
    }else if(nc.length===3&&isWord(cs)){
      getDef(cs).then(def=>io.to(rm.code).emit('game:three_letter_word',{word:cs,definition:def||'A valid English word.'}));
      afterLetterAdded(rm,io);
    }else{
      afterLetterAdded(rm,io);
    }
  },1200+Math.random()*600);
}
app.post('/rooms/create',authMW,(req,res)=>{res.json({code:mkRoom(req.user.id)});});
app.post('/rooms/create-vs-bot',authMW,(req,res)=>{
  const code=mkRoom(req.user.id);
  const r=rooms[code];
  const botId='bot-'+uuidv4();
  r.botId=botId;r.status='playing';
  r.players.push({id:req.user.id,username:req.user.username,lives:4,out:false,isBot:false});
  r.players.push({id:botId,username:'WordBot',lives:4,out:false,isBot:true});
  res.json({code});
});
app.get('/rooms/:code',authMW,(req,res)=>{
  const r=rooms[req.params.code.toUpperCase()];
  if(!r)return res.status(404).json({error:'Room not found'});
  res.json(pub(r));
});
app.post('/matchmaking/join',authMW,(req,res)=>{
  const{id,username}=req.user;
  if(!queue.find(p=>p.id===id))queue.push({id,username});
  if(queue.length>=2){
    const[a,b]=queue.splice(0,2);
    const code=mkRoom(a.id);
    const r=rooms[code];
    [a,b].forEach(p=>{
      r.players.push({id:p.id,username:p.username,lives:4,out:false,isBot:false});
      const sid=uid2sock[p.id];
      if(sid){const s=io.sockets.sockets.get(sid);if(s){s.join(code);s.emit('matchmaking:matched',{code});}}
    });
    io.to(code).emit('room:updated',pub(r));
    return res.json({status:'matched',code});
  }
  res.json({status:'waiting'});
});
app.post('/matchmaking/leave',authMW,(req,res)=>{
  const i=queue.findIndex(p=>p.id===req.user.id);
  if(i>-1)queue.splice(i,1);
  res.json({status:'left'});
});
app.get('/dictionary',authMW,(req,res)=>{
  const w=req.query.word?.toLowerCase();
  if(!w)return res.status(400).json({error:'No word'});
  getDef(w).then(def=>res.json({word:w,valid:isWord(w),definition:def||(isWord(w)?'"'+w+'" is valid.':'"'+w+'" not found.')}));
});
app.get('/leaderboard',authMW,(req,res)=>{
  res.json(Object.values(users).sort((a,b)=>b.elo-a.elo).slice(0,50).map((u,i)=>({rank:i+1,username:u.username,elo:u.elo,wins:u.wins,losses:u.losses,gamesPlayed:u.games})));
});
app.use(express.static(path.join(__dirname,'../client/build')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../client/build/index.html')));
io.use((socket,next)=>{
  try{socket.user=jwt.verify(socket.handshake.auth.token,JWT_SECRET);next();}
  catch{next(new Error('Unauthorized'));}
});
io.on('connection',socket=>{
  const uid=socket.user.id;
  uid2sock[uid]=socket.id;
  socket.on('room:join',({code})=>{
    const r=rooms[code?.toUpperCase()];
    if(!r)return socket.emit('error',{message:'Room not found'});
    socket.join(r.code);
    if(r.status==='lobby'&&!r.players.find(p=>p.id===uid)){
      r.players.push({id:uid,username:socket.user.username,lives:4,out:false,isBot:false});
    }
    socket.emit('room:joined',{code:r.code});
    io.to(r.code).emit('room:updated',pub(r));
    if(r.botId&&r.status==='playing'){
      socket.emit('game:started',pub(r));
      const c=getCurrent(r);
      if(c&&c.isBot)scheduleBotTurn(r,io);else startTimer(r,io);
    }
  });
  socket.on('room:start',({code})=>{
    const r=rooms[code?.toUpperCase()];
    if(!r||r.hostId!==uid||r.players.length<2)return;
    r.status='playing';
    io.to(r.code).emit('game:started',pub(r));
    const c=getCurrent(r);
    if(c&&c.isBot)scheduleBotTurn(r,io);else startTimer(r,io);
  });
  socket.on('game:add_letter',({code,letter})=>{
    const r=rooms[code?.toUpperCase()];
    if(!r||r.status!=='playing'||r.ch)return;
    const c=getCurrent(r);
    if(!c||c.id!==uid)return socket.emit('error',{message:'Not your turn'});
    const l=letter?.toUpperCase();
    if(!l||!/^[A-Z]$/.test(l))return;
    clearTimer(r.code);
    const nc=[...r.chain,l];
    const cs=nc.join('').toLowerCase();
    r.chain=nc;
    const pu=r.players.find(x=>x.id===uid); io.to(r.code).emit('game:letter_added',{letter:l,chain:nc,playerId:uid,username:pu?pu.username:''});
    if(nc.length>=4&&isWord(cs)){
      getDef(cs).then(def=>io.to(r.code).emit('game:word_completed',{word:cs,definition:def||'A valid English word.',penalty:true}));
      loseLife(r,uid,io);
      setTimeout(()=>startNextRound(r,io),2000);
    }else if(nc.length===3&&isWord(cs)){
      getDef(cs).then(def=>io.to(r.code).emit('game:three_letter_word',{word:cs,definition:def||'A valid English word.'}));
      afterLetterAdded(r,io);
    }else{
      afterLetterAdded(r,io);
    }
  });
  socket.on('game:challenge',({code})=>{
    const r=rooms[code?.toUpperCase()];
    if(!r||r.status!=='playing'||r.ch||r.chain.length<2)return;
    const c=getCurrent(r);
    if(!c||c.id!==uid)return;
    const a=getActive(r);
    const pi=((r.turn%a.length)-1+a.length)%a.length;
    const prev=a[pi];
    if(!prev)return;
    clearTimer(r.code);
    r.ch={challengerId:uid,challengedId:prev.id};
    io.to(r.code).emit('game:challenge_raised',{challengerId:uid,challengerName:socket.user.username,challengedId:prev.id,challengedName:prev.username,chain:r.chain});
  });
  socket.on('game:submit_word',({code,word})=>{
    const r=rooms[code?.toUpperCase()];
    if(!r||!r.ch)return;
    const ch=r.ch;
    if(ch.challengedId!==uid)return;
    const w=word?.toLowerCase().trim();
    const pre=r.chain.join('').toLowerCase();
    const valid=w&&w.startsWith(pre)&&isWord(w);
    r.ch=null;
    if(valid){
      io.to(r.code).emit('game:challenge_result',{result:'challenger_loses',word:w,loserId:ch.challengerId});
      loseLife(r,ch.challengerId,io);
    }else{
      io.to(r.code).emit('game:challenge_result',{result:'challenged_loses',word:w,loserId:ch.challengedId});
      loseLife(r,ch.challengedId,io);
    }
    setTimeout(()=>startNextRound(r,io),1500);
  });
  socket.on('game:react',({code,emoji})=>{
    const r=rooms[code?.toUpperCase()];
    if(r)io.to(r.code).emit('game:reaction',{playerId:uid,username:socket.user.username,emoji});
  });
  socket.on('room:leave',({code})=>{
    const r=rooms[code?.toUpperCase()];
    if(r){r.players=r.players.filter(p=>p.id!==uid);socket.leave(r.code);io.to(r.code).emit('room:updated',pub(r));}
  });
  socket.on('disconnect',()=>delete uid2sock[uid]);
});
server.listen(PORT,()=>console.log('Word Game server running on port '+PORT));
