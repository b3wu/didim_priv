import React, { useEffect, useMemo, useRef, useState, useImperativeHandle } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export type StlViewerHandle = { capture: () => string | null; };
type Props = { file: File | null };

const StlViewer = React.forwardRef<StlViewerHandle, Props>(({ file }, ref) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [heightRange, setHeightRange] = useState<{ min: number; max: number }>({ min: 0, max: 10 });
  const [clipZ, setClipZ] = useState<number>(0);
  const [autoplace, setAutoplace] = useState(true);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const arrayBufferPromise = useMemo(() => (file ? file.arrayBuffer() : null), [file]);

  useImperativeHandle(ref, () => ({
    capture: () => {
      const r = rendererRef.current;
      if (!r) return null;
      try { return r.domElement.toDataURL("image/png"); } catch { return null; }
    }
  }), []);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B0F14);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    camera.position.set(2.5, 2.5, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,7.5);
    scene.add(dir);

    const grid = new THREE.GridHelper(10, 20, 0x224444, 0x112222);
    grid.position.y = 0;
    scene.add(grid);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    const makeMat = () => new THREE.MeshStandardMaterial({ color: 0x66e7d4, metalness: 0.05, roughness: 0.75, side: THREE.DoubleSide, clippingPlanes: [plane], clipShadows: true });

    function centerGroup(obj: THREE.Object3D) {
      obj.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(obj);
      const center = new THREE.Vector3(); box.getCenter(center);
      obj.position.sub(center);
      obj.updateMatrixWorld(true);
      const box2 = new THREE.Box3().setFromObject(obj);
      obj.position.z -= box2.min.z;
      obj.updateMatrixWorld(true);
    }

    function centerGeom(geometry: THREE.BufferGeometry) {
      geometry.computeBoundingBox();
      const bb = geometry.boundingBox!;
      const center = new THREE.Vector3(); bb.getCenter(center);
      geometry.translate(-center.x, -center.y, 0);
      geometry.computeBoundingBox();
      geometry.translate(0, 0, -geometry.boundingBox!.min.z);
    }

    function layFlat(geometry: THREE.BufferGeometry) {
      const pos = geometry.getAttribute('position');
      if (!pos) return;
      let maxArea = 0; let bestNormal = new THREE.Vector3(0,0,1);
      const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
      for (let i = 0; i < pos.count; i += 3) {
        vA.fromBufferAttribute(pos as any, i); vB.fromBufferAttribute(pos as any, i+1); vC.fromBufferAttribute(pos as any, i+2);
        const ab = new THREE.Vector3().subVectors(vB, vA); const ac = new THREE.Vector3().subVectors(vC, vA);
        const cross = new THREE.Vector3().crossVectors(ab, ac);
        const area = cross.length() * 0.5;
        if (area > maxArea) { maxArea = area; bestNormal.copy(cross.normalize()); }
      }
      const q = new THREE.Quaternion().setFromUnitVectors(bestNormal, new THREE.Vector3(0,0,1));
      geometry.applyQuaternion(q);
      geometry.computeBoundingBox();
      const h1 = geometry.boundingBox!.max.z - geometry.boundingBox!.min.z;
      const qFlip = new THREE.Quaternion().setFromUnitVectors(bestNormal, new THREE.Vector3(0,0,-1));
      const clone = geometry.clone().applyQuaternion(qFlip);
      clone.computeBoundingBox();
      const h2 = clone.boundingBox!.max.z - clone.boundingBox!.min.z;
      if (h2 < h1) { geometry.applyQuaternion(new THREE.Quaternion().invert(q)); geometry.applyQuaternion(qFlip); }
    }

    let animId: number;
    const animate = () => { controls.update(); renderer.render(scene, camera); animId = requestAnimationFrame(animate); };
    animate();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    (async () => {
      if (!arrayBufferPromise) return;
      const arrayBuffer = await arrayBufferPromise;
      const name = (file?.name || '').toLowerCase();
      if (name.endsWith('.3mf')) {
        const loader = new ThreeMFLoader();
        const obj = loader.parse(arrayBuffer as ArrayBuffer);
        obj.traverse((o: any) => { if (o.isMesh) o.material = makeMat(); });
        if (autoplace) centerGroup(obj);
        scene.add(obj);
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3(); box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const dist = (maxDim) * 1.8;
        camera.position.set(dist, dist, dist);
      } else {
        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer as ArrayBuffer);
        geometry.computeVertexNormals();
        if (autoplace) { layFlat(geometry); centerGeom(geometry); }
        geometry.computeBoundingBox();
        const size = new THREE.Vector3(); geometry.boundingBox!.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.5 / maxDim;
        geometry.scale(scale, scale, scale);
        if (autoplace) centerGeom(geometry);
        geometry.computeBoundingBox();
        const minz = geometry.boundingBox!.min.z; const maxz = geometry.boundingBox!.max.z;
        setHeightRange({ min: minz, max: maxz }); setClipZ(minz);
        const mesh = new THREE.Mesh(geometry, makeMat()); scene.add(mesh);
        geometry.computeBoundingSphere(); const r = geometry.boundingSphere?.radius || 2; const dist = r * 3.2; camera.position.set(dist, dist, dist);
      }
    })();

    return () => { cancelAnimationFrame(animId); ro.disconnect(); controls.dispose(); if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement); renderer.dispose(); };
  }, [arrayBufferPromise, autoplace]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F14]">
      <div className="flex items-center justify-between p-3 text-xs text-white/70">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={autoplace} onChange={(e)=>setAutoplace(e.target.checked)} />
          Auto: połóż na stole (beta)
        </label>
        <span>Obracaj myszką • scroll = zoom</span>
      </div>
      <div ref={mountRef} className="h-80 w-full" />
      <div className="p-4 flex items-center gap-3">
        <label className="text-sm text-white/80">Warstwa (Z):</label>
        <input type="range" className="w-full" min={heightRange.min} max={heightRange.max} step={((heightRange.max - heightRange.min) || 1) / 200} value={clipZ} onChange={(e) => setClipZ(parseFloat(e.target.value))} />
        <div className="text-xs text-white/60 w-24 text-right">{clipZ.toFixed(2)}</div>
      </div>
    </div>
  );
});
export default StlViewer;
