import { F,S,R,C,rows,byId,required,changed,immutable,unique,summary } from './core/rules.js';
const isName=x=>typeof x==='string'&&/^[a-zA-Z0-9_.-]{3,80}$/.test(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const liveReply=r=>!r.archived&&r.status!=='sent';
export default {
 slug:'orta-inbox',reference:3,title:'OrtaInbox',
 description:'Ручная очередь обращений: назначенный автор → независимая проверка версии ответа → ручная отметка отправки.',
 limitations:'Общий кабинет одной организации · Филиал — метка · Без почтового импорта, AI и внешней отправки',
 collections:[
  C('branches','Филиалы',[F('name','Название филиала')],{writeRole:'admin',addLabel:'Добавить филиал',description:'Филиалы помогают распределить обращения. Это метки в общем кабинете, не границы доступа.'}),
  C('cases','Обращения',[F('code','Номер обращения'),R('branch','Филиал','branches'),F('subject','Тема'),F('question','Текст обращения','textarea'),F('assignee','Ответственный аккаунт','staff'),S('status','Состояние',[['open','Открыто'],['closed','Закрыто']],{default:'open'})],{addLabel:'Зарегистрировать обращение',labelField:'code',hint:'Перенесите только разрешённый текст. Ответственный — существующий аккаунт. После первого ответа номер, филиал, тема и вопрос защищены.'}),
  C('replies','Ответы',[R('case','Обращение','cases',{readOnly:true}),F('body','Текст ответа','textarea'),S('status','Стадия ответа',[['draft','Черновик'],['review','На проверке'],['approved','Одобрен'],['sent','Отправка отмечена']],{default:'draft'}),F('evidence','Основание отметки отправки','textarea',{required:false,help:'Заполняет автор при ручной отметке. Например: номер исходящего сообщения во внешней системе. Приложение ничего не отправляет.'})],{addLabel:'Подготовить ответ',description:'Автор готовит черновик и передаёт на проверку. Другой администратор одобряет именно эту версию. После правки нужно новое одобрение.'})
 ],
 normalizeRow(key,row,state,old,actor){
  if(key!=='replies')return row;
  const source=byId(state,'cases',row.case),branch=byId(state,'branches',source.branch);
  if(!old){
   required(!source.archived&&source.status==='open'&&!branch.archived,'Новый ответ требует открытого обращения и действующего филиала.');
   required(actor.name===source.assignee,'Ответ пишет назначенный сотрудник.');
   required(row.status==='draft'&&!row.evidence,'Новый ответ сохраняется черновиком без отметки отправки.');
   return {...row,author:actor.name,version:1,approval:null,reviews:[],dispatch:null,source:{caseId:source.id,code:source.code,branch:source.branch,branchName:branch.name,subject:source.subject,question:source.question,assignee:source.assignee}};
  }
  immutable(old,row,['case'],'Ссылка ответа на обращение неизменна.');
  const next={...row,author:old.author,version:old.version,approval:old.approval,reviews:old.reviews,dispatch:old.dispatch,source:old.source};
  if(old.status==='sent'){
   immutable(old,row,['body','status','evidence'],'Отмеченный отправленным ответ неизменен. Новый ответ создаётся отдельно.');return next;
  }
  required(!source.archived&&source.status==='open'&&!branch.archived,'Для продолжения нужно открытое обращение действующего филиала.');
  const author=actor.name===old.author&&actor.name===source.assignee;
  if(row.body!==old.body){
   required(author,'Текст меняет только назначенный автор.');
   required(row.status==='draft','Правку сохраните черновиком: прежнее одобрение будет снято.');
   next.version++;next.approval=null;
  }
  if(row.status!==old.status){
   if(row.status==='draft'){
    required(author||(actor.role==='admin'&&old.status==='review'),'Вернуть в черновик может автор, а с проверки — также администратор.');next.approval=null;
   }else if(row.status==='review'){
    required(author&&old.status==='draft'&&row.body===old.body,'Сначала сохраните черновик, затем передайте его на проверку.');
   }else if(row.status==='approved'){
    required(actor.role==='admin'&&actor.name!==old.author&&old.status==='review'&&row.body===old.body,'Неизменённый ответ на проверке одобряет другой администратор.');
    next.approval={by:actor.name,version:old.version,body:old.body,at:new Date().toISOString()};next.reviews=[...old.reviews,next.approval];
   }else if(row.status==='sent'){
    required(author&&old.status==='approved'&&row.body===old.body,'Отметить отправку может автор после одобрения этой версии.');
    required(old.approval?.version===old.version&&old.approval.body===old.body,'Одобрение не соответствует текущему ответу.');
    required(row.evidence.trim().length>0,'Укажите основание ручной отметки отправки.');
    next.dispatch={by:actor.name,at:new Date().toISOString(),version:old.version,body:old.body,evidence:row.evidence};
   }else required(false,'Недопустимая стадия.');
  }else required(author,'Продолжает ответ назначенный автор; для одобрения выберите новую стадию.');
  if(row.status!=='sent')required(row.evidence==='','Основание указывается только при отметке отправки.');
  return next;
 },
 validate(state,before,command,actor){
  unique(rows(state,'branches'),'name','Филиал');unique(rows(state,'cases'),'code','Номер обращения');
  for(const c of rows(state,'cases')){
   const b=byId(state,'branches',c.branch),old=changed(before,'cases',c.id),replies=rows(state,'replies').filter(r=>r.case===c.id);
   required(isName(c.assignee),'Укажите имя существующего аккаунта.');
   if(!old||old.branch!==c.branch||old.status!==c.status){
    if(c.status==='open'||!old||old.branch!==c.branch)required(!b.archived,'Новая или повторно открытая работа требует действующего филиала.');
   }
   if(old&&replies.length)immutable(old,c,['code','branch','subject','question'],'Обращение уже имеет ответ: исходный текст и связь защищены, включая архивную историю.');
   if(old&&old.assignee!==c.assignee)required(!replies.some(liveReply),'Сначала завершите или явно архивируйте незавершённый ответ.');
   if(old&&old.status!==c.status)required(actor.role==='admin'||actor.name===old.assignee,'Состояние меняет ответственный или администратор.');
   if(c.status==='closed')required(!replies.some(liveReply),'Есть незавершённый ответ: завершите его или явно архивируйте.');
   if(c.archived)required(c.status==='closed','Сначала закройте обращение.');
  }
  for(const b of rows(state,'branches'))if(b.archived)required(!rows(state,'cases').some(c=>c.branch===b.id&&!c.archived&&c.status==='open'),'Филиал имеет открытое обращение.');
  for(const r of rows(state,'replies')){
   byId(state,'cases',r.case);
   required(isName(r.author)&&Number.isSafeInteger(r.version)&&r.version>0,'Неверная версия или автор ответа.');
   required(r.source?.caseId===r.case&&isName(r.source.assignee)&&['code','branchName','subject','question'].every(k=>typeof r.source[k]==='string'&&r.source[k].length>0),'Неверный снимок обращения.');
   required(Array.isArray(r.reviews),'Неверная история проверок.');
   for(const a of r.reviews)required(isName(a.by)&&a.by!==r.author&&Number.isSafeInteger(a.version)&&a.version>0&&a.version<=r.version&&typeof a.body==='string'&&a.body.length>0&&Number.isFinite(Date.parse(a.at)),'Неверная запись проверки.');
   if(['approved','sent'].includes(r.status))required(r.approval?.by!==r.author&&r.approval?.version===r.version&&r.approval?.body===r.body&&r.reviews.some(a=>same(a,r.approval)),'Нужно независимое одобрение текущего текста и версии.');
   else required(r.approval===null,'Черновик и проверка не имеют действующего одобрения.');
   if(r.status==='sent')required(r.evidence.length>0&&r.dispatch?.by===r.author&&r.dispatch.version===r.version&&r.dispatch.body===r.body&&r.dispatch.evidence===r.evidence&&Number.isFinite(Date.parse(r.dispatch.at)),'Неверный снимок ручной отправки.');
   else required(r.dispatch===null&&r.evidence==='','Незавершённый ответ не имеет отметки отправки.');
   const old=changed(before,'replies',r.id);
   if(old&&command.operation==='archive')immutable(old,r,['case','body','status','evidence','author','version','approval','reviews','dispatch','source']);
  }
  for(const c of rows(state,'cases'))required(rows(state,'replies').filter(r=>r.case===c.id&&liveReply(r)).length<=1,'У обращения уже есть незавершённый ответ.');
 },
 summarize(state){return rows(state,'replies').filter(r=>!r.archived).map(r=>summary(r.source.code+' · версия '+r.version,r.status==='sent'?'Отправка отмечена вручную; доставка не проверена.':r.status==='approved'?'Одобрил '+r.approval.by:r.status==='review'?'Ожидает другого администратора':'Автор: '+r.author,'Сохранённых проверок: '+r.reviews.length));}
};
