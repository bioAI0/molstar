import { presetStaticComponent, StructureRepresentationPresetProvider } from '../../mol-plugin-state/builder/structure/representation-preset';
import { StructureRef } from '../../mol-plugin-state/manager/structure/hierarchy-state';
import { PluginUIComponent } from '../../mol-plugin-ui/base';
import { LociLabels } from '../../mol-plugin-ui/controls';
import { BackgroundTaskProgress } from '../../mol-plugin-ui/task';
import { Toasts } from '../../mol-plugin-ui/toast';
import { Viewport, ViewportControls } from '../../mol-plugin-ui/viewport';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { PluginContext } from '../../mol-plugin/context';
import { StateObjectRef } from '../../mol-state';
import { Material } from '../../mol-util/material';

function shinyStyle(plugin: PluginContext) {
return PluginCommands.Canvas3D.SetSettings(plugin, { settings: {
renderer: {
...plugin.canvas3d!.props.renderer,
},
postprocessing: {
...plugin.canvas3d!.props.postprocessing,
occlusion: { name: 'off', params: {} },
shadow: { name: 'off', params: {} },
outline: { name: 'off', params: {} },
}
} });
}

const PresetParams = {
    ...StructureRepresentationPresetProvider.CommonParams,
};

const CustomMaterial = Material({ roughness: 0.2, metalness: 0 });

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
            ligand: builder.buildRepresentation(update, components.ligand, { type: 'ball-and-stick', typeParams: { ...typeParams, material: CustomMaterial, sizeFactor: 0.35 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } }, { tag: 'ligand' }),
            polymer: builder.buildRepresentation(update, components.polymer, { type: 'cartoon', typeParams: { ...typeParams, material: CustomMaterial }, color: 'chain-id', colorParams: { palette: (plugin.customState as any).colorPalette } }, { tag: 'polymer' }),
        };

        await update.commit({ revertOnError: true });
        await shinyStyle(plugin);
        plugin.managers.interactivity.setProps({ granularity: 'residue' });

        return { components, representations };
    }
});

export const ShowButtons = PluginConfig.item('showButtons', true);

export class ViewportComponent extends PluginUIComponent {

    handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const value = event.currentTarget.value;
            console.log('Enter pressed. Input Value:', value);
            this.processInput(value);
        }
    };

    processInput = (value: string) => {
        console.log('Processing Input:', value);
        if (value === 'd') {
           console.log("deleting all structures");
           this.plugin.managers.structure.component.clear(this.plugin.managers.structure.component.currentStructures);
    }
    };

    async _set(structures: readonly StructureRef[], preset: StructureRepresentationPresetProvider) {
        await this.plugin.managers.structure.component.clear(structures);
        await this.plugin.managers.structure.component.applyPreset(structures, preset);
    }

    set = async (preset: StructureRepresentationPresetProvider) => {
        await this._set(this.plugin.managers.structure.hierarchy.selection.structures, preset);
    };

    structurePreset = () => this.set(StructurePreset);

    get showButtons() {
        return this.plugin.config.get(ShowButtons);
    }

    render() {
        const VPControls = this.plugin.spec.components?.viewport?.controls || ViewportControls;

        return <>
            <Viewport />


            {this.showButtons && (
                <div className='msp-viewport-top-left-controls'>
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#fff',
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Type here..."
                            onKeyPress={this.handleInputKeyPress}
                            style={{ width: '100%', padding: '4px' }}
                        />
                    </div>
                </div>
            )}

            <VPControls />
            <BackgroundTaskProgress />
            <div className='msp-highlight-toast-wrapper'>
                <LociLabels />
                <Toasts />
            </div>
        </>;
    }
}
