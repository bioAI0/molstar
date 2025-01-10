// viewport-utils.ts
import { PluginCommands } from '../../mol-plugin/commands'
import { PluginContext } from '../../mol-plugin/context'
import { PluginConfig } from '../../mol-plugin/config'
import { Material } from '../../mol-util/material'
import { StateObjectRef } from '../../mol-state'
import {
    StructureRepresentationPresetProvider,
    presetStaticComponent
} from '../../mol-plugin-state/builder/structure/representation-preset'
import { PluginUIContext } from '../../mol-plugin-ui/context';
import { Asset } from '../../mol-util/assets';

export function processTextInput(plugin: PluginUIContext, value: string) {
    //debugger;
    console.log('Processing Input:', value);
    if (value === 'd') {
        console.log('Deleting all structures...');
        plugin.managers.structure.component.clear(plugin.managers.structure.component.currentStructures);
    }
    if (value === 'l') {
        loadTest(plugin);
    }
}

async function loadTest(plugin: PluginContext) {
    const url = `https://www.ebi.ac.uk/pdbe/static/entry/1erm_updated.cif`;
    const format = 'mmcif';
    const data = await plugin.builders.data.download({ url: Asset.Url(url) });
    const trajectory = await plugin.builders.structure.parseTrajectory(data as any, format as any);
    const model = await plugin.builders.structure.createModel(trajectory as any);
    const assemblyId = '';
    const structure = await plugin.builders.structure.createStructure(model as any, assemblyId ? { name: 'assembly', params: { id: assemblyId } } : void 0);
    const all = await plugin.builders.structure.tryCreateComponentStatic(structure, 'all');
    if (all) await plugin.builders.structure.representation.addRepresentation(all, { type: 'ball-and-stick', color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } });

}

export function shinyStyle(plugin: PluginContext) {
    return PluginCommands.Canvas3D.SetSettings(plugin, {
        settings: {
            renderer: {
                ...plugin.canvas3d!.props.renderer,
            },
            postprocessing: {
                ...plugin.canvas3d!.props.postprocessing,
                occlusion: { name: 'off', params: {} },
                shadow: { name: 'off', params: {} },
                outline: { name: 'off', params: {} },
            }
        }
    });
}

export const CustomMaterial = Material({ roughness: 0.2, metalness: 0 });

export const ShowButtons = PluginConfig.item('showButtons', true);

const PresetParams = {
    ...StructureRepresentationPresetProvider.CommonParams,
};

export const StructurePreset = StructureRepresentationPresetProvider({
    id: 'preset-structure',
    display: { name: 'Structure' },
    params: () => PresetParams,
    async apply(ref, params, plugin) {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!structureCell) return {};

        const components = {
            ligand: await presetStaticComponent(plugin, structureCell, 'ligand'),
            polymer: await presetStaticComponent(plugin, structureCell, 'polymer'),
        };

        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, params);

        const representations = {
            ligand: builder.buildRepresentation(update, components.ligand,
                {
                    type: 'ball-and-stick',
                    typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.35 },
                    color: 'element-symbol',
                    colorParams: { carbonColor: { name: 'element-symbol', params: {} } }
                },
                { tag: 'ligand' }
            ),
            polymer: builder.buildRepresentation(update, components.polymer,
                {
                    type: 'cartoon',
                    typeParams: { ...typeParams, material: CustomMaterial },
                    color: 'chain-id',
                    colorParams: { palette: (plugin.customState as any).colorPalette }
                },
                { tag: 'polymer' }
            ),
        };

        await update.commit({ revertOnError: true });
        await shinyStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'residue' });

        return { components, representations };
    }
});
