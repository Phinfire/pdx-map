import * as THREE from 'three';

export class GeoMesh extends THREE.Mesh {
    targetZ?: number;
    locked?: boolean;
}