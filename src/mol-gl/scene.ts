/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { Renderable } from './renderable'
import { WebGLContext } from './webgl/context';
import { RenderableValues, BaseValues } from './renderable/schema';
import { GraphicsRenderObject, createRenderable } from './render-object';
import { Object3D } from './object3d';
import { Sphere3D } from '../mol-math/geometry';
import { Vec3 } from '../mol-math/linear-algebra';
import { BoundaryHelper } from '../mol-math/geometry/boundary-helper';
import { CommitQueue } from './commit-queue';
import { now } from '../mol-util/now';
import { arraySetRemove } from '../mol-util/array';

const boundaryHelper = new BoundaryHelper();
function calculateBoundingSphere(renderables: Renderable<RenderableValues & BaseValues>[], boundingSphere: Sphere3D): Sphere3D {
    boundaryHelper.reset(0.1);

    for (let i = 0, il = renderables.length; i < il; ++i) {
        const boundingSphere = renderables[i].values.boundingSphere.ref.value
        if (!boundingSphere.radius) continue;
        boundaryHelper.boundaryStep(boundingSphere.center, boundingSphere.radius);
    }
    boundaryHelper.finishBoundaryStep();
    for (let i = 0, il = renderables.length; i < il; ++i) {
        const boundingSphere = renderables[i].values.boundingSphere.ref.value
        if (!boundingSphere.radius) continue;
        boundaryHelper.extendStep(boundingSphere.center, boundingSphere.radius);
    }

    Vec3.copy(boundingSphere.center, boundaryHelper.center);
    boundingSphere.radius = boundaryHelper.radius;

    return boundingSphere;
}

function renderableSort(a: Renderable<RenderableValues & BaseValues>, b: Renderable<RenderableValues & BaseValues>) {
    const drawProgramIdA = a.getProgram('color').id
    const drawProgramIdB = b.getProgram('color').id
    const materialIdA = a.materialId
    const materialIdB = b.materialId

    if (drawProgramIdA !== drawProgramIdB) {
        return drawProgramIdA - drawProgramIdB // sort by program id to minimize gl state changes
    } else if (materialIdA !== materialIdB) {
        return materialIdA - materialIdB // sort by material id to minimize gl state changes
    } else {
        return a.id - b.id;
    }
}

interface Scene extends Object3D {
    readonly count: number
    readonly renderables: ReadonlyArray<Renderable<RenderableValues & BaseValues>>
    readonly boundingSphere: Sphere3D

    update: (objects: ArrayLike<GraphicsRenderObject> | undefined, keepBoundingSphere: boolean, isRemoving?: boolean) => void
    add: (o: GraphicsRenderObject) => void // Renderable<any>
    remove: (o: GraphicsRenderObject) => void
    commit: (maxTimeMs?: number) => boolean
    readonly needsCommit: boolean
    has: (o: GraphicsRenderObject) => boolean
    clear: () => void
    forEach: (callbackFn: (value: Renderable<RenderableValues & BaseValues>, key: GraphicsRenderObject) => void) => void
}

namespace Scene {
    export function create(ctx: WebGLContext): Scene {
        const renderableMap = new Map<GraphicsRenderObject, Renderable<RenderableValues & BaseValues>>()
        const renderables: Renderable<RenderableValues & BaseValues>[] = []
        const boundingSphere = Sphere3D.zero()

        let boundingSphereDirty = true

        const object3d = Object3D.create()

        function add(o: GraphicsRenderObject) {
            if (!renderableMap.has(o)) {
                const renderable = createRenderable(ctx, o)
                renderables.push(renderable)
                renderableMap.set(o, renderable)
                boundingSphereDirty = true
                return renderable;
            } else {
                console.warn(`RenderObject with id '${o.id}' already present`)
                return renderableMap.get(o)!
            }
        }

        function remove(o: GraphicsRenderObject) {
            const renderable = renderableMap.get(o)
            if (renderable) {
                renderable.dispose()
                arraySetRemove(renderables, renderable);
                renderableMap.delete(o)
                boundingSphereDirty = true
            }
        }

        const commitBulkSize = 100;
        function commit(maxTimeMs: number) {
            const start = now();

            let i = 0;

            while (true) {
                const o = commitQueue.tryGetRemove();
                if (!o) break;
                remove(o);
                if (++i % commitBulkSize === 0 && now() - start > maxTimeMs) return false;
            }

            while (true) {
                const o = commitQueue.tryGetAdd();
                if (!o) break;
                add(o);
                if (++i % commitBulkSize === 0 && now() - start > maxTimeMs) return false;
            }

            renderables.sort(renderableSort)
            return true;
        }

        // const toAdd: GraphicsRenderObject[] = []
        // const toRemove: GraphicsRenderObject[] = []
        const commitQueue = new CommitQueue();

        return {
            get view () { return object3d.view },
            get position () { return object3d.position },
            get direction () { return object3d.direction },
            get up () { return object3d.up },
            // get isCommiting () { return commitQueue.length > 0 },

            update(objects, keepBoundingSphere, isRemoving) {
                Object3D.update(object3d)
                if (objects) {
                    for (let i = 0, il = objects.length; i < il; ++i) {
                        const o = renderableMap.get(objects[i]);
                        if (!o) continue;
                        o.update();
                    }
                } else if (!isRemoving) {
                    for (let i = 0, il = renderables.length; i < il; ++i) {
                        renderables[i].update()
                    }
                }
                if (!keepBoundingSphere) boundingSphereDirty = true
            },
            add: (o: GraphicsRenderObject) => commitQueue.add(o),
            remove: (o: GraphicsRenderObject) => commitQueue.remove(o),
            commit: (maxTime = Number.MAX_VALUE) => commit(maxTime),
            get needsCommit() { return !commitQueue.isEmpty; },
            has: (o: GraphicsRenderObject) => {
                return renderableMap.has(o)
            },
            clear: () => {
                for (let i = 0, il = renderables.length; i < il; ++i) {
                    renderables[i].dispose()
                }
                renderables.length = 0
                renderableMap.clear()
                boundingSphereDirty = true
            },
            forEach: (callbackFn: (value: Renderable<any>, key: GraphicsRenderObject) => void) => {
                renderableMap.forEach(callbackFn)
            },
            get count() {
                return renderables.length
            },
            renderables,
            get boundingSphere() {
                if (boundingSphereDirty) calculateBoundingSphere(renderables, boundingSphere)
                boundingSphereDirty = false
                return boundingSphere
            }
        }
    }
}

export default Scene