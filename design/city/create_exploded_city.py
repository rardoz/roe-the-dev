import bpy
import math
import random
from pathlib import Path
from mathutils import Matrix, Vector

PROJECT = Path('/Users/slayanne/Projects/roe-the-dev')
BLEND_PATH = PROJECT / 'design/city/city-island-exploded.blend'
GLB_PATH = PROJECT / 'public/assets/city/city-island-exploded.glb'
PROMPT = 'can you make a city new called city-island-exploded. An astroid is actually going to crash in the middle of it so I need it to have a crater in the middle and for all of the buildings to be destroyed. There should be debris along the island parameter.'
random.seed(83)


def log(message):
    print(message)


assert not GLB_PATH.exists(), f'Refusing to overwrite {GLB_PATH}'
assert not BLEND_PATH.exists(), f'Refusing to overwrite {BLEND_PATH}'

city_roots = [o for o in bpy.data.objects if o.type == 'EMPTY' and o.name[:2].isdigit()]
assert len(city_roots) == 33, len(city_roots)
island = bpy.data.collections['Industrial metal island']
deck = bpy.data.objects['Island continuous worn steel deck and simple core']
roads = bpy.data.objects['City uniform rounded roads']
steel = [bpy.data.materials[f'Island dark worn steel {i}'] for i in (1, 2, 3)]

# Create a separate Blender deliverable before any destructive edits.
BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)
GLB_PATH.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH), copy=True)

debris_collection = bpy.data.collections.new('Exploded city | crater and debris')
bpy.context.scene.collection.children.link(debris_collection)

# Keep the original building hierarchy in the Blender file, hidden as a reusable source.
for root in city_roots:
    for obj in [root, *root.children_recursive]:
        obj.hide_render = True
        if obj.type == 'MESH':
            obj.hide_set(True)


def apply_difference(target, cutter):
    bpy.ops.object.select_all(action='DESELECT')
    target.hide_set(False)
    target.select_set(True)
    bpy.context.view_layer.objects.active = target
    mod = target.modifiers.new('Asteroid impact cavity', 'BOOLEAN')
    mod.operation = 'DIFFERENCE'
    mod.solver = 'EXACT'
    mod.object = cutter
    mod.material_mode = 'TRANSFER'
    bpy.ops.object.modifier_apply(modifier=mod.name)
    target.select_set(False)


# The ellipsoidal cutter leaves a deep, off-round basin and removes the roads inside it.
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1, location=(0, 0, 1.75))
cutter = bpy.context.object
cutter.name = 'Temporary asteroid impact cutter'
cutter.scale = (6.9, 6.35, 3.9)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
cutter.data.materials.append(steel[0])
for poly in cutter.data.polygons:
    poly.use_smooth = True
apply_difference(deck, cutter)
apply_difference(roads, cutter)
bpy.data.objects.remove(cutter, do_unlink=True)


def add_chunk_geometry(target, center, size, rotation, material_index, bevel=0.035):
    """Append a chipped, mildly tapered rectangular fragment to a shared rubble mesh."""
    cx, cy, cz = center
    sx, sy, sz = size
    # Taper the top slightly and skew its corners so the fragment reads as broken material.
    taper = random.uniform(0.68, 1.0)
    skew = random.uniform(-0.16, 0.16)
    local = [
        (-sx / 2, -sy / 2, -sz / 2), (sx / 2, -sy / 2, -sz / 2),
        (sx / 2, sy / 2, -sz / 2), (-sx / 2, sy / 2, -sz / 2),
        (-sx * taper / 2 + skew * sy, -sy * taper / 2, sz / 2),
        (sx * taper / 2 + skew * sy, -sy * taper / 2, sz / 2),
        (sx * taper / 2 + skew * sy, sy * taper / 2, sz / 2),
        (-sx * taper / 2 + skew * sy, sy * taper / 2, sz / 2),
    ]
    rot = Matrix.Rotation(rotation[0], 4, 'X') @ Matrix.Rotation(rotation[1], 4, 'Y') @ Matrix.Rotation(rotation[2], 4, 'Z')
    start = len(target['verts'])
    target['verts'].extend(tuple(rot @ Vector(v) + Vector(center)) for v in local)
    for face in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
        target['faces'].append(tuple(start + i for i in face))
        target['indices'].append(material_index)


interior = {'verts': [], 'faces': [], 'indices': []}
perimeter = {'verts': [], 'faces': [], 'indices': []}
rim = {'verts': [], 'faces': [], 'indices': []}

# Low, broken remains mark every former building footprint while leaving the crater empty.
for root in city_roots:
    meshes = [o for o in root.children if o.type == 'MESH']
    bounds = [o.matrix_world @ Vector(v) for o in meshes for v in o.bound_box]
    if not bounds:
        continue
    x0, x1 = min(v.x for v in bounds), max(v.x for v in bounds)
    y0, y1 = min(v.y for v in bounds), max(v.y for v in bounds)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if math.hypot(cx, cy) < 7.7:
        continue
    count = random.randint(8, 15)
    for _ in range(count):
        x = random.uniform(x0 - 0.8, x1 + 0.8)
        y = random.uniform(y0 - 0.8, y1 + 0.8)
        if math.hypot(x, y) < 7.3:
            continue
        sx = random.uniform(0.55, 2.0)
        sy = random.uniform(0.35, 1.35)
        sz = random.uniform(0.22, 1.25)
        if random.random() < 0.11:
            sx, sy, sz = random.uniform(0.35, 0.7), random.uniform(0.35, 0.8), random.uniform(1.2, 2.4)
        add_chunk_geometry(interior, (x, y, max(0.22, sz / 2)), (sx, sy, sz),
                           (random.uniform(-0.35, 0.35), random.uniform(-0.45, 0.45), random.uniform(-math.pi, math.pi)),
                           random.randrange(3))

