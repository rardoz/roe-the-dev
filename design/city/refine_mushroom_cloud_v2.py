import bpy
import math
import numpy as np
import struct
import zlib
from pathlib import Path
from mathutils import Vector

ns=bpy.app.driver_namespace['cloud_v2']
size=1024
u=(np.arange(size)+.5)/size
t=(np.arange(size)+.5)/size
xx,tt=np.meshgrid(2*u-1,t)
angle=np.arctan2(xx*.45,tt+.035)
bands=np.floor((angle+math.pi)/.073).astype(int)%5
factors=np.array([.60,.86,1.25,1.63,1.02])[bands]
shade=(.10+.63*(1-tt)**1.7)*factors
arch=.57+.30*np.sqrt(np.maximum(0,1-(xx/.86)**2))
rim=np.clip((tt-arch+.006)/.012,0,1)
rim=np.maximum(rim,np.clip((np.abs(xx)-.84)/.035,0,1))
tone=np.clip(shade*(1-rim)+(.42+.13*tt)*rim,.045,.8)
srgb=np.where(tone<=.0031308,tone*12.92,1.055*tone**(1/2.4)-.055)
rgb=np.repeat(np.uint8(np.clip(srgb,0,1)*255)[...,None],3,axis=2)
texture_path=Path(ns['DIRECTORY'])/'textures'/'mushroom-v2-fan-silver.png'
texture_path.parent.mkdir(exist_ok=True)
def chunk(tag,data):
    return struct.pack('!I',len(data))+tag+data+struct.pack('!I',zlib.crc32(tag+data)&0xffffffff)
pixels=b''.join(b'\0'+row.tobytes() for row in rgb[::-1])
texture_path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(pixels,8))+chunk(b'IEND',b''))
image=bpy.data.images.load(str(texture_path),check_existing=False)
image.pack()
fan_material=ns['cloud_material'].copy()
fan_material.name='Cloud v2 | broad radial silver bands'
p=next(n for n in fan_material.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
for link in list(p.inputs['Base Color'].links):
    fan_material.node_tree.links.remove(link)
texture=fan_material.node_tree.nodes.new('ShaderNodeTexImage')
texture.image=image
fan_material.node_tree.links.new(texture.outputs['Color'],p.inputs['Base Color'])
p.inputs['Emission Strength'].default_value=.10

for obj in ns['collection'].objects:
    if obj.type!='MESH':
        continue
    if obj.name.startswith('Canopy v2 | rising billow'):
        k=int(obj.name.rsplit(' ',1)[-1])-1
        a,r,h,w,d=ns['lobes'][k]
        tangent=Vector((-math.sin(math.radians(a)),math.cos(math.radians(a)),0))
        uv=obj.data.uv_layers.new(name='Fan projection')
        for loop in obj.data.loops:
            position=obj.data.vertices[loop.vertex_index].co
            x=position.dot(tangent)/1.32
            z=(position.z-12.3)/.86+12.3
            uv.data[loop.index].uv=(x/(2*w)+.5,(z-12.3)/(h-12.3))
        obj.data.materials.clear()
        obj.data.materials.append(fan_material)
    if obj.parent==ns['groups']['Canopy']:
        for v in obj.data.vertices:
            v.co.z+=1.5
    if obj.name=='Updraft v2 | continuous rising flutes':
        for v in obj.data.vertices:
            p=v.co
            a=math.atan2(p.y,p.x)
            radius=math.hypot(p.x,p.y)-.21*math.cos(a*10)
            radius+=.17*math.cos(a*18)
            p.x=radius*math.cos(a)
            p.y=radius*math.sin(a)
            p.z*=15.8/14.3
    obj.data.update()

ns['preview'].camera.location=(3,-139,47)
ns['preview'].camera.rotation_euler=(Vector((0,-1,13))-ns['preview'].camera.location).to_track_quat('-Z','Y').to_euler()
ns['preview'].render.resolution_x=1692
ns['preview'].render.resolution_y=930
ns['fan_material']=fan_material
bpy.context.window.scene=ns['preview']
def render_v2():
    bpy.ops.render.render(write_still=True)
    return None
bpy.app.timers.register(render_v2,first_interval=.4)
print('Refined projected radial bands, higher plume, and reference framing')
