import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useFilterStore, type CameraPreset } from '@/store/filter-store';

export function CameraRig() {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const cameraPreset = useFilterStore((s) => s.cameraPreset);
    const invalidate = useThree((s) => s.invalidate);

    const targetPosition = useRef(new THREE.Vector3(30, 28, 30));
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
    const isAnimating = useRef(false);

    useEffect(() => {
        if (!controlsRef.current) return;

        switch (cameraPreset) {
            case 'TOP_DOWN':
                targetPosition.current.set(0, 48, 0.1);
                targetLookAt.current.set(0, 0, 0);
                break;
            case 'ISOMETRIC':
                targetPosition.current.set(32, 28, 32);
                targetLookAt.current.set(0, 0, 0);
                break;
            case 'FLOOR_FOCUS':
                targetPosition.current.set(22, 14, 22);
                targetLookAt.current.set(0, 3, 0);
                break;
            case 'SITE_FOCUS':
                targetPosition.current.set(16, 12, 16);
                targetLookAt.current.set(2, 0, 2);
                break;
        }

        isAnimating.current = true;
        invalidate();
    }, [cameraPreset, invalidate]);

    useFrame((state, delta) => {
        if (!isAnimating.current || !controlsRef.current) return;

        const camera = state.camera;
        const controls = controlsRef.current;

        camera.position.lerp(targetPosition.current, delta * 4);
        controls.target.lerp(targetLookAt.current, delta * 4);
        controls.update();
        invalidate();

        if (
            camera.position.distanceTo(targetPosition.current) < 0.1 &&
            controls.target.distanceTo(targetLookAt.current) < 0.1
        ) {
            isAnimating.current = false;
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2 - 0.02} // Prevent camera from clipping under floor
            minDistance={8}
            maxDistance={120}
        />
    );
}
