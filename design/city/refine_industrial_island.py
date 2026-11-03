import bpy,math,random,json,ast
from pathlib import Path
from mathutils import Vector
project=Path('/Users/slayanne/Projects/roe-the-dev')
folder=project/'design/city'
backup=folder/'city-before-irregular-island-revision.blend'
assert not backup.exists()
collection=bpy.data.collections['Industrial metal island']
city=bpy.data.collections['Buildings | editable groups']
city_state={o.name:[list(row) for row in o.matrix_world] for o in city.all_objects}
bpy.ops.wm.save_as_mainfile(filepath=str(backup),copy=True)
bpy.ops.ed.undo_push(message='Before irregular industrial island revision')
root=next(o for o in collection.objects if o.type=='EMPTY')
for obj in list(collection.objects):
    if obj.type=='MESH' and not obj.name.startswith('Barren rock'):bpy.data.objects.remove(obj,do_unlink=True)
plates=[bpy.data.materials[f'Island dull steel | shade {i}'] for i in range(1,6)]
armor=[bpy.data.materials[f'Island edge armor | shade {i}'] for i in range(1,4)]
bolt_mat=bpy.data.materials['Island graphite steel bolts']
for node in ast.parse((folder/'build_industrial_island.py').read_text()).body:
    if isinstance(node,ast.FunctionDef) and node.name in ('mesh_object','prism','bolt'):
        exec(compile(ast.Module(body=[node],type_ignores=[]),'<island helpers>','exec'))
outline=[(-26,-15),(-18,-15),(-18,-20),(-5,-20),(-5,-23),(7,-23),(7,-20),(15,-20),(15,-15),(24,-15),(24,-7),(28,-7),(28,3),(25,3),(25,13),(18,13),(18,17),(9,17),(9,22),(-8,22),(-8,17),(-17,17),(-17,13),(-25,13),(-25,3),(-28,3),(-28,-7),(-26,-7)]
prism('Island irregular stepped structural core',outline,-2.5,-.18,armor[0])
rng=random.Random(791)
bands=[(-23,-20,-5,7),(-20,-15,-18,15),(-15,-7,-26,24),(-7,3,-28,28),(3,13,-25,25),(13,17,-17,18),(17,22,-8,9)]
plate_count=0
areas=[]
for row,(y0,y1,left,right) in enumerate(bands):
    edges=[left]
    while right-edges[-1]>15:
        edges.append(edges[-1]+rng.choice((5.0,7.5,10.5,13.5)))
    edges.append(right)
    for j,(x0,x1) in enumerate(zip(edges,edges[1:])):
        ycuts=[y0,y1]
        if y1-y0>=8 and x1-x0>=7 and (j+row)%3==0:
            ycuts=[y0,y0+(y1-y0)*rng.choice((.35,.60)),y1]
        for ya,yb in zip(ycuts,ycuts[1:]):
            plate_count+=1
            gap=.045
            poly=[(x0+gap,ya+gap),(x1-gap,ya+gap),(x1-gap,yb-gap),(x0+gap,yb-gap)]
            prism(f'Island varied deck plate {plate_count:02d}',poly,-.23,0,plates[rng.randrange(5)])
            areas.append((x1-x0)*(yb-ya))
bolt_vertices=[];bolt_faces=[]
armor_count=0
for edge_index,(a,b) in enumerate(zip(outline,outline[1:]+outline[:1])):
    a=Vector(a);b=Vector(b);edge=b-a
    length=edge.length;tangent=edge.normalized();normal=Vector((tangent.y,-tangent.x))
    cuts=[0.0]
    while length-cuts[-1]>9.5:
        cuts.append(cuts[-1]+rng.choice((3.1,4.8,7.6)))
    cuts.append(length)
    for section,(start,end) in enumerate(zip(cuts,cuts[1:])):
        p=a+tangent*(start+.045);q=a+tangent*(end-.045)
        depth=rng.choice((.16,.24,.38))
        courses=[(-2.47,-.07)]
        if end-start>5 and (edge_index+section)%2==0:
            joint=rng.choice((-1.0,-1.4))
            courses=[(-2.47,joint-.045),(joint+.045,-.07)]
        for low,high in courses:
            armor_count+=1
            outer=depth+(0.07 if low<-2 and len(courses)>1 else 0)
            poly=[tuple(p-normal*.035),tuple(q-normal*.035),tuple(q+normal*outer),tuple(p+normal*outer)]
            poly.reverse()
            prism(f'Island varied armor plate {armor_count:02d}',poly,low,high,armor[rng.randrange(3)])
            rows=3 if high-low>1.7 else 2
            for position in (p+tangent*.28,q-tangent*.28):
                front=position+normal*(outer+.055)
                for k in range(rows):
                    z=low+.24+(high-low-.48)*k/(rows-1)
                    bolt((front.x,front.y,z),(normal.x,normal.y,0),.12)
        for position in (p+tangent*.35,q-tangent*.35):
            top=position-normal*.45
            bolt((top.x,top.y,.055),(0,0,1),.12)
mesh_object('Island varied armor hex bolts',bolt_vertices,bolt_faces,bolt_mat)

def inside(x,y):
    result=False
    for a,b in zip(outline,outline[1:]+outline[:1]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:result=not result
    return result
bpy.context.view_layer.update()
for name,matrix in city_state.items():assert [list(row) for row in bpy.data.objects[name].matrix_world]==matrix
for o in city.all_objects:
    if o.type!='MESH':continue
    for corner in o.bound_box:
        p=o.matrix_world@Vector(corner)
        assert inside(p.x,p.y),('Outside support',o.name)
root['Design']='Asymmetric stepped industrial footprint with deep perimeter recesses and projecting ledges; mixed large deck tiles and unequal single/double-course armor plates.'
root['Deck plate area range']=f'{min(areas):.1f} to {max(areas):.1f} square units'
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'city-industrial-island.blend'))
print(json.dumps({'deck_plates':plate_count,'area_range':[min(areas),max(areas)],'armor_plates':armor_count,'city_unchanged':True,'all_buildings_supported':True}))
