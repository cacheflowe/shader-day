//KRC: constants defined here.  Can we #include this or something?
const float TWO_PI=6.28318531;
const float PI=3.14159265;
const float HALF_PI=1.57079633;

uniform float time; //same as vertex shader
uniform float colorPhaseAdjuster; //Just what it says.. 

//Constantly varying, PER FRAGMENT, fragment position (IMPORTANT CONCEPT):
varying vec3 adjustedPos;

vec3 generateColor(float phase)
{
  //A function to generate 3-component colors given a phase
  return vec3(cos(time/7.6656 + phase)*.5+.5,cos(time/13.133 + phase)*.5+.5,cos(time/9.112 + phase)*.5+.5);

}



//NOTE: THIS FUNCTION IS REPEATED IN BOTH FRAG AND VERT SHADERS. IS THERE A WAY TO SHARE/INCLUDE THIS, TO AVOID REPETITION?

  vec3 cartesianToSpherical(  vec3 cartesianCoord)
 {

  //KRC:
  //Funciton to convert cartesian (x,y,z) coordinates to spherical (r,theta,zenith)
  //See : http://mathworld.wolfram.com/SphericalCoordinates.html

  vec3 o; 
  float S;  
  o[0]=length(cartesianCoord); 
  S=length(cartesianCoord.xy);  
  o[1]=acos(cartesianCoord.z / o[0]);   
  float value = cartesianCoord.y/S;
  if(cartesianCoord.x>=0.0) o[2]=asin(value);
  else o[2]=PI-asin(value);
  return o; 
 }

  void main(){

    //Get the 3d coord of THIS FRAGMENT
    vec3 spherePos = cartesianToSpherical(adjustedPos);

    //Define a color from this fragment's radius (dist from center)
    vec3 c = generateColor(spherePos[0]/200.0*HALF_PI+time/100.+colorPhaseAdjuster);

    //Set the frag color. done! 
    gl_FragColor = vec4( c[0], c[1], c[2] , 1.0 );

  }

