import React, { useRef, useCallback, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
// expo-three import activates @expo/browser-polyfill, which sets up
// window.document + HTMLImageElement so Three.js's ImageLoader can load
// textures (data URIs → temp file) inside React Native.
import 'expo-three';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Asset } from 'expo-asset';
import { File as FSFile } from 'expo-file-system';
import { patchBlobAndURL } from '@/utils/glPolyfills';
import { Colors } from '@/constants/theme';

// Patch Blob + URL.createObjectURL before any GL work so Three.js can
// handle embedded textures in the GLB (React Native's Blob rejects ArrayBuffer).
patchBlobAndURL();

interface LogoModelProps {
  size?: number;
}

function createRenderer(gl: ExpoWebGLRenderingContext): THREE.WebGLRenderer {
  const ctx = gl as unknown as WebGLRenderingContext;
  const w = ctx.drawingBufferWidth;
  const h = ctx.drawingBufferHeight;

  const stub = {
    width: w,
    height: h,
    style: { width: '', height: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    clientWidth: w,
    clientHeight: h,
  } as unknown as HTMLCanvasElement;

  const renderer = new THREE.WebGLRenderer({
    canvas: stub,
    context: ctx,
    antialias: false,
    alpha: true,
  });
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/** Read a local asset as an ArrayBuffer using expo-file-system's native File.bytes(). */
async function readAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const file = new FSFile(uri);
  const uint8 = await file.bytes();
  // bytes() returns a view into a shared buffer; copy it to own ArrayBuffer
  return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
}

export function LogoModel({ size = 220 }: LogoModelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const rafRef = useRef<number | undefined>(undefined);

  const onContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    const renderer = createRenderer(gl);
    const ctx = gl as unknown as WebGLRenderingContext;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      ctx.drawingBufferWidth / ctx.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.4, 3.8);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const keyLight = new THREE.DirectionalLight(0xc9a84c, 2.4);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8ab4d8, 0.6);
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    try {
      // 1. Resolve asset and get a guaranteed local file:// URI
      const asset = Asset.fromModule(
        require('../../assets/images/logo model.glb')
      );
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;

      // 2. Read GLB binary via expo-file-system (bypasses RN XHR limitations)
      const arrayBuffer = await readAsArrayBuffer(uri);

      // 3. Parse with GLTFLoader — patchBlobAndURL handles embedded textures
      const gltf = await new Promise<GLTF>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.parse(arrayBuffer, '', resolve, reject);
      });

      const model = gltf.scene;

      // Centre and auto-scale to fill the viewport
      const box = new THREE.Box3().setFromObject(model);
      const centre = box.getCenter(new THREE.Vector3());
      const dims = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(dims.x, dims.y, dims.z);
      const scale = 2.4 / maxDim;
      model.scale.setScalar(scale);
      model.position.sub(centre.multiplyScalar(scale));

      scene.add(model);
      setIsLoading(false);

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        model.rotation.y += 0.006;
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();
    } catch (e) {
      console.error('[LogoModel] failed to load model:', e);
      setIsLoading(false);
    }
  }, []);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <GLView
        style={{ width: size, height: size }}
        onContextCreate={onContextCreate}
      />
      {isLoading && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ActivityIndicator style={styles.spinner} color={Colors.gold} size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    flex: 1,
  },
});
