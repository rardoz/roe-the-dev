import numpy as np

# An angular cavity cut through the deck, roads and seams, with a shallow sealed bottom.
N=48
angles=[math.tau*i/N for i in range(N)]
outline=[]
for a in angles:
    wobble=1+.075*math.sin(a*3+.8)+.045*math.sin(a*7)+rng.uniform(-.035,.035)
    outline.append((CENTER.x+7.4*wobble*math.cos(a),CENTER.y+6.45*wobble*math.sin(a)))
verts=[(x,y,-2.21) for x,y in outline]+[(x,y,5.5) for x,y in outline]
faces=[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
cutter=object_from_mesh('Temporary jagged crater cutter',verts,faces,[char],col=impact_col)


def difference(obj,cutter):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True);bpy.context.view_layer.objects.active=obj
    mod=obj.modifiers.new('Blast removes fractured center','BOOLEAN')
    mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cutter
    mod.material_mode='TRANSFER'
    try:bpy.ops.object.modifier_apply(modifier=mod.name)
    except RuntimeError:
        obj.modifiers.remove(mod)
    obj.select_set(False)

for name in ['Island continuous worn steel deck and simple core','City uniform rounded roads','Island sparse irregular construction joints']:
    difference(copies[name],cutter)
for obj in list(ruin_col.objects):
    if obj.type=='MESH' and any((Vector((v.co.x,v.co.y,0))-CENTER).length<8.5 for v in obj.data.vertices):
        difference(obj,cutter)
bpy.data.objects.remove(cutter,do_unlink=True)

# Faceted depressed lining: uneven broken strata, rather than a smooth sphere.
verts=[];faces=[];indices=[]
for layer in range(4):
    for i,(x,y) in enumerate(outline):
        factor=[1,.76,.38,.10][layer]
        if layer==0:z=.018
        elif layer==1:z=-.60+rng.uniform(-.25,.21)
        elif layer==2:z=-1.72+rng.uniform(-.16,.12)
        else:z=-2.12+rng.uniform(-.03,.03)
        verts.append((CENTER.x+(x-CENTER.x)*factor,CENTER.y+(y-CENTER.y)*factor,z))
for layer in range(3):
    for i in range(N):
        j=(i+1)%N;a=layer*N+i;b=layer*N+j;c=(layer+1)*N+j;d=(layer+1)*N+i
        faces.extend([(a,b,c),(a,c,d)])
        tone=rng.choices([0,1,2],[6,3,1])[0] if layer else rng.randrange(3)
        indices.extend([tone,tone])
faces.append(tuple(range(3*N,4*N)));indices.append(0)
basin=object_from_mesh('Impact crater | fractured sunken basin',verts,faces,[char,steel[0],steel[1]],indices,col=impact_col)

# Unequal, folded deck plates peel upward and outward from the torn opening.
for i in range(0,N,2):
    if i in (8,18,34):continue
    j=(i+2)%N
    pa=Vector((*outline[i],0));pb=Vector((*outline[j],0))
    ua=(pa-CENTER).normalized();ub=(pb-CENTER).normalized()
    rise=rng.uniform(.6,1.65);reach=rng.uniform(1.4,3.4)
    top=[pa+Vector((0,0,rise)),pb+Vector((0,0,rise*rng.uniform(.5,1.3))),pb+ub*reach*.50+Vector((0,0,.25)),pb+ub*reach,pa+ua*reach,pa+ua*reach*.55+Vector((0,0,.35))]
    top[2].z=rng.uniform(.25,.8);top[5].z=rng.uniform(.2,.7)
    vv=[tuple(v) for v in top]+[tuple(v-Vector((0,0,.13))) for v in top]
    ff=[(0,1,2,5),(5,2,3,4),(6,11,8,7),(11,10,9,8)]+[(k,(k+1)%6,(k+1)%6+6,k+6) for k in range(6)]
    object_from_mesh('Impact | lifted torn steel plate '+str(i),vv,ff,[steel[rng.randrange(3)]],col=impact_col)

# Baked surface maps make the impact and radial soot survive glTF export.
TEX=1024
xx,yy=np.meshgrid(np.linspace(-30,30,TEX),np.linspace(-26,26,TEX))
dx,dy=xx-CENTER.x,yy-CENTER.y
radius=np.sqrt(dx*dx+(dy*1.08)**2)
angle=np.arctan2(dy,dx)
noise=np.zeros_like(xx)
for k in range(9):
    noise+=np.sin(xx*rng.uniform(.6,4.0)+yy*rng.uniform(-3,3)+rng.uniform(0,6))*np.cos(yy*rng.uniform(.4,2.5)+rng.uniform(0,6))/(k+3)
