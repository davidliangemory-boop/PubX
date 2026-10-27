"""HK/SEC/outbound 提示点与待观察问题：只从已收录字段与原文标题/摘录派生，不生成事实。"""
import re
from collections import defaultdict
from research_schema import publish_text

COUNTRIES = [('中国内地', r'中國內地|中国内地|中華人民共和國|中华人民共和国|\bPRC\b|mainland China'), ('香港', r'香港|Hong Kong'),
    ('美国', r'美國|美国|United States|\bU\.S\.'), ('新加坡', r'新加坡|Singapore'), ('印尼', r'印尼|印度尼西亞|印度尼西亚|Indonesia'),
    ('马来西亚', r'馬來西亞|马来西亚|Malaysia'), ('泰国', r'泰國|泰国|Thailand'), ('越南', r'越南|Vietnam'), ('日本', r'日本|Japan'),
    ('韩国', r'韓國|韩国|Korea'), ('澳大利亚', r'澳大利亞|澳大利亚|澳洲|Australia'), ('英国', r'英國|英国|United Kingdom|\bUK\b'),
    ('加拿大', r'加拿大|Canada'), ('开曼群岛', r'開曼|开曼|Cayman'), ('英属维尔京群岛', r'英屬維爾京|英属维尔京|British Virgin|\bBVI\b'),
    ('百慕大', r'百慕達|百慕大|Bermuda'), ('以色列', r'以色列|Israel'), ('德国', r'德國|德国|Germany'), ('法国', r'法國|法国|France'),
    ('荷兰', r'荷蘭|荷兰|Netherlands'), ('瑞士', r'瑞士|Switzerland'), ('印度', r'印度(?!尼)|India\b'), ('阿联酋', r'阿聯酋|阿联酋|UAE|Dubai|迪拜'),
    ('沙特', r'沙特|Saudi'), ('巴西', r'巴西|Brazil'), ('墨西哥', r'墨西哥|Mexico'), ('澳门', r'澳門|澳门|Macau'), ('台湾', r'台灣|台湾|Taiwan')]

US_ITEMS = {'1.01': '签订重大协议', '1.02': '终止重大协议', '2.01': '完成收购或处置', '2.02': '经营业绩', '2.03': '新增债务义务',
    '2.05': '退出或重组成本', '3.01': '退市或上市规则通知', '3.02': '未登记股权发行', '3.03': '证券持有人权利变更', '4.01': '更换审计师',
    '5.01': '控制权变更', '5.02': '董事高管变动', '5.03': '章程或财年变更', '5.07': '股东表决结果', '7.01': 'Reg FD 披露', '8.01': '其他事项'}
US_FORMS = [(r'^6-K', '外国私人发行人（6-K）'), (r'^20-F', '外国私人发行人（20-F）'), (r'^8-K', '美国本土申报（8-K）'),
    (r'^425', '并购沟通材料（425）'), (r'^S-4|^F-4', '换股并购注册（S-4/F-4）'), (r'^S-1|^F-1', 'IPO/发行注册（S-1/F-1）'),
    (r'^SC TO', '要约收购（SC TO）'), (r'^DEFM14A|^PREM14A', '并购股东投票委托书'), (r'^SC 13D', '大股东持股（13D）')]
HK_CUES = [(r'供股', '供股'), (r'配售', '配售'), (r'關連|关连', '关连交易'), (r'須予披露|须予披露', '须予披露交易'), (r'主要交易', '主要交易'),
    (r'非常重大', '非常重大交易'), (r'收購守則|收购守则|要約|要约|私有化', '收购守则'), (r'通函', '通函'), (r'股東特別大會|股东特别大会', '股东大会'),
    (r'清盤|清盘', '清盘'), (r'停牌|復牌|复牌', '停复牌'), (r'核數師|核数师', '核数师变动'), (r'盈利警告|盈利預警', '盈利警告')]

