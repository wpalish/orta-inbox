const node = (tag, text, cls) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (cls) element.className = cls;
  return element;
};
const names = {draft:'Черновик', review:'На проверке', approved:'Одобрен', sent:'Отправка отмечена', open:'Открыто', closed:'Закрыто'};
const selected = {};
function action(text, fn, cls='secondary') {
  const button=node('button',text,cls); button.type='button'; button.onclick=fn; return button;
}
function tag(value) { return node('span',names[value] || value,'state-tag state-'+value); }
function note(title, text) {
  const section=node('section',undefined,'review-note');
  section.append(node('h3',title),node('p',text)); return section;
}
function metadata(items) {
  const list=node('dl',undefined,'context-list');
  for(const [label,value] of items) list.append(node('dt',label),node('dd',value));
  return list;
}

// Presentation only. All writes still use the existing revision-checked editor.
export function productView(host,{active,values,state,user,onOpen,onCreate}) {
  if(!['cases','replies'].includes(active)) return false;
  const workspace=node('div',undefined,'inbox-workspace');
  const queue=node('section',undefined,'request-queue');
  const detail=node('section',undefined,'request-detail');
  detail.setAttribute('aria-label','Выбранная запись и проверка ответа');detail.tabIndex=-1;
  queue.append(node('h2',active==='cases'?'Очередь обращений':'Версии ответов'));
  const choices=[];
  const replyFor=id=>state.data.replies.filter(r=>r.case===id&&!r.archived).at(-1);
  const selectRow=(row,moveFocus=false)=>{
    selected[active]=row.id;
    for(const {button,id} of choices) button.setAttribute('aria-pressed',String(id===row.id));
    detail.replaceChildren(action('К очереди обращений',()=>{queue.scrollIntoView({block:'start',behavior:'instant'});choices.find(item=>item.id===row.id)?.button.focus({preventScroll:true});},'secondary mobile-back'));
    const request=active==='cases'?row:state.data.cases.find(c=>c.id===row.case);
    const reply=active==='replies'?row:replyFor(row.id);
    const source=reply?.source;
    const code=source?.code || request?.code || 'Обращение';
    const subject=source?.subject || request?.subject;
    const branch=source?.branchName || state.data.branches.find(b=>b.id===request?.branch)?.name;
    const heading=node('div',undefined,'detail-heading');
    heading.append(node('p',code,'eyebrow'),node('h2',subject),tag(row.status));
    if(row.archived) heading.append(node('span','Архив','state-tag'));
    detail.append(heading,metadata([['Филиал',branch || 'Связь не найдена'],['Ответственный',request?.assignee || source?.assignee || '—']]));
    const question=note('Обращение',source?.question || request?.question || 'Исходный текст не найден.');
    question.classList.add('request-message'); detail.append(question);
    if(reply){
      const review=node('section',undefined,'reply-review');
      const line=node('div',undefined,'reply-heading');
      line.append(node('h3','Ответ · версия '+reply.version),tag(reply.status));
      review.append(line,node('p',reply.body,'answer reply-body'),metadata([['Автор',reply.author],['Точная версия', 'v'+reply.version],['Одобрение',reply.approval?'v'+reply.approval.version+' · '+reply.approval.by:'Не получено']]));
      const guidance=reply.status==='draft'?'Сначала сохраните текст. Передача на проверку выполняется отдельным сохранением.':reply.status==='review'?'Другой администратор проверяет неизменённый текст этой версии. Автор не может одобрить свой ответ.':reply.status==='approved'?'Одобрена эта версия. Назначенный автор может указать основание и вручную отметить отправку.':'Автор вручную отметил отправку. Эта запись не подтверждает доставку внешнего сообщения.';
      review.append(node('p',guidance,'review-guidance'));
      if(reply.dispatch) review.append(note('Основание ручной отметки',reply.dispatch.evidence));
      const history=node('details'); history.append(node('summary','История независимых проверок · '+reply.reviews.length));
      if(!reply.reviews.length) history.append(node('p','Проверенных версий пока нет.','muted'));
      for(const check of reply.reviews){const item=node('div',undefined,'history-entry');item.append(node('p','v'+check.version+' · '+check.by+' · '+check.at,'eyebrow'),node('p',check.body,'answer'));history.append(item);}
      review.append(history,action(reply.archived||reply.status==='sent'?'Прочитать ответ':'Открыть текст и стадию',()=>onOpen('replies',reply),'primary'));
      detail.append(review);
    }else{
      detail.append(note('Ответ ещё не подготовлен','Зарегистрированное обращение остаётся в очереди. Текст готовит назначенный сотрудник.'));
      const branchRow=state.data.branches.find(b=>b.id===request?.branch);
      if(request&&!request.archived&&request.status==='open'&&!branchRow?.archived&&request.assignee===user.name)
        detail.append(action('Подготовить первый ответ',()=>onCreate('replies',{case:request.id}),'primary'));
    }
    const controls=node('div',undefined,'actions');
    if(request) {
      controls.append(action('Карточка обращения',()=>onOpen('cases',request)));
      const branchRow=state.data.branches.find(b=>b.id===request.branch);
      const replies=state.data.replies.filter(r=>r.case===request.id);
      if(reply?.status==='sent'&&!request.archived&&request.status==='open'&&!branchRow?.archived&&request.assignee===user.name&&!replies.some(r=>!r.archived&&r.status!=='sent'))
        controls.append(action('Подготовить новый ответ',()=>onCreate('replies',{case:request.id}),'primary'));
      if(replies.length>1){const history=node('details');history.append(node('summary','Все ответы обращения · '+replies.length));for(const item of replies)history.append(action('v'+item.version+' · '+names[item.status]+(item.archived?' · Архив':''),()=>onOpen('replies',item)));detail.append(history);}
    }
    detail.append(controls);
    if(moveFocus&&matchMedia('(max-width:650px)').matches){detail.scrollIntoView({block:'start',behavior:'instant'});detail.focus({preventScroll:true});}
  };
  for(const row of values){
    const reply=active==='replies'?row:replyFor(row.id);
    const request=active==='cases'?row:state.data.cases.find(c=>c.id===row.case);
    const button=action('',()=>selectRow(row,true),'queue-item');
    button.append(node('span',(active==='cases'?row.code:row.source.code)+(row.archived?' · Архив':''),'queue-code'),node('strong',active==='cases'?row.subject:row.source.subject),node('span',request?.assignee || row.author,'queue-owner'));
    const line=node('span',undefined,'queue-states');line.append(tag(reply?.status || row.status));
    if(reply) line.append(node('span','v'+reply.version,'version-label'));
    button.append(line); queue.append(button); choices.push({button,id:row.id});
  }
  workspace.append(queue,detail);host.append(workspace);
  selectRow(values.find(r=>r.id===selected[active]) || values[0]);
  return true;
}
