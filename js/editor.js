// ====== CONFIGURACIÓN DE LOS GRUPOS DE SLIDERS ======
const sliderGroups = {
    "topmask": { title: "Editing Top Mask Color", sliders: [
        { id: "oR", label: "Red", min: -1, max: 1, val: 0 },
        { id: "oG", label: "Green", min: -1, max: 1, val: 0 },
        { id: "oB", label: "Blue", min: -1, max: 1, val: 0 },
        { id: "oA", label: "Alpha", min: -1, max: 1, val: 0 }
    ]},
    "spritecolor": { title: "Editing Sprite Color", sliders: [
        { id: "sR", label: "Red", min: -1, max: 1, val: 0 },
        { id: "sG", label: "Green", min: -1, max: 1, val: 0 },
        { id: "sB", label: "Blue", min: -1, max: 1, val: 0 },
        { id: "sA", label: "Alpha", min: -1, max: 1, val: 0 }
    ]},
    "lightcolor": { title: "Editing Light Color", sliders: [
        { id: "iR", label: "Red", min: -1, max: 1, val: 0 },
        { id: "iG", label: "Green", min: -1, max: 1, val: 0 },
        { id: "iB", label: "Blue", min: -1, max: 1, val: 0 },
        { id: "iA", label: "Alpha", min: -2, max: 2, val: 0 }
    ]},
    "lightparams": { title: "Editing Light Parameters", sliders: [
        { id: "ang", label: "Angle", min: 0, max: 360, val: 0 },
        { id: "dist", label: "Size", min: 0, max: 100, val: 0 },
        { id: "lyr", label: "Layer Number", min: 0, max: 100, val: 0 },
        { id: "sep", label: "Layer Separation", min: 0, max: 100, val: 0 }
    ]},
    "spritesettings": { title: "Editing Sprite Settings", sliders: [
        { id: "hue", label: "Hue rotation", min: 0, max: 360, val: 0 },
        { id: "sat", label: "Saturation", min: -100, max: 100, val: 0 },
        { id: "bri", label: "Brightness", min: -100, max: 100, val: 0 },
        { id: "con", label: "Contrast", min: -100, max: 100, val: 0 }
    ]}
};

// El ORDEN EXACTO para los 20 parámetros
const paramOrder = ["oA","oR","oG","oB", "sA","sR","sG","sB", "iA","iR","iG","iB", "ang","dist","lyr","sep", "hue","sat","bri","con"];

let currentValues = {};
let hasUnsavedChanges = false;

// Cargar datos de LocalStorage si estamos editando un shader guardado
const savedParams = localStorage.getItem("currentShaderParams");
if (savedParams) {
    // Convierte el string "0,1,0.5..." en un array y lo asigna a los valores
    const paramArray = savedParams.split(',').map(Number);
    paramOrder.forEach((id, index) => {
        currentValues[id] = paramArray[index] || 0;
    });
} else {
    // Valores por defecto a 0
    paramOrder.forEach(id => currentValues[id] = 0);
}

// ====== UI Y MENÚS ======
let activeGroup = "topmask";
const slidersContainer = document.getElementById('sliders-container');
const editorTitle = document.getElementById('editor-title');

function renderSliders(groupKey) {
    activeGroup = groupKey;
    const group = sliderGroups[groupKey];
    editorTitle.innerText = group.title;
    slidersContainer.innerHTML = '';

    group.sliders.forEach(s => {
        const div = document.createElement('div');
        div.className = 'slider-group';
        const range = s.max - s.min;
        const currentVal = currentValues[s.id];
        const pct = ((currentVal - s.min) / range) * 100;

        div.innerHTML = `
            <label>${s.label}</label>
            <div class="slider-row">
                <div class="value-box" id="valBox-${s.id}">${currentVal.toFixed(2)}</div>
                <input type="range" id="${s.id}" min="${s.min}" max="${s.max}" step="0.01" value="${currentVal}" style="--pct: ${pct}%">
            </div>
        `;
        slidersContainer.appendChild(div);

        document.getElementById(s.id).addEventListener('input', (e) => {
            currentValues[s.id] = parseFloat(e.target.value);
            document.getElementById(`valBox-${s.id}`).innerText = currentValues[s.id].toFixed(2);
            e.target.style.setProperty('--pct', `${((currentValues[s.id] - s.min) / range) * 100}%`);
            hasUnsavedChanges = true; // Marcar que hubo cambios
        });
    });
}

// Eventos del Menú "Edit"
document.querySelectorAll('[data-group]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        renderSliders(e.target.getAttribute('data-group'));
        e.target.closest('.dropdown').style.display = 'none'; 
        setTimeout(()=> e.target.closest('.dropdown').style.display = '', 100);
    });
});

