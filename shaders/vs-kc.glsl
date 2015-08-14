//Define common constants:
const float TWO_PI=6.28318531;
const float PI=3.14159265;
const float HALF_PI=1.57079633;

//Define varying variables that will need to change per-fragment:
varying vec3 adjustedPos; //This vertex position, deformed

//Define uniform variables that only change once per frame
uniform int waveModeTheta;	//Simply to change waveforms from the main app 
uniform int waveModeZenith;	//Simply to change waveforms from the main app 

uniform float time;	//Updated +1 per frame in JS (PROTIP: always do that)

///////////////////// HELPER FUNCTIONS : CAN THESE BE INCLUDED IN THAT SNIPPET FEATURE? ////////////////

///// WAVEFORMS :

 float tri(float phase)
{
	//KRC:
 	//Funciton to output a triangle wave with same period and amplitude as cosine

	float ramppoint;
  	phase =mod(phase,TWO_PI);
  	ramppoint=mod(phase,HALF_PI)/(HALF_PI);  
  	if(phase>=0.0 && phase<HALF_PI)  return(phase/HALF_PI);
  	else if(phase>=HALF_PI && phase<PI) return(1.-ramppoint);
  	else if(phase>=PI && phase<(HALF_PI*3.0))  return(-ramppoint);
  	else if(phase>=(HALF_PI*3.0) && phase<=TWO_PI)   return(-1.+ramppoint);
  	else return(1.0);
}

float square(float phase)
{
  	//KRC:
 	//Funciton to output a square wave within same period and amplitude as cosine

	if(tri(phase)<=0.0) return -1.0;
	return 1.0;
}
 

 ///// COORDINATE CONVERSION :

 vec3 sphericalToCartesian(  vec3 sphericalCoord)
 {
  	//KRC:
 	//Funciton to convert spherical (r,theta,zenith) coordinates to cartesian (x,y,z) 
 	//See : http://mathworld.wolfram.com/SphericalCoordinates.html

 	vec3 o; //output vector
 	o.x=sphericalCoord[0]*sin(sphericalCoord[1])*cos(sphericalCoord[2]);
 	o.y=sphericalCoord[0]*sin(sphericalCoord[1])*sin(sphericalCoord[2]);
 	o.z=sphericalCoord[0]*cos(sphericalCoord[1]);
	return o; 
 }

 vec3 cartesianToSpherical(  vec3 cartesianCoord)
 {

 	//KRC:
 	//Funciton to convert cartesian (x,y,z) coordinates to spherical (r,theta,zenith)
 	//See : http://mathworld.wolfram.com/SphericalCoordinates.html

 	vec3 o; //output vector 	
 	o[0]=length(cartesianCoord); 
 	float S=length(cartesianCoord.xy); 	
 	o[1]=acos(cartesianCoord.z / o[0]); 	
 	float value = cartesianCoord.y/S;
 	if(cartesianCoord.x>=0.0) o[2]=asin(value);
 	else o[2]=PI-asin(value);
	return o; 
 }

///////////////////// END HELPER FUNCTIONS //////////////////////////////////////////////


void main(){

	//KRC:
	//Let's take this vertex and deform it based on it's radius from center


	//First, convert this vertex position to spherical coords (cuz we want it's radius):
	vec3 newPos = cartesianToSpherical(position);

	//Next, get a displacement amount based on the SPHERICAL coordinate of this vertex:
  	float radPush;
  	if(waveModeTheta == 0) radPush = tri(newPos.y*10.0+time)*50.; 
  	else if(waveModeTheta == 1) radPush = cos(newPos.y*10.0+time)*50.; 
  	else if(waveModeTheta == 2) radPush = square(newPos.y*10.0+time)*50.; 
  	else if(waveModeTheta == 3) radPush = atan(newPos.y*10.0+time)*50.; 


  	//Lets create another displacement, this time perodic from domain of zenith:
	float radPush2;
	if(waveModeZenith == 0) radPush2 = tri(newPos.z*6.0+time)*50.; 
  	else if(waveModeZenith == 1) radPush2 = cos(newPos.z*7.0+time)*50.; 
  	else if(waveModeZenith == 2) radPush2 = square(newPos.z*3.0+time)*50.; 
  	else if(waveModeZenith == 3) radPush2 = atan(newPos.z*4.0+time)*50.; 


	//PS: The numbers above are hard-coded magic numbers, designed to work well with the sphere we created in JS which had a radius of 200. Detect this? Broadcast this?

	//Create a NEW position, created as a displacement of the original (spherical) vertex position:
  	adjustedPos[0] = newPos[0]+radPush+radPush2;
  	adjustedPos[1] = newPos[1];
  	adjustedPos[2] = newPos[2];


  	//Convert these spherical coords back to cartesian, as required by the final step..
	vec3 finalPos = sphericalToCartesian(adjustedPos);


	//Standard projection matrix stuff:
 	vec4 mvPos = modelViewMatrix * vec4( finalPos, 1.0 );
  	gl_Position = projectionMatrix * mvPos;

}

