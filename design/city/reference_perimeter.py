import bpy,math,random,json,ast
from pathlib import Path
from mathutils import Vector
folder=Path('/Users/slayanne/Projects/roe-the-dev/design/city')
backup=folder/'city-before-reference-perimeter.blend'
assert not backup.exists()
collection=bpy.data.collections['Industrial metal island']
root=next(o for o in collection.objects if o.type=='EMPTY')
city=bpy.data.collections['Buildings | editable groups']
city_state={o.name:[list(row) for row in o.matrix_world] for o in city.all_objects}
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before reference metal slab perimeter')
for node in ast.parse((folder/'build_industrial_island.py').read_text()).body:
    if isinstance(node,ast.FunctionDef) and node.name in ('mesh_object','bolt','material'):
        exec(compile(ast.Module(body=[node],type_ignores=[]),'<island helpers>','exec'))
for o in list(collection.objects):
    if o.name.startswith(('Island varied armor plate','Island varied armor hex bolts')):bpy.data.objects.remove(o,do_unlink=True)
outline=[(-26,-15),(-18,-15),(-18,-20),(-5,-20),(-5,-23),(7,-23),(7,-20),(15,-20),(15,-15),(24,-15),(24,-7),(28,-7),(28,3),(25,3),(25,13),(18,13),(18,17),(9,17),(9,22),(-8,22),(-8,17),(-17,17),(-17,13),(-25,13),(-25,3),(-28,3),(-28,-7),(-26,-7)]
metals=[material(f'Reference island steel {i+1}',s,.55,.8) for i,s in enumerate((.038,.053,.072,.095))]
bolt_mat=bpy.data.materials['Island graphite steel bolts']
bolt_vertices=[];bolt_faces=[]
rng=random.Random(1029)
count=0;projection_values=[];depth_values=[]
for edge_index,(a,b) in enumerate(zip(outline,outline[1:]+outline[:1])):
    a=Vector(a);b=Vector(b);delta=b-a
    length=delta.length;tangent=delta.normalized();normal=Vector((tangent.y,-tangent.x))
    cuts=[0]
    while length-cuts[-1]>8.0:
        cuts.append(cuts[-1]+rng.uniform(3.1,5.8))
    if length-cuts[-1]>6.2:
        cuts.append(cuts[-1]+(length-cuts[-1])*.43)
    cuts.append(length)
    for j,(start,end) in enumerate(zip(cuts,cuts[1:])):
        count+=1
        width=end-start-.10
        p=a+tangent*(start+.05)
        projection=(.35,.95,1.65,.60,1.30)[count%5]+rng.uniform(-.08,.08)
        depth=rng.uniform(2.35,4.3)
        slope=rng.choice((-.5,0,.4))
        chamfer=min(.28,width*.10)
        shape=[(0,-.08),(width,-.08),(width,projection-chamfer),(width-chamfer,projection),(chamfer,projection),(0,projection-chamfer)]
        verts=[]
        for bottom in (True,False):
            for x,y in shape:
                pt=p+tangent*x+normal*y
                z=-depth+slope*(x/width-.5) if bottom else -.035
                verts.append((pt.x,pt.y,z))
        n=len(shape)
        faces=[tuple(reversed(range(n))),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
        # The local (tangent, outward) basis is clockwise in world XY.
        faces=[tuple(reversed(face)) for face in faces]
        obj=mesh_object(f'Island projecting metal slab {count:02d}',verts,faces,metals[rng.randrange(4)])
        obj['Projection']=projection;obj['Depth']=depth
        projection_values.append(projection);depth_values.append(depth)
        for x in (chamfer+.15,width-chamfer-.15):
            pos=p+tangent*x+normal*(projection+.055)
            low=-depth+slope*(x/width-.5)+.28
            rows=max(3,round((-0.3-low)/.52)+1)
            for row in range(rows):
                z=low+(-.30-low)*row/(rows-1)
                bolt((pos.x,pos.y,z),(normal.x,normal.y,0),.095,.085)
            top=p+tangent*x+normal*(projection*.55)
            bolt((top.x,top.y,.018),(0,0,1),.10,.085)
        if width>4.5:
            for x in (width*.35,width*.65):
                pos=p+tangent*x+normal*(projection+.055)
                bolt((pos.x,pos.y,-.30),(normal.x,normal.y,0),.095,.085)
mesh_object('Island reference perimeter bolts',bolt_vertices,bolt_faces,bolt_mat)
bpy.context.view_layer.update()
for name,matrix in city_state.items():assert [list(row) for row in bpy.data.objects[name].matrix_world]==matrix
root['Design']='Reference-inspired layered metal cliff: unequal slab widths, deep alternating projections and recesses, clipped corners, vertical rivet rows and unequal slab bottoms. Large deck plates retained; simple underside.'
root['Suggested ocean height']=-2.4
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'city-industrial-island.blend'))
print(json.dumps({'slabs':count,'projection_range':[min(projection_values),max(projection_values)],'depth_range':[min(depth_values),max(depth_values)],'bolts':len(bolt_vertices)//12,'city_unchanged':True}))
