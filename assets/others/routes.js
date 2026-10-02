(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const mapColors = { A: "#efb28e", B: "#c8d894", C: "#97c5e5" };
  const roles = { origin: "Start", stop: "Stop along the way", overnight: "Planned overnight area", destination: "Final destination" };
  const labelOffsets = {
    "west-glacier": [14, -18], whitefish: [-14, 29],
    yellowstone: [-14, -18], cody: [14, 27],
    "devils-tower": [14, -18], badlands: [14, 26],
    "big-bend": [-14, 26], "del-rio": [14, 26], bisbee: [-14, 26],
    "grand-junction": [-14, 26], "st-george": [-14, -18]
  };
  const geometry = typeof routeGeometry === "undefined" ? { routes: {} } : routeGeometry;
  const $ = id => document.getElementById(id);
  const svg = $("map");
  const atlas = $("route-atlas");
  const markerLayer = $("map-stops");
  const routeLayer = $("map-route");
  const contextLayer = $("map-context");
  const labelLayer = $("map-labels");
  const stateLayer = $("map-states");
  const routeButtons = [...document.querySelectorAll(".route-card")];
  let selected = "A";
  let selectedStop = 1;
  let overview = false;
  let markers = [];
  let stopButtons = [];
  let dayRows = [];

  // Matches routes-base.svg: spherical Albers, parallels 29.5/45.5,
  // origin 102 W / 38 N, scale 1500, translation [600, 375].
  const rad = Math.PI / 180;
  const n = (Math.sin(29.5 * rad) + Math.sin(45.5 * rad)) / 2;
  const c = Math.cos(29.5 * rad) ** 2 + 2 * n * Math.sin(29.5 * rad);
  const rho0 = Math.sqrt(c - 2 * n * Math.sin(38 * rad)) / n;

  function project(point) {
    const lat = point[1] * rad;
    const lon = (point[0] + 102) * rad;
    const rho = Math.sqrt(c - 2 * n * Math.sin(lat)) / n;
    return [600 + 1500 * rho * Math.sin(n * lon), 375 - 1500 * (rho0 - rho * Math.cos(n * lon))];
  }

  function svgNode(tag, attributes = {}, text) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function htmlNode(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mapFrame() {
    const keys = overview ? Object.keys(routeData) : [selected];
    const points = keys.flatMap(key => {
      const result = routeData[key].points.map(point => project(point.coordinates));
      const bounds = geometry.routes[key]?.bounds;
      if (bounds) result.push([bounds[0], bounds[1]], [bounds[2], bounds[3]]);
      return result;
    });
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const widthPx = svg.clientWidth || 1180;
    const heightPx = svg.clientHeight || 600;
    const aspect = widthPx / heightPx;
    const width = Math.max(maxX - minX + 210, (maxY - minY + 140) * aspect);
    const height = width / aspect;
    let x = (minX + maxX - width) / 2;
    let y = (minY + maxY - height) / 2;
    if (width < 1200) x = Math.max(0, Math.min(1200 - width, x));
    if (height < 700) y = Math.max(0, Math.min(700 - height, y));
    return { x, y, width, height, unit: width / widthPx, compact: widthPx < 600 };
  }

  function addLabel(layer, point, name, offset, frame) {
    const unit = frame.unit;
    const anchor = offset[0] < 0 ? "end" : "start";
    const approximateWidth = name.length * 7.2 * unit;
    let x = point[0] + offset[0] * unit;
    let y = point[1] + offset[1] * unit;
    const left = frame.x + 12 * unit;
    const right = frame.x + frame.width - 12 * unit;
    x = anchor === "end" ? Math.max(left + approximateWidth, Math.min(right, x)) : Math.max(left, Math.min(right - approximateWidth, x));
    y = Math.max(frame.y + 22 * unit, Math.min(frame.y + frame.height - 15 * unit, y));
    const attributes = { x, y, "text-anchor": anchor, "font-size": 14 * unit };
    layer.appendChild(svgNode("text", { ...attributes, class: "atlas-label atlas-label--halo" }, name));
    layer.appendChild(svgNode("text", { ...attributes, class: "atlas-label" }, name));
  }

  function routeLine(key, className) {
    const group = svgNode("g");
    (geometry.routes[key]?.paths || []).forEach((d, index) => {
      const line = svgNode("path", { class: className, d, "data-day": index + 1 });
      line.style.setProperty("--map-route", mapColors[key]);
      group.appendChild(line);
    });
    return group;
  }

  function drawMap() {
    const route = routeData[selected];
    const frame = mapFrame();
    svg.setAttribute("viewBox", `${frame.x} ${frame.y} ${frame.width} ${frame.height}`);
    $("map-title").textContent = `${route.title}: ${route.points[0].name} to ${route.points.at(-1).name}`;
    $("map-description").textContent = `${route.points.length} planned locations. Hollow circles are daytime stops; filled diamonds are overnight areas; a triangle marks the start and a square the final destination. Arrow keys move between markers. Highlighted states are traversed by the selected driving route.`;
    atlas.style.setProperty("--map-route", mapColors[selected]);
    [markerLayer, routeLayer, contextLayer, labelLayer, stateLayer].forEach(layer => layer.replaceChildren());
    const states = geometry.routes[selected]?.states || [];
    states.forEach(code => {
      const state = routeStates[code];
      if (state) stateLayer.appendChild(svgNode("path", { d: state.path, class: "atlas-state", "data-state": code, "fill-rule": "evenodd" }));
    });
    $("map-state-list").textContent = states.length ? `States along the route: ${states.map(code => routeStates[code]?.name || code).join(", ")}.` : "";
    $("map-route-status").textContent = geometry.routes[selected]
      ? "Planned driving routes for October 2026. Road availability is subject to conditions."
      : "Road geometry has not been generated for this option. Locations are shown without connecting lines.";

    if (overview) {
      Object.keys(routeData).filter(key => key !== selected).forEach(key => {
        contextLayer.appendChild(routeLine(key, "atlas-route atlas-route--context"));
      });
    }
    routeLayer.appendChild(routeLine(selected, "atlas-route atlas-route--halo"));
    routeLayer.appendChild(routeLine(selected, "atlas-route"));

    markers = route.points.map((point, index) => {
      const position = project(point.coordinates);
      const day = point.day - 1;
      const group = svgNode("g", {
        class: `atlas-marker atlas-marker--${point.role}`, role: "button", tabindex: index === selectedStop ? 0 : -1,
        "aria-label": `${point.name}. ${roles[point.role]}, day ${day + 1}. Location ${index + 1} of ${route.points.length}.`,
        "aria-controls": "map-stop-name map-day-title", "aria-pressed": index === selectedStop,
        "data-stop-index": index
      });
      const [cx, cy] = position;
      group.appendChild(svgNode("circle", { class: "atlas-marker-hit", cx, cy, r: 22 * frame.unit }));
      group.appendChild(svgNode("circle", { class: "atlas-marker-ring", cx, cy, r: 12 * frame.unit }));
      const r = 7 * frame.unit;
      if (point.role === "overnight") {
        group.appendChild(svgNode("path", { class: "atlas-marker-dot", d: `M${cx},${cy-r}L${cx+r},${cy}L${cx},${cy+r}L${cx-r},${cy}Z` }));
      } else if (point.role === "origin") {
        group.appendChild(svgNode("path", { class: "atlas-marker-dot", d: `M${cx},${cy-r}L${cx+r},${cy+r}L${cx-r},${cy+r}Z` }));
      } else if (point.role === "destination") {
        group.appendChild(svgNode("rect", { class: "atlas-marker-dot", x: cx-r*.8, y: cy-r*.8, width: r*1.6, height: r*1.6 }));
      } else {
        group.appendChild(svgNode("circle", { class: "atlas-marker-dot", cx, cy, r: 4.5 * frame.unit }));
      }
      const permanent = point.role === "overnight";
      const offset = frame.compact && point.id === "st-joseph" ? [14, 18]
        : labelOffsets[point.id] || [position[0] > frame.x + frame.width / 2 ? -14 : 14, index % 2 ? 25 : -17];
      if (permanent) {
        addLabel(labelLayer, position, point.name, offset, frame);
      } else {
        addLabel(group, position, point.name, [offset[0], -17], frame);
      }
      group.addEventListener("click", () => selectStop(index));
      group.addEventListener("focus", () => selectStop(index));
      group.addEventListener("keydown", event => {
        let target = index;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) target = (index + 1) % route.points.length;
        else if (["ArrowLeft", "ArrowUp"].includes(event.key)) target = (index - 1 + route.points.length) % route.points.length;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = route.points.length - 1;
        else if (!["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        selectStop(target);
        markers[target].focus({ preventScroll: true });
      });
      markerLayer.appendChild(group);
      return group;
    });
    selectStop(selectedStop);
  }

  function selectStop(index) {
    selectedStop = index;
    const route = routeData[selected];
    const point = route.points[index];
    const day = point.day - 1;
    markers.forEach((marker, i) => {
      marker.classList.toggle("is-selected", i === index);
      marker.setAttribute("aria-pressed", String(i === index));
      marker.setAttribute("tabindex", i === index ? "0" : "-1");
    });
    stopButtons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    dayRows.forEach((row, i) => {
      row.classList.toggle("is-selected", i === day);
      row.querySelector("button").setAttribute("aria-pressed", String(i === day));
    });
    $("map-stop-meta").textContent = `${roles[point.role]} · Day ${day + 1}`;
    $("map-stop-name").textContent = point.name;
    $("map-day-title").textContent = route.days[day].title;
    $("map-stop-access").textContent = point.access || "";
    $("map-day-link").textContent = `View day ${day + 1}`;
    $("map-day-link").setAttribute("href", `#route-day-${day + 1}`);
  }

  function renderRoute(key) {
    selected = key;
    const route = routeData[key];
    selectedStop = route.points.findIndex(point => point.role === "overnight");
    $("route-panel").style.setProperty("--route", route.color);
    routeButtons.forEach(button => {
      const active = button.dataset.route === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-controls", "route-panel");
    });
    $("routeEyebrow").textContent = `Option ${key} · ${route.daysCount} days`;
    $("routeTitle").textContent = route.title;
    $("routeSummary").textContent = route.summary;
    $("scoreHike").textContent = route.scores.hike + "/10";
    $("scoreHist").textContent = route.scores.hist + "/10";
    $("scorePace").textContent = route.scores.pace + "/10";
    $("whyText").textContent = route.why;
    $("atlas-heading").textContent = `${route.points[0].name} to ${route.points.at(-1).name}`;
    $("map-overnight-note").textContent = route.overnightNote;
    $("map-season-note").textContent = route.seasonNote;

    const days = $("days");
    days.replaceChildren();
    dayRows = route.days.map((day, index) => {
      const row = htmlNode("article", "day");
      row.id = `route-day-${index + 1}`;
      const button = htmlNode("button", "day-num", index + 1);
      button.type = "button";
      button.setAttribute("aria-label", `Show day ${index + 1} on the map`);
      button.setAttribute("aria-controls", "map");
      button.addEventListener("click", () => selectStop(route.points.findIndex(point => point.id === day.stopIds[0])));
      const copy = htmlNode("div");
      const end = route.points.find(point => point.id === day.endStopId);
      copy.append(htmlNode("h4", "", day.title), htmlNode("p", "", day.text),
        htmlNode("p", "day-overnight", `${end.role === "overnight" ? "Planned overnight" : "Final destination"}: ${end.name}.`));
      row.append(button, copy);
      days.appendChild(row);
      return row;
    });

    const list = $("map-stop-list");
    list.replaceChildren();
    stopButtons = route.points.map((point, index) => {
      const item = htmlNode("li");
      const button = htmlNode("button");
      button.type = "button";
      button.setAttribute("aria-controls", "map map-stop-name map-day-title");
      const number = htmlNode("span", `atlas-stop-number atlas-stop-number--${point.role}`, index + 1);
      number.setAttribute("aria-hidden", "true");
      const copy = htmlNode("span", "atlas-stop-copy");
      copy.append(htmlNode("span", "", point.name), htmlNode("small", "", `${roles[point.role]} · Day ${point.day}`));
      button.append(number, copy);
      button.addEventListener("click", () => selectStop(index));
      item.appendChild(button);
      list.appendChild(item);
      return button;
    });
    drawMap();
  }

  function setView(showAll) {
    overview = showAll;
    $("routeView").setAttribute("aria-pressed", String(!showAll));
    $("overviewView").setAttribute("aria-pressed", String(showAll));
    drawMap();
  }

  routeButtons.forEach(button => button.addEventListener("click", () => renderRoute(button.dataset.route)));
  $("routeView").addEventListener("click", () => setView(false));
  $("overviewView").addEventListener("click", () => setView(true));
  $("printBtn")?.addEventListener("click", () => window.print());
  renderRoute("A");

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => drawMap()).observe(svg);
  } else {
    window.addEventListener("resize", drawMap);
  }
})();
