"""Bake static architectural bounce light and occlusion with Blender Cycles.
Furniture is deliberately excluded so movable pieces never leave baked shadows.
Coordinates match the web room: Blender (x, y, z) = web (x, -z, y).
"""
from pathlib import Path
import bpy
from mathutils import Vector
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/source/lighting'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=48
scene.cycles.max_bounces=5
scene.render.bake.margin=4
scene.world=bpy.data.worlds.new('Soft exterior sky')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(0.78,0.85,1.0,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=0.35

def mat(name):
    m=bpy.data.materials.new(name);m.use_nodes=True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(0.72,0.72,0.72,1)
    m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=1
    return m
neutral=mat('Neutral architectural bounce')
def box(name,loc,size):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(neutral);return o
# Solid room shell, interrupted by the window opening.
box('Back wall',(0,2.50,1.55),(6.4,.12,3.1))
box('Left rear pier',(-3.2,1.95,1.55),(.12,1.1,3.1))
box('Left front pier',(-3.2,-1.75,1.55),(.12,1.5,3.1))
box('Window sill wall',(-3.2,.2,.34),(.12,2.4,.68))
box('Window header',(-3.2,.2,2.97),(.12,2.4,.27))
box('Floor slab',(0,0,-.09),(6.4,5,.16))
for y in [-1,-.2,.6,1.4]:box('Window mullion',(-3.1,y,1.75),(.07,.045,2.12))
for z in [.7,1.75,2.81]:box('Window transom',(-3.1,.2,z),(.07,2.45,.05))
box('Sill',(-3.04,.2,.67),(.34,2.62,.07))
# Wide source through the window creates soft, indirect architectural light.
bpy.ops.object.light_add(type='AREA',location=(-4.8,-.2,3.5));lamp=bpy.context.object
lamp.data.energy=180;lamp.data.shape='DISK';lamp.data.size=4
lamp.rotation_euler=(Vector((0,0,1))-lamp.location).to_track_quat('-Z','Y').to_euler()

def target(name,verts):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[(0,1,2,3)]);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    uv=mesh.uv_layers.new(name='UVMap')
    for loop,coord in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):loop.uv=coord
    m=mat(name+' bake material');obj.data.materials.append(m)
    return obj,m
surfaces=[
    target('floor',[(-3.2,-2.5,-.003),(3.2,-2.5,-.003),(3.2,2.5,-.003),(-3.2,2.5,-.003)]),
    target('back-wall',[(-3.2,2.435,0),(3.2,2.435,0),(3.2,2.435,3.1),(-3.2,2.435,3.1)]),
]
for obj,m in surfaces:
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    for kind in ['ao','bounce']:
        image=bpy.data.images.new(obj.name+'-'+kind,width=768,height=768,alpha=False)
        image.colorspace_settings.name='Non-Color'
        tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;m.node_tree.nodes.active=tex
        if kind=='ao':bpy.ops.object.bake(type='AO')
        else:
            scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=True;scene.render.bake.use_pass_color=False
            bpy.ops.object.bake(type='DIFFUSE')
        image.filepath_raw=str(OUT/(obj.name+'-'+kind+'.png'));image.file_format='PNG';image.save()
        m.node_tree.nodes.remove(tex)
        print('BAKED',obj.name,kind,flush=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'architectural-lighting.blend'))
