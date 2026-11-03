import sys,json
sys.path.insert(0,'/private/tmp/city-road-geometry')
from shapely.geometry import box
from shapely.ops import unary_union
from shapely import constrained_delaunay_triangles
from pathlib import Path
obs=json.loads(Path('/private/tmp/city-road-obstacles.json').read_text())
domains=[(-22,16,-12.4,-6.15),(-21.6,22.8,-6.15,0),(-21.4,23.3,0,12.4),(-13.2,13,-18.1,-12.4),(-6.5,6.8,12.4,18.5)]
base=unary_union([box(a,c,b,d) for a,b,c,d in domains])
obstacles=unary_union([box(a,c,b,d) for a,b,c,d in obs])
road=base.difference(obstacles.buffer(.48,quad_segs=8))
road=road.buffer(-.18,quad_segs=8).buffer(.18,quad_segs=8)
road=road.buffer(.12,quad_segs=8).buffer(-.12,quad_segs=8)
assert road.is_valid and road.distance(obstacles)>.35
tris=constrained_delaunay_triangles(road)
triangles=[list(p.exterior.coords)[:3] for p in tris.geoms]
Path('/private/tmp/rounded-road-triangles.json').write_text(json.dumps(triangles))
print({'triangles':len(triangles),'minimum_clearance':road.distance(obstacles),'area':road.area})
from shapely.geometry import Polygon
marks=json.loads(Path('/private/tmp/city-road-marks.json').read_text())
marks=[p for p in marks if road.covers(Polygon(p))]
Path('/private/tmp/rounded-road-marks.json').write_text(json.dumps(marks))
print('Retained markings',len(marks))
