// viewport.tsx
import React from 'react';
import { PluginUIComponent } from '../../mol-plugin-ui/base';
import { LociLabels } from '../../mol-plugin-ui/controls';
import { BackgroundTaskProgress } from '../../mol-plugin-ui/task';
import { Toasts } from '../../mol-plugin-ui/toast';
import { Viewport, ViewportControls } from '../../mol-plugin-ui/viewport';
import { StructureRepresentationPresetProvider } from '../../mol-plugin-state/builder/structure/representation-preset';
import { StructureRef } from '../../mol-plugin-state/manager/structure/hierarchy-state';

// Now import from './viewport-utils' only what you actually use
import {
    ShowButtons,
    StructurePreset
} from './viewport-utils';

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
            this.plugin.managers.structure.component.clear(
                this.plugin.managers.structure.component.currentStructures
            );
        }
    };

    async _set(structures: readonly StructureRef[], preset: StructureRepresentationPresetProvider) {
        await this.plugin.managers.structure.component.clear(structures);
        await this.plugin.managers.structure.component.applyPreset(structures, preset);
    }

    set = async (preset: StructureRepresentationPresetProvider) => {
        await this._set(
            this.plugin.managers.structure.hierarchy.selection.structures,
            preset
        );
    };

    structurePreset = () => this.set(StructurePreset);

    get showButtons() {
        return this.plugin.config.get(ShowButtons);
    }

    render() {
        const VPControls = this.plugin.spec.components?.viewport?.controls || ViewportControls;

        return (
            <>
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
            </>
        );
    }
}