# Concrete questions per type; never assert the answer.
WATCH = {
    '配售供股': ['认购/配售结果公告是否披露实际募资额与认购率？', '未获认购部分如何处理（包销、补偿安排或放弃）？', '完成后主要股东持股是否触及收购守则或公众持股量门槛？'],
    '融资': ['最终发行规模、定价与资金用途是否与首次公告一致？', '发行完成后的摊薄与主要股东持股如何变化？'],
    '持续关连交易（CCT）': ['年度上限是否需要独立股东批准，表决结果如何？', '独立财务顾问对定价机制与上限的结论是什么？', '历史实际交易额与上限的使用率是多少？'],
    '关连交易': ['交易是否需要独立股东批准，关连人士是否放弃表决？', '对价依据（估值报告/协商）在通函中如何披露？'],
    '须予披露交易': ['百分比率测试结果及交易分类是否在后续公告中调整？', '交割条件与完成日期何时公告？'],
    '主要交易': ['通函寄发与股东批准时间表是否延期？', '标的估值、盈利与对价支付安排在通函中如何披露？', '交割前先决条件（含审批）何时满足？'],
    '非常重大交易': ['通函与股东大会是否按时间表推进？', '标的财务资料与估值是否经独立审阅？', '是否涉及反向收购或新上市申请认定？'],
    '收购守则/私有化': ['要约/计划文件是否披露最高现金需求与财务顾问确认？', '法院会议与股东大会投票结果是否达到门槛？', '先决条件与最后截止日期是否延期？'],
    '并购': ['监管审批（反垄断、外资审查）与股东投票进度如何？', '对价、溢价与估值依据在后续文件中如何披露？', '预计完成时间是否推迟、是否触发终止费？'],
    '治理变更': ['人事或章程变动的原因是否在后续公告中说明？', '变动是否影响控制权、审计或上市地位？'],
    '监管执法': ['处罚或调查结论是否有后续公告与申诉安排？', '是否影响公司业务许可或董事任职？'],
    '其他重大事项': ['该事项是否有后续公告说明金额、条件或完成情况？'],
}


def text_of(src):
    return ' '.join(str(src.get(k) or '') for k in ('title', 'file', 'excerpt', 'new_info'))


def build_issuer_index(events):
    idx = defaultdict(list)
    for e in events:
        iid = publish_text(e.get('issuer_id'))
        if iid:
            idx[(e['market']['value'], iid)].append(e)
    return idx


def tips(event, issuer_index):
    r = event['research']
    market = event['market']['value']
    sources = event.get('sources', {}).get('value') or []
    blob = ' '.join(text_of(s) for s in sources)[:20000] + ' ' + ' '.join(x if isinstance(x, str) else x.get('text', '') for x in r.get('summary', []))
    out = []
    iid = publish_text(event.get('issuer_id'))
    base = {'hk': 'hk-market', 'us': 'us', 'outbound': 'research'}[market]
    # 国别 / 法域
    if market == 'hk':
        out.append(dict(kind='国别', label='上市地', value='香港联交所' + ('｜' + iid if iid and re.fullmatch(r'\d{4,5}', iid) else '')))
    if market == 'us':
        forms = [publish_text(s.get('form')).upper() for s in sources]
        for pat, label in US_FORMS:
            if any(re.match(pat, f) for f in forms):
                out.append(dict(kind='国别', label='申报身份', value=label))
                break
    geo = publish_text(event.get('geography'))
    countries = [geo] if geo else []
    countries += [name for name, pat in COUNTRIES if re.search(pat, blob, re.I) and name not in countries]
    home = {'hk': '香港', 'us': '美国'}.get(market)
    countries = [c for c in countries if c != home]
    if countries:
        out.append(dict(kind='国别', label='文件提及国家/地区', value='、'.join(countries[:5]), href='#/' + base + '?v=events&geo=' + countries[0]))
    # 进度
    stage = publish_text(event.get('stage')) or publish_text(r.get('stage'))
    from research_structure import is_substantive
    sub = [s for s in sources if is_substantive(s) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(s.get('date', '')))]
    if stage and stage != '其他':
        out.append(dict(kind='进度', label='阶段', value=stage))
    if sub:
        dates = sorted(s['date'] for s in sub)
        out.append(dict(kind='进度', label='实质文件', value=f'{len(sub)} 份｜{dates[0]}' + (f' → {dates[-1]}' if dates[-1] != dates[0] else '')))
    if market == 'outbound' and r.get('project_maturity'):
        out.append(dict(kind='进度', label='项目成熟度', value='见下方项目成熟度', href='#/board'))
    lsd = publish_text(event.get('long_stop_date'))
    if lsd:
        out.append(dict(kind='进度', label='最后截止日', value=lsd))
    # 文件类型线索
    cues = []
    if market == 'us':
        items = sorted({i for s in sources for i in (s.get('items') or []) if i in US_ITEMS and i != '9.01'})
        cues = [f'Item {i} {US_ITEMS[i]}' for i in items]
    elif market == 'hk':
        titles = ' '.join(publish_text(s.get('title')) for s in sources)
        cues = [label for pat, label in HK_CUES if re.search(pat, titles)]
    typ = publish_text(event.get('event_type'))
    if typ and typ != '其他重大事项':
        out.append(dict(kind='类型', label='事件类型', value=typ, href='#/' + base + '?v=events&type=' + typ))
    for c in cues[:4]:
        out.append(dict(kind='类型', label='文件线索', value=c))
    # 公司档案
    if iid:
        peers = [e for e in issuer_index.get((market, iid), []) if e is not event]
        name = (publish_lines_first(event.get('parties')) or iid)
        val = name + (f'｜另有 {len(peers)} 个事件' if peers else '｜本站首个事件')
        out.append(dict(kind='公司档案', label='发行人', value=val, href='#/' + base + '?v=events&issuer=' + iid))
        for p in sorted(peers, key=lambda e: publish_text(e.get('disclosure_date')), reverse=True)[:3]:
            t = p['research'].get('title') or publish_text(p.get('title'))
            out.append(dict(kind='公司档案', label='同一发行人', value=(publish_text(p.get('disclosure_date')) + ' ' + t)[:70], href='#/event/' + p['event_id']['value']))
    if market == 'outbound':
        out.append(dict(kind='公司档案', label='企业档案', value='查看主体事件链', href='#/cos'))
    r['tips'] = [t for t in out if t.get('value')]
    if market in ('hk', 'us') and not r.get('watch_items'):
        qs = list(WATCH.get(typ, WATCH['其他重大事项']))
        if lsd:
            qs.insert(0, f'最后截止日 {lsd} 前先决条件能否全部满足，是否延期？')
        if countries and any(c not in ('中国内地', '香港', '美国') for c in countries):
            qs.append('涉及' + '、'.join(c for c in countries if c not in ('中国内地', '香港', '美国'))[:20] + '的部分是否需要当地审批或外资审查？')
        r['watch_items'] = [dict(text=q, kind='question') for q in qs]


