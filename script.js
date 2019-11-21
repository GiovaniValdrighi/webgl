
var rTri = 0;
var mMatrix = mat4.create();
var mMatrixPilha = [];
var vMatrix = mat4.create();
var pMatrix = mat4.create();

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;



// Iniciar o ambiente quando a página for carregada
$(function(){
    iniciaWebGL();
    var button = document.getElementById("slider");
    button.addEventListener("input", function(){iniciarBuffers();})
});

function iniciaWebGL()
{
  var canvas = $('#webgl')[0];
  iniciarGL(canvas); // Definir como um canvas 3D
  iniciarShaders();  // Obter e processar os Shaders
  iniciarBuffers();  // Enviar o triângulo e quadrado na GPU
  iniciarAmbiente(); // Definir background e cor do objeto
  tick();   
}

function iniciarGL(canvas){
    try{
	    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	    gl.viewportWidth = canvas.width;
	    gl.viewportHeight = canvas.height;
    }catch(e){
	    if(!gl) alert("Não pode inicializar WebGL, desculpe");
    }
}

var shaderProgram;
function iniciarShaders(){
    var vertexShader = getShader(gl, "#shader-vs");
    var fragmentShader = getShader(gl, "#shader-fs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
	    alert("Não pode inicializar shaders");
    }
    
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
}
    
function getShader(gl, id){
    var shaderScript = $(id)[0];
    if(!shaderScript){
	    return null;
    }
      
    var str = "";
    var k = shaderScript.firstChild;
    while(k){
	    if(k.nodeType == 3)
	    str += k.textContent;
	    k = k.nextSibling;
    }
      
    var shader;
    if(shaderScript.type == "x-shader/x-fragment"){
	    shader = gl.createShader(gl.FRAGMENT_SHADER);
    }else if(shaderScript.type == "x-shader/x-vertex"){
	    shader = gl.createShader(gl.VERTEX_SHADER);
    }else{
	    return null;
    }
      
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
      
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
	    alert(gl.getShaderInfoLog(shader));
	    return null;
    }
    return shader;
}

function iniciarBuffers(){
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var vertices = [
        //ABC
        -0.21, -0.79, 0,//A
        0.79, 0.21, 0,//B
        -0.58, 0.58, 0,//C
        //ADB
        -0.21, -0.79, 0,//A
        0.93, -0.93, 0.82,//D
        0.79, 0.21, 0,//B
        //ADG
        -0.21, -0.79, 0,//A
        0.93, -0.93, 0.82,//D
        -0.34, -1.28, 1.32,//G
        //AGF
        -0.21, -0.79, 0,//A
        -0.34, -1.28, 1.32,//G
        -1.28, -0.34, 0.82,//F
        //AFC
        -0.21, -0.79, 0,//A
        -0.58, 0.58, 0,//C
        -1.28, -0.34, 0.82,//F
        //KIL
        0.21, 0.79, 2.14,//K
        -0.93, 0.93, 1.32,//I
        -0.79, -0.21, 2.14,//L
        //KLJ
        0.21, 0.79, 2.14,//K
        0.58, -0.58, 2.14,//J
        -0.79, -0.21, 2.14,//L
        //KJH
        0.21, 0.79, 2.14,//K
        0.58, -0.58, 2.14,//J
        1.28, 0.34, 1.32,//H
        //KHE
        0.21, 0.79, 2.14,//K
        0.34, 1.28, 0.82,//E
        1.28, 0.34, 1.32,//H
        //KEI
        0.21, 0.79, 2.14,//K
        0.34, 1.28, 0.82,//E
        -0.93, 0.93, 1.32,//I
        //ILF
        -0.93, 0.93, 1.32,//I
        -0.79, -0.21, 2.14,//L
        -1.28, -0.34, 0.82,//F
        //LGF
        -0.79, -0.21, 2.14,//L
        -0.34, -1.28, 1.32,//G
        -1.28, -0.34, 0.82,//F
        //LGJ
        -0.79, -0.21, 2.14,//L
        -0.34, -1.28, 1.32,//G
        0.58, -0.58, 2.14,//J
        //GJD
        -0.34, -1.28, 1.32,//G
        0.58, -0.58, 2.14,//J
        0.93, -0.93, 0.82,//D
        //DJH
        0.58, -0.58, 2.14,//J
        0.93, -0.93, 0.82,//D
        1.28, 0.34, 1.32,//H
        //DHB
        0.93, -0.93, 0.82,//D
        0.79,0.21, 0,//B
        1.28, 0.34, 1.32,//H
        //HEB
        1.28, 0.34, 1.32,//H
        0.34, 1.28, 0.82,//E
        0.79,0.21, 0,//B
        //BEC
        0.34, 1.28, 0.82,//E
        0.79,0.21, 0,//B
        -0.58, 0.58, 0,//C
        //CEI
        -0.58, 0.58, 0,//C
        0.34, 1.28, 0.82,//E
        -0.93, 0.93, 1.32,//I
        //CIF
        -0.58, 0.58, 0,//C
        -1.28, -0.34, 0.82,//F
        -0.93, 0.93, 1.32,//I
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 60;
    triangleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    var cores = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4;
    triangleVertexColorBuffer.numItems = 60;
    }

function iniciarAmbiente(){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

function desenharCena(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mMatrix);
    mat4.identity(vMatrix);
  
    // Desenhando Triângulo
    mat4.translate(mMatrix, [document.getElementById("x").value/10, document.getElementById("y").value/10, -document.getElementById("z").value/10]);

    mPushMatrix();
    mat4.rotate(mMatrix, degToRad(rTri), [document.getElementById("x1").checked, document.getElementById("y1").checked, document.getElementById("z1").checked]);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
    
    mPopMatrix();  
}

function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}

function tick(){
    requestAnimFrame(tick);
    desenharCena();
    animar();
}

var ultimo = 0;
function animar(){
    var agora = new Date().getTime();
    if(ultimo != 0){
        var diferenca = agora - ultimo;
        rTri  += ((90*diferenca)/1000.0) % 360.0;
    }
    ultimo = agora;
}

function mPushMatrix() {
    var copy = mat4.create();
    mat4.set(mMatrix, copy);
    mMatrixPilha.push(copy);
}

function mPopMatrix() {
    if (mMatrixPilha.length == 0) {
        throw "inválido popMatrix!";
    }
    mMatrix = mMatrixPilha.pop();
}

function degToRad(graus) {
    return graus * Math.PI / 180;
  }