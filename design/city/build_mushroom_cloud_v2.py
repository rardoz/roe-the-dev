import bpy
import bmesh
import math
import random
from mathutils import Vector

DIRECTORY = '/Users/slayanne/Projects/roe-the-dev/design/city'
source = bpy.data.scenes['City Island Exploded']
cloud_scene = bpy.data.scenes.new('Mushroom v2 | sculpture')
collection = bpy.data.collections.new('Mushroom v2 | editable cloud')
cloud_scene.collection.children.link(collection)
root = bpy.data.objects.new('Cloud v2 | ground origin', None)
collection.objects.link(root)
groups = {}
for name in ('Canopy', 'Updraft', 'Ground clouds'):
    group = bpy.data.objects.new('Cloud v2 | ' + name, None)
    collection.objects.link(group)
    group.parent = root
    groups[name] = group

def material(name, emission):
    mat = bpy.data.materials.new('Cloud v2 | ' + name)
    mat.use_nodes = True
    p = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Roughness'].default_value = .64
    p.inputs['Metallic'].default_value = .08
    p.inputs['Specular IOR Level'].default_value = .22
    p.inputs['Emission Color'].default_value = (.3, .3, .3, 1)
    p.inputs['Emission Strength'].default_value = emission
    v = mat.node_tree.nodes.new('ShaderNodeVertexColor')
    v.layer_name = 'Cloud tones'
    mat.node_tree.links.new(v.outputs['Color'], p.inputs['Base Color'])
    mat.diffuse_color = (.42, .42, .42, 1)
    return mat

cloud_material = material('Silver cloud', .025)
column_material = material('Pearl updraft', .35)
base_material = material('Ground vapor', .09)