noise=np.clip(noise,-1,1)
ripple=1+.13*np.sin(angle*7)+.08*np.sin(angle*19+.5)
burn=np.clip((15-radius/ripple+noise*.8)/8,0,1)**1.35
for oldname,label,base in [('Island continuous worn steel deck and simple core','floor',.044),('City uniform rounded roads','roads',.075)]:
    obj=copies[oldname]
    values=np.maximum(.005,base*(1-.83*burn)+noise*.004)
    pixels=np.ones((TEX,TEX,4),dtype=np.float32)
    for ch in range(3):pixels[:,:,ch]=values
    img=bpy.data.images.new('Exploded '+label+' scorched albedo',width=TEX,height=TEX,alpha=False,float_buffer=True)
    img.pixels.foreach_set(pixels.ravel());img.update()
    img.filepath_raw=str(ROOT/'design/city/textures'/('exploded_'+label+'_scorch.png'))
    img.file_format='PNG';img.save();img.pack()
    oldmat=obj.data.materials[1 if label=='floor' else 0]
    mat=oldmat.copy();mat.name='Blast | scorched '+label
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img
    mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.94
    obj.data.materials[1 if label=='floor' else 0]=mat
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Blast surface UV')
    for loop in obj.data.loops:
        p=obj.matrix_world@obj.data.vertices[loop.vertex_index].co
        uv.data[loop.index].uv=((p.x+30)/60,(p.y+26)/52)

# Jagged radial stress fissures; their widths and branching vary with the damaged deck.
for i in range(13):
    a=math.tau*i/13+rng.uniform(-.12,.12)
    pts=[]
    start=rng.uniform(7.9,9.2);stop=rng.uniform(11.7,16.0)
    for k in range(5):
        r=start+(stop-start)*k/4
        drift=rng.uniform(-.035,.035)
        pts.append((CENTER.x+math.cos(a+drift)*r,CENTER.y+math.sin(a+drift)*r,.025))
    for k in range(len(pts)-1):
        bar('Blast | torn radial deck seam',pts[k],pts[k+1],rng.uniform(.055,.14),.018,char,impact_col)

# Reusable irregular debris surfaces, accumulated into a few meshes.
class Debris:
    def __init__(self,mats):self.verts=[];self.faces=[];self.mi=[];self.mats=mats
    def add(self,verts,faces,index):
        offset=len(self.verts);self.verts.extend(verts)
        self.faces.extend(tuple(i+offset for i in f) for f in faces);self.mi.extend([index]*len(faces))
    def finish(self,name):return object_from_mesh(name,self.verts,self.faces,self.mats,self.mi,col=rubble_col)

chunks=Debris(stone)
plates=Debris(steel)
beams=Debris([beam_mat])


def fracture_chunk(x,y,z,size):
    bm=bmesh.new()
    for ix in (-1,1):
        for iy in (-1,1):
            for iz in (-1,1):
                bm.verts.new((ix*size[0]*rng.uniform(.26,.62),iy*size[1]*rng.uniform(.25,.63),iz*size[2]*rng.uniform(.25,.65)))
    bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False)
    bm.verts.ensure_lookup_table();bm.verts.index_update()
    rot=Matrix.Rotation(rng.random()*math.tau,3,'Z')
    vv=[rot@v.co for v in bm.verts];bottom=min(v.z for v in vv)
    vv=[tuple(v+Vector((x,y,z-bottom))) for v in vv]
    ff=[tuple(v.index for v in f.verts) for f in bm.faces]
    chunks.add(vv,ff,rng.choices([0,1,2,3],[3,5,4,1])[0]);bm.free()


def broken_slab(x,y,z,length,width,tilt=0):
    n=rng.randrange(5,8);rot=Matrix.Rotation(rng.random()*math.tau,3,'Z')@Matrix.Rotation(tilt,3,'X')
    points=[Vector((math.cos(math.tau*k/n)*length*rng.uniform(.35,.58),math.sin(math.tau*k/n)*width*rng.uniform(.35,.58),rng.uniform(-.06,.06))) for k in range(n)]
    vv=[rot@p for p in points]+[rot@(p-Vector((0,0,rng.uniform(.10,.19)))) for p in points]
    bottom=min(v.z for v in vv);vv=[tuple(v+Vector((x,y,z-bottom))) for v in vv]
    ff=[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]+[(k,(k+1)%n,(k+1)%n+n,k+n) for k in range(n)]
    plates.add(vv,ff,rng.randrange(3))


