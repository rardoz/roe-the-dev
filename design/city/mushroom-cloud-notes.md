# Mushroom cloud asset

Based on Art Deco Mushroom Cloud Cityscape.png, provided November 11, 2026.

- Editable Blender file: mushroom-cloud.blend
- Runtime GLB: ../../public/assets/city/mushroom-cloud.glb
- 61,748 triangles, 3 mesh nodes, 4 material primitives, 3 materials; approximately 1.5 MB.
- No external textures, lights, cameras, city meshes, or animation in the GLB.
- Grayscale vertex colors and PBR materials are included. The preview uses separate lights to illuminate the base and canopy.

## Placement

The GLB is Y-up, with its origin at the center of the base and the floor at approximately Y=0. Its unscaled dimensions are 28.31 wide, 29 high, and 28.28 deep. To match the existing city asset, apply the same scale as the city and place the root at source GLB coordinates (0.45, 0, 2.8), the impact position. Blender equivalent: (0.45, -2.8, 0).

## Editable parts

The GLB root is MushroomCloud. Children: MushroomCanopy, MushroomUpdraft, BaseClouds. These remain separate for later animation.

In Blender, use the Mushroom Cloud | asset scene to edit the cloud without the city. Mushroom Cloud | city preview shows its placement. Mushroom Cloud | export contains the reduced runtime meshes. The original city scenes and files are preserved.

## Verification

The exported GLB was imported back into Blender, its three mesh nodes and matching bounds were checked, and the imported materials were rendered. Side, back, and overhead views were also inspected. This is a static asset; website integration and animation have not been changed.
