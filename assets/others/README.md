# Route explorer map

`routes-base.svg` contains locally stored country and U.S. state boundaries from Natural Earth's 1:110m datasets. Natural Earth data is in the [public domain](https://www.naturalearthdata.com/about/terms-of-use/).

The geographic source files are [countries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson) and [states and provinces](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_1_states_provinces.geojson), retrieved October 1, 2026. Geometry is clipped to 165° W–45° W and 5° N–80° N before projection. Country outlines, state boundaries, state abbreviations, and a graticule are embedded in the SVG.

The basemap and `routes.js` use the same spherical Albers equal-area projection: standard parallels 29.5° N and 45.5° N, central meridian 102° W, latitude of origin 38° N, scale 1500, and translation `[600, 375]` in a 1200 × 700 coordinate space. The SVG background extends beyond this central area to fill taller mobile views without cutting off the surrounding geography.

`routes-data.js` stores itinerary text, named locations, and ordered daily driving waypoints. Coordinates use GeoJSON order `[longitude, latitude]`; days are one-based. Point roles are `origin`, `stop`, `overnight`, and `destination`. Each day names its visible stops and final location. The `drive` array contains point IDs and additional named road waypoints. Additional waypoints control road selection without adding visible markers.

`routes-states.js` contains projected Natural Earth state polygons. `routes-geometry.js` contains simplified SVG paths per day, full-road bounds, state lists, generation metadata, and route review summaries. `routes-road.geojson`, when generated, retains the complete road coordinates. `routes.js` renders only local assets, with no runtime routing requests, external map library, or tile server. If geometry is absent, the page says so and shows unconnected location markers; it never substitutes straight lines for driving routes.

## Generate road geometry

Install Python dependencies with `python -m pip install requests shapely geopandas pyproj`. Create a free [HeiGIT account](https://account.heigit.org/) and save its key in the root `.env.routes` file as `ORS_API_KEY=your-key`, or set the `ORS_API_KEY` environment variable. `.env.routes` and the source cache are excluded from both Git and Cloudflare asset uploads. Never put the key in the page, a JavaScript asset, or a command-line argument.

Run `python assets/others/tools/build_routes.py` from the repository root. The script uses `https://api.heigit.org/openrouteservice/v2/directions/driving-car/geojson` and caches each daily response by request hash. It validates every route before replacing the published geometry; an API or validation failure preserves existing road files. The `--geography-only` flag regenerates display state polygons without a key. Cached responses can be reused without contacting the routing service.

State crossings are calculated from the unsimplified road lines against the [2024 Census 1:500,000 state boundaries](https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_state_500k.zip), transformed to EPSG:5070 for measuring intersection lengths. Intersections of 25 meters or less are treated as boundary slivers. Review `.route-cache/review.json` for state distances, road names, drive duration, and waypoint snapping distances, especially short crossings near rivers. Natural Earth is generalized display geography, so its borders can differ slightly from Census boundaries. Display lines are simplified with a tolerance of 0.15 Albers map units; original coordinates remain in the GeoJSON.

The full geometry is a driving proposal through specified road-access locations. Point coordinates approximate visitor parking, entrances, or town centers, not hotel locations. The generator rejects waypoint snaps over 750 meters. Day descriptions supply the trip's intent; route duration excludes hikes, visits, breaks, and traffic. Provisional overnight areas do not establish lodging availability or confirm that the daily schedule is practical.

## October 2026 assumptions

Route C uses Yellowstone's East Entrance, West Thumb, Old Faithful, Madison, Norris, and Mammoth Hot Springs, then exits through Gardiner. It avoids Beartooth Highway and Dunraven Pass. Glacier uses West Glacier and Lake McDonald, returning west instead of crossing Logan Pass. Corridor waypoints enforce that route, and a geometry check rejects lines crossing the three excluded passes. The hosted API limits avoid-area requests to 150 km, so exclusion polygons are used for validation rather than submitted with long daily requests.

The [Yellowstone road schedule](https://www.nps.gov/yell/planyourvisit/parkroads.htm) and [Glacier road information](https://www.nps.gov/glac/planyourvisit/gtsrinfo.htm) were reviewed October 1, 2026. Road availability can change with weather. Park overnight points indicate areas only. Route A uses paved Ross Maxwell Scenic Drive for Santa Elena Canyon; Route B returns from Kelso Depot to I-15; Route C approaches Sylvan Lake from Custer without requiring Needles Highway. Individual park access sources are recorded with the point data.

## Verify

Run `python assets/others/tools/verify_routes.py` (requires `beautifulsoup4` and Node.js). It reads the actual HTML, simulates route selection and keyboard interaction, checks overnight roles and day joins, verifies selected-only state highlights in both views, and exports desktop/mobile SVGs to `.impeccable/routes-map/`. It reports whether all three road assets exist. This is a DOM simulation and SVG geometry check, not a browser layout test.

Inspect the generated driving lines and `.route-cache/review.json` before publishing. The page attribution credits Natural Earth, Census, openrouteservice by HeiGIT, and OpenStreetMap contributors. Regenerate the affected cached requests whenever the itinerary or corridor waypoints change.

Page and map styling is in `routes.css`. The styles apply to `others/routes.html` without changing the rest of the site.
