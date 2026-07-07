document.addEventListener("DOMContentLoaded", () => {
    const sfxHover = new Audio('audios/hover.mp3');
    const sfxClick = new Audio('audios/click.mp3');
    const sfxDelete = new Audio('audios/click.mp3');
    sfxHover.volume = 0.5; sfxClick.volume = 0.8;

    const modal = document.getElementById('name-modal');
    const input = document.getElementById('shader-name-input');
    const btnNewShader = document.getElementById('btn-new-shader');
    const grid = document.querySelector('.projects-grid'); // El contenedor de tarjetas

    // ==========================================
    // CARGAR SHADERS DESDE LOCAL STORAGE
    // ==========================================
    function loadSavedProjects() {
        // Borramos todas las tarjetas antiguas excepto el botón de "NEW SHADER"
        document.querySelectorAll('.existing-shader').forEach(el => el.remove());

        // Leemos de la memoria
        let projects = JSON.parse(localStorage.getItem('ShaderBaker_Projects')) || [];

        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card existing-shader';
            
            // 👇 Si el proyecto tiene miniatura guardada usa esa, si no, usa el default
            const imgSrc = proj.thumbnail ? proj.thumbnail : 'images/sprite_demo.png';

            // Creamos el HTML de la tarjeta
            card.innerHTML = `
                <button class="delete-btn" data-id="${proj.id}" title="Eliminar"><img src="images/icon_trash.png" alt="Delete"></button>
                <div class="card-icon">
                    <img src="${imgSrc}" alt="${proj.name} Sprite" class="pixel-img sprite">
                </div>
                <h2>${proj.name.toUpperCase()}</h2>
            `;

            // Hover Sonido
            card.addEventListener('mouseenter', () => { sfxHover.currentTime = 0; sfxHover.play().catch(()=>{}); });

            // Clic para EDITAR
            card.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn')) return; // No entrar si tocamos la papelera
                
                sfxClick.currentTime = 0; sfxClick.play();
                
                // Le pasamos al editor el ID, Nombre y la Cadena de 20 dígitos
                localStorage.setItem("currentShaderId", proj.id);
                localStorage.setItem("currentShaderName", proj.name);
                localStorage.setItem("currentShaderParams", proj.params);
                
                setTimeout(() => { window.location.href = 'editor.html'; }, 300);
            });

            grid.appendChild(card);
        });

        // Eventos para los botones de eliminar (Papelera)
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm("¿Estás seguro de que quieres borrar este Shader? Esta acción no se puede deshacer.")) {
                    sfxDelete.currentTime = 0; sfxDelete.play();
                    
                    const idToDelete = e.target.closest('.delete-btn').getAttribute('data-id');
                    let currentProjects = JSON.parse(localStorage.getItem('ShaderBaker_Projects')) || [];
                    
                    // Filtrar y eliminar el que seleccionamos
                    currentProjects = currentProjects.filter(p => p.id !== idToDelete);
                    localStorage.setItem('ShaderBaker_Projects', JSON.stringify(currentProjects));
                    
                    // Animación de desaparecer
                    const cardToRemove = e.target.closest('.project-card');
                    cardToRemove.style.transform = "scale(0)";
                    setTimeout(() => cardToRemove.remove(), 200);
                }
            });
        });
    }

    // Llamar la función al inicio
    loadSavedProjects();

    // ==========================================
    // BOTÓN: NUEVO SHADER
    // ==========================================
    btnNewShader.addEventListener('mouseenter', () => { sfxHover.currentTime = 0; sfxHover.play().catch(()=>{}); });
    
    btnNewShader.addEventListener('click', () => {
        sfxClick.currentTime = 0; sfxClick.play();
        modal.style.display = 'flex';
        input.value = '';
        input.focus();
    });

    document.getElementById('btn-cancel').addEventListener('click', () => {
        sfxHover.currentTime = 0; sfxHover.play();
        modal.style.display = 'none';
    });

    document.getElementById('btn-confirm').addEventListener('click', () => {
        const name = input.value.trim() || "Untitled";
        
        // Resetear la memoria para empezar en blanco (0,0,0,0...)
        localStorage.removeItem("currentShaderId"); // Le quitamos el ID para que guarde uno nuevo
        localStorage.setItem("currentShaderName", name);
        localStorage.setItem("currentShaderParams", ""); // En blanco (Editor pondrá 0s por defecto)
        
        sfxClick.currentTime = 0; sfxClick.play();
        window.location.href = 'editor.html'; 
    });
});