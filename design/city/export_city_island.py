import bpy,json
from pathlib import Path
project=Path('/Users/slayanne/Projects/roe-the-dev')
path=project/'public/assets/city/city-island.glb'
assert not path.exists()
collections=[bpy.data.collections['Buildings | editable groups'],bpy.data.collections['Industrial metal island']]
objects={o for c in collections for o in c.all_objects}
selected=list(bpy.context.selected_objects)
active=bpy.context.view_layer.objects.active
converted={}
slots=[]
try:
    for obj in objects:
        if obj.type!='MESH':continue
        for slot in obj.material_slots:
            mat=slot.material
            if not mat or not mat.use_nodes:continue
            if any(n.type=='BSDF_PRINCIPLED' for n in mat.node_tree.nodes):continue
            diffuse=next((n for n in mat.node_tree.nodes if n.type=='BSDF_DIFFUSE'),None)
            assert diffuse is not None,('Unsupported shader',mat.name)
            if mat not in converted:
                copy=mat.copy();copy.name=mat.name+' | WebGL'
                color=tuple(diffuse.inputs['Color'].default_value)
                copy.node_tree.nodes.clear()
                shader=copy.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
                shader.inputs['Base Color'].default_value=color
                shader.inputs['Metallic'].default_value=0
                shader.inputs['Roughness'].default_value=1
                shader.inputs['Specular IOR Level'].default_value=0
                out=copy.node_tree.nodes.new('ShaderNodeOutputMaterial')
                copy.node_tree.links.new(shader.outputs['BSDF'],out.inputs['Surface'])
                converted[mat]=copy
            slots.append((slot,mat));slot.material=converted[mat]
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_yup=True)
finally:
    for slot,mat in slots:slot.material=mat
    for mat in converted.values():
        if mat.users==0:bpy.data.materials.remove(mat)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in selected:obj.select_set(True)
    bpy.context.view_layer.objects.active=active
print(json.dumps({'exported':str(path),'bytes':path.stat().st_size,'mesh_objects':sum(o.type=='MESH' for o in objects),'saved_scene':bpy.data.filepath}))
