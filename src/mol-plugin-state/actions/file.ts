/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { PluginContext } from '../../mol-plugin/context';
import { StateAction } from '../../mol-state';
import { Task } from '../../mol-task';
import { getFileInfo } from '../../mol-util/file-info';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject } from '../objects';

export const OpenFiles = StateAction.build({
    display: { name: 'Open Files', description: 'Load one or more files and optionally create default visuals' },
    from: PluginStateObject.Root,
    params: (a, ctx: PluginContext) => {
        const { extensions, options } = ctx.dataFormats;
        return {
            files: PD.FileList({ accept: Array.from(extensions.values()).map(e => `.${e}`).join(',') + ',.gz,.zip', multiple: true }),
            format: PD.Select('auto', options),
            visuals: PD.Boolean(true, { description: 'Add default visuals' }),
        };
    }
})(({ params, state }, plugin: PluginContext) => Task.create('Open Files', async taskCtx => {
    plugin.behaviors.layout.leftPanelTabName.next('data');

    await state.transaction(async () => {
        if (params.files === null) {
            plugin.log.error('No file(s) selected');
            return;
        }
        for (let i = 0, il = params.files.length; i < il; ++i) {
            try {
                const file = params.files[i];
                const info = getFileInfo(file);
                const isBinary = plugin.dataFormats.binaryExtensions.has(info.ext);
                const { data } = await plugin.builders.data.readFile({ file, isBinary });
                const provider = params.format === 'auto'
                    ? plugin.dataFormats.auto(info, data.cell?.obj!)
                    : plugin.dataFormats.get(params.format);

                if (!provider) {
                    plugin.log.warn(`OpenFiles: could not find data provider for '${info.name}.${info.ext}'`);
                    continue;
                }

                // need to await so that the enclosing Task finishes after the update is done.
                const parsed = await provider.parse(plugin, data);
                if (params.visuals) {
                    await provider.visuals?.(plugin, parsed);
                }
            } catch (e) {
                plugin.log.error(e);
            }
        }
    }).runInContext(taskCtx);
}));