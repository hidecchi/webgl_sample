import * as THREE from "three";

const vshader = `
out vec2 v_uv;
out vec3 v_position;
void main() { 
  v_uv = uv;
  v_position = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( v_position, 1.0 );
}

`;
const fshader = `

uniform float u_scrollAmount;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;

in vec2 v_uv;
in vec3 v_position;

void main (void)
{
  float standpont = u_scrollAmount * 0.0003 - 0.8;
  float y = v_position.y;
  float x = v_position.x;
  float y_dis = abs(y - standpont);

  float buffer = 0.1- y_dis * y_dis;
  float x_distort= (buffer < 0.0) ? 0.0 : buffer;
  float buffer2= 1.0- standpont * standpont;
  float y_adjust= (buffer2- 0.75) * 4.0;
  vec2 result_uv = v_uv - vec2(x * y_adjust * x_distort * x_distort * x_distort * x_distort *3000.0 , 0.0);
  
  float mixture = smoothstep(0.0, 1.0, (y - standpont) * 3.0);

  // 二つのテクスチャから色をサンプリング
  vec4 color1 = texture(u_tex1, result_uv);
  vec4 color2 = texture(u_tex2, result_uv);
  
  // 透明度を設定して重ね合わせる
  vec4 finalColor = color1 * mixture + color2 * (1.0 - mixture);  
  // 最終的な色を出力
  gl_FragColor = finalColor;

}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(1, 1, 4, 4);
const uniforms = {
  u_tex1: {
    value: new THREE.TextureLoader().load(
      "https://fastly.picsum.photos/id/326/2000/2000.jpg?hmac=I0k8WfN6dMRPjMnkbBKagjuLBBfKgt9j_N_YvHNe7Js"
    ),
  },
  u_tex2: {
    value: new THREE.TextureLoader().load(
      "https://fastly.picsum.photos/id/755/2000/2000.jpg?hmac=Dpq9LDLwcVfAWDH7FF45J4UkWaNo5LYJRFmsAQiiHkg"
    ),
  },
  u_scrollAmount: { value: 0.0 },
};

const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;
uniforms.u_scrollAmount.value = window.pageYOffset;

function onWindowResize(event) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 2 / 1.5) {
    console.log("resize: Use width");
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    console.log("resize: Use height");
    height = 1.5 / 2;
    width = (window.innerWidth / window.innerHeight) * height;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

window.addEventListener("load", function () {
  renderer.render(scene, camera);
});
onWindowResize();
window.addEventListener("resize", onWindowResize);

window.addEventListener("scroll", function () {
  uniforms.u_scrollAmount.value = this.window.pageYOffset;
  renderer.render(scene, camera);
});