// Eventos del Menú "Reset" con ADVERTENCIA
document.querySelectorAll('[data-reset]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("¿Estás seguro de que quieres reiniciar estos valores a 0?")) {
            const groupKey = e.target.getAttribute('data-reset');
            sliderGroups[groupKey].sliders.forEach(s => currentValues[s.id] = s.val); // Reset a defecto (0)
            if (activeGroup === groupKey) renderSliders(groupKey); // Actualizar pantalla
            hasUnsavedChanges = true; // El reseteo también cuenta como cambio
        }
        e.target.closest('.dropdown').style.display = 'none'; 
        setTimeout(()=> e.target.closest('.dropdown').style.display = '', 100);
    });
});

// Inicializar UI
renderSliders("topmask");

// ====== OPCIONES (GUARDAR Y SALIR) ======
// Capturar una versión miniatura del canvas para el menú
// Capturar el canvas directamente en calidad original (100% nítido y pixel-perfect)
// ====== COPIAR Y PEGAR CÓDIGO (COMPATIBLE CON TURBOWARP) ======

// COPIAR CÓDIGO
document.getElementById('menu-copy-code').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Obtiene los 20 parámetros en el orden exacto
    const values = paramOrder.map(id => currentValues[id]);
    
    // Lo convierte en texto (ej: "0,0,1,0, ...") quitando decimales muy largos
    const codeString = values.map(v => Number.isInteger(v) ? v : Number(v.toFixed(3))).join(',');
    
    // Intenta copiar al portapapeles del dispositivo
    navigator.clipboard.writeText(codeString).then(() => {
        alert("¡Código copiado al portapapeles!\n" + codeString);
    }).catch(err => {
        // Plan B por si el móvil bloquea el portapapeles automático
        prompt("Copia este código manualmente:", codeString);
    });

    // Ocultar el menú desplegable (truco visual)
    e.target.closest('.dropdown').style.display = 'none'; 
    setTimeout(()=> e.target.closest('.dropdown').style.display = '', 100);
});

// IMPORTAR CÓDIGO
document.getElementById('menu-import-code').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Preguntar al usuario por el código
    const codeString = prompt("Pega aquí el código del shader (20 dígitos separados por comas):");
    
    if (codeString && codeString.trim() !== "") {
        // Separar el texto por comas y convertir a números
        const p = codeString.split(',').map(n => Number(n) || 0);
        
        // Asignar los números a nuestros valores actuales siguiendo el orden oficial
        paramOrder.forEach((id, index) => {
            currentValues[id] = p[index] || 0;
        });
        
        hasUnsavedChanges = true; // Marcar que hay cambios sin guardar
        
        // Actualizar la interfaz (los sliders) para que reflejen los nuevos números
        renderSliders(activeGroup); 
        
        alert("¡Código importado con éxito!");
    }
    
    // Ocultar el menú desplegable (truco visual)
    e.target.closest('.dropdown').style.display = 'none'; 
    setTimeout(()=> e.target.closest('.dropdown').style.display = '', 100);
});

function getThumbnailBase64() {
    return canvas.toDataURL('image/png');
}

document.getElementById('menu-save').addEventListener('click', () => {
    // Generar la cadena de 20 parámetros
    const paramsString = paramOrder.map(id => currentValues[id]).join(',');
    const shaderName = localStorage.getItem("currentShaderName") || "Untitled";
    const shaderId = localStorage.getItem("currentShaderId") || Date.now().toString();
    
    // 📸 Tomar la foto miniatura
    const thumbnailData = getThumbnailBase64();
    
    let projects = JSON.parse(localStorage.getItem('ShaderBaker_Projects')) || [];
    const existingIndex = projects.findIndex(p => p.id === shaderId);
    
    if (existingIndex >= 0) {
        projects[existingIndex].params = paramsString;
        projects[existingIndex].name = shaderName;
        projects[existingIndex].thumbnail = thumbnailData; // Guardar la miniatura
    } else {
        projects.push({ 
            id: shaderId, 
            name: shaderName, 
            params: paramsString, 
            thumbnail: thumbnailData // Guardar la miniatura
        });
        localStorage.setItem("currentShaderId", shaderId);
    }

    try {
        localStorage.setItem('ShaderBaker_Projects', JSON.stringify(projects));
        hasUnsavedChanges = false;
        alert(`¡Shader "${shaderName}" guardado correctamente!`);
    } catch (e) {
        alert("Error al guardar: Memoria llena. Borra algunos shaders viejos.");
    }
});

