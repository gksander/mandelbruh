uniform int iterations;
uniform vec2 center;
uniform float scale;
uniform float resolution;

vec2 cmul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec3 palette(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  float x = 1.0 / 3.0;
  if (t < x) return mix(c1, c2, t/x);
  else if (t < 2.0 * x) return mix(c2, c3, (t - x)/x);
  else if (t < 3.0 * x) return mix(c3, c4, (t - 2.0*x)/x);
  return c4;
}

bool val_at(vec2 pos) {
  vec2 z = vec2(0., 0.);

  for (int i = 0; i < 1000; i++) {
    if (i >= iterations) break;
    z = cmul(z, z) + pos;

    if (length(z) > 2.) {
      return true;
      // return vec3(sqrt(float(i + 1) - log(log(magnitude(z))) / log(2.)));
    }
  }
  // return vec3(z, z.x + z.y) * 5.;
  return false;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution - 0.5) * scale + center;
  bool hasEscaped = val_at(uv);

  gl_FragColor = hasEscaped ? vec4(1.0) : vec4(vec3(0.), 1.);

  // TODO: Better coloring?
  // vec3 calculated = val_at((gl_FragCoord.xy / resolution - 0.5) * scale + center);
  // gl_FragColor = vec4(sin(calculated * 0.5 + float(20) * 0.01) / 2. + 0.5, 1.0);
}