def make_mesh(name, vertices, faces, values, group, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    colors = mesh.color_attributes.new(name='Cloud tones', type='FLOAT_COLOR', domain='CORNER')
    for loop in mesh.loops:
        value = values[loop.vertex_index]
        colors.data[loop.index].color = (value, value, value, 1)
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=.0001)
    bmesh.ops.dissolve_degenerate(bm, edges=list(bm.edges), dist=.00001)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    if bm.calc_volume(signed=True) < 0:
        bmesh.ops.reverse_faces(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    for p in mesh.polygons:
        p.use_smooth = True
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.parent = groups[group]
    return obj

def loft_billow(name, angle, root_radius, reach, bottom, top, width, depth, tone):
    vertices, faces, colors = [], [], []
    rings, sides = 48, 64
    radial = Vector((math.cos(angle), math.sin(angle), 0))
    tangent = Vector((-math.sin(angle), math.cos(angle), 0))
    for j in range(rings + 1):
        t = j / rings
        swell = math.sin(math.pi * t) ** .5
        taper = .27 + .73 * min(1, t / .42) ** .65
        center_r = root_radius + (reach - root_radius) * math.sin(math.pi * t / 2) ** .82
        center = radial * center_r + Vector((0, 0, bottom + (top - bottom) * t))
        for i in range(sides):
            q = math.tau * i / sides
            v = center + radial * (depth * swell * taper * math.cos(q)) + tangent * (width * swell * taper * math.sin(q))
            vertices.append(tuple(v))
            ray = (.74, 1.00, 1.24, .92)[(i // 3) % 4]
            shade = (.075 + .54 * (1 - min(1, t * 1.4)) ** 2) * ray
            threshold = .79 - .25 * abs(math.sin(q)) ** 1.7
            rim = max(0, min(1, (t - threshold) / .055))
            value = (1-rim)*shade + rim*(.40+.12*t)
            if math.cos(q) < -.25:
                value = max(value, .32 + .12*t)
            colors.append(value * tone)
    for j in range(rings):
        for i in range(sides):
            a = j*sides+i
            b = j*sides+(i+1)%sides
            faces.append((a, b, b+sides, a+sides))
    return make_mesh(name, vertices, faces, colors, 'Canopy', cloud_material)

def puff(name, center, scales, tone, group, rotation=0, floor=False, segments=48, rings=28):
    vertices, faces, colors = [], [], []
    for j in range(rings+1):
        phi = math.pi*j/rings
        for i in range(segments):
            q = math.tau*i/segments
            x = scales[0]*math.sin(phi)*math.cos(q)
            y = scales[1]*math.sin(phi)*math.sin(q)
            z = center[2]+scales[2]*math.cos(phi)
            if floor:
                z = max(.01,z)
            vertices.append((center[0]+x*math.cos(rotation)-y*math.sin(rotation),
                             center[1]+x*math.sin(rotation)+y*math.cos(rotation),z))
            value = tone*(.52+.48*(math.cos(phi)*.5+.5))
            colors.append(value)
    for j in range(rings):
        for i in range(segments):
            a = j*segments+i
            b = j*segments+(i+1)%segments
            faces.append((a, a+segments, b+segments, b))
    return make_mesh(name, vertices, faces, colors, group, base_material if floor else cloud_material)

lobes = [(-90, 8.0, 27.1, 5.6, 4.4), (-137,9.1,24.4,4.6,4.25),
         (-44,9.1,24.9,4.5,4.3), (-181,9.0,23.2,4.1,4.0), (2,9.1,23.7,4.3,4.1),
         (47,8.3,25.1,4.7,4.25), (96,7.8,26.2,4.8,4.2), (143,8.4,24.7,4.5,4.1)]
for i,(a,r,h,w,d) in enumerate(lobes):
    loft_billow('Canopy v2 | rising billow %02d'%(i+1), math.radians(a), 1.25, r, 12.3, h, w, d, .96+.045*math.sin(i*1.8))

crowns = [(0,1.5,26.8,4.2,3.9,3.4), (-4.2,1.0,25.8,3.6,3.6,3.2),
          (4.0,1.8,25.9,3.4,3.7,3.1),(-6.6,3.4,24.5,3.0,3.6,2.8),
          (6.2,3.7,24.4,3.3,3.4,2.8),(0,5.8,25.0,4.0,3.6,3.0)]
for i,(x,y,z,sx,sy,sz) in enumerate(crowns):
    puff('Canopy v2 | layered crown %02d'%(i+1),(x,y,z),(sx,sy,sz),.48+.035*math.sin(i),'Canopy')

vertices, faces, colors = [], [], []
profile = [(0,2.8),(1,2.55),(3,2.20),(6,2.0),(9,2.05),(11,2.25),(12.5,2.65),(13.6,3.25),(14.3,4.1)]
sides=160
for j,(z,r) in enumerate(profile):
    for i in range(sides):
        a=math.tau*i/sides
        channel=.5+.5*math.cos(a*10)
        radius=r+.21*math.cos(a*10)
        vertices.append((radius*math.cos(a),radius*math.sin(a),z))
        colors.append((.33+.29*channel)*(1-.20*z/15))
for j in range(len(profile)-1):
    for i in range(sides):
        a=j*sides+i;b=j*sides+(i+1)%sides
        faces.append((a,b,b+sides,a+sides))
faces.extend([tuple(reversed(range(sides))),tuple((len(profile)-1)*sides+i for i in range(sides))])
make_mesh('Updraft v2 | continuous rising flutes',vertices,faces,colors,'Updraft',column_material)

rng=random.Random(821)
ground=[(-5.5,-5.4,.65,4.1,3.2,2.8), (4.5,-6.2,.45,4.4,3.0,2.9),
        (-1.1,-3.2,.65,3.2,3.5,3.3), (3.7,-1,.8,3.1,3.2,3.2),
        (-4.3,.7,.55,3.7,3.6,2.9), (0,4.3,.6,3.7,3.3,2.9),
        (5.8,3.5,.4,3.8,3.1,2.5),(-6.5,4.1,.25,3.4,3.0,2.2),
        (-9.1,-2.1,.25,3.1,2.9,2.0), (8.5,-2.4,.1,3.3,2.7,2.1),
        (-1.6,-8,.2,3.1,2.4,2.0),(1.9,7.5,.15,3.2,2.5,2.0)]
for i,(x,y,z,sx,sy,sz) in enumerate(ground):
    puff('Base v2 | rolling cloud bank %02d'%(i+1),(x,y,z),(sx,sy,sz),rng.uniform(.36,.56),'Ground clouds',rng.uniform(-.5,.5),True)
for i in range(17):
    a=math.tau*i/17+rng.uniform(-.13,.13)
    r=rng.uniform(8.3,10.7)
    puff('Base v2 | smaller outward billow %02d'%(i+1),
         (r*math.cos(a),r*.84*math.sin(a),rng.uniform(.05,.24)),
         (rng.uniform(1.5,2.9),rng.uniform(1.1,2.1),rng.uniform(.75,1.6)),
         rng.uniform(.3,.48),'Ground clouds',a,True,segments=36,rings=20)

world=bpy.data.worlds.new('Mushroom v2 | night')
world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs['Color'].default_value=(.012,.012,.012,1)
bg.inputs['Strength'].default_value=.35

def setup_scene(scene, location, target, lens, resolution):
    scene.world=world
    scene.render.engine=source.render.engine
    scene.cycles.samples=32
    scene.cycles.use_denoising=True
    scene.render.resolution_x,scene.render.resolution_y=resolution
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format=source.render.image_settings.file_format
    scene.view_settings.view_transform=source.view_settings.view_transform
    scene.view_settings.look=source.view_settings.look
    camera=bpy.data.objects.new(scene.name+' | camera',source.camera.data.copy())
    scene.collection.objects.link(camera)
    camera.data.type='PERSP'
    camera.data.lens=lens
    camera.location=location
    camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.camera=camera
    for label,position,energy,size in [('Key',(-18,-15,38),7500,18),('Rear rim',(14,12,33),14000,13),('Fill',(24,-25,20),2200,17)]:
        data=bpy.data.lights.new(scene.name+' | '+label,'AREA')
        data.energy=energy;data.size=size
        light=bpy.data.objects.new(data.name,data)
        scene.collection.objects.link(light)
        light.location=position
        light.rotation_euler=(Vector((0,0,15))-light.location).to_track_quat('-Z','Y').to_euler()
    for z,r,power,label in [(4.5,3.4,1050,'Base glow'),(13.8,4.8,900,'Core glow')]:
        for i in range(3):
            a=math.tau*i/3+.25
            data=bpy.data.lights.new(scene.name+' | '+label+' '+str(i),'POINT')
            data.energy=power;data.shadow_soft_size=1.8
            light=bpy.data.objects.new(data.name,data)
            scene.collection.objects.link(light)
            light.location=(r*math.cos(a),r*math.sin(a),z)

setup_scene(cloud_scene,(0,-66,24),(0,0,15),52,(1200,1200))
preview=bpy.data.scenes.new('Mushroom v2 | city context')
for c in source.collection.children:
    if 'presentation' not in c.name:
        preview.collection.children.link(c)
instance=bpy.data.objects.new('Cloud v2 | crater placement',None)
instance.instance_type='COLLECTION'
instance.instance_collection=collection
instance.location=(.45,-2.8,0)
preview.collection.objects.link(instance)
setup_scene(preview,(3,-84,29),(0,-1,12),43,(1440,1100))
for obj in preview.objects:
    if obj.type=='LIGHT' and obj.data.type=='POINT':
        obj.location+=Vector((.45,-2.8,0))
preview.render.filepath=DIRECTORY+'/mushroom-cloud-v2-city-preview.png'
cloud_scene.render.filepath=DIRECTORY+'/mushroom-cloud-v2-asset-preview.png'
bpy.context.window.scene=preview
bpy.app.driver_namespace['cloud_v2']=globals().copy()

def render_cloud_v2():
    bpy.ops.render.render(write_still=True)
    return None
bpy.app.timers.register(render_cloud_v2,first_interval=.4)
print('Built cloud v2: layered volumetric billows, continuous flutes and irregular ground clouds.')
