import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeBackground({
  isDarkTheme: propIsDarkTheme = null,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const timeRef = useRef(0);
  const rafRef = useRef(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Colors for light and dark themes
  const lightThemeColors = {
    color1: new THREE.Color("#ffffff"),
    color2: new THREE.Color("#d0d0ff"),
    color3: new THREE.Color("#5050dd"),
    color4: new THREE.Color("#0707ac"),
  };

  const darkThemeColors = {
    color1: new THREE.Color("#121212"),
    color2: new THREE.Color("#983a26"),
    color3: new THREE.Color("#ff7a60"),
    color4: new THREE.Color("#ff5533"),
  };

  // Listen for theme change events from the Astro wrapper
  useEffect(() => {
    // Handler for the custom themechange event
    const handleThemeChange = (event) => {
      console.log("ThemeChange event received:", event.detail.isDarkTheme);
      setIsDarkTheme(event.detail.isDarkTheme);
    };

    // Add event listener
    document.addEventListener("themechange", handleThemeChange);

    // Set initial theme based on document class
    const initialIsDarkTheme =
      document.documentElement.classList.contains("dark-theme");
    console.log("Initial dark theme state:", initialIsDarkTheme);
    setIsDarkTheme(initialIsDarkTheme);

    // Cleanup
    return () => {
      document.removeEventListener("themechange", handleThemeChange);
    };
  }, []);

  // Create and set up three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene if it doesn't exist
    if (!sceneRef.current) {
      // Setup three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      // Create shader material
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2() },
          color1: { value: lightThemeColors.color1 },
          color2: { value: lightThemeColors.color2 },
          color3: { value: lightThemeColors.color3 },
          color4: { value: lightThemeColors.color4 },
          scale: { value: 0.4 },
          ax: { value: 5.0 },
          ay: { value: 7.0 },
          az: { value: 9.0 },
          aw: { value: 13.0 },
          bx: { value: 1.0 },
          by: { value: 1.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec2 resolution;
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform vec3 color4;
          uniform float scale;
          uniform float ax, ay, az, aw;
          uniform float bx, by;
          varying vec2 vUv;
          
          // Noise function for generating patterns
          float cheapNoise(vec3 stp) {
            vec3 p = vec3(stp.xy, stp.z);
            vec4 a = vec4(ax, ay, az, aw);
            return mix(
              sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) * 
              cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
              sin(1.0 + p.x * a.z + p.z + cos(p.y * a.w - p.z)) * 
              cos(1.0 + p.y * a.w + p.z + cos(p.x * a.x + p.z)), 
              0.436
            );
          }
          
          void main() {
            vec2 aR = vec2(resolution.x/resolution.y, 1.0);
            vec2 st = vUv * aR * scale;
            float S = sin(time * 0.001);
            float C = cos(time * 0.005);
            vec2 v1 = vec2(cheapNoise(vec3(st, 2.0)), cheapNoise(vec3(st, 1.0)));
            vec2 v2 = vec2(
              cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * time)),
              cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * time))
            );
            float n = 0.5 + 0.5 * cheapNoise(vec3(st + v2, 0.0));
            
            vec3 color = mix(
              color1,
              color2,
              clamp((n*n)*8.0, 0.0, 1.0)
            );
            
            color = mix(
              color,
              color3,
              clamp(length(v1), 0.0, 1.0)
            );
            
            color = mix(
              color,
              color4,
              clamp(length(v2.x), 0.0, 1.0)
            );
            
            color /= n*n + n * 7.0;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      });

      // Create a simple plane to render the shader on
      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, shaderMaterial);
      scene.add(plane);

      // Store references
      sceneRef.current = { scene, camera, material: shaderMaterial };
      rendererRef.current = renderer;

      // Resize handler
      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        rendererRef.current.setSize(width, height);

        // Update shader uniforms
        shaderMaterial.uniforms.resolution.value.x = width;
        shaderMaterial.uniforms.resolution.value.y = height;
      };

      // Set initial size
      handleResize();

      // Listen for window resize
      window.addEventListener("resize", handleResize);

      // Animation function
      const animate = () => {
        timeRef.current += 0.01;

        // Update shader time uniform
        if (sceneRef.current && sceneRef.current.material) {
          sceneRef.current.material.uniforms.time.value = timeRef.current;
        }

        // Render scene
        if (rendererRef.current && sceneRef.current) {
          rendererRef.current.render(
            sceneRef.current.scene,
            sceneRef.current.camera
          );
        }

        // Continue animation loop
        rafRef.current = requestAnimationFrame(animate);
      };

      // Start animation
      animate();

      // Cleanup function
      return () => {
        window.removeEventListener("resize", handleResize);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        if (
          rendererRef.current &&
          rendererRef.current.domElement &&
          containerRef.current
        ) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current?.dispose();
        sceneRef.current?.material?.dispose();
        sceneRef.current = null;
      };
    }
  }, []);

  // Update colors when theme changes
  useEffect(() => {
    if (!sceneRef.current || !sceneRef.current.material) return;

    console.log(
      "ThreeBackground - Applying theme:",
      isDarkTheme ? "dark" : "light"
    );
    const colors = isDarkTheme ? darkThemeColors : lightThemeColors;
    const material = sceneRef.current.material;

    // Update shader uniforms with new colors
    material.uniforms.color1.value = colors.color1;
    material.uniforms.color2.value = colors.color2;
    material.uniforms.color3.value = colors.color3;
    material.uniforms.color4.value = colors.color4;
  }, [isDarkTheme]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: -1,
        overflow: "hidden",
      }}
    />
  );
}
