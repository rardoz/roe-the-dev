import bpy,json,math
from pathlib import Path
from mathutils import Vector
folder=Path('/Users/slayanne/Projects/roe-the-dev/design/city')
backup=folder/'city-before-metal-pillar-formations.blend'
assert not backup.exists()
c=bpy.data.collections['Industrial metal island'];root=next(o for o in c.objects if o.type=='EMPTY')
protected={o.name:(tuple(tuple(v.co) for v in o.data.vertices),tuple(m.name for m in o.data.materials)) for o in c.objects if o.type=='MESH' and 'rock' not in o.name.lower()}
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before replacing stones with metal pillars')
removed=[]
for o in list(c.objects):
    if o.type=='MESH' and any(word in o.name.lower() for word in ('rock','stone')):
        removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
materials=[bpy.data.materials[f'Island dark worn steel {i}'] for i in range(1,4)]
# Four sparse formations, exclusively on the outer left and right flanks.
specs=[
(-24.1,-6.7,.95,1.35,3.8,.30,0),(-23.5,-5.9,.78,1.05,2.15,-.18,1),(-24.3,-5.55,.68,.85,.95,.12,2),
(-23.0,10.5,1.05,1.25,2.45,-.25,1),(-23.7,10.0,.72,1.0,1.10,.10,0),
(23.1,-10.5,1.05,1.15,3.1,-.25,2),(22.45,-10.0,.80,.85,1.65,.12,0),(23.2,-9.55,.65,.80,.85,-.10,1),
(23.65,6.5,.9,1.3,4.2,.35,1),(24.15,7.35,.76,1.05,2.35,-.18,2),(23.4,7.55,.65,.85,1.15,.12,0)]
added=[]
for i,(x,y,w,d,h,slope,mi) in enumerate(specs):
    cut=min(w,d)*.12
    ring=[(-w/2+cut,-d/2),(w/2-cut,-d/2),(w/2,-d/2+cut),(w/2,d/2-cut),(w/2-cut,d/2),(-w/2+cut,d/2),(-w/2,d/2-cut),(-w/2,-d/2+cut)]
    vertices=[(x+a,y+b,-.35) for a,b in ring]+[(x+a*.92,y+b*.92,h+slope*a/w) for a,b in ring]
    n=len(ring);faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
    mesh=bpy.data.meshes.new(f'Metal formation pillar {i+1:02d}');mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(mesh.name,mesh);c.objects.link(obj);obj.parent=root;mesh.materials.append(materials[mi])
    uv=mesh.uv_layers.new(name='Steel grain UV')
    for p in mesh.polygons:
        axis=max(range(3),key=lambda a:abs(p.normal[a]));axes=(0,1) if axis==2 else ((0,2) if axis==1 else (1,2))
        for li in p.loop_indices:
            v=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=(v[axes[0]]/7,v[axes[1]]/7)
    bevel=obj.modifiers.new('Subtle steel edges','BEVEL');bevel.width=.025;bevel.segments=2
    added.append(obj)
bpy.context.view_layer.update()
city=bpy.data.collections['Buildings | editable groups']
bounds=[]
for g in [o for o in city.objects if o.type=='EMPTY']:
    pts=[o.matrix_world@Vector(v) for o in g.children if o.type=='MESH' for v in o.bound_box]
    bounds.append((g.name,min(p.x for p in pts),max(p.x for p in pts),min(p.y for p in pts),max(p.y for p in pts)))
for obj in added:
    pts=[obj.matrix_world@Vector(v) for v in obj.bound_box]
    x0,x1=min(p.x for p in pts),max(p.x for p in pts);y0,y1=min(p.y for p in pts),max(p.y for p in pts)
    assert x1<-21 or x0>21
    for name,a,b,d,e in bounds:assert min(x1,b)<=max(x0,a) or min(y1,e)<=max(y0,d),(obj.name,name)
for name,state in protected.items():
    o=bpy.data.objects[name];assert state==(tuple(tuple(v.co) for v in o.data.vertices),tuple(m.name for m in o.data.materials))
assert not any('rock' in o.name.lower() or 'stone' in o.name.lower() for o in c.objects)
root['Surface formations']='Four sparse groups of emerging dark metal pillars, only on left and right sides; no stones.'
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'stones_removed':len(removed),'metal_pillars':len(added),'formations':4,'height_range':[min(s[4] for s in specs),max(s[4] for s in specs)],'floor_and_perimeter_unchanged':True}))
