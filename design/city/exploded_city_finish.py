from mathutils.geometry import delaunay_2d_cdt

# Uneven triangulation removes the artificial radial pattern from the crater lining.
points=[Vector(p) for p in outline]
for k in range(240):
    a=rng.uniform(0,math.tau);r=math.sqrt(rng.random())*.93
    points.append(Vector((CENTER.x+math.cos(a)*7.0*r,CENTER.y+math.sin(a)*5.9*r)))
result=delaunay_2d_cdt(points,[],[list(range(N))],1,.00001)
vertices=[]
for xy in result[0]:
    delta=xy-Vector((CENTER.x,CENTER.y))
    angle=math.atan2(delta.y/6.45,delta.x/7.4)%math.tau
    index=angle/math.tau*N;i=int(index)%N;f=index-int(index)
    p0=Vector(outline[i])-Vector((CENTER.x,CENTER.y));p1=Vector(outline[(i+1)%N])-Vector((CENTER.x,CENTER.y))
    edge=p0.lerp(p1,f).length
    ratio=min(1,delta.length/max(edge,.1))
    z=-2.14+2.16*ratio**1.7
    z+=math.sin(xy.x*2.1+xy.y)*math.sin(xy.y*1.7)*.23*math.sin(ratio*math.pi)
    if ratio>.99:z=.018
    vertices.append((xy.x,xy.y,z))
old=basin.data
mesh=bpy.data.meshes.new('Irregular fractured crater lining')
mesh.from_pydata(vertices,[],result[2]);mesh.update()
crater_mats=[material('Blast | basin shade '+str(i),g,.28,.96) for i,g in enumerate((.012,.016,.021))]
for mat in crater_mats:mesh.materials.append(mat)
for face in mesh.polygons:face.material_index=rng.choices([0,1,2],[2,6,2])[0]
basin.data=mesh
if old.users==0:bpy.data.meshes.remove(old)
for obj in list(impact_col.objects):
    if obj.name.startswith('Impact | lifted torn steel plate '):
        idx=int(obj.name.rsplit(' ',1)[-1])
        if idx not in (0,4,10,14,22,26,30,38,40,44):bpy.data.objects.remove(obj,do_unlink=True)

for ident in (13,14,23,25,32):
    g=next(g for g in groups if g['id']==ident)
    c=g['center'];u=(c-CENTER).normalized();axis=Vector((-u.y,u.x,0))
    transform=Matrix.Translation(c)@Matrix.Rotation(rng.uniform(.045,.10),4,axis)@Matrix.Translation(-c)
    for obj in ruin_col.objects:
        if obj.name.startswith(f'{ident:02d} '):obj.matrix_world=transform@obj.matrix_world

# Preserve dark windows in exported architectural fragments using portable PBR materials.
for col in (ruin_col,fall_col):
    for obj in col.objects:
        if obj.type!='MESH':continue
        for slot in obj.material_slots:
            mat=slot.material
            if not mat or not mat.use_nodes:continue
            if any(n.type=='BSDF_PRINCIPLED' for n in mat.node_tree.nodes):continue
            diffuse=next((n for n in mat.node_tree.nodes if n.type=='BSDF_DIFFUSE'),None)
            if diffuse:
                color=tuple(diffuse.inputs['Color'].default_value)
                mat.node_tree.nodes.clear()
                bsdf=mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
                bsdf.inputs['Base Color'].default_value=color
                bsdf.inputs['Roughness'].default_value=.94
                bsdf.inputs['Specular IOR Level'].default_value=.1
                out=mat.node_tree.nodes.new('ShaderNodeOutputMaterial')
                mat.node_tree.links.new(bsdf.outputs['BSDF'],out.inputs['Surface'])

scene['Asset']='city-island-exploded'
scene['Design']='Asteroid aftermath: source-derived fractured Art Deco bases, collapsed upper structures, torn metal crater, radial blast scars and perimeter debris banks.'
scene['Source master']=source_scene.name
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    if obj.type=='MESH':obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT_GLB),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_yup=True)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))
print('Saved',OUT_BLEND,'and',OUT_GLB,OUT_GLB.stat().st_size,'bytes')
