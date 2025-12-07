/**
 * Enhanced Snow Simulation - Full Featured Version
 * Author: Roger Lee
 * Site: https://roger.zone
 * Email: rijie.li@outlook.com
 */

(function() {
  let canvas, ctx;
  let particles = [];
  let animationId;
  let isRunning = false;
  let windGusts = [];
  let lastGustTime = Date.now();

  // Configuration
  let config = {
    // Quality settings
    quality: 'medium',
    particleCount: 300,

    // Physics
    gravity: 0.5,
    windSpeed: 0,
    windDirection: 0,
    turbulence: 0.02,

    // Visual
    snowSpeed: 100,
    snowFlakeMaxRadius: 5,
    blurEnabled: true,

    // Colors
    snowColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: '#000000',

    // Snowflake types
    snowflakeType: 'all', // 'all' or specific type

    // Performance
    targetFPS: 30
  };

  // Quality presets
  const QUALITY_PRESETS = {
    low: { particleCount: 150, detail: 'basic', blur: false, frameRate: 30 },
    medium: { particleCount: 300, detail: 'standard', blur: true, frameRate: 30 },
    high: { particleCount: 500, detail: 'detailed', blur: true, frameRate: 60 },
    ultra: { particleCount: 1000, detail: 'complex', blur: true, frameRate: 60 }
  };

  // Depth layers for parallax
  const DEPTH_LAYERS = {
    background: { speed: 0.6, size: 0.3, opacity: 0.4, blur: 2, particleRatio: 0.5 },
    midground: { speed: 0.9, size: 0.6, opacity: 0.7, blur: 1, particleRatio: 0.3 },
    foreground: { speed: 1.2, size: 1.0, opacity: 1.0, blur: 0, particleRatio: 0.2 }
  };

  // UI Elements
  let controlElement, tipsElement, tipsButton;
  let qualitySelector, windSpeedSlider, windDirectionSlider;
  let snowIntensitySlider, blurToggle, snowflakeTypeSelector;

  // Snowflake class with multiple types
  function Snowflake(x, y, layer, type) {
    this.x = x;
    this.y = y;
    this.layer = layer || 'midground';
    this.type = type || 'dendrite';

    // Size varies by layer
    const baseSize = 2 + Math.random() * 4;
    this.size = baseSize * DEPTH_LAYERS[this.layer].size * (1 + Math.random() * 0.5);

    // Physics properties
    this.vx = 0;
    this.vy = 0;
    this.phase = Math.random() * Math.PI * 2;
    this.swirlAmplitude = 10 + Math.random() * 20;
    this.turbulenceFactor = 0.5 + Math.random() * 1.5;
    this.drag = 0.01 + Math.random() * 0.02;
    this.maxSpeed = 2 + Math.random() * 3;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.rotation = Math.random() * Math.PI * 2;

    // Visual properties
    this.opacity = 0.4 + Math.random() * 0.6;
    this.color = config.snowColor;
  }

  // Draw different snowflake shapes
  Snowflake.prototype.drawDendrite = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Main branches
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size);

      // Secondary branches
      const branchPoints = [
        { pos: 0.3, angle: 0.2, length: 0.3 },
        { pos: 0.5, angle: -0.15, length: 0.4 },
        { pos: 0.7, angle: 0.1, length: 0.3 }
      ];

      branchPoints.forEach(function(point) {
        const branchY = -size * point.pos;
        ctx.moveTo(0, branchY);
        ctx.lineTo(
          Math.sin(point.angle) * size * point.length,
          branchY - Math.cos(point.angle) * size * point.length
        );
      });

      ctx.stroke();
    }

    // Central hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = Math.cos(angle) * size * 0.1;
      const py = Math.sin(angle) * size * 0.1;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  Snowflake.prototype.drawStellar = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const spikes = 6;
    const outerRadius = size;
    const innerRadius = size * 0.3;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  Snowflake.prototype.drawHexagon = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = Math.cos(angle) * size;
      const py = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Inner detail
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = Math.cos(angle) * size * 0.5;
      const py = Math.sin(angle) * size * 0.5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  };

  Snowflake.prototype.drawNeedle = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.1, 0, 0, size);
    ctx.quadraticCurveTo(-size * 0.1, 0, 0, -size);
    ctx.fill();

    ctx.restore();
  };

  Snowflake.prototype.drawColumn = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.rect(-size * 0.15, -size, size * 0.3, size * 2);
    ctx.fill();

    // Hexagonal ends
    ctx.beginPath();
    ctx.rect(-size * 0.25, -size * 1.1, size * 0.5, size * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.rect(-size * 0.25, size * 0.9, size * 0.5, size * 0.2);
    ctx.fill();

    ctx.restore();
  };

  Snowflake.prototype.drawIrregular = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Create irregular shape with random branches
    const branches = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < branches; i++) {
      const angle = (Math.PI * 2 * i) / branches + (Math.random() - 0.5) * 0.5;
      const length = size * (0.7 + Math.random() * 0.3);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      const endX = Math.cos(angle) * length;
      const endY = Math.sin(angle) * length;
      ctx.quadraticCurveTo(
        (Math.random() - 0.5) * size,
        (Math.random() - 0.5) * size,
        endX,
        endY
      );
      ctx.stroke();
    }

    // Small central cluster
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  Snowflake.prototype.draw = function() {
    const layer = DEPTH_LAYERS[this.layer];

    ctx.save();
    ctx.globalAlpha = this.opacity * layer.opacity;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(0.5, this.size * 0.1);

    // Apply blur if enabled
    if (config.blurEnabled && layer.blur > 0) {
      ctx.filter = 'blur(' + layer.blur + 'px)';
    }

    // Draw based on type
    switch(this.type) {
      case 'dendrite':
        this.drawDendrite(this.x, this.y, this.size * layer.size, this.rotation);
        break;
      case 'stellar':
        this.drawStellar(this.x, this.y, this.size * layer.size, this.rotation);
        break;
      case 'hexagon':
        this.drawHexagon(this.x, this.y, this.size * layer.size, this.rotation);
        break;
      case 'needle':
        this.drawNeedle(this.x, this.y, this.size * layer.size, this.rotation);
        break;
      case 'column':
        this.drawColumn(this.x, this.y, this.size * layer.size, this.rotation);
        break;
      case 'irregular':
        this.drawIrregular(this.x, this.y, this.size * layer.size, this.rotation);
        break;
      default:
        // Simple circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * layer.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  };

  Snowflake.prototype.update = function() {
    const layer = DEPTH_LAYERS[this.layer];

    // Apply gravity based on layer
    const gravityEffect = config.gravity * layer.speed;
    this.vy += gravityEffect * (config.snowSpeed / 100);

    // Wind with gusts
    updateWindGusts();
    const currentWind = calculateCurrentWind();

    // Wind effect with turbulence
    const windEffectX = currentWind.speed * Math.cos(currentWind.direction);
    const windEffectY = currentWind.speed * Math.sin(currentWind.direction) * 0.3;

    // Add turbulence
    const turbulenceX = Math.sin(Date.now() * 0.001 + this.phase) * config.turbulence * 50;
    const turbulenceY = Math.abs(Math.sin(Date.now() * 0.001 + this.phase)) * 10;

    // Swirling effect
    const swirlX = Math.sin(Date.now() * 0.001 + this.phase) * this.swirlAmplitude;
    const swirlY = Math.cos(Date.now() * 0.001 + this.phase) * this.swirlAmplitude * 0.5;

    // Combine forces
    this.vx += (windEffectX + turbulenceX + swirlX) * 0.01;
    this.vy += (windEffectY + turbulenceY + swirlY) * 0.01;

    // Apply drag
    this.vx *= (1 - this.drag);
    this.vy *= (1 - this.drag);

    // Limit velocity
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > this.maxSpeed) {
      this.vx = (this.vx / currentSpeed) * this.maxSpeed;
      this.vy = (this.vy / currentSpeed) * this.maxSpeed;
    }

    // Update position
    this.x += this.vx * layer.speed;
    this.y += this.vy * layer.speed;

    // Update rotation
    this.rotation += this.rotationSpeed;

    // Handle boundaries
    if (this.y > canvas.height + 10) {
      this.y = -10;
      this.x = Math.random() * canvas.width;
    }

    if (this.x > canvas.width + 10) {
      this.x = -10;
    } else if (this.x < -10) {
      this.x = canvas.width + 10;
    }
  };

  function updateWindGusts() {
    const now = Date.now();

    // Generate new gusts
    if (now - lastGustTime > 3000 + Math.random() * 5000) {
      windGusts.push({
        strength: 0.3 + Math.random() * 0.7,
        duration: 1000 + Math.random() * 3000,
        direction: Math.random() * Math.PI * 2,
        startTime: now
      });
      lastGustTime = now;
    }

    // Remove expired gusts
    windGusts = windGusts.filter(function(gust) {
      return now - gust.startTime < gust.duration;
    });
  }

  function calculateCurrentWind() {
    const now = Date.now();
    let totalWindX = config.windSpeed * Math.cos(config.windDirection);
    let totalWindY = config.windSpeed * Math.sin(config.windDirection);

    // Add gust contributions
    windGusts.forEach(function(gust) {
      const elapsed = now - gust.startTime;
      const progress = elapsed / gust.duration;
      let gustEffect = 1;

      if (progress < 0.3) {
        gustEffect = progress / 0.3;
      } else if (progress > 0.7) {
        gustEffect = (1 - progress) / 0.3;
      }

      totalWindX += Math.cos(gust.direction) * gust.strength * gustEffect;
      totalWindY += Math.sin(gust.direction) * gust.strength * gustEffect;
    });

    return {
      speed: Math.sqrt(totalWindX * totalWindX + totalWindY * totalWindY),
      direction: Math.atan2(totalWindY, totalWindX)
    };
  }

  function initialize() {
    canvas = document.getElementById("snow");
    if (!canvas) {
      console.error("Snow canvas element not found");
      return;
    }

    ctx = canvas.getContext('2d');
    resizeCanvas();

    // Load saved settings
    loadSettings();

    // Initialize UI
    initializeUI();

    // Create particles
    createParticles();

    // Start animation
    start();
  }

  function initializeUI() {
    controlElement = document.getElementById("control");
    tipsElement = document.getElementById("tips");
    tipsButton = document.getElementById("tips-button");

    // Setup all controls
    setupAllControls();

    // Handle tips
    handleTips();
  }

  function setupAllControls() {
    // Get all control elements
    qualitySelector = document.getElementById("qualitySelector");
    windSpeedSlider = document.getElementById("windSpeedSlider");
    windDirectionSlider = document.getElementById("windDirectionSlider");
    snowIntensitySlider = document.getElementById("snowIntensitySlider");
    blurToggle = document.getElementById("blurToggle");
    snowflakeTypeSelector = document.getElementById("snowflakeTypeSelector");
    const toggleButton = document.getElementById("toggleAdvanced");

    // Quality selector
    if (qualitySelector) {
      qualitySelector.addEventListener("change", function() {
        config.quality = this.value;
        applyQualityPreset();
        recreateParticles();
      });
    }

    // Speed slider
    const speedSlider = document.getElementById("snowSpeedSlider");
    const speedValue = document.getElementById("snowSpeedValue");
    if (speedSlider && speedValue) {
      speedSlider.addEventListener("input", function() {
        config.snowSpeed = parseInt(this.value);
        speedValue.textContent = this.value;
      });
    }

    // Size slider
    const sizeSlider = document.getElementById("snowFlakeSizeSlider");
    const sizeValue = document.getElementById("snowSizeValue");
    if (sizeSlider && sizeValue) {
      sizeSlider.addEventListener("input", function() {
        config.snowFlakeMaxRadius = parseInt(this.value);
        sizeValue.textContent = this.value;
      });
    }

    // Wind speed
    const windSpeedValue = document.getElementById("windSpeedValue");
    if (windSpeedSlider && windSpeedValue) {
      windSpeedSlider.addEventListener("input", function() {
        config.windSpeed = parseInt(this.value) / 20;
        windSpeedValue.textContent = this.value;
      });
    }

    // Wind direction
    const windDirectionValue = document.getElementById("windDirectionValue");
    if (windDirectionSlider && windDirectionValue) {
      windDirectionSlider.addEventListener("input", function() {
        config.windDirection = (parseInt(this.value) * Math.PI) / 180;
        windDirectionValue.textContent = this.value + "°";
      });
    }

    // Snow intensity (density)
    const snowDensityValue = document.getElementById("snowDensityValue");
    if (snowIntensitySlider && snowDensityValue) {
      snowIntensitySlider.addEventListener("input", function() {
        config.particleCount = parseInt(this.value);
        snowDensityValue.textContent = this.value;
        recreateParticles();
      });
    }

    // Blur toggle
    if (blurToggle) {
      blurToggle.addEventListener("change", function(e) {
        config.blurEnabled = e.target.checked;
      });
    }

    // Snowflake type
    if (snowflakeTypeSelector) {
      snowflakeTypeSelector.addEventListener("change", function(e) {
        config.snowflakeType = e.target.value;
        updateSnowflakeTypes();
      });
    }

    // Toggle advanced section
    if (toggleButton) {
      toggleButton.addEventListener("click", function() {
        const advancedSection = document.getElementById("advancedSection");
        const isVisible = advancedSection.style.display !== "none";
        advancedSection.style.display = isVisible ? "none" : "block";
        toggleButton.textContent = isVisible ? "▼ More Settings" : "▲ Less Settings";
      });
    }
  }

  function handleTips() {
    if (!tipsElement || !tipsButton) return;

    const tipsClicked = localStorage.getItem("tips-button-clicked");
    if (tipsClicked !== "1") {
      tipsElement.style.visibility = "visible";
      if (controlElement) controlElement.style.opacity = 1;
    }

    tipsButton.addEventListener("click", function() {
      localStorage.setItem("tips-button-clicked", "1");
      tipsElement.style.visibility = "hidden";
      if (controlElement) controlElement.style.removeProperty("opacity");
    });
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];

    // Determine available types based on quality
    let availableTypes;
    switch(config.quality) {
      case 'low':
        availableTypes = ['circle', 'hexagon'];
        break;
      case 'medium':
        availableTypes = ['dendrite', 'stellar', 'hexagon'];
        break;
      case 'high':
      case 'ultra':
        availableTypes = ['dendrite', 'stellar', 'hexagon', 'needle', 'column', 'irregular'];
        break;
      default:
        availableTypes = ['dendrite', 'stellar', 'hexagon'];
    }

    // Create particles distributed across layers
    Object.keys(DEPTH_LAYERS).forEach(function(layerName) {
      const layer = DEPTH_LAYERS[layerName];
      const count = Math.floor(config.particleCount * layer.particleRatio);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height - canvas.height;
        const type = config.snowflakeType === 'all' ?
          availableTypes[Math.floor(Math.random() * availableTypes.length)] :
          config.snowflakeType;

        particles.push(new Snowflake(x, y, layerName, type));
      }
    });
  }

  function updateSnowflakeTypes() {
    particles.forEach(function(particle) {
      if (config.snowflakeType !== 'all') {
        particle.type = config.snowflakeType;
      }
    });
  }

  function recreateParticles() {
    createParticles();
  }

  function applyQualityPreset() {
    const preset = QUALITY_PRESETS[config.quality];
    if (preset) {
      config.particleCount = preset.particleCount;
      config.blurEnabled = preset.blur;
      config.targetFPS = preset.frameRate;
    }
  }

  function loadSettings() {
    try {
      const settings = localStorage.getItem('snowSimulationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.quality) {
          config.quality = parsed.quality;
          applyQualityPreset();
        }
      }
    } catch (e) {
      console.warn('Failed to load snow simulation settings:', e);
    }
  }

  function saveSettings() {
    try {
      const settings = {
        quality: config.quality,
        windSpeed: config.windSpeed,
        windDirection: config.windDirection,
        particleCount: config.particleCount,
        blurEnabled: config.blurEnabled,
        snowflakeType: config.snowflakeType
      };
      localStorage.setItem('snowSimulationSettings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save snow simulation settings:', e);
    }
  }

  function animate() {
    if (!isRunning) return;

    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort particles by layer for proper depth rendering
    particles.sort(function(a, b) {
      const layerOrder = ['background', 'midground', 'foreground'];
      return layerOrder.indexOf(a.layer) - layerOrder.indexOf(b.layer);
    });

    // Update and draw particles
    particles.forEach(function(particle) {
      particle.update();
      particle.draw();
    });

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    animate();
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Save settings on unload
  window.addEventListener('beforeunload', saveSettings);

  // Window resize handler
  window.addEventListener("resize", resizeCanvas);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Expose public API
  window.snowSimulation = {
    start: start,
    stop: stop,
    config: config,
    saveSettings: saveSettings
  };
})();