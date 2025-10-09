<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Canvas related variables for particle animation
let canvas = null;
let ctx = null;
let animationFrameId = null;
const particlesArray = [];
const numberOfParticles = 150; // More particles for a denser effect
const particleColor = 'rgba(30, 215, 96, 0.8)'; // Green with some transparency for glow
const backgroundColor = '#000000'; // Pure black background

// --- Particle Animation Logic ---

// Particle class definition
class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        // Initialize y to start from the bottom, or slightly below, for initial setup
        this.y = Math.random() * canvasHeight * 0.2 + canvasHeight * 0.8; // Start mostly in the bottom 20%
        this.size = Math.random() * 3 + 1; // Particle size between 1 and 4
        this.speedX = Math.random() * 0.5 - 0.25; // Subtle horizontal movement
        this.speedY = Math.random() * -0.5 - 0.1; // Slow upward movement (negative value)
        this.opacity = Math.random() * 0.5 + 0.5; // Initial opacity
        this.color = particleColor;
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.005; // Fade out slowly

        // If particle moves off screen (now from the top) or fades out, reset its position and properties
        if (this.y < -this.size || this.opacity <= 0) { // Changed condition for top boundary
            this.y = canvasHeight + this.size; // Reset to bottom
            this.x = Math.random() * canvasWidth;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * -0.5 - 0.1; // Ensure it's still negative after reset
            this.opacity = Math.random() * 0.5 + 0.5;
        }
    }

    draw(ctx) {
        ctx.save(); // Save the current drawing state
        ctx.globalAlpha = this.opacity; // Apply particle-specific opacity
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 2; // Create a glow effect based on size
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore(); // Restore the drawing state
    }
}

const initCanvas = () => {
    canvas = document.getElementById('particleBackgroundCanvas'); // Changed ID to avoid conflict
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas(); // Set initial size
    window.addEventListener('resize', resizeCanvas); // Make it responsive

    // Initialize particles
    // Now, particles are initialized to start from the bottom area
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle(canvas.width, canvas.height));
    }

    animateParticles(); // Start the animation loop
};

const resizeCanvas = () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // When resizing, update particle positions relative to new dimensions
        // For existing particles, re-randomize their Y to ensure they are within bounds
        particlesArray.forEach(particle => {
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height; // Can re-randomize or keep relative position
        });
    }
};

const animateParticles = () => {
    if (!ctx || !canvas) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear with background color

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(canvas.width, canvas.height);
        particlesArray[i].draw(ctx);
    }

    animationFrameId = requestAnimationFrame(animateParticles);
};

onMounted(() => {
    initCanvas();
});

onUnmounted(() => {
    // Clean up event listener and animation frame when component is unmounted
    window.removeEventListener('resize', resizeCanvas);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
</script>

<template>
    <canvas id="particleBackgroundCanvas" class="absolute inset-0 z-0"></canvas>
</template>