# Scatter additional fractured girders and façade blocks through the former street grid.
for _ in range(145):
    angle = random.uniform(0, math.tau)
    radius = random.uniform(8.1, 20.0)
    x, y = math.cos(angle) * radius * 1.08, math.sin(angle) * radius * 0.82
    if math.hypot(x, y) < 7.7 or abs(x) > 23 or abs(y) > 18:
        continue
    sx, sy, sz = random.uniform(0.8, 2.8), random.uniform(0.3, 1.15), random.uniform(0.24, 1.35)
    if random.random() < 0.2:
        sx, sy = random.uniform(1.8, 3.6), random.uniform(0.2, 0.5)
    add_chunk_geometry(interior, (x, y, max(0.25, sz / 2)), (sx, sy, sz),
                       (random.uniform(-0.45, 0.45), random.uniform(-0.55, 0.55), angle + random.uniform(-0.8, 0.8)),
                       random.randrange(3))

# Jagged, partial ejecta rim: broken steel and building fragments rise around the basin.
for i in range(52):
    angle = math.tau * i / 52 + random.uniform(-0.035, 0.035)
    radius = random.uniform(6.0, 7.8)
    x, y = math.cos(angle) * radius * 1.05, math.sin(angle) * radius * 0.98
    sx, sy, sz = random.uniform(0.6, 1.8), random.uniform(0.45, 1.2), random.uniform(0.45, 1.75)
    add_chunk_geometry(rim, (x, y, sz * 0.42), (sx, sy, sz),
                       (random.uniform(-0.4, 0.4), random.uniform(-0.6, 0.6), angle + math.pi / 2), random.randrange(3))

# Follow the irregular island outline with a concentrated belt of scattered ejecta.
outline = [(-26,-15),(-18,-15),(-18,-20),(-5,-20),(-5,-23),(7,-23),(7,-20),(15,-20),(15,-15),(24,-15),(24,-7),(28,-7),(28,3),(25,3),(25,13),(18,13),(18,17),(9,17),(9,22),(-8,22),(-8,17),(-17,17),(-17,13),(-25,13),(-25,3),(-28,3),(-28,-7),(-26,-7)]
for i in range(102):
    edge = random.randrange(len(outline))
    a, b = Vector(outline[edge]), Vector(outline[(edge + 1) % len(outline)])
    point = a.lerp(b, random.random())
    point += (Vector((0, 0)) - point).normalized() * random.uniform(0.35, 2.8)
    sx, sy, sz = random.uniform(0.7, 2.6), random.uniform(0.35, 1.25), random.uniform(0.25, 1.35)
    if random.random() < 0.22:
        sx, sy = random.uniform(2.0, 3.4), random.uniform(0.22, 0.5)
    add_chunk_geometry(perimeter, (point.x, point.y, max(0.22, sz * 0.42)), (sx, sy, sz),
                       (random.uniform(-0.4, 0.4), random.uniform(-0.65, 0.65), random.uniform(0, math.tau)), random.randrange(3))


def make_rubble(name, data):
    mesh = bpy.data.meshes.new(name + ' geometry')
    mesh.from_pydata(data['verts'], [], data['faces'])
    mesh.materials.clear()
    for mat in steel:
        mesh.materials.append(mat)
    for face, index in zip(mesh.polygons, data['indices']):
        face.material_index = index
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    debris_collection.objects.link(obj)
    return obj


make_rubble('Collapsed buildings | rubble field', interior)
make_rubble('Crater rim | fractured impact ejecta', rim)
make_rubble('Island perimeter | scattered structural debris', perimeter)

# Preserve the existing project camera and lights; export only the island and new wreckage.
bpy.ops.object.select_all(action='DESELECT')
export_objects = {o for o in island.all_objects if o.type == 'MESH'} | {o for o in debris_collection.all_objects if o.type == 'MESH'}
for obj in export_objects:
    obj.hide_set(False)
    obj.select_set(True)
bpy.context.view_layer.objects.active = bpy.data.objects['Collapsed buildings | rubble field']
bpy.ops.export_scene.gltf(filepath=str(GLB_PATH), export_format='GLB', use_selection=True,
                          export_apply=True, export_cameras=False, export_lights=False, export_yup=True)

# Save the finished standalone Blender scene in its new variant file.
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
log(f'EXPORTED {GLB_PATH} ({GLB_PATH.stat().st_size} bytes); saved {BLEND_PATH}')
log(f'Buildings source groups hidden: {len(city_roots)}; rubble meshes: {len(debris_collection.objects)}')
