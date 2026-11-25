(() => {
  const cards = [...document.querySelectorAll('#cases .case-card')];
  if (!cards.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'case-dialog';
  dialog.setAttribute('aria-labelledby', 'case-dialog-title');
  dialog.innerHTML = `<div class="case-dialog-header"><div><p class="case-dialog-eyebrow">Aurdeus · 客户案例</p><h2 id="case-dialog-title"></h2></div><button type="button" class="case-dialog-close" aria-label="关闭案例详情" autofocus>×</button></div><div class="case-dialog-content"></div><div class="case-dialog-footer"><span>AI 政企应用 / 行业解决方案</span></div>`;
  document.body.append(dialog);
  const content = dialog.querySelector('.case-dialog-content');
  let opener, previousOverflow;
  const manufacturing = `<div class="case-detail-grid"><section class="case-pain"><p class="case-detail-index">业务挑战</p><h3>传统痛点</h3><p>多个事业部和工厂的人力、生产与财务数据分散在不同系统。管理者往往要等报表汇总后，才能发现人效变化，再逐级排查原因。</p><p>工厂排班主要依靠人工经验，遇到临时插单或生产计划调整时，很难在短时间内排出兼顾产能、员工技能和用工合规要求的班表。</p></section><section class="case-solution"><p class="case-detail-index">Aurdeus AI</p><h3>解决方案</h3><article><span class="case-solution-number">01</span><div><h4>人效经营驾驶舱</h4><p>Aurdeus AI 整合人力、生产与财务数据，让管理者可以从集团逐级查看事业部、工厂和班组的人效指标。指标异常时，系统及时预警，帮助管理者定位到具体工厂或班组，分析波动原因。</p></div></article><article><span class="case-solution-number">02</span><div><h4>智能排班系统</h4><p>系统根据产能计划、订单需求、员工技能和用工规则自动生成班表。遇到临时插单或计划变化时，可重新匹配人员与班次，让排班安排跟上生产节奏。</p></div></article></section></div>`;
  const education = `<div class="case-detail-grid"><section class="case-pain"><h3>传统痛点</h3><p>课前，教师要梳理知识点、准备教学材料、设计练习。课后，还要逐份批改作业、给出反馈。备课与批改占用大量时间，留给个别辅导的时间有限。学生遇到课业难点或情绪困扰时，也需要方便获取的学习与心理健康支持。</p></section><section class="case-solution"><h3>解决方案</h3><p>Aurdeus AI 为教育局建设了 AI 教育智能体平台，服务教师日常教学和学生学习成长。</p><article><span class="case-solution-number">01</span><div><h4>教师教学辅助</h4><p>智能体协助教师整理备课材料、梳理课堂重点，并辅助批改作业，让教师有更多时间讲解难点、回应学生的具体问题。</p></div></article><article><span class="case-solution-number">02</span><div><h4>学生学习与心理健康支持</h4><p>平台将学习辅导与心理健康教育资源汇集在同一入口，方便学生根据自身需要查找学习帮助或心理支持资源。</p></div></article></section></div><p class="case-result">据项目统计，平台投入使用后，教师备课时间缩短<strong>60%</strong>，作业批改效率提升了 <strong>70%</strong>。</p>`;
  const electronics = `<div class="case-detail-grid"><section class="case-pain"><h3>传统痛点</h3><ul class="case-points"><li><strong>家庭记忆分散</strong>照片、视频和日常对话分散在不同设备和云端。家人想回顾同一件事，往往要在多个地方翻找记录。</li><li><strong>情感陪伴不足</strong>智能音箱和智能屏的交流多停留在一问一答，难以察觉家人的情绪变化，也缺少日常生活中的主动关怀。</li><li><strong>数据隐私顾虑</strong>当家庭影像和语音需要上传云端处理时，用户会担心这些私人记录如何保存、谁能访问。</li></ul></section><section class="case-solution"><h3>解决方案</h3><ul class="case-points"><li><strong>语音、视觉与手势交互</strong>终端结合家人说的话、手势和画面线索，理解用户指向的对象和想要执行的操作。</li><li><strong>多轮对话</strong>终端能联系前文理解追问、补充和调整，让家人可以围绕同一件事继续交流，减少重复说明。</li><li><strong>情绪感知与个性化语音合成</strong>终端结合对话中的情绪线索，以更贴合当下情境的语气回应，让日常交流更有陪伴感。</li></ul></section></div>`;
  const justice = `<div class="case-detail-grid"><section class="case-pain"><h3>传统痛点</h3><p>评估一项专利被宣告无效的风险，律师需要从大量技术文献中找出相关资料，再逐项比对专利权利要求中的技术特征。人工检索耗时长、覆盖范围有限，关键文献的筛选与判断高度依赖资深人员的经验。</p></section><section class="case-solution"><h3>解决方案</h3><p>Aurdeus AI 为律所开发了专利稳定性分析系统，将文献检索、技术比对与风险评估整合到同一流程中。</p><article><span class="case-solution-number">01</span><div><h4>智能检索与技术特征比对</h4><p>系统围绕目标专利检索相关文献，将文献公开的技术内容与权利要求逐项比对，帮助律师定位关键技术特征的相同点和差异。</p></div></article><article><span class="case-solution-number">02</span><div><h4>无效风险评估与报告生成</h4><p>系统依据比对结果提示可能影响专利稳定性的风险点，并将相关文献、比对结果和评估依据汇总成报告，供律师复核。</p></div></article></section></div><p class="case-result">据项目统计，采用 Aurdeus AI 系统后，律所出具一份专利稳定性分析报告的时间从 <strong>5-7 天</strong>缩短至 <strong>30 分钟</strong>。文献检索覆盖率从 <strong>20%–30%</strong> 提升至 <strong>95%</strong> 以上，单人可处理的专利数量从 <strong>3-5 件</strong>增至 <strong>50 件</strong>。</p>`;
  const government = `<div class="case-detail-grid"><section class="case-pain"><h3>传统痛点</h3><p>平果市市场监督管理局每年需审查 5,000 余份政策文件。审查人员逐条对照公平竞争审查标准，单份文件的人工审查耗时 2-3 小时。不同人员对同一标准的理解可能存在差异，在大量条款中也容易遗漏可能限制市场竞争的内容。</p></section><section class="case-solution"><h3>解决方案</h3><p>Aurdeus AI 为平果市市场监督管理局开发了覆盖文件受理、条款审查与数字归档的辅助审查系统。</p><article><span class="case-solution-number">01</span><div><h4>文件解析与条款比对</h4><p>系统自动识别多种格式的政策文件，提取并整理条款，根据条款含义逐项匹配公平竞争审查标准。</p></div></article><article><span class="case-solution-number">02</span><div><h4>风险分级与依据标注</h4><p>对可能影响公平竞争的条款标明风险等级，并列出对应的政策依据，方便审查人员定位原文、核对判断。</p></div></article><article><span class="case-solution-number">03</span><div><h4>报告生成与数字归档</h4><p>系统汇总风险条款及依据，生成标准化审查报告供工作人员复核，并保留从受理到归档的完整记录。</p></div></article></section></div><p class="case-result">据项目实施数据，采用 AI 辅助审查后，审查效率较传统人工方式提升 <strong>65%</strong>。</p>`;
  function open(card, i) {
    opener = card.querySelector('.case-card-open');
    const title = card.querySelector('figcaption > span').textContent;
    dialog.querySelector('h2').textContent = title;
    content.replaceChildren();
    if (title === '传统制造业') content.innerHTML = manufacturing;
    else if (title === '教育行业') content.innerHTML = education;
    else if (title === '消费电子行业') content.innerHTML = electronics;
    else if (title === '司法行业') content.innerHTML = justice;
    else if (title === '政府机关') content.innerHTML = government;
    else {
      const section = document.createElement('section'); section.className = 'case-overview';
      const h = document.createElement('h3'); h.textContent = '应用方向';
      const p = document.createElement('p'); p.textContent = card.querySelector('.case-card__copy').textContent;
      const note = document.createElement('p'); note.className = 'case-detail-note'; note.textContent = '更多案例详情，欢迎与我们交流。';
      const link = document.createElement('a'); link.href = 'mailto:business@aurdeus.com'; link.textContent = '联系 AURDEUS →';
      section.append(h,p,note,link); content.append(section);
    }
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; dialog.showModal(); content.scrollTop = 0;
  }
  cards.forEach((card,i) => {
    const button = document.createElement('button'); button.className = 'case-card-open'; button.type = 'button';
    button.setAttribute('aria-label','查看'+card.querySelector('figcaption > span').textContent+'案例详情'); button.setAttribute('aria-haspopup','dialog');
    button.innerHTML = '<span aria-hidden="true">查看详情 ↗</span>'; card.append(button);
    button.addEventListener('click',()=>open(card,i));
  });
  dialog.querySelector('.case-dialog-close').addEventListener('click',()=>dialog.close());
  let outsideDown = false;
  const outside = e => { const r=dialog.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom; };
  dialog.addEventListener('pointerdown',e=>outsideDown=outside(e));
  dialog.addEventListener('click',e=>{if(outsideDown&&outside(e))dialog.close();outsideDown=false;});
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;opener?.focus({preventScroll:true});});
})();
