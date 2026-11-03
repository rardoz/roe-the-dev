import bpy
import math
import random
import json
from pathlib import Path
from mathutils import Vector

project = Path('/Users/slayanne/Projects/roe-the-dev')
output = project / 'design/city'
assert not bpy.data.collections.get('Industrial metal island'), 'Island already exists'
backup = output / 'city-before-industrial-island.blend'
assert not backup.exists()
bpy.ops.wm.save_as_mainfile(filepath=str(backup), copy=True)
bpy.ops.ed.undo_push(message='Before industrial island')
city = bpy.data.collections['Buildings | editable groups']
city_state = {o.name: [list(row) for row in o.matrix_world] for o in city.all_objects}
collection = bpy.data.collections.new('Industrial metal island')
bpy.context.scene.collection.children.link(collection)
root = bpy.data.objects.new('Industrial island | deck at city ground level', None)
collection.objects.link(root)
rng = random.Random(428)

def material(name, shade, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (shade, shade, shade, 1)
    mat.use_nodes = True
    node = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    node.inputs['Base Color'].default_value = (shade, shade, shade, 1)
    node.inputs['Metallic'].default_value = metallic
    node.inputs['Roughness'].default_value = roughness
    return mat

plates = [material(f'Island dull steel | shade {i+1}', s, .60, .78) for i, s in enumerate((.035,.047,.060,.075,.092))]
armor = [material(f'Island edge armor | shade {i+1}', s, .65, .74) for i, s in enumerate((.025,.039,.052))]
bolt_mat = material('Island graphite steel bolts', .085, .72, .69)
rock_mat = material('Barren angular stone | dark gray', .045, .08, .97)

outline = [(-26,-9),(-23,-16),(-15,-20),(-6,-22),(8,-21),(16,-18),(24,-13),(27,-3),(26,9),(21,15),(12,19),(4,22),(-7,21),(-16,16),(-24,11),(-27,1)]

def mesh_object(name, vertices, faces, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.parent = root
    mesh.materials.append(mat)
    return obj

def prism(name, polygon, bottom, top, mat):
    count = len(polygon)
    vertices = [(x,y,bottom) for x,y in polygon] + [(x,y,top) for x,y in polygon]
    faces = [tuple(reversed(range(count))), tuple(range(count,2*count))]
    faces += [(i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count)]
    return mesh_object(name, vertices, faces, mat)

prism('Island sealed plain underside and structural core', outline, -2.5, -.18, armor[0])

def clip_polygon(polygon, axis, bound, greater):
    result = []
    if not polygon:
        return result
    for start, end in zip(polygon, polygon[1:]+polygon[:1]):
        a = start[axis]-bound
        b = end[axis]-bound
        inside_a = a >= -1e-8 if greater else a <= 1e-8
        inside_b = b >= -1e-8 if greater else b <= 1e-8
        if inside_a:
            result.append(start)
        if inside_a != inside_b:
            t = a/(a-b)
            result.append((start[0]+t*(end[0]-start[0]),start[1]+t*(end[1]-start[1])))
    return result

def area(poly):
    return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1])))/2

plate_count = 0
rows = [-23,-16.4,-9.1,-1.2,6.1,13.7,23]
for row, (y0,y1) in enumerate(zip(rows,rows[1:])):
    x0 = -29
    while x0 < 28:
        x1 = min(29, x0+rng.uniform(6.4,10.8))
        poly = outline[:]
        for axis, bound, greater in ((0,x0+.035,True),(0,x1-.035,False),(1,y0+.035,True),(1,y1-.035,False)):
            poly = clip_polygon(poly,axis,bound,greater)
        if len(poly)>=3 and area(poly)>2.0:
            plate_count += 1
            prism(f'Island deck plate {plate_count:02d}',poly,-.23,0,plates[(plate_count+row*2)%len(plates)])
        x0 = x1

bolt_vertices = []
bolt_faces = []