def publish_lines_first(field):
    v = field.get('value') if isinstance(field, dict) else field
    if isinstance(v, list):
        v = next((publish_text(x) for x in v if publish_text(x)), '')
    return publish_text(v)

FRAME = {
    '配售供股': ['财务：看募资净额相对市值与现金缺口，折让幅度决定对现有股东的价值转移。', '战略：看资金用途是偿债、补流还是新业务，判断是否为持续经营续命。', '投资：看大股东是否全额认购及包销安排，这是对定价最直接的背书信号。'],
    '融资': ['财务：看融资规模、成本与期限对资产负债表的影响。', '战略：看资金投向是否对应明确项目。', '投资：看摊薄幅度与发行价相对市价的折让。'],
    '持续关连交易（CCT）': ['财务：看年度上限相对收入/成本的占比，判断对关联方的依赖度。', '战略：看是否为集团内长期供销安排，关注定价是否参照市场价。', '投资：看独立股东表决与IFA意见，这是少数股东保护的关键关口。'],
    '关连交易': ['财务：看对价相对净资产/估值的溢折价。', '战略：看交易是否属集团资产重组或利益输送风险点。', '投资：看独立股东批准与关连人士回避表决情况。'],
    '须予披露交易': ['财务：看对价相对总资产/市值的规模，以及支付方式（现金/股份）。', '战略：看标的与主业的协同或多元化方向。', '投资：看完成条件与交割时间，确认交易能否落地。'],
    '主要交易': ['财务：看对价、标的盈利与估值倍数，判断价格是否合理。', '战略：看交易对主营结构的改变幅度。', '投资：看股东批准与先决条件进度，评估完成概率。'],
    '非常重大交易': ['财务：交易规模已达非常重大，重点看估值与资金来源。', '战略：看是否构成业务转型或反向收购。', '投资：看监管认定与股东表决，这是成败关键。'],
    '收购守则/私有化': ['财务：看要约价相对历史股价的溢价与隐含估值。', '战略：看要约人动机（退市、整合、控制权）。', '投资：看投票门槛、无利害关系股东态度与截止日期，判断完成概率。'],
    '并购': ['财务：看企业价值/股权价值、对价形式与EPS影响。', '战略：看协同来源与整合风险。', '投资：看监管审批、股东投票与终止费，判断完成概率。'],
    '治理变更': ['财务：一般不直接影响报表，关注审计师或CFO变动的信号意义。', '战略：看董事会/管理层更替是否对应控制权或战略调整。', '投资：看变动原因披露是否充分，警惕连续人事异动。'],
    '监管执法': ['财务：看罚款与潜在赔偿规模。', '战略：看业务限制是否影响核心牌照。', '投资：看治理整改与后续诉讼风险。'],
}


def frame(event):
    r = event['research']
    if event['market']['value'] in ('hk', 'us') and r.get('depth') != 'deep' and not r.get('meaning'):
        f = FRAME.get(publish_text(event.get('event_type')))
        if f:
            r['analysis_frame'] = f
