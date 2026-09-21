import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import { createHash } from 'node:crypto';

// Run the shipped inline scripts against a minimal canvas/DOM adapter. This checks
// numeric state, feedback and event handlers rather than copying their formulas.
async function tool(name, { reducedMotion = false } = {}) {
  const html = await readFile(new URL(`../public/tools/${name}.html`, import.meta.url), 'utf8');
  const nodes = new Map(), callbacks = {}, frames = [], drawing = [];
  const ctx = new Proxy({}, { get(target, key) { if (key in target) return target[key]; if(key === 'createLinearGradient') return () => ({addColorStop(){}}); return (...args) => drawing.push([key, ...args]); } });
  function element(id, tag, attrs) {
    let value = attrs.match(/\bvalue="([^"]*)"/)?.[1] || '';
    let text = '';
    const item = { id, tag, style:{}, dataset:{}, listeners:{}, className:'', innerHTML:'', disabled:false, width:400, height:340, clientWidth:400, clientHeight:450, offsetHeight:50,
      get value(){return value;}, set value(v){value=String(v);}, get textContent(){return text;}, set textContent(v){text=String(v);if(id==='headerEq'){nodes.delete('eqK');nodes.delete('eqB');}},
      getContext:()=>ctx, getBoundingClientRect:()=>({left:0,top:0,width:400,height:340}), addEventListener(type,fn){this.listeners[type]=fn;}, setPointerCapture(){},
      classList:{add(){},remove(){}},
    }; return item;
  }
  for(const match of html.matchAll(/<([a-z]+)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)) nodes.set(match[3],element(match[3],match[1],match[2]));
  const controls=[...nodes.values()].filter(el=>el.tag==='input'||el.tag==='button');
  const sandbox=createContext({document:{getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>controls},window:{devicePixelRatio:1,matchMedia:()=>({matches:reducedMotion}),addEventListener:(type,fn)=>{callbacks[type]=fn;}},requestAnimationFrame:fn=>frames.push(fn),console});
  const script=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n');
  runInContext(script,sandbox,{filename:name+'.html'}); callbacks.load?.();
  return {nodes,controls,drawing,run:code=>runInContext(code,sandbox),input(id,value){const el=nodes.get(id);el.value=value;el.listeners.input?.call(el);},flush(){let ts=16,count=0;while(frames.length){frames.shift()(ts);ts+=180;if(++count>100)throw new Error('animation did not finish');}return count;}};
}

test('angle boundaries, protractor orientation and keyboard-equivalent slider state agree', async () => {
  const a=await tool('angle-measure');
  assert.equal(a.nodes.get('angleDeg').textContent,'60');
  const upper90=a.drawing.find(row=>row[0]==='fillText'&&row[1]==='90°');
  assert.ok(Math.abs(upper90[2])<0.001 && upper90[3]<0,'90° label must be above the vertex');
  for(const [angle,label] of [[0,'零角'],[30,'锐角'],[90,'直角'],[120,'钝角'],[180,'平角']]) {
    a.run(`setAngle(${angle})`);
    assert.equal(a.nodes.get('angleDeg').textContent,String(angle));
    assert.equal(a.nodes.get('angleSlider').value,String(angle));
    assert.equal(a.nodes.get('angleType').textContent,label);
  }
  a.run('setAngle(-30)');assert.equal(a.nodes.get('angleSlider').value,'0');
  a.run('setAngle(210)');assert.equal(a.nodes.get('angleSlider').value,'180');
});

test('number line rejects fractions, empty inputs and out-of-range results; treats exponent input numerically', async () => {
  const t=await tool('number-line',{reducedMotion:true});
  for(const [start,steps] of [['2.5','3'],['','3'],['5','1.2'],['5',''],['25','2'],['5','11']]) {
    t.nodes.get('startVal').value=start;t.nodes.get('stepsVal').value=steps;t.run('runAnimation()');
    assert.match(t.nodes.get('feedbackArea').textContent,/整数/);assert.equal(t.run('animating'),false);
  }
  t.nodes.get('startVal').value='20';t.nodes.get('stepsVal').value='1';t.run('runAnimation()');
  assert.match(t.nodes.get('feedbackArea').textContent,/超出数轴范围/);
  t.nodes.get('startVal').value='1e1';t.nodes.get('stepsVal').value='2';t.run('runAnimation()');t.flush();
  assert.equal(t.run('currentPos'),12);assert.match(t.nodes.get('feedbackArea').textContent,/从 10 到达了 12/);
});

test('number-line animation locks controls, preserves operation and reenables after normal or reduced-motion completion', async () => {
  for(const reducedMotion of [false,true]) {
    const t=await tool('number-line',{reducedMotion});
    t.nodes.get('startVal').value='-2';t.nodes.get('stepsVal').value='3';t.run("setOp('sub');runAnimation()");
    assert.ok(t.controls.every(el=>el.disabled));
    t.run("setOp('add');changeVal('start',1);resetAll()");
    assert.equal(t.run('op'),'sub');assert.equal(t.nodes.get('startVal').value,'-2');
    const frames=t.flush();assert.equal(t.run('currentPos'),-5);assert.equal(t.run('animating'),false);
    assert.ok(t.controls.every(el=>!el.disabled));assert.match(t.nodes.get('feedbackArea').textContent,/向左跳了 3 格/);
    if(reducedMotion) assert.equal(frames,3);
  }
});

test('linear function supports repeated slider updates, constant-function roots and directional intercept feedback', async () => {
  const t=await tool('linear-function');
  assert.equal(t.nodes.get('headerEq').textContent,'y = x');
  assert.ok(!t.nodes.has('eqK'),'header replacement should remove old child nodes in this adapter');
  t.input('sliderK','0');t.input('sliderB','0');
  assert.match(t.nodes.get('kpX').textContent,/所有实数/);
  t.input('sliderB','5');assert.match(t.nodes.get('kpX').textContent,/无零点/);
  t.input('sliderB','2');assert.match(t.nodes.get('feedbackArea').innerHTML,/下移 3.0/);
  assert.match(t.nodes.get('feedbackArea').innerHTML,/正半轴/);
  t.input('sliderB','-2');t.input('sliderB','-1');assert.match(t.nodes.get('feedbackArea').innerHTML,/上移 1.0/);
  t.input('sliderK','2');t.input('sliderB','-4');assert.equal(t.nodes.get('kpX').textContent,'x = 2');
  assert.equal(t.nodes.get('dispK').textContent,'2.0');assert.equal(t.nodes.get('headerEq').textContent,'y = 2.0x − 4.0');
});

test('linear challenge requires exact parameters and clears success when a slider moves', async () => {
  const t=await tool('linear-function');
  t.run("mode='challenge';challengeK=1;challengeB=2");
  t.input('sliderK','1.1');t.input('sliderB','2');t.run('checkChallenge()');assert.equal(t.nodes.get('checkBtn').className,'chal-btn');
  t.input('sliderK','1');t.run('checkChallenge()');assert.equal(t.nodes.get('checkBtn').className,'chal-btn success');
  t.input('sliderB','2.5');assert.equal(t.nodes.get('checkBtn').className,'chal-btn');
});

test('reviewed math tool copies match their source manifest output hashes', async () => {
  const manifest=JSON.parse(await readFile(new URL('../docs/tool-source-manifest.json',import.meta.url),'utf8'));
  for(const name of ['angle-measure','number-line','linear-function']) {
    const output=`public/tools/${name}.html`;
    const entry=manifest.files.find(entry=>entry.output===output);
    const data=await readFile(new URL('../'+output,import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'),entry.outputSha256);
  }
});
