// Constantes del juego
const ANCHO = 800;
const ALTO = 600;
const ANCHO_NAVE = 50;
const ALTO_NAVE = 30;
const FILAS_ALIENS = 3;
const ALIENS_POR_FILA = 8;
const ANCHO_ALIEN = 40;
const ALTO_ALIEN = 30;
const VELOCIDAD_BALA = 7;
const RETRASO_DISPARO = 500;
const DURACION_EXPLOSION = 15;
const AUMENTO_ALIENS_OLEADA = 2;
const VELOCIDAD_BASE_ALIENS = 1;
const RETRASO_OLEADA = 2000;

// Variables del juego
let canvas, ctx;
let nave = {
    x: ANCHO / 2 - ANCHO_NAVE / 2,
    y: ALTO - ALTO_NAVE - 20,
    ancho: ANCHO_NAVE,
    alto: ALTO_NAVE,
    velocidad: 5,
    direccionX: 0
};

let aliens = [];
let balas = [];
let explosiones = [];
let puntuacion = 0;
let juegoTerminado = false;
let juegoGanado = false;
let puedeDisparar = true;
let oleadaActual = 1;
let aumentoVelocidadAliens = 0;
let esperandoOleada = false;
let temporizadorOleada = 0;

// Elementos de sonido
const sonidoDisparo = document.getElementById('disparo');
const sonidoExplosion = document.getElementById('explosion');
const sonidoRound = document.getElementById('round'); 
const sonidoVictoria = document.getElementById('victoria');
const sonidoDerrota = document.getElementById('derrota');

// Inicialización del juego
function iniciarJuego() {
    canvas = document.getElementById('InvasionAlienigena');
    ctx = canvas.getContext('2d');
    canvas.width = ANCHO;
    canvas.height = ALTO;

    crearAliens();
    document.addEventListener('keydown', manejarTeclaPresionada);
    document.addEventListener('keyup', manejarTeclaSoltada);
    requestAnimationFrame(bucleJuego);
}

// Crear oleada de aliens
function crearAliens() {
    const aliensEnOleada = ALIENS_POR_FILA + (oleadaActual - 1) * AUMENTO_ALIENS_OLEADA;
    const espaciado = ANCHO / (aliensEnOleada + 1);
    
    for (let fila = 0; fila < FILAS_ALIENS; fila++) {
        for (let col = 0; col < aliensEnOleada; col++) {
            aliens.push({
                x: col * espaciado + (espaciado - ANCHO_ALIEN) / 2,
                y: fila * 50 + 50,
                ancho: ANCHO_ALIEN,
                alto: ALTO_ALIEN,
                velocidad: VELOCIDAD_BASE_ALIENS + aumentoVelocidadAliens,
                direccion: 1,
                estaVivo: true
            });
        }
    }
}

// Bucle principal del juego
function bucleJuego() {
    if (!juegoTerminado) {
        actualizar();
        renderizar();
        requestAnimationFrame(bucleJuego);
    } else {
        mostrarFinJuego();
    }
}

// Actualizar estado del juego
function actualizar() {
    if (esperandoOleada) {
        if (Date.now() - temporizadorOleada > RETRASO_OLEADA) {
            esperandoOleada = false;
            crearAliens();
        }
        return;
    }
    
    moverNave();
    moverAliens();
    moverBalas();
    verificarColisiones();
    actualizarExplosiones();
    verificarCondicionVictoria();
    ajustarVelocidadAliens();
}

// Renderizar el juego
function renderizar() {
    // Fondo
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ANCHO, ALTO);
    
    // Estrellas (fondo)
    dibujarEstrellas();
    
    // Elementos del juego
    dibujarNave();
    dibujarAliens();
    dibujarBalas();
    dibujarExplosiones();
    
    // UI
    dibujarPuntuacion();
    
    if (juegoTerminado) {
        mostrarFinJuego();
    }
}

// Funciones de dibujo
function dibujarEstrellas() {
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * ANCHO;
        const y = Math.random() * ALTO;
        const tamaño = Math.random() * 1.5;
        ctx.fillRect(x, y, tamaño, tamaño);
    }
}

function dibujarNave() {
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(nave.x, nave.y, nave.ancho, nave.alto);
}

function dibujarAliens() {
    aliens.forEach(alien => {
        if (alien.estaVivo) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(alien.x, alien.y, alien.ancho, alien.alto);
        }
    });
}

function dibujarBalas() {
    ctx.fillStyle = '#f1c40f';
    balas.forEach(bala => {
        ctx.fillRect(bala.x, bala.y, bala.ancho, bala.alto);
    });
}

