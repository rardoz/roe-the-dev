import bpy,json
from pathlib import Path
from mathutils import Vector
folder=Path('/Users/slayanne/Projects/roe-the-dev/design/city')
backup=folder/'city-before-wider-lighter-roads.blend'
assert not backup.exists()
city=bpy.data.collections['Buildings | editable groups'];island=bpy.data.collections['Industrial metal island']
obstacles=[];margin=.15
for group in [o for o in city.objects if o.type=='EMPTY']:
    pts=[o.matrix_world@Vector(v) for o in group.children if o.type=='MESH' for v in o.bound_box]
    obstacles.append((min(p.x for p in pts)-margin,max(p.x for p in pts)+margin,min(p.y for p in pts)-margin,max(p.y for p in pts)+margin))
for o in island.objects:
    if o.type=='MESH' and 'pillar' in o.name.lower():
        pts=[o.matrix_world@Vector(v) for v in o.bound_box]
        obstacles.append((min(p.x for p in pts)-.18,max(p.x for p in pts)+.18,min(p.y for p in pts)-.18,max(p.y for p in pts)+.18))
domains=[(-22,16,-12.4,-6.15),(-21.6,22.8,-6.15,0),(-21.4,23.3,0,12.4),(-13.2,13.0,-18.1,-12.4),(-6.5,6.8,12.4,18.5)]
xs=sorted({x for rect in domains+obstacles for x in rect[:2]});ys=sorted({y for rect in domains+obstacles for y in rect[2:]})
def contains(rect,x,y):return rect[0]<x<rect[1] and rect[2]<y<rect[3]
rects=[];open_runs={}
for ya,yb in zip(ys,ys[1:]):
    y=(ya+yb)/2;runs=[];start=None
    for xa,xb in zip(xs,xs[1:]):
        x=(xa+xb)/2
        road=any(contains(d,x,y) for d in domains) and not any(contains(o,x,y) for o in obstacles)
        if road and start is None:start=xa
        if not road and start is not None:runs.append((start,xa));start=None
    if start is not None:runs.append((start,xs[-1]))
    next_runs={}
    for a,b in runs:
        key=(a,b)
        if key in open_runs:
            index=open_runs[key];rects[index]=(a,b,rects[index][2],yb)
        else:index=len(rects);rects.append((a,b,ya,yb))
        next_runs[key]=index
    open_runs=next_runs
for a,b,d,e in rects:
    for x0,x1,y0,y1 in obstacles:assert min(b,x1)<=max(a,x0)+1e-6 or min(e,y1)<=max(d,y0)+1e-6
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before broader lighter city roads')
road=bpy.data.objects['City narrow road network']
mat=road.data.materials[0]
node=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
node.inputs['Base Color'].default_value=(.16,.16,.16,1);node.inputs['Roughness'].default_value=.96
mat.diffuse_color=(.16,.16,.16,1);mat.name='City roads | medium gray asphalt'
verts=[];faces=[]
for a,b,d,e in rects:
    index=len(verts);verts.extend([(a,d,.012),(b,d,.012),(b,e,.012),(a,e,.012)]);faces.append(tuple(range(index,index+4)))
mesh=bpy.data.meshes.new('Broad road surfaces fitted around buildings');mesh.from_pydata(verts,[],faces);mesh.update();mesh.materials.append(mat)
road.data=mesh;road.name='City roads fitted to building gaps';road['Building clearance']=margin
road['Design']='Gray asphalt fills street gaps with 0.15-unit building margins; broad junctions and front/rear access.'
# Preserve simple lane dashes, slightly brighter than the asphalt.
marks=bpy.data.objects['City restrained road lane dashes']
markmat=marks.data.materials[0];n=next(n for n in markmat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
n.inputs['Base Color'].default_value=(.36,.36,.36,1);markmat.diffuse_color=(.36,.36,.36,1)
# Remove any old dashes outside the revised road footprint.
import bmesh
bm=bmesh.new();bm.from_mesh(marks.data)
remove=[]
for f in bm.faces:
    p=f.calc_center_median()
    if not any(contains(d,p.x,p.y) for d in domains) or any(contains(o,p.x,p.y) for o in obstacles):remove.append(f)
bmesh.ops.delete(bm,geom=remove,context='FACES');bm.to_mesh(marks.data);bm.free()
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'saved':bpy.data.filepath,'road_surface_rectangles':len(rects),'building_margin':margin,'asphalt_color':.16,'clearances_verified':True}))
