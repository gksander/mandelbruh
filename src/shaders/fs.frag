uniform int iterations;
uniform vec2 center;
uniform float scale;
uniform float resolution;

uniform vec3 boundColor;
uniform vec3 transitionColor;
uniform vec3 escapeColor;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

/* Linearly interpolate between the four given colors. */
vec3 palette(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  float x = 1.0 / 3.0;
  if (t < x) return mix(c1, c2, t/x);
  else if (t < 2.0 * x) return mix(c2, c3, (t - x)/x);
  else if (t < 3.0 * x) return mix(c3, c4, (t - 2.0*x)/x);
  return c4;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 c = center + uv * (1. / scale);

  vec2 z = vec2(0., 0.);
  bool hasEscaped = false;

  int escapeIteration;
  for (int i = 0; i < 1000; i++) {
    if (i >= iterations) break;
    z = cmul(z, z) + c;

    if (length(z) > 2.) {
      escapeIteration = i;
      hasEscaped = true;
      break;
    }
  }

  // vec3 transitionColor = vec3(0.02, 0.02, 0.03);
  // vec3 escapeColor = vec3(0.1, 0.2, 0.3);
  // vec3 color3 = vec3(0.0, 0.3, 0.2);
  // vec3 color4 = vec3(0.0, 0.5, 0.8);

  // #4D80CC

  // A debug grid
  // for (int i = 0; i < 5; i++) {
  //   for (int j = 0; j < 5; j++) {
  //     if (length(c - vec2(i, j)) < 0.01) {
  //       gl_FragColor = vec4(vec3(1., 0., 0.), 1.);
  //       return;
  //     }
  //   }
  // }

  // // Testing points
  // if (length(c - vec2(0.256, -0.00133)) < 0.01) {
  //   gl_FragColor = vec4(vec3(1., 0., 1.), 1.);
  //   return;
  // }

  gl_FragColor = hasEscaped ? vec4(mix(escapeColor, transitionColor, float(escapeIteration)/float(iterations)), 1.0) : vec4(boundColor, 1.);
}
