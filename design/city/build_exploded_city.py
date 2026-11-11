import bpy, bmesh, math, random, json
from mathutils import Vector, Matrix, Quaternion
from pathlib import Path

ROOT = Path('/Users/slayanne/Projects/roe-the-dev')
OUT_BLEND = ROOT / 'design/city/city-island-exploded.blend'
OUT_GLB = ROOT / 'public/assets/city/city-island-exploded.glb'
rng = random.Random(20261110)
CENTER = Vector((0.45, -2.8, 0))
source_scene = bpy.context.scene
assert 'Exploded' not in source_scene.name
source_island = bpy.data.collections['Industrial metal island']
depsgraph = bpy.context.evaluated_depsgraph_get()

bpy.ops.wm.save_as_mainfile(filepath='/private/tmp/city-before-exploded-rebuild.blend', copy=True)

# Capture evaluated source geometry in world space so every ruin retains its source design.
groups = []
for root in sorted([o for o in source_scene.objects if o.type == 'EMPTY' and o.name[:2].isdigit()], key=lambda o:o.name):
    parts = []
    for obj in root.children:
        if obj.type != 'MESH': continue
        mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph), depsgraph=depsgraph)
        mesh.transform(obj.matrix_world)
        coords = [v.co for v in mesh.vertices]
        lo = Vector(tuple(min(v[i] for v in coords) for i in range(3)))
        hi = Vector(tuple(max(v[i] for v in coords) for i in range(3)))
        size = hi-lo
        core = size.x > 1.25 and size.y > 1.0 and size.z > .8 and any('V6 Dark building' in m.name for m in mesh.materials if m)
        parts.append({'mesh':mesh, 'name':obj.name, 'core':core, 'lo':lo, 'hi':hi})
    lo = Vector(tuple(min(p['lo'][i] for p in parts) for i in range(3)))
    hi = Vector(tuple(max(p['hi'][i] for p in parts) for i in range(3)))
    groups.append({'name':root.name,'id':int(root.name[:2]),'parts':parts,'lo':lo,'hi':hi,'center':Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,0))})

scene = bpy.data.scenes.new('City Island Exploded')
bpy.context.window.scene = scene
scene.world = source_scene.world.copy() if source_scene.world else bpy.data.worlds.new('Ruin studio world')
scene.render.engine = source_scene.render.engine
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 1400
scene.render.resolution_y = 1050
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.view_settings.view_transform = source_scene.view_settings.view_transform
scene.view_settings.look = source_scene.view_settings.look
scene.view_settings.exposure = .7


def collection(name):
    col = bpy.data.collections.new(name)
    scene.collection.children.link(col)
    return col

island_col = collection('Exploded | island structure')
ruin_col = collection('Exploded | shattered original buildings')
fall_col = collection('Exploded | collapsed architectural sections')
impact_col = collection('Exploded | torn impact basin')
rubble_col = collection('Exploded | debris banks')
presentation_col = collection('Exploded | presentation')

copies = {}
for old in list(source_island.all_objects):
    obj = old.copy()
    if old.data: obj.data = old.data.copy()
    obj.name = 'Blast | ' + old.name
    island_col.objects.link(obj)
    obj.hide_render = False
    obj.hide_viewport = False
    obj.hide_set(False)
    copies[old.name] = obj
for old in list(source_island.all_objects):
    obj = copies[old.name]
    world = old.matrix_world.copy()
    obj.parent = copies.get(old.parent.name) if old.parent else None
    obj.matrix_world = world

for old in list(source_scene.objects):
    if old.type not in {'LIGHT','CAMERA'}: continue
    obj = old.copy(); obj.data = old.data.copy()
    presentation_col.objects.link(obj)
    if old.type == 'CAMERA':
        scene.camera = obj
        obj.name = 'Exploded city overview'
        obj.location = (38,-65,54)
        obj.rotation_euler = (Vector((0,0,.3))-obj.location).to_track_quat('-Z','Y').to_euler()
        if obj.data.type == 'ORTHO': obj.data.ortho_scale = 70
    else:
        obj.data.energy *= 1.6


def material(name, gray, metal=0, rough=.9):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (gray,gray,gray,1)
    shader.inputs['Metallic'].default_value = metal
    shader.inputs['Roughness'].default_value = rough
    mat.diffuse_color = (gray,gray,gray,1)
    return mat