def bolt(center, axis, radius=.13, depth=.10, sides=6):
    center=Vector(center);axis=Vector(axis).normalized()
    basis=Vector((0,0,1)) if abs(axis.z)<.9 else Vector((1,0,0))
    u=axis.cross(basis).normalized();v=axis.cross(u)
    start=len(bolt_vertices)
    for height in (-depth/2,depth/2):
        for i in range(sides):
            angle=2*math.pi*i/sides
            point=center+axis*height+radius*(u*math.cos(angle)+v*math.sin(angle))
            bolt_vertices.append(tuple(point))
    bolt_faces.extend([tuple(start+i for i in reversed(range(sides))),tuple(start+sides+i for i in range(sides))])
    for i in range(sides):
        j=(i+1)%sides
        bolt_faces.append((start+i,start+j,start+sides+j,start+sides+i))

armor_count=0
for a,b in zip(outline,outline[1:]+outline[:1]):
    a=Vector(a);b=Vector(b);edge=b-a
    length=edge.length;tangent=edge.normalized();normal=Vector((tangent.y,-tangent.x))
    sections=max(1,round(length/5.5))
    for j in range(sections):
        p=a+edge*(j/sections)+tangent*.045
        q=a+edge*((j+1)/sections)-tangent*.045
        polygon=[tuple(p-normal*.035),tuple(q-normal*.035),tuple(q+normal*.17),tuple(p+normal*.17)]
        polygon.reverse()
        armor_count+=1
        prism(f'Island edge armor panel {armor_count:02d}',polygon,-2.47,-.07,armor[armor_count%3])
        for position in (p+tangent*.32,q-tangent*.32):
            surface=position+normal*.23
            for z in (-.42,-1.20,-1.98):
                bolt((surface.x,surface.y,z),(normal.x,normal.y,0))
            top=position-normal*.48
            bolt((top.x,top.y,.055),(0,0,1),.12,.10)
mesh_object('Island perimeter hex bolts | vertical rows and deck anchors',bolt_vertices,bolt_faces,bolt_mat)

rock_spots=[(-22.6,4.8,1.05,.78,.85),(-23.2,6.0,.65,.55,.45),(-21.8,5.7,.62,.56,.52),(16.2,15.6,1.05,.78,.75),(17.5,14.8,.62,.65,.42),(-8.4,-19.5,1.15,.64,.58),(-9.7,-19.0,.65,.5,.40)]
for i,(x,y,sx,sy,h) in enumerate(rock_spots):
    count=7
    verts=[]
    for j in range(count):
        angle=j*2*math.pi/count
        r=rng.uniform(.8,1.1)
        verts.append((x+math.cos(angle)*sx*r,y+math.sin(angle)*sy*r,-.025))
    for j in range(count):
        angle=j*2*math.pi/count
        verts.append((x+.12+math.cos(angle)*sx*.53,y-.10+math.sin(angle)*sy*.53,h*rng.uniform(.55,.90)))
    verts.append((x-.12,y+.08,h))
    faces=[tuple(reversed(range(count)))]
    for j in range(count):
        k=(j+1)%count
        faces.extend([(j,k,count+k),(j,count+k,count+j),(count+j,count+k,2*count)])
    mesh_object(f'Barren rock remnant {i+1:02d}',verts,faces,rock_mat)

bpy.context.view_layer.update()
for name,matrix in city_state.items():
    assert [list(row) for row in bpy.data.objects[name].matrix_world]==matrix,name
# Every building footprint must remain inside the island outline.
for obj in city.all_objects:
    if obj.type!='MESH':continue
    for corner in obj.bound_box:
        point=obj.matrix_world@Vector(corner)
        for a,b in zip(outline,outline[1:]+outline[:1]):
            cross=(b[0]-a[0])*(point.y-a[1])-(b[1]-a[1])*(point.x-a[0])
            assert cross>=-.001,('City outside island',obj.name)
root['Design']='Irregular shallow armored steel island; large varied deck plates; vertical bolt rows; sparse barren rocks; flat unornamented underside.'
root['Deck height']=0.0
root['Suggested ocean height']=-1.9
bpy.context.scene['Island export']='Export Buildings | editable groups and Industrial metal island together, excluding presentation lights and camera.'
new_master=output/'city-industrial-island.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(new_master))
print(json.dumps({'saved':str(new_master),'deck_plates':plate_count,'armor_panels':armor_count,'bolts':len(bolt_vertices)//12,'rocks':len(rock_spots),'city_unchanged':True,'dimensions':[54,44,2.5]}))
