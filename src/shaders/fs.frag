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

  gl_FragColor = hasEscaped ? vec4(mix(escapeColor, transitionColor, float(escapeIteration)/float(iterations)), 1.0) : vec4(boundColor, 1.);
}