function dibujarExplosiones() {
    explosiones.forEach(explosion => {
        const opacidad = 1 - (explosion.fotograma / DURACION_EXPLOSION);
        ctx.fillStyle = `rgba(230, 126, 34, ${opacidad})`;
        ctx.beginPath();
        ctx.arc(
            explosion.x + ANCHO_ALIEN / 2,
            explosion.y + ALTO_ALIEN / 2,
            ANCHO_ALIEN * (1 + explosion.fotograma / DURACION_EXPLOSION),
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}

function dibujarPuntuacion() {
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Puntos: ${puntuacion}`, 20, 30);
    ctx.fillText(`Oleada: ${oleadaActual}`, 20, 60);
    
    if (esperandoOleada) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2ecc71';
        ctx.font = '36px Arial';
        ctx.fillText(
            `Preparando oleada ${oleadaActual}...`,
            ANCHO / 2,
            ALTO / 2
        );
    }
}

// Funciones de movimiento
function moverNave() {
    nave.x += nave.direccionX * nave.velocidad;
    nave.x = Math.max(0, Math.min(ANCHO - nave.ancho, nave.x));
}

function moverAliens() {
    let cambiarDireccion = false;
    
    aliens.forEach(alien => {
        if (alien.estaVivo) {
            if ((alien.x + alien.ancho >= ANCHO && alien.direccion === 1) ||
                (alien.x <= 0 && alien.direccion === -1)) {
                cambiarDireccion = true;
            }
        }
    });
    
    aliens.forEach(alien => {
        if (alien.estaVivo) {
            if (cambiarDireccion) {
                alien.direccion *= -1;
                alien.y += 20;
            }
            alien.x += alien.velocidad * alien.direccion;
            
            if (alien.y + alien.alto >= nave.y) {
                juegoTerminado = true;
            }
        }
    });
}

function ajustarVelocidadAliens() {
    const aliensVivos = aliens.filter(alien => alien.estaVivo).length;
    const totalAliens = ALIENS_POR_FILA * FILAS_ALIENS;
    const multiplicador = 1 + (1 - aliensVivos / totalAliens) * 2;
    
    aliens.forEach(alien => {
        alien.velocidad = (VELOCIDAD_BASE_ALIENS + aumentoVelocidadAliens) * multiplicador;
    });
}

// Sistema de disparos
function crearBala() {
    if (puedeDisparar) {
        balas.push({
            x: nave.x + nave.ancho / 2 - 2.5,
            y: nave.y,
            ancho: 5,
            alto: 15,
            velocidad: VELOCIDAD_BALA
        });
        
        puedeDisparar = false;
        setTimeout(() => puedeDisparar = true, RETRASO_DISPARO);
        
        sonidoDisparo.currentTime = 0;
        sonidoDisparo.play().catch(e => console.log("Error al disparar:", e));
    }
}

function moverBalas() {
    for (let i = balas.length - 1; i >= 0; i--) {
        balas[i].y -= balas[i].velocidad;
        if (balas[i].y + balas[i].alto < 0) {
            balas.splice(i, 1);
        }
    }
}

// Colisiones y efectos
function verificarColisiones() {
    for (let i = balas.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            if (aliens[j].estaVivo && 
                balas[i].x < aliens[j].x + aliens[j].ancho &&
                balas[i].x + balas[i].ancho > aliens[j].x &&
                balas[i].y < aliens[j].y + aliens[j].alto &&
                balas[i].y + balas[i].alto > aliens[j].y) {
                
                aliens[j].estaVivo = false;
                balas.splice(i, 1);
                
                explosiones.push({
                    x: aliens[j].x,
                    y: aliens[j].y,
                    fotograma: 0
                });
                
                puntuacion += 10;
                
                sonidoExplosion.currentTime = 0;
                sonidoExplosion.play().catch(e => console.log("Error en explosión:", e));
                
                break;
            }
        }
    }
}

function actualizarExplosiones() {
    for (let i = explosiones.length - 1; i >= 0; i--) {
        explosiones[i].fotograma++;
        if (explosiones[i].fotograma >= DURACION_EXPLOSION) {
            explosiones.splice(i, 1);
        }
    }
}

// Condiciones de juego
function verificarCondicionVictoria() {
    const aliensVivos = aliens.filter(alien => alien.estaVivo).length;
    
    if (aliensVivos === 0 && !esperandoOleada) {
        esperandoOleada = true;
        temporizadorOleada = Date.now();
        aumentoVelocidadAliens += 0.2;
        oleadaActual++;
        
        sonidoRound.currentTime = 0; 
        sonidoRound.play().catch(e => console.log("Error en sonido de round:", e));
    }
}

function mostrarFinJuego() {
    ctx.fillStyle = juegoGanado ? '#2ecc71' : '#e74c3c';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
        juegoGanado ? '¡VICTORIA!' : 'GAME OVER',
        ANCHO / 2,
        ALTO / 2 - 40
    );
    
    ctx.font = '24px Arial';
    ctx.fillText(
        `Round: ${oleadaActual}`,
        ANCHO / 2,
        ALTO / 2
    );
    
    ctx.fillText(
        `Puntuación: ${puntuacion}`,
        ANCHO / 2,
        ALTO / 2 + 40
    );
    
    ctx.fillStyle = '#FFF';
    ctx.fillText(
        'Clic para reiniciar',
        ANCHO / 2,
        ALTO / 2 + 100
    );
    
    // Reproducir sonido final
    const sonidoFinal = juegoGanado ? sonidoVictoria : sonidoDerrota;
    sonidoFinal.currentTime = 0;
    sonidoFinal.play().catch(e => console.log("Error en sonido final:", e));
    
    canvas.addEventListener('click', reiniciarJuego);
}

function reiniciarJuego() {
    canvas.removeEventListener('click', reiniciarJuego);
    
    // Resetear variables
    aliens = [];
    balas = [];
    explosiones = [];
    puntuacion = 0;
    juegoTerminado = false;
    juegoGanado = false;
    oleadaActual = 1;
    aumentoVelocidadAliens = 0;
    esperandoOleada = false;
    
    // Resetear nave
    nave.x = ANCHO / 2 - ANCHO_NAVE / 2;
    nave.y = ALTO - ALTO_NAVE - 20;
    nave.direccionX = 0;
    
    crearAliens();
    requestAnimationFrame(bucleJuego);
}

// Control de teclado
function manejarTeclaPresionada(e) {
    if (e.key === 'ArrowLeft') {
        nave.direccionX = -1;
    } else if (e.key === 'ArrowRight') {
        nave.direccionX = 1;
    } else if (e.key === ' ') {
        crearBala();
    }
}

function manejarTeclaSoltada(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        nave.direccionX = 0;
    }
}

// Iniciar el juego al cargar la página
window.onload = iniciarJuego;