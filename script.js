const mainScreen = document.getElementById("mainScreen");
const startButton = document.getElementById("startButton");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.querySelector(".score-board");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function startGame() {
  mainScreen.style.display = "none";
  canvas.style.display = "block";
  scoreBoard.style.display = "block";
  gameLoop(); // Lancer la boucle principale du jeu
}

// Événement pour démarrer le jeu
startButton.addEventListener("click", startGame);

let keys = {}; // Stockage des touches pressées

// Paramètres des vagues
const waves = {
  amplitude: 40, // Hauteur des vagues
  frequency: 0.02, // Fréquence des vagues
  speed: 0.02, // Vitesse des vagues
  offset: 0, // Décalage pour l'animation
  height: canvas.height / 2 // La moitié de l'écran
};

// Paramètres des bulles
const bubbles = [];
for (let i = 0; i < 100; i++) { // Plus de bulles
    bubbles.push({
        x: Math.random() * canvas.width,
        y: waves.height + Math.random() * (canvas.height - waves.height),
        radius: Math.random() * 8 + 2, // Bulles plus variées
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3 // Opacité variable
    });
}

// Charger les images des déchets
const items = [
    { src: 'bouteille-removebg-preview.png', x: 0, y: -50 },
    { src: 'canette-removebg-preview.png', x: 0, y: -50 },
    { src: 'plastic-removebg-preview.png', x: 0, y: -50 },
];

let images = [];
items.forEach(item => {
    const img = new Image();
    img.src = item.src;
    images.push({ img: img, x: Math.random() * canvas.width, y: -50, speed: Math.random() * 3 + 2 });
});

// Charger l'image de la poubelle
const binImage = new Image();
binImage.src = "poubelle-removebg-preview.png";

let bin = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 100,
    width: 100,
    height: 100,
    speed: 5
};

// Gérer les touches
window.addEventListener("keydown", (e) => {
  keys[e.key] = true; // Enregistrer la touche pressée
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false; // Supprimer la touche relâchée
});

// Fonction pour mettre à jour les mouvements de la poubelle
function updateBin() {
  if (keys["ArrowLeft"] && bin.x > 0) {
      bin.x -= bin.speed;
  }
  if (keys["ArrowRight"] && bin.x + bin.width < canvas.width) {
      bin.x += bin.speed;
  }
}


let score = 0;

// Gérer les touches
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && bin.x > 0) bin.x -= bin.speed;
    if (e.key === "ArrowRight" && bin.x + bin.width < canvas.width) bin.x += bin.speed;
});

// Fonction pour dessiner les vagues
function drawWaves() {
  ctx.beginPath();
  ctx.moveTo(0, waves.height);
  for (let x = 0; x <= canvas.width; x++) {
      const y = Math.sin(x * waves.frequency + waves.offset) * waves.amplitude + waves.height;
      ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, waves.height, 0, canvas.height);
  gradient.addColorStop(0, "#1e90ff");
  gradient.addColorStop(1, "#0f4473");
  ctx.fillStyle = gradient;
  ctx.fill();
  waves.offset += waves.speed;
}

// Fonction pour dessiner les bulles
function drawBubbles() {
  bubbles.forEach(bubble => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
      ctx.fill();
      bubble.y -= bubble.speed;

      // Réinitialiser les bulles qui sortent de l'écran
      if (bubble.y < waves.height) {
          bubble.y = canvas.height;
          bubble.x = Math.random() * canvas.width;
      }
  });
}

// Fonction principale
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner les vagues et les bulles
    drawWaves();
    drawBubbles();

    // Mise à jour des mouvements de la poubelle
    updateBin();

    // Dessiner la poubelle
    ctx.drawImage(binImage, bin.x, bin.y, bin.width, bin.height);

    // Dessiner les déchets
    images.forEach(item => {
        item.y += item.speed;
        ctx.drawImage(item.img, item.x, item.y, 50, 50);

        // Collision avec la poubelle
        if (
            item.x < bin.x + bin.width &&
            item.x + 50 > bin.x &&
            item.y < bin.y + bin.height &&
            item.y + 50 > bin.y
        ) {
            score++;
            document.getElementById("score").textContent = score;
            item.y = -50;
            item.x = Math.random() * canvas.width;
        }

        // Réinitialiser si dépasse l'écran
        if (item.y > canvas.height) {
            item.y = -50;
            item.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(gameLoop);
}

let time = 60; // Temps en secondes
let interval = setInterval(() => {
    time--;
    document.getElementById("time").textContent = time;

    // Arrêter le jeu lorsque le temps est écoulé
    if (time <= 0) {
        clearInterval(interval);
        alert(`Temps écoulé ! Votre score final est : ${score}`);
        location.reload(); // Recharger le jeu
    }
}, 1000);


// Lancer le jeu
binImage.onload = () => {
    gameLoop();
};
