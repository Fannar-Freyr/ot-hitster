import { useEffect, useRef } from 'react';
import { useBackground } from '@/context/BackgroundContext';

export type RGB = [number, number, number];

// Order: amberYellow, deepBlue, pink, blue, purpleHaze, swampyBlack, persimmonOrange, darkAmber
export type ShaderColors = [RGB, RGB, RGB, RGB, RGB, RGB, RGB, RGB];

export function CanvasBackground() {
  const { colors } = useBackground();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const colorLocsRef = useRef<(WebGLUniformLocation | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl')!;
    if (!gl) return;

    // Resize handling
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    // Vertex shader (simple fullscreen quad)
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // stolen from here https://www.shadertoy.com/view/DdcfzH
    const fragmentShaderSource = `
     precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec3 u_color0; // amberYellow
uniform vec3 u_color1; // deepBlue
uniform vec3 u_color2; // pink
uniform vec3 u_color3; // blue
uniform vec3 u_color4; // purpleHaze
uniform vec3 u_color5; // swampyBlack
uniform vec3 u_color6; // persimmonOrange
uniform vec3 u_color7; // darkAmber

#define filmGrainIntensity 0.05

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
    p = vec2(
        dot(p, vec2(2127.1, 81.17)),
        dot(p, vec2(1269.5, 283.37))
    );
    return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    float n = mix(
        mix(
            dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)),
            u.x
        ),
        mix(
            dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)),
            u.x
        ),
        u.y
    );

    return 0.5 + 0.5 * n;
}

float filmGrainNoise(vec2 uv) {
    return length(hash(uv));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;

    vec2 uv = fragCoord / u_resolution;
    float aspectRatio = u_resolution.x / u_resolution.y;

    vec2 tuv = uv - 0.5;

    float degree = noise(vec2(u_time * 0.05, tuv.x * tuv.y));

    tuv.y *= 1.0 / aspectRatio;
    tuv *= Rot(radians((degree - 0.5) * 720.0 + 180.0));
    tuv.y *= aspectRatio;

    float frequency = 5.0;
    float amplitude = 30.0;
    float speed = u_time * 0.002;

    tuv.x += sin(tuv.y * frequency + speed) / amplitude;
    tuv.y += sin(tuv.x * frequency * 1.5 + speed) / (amplitude * 0.5);

    float cycle = sin(u_time * 0.5);
    float t = (sign(cycle) * pow(abs(cycle), 0.6) + 1.0) / 2.0;

    vec3 color1 = mix(u_color0, u_color4, t);
    vec3 color2 = mix(u_color1, u_color5, t);
    vec3 color3 = mix(u_color2, u_color6, t);
    vec3 color4 = mix(u_color3, u_color7, t);

    vec3 layer1 = mix(
        color3, color2,
        smoothstep(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x)
    );

    vec3 layer2 = mix(
        color4, color1,
        smoothstep(-0.3, 0.2, (tuv * Rot(radians(-5.0))).x)
    );

    vec3 color = mix(layer1, layer2, smoothstep(0.5, -0.3, tuv.y));

    // Film grain
    color -= filmGrainNoise(uv) * filmGrainIntensity;

    gl_FragColor = vec4(color, 1.0);
}
    `;

    // Helper: compile shader
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Fullscreen triangle (better than quad)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    // Cache color uniform locations and set initial values.
    colorLocsRef.current = Array.from({ length: 8 }, (_, i) =>
      gl.getUniformLocation(program, `u_color${i}`),
    );
    glRef.current = gl;
    colors.forEach(([r, g, b], i) => {
      gl.uniform3f(colorLocsRef.current[i], r / 255, g / 255, b / 255);
    });

    const start = performance.now();
    let animationFrameId: number;

    const render = () => {
      const now = performance.now();
      const time = (now - start) / 1000;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // setup runs once — colors are updated via the effect below

  // Update uniforms whenever colors change without rebuilding the WebGL program.
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || colorLocsRef.current.length === 0) return;
    colors.forEach(([r, g, b], i) => {
      gl.uniform3f(colorLocsRef.current[i], r / 255, g / 255, b / 255);
    });
  }, [colors]);

  return <canvas className="fixed inset-0 pointer-events-none z-0" ref={canvasRef} />;
}