document.getElementById('menu-exit').addEventListener('click', () => {
    // Advertencia de cambios sin guardar
    if (hasUnsavedChanges) {
        if (!confirm("⚠️ Tienes cambios sin guardar. ¿Estás seguro de que quieres salir y perderlos?")) {
            return; // Si dice que no, cancelamos la salida
        }
    }
    window.location.href = 'index.html';
});

// Prevenir cierre de pestaña accidental
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// ====== LÓGICA DE ARCHIVOS (SPRITES Y FONDOS) ======

// === NUEVAS VARIABLES PARA ANIMACIÓN ===
const xmlLoader = document.getElementById('xmlLoader');
const animCanvas = document.getElementById('animcanvas');
const animCtx = animCanvas.getContext('2d');
const animSelect = document.getElementById('anim-select');
const animSelectorContainer = document.getElementById('anim-selector-container');

let animations = {}; // Guardará todas las animaciones separadas
let currentAnimName = null;
let currentFrameIdx = 0;
let isAnimating = false;

// Botón del menú para clickear el input oculto
document.getElementById('menu-load-xml').addEventListener('click', (e) => {
    e.preventDefault();
    if(!isImageLoaded) return alert("¡Por favor carga el PNG (Sprite) primero antes que el XML!");
    xmlLoader.click();
});

// LECTOR DE XML (Estilo Sparrow V2 / FNF)
xmlLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(event.target.result, "text/xml");
        const subTextures = xmlDoc.getElementsByTagName("SubTexture");
        
        animations = {}; // Limpiar animaciones viejas
        
        // Recorrer todos los recortes del XML
        for (let i = 0; i < subTextures.length; i++) {
            const st = subTextures[i];
            const rawName = st.getAttribute("name");
            
            // FNF nombra los frames tipo "idle0000", "idle0001". Le quitamos los números finales para agruparlos
            const animName = rawName.replace(/[0-9]+$/, ""); 
            
            if (!animations[animName]) {
                animations[animName] = [];
            }
            
            // Guardar los datos de recorte
            animations[animName].push({
                x: parseInt(st.getAttribute("x")),
                y: parseInt(st.getAttribute("y")),
                w: parseInt(st.getAttribute("width")),
                h: parseInt(st.getAttribute("height")),
                frameX: parseInt(st.getAttribute("frameX")) || 0,
                frameY: parseInt(st.getAttribute("frameY")) || 0,
                frameW: parseInt(st.getAttribute("frameWidth")) || parseInt(st.getAttribute("width")),
                frameH: parseInt(st.getAttribute("frameHeight")) || parseInt(st.getAttribute("height"))
            });
        }
        
        // Llenar el menú desplegable con las animaciones encontradas
        animSelect.innerHTML = '';
        for (let name in animations) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.innerText = name;
            animSelect.appendChild(opt);
        }
        
        // Activar el modo animación
        if(Object.keys(animations).length > 0) {
            animSelectorContainer.style.display = 'block';
            currentAnimName = Object.keys(animations)[0];
            
            // Ocultar el WebGL gigante y mostrar nuestro Canvas animado
            canvas.style.opacity = '0'; // Lo ponemos transparente pero sigue funcionando
            animCanvas.style.display = 'block';
            isAnimating = true;
        }
    };
    reader.readAsText(file);
});

// Cambiar de animación desde el menú desplegable
animSelect.addEventListener('change', (e) => {
    currentAnimName = e.target.value;
    currentFrameIdx = 0;
});

// === EL MOTOR DE ANIMACIÓN (Se ejecuta a 24 FPS) ===
setInterval(() => {
    if (!isAnimating || !currentAnimName || !animations[currentAnimName]) return;
    
    const frames = animations[currentAnimName];
    const frame = frames[currentFrameIdx];
    
    // Ajustar el tamaño del canvas animado al tamaño original de la animación
    animCanvas.width = frame.frameW;
    animCanvas.height = frame.frameH;
    
    // Limpiar frame anterior
    animCtx.clearRect(0, 0, animCanvas.width, animCanvas.height);
    
    // Calcular offsets de FNF para que no tiemble
    const destX = Math.abs(frame.frameX);
    const destY = Math.abs(frame.frameY);
    
    // TRUCO MAESTRO: Dibujamos en el 2D Canvas copiando un pedacito del WebGL Canvas ya horneado
    animCtx.drawImage(
        canvas, // Origen: El canvas WebGL oculto con shaders
        frame.x, frame.y, frame.w, frame.h, // Recorte: x, y, ancho, alto
        destX, destY, frame.w, frame.h // Destino en el nuevo canvas
    );
    
    // Avanzar al siguiente frame
    currentFrameIdx++;
    if(currentFrameIdx >= frames.length) currentFrameIdx = 0;

}, 1000 / 24); // 24 FPS (Velocidad estándar de FNF)

