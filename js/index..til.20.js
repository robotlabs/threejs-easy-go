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
float rect(vec2 pt, vec2 size, vec2 center){
  vec2 p = pt - center;
  vec2 halfSize = size * 0.5;
  float horz = step(-halfSize.x, p.x) - step(halfSize.x, p.x);
  float vert = step(-halfSize.y, p.y) - step(halfSize.y, p.y);
  return horz * vert;
}
float circle(vec2 pt, float radius){
  return 1.0 - step (radius, length(pt));  
}

void main (void)
{
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 vc = u_mouse / u_resolution;
  vec3 color = vec3(vc.x / u_resolution.x, 0.0, vc.y);
  vec3 color2 = vec3((sin(u_time) + 1.0) / 2.0, 0.0, (cos(u_time) + 1.0 / 2.0));
  vec3 color3 = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), uv.x );
  vec3 color4 = vec3(v_uv.x, v_uv.y, 0.0);
  vec3 color5 = vec3(v_position.x, v_position.y, 0.0);
  vec3 color6 = vec3(0.0);

  color6.r = clamp(v_position.x, 0.0, 0.2);
  color6.g = clamp(v_position.y, 0.4, 1.0);

  vec3 color7 = vec3(0.0);
  color7.r = step(vc.x * 2.0 - 1.0, v_position.x);
  color7.g =  step(1.0 - vc.y * 2.0 , v_position.y);


  vec3 color8 = vec3(0.0);
  color8.r = smoothstep(vc.x * 2.0 - 1.0,vc.x * 2.0 - 0.0, v_position.x);
  color8.g =  smoothstep(1.0 - vc.y * 2.0 ,0.0 - vc.y * 2.0, v_position.y);



  vec3 color9 = vec3(0.0, 0.0, 0.0);
  color9.r = step(length(v_position.xy) , 1.0 );
  color9.g =  step(length(v_position.xy), 1.0);
  // color9.b =  step(0.7, length(v_position.xy));

  float inCircle = 1.0 - step (1.0, length(v_position.xy));
  vec3 color10 = vec3(1.0, 1.0, 0.0) * inCircle;


  float inRect = rect(v_position.xy, vec2(1.0, 0.5), vec2(-0.5 , 0.0));
  vec3 color11 = vec3(1.0, 1.0, 0.0) * inRect;

  float square1 = rect(v_position.xy, vec2(0.3), vec2(-0.5 , 0.0));
  float square2 = rect(v_position.xy, vec2(0.4), vec2(0.2 , 0.0));
  vec3 color12 = vec3(1.0, 1.0, 0.0) * square1 + vec3(0.0, 1.0, 0.0) * square2;

  vec3 color13 = vec3(1.0, 1.0, 0.0) * circle(v_position.xy, 0.3);

  gl_FragColor = vec4(color13, 1.0); 
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
