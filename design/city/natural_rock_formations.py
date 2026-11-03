import bpy,bmesh,json,math,random
from pathlib import Path
from mathutils import Vector
folder=Path('/Users/slayanne/Projects/roe-the-dev/design/city')
backup=folder/'city-before-natural-rock-formations.blend'
assert not backup.exists()
c=bpy.data.collections['Industrial metal island'];root=next(o for o in c.objects if o.type=='EMPTY')
floor=bpy.data.objects['Island continuous worn steel deck and simple core']
protected={o.name:(tuple(tuple(v.co) for v in o.data.vertices),tuple(m.name for m in o.data.materials)) for o in c.objects if o.type=='MESH' and ('metal slab' in o.name or 'perimeter bolts' in o.name)}
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before natural rock composition and lighter deck')
mat=next(m for m in floor.data.materials if m.name.startswith('Island floor |'))
node=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
old=tuple(node.inputs['Base Color'].default_value);color=tuple(v*1.25 for v in old[:3])+(1,)
node.inputs['Base Color'].default_value=color;mat.diffuse_color=color
for o in list(c.objects):
    if o.type=='MESH' and 'rock' in o.name.lower():bpy.data.objects.remove(o,do_unlink=True)
materials=[]
for i,s in enumerate((.025,.032,.039)):
    m=bpy.data.materials.new(f'Weathered charcoal stone {i+1}');m.use_nodes=True;m.diffuse_color=(s,s,s,1)
    n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');n.inputs['Base Color'].default_value=(s,s,s,1);n.inputs['Roughness'].default_value=.98
    materials.append(m)
# Elongated main outcrops with overlapping shoulders and low fragments.
formations=[
 [(-23.4,.0,2.7,.68,.78,86),(-23.1,1.6,1.35,.82,.48,75),(-24.0,-2.3,.90,.38,.22,60)],
 [(-15.2,-17.7,1.85,.65,.53,-14),(-16.5,-17.1,.95,.54,.33,18),(-13.8,-18.1,.62,.31,.16,-20)],
 [(12.9,-18.6,1.40,.52,.82,8),(13.85,-18.15,.73,.42,.41,-30),(11.6,-18.9,.58,.28,.20,5)],
 [(23.75,7.4,2.05,.55,.55,87),(23.8,8.85,.95,.52,.28,63)],
 [(-.65,20.05,2.35,.63,.42,-8),(-2.25,20.1,.92,.68,.32,24),(.95,19.8,.65,.32,.16,-5)] ]
rng=random.Random(6547);added=[]
for fi,formation in enumerate(formations):
    for ri,(x,y,sx,sy,h,rotation) in enumerate(formation):
        angle=math.radians(rotation);co,si=math.cos(angle),math.sin(angle)
        points=[]
        for j in range(11):
            a=j*2*math.pi/11;r=rng.uniform(.85,1.05)
            points.append((sx*r*math.cos(a),sy*r*math.sin(a),-.045))
        for j in range(17):
            px=rng.uniform(-.85,.85);py=rng.uniform(-.75,.75)
            z=h*(.40+.55*(1-abs(px)*.5))*rng.uniform(.67,1.0)
            points.append((px*sx,py*sy,z))
        bm=bmesh.new()
        for px,py,z in points:bm.verts.new((x+co*px-si*py,y+si*px+co*py,z))
        bm.verts.ensure_lookup_table()
        result=bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False)
        unused=[v for v in bm.verts if not v.link_faces]
        if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
        mesh=bpy.data.meshes.new(f'Natural rock outcrop {fi+1}.{ri+1}');bm.to_mesh(mesh);bm.free()
        o=bpy.data.objects.new(mesh.name,mesh);c.objects.link(o);o.parent=root
        mesh.materials.append(materials[(fi+ri)%3]);added.append(o)
bpy.context.view_layer.update()
city=bpy.data.collections['Buildings | editable groups']
bounds=[]
for g in [o for o in city.objects if o.type=='EMPTY']:
    pts=[o.matrix_world@Vector(v) for o in g.children if o.type=='MESH' for v in o.bound_box]
    bounds.append((g.name,min(v.x for v in pts),max(v.x for v in pts),min(v.y for v in pts),max(v.y for v in pts)))
for o in added:
    pts=[o.matrix_world@Vector(v) for v in o.bound_box]
    a,b=min(v.x for v in pts),max(v.x for v in pts);d,e=min(v.y for v in pts),max(v.y for v in pts)
    for name,x0,x1,y0,y1 in bounds:assert min(b,x1)<=max(a,x0) or min(e,y1)<=max(d,y0),(o.name,name)
for name,state in protected.items():
    o=bpy.data.objects[name];assert state==(tuple(tuple(v.co) for v in o.data.vertices),tuple(m.name for m in o.data.materials))
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'floor_before':old[0],'floor_after':color[0],'formations':len(formations),'rock_pieces':len(added),'perimeter_unchanged':True}))
