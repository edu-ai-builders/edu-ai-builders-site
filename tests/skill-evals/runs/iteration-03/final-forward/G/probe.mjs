import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const source='/Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/site-original/public/tools/fraction-bars.html';
const raw=readFileSync(source); const html=raw.toString();
const nodes=new Map(),drawing=[],events={};
const ctx=new Proxy({}, {get(t,k){if(k in t)return t[k];return (...args)=>drawing.push([k,...args]);}});
for(const m of html.matchAll(/<([a-z]+)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)){
  const classes=new Set(); const node={value:m[2].match(/value="([^"]*)"/)?.[1]||'',max:m[2].match(/max="([^"]*)"/)?.[1]||'',textContent:'',innerHTML:'',style:{},listeners:{},classList:{add(x){classes.add(x)},contains(x){return classes.has(x)}},getContext:()=>ctx,getBoundingClientRect:()=>({width:400,height:380}),addEventListener(k,f){this.listeners[k]=f}};nodes.set(m[3],node);
}
const env=createContext({document:{getElementById:id=>nodes.get(id)},window:{devicePixelRatio:1,addEventListener:(k,f)=>events[k]=f},console});
// Execute only the mathematical application script: localization is deliberately outside this probe's DOM scope.
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
runInContext(scripts.at(-1)[1],env,{filename:source});
const run=s=>runInContext(s,env); const checks=[];
function check(name,f){try{const details=f();checks.push({name,status:'passed',details})}catch(e){checks.push({name,status:'failed',details:e.message})}}
check('baseline immediate explicit answer',()=>{assert.equal(nodes.get('verdict').textContent,'1/2  <  3/4');assert.ok(drawing.some(x=>x[0]==='fillText'&&x[1]==='1/2 < 3/4'));return 'Initialization renders canvas relation and visible DOM verdict without any learner attempt.'});
check('mathematical relation exhaustive current input domain',()=>{let count=0;for(let da=2;da<=12;da++)for(let a=1;a<=da;a++)for(let db=2;db<=12;db++)for(let b=1;b<=db;b++){run(`nA=${a};dA=${da};nB=${b};dB=${db};showFeedback()`);const expected=a*db>b*da?'>':a*db<b*da?'<':'=';assert.equal(nodes.get('verdict').textContent,`${a}/${da}  ${expected}  ${b}/${db}`);count++}return `${count} pairs agree with exact integer cross-products; rounded decimal display never used as expected truth.`});
check('denominator reduction clamps numerator and redraws',()=>{run('nA=7;dA=8;nB=1;dB=2');const s=nodes.get('denSlA');s.value='3';s.listeners.input({target:s});assert.equal(run('nA'),3);assert.equal(run('dA'),3);assert.equal(nodes.get('numSlA').max,3);assert.equal(nodes.get('verdict').textContent,'3/3  >  1/2');return 'A denominator 8→3 clamps numerator 7→3, updates maximum, verdict and draw.'});
check('equal denominator explanation correctness',()=>{run('nA=2;dA=4;nB=2;dB=4;showFeedback()');assert.ok(!nodes.get('fb').innerHTML.includes('分子B更大'),'Baseline 2/4 = 2/4 explanation says B numerator is larger.');return nodes.get('fb').innerHTML});
check('equivalent fractions verdict and equality statement',()=>{run('nA=1;dA=2;nB=2;dB=4;showFeedback()');assert.equal(nodes.get('verdict').textContent,'1/2  =  2/4');assert.ok(nodes.get('fb').innerHTML.includes('相等'));return 'Equivalent fractions receive equality verdict and final equality explanation.'});
check('reference and fractional bar lengths share unit',()=>{drawing.length=0;run('nA=1;dA=2;nB=3;dB=4;draw()');const widths=drawing.filter(x=>x[0]==='roundRect').map(x=>x[3]);assert.ok(widths.includes(292));assert.ok(widths.includes(146));assert.ok(widths.includes(219));return {canvasWidth:400,unitWidth:292,halfWidth:146,threeQuartersWidth:219}});
console.log(JSON.stringify({source,sha256:createHash('sha256').update(raw).digest('hex'),method:'actual inline application script execution with minimal DOM/canvas VM adapter',browser_executed:false,localization_executed:false,checks},null,2));
