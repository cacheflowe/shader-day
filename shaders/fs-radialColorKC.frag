varying vec4 eyePosition; 
varying vec3 normal; 
varying vec3 diffuseColor; 
varying vec3 specularColor; 
varying vec3 emissiveColor; 
varying vec3 ambientColor; 
varying float shininess; 
varying vec4 screenPos;
varying float redShift,greenShift,blueShift;
varying vec3 worldPos;
varying float r;

uniform int mode;
uniform vec3 color1;
uniform vec3 color2;


varying vec2 texCoord;



void main()
{
	vec3 color=mix(color1,color2,abs(r));
	gl_FragColor=vec4( color.r, color.g, color.b, 1.0);



}
 
 
 
 