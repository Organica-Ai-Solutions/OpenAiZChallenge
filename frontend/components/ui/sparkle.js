/**
 * 🌟 DIVINE SPARKLE EFFECTS 🌟
 * Golden stardust that appears when Zeus blesses the analysis
 */

export class SparkleEffect {
  constructor(element) {
    this.element = element;
    this.sparkles = [];
    this.isActive = false;
  }

  // 🌟 Create divine sparkle particles
  createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'divine-sparkle';
    sparkle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, #ffd700 0%, #ffed4e 50%, transparent 100%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: sparkleAnimation 2s ease-out forwards;
      box-shadow: 0 0 6px #ffd700, 0 0 12px #ffd700, 0 0 18px #ffd700;
    `;

    // Add sparkle animation keyframes if not already added
    if (!document.querySelector('#sparkle-styles')) {
      const style = document.createElement('style');
      style.id = 'sparkle-styles';
      style.textContent = `
        @keyframes sparkleAnimation {
          0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.5) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }
        
        .divine-sparkle::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 8px;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          transform: translate(-50%, -50%);
          border-radius: 1px;
        }
        
        .divine-sparkle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 2px;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          transform: translate(-50%, -50%);
          border-radius: 1px;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 2000);

    return sparkle;
  }

  // ⚡ Zeus blessing - burst of sparkles
  triggerZeusBurst() {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 12 sparkles in a burst pattern
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      setTimeout(() => {
        this.createSparkle(x, y);
      }, i * 100);
    }

    // Add extra random sparkles
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const x = centerX + (Math.random() - 0.5) * 200;
        const y = centerY + (Math.random() - 0.5) * 200;
        this.createSparkle(x, y);
      }, Math.random() * 1000);
    }
  }

  // 🌟 Continuous sparkle during analysis
  startContinuousSparkle() {
    if (this.isActive) return;
    this.isActive = true;

    const sparkleInterval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(sparkleInterval);
        return;
      }

      const rect = this.element.getBoundingClientRect();
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      this.createSparkle(x, y);
    }, 300);
  }

  // 🛑 Stop sparkle effects
  stopSparkle() {
    this.isActive = false;
  }

  // 👼 Angel blessing - gentle sparkle rain
  triggerAngelBlessing() {
    const rect = this.element.getBoundingClientRect();
    
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top - 50 + Math.random() * 20;
        this.createSparkle(x, y);
      }, i * 50);
    }
  }
}

// 🌟 Easy integration function
export function addDivineSparkles(buttonElement) {
  const sparkleEffect = new SparkleEffect(buttonElement);
  
  // Add click event for Zeus burst
  buttonElement.addEventListener('click', () => {
    sparkleEffect.triggerZeusBurst();
    sparkleEffect.startContinuousSparkle();
    
    // Stop after 10 seconds or when analysis completes
    setTimeout(() => {
      sparkleEffect.stopSparkle();
      sparkleEffect.triggerAngelBlessing();
    }, 10000);
  });

  return sparkleEffect;
}

// 🏛️ Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const divineButtons = document.querySelectorAll('[data-divine-button]');
    divineButtons.forEach(button => {
      addDivineSparkles(button);
    });
  });
} 