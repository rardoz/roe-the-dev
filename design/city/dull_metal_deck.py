import bpy,json,math,random
import numpy as np
from pathlib import Path
from mathutils import Vector
folder=Path('/Users/slayanne/Projects/roe-the-dev/design/city')
backup=folder/'city-before-continuous-metal-deck.blend'
assert not backup.exists()
collection=bpy.data.collections['Industrial metal island']
root=next(o for o in collection.objects if o.type=='EMPTY')
city=bpy.data.collections['Buildings | editable groups']
city_state={o.name:[list(row) for row in o.matrix_world] for o in city.all_objects}
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before dull metal palette and continuous deck')
texture_dir=folder/'textures';texture_dir.mkdir(exist_ok=True)
size=512
rng=np.random.default_rng(229)
def noise(grid):
    data=rng.random((grid,grid))
    q=np.arange(size)*grid/size
    i=np.floor(q).astype(int);f=q-i;f=f*f*(3-2*f)
    a=data[i[:,None]%grid,i[None,:]%grid]
    b=data[i[:,None]%grid,(i[None,:]+1)%grid]
    c=data[(i[:,None]+1)%grid,i[None,:]%grid]
    d=data[(i[:,None]+1)%grid,(i[None,:]+1)%grid]
    return (a*(1-f)[None,:]+b*f[None,:])*(1-f)[:,None]+(c*(1-f)[None,:]+d*f[None,:])*f[:,None]
coarse=noise(8);medium=noise(38);fine=noise(128)
height=.55*medium+.25*fine+.20*coarse
gx=(np.roll(height,-1,axis=1)-np.roll(height,1,axis=1))*.45
gy=(np.roll(height,-1,axis=0)-np.roll(height,1,axis=0))*.45
normal=np.stack((-gx,-gy,np.ones_like(gx)),axis=-1)
normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
normal=normal*.5+.5
rough=np.clip(.73+coarse*.10+(medium-.5)*.10+(fine-.5)*.05,.65,.91)

def image(name,channels):
    pixels=np.ones((size,size,4),dtype=np.float32)
    pixels[:,:,:3]=channels
    img=bpy.data.images.new(name,width=size,height=size,alpha=False)
    img.colorspace_settings.name='Non-Color'
    img.pixels.foreach_set(pixels.ravel())
    img.filepath_raw=str(texture_dir/(name+'.png'));img.file_format='PNG';img.save();img.pack()
    return img
normal_image=image('island_steel_normal',normal)
orm_image=image('island_steel_roughness_metallic',np.stack((np.ones_like(rough),rough,np.full_like(rough,.68)),axis=-1))
materials=[]
for i,shade in enumerate((.018,.028,.042)):
    mat=bpy.data.materials.new(f'Island dark worn steel {i+1}')
    mat.diffuse_color=(shade,shade,shade,1);mat.use_nodes=True
    nodes=mat.node_tree.nodes;links=mat.node_tree.links
    principled=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    principled.inputs['Base Color'].default_value=(shade,shade,shade,1)
    tex=nodes.new('ShaderNodeTexImage');tex.image=orm_image
    split=nodes.new('ShaderNodeSeparateColor');links.new(tex.outputs['Color'],split.inputs['Color'])
    links.new(split.outputs['Green'],principled.inputs['Roughness'])
    links.new(split.outputs['Blue'],principled.inputs['Metallic'])
    normaltex=nodes.new('ShaderNodeTexImage');normaltex.image=normal_image
    normalnode=nodes.new('ShaderNodeNormalMap');normalnode.inputs['Strength'].default_value=.65
    links.new(normaltex.outputs['Color'],normalnode.inputs['Color']);links.new(normalnode.outputs['Normal'],principled.inputs['Normal'])
    materials.append(mat)

def planar_uv(obj):
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Steel grain UV')
    for poly in obj.data.polygons:
        axis=max(range(3),key=lambda i:abs(poly.normal[i]))
        axes=(0,1) if axis==2 else ((0,2) if axis==1 else (1,2))
        for li in poly.loop_indices:
            v=obj.data.vertices[obj.data.loops[li].vertex_index].co
            uv.data[li].uv=(v[axes[0]]/7,v[axes[1]]/7)

slabs=sorted([o for o in collection.objects if o.name.startswith('Island projecting metal slab')],key=lambda o:o.name)
for i,obj in enumerate(slabs):
    obj.data.materials.clear();obj.data.materials.append(materials[(i*7+i//4)%3])
    planar_uv(obj)
    bevel=obj.modifiers.new('Subtle steel edge highlights','BEVEL');bevel.width=.035;bevel.segments=2
    bevel.affect='EDGES'
for obj in list(collection.objects):
    if 'deck plate' in obj.name:bpy.data.objects.remove(obj,do_unlink=True)
core=bpy.data.objects['Island irregular stepped structural core']
for v in core.data.vertices:
    if v.co.z>-.3:v.co.z=0
core.data.update();core.data.materials.clear();core.data.materials.append(materials[1]);planar_uv(core)
core.name='Island continuous worn steel deck and simple core'
# Sparse irregular construction joints, never a repeating tile grid.
paths=[ [(-25,-11),(-21,-11),(-17,-14),(-14,-14),(-12,-18),(-6,-18)], [(-3,-21),(-1,-18),(5,-18),(9,-16),(13,-16)], [(17,-13),(21,-12),(21,-7),(26,-4)], [(-26,-2),(-22,1),(-22,7),(-19,10)], [(16,14),(12,12),(8,13),(6,19)], [(-6,20),(-7,16),(-13,15)] ]
verts=[];faces=[]
for path in paths:
    for a,b in zip(path,path[1:]):
        delta=Vector((b[0]-a[0],b[1]-a[1]));side=Vector((-delta.y,delta.x)).normalized()*.018
        start=len(verts)
        verts.extend([(a[0]+side.x,a[1]+side.y,.003),(a[0]-side.x,a[1]-side.y,.003),(b[0]-side.x,b[1]-side.y,.003),(b[0]+side.x,b[1]+side.y,.003)])
        faces.append(tuple(range(start,start+4)))
mesh=bpy.data.meshes.new('Sparse irregular deck joints');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('Island sparse irregular construction joints',mesh);collection.objects.link(obj);obj.parent=root
joint=bpy.data.materials.new('Island dark seam');joint.use_nodes=True
p=next(n for n in joint.node_tree.nodes if n.type=='BSDF_PRINCIPLED');p.inputs['Base Color'].default_value=(.008,.008,.008,1);p.inputs['Roughness'].default_value=.95
mesh.materials.append(joint)
# Match bolt hardware to the dark steel palette.
bolts=bpy.data.objects['Island reference perimeter bolts'];bolts.data.materials.clear();bolts.data.materials.append(materials[2]);planar_uv(bolts)
bpy.context.view_layer.update()
for name,matrix in city_state.items():assert [list(row) for row in bpy.data.objects[name].matrix_world]==matrix
assert len({o.data.materials[0].name for o in slabs})==3
assert not any('deck plate' in o.name for o in collection.objects)
root['Design']='Three dark steel slab colors with packed roughness and normal textures; continuous steel deck with sparse irregular joints, no tile grid.'
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'city-industrial-island.blend'))
print(json.dumps({'slabs':len(slabs),'slab_materials':[m.name for m in materials],'texture_size':size,'deck':'continuous','city_unchanged':True}))