const imageLoader = document.getElementById('imageLoader');
const bgLoader = document.getElementById('bgLoader');
const canvas = document.getElementById('glcanvas');

document.getElementById('menu-load-sprite').addEventListener('click', () => imageLoader.click());
document.getElementById('menu-load-bg').addEventListener('click', () => bgLoader.click());
document.getElementById('menu-reset-bg').addEventListener('click', () => {
    canvas.style.backgroundImage = 'none';
    canvas.style.backgroundColor = 'transparent';
});
// ====== DESCARGAR / EXPORTAR ======
document.getElementById('menu-download').addEventListener('click', () => {
    if (!isImageLoaded) return alert("¡No hay imagen para exportar!");

    // 1. Forzar a la tarjeta gráfica a renderizar en este exacto milisegundo
    renderShader(); 

    // 2. Crear un canvas 2D temporal en la memoria (es mucho más estable que WebGL)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // 3. Dibujar el resultado del WebGL en el canvas 2D
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Tomar la foto desde el canvas 2D (¡Adiós cuadros negros!)
    const finalDataUrl = tempCanvas.toDataURL('image/png');
    
    // Detectar si es un móvil (iOS/Android) o una PC
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // En móviles (iOS/Android) abrimos el Modal para que mantengan presionado
        const modal = document.getElementById('export-modal');
        if (modal) {
            document.getElementById('export-result-img').src = finalDataUrl;
            modal.style.display = 'flex';
        }
    } else {
        // En PC descargamos directamente
        const link = document.createElement('a');
        link.download = 'Shader_Export.png';
        link.href = finalDataUrl;
        link.click();
    }
});

// Botón para cerrar el modal de exportación (Si existe en el HTML)
const btnCloseExport = document.getElementById('btn-close-export');
if (btnCloseExport) {
    btnCloseExport.addEventListener('click', () => {
        document.getElementById('export-modal').style.display = 'none';
    });
}

// ====== WEBGL (NÚCLEO DE SHADERS ORIGINAL) ======
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

// (Aquí pegamos los fragmentos de shader de tu archivo original)
const vertexShaderSource = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTexCoord = vec2(aTexCoord.x, 1.0 - aTexCoord.y);
}`;

const fragmentShaderSource = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;

uniform vec4 overlayColor;
uniform vec4 satinColor;
uniform vec4 innerShadowColor;
uniform float innerShadowAngle;
uniform float innerShadowDistance;
uniform float layernumbers;
uniform float layerseparation;
uniform float hue;
uniform float saturation;
uniform float brightness;
uniform float contrast;

float blendLighten(float base, float blend) { return max(blend,base); }
vec3 blendLighten(vec3 base, vec3 blend, float opacity) { return (max(blend, base) * opacity + base * (1.0 - opacity)); }
vec3 blendMultiply(vec3 base, vec3 blend, float opacity) { return ((base * blend) * opacity + base * (1.0 - opacity)); }
float inv(float val) { return (0.0 - val) + 1.0; }

vec3 applyHue(vec3 aColor, float aHue) {
    float angle = radians(aHue);
    vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(angle);
    return aColor * cosAngle + cross(k, aColor) * sin(angle) + k * dot(k, aColor) * (1.0 - cosAngle);
}

vec3 applyHSBCEffect(vec3 color) {
    color = clamp(color + ((brightness) / 255.0), 0.0, 1.0);
    color = applyHue(color, hue);
    color = clamp((color - 0.5) * (1.0 + ((contrast) / 255.0)) + 0.5, 0.0, 1.0);
    vec3 intensity = vec3(dot(color, vec3(0.30980392156, 0.60784313725, 0.08235294117)));
    color = clamp(mix(intensity, color, (1.0 + (saturation / 100.0))), 0.0, 1.0);
    return color;
}

void main() {   
    vec2 uv = vTexCoord;
    vec4 spritecolor = texture2D(uTexture, uv);
    float SAMPLEDIST = layernumbers;
    
    if (spritecolor.a > 0.001) {
        spritecolor.rgb /= spritecolor.a;
        vec3 originalRGB = spritecolor.rgb;
        vec3 huedRGB = applyHSBCEffect(originalRGB);
        
        huedRGB = blendMultiply(huedRGB, satinColor.rgb, satinColor.a);
        originalRGB = blendMultiply(originalRGB, satinColor.rgb, satinColor.a);

        vec2 resFactor = layerseparation / uTextureSize;
        float offsetX = cos(innerShadowAngle);
        float offsetY = sin(innerShadowAngle);
        vec2 distMult = (innerShadowDistance * resFactor) / SAMPLEDIST;

        float totalShadow = 0.0;
        for (int i = 0; i < 100; i++) {
            if(float(i) >= SAMPLEDIST) break;
            vec2 sampleUV = uv + vec2(offsetX * (distMult.x * float(i)), offsetY * (distMult.y * float(i)));
            float smoothedAlpha = smoothstep(0.0, 0.2, texture2D(uTexture, sampleUV).a);
            totalShadow += inv(smoothedAlpha);
        }
        if(SAMPLEDIST > 0.0) totalShadow /= SAMPLEDIST; else totalShadow = 0.0;
        
        float finalShadowOpacity = innerShadowColor.a * totalShadow;
        float luma = dot(originalRGB, vec3(0.299, 0.587, 0.114));
        float outlineMask = smoothstep(0.0, 0.15, luma);
        
        spritecolor.rgb = mix(huedRGB, innerShadowColor.rgb, finalShadowOpacity * outlineMask);
        spritecolor.rgb = blendLighten(spritecolor.rgb, overlayColor.rgb, overlayColor.a);
        spritecolor.rgb *= spritecolor.a;
    }
    gl_FragColor = spritecolor;
}
`;

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
gl.linkProgram(program);
gl.useProgram(program);

