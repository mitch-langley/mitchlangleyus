(() => {
  "use strict";

  const assetRoot = new URL("./", document.currentScript.src);
  const player = document.querySelector("#jug-explorer");
  if (!player) return;
  const $ = (id) => document.getElementById(id);
  const svgNS = "http://www.w3.org/2000/svg";
  const previous = $("jug-previous");
  const next = $("jug-next");
  const optionalToggle = $("jug-optionals");
  const article = $("jug-card");
  const map = player.querySelector(".jug-overview");
  const markerLayer = $("jug-markers");
  const routeLayer = $("jug-connections");
  const dayButtons = [...player.querySelectorAll("[data-day]")];
  const image = $("jug-image");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let data;
  let allCards = [];
  let cards = [];
  let locations = new Map();
  let stops = new Map();
  let images = new Map();
  let sources = new Map();
  let visits = [];
  let visitForCard = [];
  let currentIndex = 0;
  let currentImageId = "";
  let wheelTotal = 0;
  let wheelDirection = 0;
  let wheelLastTime = 0;
  let wheelLockedUntil = 0;
  let touchStart = null;
  let ready = false;

  function svgElement(name, attributes) {
    const element = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    return element;
  }

  function project(coordinates) {
    const { west, east, south, north } = data.presentation.map.bounds;
    const width = 760;
    const height = 570;
    const radians = (value) => value * Math.PI / 180;
    const mercator = (value) => Math.log(Math.tan(Math.PI / 4 + radians(value) / 2));
    const xMin = radians(west);
    const xMax = radians(east);
    const yMin = mercator(south);
    const yMax = mercator(north);
    const scale = Math.min((width - 48) / (xMax - xMin), (height - 48) / (yMax - yMin));
    return {
      x: (width - scale * (xMax - xMin)) / 2 + (radians(coordinates.longitude) - xMin) * scale,
      y: (height - scale * (yMax - yMin)) / 2 + (yMax - mercator(coordinates.latitude)) * scale
    };
  }

  function buildVisits() {
    visits = [];
    visitForCard = [];
    for (const [index, card] of cards.entries()) {
      if (!visits.length || visits[visits.length - 1].locationId !== card.map_location_id) {
        visits.push({ locationId: card.map_location_id, firstCardIndex: index });
      }
      visitForCard[index] = visits.length - 1;
    }
  }

  function buildMap() {
    markerLayer.replaceChildren();
    routeLayer.replaceChildren();
    const shownLocations = new Set(visits.map((visit) => visit.locationId));
    for (let index = 1; index < visits.length; index += 1) {
      const from = project(locations.get(visits[index - 1].locationId).coordinates);
      const to = project(locations.get(visits[index].locationId).coordinates);
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const bend = Math.min(14, distance * 0.06);
      const midX = (from.x + to.x) / 2 - (to.y - from.y) / distance * bend;
      const midY = (from.y + to.y) / 2 + (to.x - from.x) / distance * bend;
      const path = svgElement("path", {
        d: `M${from.x.toFixed(2)},${from.y.toFixed(2)} Q${midX.toFixed(2)},${midY.toFixed(2)} ${to.x.toFixed(2)},${to.y.toFixed(2)}`,
        class: "jug-leg",
        "data-visit": index
      });
      routeLayer.appendChild(path);
    }
    for (const location of locations.values()) {
      const point = project(location.coordinates);
      const enabled = shownLocations.has(location.id);
      const marker = svgElement("g", {
        class: `jug-map-location${enabled ? "" : " is-omitted"}`,
        "data-location": location.id,
        role: enabled ? "button" : "presentation",
        tabindex: enabled ? 0 : -1,
        "aria-label": `Go to ${location.name}, ${location.country}`,
        "aria-controls": "jug-card"
      });
      if (!enabled) marker.setAttribute("aria-hidden", "true");
      marker.appendChild(svgElement("circle", { class: "jug-marker-hit", cx: point.x, cy: point.y, r: 19 }));
      marker.appendChild(svgElement("circle", { class: "jug-marker-ring", cx: point.x, cy: point.y, r: 11 }));
      marker.appendChild(svgElement("circle", { class: "jug-marker-dot", cx: point.x, cy: point.y, r: 5 }));
      const label = svgElement("text", {
        class: "jug-marker-label",
        x: point.x + location.label_offset[0],
        y: point.y + location.label_offset[1],
        "text-anchor": location.label_anchor
      });
      label.textContent = location.label;
      marker.appendChild(label);
      if (enabled) {
        const selectLocation = () => {
          const firstVisit = visits.find((visit) => visit.locationId === location.id);
          show(firstVisit.firstCardIndex);
        };
        marker.addEventListener("click", selectLocation);
        marker.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectLocation();
          }
        });
      }
      markerLayer.appendChild(marker);
    }
    layoutLabels();
  }

  function layoutLabels() {
    if (!data) return;
    const placed = [];
    const overlap = (a, b, padding = 5) => a.x < b.x + b.width + padding && a.x + a.width + padding > b.x && a.y < b.y + b.height + padding && a.y + a.height + padding > b.y;
    const points = [...locations.values()].map(location => ({id: location.id, ...project(location.coordinates)}));
    for (const marker of markerLayer.children) {
      const location = locations.get(marker.dataset.location);
      const point = project(location.coordinates);
      const label = marker.querySelector('.jug-marker-label');
      const choices = [
        [...location.label_offset, location.label_anchor],
        [13, -14, 'start'], [-13, -14, 'end'],
        [13, 7, 'start'], [-13, 7, 'end'],
        [13, 29, 'start'], [-13, 29, 'end'],
        [0, -29, 'middle'], [0, 39, 'middle'],
        [20, -40, 'start'], [-20, -40, 'end'],
        [20, 51, 'start'], [-20, 51, 'end']
      ];
      let chosen = null;
      for (const [dx, dy, anchor] of choices) {
        label.setAttribute('x', point.x + dx);
        label.setAttribute('y', point.y + dy);
        label.setAttribute('text-anchor', anchor);
        const box = label.getBBox();
        const blocked = placed.some(other => overlap(box, other)) || points.some(other => other.id !== location.id && overlap(box, {x: other.x - 6, y: other.y - 6, width:12, height:12}, 2));
        if (!blocked && box.x >= 5 && box.y >= 5 && box.x + box.width <= 755 && box.y + box.height <= 565) {
          chosen = {box, dx, dy};
          break;
        }
      }
      if (!chosen) {
        label.setAttribute('x', point.x + location.label_offset[0]);
        label.setAttribute('y', point.y + location.label_offset[1]);
        label.setAttribute('text-anchor', location.label_anchor);
        chosen = {box:label.getBBox(), dx:location.label_offset[0], dy:location.label_offset[1]};
      }
      placed.push(chosen.box);
      marker.querySelector('.jug-label-leader')?.remove();
      if (Math.abs(chosen.dy) > 30) {
        const endX = chosen.box.x + chosen.box.width / 2;
        const endY = chosen.dy > 0 ? chosen.box.y - 3 : chosen.box.y + chosen.box.height + 3;
        marker.insertBefore(svgElement('path', {class:'jug-label-leader',d:`M${point.x},${point.y} L${endX},${endY}`}), label);
      }
    }
    for (const label of map.querySelectorAll('.jug-country-label')) {
      const box = label.getBBox();
      label.classList.toggle('is-crowded', placed.some(other => overlap(box, other, 3)));
    }
  }

  function renderMap(card) {
    const currentVisit = visitForCard[currentIndex];
    const traveled = new Set(visits.slice(0, currentVisit + 1).map((visit) => visit.locationId));
    for (const marker of markerLayer.children) {
      const selected = marker.dataset.location === card.map_location_id;
      marker.classList.toggle("is-active", selected);
      marker.classList.toggle("is-visited", traveled.has(marker.dataset.location));
      if (selected) marker.setAttribute("aria-current", "location");
      else marker.removeAttribute("aria-current");
    }
    for (const path of routeLayer.children) {
      const index = Number(path.dataset.visit);
      path.classList.toggle("is-traveled", index < currentVisit);
      path.classList.toggle("is-current", index === currentVisit);
    }
    const location = locations.get(card.map_location_id);
    $("jug-map-desc").textContent = `Current area: ${location.name}, ${location.country}. City markers follow the itinerary. Connections indicate travel order.`;
    layoutLabels();
  }

  function renderSources(card) {
    const list = $("jug-source-list");
    list.replaceChildren();
    const references = card.source_ids.map((id) => sources.get(id)).filter(Boolean);
    $("jug-sources").hidden = !references.length;
    $("jug-sources").open = false;
    for (const reference of references) {
      if (!/^https:\/\//.test(reference.url)) continue;
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = reference.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = reference.title;
      item.appendChild(link);
      list.appendChild(item);
    }
  }

  function updateImage(card) {
    if (currentImageId === card.image_id) return;
    const asset = images.get(card.image_id);
    if (!asset || !asset.preferred_src.endsWith(".webp")) throw new Error("A WebP illustration is required.");
    currentImageId = card.image_id;
    $("jug-image-error").hidden = true;
    image.alt = asset.alt;
    image.width = asset.width;
    image.height = asset.height;
    image.src = new URL(asset.preferred_src, assetRoot).href;
    const captions = [
      "St. Mark's Square, Zagreb", "Republic Square, Ljubljana",
      "Arrival in Vukovar", "Vukovar siege remembrance",
      "Tito and the Museum of Yugoslavia, Belgrade", "The former General Staff complex, Belgrade",
      "The Drina bridge, Višegrad", "Sarajevo's central siege landscape",
      "The tunnel and airport perimeter, Sarajevo", "Potočari, near Srebrenica",
      "The former Trnopolje camp", "Stari Most, Mostar",
      "Dubrovnik from Mount Srđ", "Knin Fortress", "Plitvice Lakes"
    ];
    $("jug-image-caption").textContent = captions[card.day - 1];
    const followingDay = data.days[card.day];
    if (followingDay) {
      const upcoming = images.get(followingDay.image_id);
      const warm = new Image();
      warm.decoding = "async";
      warm.src = new URL(upcoming.preferred_src, assetRoot).href;
    }
  }

  function show(index, options = {}) {
    if (!cards.length) return;
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    const card = cards[currentIndex];
    const location = locations.get(card.map_location_id);
    const stop = card.stop_id ? stops.get(card.stop_id) : null;
    player.dataset.cardId = card.id;
    player.dataset.day = card.day;
    player.dataset.location = card.map_location_id;
    article.dataset.kind = card.kind;
    $("jug-day-label").textContent = `Day ${card.day} of 15`;
    $("jug-location-label").textContent = `${location.label}, ${location.country}`;
    $("jug-card-context").textContent = card.kind === "day"
      ? `Day ${card.day} begins`
      : `${stop.locality.name}, ${stop.country.name}`;
    $("jug-optional-label").hidden = !card.optional;
    $("jug-card-title").textContent = card.title;
    $("jug-card-text").textContent = card.text;
    $("jug-card-route").hidden = !card.route;
    $("jug-card-route").textContent = card.route || "";
    $("jug-card-overnight").hidden = !card.overnight;
    $("jug-card-overnight").textContent = card.overnight ? `Overnight in ${card.overnight}.` : "";
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === cards.length - 1;
    next.querySelector("span").textContent = next.disabled ? "Complete" : "Next";
    $("jug-step-count").textContent = `Card ${currentIndex + 1} of ${cards.length}`;
    $("jug-progress").max = cards.length;
    $("jug-progress").value = currentIndex + 1;
    for (const button of dayButtons) {
      if (Number(button.dataset.day) === card.day) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    }
    const activeDay = dayButtons.find(button => Number(button.dataset.day) === card.day);
    const dayRail = player.querySelector('.jug-days');
    const dayBox = activeDay.getBoundingClientRect();
    const railBox = dayRail.getBoundingClientRect();
    if (dayBox.left < railBox.left || dayBox.right > railBox.right) {
      dayRail.scrollLeft += dayBox.left - railBox.left - railBox.width / 2 + dayBox.width / 2;
    }
    renderMap(card);
    renderSources(card);
    updateImage(card);
    if (!reducedMotion.matches && options.animate !== false) {
      article.classList.remove("is-changing");
      void article.offsetWidth;
      article.classList.add("is-changing");
    }
    if (options.announce !== false) $("jug-status").textContent = `Day ${card.day}. ${card.title}. Card ${currentIndex + 1} of ${cards.length}.`;
    if (options.hash !== false) {
      const url = new URL(window.location.href);
      url.hash = card.id;
      window.history.replaceState(null, "", url);
    }
    if (options.announce !== false && finePointer.matches) {
      const box = player.getBoundingClientRect();
      const headerHeight = document.querySelector('.doc-head')?.getBoundingClientRect().height || 0;
      if (box.height <= window.innerHeight - headerHeight - 16 &&
          (box.top < headerHeight + 8 || box.bottom > window.innerHeight)) {
        window.scrollTo({ top: window.scrollY + box.top - headerHeight - 12, behavior: 'instant' });
      }
    }
  }

  function advance(direction) {
    if (!ready) return false;
    const index = currentIndex + direction;
    if (index < 0 || index >= cards.length) return false;
    show(index);
    return true;
  }

  function rebuildCards() {
    const current = cards[currentIndex] || allCards[0];
    cards = allCards.filter((card) => optionalToggle.checked || !card.optional);
    buildVisits();
    buildMap();
    let index = cards.findIndex((card) => card.id === current.id);
    if (index < 0) {
      index = cards.findLastIndex((card) => card.sequence < current.sequence);
    }
    show(Math.max(index, 0), { animate: false });
  }

  function editableTarget(target) {
    return Boolean(target.closest("input, select, textarea, [contenteditable=true]"));
  }

  previous.addEventListener("click", () => advance(-1));
  next.addEventListener("click", () => advance(1));
  optionalToggle.addEventListener("change", rebuildCards);
  for (const button of dayButtons) {
    button.addEventListener("click", () => {
      const index = cards.findIndex((card) => card.id === `day-${button.dataset.day.padStart(2, "0")}`);
      if (index >= 0) show(index);
    });
  }
  player.addEventListener("keydown", (event) => {
    if (!ready || editableTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      advance(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      show(event.key === "Home" ? 0 : cards.length - 1);
    }
  });
  player.addEventListener("wheel", (event) => {
    if (!ready || !finePointer.matches || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const headerHeight = document.querySelector('.doc-head')?.getBoundingClientRect().height || 0;
    if (player.getBoundingClientRect().height > window.innerHeight - headerHeight - 16) {
      const cardBox = article.getBoundingClientRect();
      if (cardBox.top < headerHeight + 8 || cardBox.bottom > window.innerHeight - 8) return;
    }
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (event.target.closest("button, a, input, select, textarea, summary, .jug-sources")) return;
    const direction = Math.sign(event.deltaY);
    if (!direction || (direction < 0 && currentIndex === 0) || (direction > 0 && currentIndex === cards.length - 1)) return;
    event.preventDefault();
    const now = performance.now();
    if (now < wheelLockedUntil) return;
    if (now - wheelLastTime > 220 || direction !== wheelDirection) wheelTotal = 0;
    wheelLastTime = now;
    wheelDirection = direction;
    const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    wheelTotal += event.deltaY * units;
    if (Math.abs(wheelTotal) >= 70) {
      advance(direction);
      wheelTotal = 0;
      wheelLockedUntil = now + 650;
    }
  }, { passive: false });

  article.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" || event.target.closest("a, button, summary, input")) return;
    touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  article.addEventListener("pointerup", (event) => {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= 70 && Math.abs(dy) < 55) advance(dx < 0 ? 1 : -1);
  });
  article.addEventListener("pointercancel", () => { touchStart = null; });
  image.addEventListener("error", () => { $("jug-image-error").hidden = false; });
  window.addEventListener("hashchange", () => {
    if (!ready) return;
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const index = cards.findIndex((card) => card.id === id);
    if (index >= 0) show(index, { hash: false });
  });
  window.addEventListener('resize', layoutLabels);

  async function initialize() {
    try {
      const response = await fetch(new URL("itinerary.json", assetRoot));
      if (!response.ok) throw new Error(`Itinerary request failed: ${response.status}`);
      data = await response.json();
      allCards = data.presentation.cards;
      locations = new Map(data.presentation.map.locations.map((location) => [location.id, location]));
      stops = new Map(data.stops.map((stop) => [stop.id, stop]));
      images = new Map(data.assets.map((asset) => [asset.id, asset]));
      sources = new Map(data.sources.map((source) => [source.id, source]));
      if (!allCards.length || !allCards.every((card) => locations.has(card.map_location_id) && images.has(card.image_id))) {
        throw new Error("The itinerary has invalid location or illustration references.");
      }
      optionalToggle.checked = data.presentation.include_optional_by_default;
      cards = allCards.filter((card) => optionalToggle.checked || !card.optional);
      buildVisits();
      buildMap();
      let initialId = data.presentation.initial_card_id;
      try { initialId = decodeURIComponent(window.location.hash.slice(1)) || initialId; } catch { /* Use the opening card for malformed links. */ }
      const initialIndex = cards.findIndex((card) => card.id === initialId);
      ready = true;
      optionalToggle.disabled = false;
      dayButtons.forEach((button) => { button.disabled = false; });
      show(Math.max(initialIndex, 0), { animate: false, announce: false });
    } catch (error) {
      console.error("The Yugoslavia itinerary could not be initialized.", error);
      $("jug-load-error").hidden = false;
      $("jug-full-itinerary").open = true;
      $("jug-step-count").textContent = "Read the itinerary below";
      ready = false;
      previous.disabled = true;
      next.disabled = true;
      optionalToggle.disabled = true;
      dayButtons.forEach((button) => { button.disabled = true; });
    }
  }

  initialize();
})();
