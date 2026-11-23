# -*- coding: utf-8 -*-
"""Build Local SEO Program PDFs: python3 build.py [brand ...]
Outputs 4 files per brand into ../out/: EN, ZH, EN mobile, ZH mobile."""
import os, sys, subprocess, html
from content import BRANDS, T, plan, pricing

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "assets")
OUT = os.path.join(HERE, "..", "out")
os.makedirs(OUT, exist_ok=True)

ICON = {"g": "G", "map": "◎", "lang": "Aa", "lead": "↗"}

CSS = r"""
@page { size: %(pw)s %(ph)s; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', %(cjk)s sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
:root { --c1: %(c1)s; --c2: %(c2)s; --c3: %(c3)s; --ink: %(ink)s; --dark: %(dark)s; --muted: #6b7487; --line: #e3e7ee; --soft: #f4f3ef; }
.page { width: %(pw)s; height: %(ph)s; position: relative; overflow: hidden; page-break-after: always; padding: %(pad)s; }
.page:last-child { page-break-after: auto; }
h1, h2, .big { font-family: 'Inter Display', 'Inter', %(cjk)s sans-serif; font-weight: 800; letter-spacing: -0.03em; }
.eyebrow { font-size: %(eb)s; font-weight: 700; letter-spacing: .18em; color: var(--c2); margin-bottom: 8px; }
h2 { font-size: %(h2)s; line-height: 1.08; color: var(--c1); margin-bottom: 12px; }
.lead { font-size: %(lead)s; line-height: 1.55; color: var(--ink); margin-bottom: 18px; max-width: 520px; }
.small { font-size: %(sm)s; line-height: 1.55; color: var(--muted); }
.lbl { font-size: %(eb)s; font-weight: 700; letter-spacing: .16em; color: var(--c2); margin: 18px 0 8px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.card { border-radius: 12px; padding: 18px; background: #fff; border: 1px solid var(--line); }
.card.dark { background: var(--c1); color: #fff; border: none; }
.card.dark .small { color: #c9d3e3; }
.card h3 { font-size: %(h3)s; font-weight: 800; margin: 6px 0; line-height: 1.25; }
.tag { display: inline-block; font-size: 7px; font-weight: 700; letter-spacing: .14em; padding: 3px 8px; border-radius: 99px; background: #e6eefb; color: var(--c2); }
.card.dark .tag { background: rgba(255,255,255,.15); color: var(--c3); }
.ex { font-style: italic; font-size: %(sm)s; color: #8a93a6; margin-bottom: 6px; }
.card.dark .ex { color: #aab6cc; }
.num { font-family: 'Inter Display','Inter',sans-serif; font-weight: 800; font-size: %(num)s; color: var(--c2); line-height: 1; }
.why h4 { font-size: %(h3)s; font-weight: 800; margin: 8px 0 4px; }
.note { background: var(--soft); border-radius: 10px; padding: 12px 16px; font-size: %(sm)s; line-height: 1.55; color: #5e6578; margin-top: 16px; }
.phases { display: flex; border-radius: 10px; overflow: hidden; }
.phases div { flex: 1; padding: 12px 14px; background: var(--c1); color: #fff; }
.phases div:nth-child(2) { background: var(--dark); flex: 1.6; }
.phases div.opt { background: var(--c3); color: var(--c1); }
.phases small { display: block; font-size: 7px; letter-spacing: .14em; opacity: .8; }
.phases b { display: block; font-size: %(h3)s; margin: 3px 0; }
.phases span { font-size: 8px; opacity: .8; }
.tl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; border-top: 1px solid var(--line); padding-top: 8px; }
.tl b { display: block; font-size: 7.5px; letter-spacing: .12em; color: var(--c2); margin-bottom: 3px; }
.tl span { font-size: %(sm)s; color: var(--ink); line-height: 1.4; }
.gm { display: grid; grid-template-columns: 1fr 1.5fr; gap: 18px; align-items: center; background: var(--soft); border-radius: 12px; padding: 18px; margin-top: 16px; }
.gm h3 { font-size: %(h3b)s; font-weight: 800; color: var(--c1); line-height: 1.15; }
.focus .card { padding: 12px; }
.focus .ic { font-weight: 800; font-size: 13px; color: var(--c2); }
.focus .card.dark .ic { color: var(--c3); }
.ph { display: grid; grid-template-columns: 120px 1fr; gap: 16px; border: 1px solid var(--line); border-radius: 12px; padding: 18px; margin-bottom: 14px; }
.ph ul { gap: 8px 18px; }
.ph .num { font-size: 26px; }
.ph h4 { font-size: %(h3)s; font-weight: 800; color: var(--c1); margin-top: 4px; }
.ph ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 5px 16px; }
.ph li, .chk li { font-size: %(sm)s; line-height: 1.4; padding-left: 14px; position: relative; color: var(--ink); }
.ph li::before, .chk li::before { content: ""; position: absolute; left: 0; top: 3px; width: 7px; height: 7px; border-radius: 50%%; border: 1.5px solid var(--c2); }
.ph .recv { grid-column: 2; background: #eef3fc; border-radius: 6px; padding: 6px 10px; font-size: %(sm)s; color: var(--c1); margin-top: 6px; }
table { width: 100%%; border-collapse: collapse; font-size: %(sm)s; }
th { text-align: left; font-size: 7px; letter-spacing: .14em; color: var(--muted); padding: 6px 6px 6px 0; border-bottom: 1px solid var(--line); }
td { padding: 12px 6px 12px 0; border-bottom: 1px solid var(--line); vertical-align: top; line-height: 1.4; }
td b { display: block; color: var(--c1); }
td i { font-style: normal; color: var(--muted); font-size: 7.5px; }
.pill { display: inline-block; background: var(--c1); color: #fff; font-size: 7px; font-weight: 700; padding: 3px 8px; border-radius: 99px; white-space: nowrap; }
.chk { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; }
.rp { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
.rp div { background: var(--c1); color: #fff; border-radius: 10px; padding: 12px; }
.rp b { display: block; font-size: %(h3)s; } .rp span { font-size: 8px; color: #c9d3e3; }
.inside { list-style: none; }
.inside li { display: grid; grid-template-columns: 26px 1fr; font-size: %(sm)s; padding: 10px 0; border-bottom: 1px solid var(--line); line-height: 1.4; }
.inside li span { color: var(--c2); font-weight: 700; }
.inside b { color: var(--c1); }
.sample { border: 1px solid var(--line); border-radius: 12px; padding: 14px; box-shadow: 0 10px 30px rgba(20,30,60,.12); background: #fff; }
.sample .hd { display: flex; justify-content: space-between; font-size: 7px; font-weight: 700; letter-spacing: .14em; color: var(--c2); }
.sample .hd span { background: #fde9a8; color: #7a5b00; padding: 2px 6px; border-radius: 99px; }
.sample h5 { font-size: 13px; font-weight: 800; color: var(--c1); margin: 8px 0 10px; line-height: 1.3; }
.kpi { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.kpi div { border: 1px solid var(--line); border-radius: 8px; padding: 8px; }
.kpi small { font-size: 6.5px; letter-spacing: .12em; color: var(--muted); display: block; }
.kpi b { font-size: 20px; color: var(--c1); display: block; }
.kpi em { font-style: normal; font-size: 7px; color: #1f9d55; }
.kt { margin-top: 10px; font-size: 8px; } .kt td, .kt th { padding: 5px 4px 5px 0; }
.bars { display: flex; align-items: flex-end; gap: 4px; height: 70px; margin-top: 10px; }
.bars i { flex: 1; background: var(--c3); border-radius: 3px 3px 0 0; } .bars i:last-child { background: var(--c2); }
.price { border-radius: 14px; overflow: hidden; border: 1px solid var(--line); }
.price .top { background: var(--c1); color: #fff; padding: 18px 22px; display: flex; justify-content: space-between; align-items: flex-end; }
.price .top h3 { font-size: 20px; font-weight: 800; } .price .top .small { color: #c9d3e3; }
.price .top .big { font-size: 38px; color: var(--c3); text-align: right; line-height: 1; }
.price .top .big small { display: block; font-family: 'Inter', %(cjk)s sans-serif; font-weight: 400; font-size: 8px; letter-spacing: 0; color: #c9d3e3; margin-top: 4px; }
.price .body { display: grid; grid-template-columns: 1.05fr 1fr; gap: 22px; padding: 18px 22px; }
.prow { display: flex; justify-content: space-between; gap: 12px; font-size: %(sm)s; padding: 11px 0; border-bottom: 1px solid var(--line); color: var(--c1); }
.prow b { white-space: nowrap; }
.pay { font-size: %(sm)s; line-height: 1.55; color: #5e6578; margin-top: 10px; }
.pay b { color: var(--c1); }
.incl { list-style: none; } .incl li { font-size: %(sm)s; padding: 6px 0 6px 16px; position: relative; color: var(--c1); line-height: 1.4; }
.incl li::before { content: "✓"; position: absolute; left: 0; color: var(--c2); font-weight: 800; }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 8px; }
.steps div { border-top: 3px solid var(--c2); padding-top: 10px; font-size: %(sm)s; line-height: 1.4; color: var(--ink); }
.steps b { display: block; font-size: 16px; color: var(--c2); margin-bottom: 3px; }
.sig { position: absolute; left: %(px)s; right: %(px)s; bottom: 62px; background: var(--c1); border-radius: 12px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; color: #fff; }
.sig .l { display: flex; align-items: center; gap: 14px; } .sig img { height: 30px; }
.sig .n { font-weight: 800; font-size: 13px; } .sig .t { font-size: 8px; color: #c9d3e3; margin-top: 2px; line-height: 1.4; }
.sig .r { text-align: right; font-size: 9px; line-height: 1.7; } .sig .r b { color: var(--c3); }
.foot { position: absolute; left: %(px)s; right: %(px)s; bottom: 26px; display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 8px; }
.foot img { height: 11px; }
/* cover */
.cover { background: %(cover_bg)s; color: #fff; }
.cover::after { content: ""; position: absolute; right: -120px; top: -140px; width: 460px; height: 460px; border-radius: 50%%; background: radial-gradient(circle, %(glow)s, rgba(0,0,0,0) 70%%); }
.cover .brand img { height: %(logo_h)s; }
.cover h1 { font-size: %(h1)s; line-height: 1.02; margin-top: %(cov_mt)s; position: relative; z-index: 1; }
.cover h1 em { font-style: normal; color: var(--c3); }
.cover p { font-size: %(lead)s; line-height: 1.55; color: #dbe3f0; margin-top: 18px; max-width: 420px; position: relative; z-index: 1; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.chips span { border: 1px solid rgba(255,255,255,.35); border-radius: 99px; padding: 5px 11px; font-size: 8px; }
.meta { position: absolute; left: %(px)s; right: %(px)s; bottom: 46px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.meta div { border-top: 1px solid rgba(255,255,255,.35); border-bottom: 1px solid rgba(255,255,255,.35); padding: 6px 0 22px; font-size: 7px; letter-spacing: .16em; color: #b9c8dc; }
.stripe { position: absolute; top: 0; bottom: 0; right: 0; width: 26%%; background: %(stripe)s; }
.stripe::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 22px; background: #6c4cf0; }
/* mobile */
.m .grid2, .m .grid3, .m .ph ul, .m .chk, .m .price .body, .m .gm { grid-template-columns: 1fr; }
.m .grid4, .m .tl, .m .steps { grid-template-columns: 1fr 1fr; }
.m .rp { grid-template-columns: 1fr; }
.m .ph { grid-template-columns: 1fr; }
.m .ph .recv { grid-column: 1; }
.m .phases { flex-direction: column; }
.m .meta { grid-template-columns: 1fr; gap: 8px; bottom: 34px; }
.m .meta div { padding-bottom: 10px; }
.m .sig { flex-direction: column; align-items: flex-start; gap: 10px; bottom: 54px; }
.m .sig .r { text-align: left; }
.m .price .top { flex-direction: column; align-items: flex-start; gap: 10px; }
.m .price .top .big { text-align: left; }
.m .stripe { width: 14%%; }
"""