const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
const posLoc = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

const texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 1,1]), gl.STATIC_DRAW);
const texLoc = gl.getAttribLocation(program, "aTexCoord");
gl.enableVertexAttribArray(texLoc);
gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

const texture = gl.createTexture();
let isImageLoaded = false;
let imgWidth = 0, imgHeight = 0;

// Render loop
function renderShader() {
    if (!isImageLoaded) return;
    gl.viewport(0, 0, imgWidth, imgHeight);
    
    gl.uniform2f(gl.getUniformLocation(program, "uTextureSize"), imgWidth, imgHeight);
    gl.uniform4f(gl.getUniformLocation(program, "overlayColor"), currentValues.oR, currentValues.oG, currentValues.oB, currentValues.oA);
    gl.uniform4f(gl.getUniformLocation(program, "satinColor"), currentValues.sR, currentValues.sG, currentValues.sB, currentValues.sA);
    gl.uniform4f(gl.getUniformLocation(program, "innerShadowColor"), currentValues.iR, currentValues.iG, currentValues.iB, currentValues.iA);
    
    let calcAngle = (currentValues.ang - 90) * Math.PI / 180;
    gl.uniform1f(gl.getUniformLocation(program, "innerShadowAngle"), calcAngle);
    gl.uniform1f(gl.getUniformLocation(program, "innerShadowDistance"), currentValues.dist);
    gl.uniform1f(gl.getUniformLocation(program, "layernumbers"), currentValues.lyr);
    gl.uniform1f(gl.getUniformLocation(program, "layerseparation"), currentValues.sep);
    
    gl.uniform1f(gl.getUniformLocation(program, "hue"), currentValues.hue);
    gl.uniform1f(gl.getUniformLocation(program, "saturation"), currentValues.sat);
    gl.uniform1f(gl.getUniformLocation(program, "brightness"), currentValues.bri);
    gl.uniform1f(gl.getUniformLocation(program, "contrast"), currentValues.con);

    gl.clearColor(0.0, 0.0, 0.0, 0.0); 
    gl.clear(gl.COLOR_BUFFER_BIT);    

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
setInterval(renderShader, 100);

// Cargar imagen en WebGL
function loadTextureFromImg(img) {
    imgWidth = img.width; imgHeight = img.height;
    canvas.width = imgWidth; canvas.height = imgHeight;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    isImageLoaded = true;
}

// Cargar sprite custom
imageLoader.addEventListener('change', (e) => {
    // Apagar animación si se carga imagen nueva
    isAnimating = false;
    animSelectorContainer.style.display = 'none';
    canvas.style.opacity = '1';
    animCanvas.style.display = 'none';
    animations = {};
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => loadTextureFromImg(img);
        img.src = event.target.result;
    }
    if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
});

// Cargar fondo custom
bgLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        canvas.style.backgroundImage = `url(${event.target.result})`;
        canvas.style.backgroundRepeat = 'no-repeat';
        canvas.style.backgroundPosition = 'center';
    }
    if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
});

// Cargar sprite por defecto ("sprite_demo.png")
const defaultImg = new Image();
defaultImg.onload = () => loadTextureFromImg(defaultImg);
defaultImg.src = '../images/sprite_demo.png';