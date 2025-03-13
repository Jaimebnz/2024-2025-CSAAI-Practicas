//-- Elementos de la GUI
const gui = {
    display: document.getElementById("display"),
    start: document.getElementById("start"),
    stop: document.getElementById("stop"),
    reset: document.getElementById("reset"),
    claveSecreta: document.querySelectorAll("#clave-secreta .numero"),
    intentos: document.getElementById("intentos"),
    botonesDigitos: document.querySelectorAll("#botones-digitos .digito")
};

//-- Definir un objeto cronómetro
const crono = new Crono(gui.display);

//-- Variables del juego
let claveSecreta = [];
let intentosRestantes = 10;
let juegoIniciado = false;

//-- Generar una clave secreta aleatoria
function generarClaveSecreta() {
    claveSecreta = [];
    for (let i = 0; i < 4; i++) {
        claveSecreta.push(Math.floor(Math.random() * 10));
    }
    console.log("Clave secreta:", claveSecreta);
}

//-- Reiniciar el juego
function reiniciarJuego() {
    generarClaveSecreta();
    intentosRestantes = 10;
    gui.intentos.textContent = `Intentos restantes: ${intentosRestantes}`;
    gui.claveSecreta.forEach(num => {
        num.textContent = "*";
        num.style.color = "black";
    });
    crono.reset();
    juegoIniciado = false;
}

//-- Comprobar si el dígito está en la clave secreta
function comprobarDigito(digito) {
    if (!juegoIniciado) {
        crono.start();
        juegoIniciado = true;
    }

    if (intentosRestantes > 0) {
        let acierto = false;
        claveSecreta.forEach((num, index) => {
            if (num == digito) {
                gui.claveSecreta[index].textContent = digito;
                gui.claveSecreta[index].style.color = "green";
                acierto = true;
            }
        });

        if (!acierto) {
            intentosRestantes--;
            gui.intentos.textContent = `Intentos restantes: ${intentosRestantes}`;
        }

        //-- Comprobar si se ha ganado
        if ([...gui.claveSecreta].every(num => num.textContent !== "*")) {
            crono.stop();
            alert("¡Has ganado!");
            reiniciarJuego();
        }

        //-- Comprobar si se han agotado los intentos
        if (intentosRestantes === 0) {
            crono.stop();
            alert("¡Has perdido! La clave era: " + claveSecreta.join(""));
            reiniciarJuego();
        }
    }
}

//-- Configurar las funciones de retrollamada
gui.start.onclick = () => {
    console.log("Start!!");
    crono.start();
};

gui.stop.onclick = () => {
    console.log("Stop!");
    crono.stop();
};

gui.reset.onclick = () => {
    console.log("Reset!");
    reiniciarJuego();
};

//-- Asignar eventos a los botones de dígitos
gui.botonesDigitos.forEach(boton => {
    boton.onclick = () => {
        comprobarDigito(boton.textContent);
    };
});

//-- Iniciar el juego al cargar la página
reiniciarJuego();