char = material('Blast | charcoal fracture surfaces',.014,.2,.97)
exposed = material('Blast | exposed aggregate and cut steel',.063,.15,.92)
beam_mat = material('Blast | scorched structural steel',.028,.65,.8)
steel = [material('Blast | torn metal tone '+str(i),g,.55,.84) for i,g in enumerate((.025,.043,.065))]
stone = [material('Blast | masonry debris tone '+str(i),g,.05,.96) for i,g in enumerate((.021,.037,.056,.082))]
burnt = {}

def burnt_mat(mat):
    if mat in burnt:return burnt[mat]
    new = mat.copy();new.name = 'Blast weathered | '+mat.name
    if new.use_nodes:
        shader = next((n for n in new.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
        if shader:
            color = shader.inputs['Base Color'].default_value
            shader.inputs['Base Color'].default_value = tuple(c*.73 for c in color[:3])+(1,)
            shader.inputs['Roughness'].default_value = .92
    burnt[mat]=new
    return new


def object_from_mesh(name, verts, faces, mats, indices=None, col=ruin_col):
    mesh = bpy.data.meshes.new(name+' mesh')
    mesh.from_pydata(verts,[],faces)
    for mat in mats:mesh.materials.append(mat)
    if indices:
        for p,mi in zip(mesh.polygons,indices):p.material_index=mi
    mesh.update()
    obj=bpy.data.objects.new(name,mesh);col.objects.link(obj)
    return obj


def cut_part(part, planes, jagged=False, hollow=False):
    bm=bmesh.new();bm.from_mesh(part['mesh'])
    for point,normal in planes:
        if not bm.faces: break
        bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=point,plane_no=normal,dist=.00001,clear_outer=True,clear_inner=False)
    if not bm.faces:
        bm.free();return None
    if jagged:
        boundaries=[e for e in bm.edges if e.is_boundary and all(v.co.z>.25 for v in e.verts)]
        if boundaries:
            bmesh.ops.subdivide_edges(bm,edges=boundaries,cuts=3,use_grid_fill=False)
        for v in bm.verts:
            if v.is_boundary and v.co.z>.25:
                x,y,z=v.co
                delta=.22*math.sin(x*7.3+y*5.1)+.31*math.sin(x*3.7-y*6.4)-.15
                v.co.z=max(.15,z+delta)
    if hollow:
        bmesh.ops.solidify(bm,geom=list(bm.faces),thickness=.13)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    mesh=bpy.data.meshes.new('Fractured '+part['name']);bm.to_mesh(mesh);bm.free()
    for mat in part['mesh'].materials:mesh.materials.append(burnt_mat(mat) if mat else char)
    mesh.update()
    return mesh


def add_part(name, mesh, col):
    if not mesh:return None
    obj=bpy.data.objects.new(name,mesh);col.objects.link(obj)
    return obj


def prism(name, poly, z, thickness, mat, col):
    n=len(poly)
    verts=[(x,y,z) for x,y in poly]+[(x,y,z-thickness) for x,y in poly]
    faces=[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return object_from_mesh(name,verts,faces,[mat],col=col)


def bar(name,a,b,width,depth,mat,col):
    a,b=Vector(a),Vector(b);d=b-a
    if d.length<.01:return None
    q=Vector((0,0,1)).rotation_difference(d.normalized())
    verts=[tuple(q@Vector((x*width/2,y*depth/2,z*d.length/2))+(a+b)/2) for z in (-1,1) for y in (-1,1) for x in (-1,1)]
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]
    return object_from_mesh(name,verts,faces,[mat],col=col)

# Replace full towers with their fractured lower shells; retain actual fluting and façade relief.
ruin_heights={}
for g in groups:
    c=g['center'];vec=c-CENTER;dist=vec.length
    u=vec.normalized() if dist>.1 else Vector((0,1,0))
    total=g['hi'].z
    if dist<7.4:
        ruin_heights[g['id']]=0;continue
    fraction=rng.uniform(.18,.38)
    h=min(5.1,max(.65,total*fraction))
    if g['id'] in (13,14,23,25,32):h=min(6.8,total*.39)
    if dist<11:h*=.55
    slope=rng.uniform(.28,.65)
    normal=Vector((-u.x*slope,-u.y*slope,1))
    planes=[(Vector((c.x,c.y,h)),normal)]
    # Remove the blast-facing wall on selected structures, exposing their floors and frames.
    opened=g['id']%3==0
    if opened:
        width=min(g['hi'].x-g['lo'].x,g['hi'].y-g['lo'].y)
        planes.append((c-u*width*.23,-u))
    ruin_heights[g['id']]=h
    for part in g['parts']:
        if part['lo'].z>h+3:continue
        mesh=cut_part(part,planes,jagged=True,hollow=part['core'])
        add_part(f"{g['id']:02d} ruined base | {part['name']}",mesh,ruin_col)
    # Partially collapsed floors break up the hollow interior.
    x0,y0=g['lo'].x+.22,g['lo'].y+.22
    x1,y1=g['hi'].x-.22,g['hi'].y-.22
    level=.14
    while level<h-.25:
        if level>.2 and rng.random()<.22:level+=1.15;continue
        notch=rng.uniform(.28,.72)
        poly=[(x0,y0),(x1,y0),(x1,y1),(x0+(x1-x0)*notch,y1),(x0+(x1-x0)*notch*.7,y0+(y1-y0)*.57),(x0,y0+(y1-y0)*.71)]
        prism(f"{g['id']:02d} exposed fractured floor {level:.1f}",poly,level,.14,exposed,ruin_col)
        level+=1.15
    if h>2:
        for k,(x,y) in enumerate(((x0,y1),(x1,y1),(x1,y0))):
            top=h+rng.uniform(-.4,.8)
            bar(f"{g['id']:02d} exposed bent column {k}",(x,y,.12),(x+u.x*.2,y+u.y*.2,top),.12,.16,beam_mat,ruin_col)
            if k<2:
                bar(f"{g['id']:02d} bent reinforcement {k}",(x,y,top-.3),(x+u.x*.35,y+u.y*.35,top+.45),.035,.035,beam_mat,ruin_col)

# Real source architectural slices, toppled away from the epicenter.
def fallen_section(g,z0,z1,target,angle,partial=True,scale=1):
    c=g['center'];direction=Vector((target[0]-CENTER.x,target[1]-CENTER.y,0)).normalized()
    axis=Vector((-direction.y,direction.x,0))
    rot=Matrix.Rotation(angle,4,axis) @ Matrix.Rotation(rng.uniform(-.28,.28),4,'Z')
    parts=[]
    planes=[(Vector((0,0,z1)),Vector((0,0,1))),(Vector((0,0,z0)),Vector((0,0,-1)))]
    if partial:
        planes.append((Vector((c.x+rng.uniform(-.4,.7),c.y,0)),Vector((1,0,0))))
    for part in g['parts']:
        if part['hi'].z<z0 or part['lo'].z>z1:continue
        mesh=cut_part(part,planes,jagged=True,hollow=part['core'])
        if not mesh:continue
        origin=Vector((c.x,c.y,(z0+z1)/2))
        for v in mesh.vertices:v.co=rot@(v.co-origin)*scale+Vector((target[0],target[1],0))
        parts.append((part,mesh))
    if not parts:return
    floor=min(v.co.z for p,m in parts for v in m.vertices)
    for part,mesh in parts:
        for v in mesh.vertices:v.co.z-=floor-.04
        mesh.update()
        add_part(f"{g['id']:02d} fallen architectural section | {part['name']}",mesh,fall_col)

for g in groups:
    if g['id']==9:continue
    c=g['center'];u=(c-CENTER).normalized();d=(c-CENTER).length
    if d<8.6:continue
    z0=max(ruin_heights.get(g['id'],0)+.6,g['hi'].z*.42)
    z1=min(g['hi'].z,z0+rng.uniform(2.0,4.0))
    if z1-z0<.8:continue
    tang=Vector((-u.y,u.x,0))
    target=c+u*rng.uniform(.9,2.2)+tang*rng.uniform(-1.2,1.2)
    fallen_section(g,z0,z1,target,rng.uniform(1.0,1.65),True,.85)
landmark=next(g for g in groups if g['id']==9)
fallen_section(landmark,9,15,(10,-11),1.52,True)
fallen_section(landmark,18.2,25.5,(17,-9),1.63,False,.85)
fallen_section(landmark,.2,3.8,(-8.5,-8),1.28,False,.85)

# Several larger roof and wall remnants lodge at the island edge.
edge_sections=[(14,(-22,-7)),(23,(8,18)),(25,(23,5)),(22,(-15,15)),(18,(22,-10)),(32,(-7,19))]
for ident,target in edge_sections:
    g=next(g for g in groups if g['id']==ident)
    fallen_section(g,g['hi'].z*.68,g['hi'].z,target,rng.uniform(1.35,1.8),True,.8)

print('Created source-derived ruins and collapsed facade sections',len(ruin_col.objects),len(fall_col.objects))