def bent_girder(x,y,length,angle):
    profile=[(-.22,-.14),(.22,-.14),(.22,-.085),(.045,-.085),(.045,.085),(.22,.085),(.22,.14),(-.22,.14),(-.22,.085),(-.045,.085),(-.045,-.085),(-.22,-.085)]
    rot=Matrix.Rotation(angle,3,'Z');vv=[]
    bend=rng.uniform(-.3,.3)
    for j in range(3):
        for px,pz in profile:
            p=rot@Vector((px+(bend if j==1 else 0),length*(j/2-.5),pz+(.1 if j==1 else .0)))
            vv.append(tuple(p+Vector((x,y,.2))))
    ff=[tuple(range(11,-1,-1)),tuple(range(24,36))]
    for j in range(2):
        for k in range(12):ff.append((j*12+k,j*12+(k+1)%12,(j+1)*12+(k+1)%12,(j+1)*12+k))
    beams.add(vv,ff,0)

# Piles at the foot of failed walls, directed outward along the blast path.
for g in groups:
    c=g['center'];delta=c-CENTER
    if delta.length<8.2:continue
    u=delta.normalized();v=Vector((-u.y,u.x,0));pile=c+u*1.8
    for k in range(rng.randrange(13,24)):
        t=rng.gauss(0,1.1);s=rng.gauss(0,.85)
        p=pile+u*t+v*s
        if (p-CENTER).length<7.7:continue
        z=.03+max(0,.25*(1-abs(t)/1.7))
        if k%4==0:broken_slab(p.x,p.y,z,rng.uniform(1.1,2.5),rng.uniform(.45,1.2),rng.uniform(-.35,.55))
        else:fracture_chunk(p.x,p.y,.02,(rng.uniform(.25,1.1),rng.uniform(.25,.85),rng.uniform(.2,.8)))
    if g['id']%3==0:bent_girder(pile.x,pile.y,rng.uniform(2.1,3.6),math.atan2(u.y,u.x))

# Unequal banks collect at the irregular shore, with clear gaps between the major deposits.
clusters=[(-22,-10,2.4),(-13,-17,2.4),(9,-17,2.0),(22,-8,2.4),(23,6,1.9),(7,18.6,2.0),(-7,18.5,1.6),(-20,9,2.0)]
for ci,(cx,cy,spread) in enumerate(clusters):
    for k in range(34+ci%3*11):
        a=rng.random()*math.tau;r=abs(rng.gauss(0,spread*.72))
        x,y=cx+math.cos(a)*r,cy+math.sin(a)*r
        if k%4==0:broken_slab(x,y,.04,rng.uniform(1.0,3.2),rng.uniform(.45,1.6),rng.uniform(-.4,.8))
        else:fracture_chunk(x,y,.02,(rng.uniform(.45,1.5),rng.uniform(.35,1.2),rng.uniform(.25,.95)))
    bent_girder(cx+.5,cy-.5,rng.uniform(2.6,4.3),rng.uniform(0,math.tau))

# Sparse heavy fragments in the crater; keep its depressed center readable.
for k in range(24):
    a=rng.random()*math.tau;r=rng.uniform(.5,3.5)
    x,y=CENTER.x+math.cos(a)*r,CENTER.y+math.sin(a)*r
    fracture_chunk(x,y,-2.05+(r/4)**2*.6,(rng.uniform(.3,.9),rng.uniform(.25,.8),rng.uniform(.12,.45)))

chunks.finish('Debris | fractured masonry and shattered cores')
plates.finish('Debris | torn floor slabs and bent metal panels')
beams.finish('Debris | broken exposed I beams')

# Individual fragments remain editable; only temporary source meshes are discarded.
for g in groups:
    for p in g['parts']:
        if p['mesh'].users==0:bpy.data.meshes.remove(p['mesh'])
for scr in bpy.data.screens:
    for area in scr.areas:
        if area.type=='VIEW_3D':
            for sp in area.spaces:
                if sp.type=='VIEW_3D':sp.overlay.show_relationship_lines=False
bpy.ops.object.select_all(action='DESELECT')
print('Completed impact basin, scorched surfaces and clustered perimeter debris.',len(scene.objects),'scene objects')
