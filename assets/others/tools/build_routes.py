"""Build local SVG state overlays and ORS road geometry. No credentials enter outputs.

python assets/others/tools/build_routes.py --geography-only
python assets/others/tools/build_routes.py
Dependencies: requests, shapely, geopandas, pyproj (pip install ...).
An ORS_API_KEY environment variable or .env.routes file in the root or assets/others is required for uncached requests.
"""
from pathlib import Path
from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, hypot
import argparse
import hashlib
import json
import os
import sys
import time

import requests
from shapely.geometry import shape, LineString
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[3]
ASSETS = ROOT / 'assets' / 'others'
CACHE = ASSETS / '.route-cache'
ENDPOINT = 'https://api.heigit.org/openrouteservice/v2/directions/driving-car/geojson'
NATURAL_EARTH = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson'
CENSUS = 'https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_state_500k.zip'
# The hosted API limits avoid-area requests to 150 km. Enforce these exclusions
# through corridor waypoints, then reject any returned geometry intersecting them.
EXCLUDED_PASSES = {'type': 'MultiPolygon', 'coordinates': [
    [[[w, s], [e, s], [e, n], [w, n], [w, s]]]
    for w, s, e, n in [(-110.49, 44.77, -110.42, 44.82),
                       (-109.50, 44.94, -109.35, 45.02),
                       (-113.74, 48.68, -113.70, 48.71)]]}
N = (sin(radians(29.5)) + sin(radians(45.5))) / 2
C = cos(radians(29.5)) ** 2 + 2 * N * sin(radians(29.5))
RHO0 = sqrt(C - 2 * N * sin(radians(38))) / N


def project(lon, lat):
    rho = sqrt(C - 2 * N * sin(radians(lat))) / N
    theta = N * radians(lon + 102)
    return 600 + 1500 * rho * sin(theta), 375 - 1500 * (RHO0 - rho * cos(theta))


def svg_line(coords, close=False):
    return 'M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in coords) + ('Z' if close else '')


def polygon_path(geom):
    if geom.geom_type == 'Polygon':
        return svg_line([project(*p[:2]) for p in geom.exterior.coords], True) + ''.join(
            svg_line([project(*p[:2]) for p in ring.coords], True) for ring in geom.interiors)
    return ''.join(polygon_path(g) for g in geom.geoms)


def atomic_write(path, content):
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_text(content, encoding='utf-8')
    os.replace(tmp, path)


def download(url, filename):
    path = CACHE / filename
    if not path.exists():
        response = requests.get(url, timeout=90)
        response.raise_for_status()
        temporary = path.with_suffix(path.suffix + '.tmp')
        temporary.write_bytes(response.content)
        os.replace(temporary, path)
    return path


def build_states():
    path = CACHE / 'ne_110m_admin_1_states_provinces.geojson'
    old_cache = ROOT / '.impeccable/routes-map' / path.name
    if not path.exists() and old_cache.exists():
        path.write_bytes(old_cache.read_bytes())
    features = json.loads(download(NATURAL_EARTH, path.name).read_text(encoding='utf-8'))['features']
    states = {}
    for feature in features:
        p = feature['properties']
        if p['postal'] in ('AK', 'HI'): continue
        states[p['postal']] = {'name': p['name'], 'path': polygon_path(shape(feature['geometry']))}
    atomic_write(ASSETS / 'routes-states.js', 'const routeStates = ' + json.dumps(states, separators=(',', ':')) + ';\n')
    print(f'Built {len(states)} display state polygons.')
    return states


def load_key():
    key = os.environ.get('ORS_API_KEY') or os.environ.get('OPENROUTESERVICE_API_KEY') or os.environ.get('HEIGIT_API_KEY')
    for path in (ASSETS / '.env.routes', ROOT / '.env.routes'):
        if key: break
        if not path.exists(): continue
        for line in path.read_text(encoding='utf-8-sig').splitlines():
            name, separator, value = line.strip().partition('=')
            if separator and name.strip() == 'ORS_API_KEY':
                key = value.strip().strip('\"').strip("'")
                break
    return key


def read_data():
    text = (ASSETS / 'routes-data.js').read_text(encoding='utf-8')
    return json.loads(text.removeprefix('const routeData = ').strip().removesuffix(';'))


def request_body(day, points, route_key):
    coords = [points[v]['coordinates'] if isinstance(v, str) else v['coordinates'] for v in day['drive']]
    options = {'avoid_borders': 'all', 'avoid_features': ['ferries', 'fords']}
    return {'coordinates': coords, 'preference': 'recommended', 'instructions': True, 'geometry_simplify': False,
            'radiuses': [1500] * len(coords), 'options': options}


def fetch_day(body, key, label):
    digest = hashlib.sha256(json.dumps({'endpoint': ENDPOINT, 'body': body}, sort_keys=True).encode()).hexdigest()
    cache_file = CACHE / f'{label}-{digest[:16]}.json'
    if cache_file.exists():
        return json.loads(cache_file.read_text(encoding='utf-8'))
    if not key:
        raise RuntimeError('Set ORS_API_KEY or save it in .env.routes before generating roads. Existing road assets were not changed.')
    for attempt in range(4):
        response = requests.post(ENDPOINT, json=body, headers={'Authorization': key}, timeout=90)
        if response.status_code in (429, 502, 503, 504) and attempt < 3:
            time.sleep(5 * (attempt + 1))
            continue
        if not response.ok:
            # Do not echo remote response bodies or authenticated request objects.
            detail = ''
            try:
                error = response.json().get('error', {})
                detail = str(error.get('code', '')) if isinstance(error, dict) else ''
            except ValueError: pass
            raise RuntimeError(f'{label}: routing HTTP {response.status_code}, provider code {detail}. No road assets changed.')
        result = response.json()
        if not result.get('features'):
            raise RuntimeError(f'{label}: no route returned. No road assets changed.')
        atomic_write(cache_file, json.dumps(result, separators=(',', ':')))
        time.sleep(1.6)
        return result


