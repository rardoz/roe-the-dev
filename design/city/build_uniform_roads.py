import sys,json
sys.path.insert(0,'/private/tmp/city-road-geometry')
from pathlib import Path
from shapely.geometry import LineString,box
from shapely.ops import unary_union
from shapely import constrained_delaunay_triangles
b={int(k):v for k,v in json.loads(Path('/private/tmp/city-uniform-bounds.json').read_text()).items()}
rows=[[3,1,2,27,4,5],[6,7,8,9,10,11,12],[13,14,15,16,17,18,19],[20,21,22,23,24,25,26]]
ys=[-12.3]+[(max(b[i][3] for i in a)+min(b[i][2] for i in c))/2 for a,c in zip(rows,rows[1:])]+[12.1]
lines=[]
for i,y in enumerate(ys):lines.append(LineString([(-21.65,y),(15.5 if i==0 else 23,y)]))
for ri,row in enumerate(rows):
 for a,c in zip(row,row[1:]):
  x=(b[a][1]+b[c][0])/2;lines.append(LineString([(x,ys[ri]),(x,ys[ri+1])]))
lines.append(LineString([(-21.65,ys[0]),(-21.65,ys[-1])]))
lines.append(LineString([(23,ys[1]),(23,ys[-1])]))
lines.append(LineString([(15.5,ys[0]),(15.5,ys[1])]))
lines.append(LineString([(-13.2,-12.3),(-13.2,-18.1),(12.8,-18.1),(12.8,-12.3)]))
for x in (-6.56,-.025,6.91):lines.append(LineString([(x,-18.1),(x,-12.3)]))
lines.append(LineString([(-6.4,12.1),(-6.4,18.5),(6.7,18.5),(6.7,12.1)]))
lines.append(LineString([(.08,12.1),(.08,18.5)]))
width=.67
road=unary_union(lines).buffer(width/2,quad_segs=10)
road=road.buffer(.12,quad_segs=10).buffer(-.12,quad_segs=10)
clearance=min(road.distance(box(a,c,d,e)) for a,d,c,e in b.values())
assert clearance>0,(clearance,width)
assert road.geom_type=='Polygon'
tris=constrained_delaunay_triangles(road)
Path('/private/tmp/uniform-road-triangles.json').write_text(json.dumps([list(p.exterior.coords)[:3] for p in tris.geoms]))
print({'width':width,'minimum_building_clearance':clearance,'connected':True,'triangles':len(tris.geoms)})
