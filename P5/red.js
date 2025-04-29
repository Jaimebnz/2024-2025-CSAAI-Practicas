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
        for (const node of network.nodes) {
            connectionInfo += `N${node.id} delay ${node.delay}ms\n`;
            for (const conn of node.connections) {
                connectionInfo += `- N${conn.node.id} weight ${conn.weight}\n`;
            }
            connectionInfo += "\n";
        }
        messageDisplay.textContent = connectionInfo;
    }
    
    // Generar una red aleatoria
    generateBtn.addEventListener('click', function() {
        // Limpiar datos anteriores
        shortestPath = [];
        totalDelay = 0;
        
        // Generar número aleatorio de nodos (3-5)
        const nodeCount = Math.floor(Math.random() * 3) + 3;
        
        // Crear la red
        network = new Network(nodeCount);
        
        // Dibujar la red
        drawNetwork();
        
        // Mostrar detalles de conexiones
        showConnections();
        
        // Actualizar displays
        nodeCountDisplay.textContent = `Número de nodos: ${nodeCount}`;
        totalTimeDisplay.textContent = 'Tiempo total: 0 sec';
        
        // Habilitar el botón de calcular
        calculateBtn.disabled = false;
    });
    
    // Calcular la ruta mínima
    calculateBtn.addEventListener('click', function() {
        if (!network) {
            messageDisplay.textContent = 'Primero debes generar una red.';
            return;
        }
        
        // Calcular ruta mínima del nodo 0 al último nodo
        const lastNode = network.nodes.length - 1;
        const result = network.dijkstra(0, lastNode);
        
        shortestPath = result.path;
        totalDelay = result.distance;
        
        // Dibujar la red con la ruta resaltada
        drawNetwork();
        
        // Actualizar displays
        totalTimeDisplay.textContent = `Tiempo total: ${(totalDelay / 1000).toFixed(3)} sec`;
        messageDisplay.textContent = `Ruta calculada del nodo N0 al nodo N${lastNode}.`;
    });
    
    // Dibujar la red en el canvas
    function drawNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!network) return;
        
        // Calcular posiciones de los nodos en un círculo
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;
        const angleStep = (2 * Math.PI) / network.nodes.length;
        
        // Dibujar conexiones primero
        for (let i = 0; i < network.nodes.length; i++) {
            const node = network.nodes[i];
            const startAngle = i * angleStep - Math.PI / 2;
            const startX = centerX + radius * Math.cos(startAngle);
            const startY = centerY + radius * Math.sin(startAngle);
            
            for (const connection of node.connections) {
                const endNode = connection.node;
                const endAngle = endNode.id * angleStep - Math.PI / 2;
                const endX = centerX + radius * Math.cos(endAngle);
                const endY = centerY + radius * Math.sin(endAngle);
                
                // Dibujar línea
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Dibujar peso de la conexión
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                ctx.fillStyle = '#2c3e50';
                ctx.font = '12px Arial';
                ctx.fillText(connection.weight.toString(), midX, midY);
            }
        }
        
        // Dibujar nodos después para que queden encima
        for (let i = 0; i < network.nodes.length; i++) {
            const node = network.nodes[i];
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Determinar color del nodo (verde si está en la ruta mínima)
            const isInPath = shortestPath.includes(node.id);
            ctx.fillStyle = isInPath ? '#2ecc71' : '#3498db';
            
            // Dibujar círculo del nodo
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Dibujar texto del nodo (ID y delay)
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`N${node.id}`, x, y + 4);
            
            ctx.font = '10px Arial';
            ctx.fillText(`${node.delay}ms`, x, y + 18);
        }
    }
    
    // Clase para representar un nodo
    class Node {
        constructor(id) {
            this.id = id;
            this.delay = Math.floor(Math.random() * 10) + 1; // Delay entre 1-10ms
            this.connections = [];
        }
        
        addConnection(node, weight) {
            this.connections.push({ node, weight });
        }
    }
    
    // Clase para representar la red
    class Network {
        constructor(nodeCount) {
            this.nodes = [];
            
            // Crear nodos
            for (let i = 0; i < nodeCount; i++) {
                this.nodes.push(new Node(i));
            }
            
            // Crear conexiones (2 por nodo)
            for (let i = 0; i < nodeCount; i++) {
                const currentNode = this.nodes[i];
                
                // Obtener nodos disponibles para conectar (excluyendo el actual y ya conectados)
                let availableNodes = this.nodes
                    .filter(node => node.id !== i)
                    .filter(node => !currentNode.connections.some(conn => conn.node.id === node.id));
                
                // Asegurarnos de que cada nodo tenga al menos 2 conexiones
                while (currentNode.connections.length < 2 && availableNodes.length > 0) {
                    // Seleccionar un nodo aleatorio disponible
                    const randomIndex = Math.floor(Math.random() * availableNodes.length);
                    const targetNode = availableNodes[randomIndex];
                    
                    // Crear conexión bidireccional con peso aleatorio (1-10)
                    const weight = Math.floor(Math.random() * 10) + 1;
                    currentNode.addConnection(targetNode, weight);
                    targetNode.addConnection(currentNode, weight);
                    
                    // Actualizar lista de nodos disponibles
                    availableNodes = availableNodes.filter(node => node.id !== targetNode.id);
                }
            }
        }
        
        // Implementación del algoritmo de Dijkstra
        dijkstra(startId, endId) {
            const distances = {};
            const previous = {};
            const nodes = new Set();
            const path = [];
            
            // Inicializar distancias
            for (const node of this.nodes) {
                distances[node.id] = node.id === startId ? 0 : Infinity;
                nodes.add(node);
            }
            
            while (nodes.size > 0) {
                // Obtener nodo con la distancia mínima
                let closest = null;
                for (const node of nodes) {
                    if (closest === null || distances[node.id] < distances[closest.id]) {
                        closest = node;
                    }
                }
                
                // Si no hay camino o llegamos al destino
                if (distances[closest.id] === Infinity || closest.id === endId) {
                    break;
                }
                
                nodes.delete(closest);
                
                // Actualizar distancias de los vecinos
                for (const connection of closest.connections) {
                    const neighbor = connection.node;
                    const alt = distances[closest.id] + neighbor.delay; // Usamos solo el delay
                    
                    if (alt < distances[neighbor.id]) {
                        distances[neighbor.id] = alt;
                        previous[neighbor.id] = closest.id;
                    }
                }
            }
            
            // Reconstruir el camino
            let current = endId;
            while (current !== undefined) {
                path.unshift(current);
                current = previous[current];
            }
            
            return {
                path: path,
                distance: distances[endId]
            };
        }
    }
    
    // Inicializar la aplicación
    initCanvas();
    calculateBtn.disabled = true;
});