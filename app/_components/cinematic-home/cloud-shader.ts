export const cloudVertex = `
varying vec3 vLocal;
void main() {
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

export const cloudFragment = `
precision highp float;
varying vec3 vLocal;
uniform vec3 uCamera;
uniform float uProgress;
uniform mat4 uViewProjection;
uniform mat4 uModel;
float hash(vec3 p) {
  p=fract(p*.3183099+vec3(.11,.37,.79));
  p*=17.;
  return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
}
float noise(vec3 p) {
  vec3 i=floor(p), f=fract(p);
  f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float smoothUnion(float a,float b,float k) {
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}
float ellipsoid(vec3 p,vec3 r) {
  float k0=length(p/r), k1=length(p/(r*r));
  return k0*(k0-1.)/max(k1,.001);
}
float cloudField(vec3 p) {
  float head=ellipsoid(p-vec3(-1.,60.,0.),vec3(22.,10.,19.));
  for(int i=0;i<7;i++) {
    float angle=float(i)*.897598;
    vec3 center=vec3(cos(angle)*18.,59.+sin(float(i)*2.17)*2.8,sin(angle)*15.);
    head=smoothUnion(head,ellipsoid(p-center,vec3(9.,7.5,8.)),2.5);
  }
  float y=clamp(p.y/56.,0.,1.);
  vec2 center=vec2(sin(p.y*.16)*1.2,cos(p.y*.11)*1.5);
  float radius=4.4+sin(p.y*.34)*.4+pow(y,7.)*8.;
  float stem=max(length(p.xz-center)-radius,abs(p.y-28.)-28.);
  float field=smoothUnion(head,stem,4.5);
  float billow=noise(p*.23+vec3(0,uProgress*.6,0))*2.2+noise(p*.63)*.85;
  return field+billow-1.55;
}
vec2 bounds(vec3 origin,vec3 ray) {
  vec3 inverse=1./ray;
  vec3 first=(vec3(-36.,-2.,-31.)-origin)*inverse;
  vec3 second=(vec3(36.,76.,31.)-origin)*inverse;
  vec3 nearPlane=min(first,second), farPlane=max(first,second);
  return vec2(max(max(nearPlane.x,nearPlane.y),nearPlane.z),min(min(farPlane.x,farPlane.y),farPlane.z));
}
void main() {
  vec3 ray=normalize(vLocal-uCamera);
  vec2 interval=bounds(uCamera,ray);
  float travel=max(0.,interval.x);
  float opacity=0.;
  float hitTravel=-1.;
  vec3 color=vec3(0.);
  vec3 light=normalize(vec3(-.7,1.,.35));
  for(int step=0;step<64;step++) {
    if(travel>interval.y || opacity>.97) break;
    vec3 p=uCamera+ray*travel;
    float field=cloudField(p);
    float stepSize=clamp(field*.65,.9,3.5);
    float density=(1.-smoothstep(-1.6,1.0,field))*.38;
    if(density>.002) {
      if(hitTravel<0.) hitTravel=travel;
      float shade=clamp((cloudField(p+light*2.3)-field)/2.3,.0,1.);
      float tone=.008+shade*shade*.35+smoothstep(.58,.84,shade)*.32;
      float alpha=1.-exp(-density*stepSize);
      color+=(1.-opacity)*alpha*vec3(tone);
      opacity+=(1.-opacity)*alpha;
    }
    travel+=stepSize;
  }
  if(opacity<.005) discard;
  vec4 clip=uViewProjection*uModel*vec4(uCamera+ray*hitTravel,1.);
  gl_FragDepth=clip.z/clip.w*.5+.5;
  gl_FragColor=vec4(color/max(opacity,.001),opacity);
}`
