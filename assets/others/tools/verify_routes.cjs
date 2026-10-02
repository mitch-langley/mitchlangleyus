const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const rootDir = path.resolve(__dirname, '../../..');
const dir = path.join(rootDir, '.impeccable/routes-map');
const htmlTree = JSON.parse(fs.readFileSync(path.join(dir, 'dom.json'), 'utf8'));
const dataCode = fs.readFileSync(path.join(rootDir, 'assets/others/routes-data.js'), 'utf8');
const statesCode = fs.readFileSync(path.join(rootDir, 'assets/others/routes-states.js'), 'utf8');
const geometryCode = fs.readFileSync(path.join(rootDir, 'assets/others/routes-geometry.js'), 'utf8');
const appCode = fs.readFileSync(path.join(rootDir, 'assets/others/routes.js'), 'utf8');
const baseSvg = fs.readFileSync(path.join(rootDir, 'assets/others/routes-base.svg'), 'utf8');
let doc;
class Element {
  constructor(tag, attrs = {}) {
    this.tagName = tag; this.attrs = {...attrs}; this.children = []; this.listeners = {}; this._text = '';
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.dataset = new Proxy({}, {get: (_, key) => this.attrs['data-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())]});
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, on) => {
        const set = new Set(this.className.split(/\s+/).filter(Boolean));
        if (on) set.add(name); else set.delete(name);
        this.className = [...set].join(' ');
      }
    };
  }
  get id() { return this.attrs.id; } set id(value) { this.attrs.id = value; }
  get className() { return this.attrs.class || ''; } set className(value) { this.attrs.class = value; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  getAttribute(key) { return this.attrs[key]; }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  append(...children) { children.forEach(c => this.appendChild(c)); }
  replaceChildren(...children) { this.children = []; this._text = ''; this.append(...children); }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  dispatch(name, data = {}) { (this.listeners[name] || []).forEach(fn => fn({...data, target: this, preventDefault() {}})); }
  focus() { doc.activeElement = this; this.dispatch('focus'); }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
  matches(selector) {
    if (selector[0] === '#') return this.id === selector.slice(1);
    if (selector[0] === '.') return this.classList.contains(selector.slice(1));
    return this.tagName === selector;
  }
  querySelectorAll(selector) {
    return this.children.flatMap(c => [...(c.matches(selector) ? [c] : []), ...c.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function fromJson(item) {
  const node = new Element(item.tag, item.attrs);
  node._text = item.text;
  item.children.forEach(child => node.appendChild(fromJson(child)));
  return node;
}
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const colors = {A:'#efb28e',B:'#c8d894',C:'#97c5e5'};
function snapshot(node, route, parentSelected = false) {
  if (node.tagName === 'image') return baseSvg.replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>\s*$/, '</g>');
  const attrs = {...node.attrs};
  const has = name => node.classList.contains(name);
  const selected = parentSelected || has('is-selected');
  if (has('atlas-label') && node.parentElement?.classList.contains('atlas-marker') && !selected) return '';
  if (has('atlas-route')) Object.assign(attrs, {fill:'none', stroke:node.style['--map-route'] || colors[route], 'stroke-width':3, 'stroke-linejoin':'round', 'stroke-linecap':'round', 'vector-effect':'non-scaling-stroke'});
  if (has('atlas-route--halo')) Object.assign(attrs, {stroke:'#151b20','stroke-width':7,opacity:.9});
  if (has('atlas-route--context')) Object.assign(attrs, {'stroke-width':2,opacity:.34,'stroke-dasharray':'5 5'});
  if (has('atlas-state')) Object.assign(attrs, {fill:colors[route], 'fill-opacity':.12, stroke:'none'});
  if (has('atlas-marker-hit')) attrs.fill='none';
  if (has('atlas-marker-dot')) Object.assign(attrs, {fill:(selected || node.parentElement.classList.contains('atlas-marker--overnight') || node.parentElement.classList.contains('atlas-marker--destination'))?colors[route]:'#151b20',stroke:selected?'#fff6df':colors[route],'stroke-width':2.5,'vector-effect':'non-scaling-stroke'});
  if (has('atlas-marker-ring')) {
    if (!selected) return '';
    Object.assign(attrs, {fill:'none',stroke:colors[route],'stroke-width':1,opacity:.85,'vector-effect':'non-scaling-stroke'});
  }
  if (has('atlas-label')) Object.assign(attrs, {fill:'#eee8d6','font-family':'Georgia,serif'});
  if (has('atlas-label--halo')) Object.assign(attrs, {fill:'none',stroke:'#151b20','stroke-width':4,'stroke-linejoin':'round'});
  return `<${node.tagName} ${Object.entries(attrs).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${esc(node._text)}${node.children.map(child=>snapshot(child,route,selected)).join('')}</${node.tagName}>`;
}
for (const compact of [false, true]) {
  const tree = fromJson(htmlTree);
  doc = {
    activeElement: null,
    getElementById(id) { const item = tree.querySelector('#' + id); return item || null; },
    querySelectorAll(selector) { return tree.querySelectorAll(selector); },
    createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag)
  };
  const map = doc.getElementById('map');
  map.clientWidth = compact ? 350 : 1180;
  map.clientHeight = compact ? 340 : 600;
  let printCalls = 0, resizeCallback;
  const context = vm.createContext({document:doc, window:{print(){printCalls++;}, addEventListener(){}}, ResizeObserver:class {constructor(fn){resizeCallback=fn;} observe(){}}});
  vm.runInContext(dataCode + '\n' + statesCode + '\n' + geometryCode + '\n' + appCode, context);
  const data = vm.runInContext('routeData', context);
  assert.equal(data.A.days[1].title, 'Lafayette \u2192 San Antonio \u2192 Del Rio');
  assert(data.A.days[1].text.includes('Jos\u00e9'));
  assert(!/[\u00c2\u00c3\u00e2\ufffd]/.test(JSON.stringify(data)), 'No corrupted UTF-8 in itinerary text');
  const geometry = vm.runInContext('routeGeometry', context);
  assert.equal(typeof resizeCallback, 'function', 'Startup must reach ResizeObserver without a print button');
  const routeButtons = tree.querySelectorAll('.route-card');
  for (const key of ['A','B','C','A']) {
    routeButtons.find(button => button.dataset.route === key).dispatch('click');
    assert.equal(doc.getElementById('routeTitle').textContent, data[key].title);
    assert.equal(doc.getElementById('routeSummary').textContent, data[key].summary);
    assert.equal(doc.getElementById('whyText').textContent, data[key].why);
    const permanentNames = doc.getElementById('map-labels').children.filter(n => !n.classList.contains('atlas-label--halo')).map(n => n.textContent);
    assert.deepEqual(permanentNames, Array.from(data[key].points.filter(p => p.role === 'overnight'), p => p.name), 'Only overnight labels are permanent, at both widths');
    const initialMarkers = doc.getElementById('map-stops').children;
    const initiallySelected = initialMarkers.findIndex(n => n.classList.contains('is-selected'));
    assert.equal(data[key].points[initiallySelected].role, 'overnight', 'Default selection must not reveal a non-overnight label');
    const days = doc.getElementById('days').children;
    assert.equal(days.length, data[key].days.length);
    days.forEach((day,i) => {
      assert.equal(day.querySelector('h4').textContent, data[key].days[i].title);
      assert.equal(day.querySelector('p').textContent, data[key].days[i].text);
      day.querySelector('button').dispatch('click');
      assert.equal(doc.getElementById('map-day-title').textContent, data[key].days[i].title);
    });
    const markers = doc.getElementById('map-stops').children;
    const stops = doc.getElementById('map-stop-list').children;
    assert.equal(markers.length, data[key].points.length);
    assert.equal(stops.length, markers.length);
    assert.equal(markers.filter(marker => marker.classList.contains('atlas-marker--overnight')).length, {A:4,B:4,C:7}[key]);
    assert.equal(new Set(data[key].points.map(p => p.id)).size, markers.length);
    assert.equal(data[key].points[0].role, 'origin');
    assert.equal(data[key].points.at(-1).role, 'destination');
    data[key].points.forEach((p, i) => {
      assert(p.day >= 1 && p.day <= days.length);
      if (i) assert(p.day >= data[key].points[i-1].day, 'Chronological point order');
      assert(markers[i].attrs['aria-label'].includes('day ' + p.day));
      if (p.role === 'overnight') assert(markers[i].querySelector('path'), 'Diamond shape');
    });
    data[key].days.forEach((day, i) => {
      const end = data[key].points.find(p => p.id === day.endStopId);
      assert.equal(end.day, i+1);
      assert.equal(end.role, i === days.length-1 ? 'destination' : 'overnight');
      assert.equal(day.drive.at(-1), end.id);
      if (i) assert.equal(day.drive[0], data[key].days[i-1].endStopId, 'Daily road joins');
      assert(days[i].querySelector('.day-overnight').textContent.includes(end.name));
    });
    const expectedStates = geometry.routes[key]?.states || [];
    const highlighted = () => doc.getElementById('map-states').children.map(n => n.attrs['data-state']);
    assert.equal(JSON.stringify(highlighted()), JSON.stringify(expectedStates));
    markers.forEach((marker,i) => {
      marker.dispatch('click');
      assert.equal(doc.getElementById('map-stop-name').textContent, data[key].points[i].name);
      assert.equal(marker.attrs['aria-pressed'], 'true');
      if (data[key].points[i].role !== 'overnight') {
        assert.equal(marker.querySelectorAll('.atlas-label').filter(n => !n.classList.contains('atlas-label--halo'))[0].textContent, data[key].points[i].name);
      }
      assert.equal(markers.filter(m => m.attrs.tabindex === '0').length, 1);
      assert.equal(days.filter(day => day.classList.contains('is-selected')).length, 1);
      assert(tree.querySelector(doc.getElementById('map-day-link').attrs.href));
      stops[i].querySelector('button').dispatch('click');
      assert.equal(doc.getElementById('map-stop-name').textContent, data[key].points[i].name);
    });
    markers[0].dispatch('keydown', {key:'ArrowRight'});
    assert.equal(doc.getElementById('map-stop-name').textContent, data[key].points[1].name);
    markers[1].dispatch('keydown', {key:'End'});
    assert.equal(doc.getElementById('map-stop-name').textContent, data[key].points.at(-1).name);
    doc.getElementById('overviewView').dispatch('click');
    assert.equal(doc.getElementById('map-context').children.length, 2);
    assert.equal(JSON.stringify(highlighted()), JSON.stringify(expectedStates), 'Overview must highlight only selected states');
    doc.getElementById('routeView').dispatch('click');
    assert.equal(doc.getElementById('map-context').children.length, 0);
    resizeCallback();
    const view = map.attrs.viewBox.split(' ').map(Number);
    assert(view.every(Number.isFinite) && view[2] > 0 && view[3] > 0);
    const paths = doc.getElementById('map-route').children[1].children;
    assert.equal(paths.length, geometry.routes[key] ? days.length : 0);
    const activePoints = paths.flatMap(line => [...line.attrs.d.matchAll(/(-?[0-9.]+),(-?[0-9.]+)/g)].map(m => [Number(m[1]), Number(m[2])]));
    activePoints.forEach(([x,y]) => assert(x >= view[0] && x <= view[0]+view[2] && y >= view[1] && y <= view[1]+view[3]));
    doc.getElementById('map-stops').children[data[key].points.findIndex(p => p.role === 'overnight')].dispatch('click');
    let rendered = snapshot(map, key);
    rendered = rendered.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${map.clientWidth}" height="${map.clientHeight}" `);
    rendered = rendered.replace(/(<svg[^>]*>)/, `$1<rect x="${view[0]}" y="${view[1]}" width="${view[2]}" height="${view[3]}" fill="#151b20"/>`);
    fs.writeFileSync(path.join(dir, `${key}-${compact?'mobile':'desktop'}.svg`), rendered);
  }
  assert.equal(doc.getElementById('printBtn'), null);
  console.log(`PASS ${compact?'mobile':'desktop'}: route switches, every stop/day, stop list, keyboard, both views, resize without print button, overnight roles, state layers, and projected road bounds.`);
}

console.log('Road assets: ' + (vm.runInNewContext(geometryCode + ';Object.keys(routeGeometry.routes).length') === 3 ? 'all three generated' : 'PENDING GENERATION'));

// Exercise nonempty geometry and state overlays even before credentials are supplied.
// These are explicit test fixtures, never written to the site's assets or previews.
{
  const tree = fromJson(htmlTree);
  doc = {
    getElementById: id => tree.querySelector('#' + id),
    querySelectorAll: selector => tree.querySelectorAll(selector),
    createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag)
  };
  doc.getElementById('map').clientWidth = 1180;
  doc.getElementById('map').clientHeight = 600;
  const fixture = {routes:{}};
  ['A','B','C'].forEach((key, i) => {
    fixture.routes[key] = {paths:['M200,200L900,400'], bounds:[200,200,900,400], states:[['GA','TX'],['GA','CO'],['GA','MT']][i]};
  });
  const context = vm.createContext({document:doc, window:{addEventListener(){}}});
  vm.runInContext(dataCode + '\n' + statesCode + '\nconst routeGeometry = ' + JSON.stringify(fixture) + ';\n' + appCode, context);
  for (const key of ['A','B','C']) {
    tree.querySelectorAll('.route-card').find(b => b.dataset.route === key).dispatch('click');
    const stateCodes = () => doc.getElementById('map-states').children.map(n => n.attrs['data-state']);
    assert.deepEqual(stateCodes(), fixture.routes[key].states);
    assert.equal(doc.getElementById('map-route').children[1].children[0].attrs.d, fixture.routes[key].paths[0]);
    doc.getElementById('overviewView').dispatch('click');
    assert.deepEqual(stateCodes(), fixture.routes[key].states);
    assert.equal(doc.getElementById('map-context').children.length, 2);
  }
  console.log('PASS synthetic fixtures: nonempty road paths and selected-only state overlays across route changes.');
}
