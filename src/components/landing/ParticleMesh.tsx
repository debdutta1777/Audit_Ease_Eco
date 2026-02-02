import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

const ParticleMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking for interactive particles
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Initialize particles with more variety
    const particleCount = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const connectionDistance = 180;
    const mouseInfluenceRadius = 200;

    const animate = () => {
      if (!canvas || !ctx) return;
      timeRef.current += 0.01;

      // Clear with gradient background - emerald/dark theme
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "hsl(160, 30%, 6%)");
      gradient.addColorStop(0.3, "hsl(165, 25%, 8%)");
      gradient.addColorStop(0.7, "hsl(170, 20%, 7%)");
      gradient.addColorStop(1, "hsl(155, 28%, 6%)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add multiple radial glows for depth - emerald colors
      const centerGlow = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.4,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.5
      );
      centerGlow.addColorStop(0, "hsla(160, 80%, 45%, 0.06)");
      centerGlow.addColorStop(0.5, "hsla(160, 80%, 45%, 0.02)");
      centerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Second glow (bottom right) - teal color
      const secondGlow = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.7,
        0,
        canvas.width * 0.7,
        canvas.height * 0.7,
        canvas.width * 0.4
      );
      secondGlow.addColorStop(0, "hsla(170, 70%, 40%, 0.04)");
      secondGlow.addColorStop(0.5, "hsla(170, 70%, 40%, 0.01)");
      secondGlow.addColorStop(1, "transparent");
      ctx.fillStyle = secondGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Mouse interaction - particles move away from cursor
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < mouseInfluenceRadius && distToMouse > 0) {
          const force = (mouseInfluenceRadius - distToMouse) / mouseInfluenceRadius;
          particle.vx += (dx / distToMouse) * force * 0.05;
          particle.vy += (dy / distToMouse) * force * 0.05;
        }

        // Apply velocity with damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Add slight drift
        particle.vx += (Math.random() - 0.5) * 0.01;
        particle.vy += (Math.random() - 0.5) * 0.01;

        // Clamp velocity
        const maxSpeed = 1.5;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges smoothly
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Pulsing radius
        const pulseRadius = particle.radius + Math.sin(timeRef.current * 2 + particle.pulsePhase) * 0.5;

        // Draw particle glow - emerald color
        const particleGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseRadius * 4
        );
        particleGlow.addColorStop(0, "hsla(160, 80%, 50%, 0.3)");
        particleGlow.addColorStop(0.5, "hsla(160, 80%, 50%, 0.1)");
        particleGlow.addColorStop(1, "transparent");
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw particle core - emerald color
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(160, 80%, 60%, 0.8)";
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const connDx = particle.x - other.x;
          const connDy = particle.y - other.y;
          const distance = Math.sqrt(connDx * connDx + connDy * connDy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.4;

            // Create gradient for connection line - emerald to teal
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y, other.x, other.y
            );
            lineGradient.addColorStop(0, `hsla(160, 80%, 50%, ${opacity})`);
            lineGradient.addColorStop(0.5, `hsla(170, 70%, 45%, ${opacity * 0.8})`);
            lineGradient.addColorStop(1, `hsla(160, 80%, 50%, ${opacity})`);

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = Math.max(0.5, (1 - distance / connectionDistance) * 1.5);
            ctx.stroke();
          }
        }
      });

      // Draw connection to mouse if close to particles - teal color
      particles.forEach((particle) => {
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseInfluenceRadius * 0.8) {
          const opacity = (1 - distance / (mouseInfluenceRadius * 0.8)) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `hsla(170, 70%, 55%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: "hsl(160, 30%, 6%)" }}
    />
  );
};

export default ParticleMesh;
