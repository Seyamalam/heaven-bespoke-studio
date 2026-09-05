"""Original illustrative furniture. Run with Blender --background --python this-file.

Exports compact glTF geometry, editable .blend sources, and lit poster renders.
All modeling dimensions are meters. No external assets or add-ons required.
"""
from pathlib import Path
import math
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
for folder in ['public/models', 'public/images', 'assets/source/blender', 'assets/source/posters']:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)

def material(name, color, roughness=.6, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return mat

def rounded(name, location, scale, mat, bevel=.08, rotation=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = obj.modifiers.new('Soft upholstered edges', 'BEVEL')
    mod.width = bevel
    mod.segments = 5
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    mod = obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    bpy.ops.object.modifier_apply(modifier=mod.name)
    if rotation:
        obj.rotation_euler = rotation
    return obj

def cylinder(name, location, radius, depth, mat, scale=(1,1,1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = obj.modifiers.new('Rounded joinery', 'BEVEL')
    mod.width = .016
    mod.segments = 3
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def pipe(name, points, mat, radius=.0035):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new('POLY')
    spline.points.add(len(points)-1)
    for p, co in zip(spline.points, points):
        p.co = (*co, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)

def cushion_piping(cx, cy, z, w, d, mat):
    points=[]
    r=.065
    for x,y,start in [(cx+w/2-r,cy+d/2-r,0),(cx-w/2+r,cy+d/2-r,90),(cx-w/2+r,cy-d/2+r,180),(cx+w/2-r,cy-d/2+r,270)]:
        for i in range(9):
            a=math.radians(start+i*90/8)
            points.append((x+r*math.cos(a),y+r*math.sin(a),z))
    points.append(points[0])
    pipe('Hand finished cushion piping',points,mat)

def sofa(fabric,wood,brass):
    rounded('Solid walnut plinth',(0,0,.15),(2.29,.9,.15),wood,.035)
    rounded('Upholstered foundation',(0,0,.29),(2.4,1.0,.25),fabric,.10)
    for x in [-1.075,1.075]:
        rounded('Sculpted arm',(x,.005,.56),(.25,1.0,.58),fabric,.115)
    rounded('Continuous back',(0,.38,.66),(2.15,.25,.53),fabric,.11)
    for x in [-.65,0,.65]:
        rounded('Tailored seat',(x,-.10,.46),(.63,.71,.20),fabric,.075)
        cushion_piping(x,-.10,.505,.60,.67,fabric)
        rounded('Relaxed back cushion',(x,.235,.71),(.64,.20,.42),fabric,.085,(math.radians(9),0,0))
    for x in [-.94,.94]:
        for y in [-.34,.34]:
            cylinder('Walnut foot',(x,y,.08),.042,.16,wood)
            cylinder('Brass foot detail',(x,y,.025),.043,.035,brass)
    rounded('Accent cushion',(-.76,.00,.70),(.34,.16,.32),fabric,.065,(math.radians(12),math.radians(-12),math.radians(-14)))

def chair(fabric,wood,brass):
    for x in [-.34,.34]:
        for y in [-.27,.27]:
            rounded('Tapered timber leg',(x,y,.24),(.07,.075,.48),wood,.018,(0,math.radians(5 if x>0 else -5),0))
        rounded('Walnut armrest',(x,0,.57),(.09,.79,.075),wood,.035)
        rounded('Back support',(x,.28,.57),(.065,.075,.50),wood,.022,(math.radians(12),0,0))
    rounded('Seat frame',(0,0,.35),(.75,.74,.1),wood,.025)
    rounded('Generous seat',(0,-.02,.43),(.69,.69,.20),fabric,.09)
    cushion_piping(0,-.02,.485,.64,.64,fabric)
    rounded('Curved back cushion',(0,.265,.66),(.70,.19,.45),fabric,.085,(math.radians(12),0,0))
    for x in [-.342,.342]:
        cylinder('Brass joinery',(x,-.22,.55),.025,.02,brass)

def table(fabric,wood,brass):
    cylinder('Oval walnut top',(0,0,.40),.6,.075,wood,(1,.61,1))
    cylinder('Recessed brass reveal',(0,0,.354),.52,.017,brass,(1,.57,1))
    for x in [-.30,.30]:
        cylinder('Sculpted timber pedestal',(x,0,.18),.13,.36,wood,(1,1.5,1))
        for i in range(24):
            a=i*math.tau/24
            cylinder('Fluted pedestal detail',(x+.13*math.cos(a),.195*math.sin(a),.18),.009,.32,wood)

def aim(obj, point):
    obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()

for key, builder in [('sofa',sofa),('chair',chair),('table',table)]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    fabric=material('Fabric',(.56,.57,.43),.87)
    wood=material('Wood',(.17,.081,.036),.38)
    brass=material('Brass',(.46,.31,.12),.30,.75)
    builder(fabric,wood,brass)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models'/f'{key}.glb'),export_format='GLB',use_selection=True,export_apply=True)

    floor=material('Studio floor',(.78,.755,.70),.9)
    rounded('Render floor',(0,0,-.06),(200,200,.10),floor,.01)
    bpy.ops.object.camera_add(location=(3.3,-5.3,2.5))
    cam=bpy.context.object
    aim(cam,(0,0,.42 if key!='table' else .2))
    cam.data.type='ORTHO'
    cam.data.ortho_scale=3.25 if key=='sofa' else 1.75
    bpy.context.scene.camera=cam
    for loc,power,size in [((-3,-4,5),650,4),((3,-1,4),400,3),((0,4,5),550,3)]:
        bpy.ops.object.light_add(type='AREA',location=loc)
        light=bpy.context.object
        light.data.energy=power
        light.data.shape='DISK'
        light.data.size=size
        aim(light,(0,0,.3))
    world=bpy.data.worlds.new('Warm daylight')
    world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.80,.82,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.4
    scene=bpy.context.scene
    scene.world=world
    scene.render.engine='CYCLES'
    scene.cycles.samples=32
    scene.cycles.use_denoising=True
    scene.render.resolution_x=1200
    scene.render.resolution_y=900
    scene.render.resolution_percentage=100
    scene.view_settings.view_transform='AgX'
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath=str(ROOT/'assets/source/posters'/f'{key}-poster.png')
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/source/blender'/f'{key}.blend'))
    bpy.ops.render.render(write_still=True)
    print(f'COMPLETE {key}', flush=True)
