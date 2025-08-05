const vshader = `
varying vec2 v_uv;
varying vec3 v_position;
void main() {	
  v_uv = uv;
  v_position = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position * 1.0, 1.0 );
}
`;
const fshader = `
uniform vec3 u_color;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_uv;
varying vec3 v_position;

// returns 1.0 when point, pt, i s inside a rectangle defined by size and center
float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center){
  vec2 p = pt - center;
  vec2 halfSize = size * 0.5;
  float horz = step(-halfSize.x - anchor.x, p.x) - step(halfSize.x - anchor.x, p.x);
  float vert = step(-halfSize.y - anchor.y, p.y) - step(halfSize.y - anchor.y, p.y);
  return horz * vert;
}
float circle(vec2 pt, float radius){
  return 1.0 - step (radius, length(pt));  
} 

// rotate the guy around an anchor point
mat2 getRotationMatrix(float theta){
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, -s, s, c);
}
mat2 getScaleMatrix(float scale){
  return mat2(scale, 0, 0, scale);
}

void main2 (void)
{
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 vc = u_mouse / u_resolution;
 
  vec3 color = vec3(1.0, 1.0, 0.0) * circle(v_position.xy, (sin(u_time) + 1.0) * 0.25);

  float tileCount = 6.0;
  vec2 center = vec2(0.5);
  vec2 size = vec2(0.4);
  mat2 matR = getRotationMatrix(u_time);
  mat2 matS = getScaleMatrix((sin(u_time) + 1.0) / 3.0 + 0.5);
  vec2 p = fract(v_uv * tileCount);
  vec2 pt = matR * matS * (p - center) + center;
  vec2 pt2 = matR * (p - center) + center;
  vec2 anchor = vec2(0.0);
  float square1 = rect(pt2, anchor, size, center);
  vec3 color2 = vec3(1.0, 1.0, 0.0) * square1;

  gl_FragColor = vec4(color2, 1.0); 
}

float circle2(vec2 pt, vec2 center, float radius, bool soften){
  vec2 p = pt -center;
  float edge = (soften) ? radius * 0.9 : 0.0;
  return 1.0 - smoothstep (radius - edge, radius + edge,  length(p));  
} 

float circle2(vec2 pt, vec2 center, float radius, float line_width){
  vec2 p = pt -center;
  float len = length(p);
  float half_line_width = line_width / 2.0;
  return step(radius - half_line_width, len) - step(radius + half_line_width, len);
} 

float line(float a, float b, float line_width, float edge_thickness){
  float half_line_width = line_width * 0.5;
  return smoothstep(a - half_line_width - edge_thickness, a - half_line_width, b) - smoothstep(a + half_line_width, a + half_line_width + edge_thickness, b);
}
void main (void)
{
  vec2 uv = gl_FragCoord.xy / 1.0;
  vec2 vc = u_mouse / u_resolution;
 
  vec3 color = vec3(1.0, 1.0, 0.0) * circle(v_position.xy, (sin(u_time) + 1.0) * 0.25);

  float tileCount = 6.0;
  vec2 center = vec2(0.5, 0.5);
  vec2 size = vec2(0.4);
  mat2 matR = getRotationMatrix(u_time);
  mat2 matS = getScaleMatrix((sin(u_time) + 1.0) / 3.0 + 0.5);
  vec2 p = fract(v_uv * tileCount); 
  vec2 pt = (matR  * matS *  (p - center)) + center;
  vec2 anchor = vec2(0.0);
  float square1 = rect(pt, anchor, size, center);
  vec3 color2 = vec3(1.0, 1.0, 0.0) * square1;

  float myC1 = circle2(v_position.xy, vec2(-0.2), 0.2, true);
  float myC2 = circle2(v_position.xy, vec2(0.5), 0.1, 0.01);
  vec3 color3 = vec3(1.0, 1.0, 0.0) * myC2 + vec3(1.0, 0.0, 0.0) * myC1;


  float myLine = line(v_position.x,v_position.y , 0.01, 0.001);
  float myLine2 = line(-v_position.x,v_position.y , 0.01, 0.001);
  float myLine3 = line(uv.x, uv.y, 10.0, 0.001);
  float myLine4 = line(uv.x, uv.y - 0.1, 10.0, 0.001);
  vec3 color4 = vec3(1.0, 1.0, 0.0) * myLine + vec3(1.0, 1.0, 0.0) * myLine2 + vec3(0.0, 1.0, 0.0) * myLine4;

  float px = (v_position.x + 1.0) * 0.5;
  float progress = fract(u_time * 0.2);      // cycles 0→1 every 5 seconds
  float growMask = step(px, progress); 

  float myLine5 = line(v_position.y, mix(-0.5, 0.5, (sin(v_position.x * 3.1415) + 1.0) / 2.0), 0.05, 0.002);
  vec3 color5 = vec3(1.0, 1.0, 0.0) * myLine5 * growMask;
  
  gl_FragColor = vec4(color5, 1.0); 
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const uniforms = {
  u_color: { value: new THREE.Color(0xff0099) },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0, y: 0 } },
};

const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;

onWindowResize();
if ("ontouchstart" in window) {
  document.addEventListener("touchmove", move);
} else {
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", move);
}

function move(evt) {
  uniforms.u_mouse.value.x = evt.touches ? evt.touches[0].clientX : evt.clientX;
  uniforms.u_mouse.value.y = evt.touches ? evt.touches[0].clientY : evt.clientY;
  console.log(uniforms.u_mouse.value.x);
}

animate();

function onWindowResize(event) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
}

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value += clock.getDelta();
  renderer.render(scene, camera);
}
