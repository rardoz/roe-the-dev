import bpy,json,math,random,hashlib
from pathlib import Path
from mathutils import Vector
folder=Path('/Users/slayanne/Projects/roe-the-dev/design/city')
backup=folder/'city-before-lighter-floor-and-rocks.blend'
assert not backup.exists()
c=bpy.data.collections['Industrial metal island']
root=next(o for o in c.objects if o.type=='EMPTY')
floor=bpy.data.objects['Island continuous worn steel deck and simple core']
slabs=[o for o in c.objects if o.name.startswith('Island projecting metal slab') or 'perimeter bolts' in o.name]
def signature(o):
    return (tuple(tuple(v.co) for v in o.data.vertices),tuple(m.name for m in o.data.materials),tuple(tuple(row) for row in o.matrix_world))
before={o.name:signature(o) for o in slabs}
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before lighter deck and sparse rocks')
original=floor.data.materials[0]
mat=original.copy();mat.name='Island floor | 25 percent lighter worn steel'
node=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
old=tuple(node.inputs['Base Color'].default_value)
color=tuple(v*1.25 for v in old[:3])+(old[3],)
node.inputs['Base Color'].default_value=color;mat.diffuse_color=color
floor.data.materials.append(mat)
top_faces=0
for p in floor.data.polygons:
    if p.normal.z>.9:
        p.material_index=len(floor.data.materials)-1;top_faces+=1
assert top_faces>0
rock_mat=bpy.data.materials['Barren angular stone | dark gray']
rng=random.Random(429)
spots=[(-21.8,-13.0,1.25,.80,.95),(-23.2,-12.3,.65,.55,.50),(13.0,-18.3,1.05,.70,1.05),(14.1,-17.6,.48,.48,.43),(-.9,20.0,1.15,.75,.88),(.5,20.5,.55,.45,.38),(23.7,6.5,.85,.73,1.12),(24.0,7.6,.50,.45,.46)]
added=[]
for i,(x,y,sx,sy,h) in enumerate(spots):
    count=7;verts=[]
    for j in range(count):
        angle=j*2*math.pi/count
        radius=rng.uniform(.82,1.07)
        verts.append((x+math.cos(angle)*sx*radius,y+math.sin(angle)*sy*radius,-.02))
    for j in range(count):
        angle=j*2*math.pi/count
        verts.append((x+.12+math.cos(angle)*sx*.57,y-.08+math.sin(angle)*sy*.55,h*rng.uniform(.52,.85)))
    verts.append((x-.14,y+.06,h))
    faces=[tuple(reversed(range(count)))]
    for j in range(count):
        k=(j+1)%count
        faces.extend([(j,k,count+k),(j,count+k,count+j),(count+j,count+k,2*count)])
    mesh=bpy.data.meshes.new(f'Additional barren perimeter rock {i+1:02d}');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(mesh.name,mesh);c.objects.link(obj);obj.parent=root;mesh.materials.append(rock_mat);added.append(obj)
bpy.context.view_layer.update()
city=bpy.data.collections['Buildings | editable groups']
building_bounds=[]
for g in [o for o in city.objects if o.type=='EMPTY']:
    points=[o.matrix_world@Vector(v) for o in g.children if o.type=='MESH' for v in o.bound_box]
    building_bounds.append((g.name,min(p.x for p in points),max(p.x for p in points),min(p.y for p in points),max(p.y for p in points)))
for o in added:
    points=[o.matrix_world@Vector(v) for v in o.bound_box]
    lowx,highx=min(p.x for p in points),max(p.x for p in points)
    lowy,highy=min(p.y for p in points),max(p.y for p in points)
    for name,x0,x1,y0,y1 in building_bounds:
        assert min(highx,x1)-max(lowx,x0)<=0 or min(highy,y1)-max(lowy,y0)<=0,(o.name,name)
for o in slabs:assert before[o.name]==signature(o),o.name
assert tuple(next(n for n in original.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'].default_value)==old
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'floor_before':old[0],'floor_after':color[0],'new_rocks':len(added),'clusters':4,'perimeter_unchanged':True,'no_building_collisions':True}))
