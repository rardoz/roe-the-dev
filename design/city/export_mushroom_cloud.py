import bpy
import bmesh
import json
from mathutils import Vector

DIRECTORY='/Users/slayanne/Projects/roe-the-dev'
cloud=bpy.data.collections['Mushroom Cloud | editable sculpture']
asset_scene=bpy.data.scenes['Mushroom Cloud | asset']
preview_scene=bpy.data.scenes['Mushroom Cloud | city preview']
bpy.context.window.scene=asset_scene

for mat in [bpy.data.materials[n] for n in ('Cloud | satin silver with sculpted tonal bands','Cloud | luminous pearl updraft','Cloud | pearlescent ground billows')]:
    p=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    for link in list(p.inputs['Emission Color'].links):
        mat.node_tree.links.remove(link)
    p.inputs['Emission Color'].default_value=(.30,.30,.30,1)

export_scene=bpy.data.scenes.new('Mushroom Cloud | export')
bpy.context.window.scene=export_scene
export_root=bpy.data.objects.new('MushroomCloud',None)
export_scene.collection.objects.link(export_root)
export_root['source_reference']='Art Deco Mushroom Cloud Cityscape.png'
export_root['placement_blender']=[.45,-2.8,0]
export_root['placement_gltf_y_up']=[.45,0,2.8]
export_root['description']='Static 3D sculpture. Separate canopy, updraft, and ground clouds; no lights or city included.'

for part,label in [('Canopy','MushroomCanopy'),('Updraft','MushroomUpdraft'),('Base clouds','BaseClouds')]:
    copies=[]
    for original in list(cloud.objects):
        if original.type!='MESH' or not original.parent or original.parent.name!=part:
            continue
        obj=original.copy()
        obj.data=original.data.copy()
        export_scene.collection.objects.link(obj)
        obj.parent=None
        obj.matrix_world=original.matrix_world.copy()
        bm=bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.0001)
        bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=.00001)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
        bm.to_mesh(obj.data)
        bm.free()
        copies.append(obj)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in copies:
        obj.select_set(True)
    bpy.context.view_layer.objects.active=copies[0]
    bpy.ops.object.join()
    obj=bpy.context.object
    obj.name=label
    obj.parent=export_root
    reduction=obj.modifiers.new('Runtime density','DECIMATE')
    reduction.ratio=.68
    bpy.ops.object.modifier_apply(modifier=reduction.name)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=DIRECTORY+'/public/assets/city/mushroom-cloud.glb',export_format='GLB',
                         use_selection=True,export_apply=True,export_cameras=False,export_lights=False,
                         export_yup=True,export_extras=True,export_animations=False)
mesh_objects=[o for o in export_scene.objects if o.type=='MESH']
all_points=[o.matrix_world@Vector(p) for o in mesh_objects for p in o.bound_box]
report={
    'objects':[(o.name,len(o.data.vertices),sum(len(p.vertices)-2 for p in o.data.polygons)) for o in mesh_objects],
    'bounds_blender':[[min(p[i] for p in all_points) for i in range(3)],[max(p[i] for p in all_points) for i in range(3)]],
    'glb':DIRECTORY+'/public/assets/city/mushroom-cloud.glb'
}
print(json.dumps(report))
bpy.context.window.scene=preview_scene
preview_scene.render.filepath=DIRECTORY+'/design/city/mushroom-cloud-city-preview.png'
asset_scene.camera.data.type='PERSP'
asset_scene.camera.data.lens=54
asset_scene.camera.location=(6,-64,24)
asset_scene.camera.rotation_euler=(Vector((0,0,14))-asset_scene.camera.location).to_track_quat('-Z','Y').to_euler()
asset_scene.render.filepath=DIRECTORY+'/design/city/mushroom-cloud-asset-preview.png'

for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.overlay.show_overlays=False
        area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=DIRECTORY+'/design/city/mushroom-cloud.blend')

def render_cloud_asset():
    bpy.context.window.scene=asset_scene
    bpy.ops.render.render(write_still=True)
    bpy.context.window.scene=preview_scene
    return None
bpy.app.timers.register(render_cloud_asset,first_interval=.4)
