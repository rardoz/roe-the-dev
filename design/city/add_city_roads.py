import bpy,json
from pathlib import Path
from mathutils import Vector
folder=Path('/Users/slayanne/Projects/roe-the-dev/design/city')
backup=folder/'city-before-roads.blend'
assert not backup.exists()
c=bpy.data.collections['Industrial metal island'];city=bpy.data.collections['Buildings | editable groups']
assert not bpy.data.objects.get('City narrow road network')
root=next(o for o in c.objects if o.type=='EMPTY')
bounds={}
for g in [o for o in city.objects if o.type=='EMPTY']:
    pts=[o.matrix_world@Vector(v) for o in g.children if o.type=='MESH' for v in o.bound_box]
    bounds[int(g.name[:2])]=(min(v.x for v in pts),max(v.x for v in pts),min(v.y for v in pts),max(v.y for v in pts))
width=.64;half=width/2
ys=[-12.3,-6.3,0,6.1,12.1]
rows=[[3,1,2,27,4,5],[6,7,8,9,10,11,12],[13,14,15,16,17,18,19],[20,21,22,23,24,25,26]]
rectangles=[]
for y in ys:rectangles.append((-21.65,22.7,y-half,y+half))
for ri,row in enumerate(rows):
    y0=ys[ri]+half;y1=ys[ri+1]-half
    for a,b in zip(row,row[1:]):
        x=(bounds[a][1]+bounds[b][0])/2
        rectangles.append((x-half,x+half,y0,y1))
    for x in (-21.65,22.7):rectangles.append((x-half,x+half,y0,y1))
# Foreground and rear access loops, kept well inside the metal perimeter.
rectangles.append((-13.2-half,12.8+half,-18.1-half,-18.1+half))
for x in (-13.2,-6.56,-.025,6.91,12.8):rectangles.append((x-half,x+half,-18.1+half,-12.3-half))
rectangles.append((-6.4-half,6.7+half,18.5-half,18.5+half))
for x in (-6.4,.08,6.7):rectangles.append((x-half,x+half,12.1+half,18.5-half))
for i,(x0,x1,y0,y1) in enumerate(rectangles):
    for number,(a,b,d,e) in bounds.items():
        assert min(x1,b)<=max(x0,a) or min(y1,e)<=max(y0,d),('Road intersects building',i,number)
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before city road network')
def material(name,shade):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(shade,shade,shade,1)
    n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');n.inputs['Base Color'].default_value=(shade,shade,shade,1);n.inputs['Roughness'].default_value=.92
    return m
def mesh_rects(name,rects,z,mat):
    verts=[];faces=[]
    for x0,x1,y0,y1 in rects:
        i=len(verts);verts.extend([(x0,y0,z),(x1,y0,z),(x1,y1,z),(x0,y1,z)]);faces.append((i,i+1,i+2,i+3))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);c.objects.link(o);o.parent=root;mesh.materials.append(mat);return o
roads=mesh_rects('City narrow road network',rectangles,.012,material('City roads | matte charcoal',.009))
# Lane dashes only on the cross streets, leaving intersections clear.
marks=[]
for y in ys:
    x=-20.9
    while x<22.1:
        near_junction=any(abs((a+b)/2-x)<.65 for a,b,d,e in rectangles if b-a<.7 and (abs(d-(y+half))<.01 or abs(e-(y-half))<.01))
        if not near_junction:marks.append((x-.18,x+.18,y-.022,y+.022))
        x+=1.3
mesh_rects('City restrained road lane dashes',marks,.015,material('City road markings | muted gray',.12))
roads['Width']=width
roads['Design']='Narrow connected cross streets, staggered connectors, front and rear loops; no buildings moved.'
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print(json.dumps({'saved':bpy.data.filepath,'road_segments':len(rectangles),'width':width,'building_clearances':'verified','lane_dashes':len(marks)}))
