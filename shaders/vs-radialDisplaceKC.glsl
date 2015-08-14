const float TWO_PI=6.28318531;
const float PI=3.14159265;
const float HALF_PI=1.57079633;

uniform int mode;
uniform vec3 color1;
uniform vec3 color2;
uniform float time;
uniform float displaceAmount1;
uniform float displaceAmount2;
uniform float frequency1;
uniform float frequency2;


varying float redShift,greenShift,blueShift;
varying vec4 screenPos;
varying vec3 worldPos;
varying vec3 camVec; 
varying vec3 eyeVec; 
varying vec2 texCoord;

//Materials and lights:
varying vec3 diffuseColor;  
varying vec3 specularColor; 
varying vec3 emissiveColor;  
varying vec3 ambientColor; 
varying float shininess;
varying float r;
varying vec4 diffuse, ambient;


//Utility Vectors 
vec3 va=vec3(0,0,1);
vec3 vb=vec3(0,1,0);

 

 


varying vec3 normal, lightDir, halfVector;


vec3 vertexSpherical;  	

 
 

vec4 displacedPoint;
float rand(vec2 co)
{
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

 float tri(float phase)
{
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
	if(tri(phase)<=0.0) return -1.0;
	return 1.0;

}
 
 
 vec3 sphericalToCartesian(  vec3 sphericalCoord)
 {
 	vec3 o; 
 	o.x=sphericalCoord[0]*sin(sphericalCoord[1])*cos(sphericalCoord[2]);
 	o.y=sphericalCoord[0]*sin(sphericalCoord[1])*sin(sphericalCoord[2]);
 	o.z=sphericalCoord[0]*cos(sphericalCoord[1]);
 
	 return o;
 
 }
 vec3 cartesianToSpherical(  vec3 cartesianCoord)
 {
 	vec3 o; 
 	
 	float S;
 
 	o[0]=length(cartesianCoord);
 	
 	S=length(cartesianCoord.xy);
 	
 	o[1]=acos(cartesianCoord.z / o[0]);
 	
 	
 	//o[2]=atan(cartesianCoord.y,cartesianCoord.x);
 	//return o;
 	
 	
 	float value=clamp(cartesianCoord.y/S,-1.0,1.0);
 	
 	if(cartesianCoord.x>=0.0) o[2]=asin(value);
 	else o[2]=PI-asin(value);


	
	return o;
 
 }


float f_r(float rOriginal)
{
	if(mode==0)	return rOriginal+max( cos(vertexSpherical[1]*frequency1+time)*displaceAmount1 +cos(vertexSpherical[2]*frequency2+time)*displaceAmount2,-1.00);
	if(mode==1)	return rOriginal+max( tri(vertexSpherical[1]*frequency1+time)*displaceAmount1 +tri(vertexSpherical[2]*frequency2+time)*displaceAmount2,-1.00);
	if(mode==2)	return rOriginal+max( square(vertexSpherical[1]*frequency1+time)*displaceAmount1 +square(vertexSpherical[2]*frequency2+time)*displaceAmount2,-1.00);

 	else return rOriginal;
}

float f_theta(float thetaOriginal)
{
	
 	return thetaOriginal;
 
}

float f_phi(float phiOriginal)
{
	
 	return phiOriginal;
 
}
 

void main()
{

	//texCoord = vec2(gl_TextureMatrix[0] * gl_MultiTexCoord0);
	
	//Get vertex in spherical coordinate form	
	vertexSpherical=cartesianToSpherical(gl_Vertex.xyz);
	
	
	//Transform it with the three component transform functions
	vertexSpherical[0]=abs(f_r(vertexSpherical[0]));
	vertexSpherical[1]=f_theta(vertexSpherical[1]);
	vertexSpherical[2]=f_phi(vertexSpherical[2]);
	
	r=vertexSpherical[0];
	r=max(0.0,r);
	if(rand(vec2(vertexSpherical[2],vertexSpherical[1])) < .01) 	//disco dots
	{
	//	r=r*10.0;
		//vertexSpherical[0]=rand(vec2(time/111.0,time/111.))*r*r;
	}
	//Move vertex back into cartesian coords
	displacedPoint.xzy=sphericalToCartesian(vertexSpherical);
	displacedPoint.w=1.0;//WTF does a 3space point need this component?
	worldPos=displacedPoint.xyz;
	
	//Calculate screen position
	gl_Position=gl_ModelViewProjectionMatrix * displacedPoint  ; 

	eyeVec = vec3(gl_ModelViewMatrix * gl_Vertex); 
  	
  	normal = normalize(gl_Normal + normalize( gl_Normal-worldPos.xyz));

  	

	//Recalculate normals after deformation  ////////////////////////////////////////////////////////////////////////////////

	//The vectors we'll need for this Jacobian transform:
  	vec3 tangent, transformedTangent;
  	vec3 binormal, transformedBinormal;


  	//Generate unit tangent vector U:  	
  	if(length(cross(normal,va))>length(cross(normal,vb))) 
  	{ 
  		tangent=cross(normal,va);
  	} 
  	else 
  	{ 
  		tangent = cross(normal,vb); 
  	}
  	tangent=normalize(tangent);
  	
  	//Generate binormal vector V
  	//binormal=normalize(cross(normal, tangent));
  	binormal=cross(normal,tangent);
 
	//VERIFIED - binormal and tangent are correct as of here!
 
 
 	//Convert to spherical 	
  	binormal=cartesianToSpherical(binormal);
    tangent=cartesianToSpherical(tangent);





	 //The row-major specified Jacobian Matrix :  	
	//mat3 jacobian= mat3(1.0,0.0,0.0,	0.0,1.0,0.0,	0.0,0.0,1.0   );  //Identify matrix, to simulate no displacement
  	mat3 jacobian= mat3(1.0,-displaceAmount1*sin(frequency1*vertexSpherical[1]+time)*frequency1,-displaceAmount2*sin(frequency2*vertexSpherical[2]+time)*frequency2,	0.0,1.0,0.0,	0.0,0.0,1.0   );
  		
  	//This is wrong.  I Need to create a CARTESIAN JACOBIAN, given spherical input functions. Or convert this spherical jacobian to a cartesian one.

   	
  	
  	
  	
  	//Transform the unit tangent vector ( U )
  	transformedTangent=   jacobian * tangent;

	//Transform the binormal vector ( V ) 
  	transformedBinormal = jacobian * binormal;
  	   	
  	 
  	 transformedTangent=normalize(sphericalToCartesian(transformedTangent));
  	 transformedBinormal=normalize(sphericalToCartesian(transformedBinormal));
  
  	 
  	   	
   	//Generate the new normal N' (now in cartesian coords) : 
  	vec3 transformedNormal=(cross(transformedTangent,transformedBinormal));
  	
  	normal=normalize(transformedNormal);
  	
  	
  	
	//Color and material properties ////////////////////////////////////////////////////////////////////////////////
  	
  	
  	//normal = normalize( gl_NormalMatrix * normal);  
  	
	diffuseColor  = vec3(gl_FrontMaterial.diffuse); 
	specularColor = vec3(gl_FrontMaterial.specular); 
	emissiveColor = vec3(gl_FrontMaterial.emission); 
	ambientColor  = vec3(gl_FrontMaterial.ambient); 
 	shininess     = gl_FrontMaterial.shininess; 
 	
 	
 }


 
 
 
