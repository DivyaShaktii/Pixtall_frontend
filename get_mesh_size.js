import fs from 'fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Create a DOM-less setup to parse the GLB using Three.js directly.
// Wait, GLTFLoader requires a DOM or at least a fake one.
// Let's just output a script that we run via standard node that prints out the BB of Object_183.
