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

// No longer importing "Color" if we don't need it
// import { Color } from '../../mol-util/color'  // REMOVED

/** Turn off fancy postprocessing for a "shiny" style. */
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

/** A custom material. */
export const CustomMaterial = Material({ roughness: 0.2, metalness: 0 });

/** The plugin config key for showing/hiding the buttons. */
export const ShowButtons = PluginConfig.item('showButtons', true);

const PresetParams = {
    ...StructureRepresentationPresetProvider.CommonParams,
};

/** The specialized "StructurePreset". */
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
