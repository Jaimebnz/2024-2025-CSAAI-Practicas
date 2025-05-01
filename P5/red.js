document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    const generateBtn = document.getElementById('generateBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const nodeCountDisplay = document.getElementById('nodeCount');
    const totalTimeDisplay = document.getElementById('totalTime');
    const messageDisplay = document.getElementById('message');

    let network = null;
    let shortestPath = [];
    let totalDelay = 0;

    // Inicializar el canvas
    function initCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        messageDisplay.textContent = 'Presiona "Generar Red" para comenzar.';
        nodeCountDisplay.textContent = 'Número de nodos: 0';
        totalTimeDisplay.textContent = 'Tiempo total: 0 sec';
    }

    // Mostrar detalles de conexiones
    function showConnections() {
        let connectionInfo = "Detalles de conexiones:\n";
        for (const nodo of network.nodes) {
            connectionInfo += "N" + nodo.id + " delay " + nodo.delay + "ms\n";
            for (const conn of nodo.conexiones) {
                connectionInfo += "- N" + conn.nodo.id + " weight " + conn.peso + "\n";
            }
            connectionInfo += "\n";
        }
        messageDisplay.textContent = connectionInfo;
    }

    // Generar una red aleatoria
    generateBtn.addEventListener('click', function() {
        shortestPath = [];
        totalDelay = 0;

        const nodeCount = Math.floor(Math.random() * 3) + 3;
        network = new Network(nodeCount);

        drawNetwork();
        showConnections();

        nodeCountDisplay.textContent = "Número de nodos: " + nodeCount;
        totalTimeDisplay.textContent = 'Tiempo total: 0 sec';
        calculateBtn.disabled = false;
    });

    // Calcular la ruta mínima
    calculateBtn.addEventListener('click', function() {
        if (!network) {
            messageDisplay.textContent = 'Primero debes generar una red.';
            return;
        }

        const lastNode = network.nodes.length - 1;
        const origin = network.nodes[0];
        const destination = network.nodes[lastNode];

        const pathNodes = dijkstraConRetardos(network.nodes, origin, destination);
        shortestPath = pathNodes.map(n => n.id);
        totalDelay = pathNodes.reduce((sum, n) => sum + n.delay, 0);

        drawNetwork();

        totalTimeDisplay.textContent = "Tiempo total: " + (totalDelay / 1000).toFixed(3) + " sec";
        messageDisplay.textContent = "Ruta calculada del nodo N0 al nodo N" + lastNode + ".";
    });

    // Dibujar la red en el canvas
    function drawNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!network) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;
        const angleStep = (2 * Math.PI) / network.nodes.length;

        // Dibujar conexiones
        for (let i = 0; i < network.nodes.length; i++) {
            const nodo = network.nodes[i];
            const startAngle = i * angleStep - Math.PI / 2;
            const startX = centerX + radius * Math.cos(startAngle);
            const startY = centerY + radius * Math.sin(startAngle);

            for (const conn of nodo.conexiones) {
                const endNode = conn.nodo;
                const endAngle = endNode.id * angleStep - Math.PI / 2;
                const endX = centerX + radius * Math.cos(endAngle);
                const endY = centerY + radius * Math.sin(endAngle);

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 1;
                ctx.stroke();

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                ctx.fillStyle = '#2c3e50';
                ctx.font = '12px Arial';
                ctx.fillText(conn.peso.toString(), midX, midY);
            }
        }

        // Dibujar nodos
        for (let i = 0; i < network.nodes.length; i++) {
            const nodo = network.nodes[i];
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const isInPath = shortestPath.includes(nodo.id);
            ctx.fillStyle = isInPath ? '#2ecc71' : '#3498db';

            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("N" + nodo.id, x, y + 4);

            ctx.font = '10px Arial';
            ctx.fillText(nodo.delay + "ms", x, y + 18);
        }
    }

    // Clase para representar un nodo
    class Node {
        constructor(id) {
            this.id = id;
            this.delay = Math.floor(Math.random() * 10) + 1;
            this.conexiones = [];
        }

        addConnection(nodo, peso) {
            this.conexiones.push({ nodo, peso });
        }
    }

    // Clase para representar la red
    class Network {
        constructor(nodeCount) {
            this.nodes = [];

            for (let i = 0; i < nodeCount; i++) {
                this.nodes.push(new Node(i));
            }

            for (let i = 0; i < nodeCount; i++) {
                const currentNode = this.nodes[i];
                let availableNodes = this.nodes
                    .filter(nodo => nodo.id !== i)
                    .filter(nodo => !currentNode.conexiones.some(conn => conn.nodo.id === nodo.id));

                while (currentNode.conexiones.length < 2 && availableNodes.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableNodes.length);
                    const targetNode = availableNodes[randomIndex];
                    const peso = Math.floor(Math.random() * 10) + 1;

                    currentNode.addConnection(targetNode, peso);
                    targetNode.addConnection(currentNode, peso);

                    availableNodes = availableNodes.filter(n => n.id !== targetNode.id);
                }
            }
        }
    }

    // Inicializar la aplicación
    initCanvas();
    calculateBtn.disabled = true;
});