def esc(s):
    return s  # content is trusted, contains intentional <br>/<b>/<em>


def build(brand, lang, mobile):
    B, L = BRANDS[brand], T[lang]
    P, PR = plan(brand, lang), pricing(brand, lang)
    zh = lang == "zh"
    bi = B["lang2"] == "bilingual"
    cjk = "'Noto Sans CJK TC'," if zh else ""
    dims = dict(pw="4.306in", ph="9.306in", pad="36px 26px 70px", px="26px", h1="36px", h2="27px", lead="12.5px", sm="10.5px", eb="8px", h3="13px",
                h3b="17px", num="26px", logo_h="34px", cov_mt="120px") if mobile else \
           dict(pw="8.5in", ph="11in", pad="52px 54px 80px", px="54px", h1="56px", h2="36px", lead="13px", sm="10.2px", eb="8.5px", h3="13.5px",
                h3b="22px", num="32px", logo_h="44px", cov_mt="170px")
    css = CSS % dict(dims, cjk=cjk, c1=B["c1"], c2=B["c2"], c3=B["c3"], ink=B["ink"], dark=B["dark"], cover_bg=B["cover_bg"],
                     glow=B["glow"], stripe=B.get("stripe", "transparent") if brand == "swiftlift" else "transparent")
    logo_w = f'file://{ASSETS}/{B["logo_white"]}'
    logo_c = f'file://{ASSETS}/{B["logo_color"]}'
    pages = []
    pn = [1]

    def foot():
        pn[0] += 1
        return f'<div class="foot"><img src="{logo_c}"><span>{L["footer_tag"]}</span><span>{pn[0]}</span></div>'

    def page(inner, cls=""):
        pages.append(f'<section class="page {cls}">{inner}{foot() if "cover" not in cls else ""}</section>')

    # ---- sections
    stripe = '<div class="stripe"></div>' if brand == "swiftlift" else ""
    chips = [PR["name"] + (" · 12 個月" if zh else " · 12 months") if B["plan"] == "premium" else PR["name"] + (" · 3 個月" if zh else " · 3 months"),
             ("包含雙語 SEO" if zh else "Bilingual SEO included") if bi else ("包含第二語言 SEO" if zh else "Second-language SEO included"),
             "白話月報" if zh else "Plain-English monthly report"]
    cover = (f'{stripe}<div class="brand"><img src="{logo_w}"></div><h1>{"<br>".join(L["cover_h"])}</h1>'
             f'<p>{L["cover_p_bi"] if bi else L["cover_p_second"]}</p><div class="chips">{"".join(f"<span>{c}</span>" for c in chips)}</div>'
             f'<div class="meta"><div>{L["prepared"]}</div><div>{L["website"]}</div><div>{L["date"]}</div></div>')
    pages.append(f'<section class="page cover">{cover}</section>')

    s_opp = (f'<div class="eyebrow">{L["s1"]}</div><h2>{L["s1h"]}</h2><p class="lead">{L["s1p"]}</p>'
             f'<div class="grid2"><div class="card"><span class="tag">{L["name_t"]}</span><h3>{L["name_h"]}</h3><p class="ex">{B["name_ex"][lang]}</p><p class="small">{L["name_b"]}</p></div>'
             f'<div class="card dark"><span class="tag">{L["svc_t"]}</span><h3>{L["svc_h"]}</h3><p class="ex">{B["svc_ex"][lang]}</p><p class="small">{L["svc_b"]}</p></div></div>')
    w1 = L["why1_bi"] if bi else L["why1_second"]
    s_why = (f'<div class="lbl">{L["why"].format(org=B["org"].upper() if not zh else B["org"])}</div><div class="grid3 why">' +
             "".join(f'<div><div class="num">0{i+1}</div><h4>{h}</h4><p class="small">{b}</p></div>' for i, (h, b) in enumerate([w1, L["why2"], L["why3"]])) +
             f'</div><div class="note">{L["goal"]}</div>')
    s_glance = (f'<div class="eyebrow">{L["s2"]}</div><h2>{P["glance_h"]}</h2><p class="lead">{P["glance_p"]}</p><div class="phases">' +
                "".join(f'<div class="{"opt" if last and B["plan"]=="standard" else ""}"><small>{a}</small><b>{b}</b><span>{c}</span></div>' for a, b, c, last in P["glance"]) +
                '</div><div class="tl">' + "".join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in P["timeline"]) + '</div>')
    f3 = L["f3_bi"] if bi else L["f3_second"]
    s_focus = (f'<div class="gm"><h3>{L["google_h"]}</h3><p class="small">{L["google_p"]}</p></div><div class="lbl">{L["focus"]}</div><div class="grid4 focus">' +
               "".join(f'<div class="card {"dark" if i==3 else ""}"><div class="ic">{ic}</div><h3>{h}</h3><p class="small">{b}</p></div>'
                       for i, (ic, (h, b)) in enumerate(zip(["G", "◎", "Aa", "↗"], [L["f1"], L["f2"], f3, L["f4"]]))) + '</div>')

    def s_phase(ph):
        n, name, when, items, (rl, rv) = ph
        return (f'<div class="ph"><div><div class="num">{n}</div><h4>{name}</h4><div class="small">{when}</div></div>'
                f'<ul>{"".join(f"<li>{x}</li>" for x in items)}</ul><div class="recv"><b>{rl}</b> {rv}</div></div>')
    s_steps_head = f'<div class="eyebrow">{L["s3"]}</div><h2>{L["s3h"]}</h2>'
    s_access = (f'<div class="eyebrow">{L["s4"]}</div><h2>{L["s4h"]}</h2><p class="lead">{L["s4p"].format(email=B["email"])}</p>')
    if mobile:
        s_access += "".join(f'<div class="card" style="margin-bottom:8px;padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="color:var(--c1);font-size:10px">{a}</b><span class="pill">{lv}</span></div>'
                            f'<p class="small" style="margin-top:4px">{u}</p><p class="small" style="color:var(--ink)">{how}</p></div>' for a, sub, u, how, lv in L["acc"])
    else:
        s_access += (f'<table><tr>{"".join(f"<th>{h}</th>" for h in L["th"])}</tr>' +
                     "".join(f'<tr><td><b>{a}</b><i>{sub}</i></td><td>{u}</td><td>{how}</td><td><span class="pill">{lv}</span></td></tr>' for a, sub, u, how, lv in L["acc"]) + '</table>')
    s_kick = (f'<div class="grid2" style="margin-top:14px"><div class="note" style="margin:0"><b>{L["nopw"][0]}</b><br>{L["nopw"][1]}</div>'
              f'<div class="note" style="margin:0"><b>{L["call"][0]}</b><br>{L["call"][1]}</div></div>'
              f'<div class="lbl">{L["kick"]}</div><ul class="chk">{"".join(f"<li>{x}</li>" for x in L["kick_items"])}</ul>')
    kw = B["kw"][lang]
    sm = L["sample"]
    s_report_head = (f'<div class="eyebrow">{L["s5"]}</div><h2>{L["s5h"]}</h2><div class="rp">' + "".join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in L["rp"]) + '</div>')
    s_inside = (f'<div class="lbl" style="margin-top:0">{L["inside"]}</div><ul class="inside">' +
                "".join(f'<li><span>0{i+1}</span><div><b>{a}</b> — {b}</div></li>' for i, (a, b) in enumerate(L["inside_items"])) + '</ul>')
    s_report_a = s_report_head + s_inside
    s_sample = (f'<div class="sample"><div class="hd">{sm[0]}<span>{sm[1]}</span></div><h5>{sm[2]}</h5><div class="kpi">'
                f'<div><small>{sm[3]}</small><b>318</b><em>{sm[7]}</em></div><div><small>{sm[4]}</small><b>4,960</b><em>{sm[8]}</em></div>'
                f'<div><small>{sm[5]}</small><b>41</b><em>{sm[9]}</em></div><div><small>{sm[6]}</small><b>17</b><em>{sm[10]}</em></div></div>'
                f'<table class="kt"><tr><th>{sm[11]}</th><th>{sm[12]}</th><th>{sm[13]}</th></tr>'
                f'<tr><td>{kw[0]}</td><td>38</td><td>8</td></tr><tr><td>{kw[1]}</td><td>21</td><td>6</td></tr><tr><td>{kw[2]}</td><td>—</td><td>5</td></tr></table>'
                f'<div class="bars">{"".join(f"<i style=height:{h}%></i>" for h in [22,26,30,34,45,58,72,100])}</div><p class="small" style="font-size:7px;margin-top:4px">{sm[14]}</p></div>')
    cur = B["currency"]
    s_price = (f'<div class="eyebrow">{L["s6"]}</div><h2>{L["s6h"]}</h2><p class="lead">{(L["s6p_bi"] if bi else L["s6p_second"]).format(cur=cur)}</p>'
               f'<div class="price"><div class="top"><div><h3>{PR["name"]}</h3><div class="small">{PR["sub"]}</div></div><div class="big">{PR["big"]}<small>{PR["big_sub"]}</small></div></div>'
               f'<div class="body"><div>{"".join(f"<div class=prow><span>{a}</span><b>{b}</b></div>" for a, b in PR["rows"])}<p class="pay">{PR["pay"]}</p></div>'
               f'<ul class="incl">{"".join(f"<li>{x}</li>" for x in PR["incl"])}</ul></div></div>'
               f'<div class="note">{L["addl"]}</div>')
    s_start = (f'<div class="lbl">{L["how"]}</div><div class="steps">' + "".join(f'<div><b>{i+1}</b>{s}</div>' for i, s in enumerate(PR["steps"])) + '</div>')
    s_sig = (f'<div class="sig"><div class="l"><img src="{logo_w}"><div><div class="n">{B["person"]}</div><div class="t">{B["role"][lang]}<br>{B["org"]}</div></div></div>'
             f'<div class="r"><b>{B["email"]}</b><br>{B["contact2"]}</div></div>')

    if not mobile:
        page(s_opp + s_why)
        page(s_glance + s_focus)
        page(s_steps_head + "".join(s_phase(p) for p in P["phases"]))
        page(s_access + s_kick)
        page(s_report_head + f'<div class="grid2" style="grid-template-columns:1.1fr 1fr;gap:22px"><div>{s_inside}</div>{s_sample}</div>')
        page(s_price + s_start + s_sig)
    else:
        page(s_opp)
        page(f'<div class="eyebrow">{L["s1"]}</div>' + s_why)
        page(s_glance)
        page(f'<div class="eyebrow">{L["s2"]}</div>' + s_focus)
        for i, ph in enumerate(P["phases"]):
            page((s_steps_head if i == 0 else f'<div class="eyebrow">{L["s3"]}</div>') + s_phase(ph))
        page(s_access)
        page(f'<div class="eyebrow">{L["s4"]}</div>' + s_kick)
        page(s_report_a)
        page(f'<div class="eyebrow">{L["s5"]}</div>' + s_sample)
        page(s_price)
        page(f'<div class="eyebrow">{L["s6"]}</div>' + s_start + s_sig)

    doc = f'<!DOCTYPE html><html lang="{"zh-Hant" if zh else "en"}"><head><meta charset="utf-8"><title>{B["org"]} — {L["title"]}</title><style>{css}</style></head><body class="{"m" if mobile else ""}">{"".join(pages)}</body></html>'
    suffix = (" (中文)" if zh else "") + (" - Mobile" if mobile else "")
    name = B["file"] + (" - 中文" if zh else "") + (" - Mobile" if mobile else "")
    hp = os.path.join(OUT, name + ".html")
    open(hp, "w").write(doc)
    pdf = os.path.join(OUT, name + ".pdf")
    subprocess.run(["google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf}", "file://" + hp], check=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    os.remove(hp)
    return pdf


if __name__ == "__main__":
    brands = sys.argv[1:] or list(BRANDS)
    for b in brands:
        for lang in ("en", "zh"):
            for m in (False, True):
                print(build(b, lang, m))
