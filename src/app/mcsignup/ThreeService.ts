import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RendererConfigProvider } from '../polygon-select/RendererConfigProvider';

@Injectable({
    providedIn: 'root'
})
export class ThreeService {

    public static makeGeoJsonPolygons(geojson: any, configProvider: RendererConfigProvider, shouldUseDotTexture: (key: string) => boolean, forceNonInteractive: (key: string) => boolean) {
        const meshes: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string })[] = [];
        const thickness = 1.5;
        const mapScale = 400.0;
        if (!geojson || !geojson.features) return meshes;
        const allCoords = ThreeService.loadCoordinates(geojson);
        const boundingBox = ThreeService.calculateBoundingBox(allCoords);
        const filteredFeatures = geojson.features.filter((feature: any) =>
            !ThreeService.hasEdgeOnBoundingBox(feature, boundingBox)
        );
        const centerFn = ThreeService.defineTransform(allCoords, mapScale);
        const key2Geos = new Map<string, THREE.BufferGeometry[]>();
        const key2isInteractive = new Map<string, boolean>();
        filteredFeatures.forEach((feature: any) => {
            const type = feature.geometry.type;
            const coords = feature.geometry.coordinates;
            const key = feature.properties.key ? feature.properties.key : "";
            const interactive = feature.properties.type != "wasteland" && !forceNonInteractive(key);
            const featureName = feature.properties.name || key || 'unnamed';

            if (!key2Geos.has(key)) {
                key2Geos.set(key, []);
                key2isInteractive.set(key, interactive);
            }
            try {
                if (type === 'Polygon') {
                    const geometry = ThreeService.createGeometryFromCoords(coords, centerFn, thickness);
                    if (geometry) {
                        key2Geos.get(key)!.push(geometry);
                    }
                } else if (type === 'MultiPolygon') {
                    coords.forEach((polyCoords: any, polyIndex: number) => {
                        try {
                            const geometry = ThreeService.createGeometryFromCoords(polyCoords, centerFn, thickness);
                            if (geometry) {
                                key2Geos.get(key)!.push(geometry);
                            }
                        } catch (err) {
                            console.info(`Skipping invalid polygon ${polyIndex} in MultiPolygon feature ${featureName}:`, err);
                        }
                    });
                } else {
                    console.error(`Unsupported geometry type: ${type}`);
                }
            } catch (err) {
                console.warn(`Skipping invalid feature ${featureName}:`, err);
            }
        });
        const nonInteractiveGeos = [];
        for (const [key, geos] of key2Geos) {
            if (geos.length === 0) {
                console.warn(`No valid geometries found for key: ${key}`);
                continue;
            }

            const mergedGeo = mergeGeometries(geos);
            const interactive = key2isInteractive.get(key)!;
            const color = configProvider.getColor(key, interactive, false, false);
            if (interactive) {
                const mesh = ThreeService.meshFromGeometry(mergedGeo, color, interactive, key, shouldUseDotTexture);
                meshes.push(mesh);
            } else {
                nonInteractiveGeos.push(mergedGeo);
            }
        }

        if (nonInteractiveGeos.length > 0) {
            const inactiveColor = configProvider.getColor("", false, false, false);
            const nonInteractiveMesh = ThreeService.meshFromGeometry(mergeGeometries(nonInteractiveGeos), inactiveColor, false, "", shouldUseDotTexture);
            meshes.push(nonInteractiveMesh);
        }
        return meshes;
    }

    private static makeDotTexture(dotFrequency: number = 1.0) {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            console.warn('Could not get 2D context for dot texture');
            return null;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = "#000000";
        const baseSpacing = 32;
        const spacing = baseSpacing / dotFrequency;
        const dotRadius = Math.max(3, spacing * 0.25);

        const dotsPerRow = Math.floor(size / spacing);
        const actualSpacing = size / dotsPerRow;

        const startOffset = actualSpacing / 2;

        for (let i = 0; i < dotsPerRow; i++) {
            for (let j = 0; j < dotsPerRow; j++) {
                const x = startOffset + i * actualSpacing;
                const y = startOffset + j * actualSpacing;

                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    public static meshFromGeometry(geometry: THREE.BufferGeometry, color: number, interactive: boolean, key: string, shouldUseDotTexture?: (key: string) => boolean) {
        let material: THREE.MeshPhongMaterial;
        const useDotTexture = shouldUseDotTexture ? shouldUseDotTexture(key) : false;

        if (useDotTexture) {
            const dotTexture = ThreeService.makeDotTexture(0.6);
            if (dotTexture) {
                material = new THREE.MeshPhongMaterial({
                    color: color,
                    map: dotTexture,
                    flatShading: true
                });
            } else {
                material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
            }
        } else {
            material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
        }

        const mesh = new THREE.Mesh(geometry, material) as THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key?: string };
        mesh.targetZ = 0;
        mesh.locked = false;
        mesh.interactive = interactive;
        mesh.key = key;
        return mesh as (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string });
    }

    public static addAABBBorder(allCoords: [number, number][], normFn: (x: number, y: number) => [number, number], color: number) {
        if (!allCoords || allCoords.length === 0) return null;
        const { minX, maxX, minY, maxY } = ThreeService.calculateBoundingBox(allCoords);
        const [blX, blY] = normFn(minX, minY);
        const [brX, brY] = normFn(maxX, minY);
        const [trX, trY] = normFn(maxX, maxY);
        const [tlX, tlY] = normFn(minX, maxY);
        const points = [
            new THREE.Vector3(blX, blY, 1.1),
            new THREE.Vector3(brX, brY, 1.1),
            new THREE.Vector3(trX, trY, 1.1),
            new THREE.Vector3(tlX, tlY, 1.1),
            new THREE.Vector3(blX, blY, 1.1)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        return line;
    }

    private static loadCoordinates(geojson: any) {
        const allCoords: [number, number][] = [];
        geojson.features.forEach((feature: any) => {
            const type = feature.geometry.type;
            const coords = feature.geometry.coordinates;
            if (type === 'Polygon') {
                coords.forEach((ring: any) => {
                    ring.forEach(([x, y]: [number, number]) => {
                        allCoords.push([x, y]);
                    });
                });
            } else if (type === 'MultiPolygon') {
                coords.forEach((poly: any) => {
                    poly.forEach((ring: any) => {
                        ring.forEach(([x, y]: [number, number]) => {
                            allCoords.push([x, y]);
                        });
                    });
                });
            }
        });
        return allCoords;
    }

    private static defineTransform(allCoords: [number, number][], mapScale: number) {
        let maxX = -Infinity;
        let minX = Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        if (allCoords.length > 0) {
            maxX = minX = allCoords[0][0];
            maxY = minY = allCoords[0][1];
            for (const [x, y] of allCoords) {
                if (x > maxX) maxX = x;
                if (x < minX) minX = x;
                if (y > maxY) maxY = y;
                if (y < minY) minY = y;
            }
        }
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        let normFn: (x: number, y: number) => [number, number];
        let centerX: number, centerY: number;
        if (rangeX >= rangeY) {
            normFn = (x, y) => [
                ((x - minX) / rangeX) * mapScale,
                ((y - minY) / rangeX) * mapScale
            ];
            centerX = 0.5 * mapScale;
            centerY = (rangeY / rangeX) * 0.5 * mapScale;
        } else {
            normFn = (x, y) => [
                ((x - minX) / rangeY) * mapScale,
                ((y - minY) / rangeY) * mapScale
            ];
            centerX = (rangeX / rangeY) * 0.5 * mapScale;
            centerY = 0.5 * mapScale;
        }
        return (x: number, y: number): [number, number] => {
            const [nx, ny] = normFn(x, y);
            return [nx - centerX, ny - centerY] as [number, number];
        };
    }

    public static createGeometryFromCoords(coords: any, normFn: (x: number, y: number) => [number, number], thickness: number): THREE.BufferGeometry | null {
        if (!coords || !coords.length) {
            console.warn('Invalid coordinates provided for geometry creation:', coords);
            return null;
        }

        if (!coords[0] || !Array.isArray(coords[0]) || coords[0].length < 3) {
            console.info('Invalid outer ring coordinates: must have at least 3 points. Got:', coords[0]);
            return null;
        }

        const shape = new THREE.Shape();

        const outerRing = coords[0];
        let validPointsAdded = 0;

        outerRing.forEach(([x, y]: [number, number], i: number) => {
            if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
                console.warn(`Invalid coordinate at index ${i}:`, [x, y]);
                return;
            }

            const [nx, ny] = normFn(x, y);
            if (isNaN(nx) || isNaN(ny)) {
                console.warn(`Transform resulted in NaN at index ${i}:`, [x, y], '->', [nx, ny]);
                return;
            }

            if (validPointsAdded === 0) {
                shape.moveTo(nx, ny);
            } else {
                shape.lineTo(nx, ny);
            }
            validPointsAdded++;
        });

        if (validPointsAdded < 3) {
            console.warn(`Insufficient valid points for geometry creation. Need at least 3, got ${validPointsAdded}`);
            return null;
        }

        shape.closePath();

        for (let i = 1; i < coords.length; i++) {
            if (!coords[i] || !Array.isArray(coords[i]) || coords[i].length < 3) {
                console.warn(`Skipping invalid hole at index ${i}:`, coords[i]);
                continue;
            }

            const holePath = new THREE.Path();
            let holeValidPoints = 0;

            coords[i].forEach(([x, y]: [number, number], j: number) => {
                if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
                    console.warn(`Invalid hole coordinate at ${i},${j}:`, [x, y]);
                    return;
                }

                const [nx, ny] = normFn ? normFn(x, y) : [x, y];
                if (isNaN(nx) || isNaN(ny)) {
                    console.warn(`Hole transform resulted in NaN at ${i},${j}:`, [x, y], '->', [nx, ny]);
                    return;
                }

                if (holeValidPoints === 0) {
                    holePath.moveTo(nx, ny);
                } else {
                    holePath.lineTo(nx, ny);
                }
                holeValidPoints++;
            });

            if (holeValidPoints >= 3) {
                holePath.closePath();
                shape.holes.push(holePath);
            } else {
                console.warn(`Skipping hole with insufficient valid points: ${holeValidPoints}`);
            }
        }

        const extrudeGeometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
        return ThreeService.removeBottomFaces(extrudeGeometry);
    }

    private static removeBottomFaces(geometry: THREE.ExtrudeGeometry): THREE.BufferGeometry {
        const positionAttribute = geometry.attributes['position'] as THREE.BufferAttribute;
        const positions = positionAttribute.array;
        const indices = geometry.index?.array;

        if (indices) {
            const newIndices: number[] = [];
            let removedTriangles = 0;
            let minZ = Infinity, maxZ = -Infinity;
            for (let i = 2; i < positions.length; i += 3) {
                const z = positions[i];
                if (z < minZ) minZ = z;
                if (z > maxZ) maxZ = z;
            }

            const threshold = minZ + (maxZ - minZ) * 0.1;

            for (let i = 0; i < indices.length; i += 3) {
                const i1 = indices[i] * 3;
                const i2 = indices[i + 1] * 3;
                const i3 = indices[i + 2] * 3;
                const z1 = positions[i1 + 2];
                const z2 = positions[i2 + 2];
                const z3 = positions[i3 + 2];

                if (z1 > threshold || z2 > threshold || z3 > threshold) {
                    newIndices.push(indices[i], indices[i + 1], indices[i + 2]);
                } else {
                    removedTriangles++;
                }
            }
            geometry.setIndex(newIndices);
        } else {
            const newPositions: number[] = [];
            let removedTriangles = 0;
            let minZ = Infinity, maxZ = -Infinity;
            for (let i = 2; i < positions.length; i += 3) {
                const z = positions[i];
                if (z < minZ) minZ = z;
                if (z > maxZ) maxZ = z;
            }
            const threshold = minZ + (maxZ - minZ) * 0.1;
            for (let i = 0; i < positions.length; i += 9) {
                const z1 = positions[i + 2];
                const z2 = positions[i + 5];
                const z3 = positions[i + 8];
                if (z1 > threshold || z2 > threshold || z3 > threshold) {
                    for (let j = 0; j < 9; j++) {
                        newPositions.push(positions[i + j]);
                    }
                } else {
                    removedTriangles++;
                }
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
            const normalAttribute = geometry.attributes['normal'] as THREE.BufferAttribute;
            const uvAttribute = geometry.attributes['uv'] as THREE.BufferAttribute;

            if (normalAttribute) {
                const normals = normalAttribute.array;
                const newNormals: number[] = [];
                let triangleIndex = 0;

                for (let i = 0; i < positions.length; i += 9) {
                    const z1 = positions[i + 2];
                    const z2 = positions[i + 5];
                    const z3 = positions[i + 8];

                    if (z1 > threshold || z2 > threshold || z3 > threshold) {
                        const normalStart = triangleIndex * 9;
                        for (let j = 0; j < 9; j++) {
                            newNormals.push(normals[normalStart + j]);
                        }
                    }
                    triangleIndex++;
                }
                geometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
            }

            if (uvAttribute) {
                const uvs = uvAttribute.array;
                const newUVs: number[] = [];
                let triangleIndex = 0;

                for (let i = 0; i < positions.length; i += 9) {
                    const z1 = positions[i + 2];
                    const z2 = positions[i + 5];
                    const z3 = positions[i + 8];

                    if (z1 > threshold || z2 > threshold || z3 > threshold) {
                        const uvStart = triangleIndex * 6;
                        for (let j = 0; j < 6; j++) {
                            newUVs.push(uvs[uvStart + j]);
                        }
                    }
                    triangleIndex++;
                }
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUVs, 2));
            }
        }

        return geometry;
    }

    private static calculateBoundingBox(allCoords: [number, number][]) {
        if (allCoords.length === 0) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const [x, y] of allCoords) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        return { minX, maxX, minY, maxY };
    }

    private static hasEdgeOnBoundingBox(feature: any, boundingBox: { minX: number, maxX: number, minY: number, maxY: number }): boolean {
        const { minX, maxX, minY, maxY } = boundingBox;
        const tolerance = 1e-10;
        const checkRing = (ring: [number, number][]): boolean => {
            for (let i = 0; i < ring.length - 1; i++) {
                const [x1, y1] = ring[i];
                const [x2, y2] = ring[i + 1];
                if ((Math.abs(x1 - minX) < tolerance && Math.abs(x2 - minX) < tolerance) ||
                    (Math.abs(x1 - maxX) < tolerance && Math.abs(x2 - maxX) < tolerance) ||
                    (Math.abs(y1 - minY) < tolerance && Math.abs(y2 - minY) < tolerance) ||
                    (Math.abs(y1 - maxY) < tolerance && Math.abs(y2 - maxY) < tolerance)) {
                    return true;
                }
            }
            return false;
        };
        const coords = feature.geometry.coordinates;
        const type = feature.geometry.type;
        if (type === 'Polygon') {
            for (const ring of coords) {
                if (checkRing(ring)) {
                    return true;
                }
            }
        } else if (type === 'MultiPolygon') {
            for (const polygon of coords) {
                for (const ring of polygon) {
                    if (checkRing(ring)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}