def generate(data, states, key):
    import geopandas as gpd
    from pyproj import Transformer
    frame = gpd.read_file(download(CENSUS, 'cb_2024_us_state_500k.zip')).to_crs(4326)
    metric = Transformer.from_crs(4326, 5070, always_xy=True).transform
    census = [(row.STUSPS, transform(metric, row.geometry)) for row in frame.itertuples() if row.STUSPS in states]
    output = {'generatedAt': datetime.now(timezone.utc).isoformat(), 'travelMonth': '2026-10',
              'provider': 'openrouteservice', 'attribution': '© openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors',
              'stateSource': CENSUS, 'endpoint': ENDPOINT, 'routes': {}}
    raw = {'type': 'FeatureCollection', 'metadata': {k: v for k, v in output.items() if k != 'routes'}, 'features': []}
    report = []
    for route_key, route in data.items():
        points = {p['id']: p for p in route['points']}
        paths, all_xy, state_distances, day_reports = [], [], {}, []
        previous_end = None
        for index, day in enumerate(route['days']):
            label = f'{route_key}-day-{index + 1}'
            body = request_body(day, points, route_key)
            result = fetch_day(body, key, label)
            feature = result['features'][0]
            coordinates = feature['geometry']['coordinates']
            if feature['geometry']['type'] != 'LineString' or len(coordinates) < 2:
                raise RuntimeError(f'{label}: invalid road geometry')
            if previous_end and hypot(coordinates[0][0] - previous_end[0], coordinates[0][1] - previous_end[1]) > .003:
                raise RuntimeError(f'{label}: disconnected daily routes')
            previous_end = coordinates[-1]
            line = LineString(coordinates)
            metric_line = transform(metric, line)
            if route_key == 'C' and line.intersects(shape(EXCLUDED_PASSES)):
                raise RuntimeError(f'{label}: route enters an excluded seasonal pass')
            indices = feature['properties']['way_points']
            if len(indices) != len(body['coordinates']):
                raise RuntimeError(f'{label}: waypoint count does not match the request')
            snapped = [coordinates[i] for i in indices]
            snap_distances = [hypot(*(a-b for a,b in zip(metric(*requested), metric(*actual)))) for requested, actual in zip(body['coordinates'], snapped)]
            if max(snap_distances) > 750:
                raise RuntimeError(f'{label}: a waypoint snapped more than 750 m; review its public road access')
            xy = [project(*p[:2]) for p in coordinates]
            all_xy.extend(xy)
            paths.append(svg_line(LineString(xy).simplify(.15, preserve_topology=False).coords))
            crossed = {}
            for code, polygon in census:
                distance = metric_line.intersection(polygon).length
                if distance > 25:
                    crossed[code] = round(distance / 1000, 3)
                    state_distances[code] = state_distances.get(code, 0) + distance
            roads = sorted({step['name'] for segment in feature['properties'].get('segments', []) for step in segment.get('steps', []) if step.get('name') and step['name'] != '-'})
            summary = feature['properties']['summary']
            day_reports.append({'day': index + 1, 'distanceKm': round(summary['distance']/1000, 1),
                                'durationHours': round(summary['duration']/3600, 2), 'states': crossed,
                                'maxSnapMeters': round(max(snap_distances)), 'roads': roads})
            raw['features'].append({'type': 'Feature', 'geometry': feature['geometry'], 'properties': {
                'route': route_key, 'day': index + 1, 'waypoints': body['coordinates'],
                'summary': summary, 'sourceMetadata': result.get('metadata', {})}})
            print(f'{label}: {summary["distance"]/1000:.0f} km, max snap {max(snap_distances):.0f} m, states {", ".join(crossed)}', flush=True)
        xs, ys = zip(*all_xy)
        output['routes'][route_key] = {'paths': paths, 'bounds': [min(xs), min(ys), max(xs), max(ys)],
                                       'states': sorted(state_distances), 'days': day_reports}
        report.append({'route': route_key, 'stateKm': {k: round(v/1000, 3) for k, v in state_distances.items()}, 'days': day_reports})
    # Serialize and validate every route before touching the published assets.
    raw_text = json.dumps(raw, separators=(',', ':'))
    display_text = 'const routeGeometry = ' + json.dumps(output, separators=(',', ':')) + ';\n'
    # API metadata can include the query, but never persist an authorization value.
    if key and (key in raw_text or key in display_text):
        raise RuntimeError('Credential detected in output; generation aborted.')
    atomic_write(CACHE / 'review.json', json.dumps(report, indent=2))
    atomic_write(ASSETS / 'routes-road.geojson', raw_text)
    atomic_write(ASSETS / 'routes-geometry.js', display_text)
    print('Saved full road GeoJSON and simplified display geometry. Review .route-cache/review.json.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--geography-only', action='store_true')
    args = parser.parse_args()
    CACHE.mkdir(exist_ok=True)
    states = build_states()
    if not args.geography_only:
        generate(read_data(), states, load_key())


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, requests.RequestException) as error:
        # Requests exceptions can carry sensitive headers in attached objects; only emit safe messages.
        print(str(error) if isinstance(error, RuntimeError) else 'Network request failed; existing road geometry was preserved.', file=sys.stderr)
        sys.exit(1)
