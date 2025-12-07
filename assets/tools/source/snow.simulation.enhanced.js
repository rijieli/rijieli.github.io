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
  
  // Generic cache for Unicode snowflake shapes (keyed by Unicode character)
  let unicodeSnowflakeCache = {};

  // Default configuration values
  const DEFAULT_CONFIG = {
    particleCount: 500, // density

    // Physics
    gravity: 0.5,
    windSpeed: 50, // wind strength
    windDirection: Math.PI / 2, // 90 degrees
    turbulence: 0.02,

    // Visual
    snowSpeed: 500, // gravity multiplier
    snowFlakeMaxRadius: 22, // size
    blurEnabled: true,

    // Colors
    snowColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: '#000000',

    // Snowflake types
    snowflakeType: 'defaultStyle' // 'all' or specific type
  };

  // Configuration
  let config = {
    particleCount: DEFAULT_CONFIG.particleCount,

    // Physics
    gravity: DEFAULT_CONFIG.gravity,
    windSpeed: DEFAULT_CONFIG.windSpeed,
    windDirection: DEFAULT_CONFIG.windDirection,
    turbulence: DEFAULT_CONFIG.turbulence,

    // Visual
    snowSpeed: DEFAULT_CONFIG.snowSpeed,
    snowFlakeMaxRadius: DEFAULT_CONFIG.snowFlakeMaxRadius,
    blurEnabled: DEFAULT_CONFIG.blurEnabled,

    // Colors
    snowColor: DEFAULT_CONFIG.snowColor,
    backgroundColor: DEFAULT_CONFIG.backgroundColor,

    // Snowflake types
    snowflakeType: DEFAULT_CONFIG.snowflakeType
  };

  // Depth layers for parallax
  const DEPTH_LAYERS = {
    background: { speed: 0.6, size: 0.3, opacity: 0.4, blur: 2, particleRatio: 0.5 },
    midground: { speed: 0.9, size: 0.6, opacity: 0.7, blur: 1, particleRatio: 0.3 },
    foreground: { speed: 1.2, size: 1.0, opacity: 1.0, blur: 0, particleRatio: 0.2 }
  };

  // Fixed layer order for draw order (avoids sorting particles every frame)
  const LAYER_ORDER = ['background', 'midground', 'foreground'];

  // Snowflake types configuration - stores draw function, icon, and title for each type
  const SNOWFLAKE_TYPES = {
    defaultStyle: {
      drawMethod: 'drawDefaultStyle',
      icon: '❋',
      title: 'Default Style'
    },
    dendrite: {
      drawMethod: 'drawDendrite',
      icon: '❄',
      title: 'Dendrite'
    },
    stellar: {
      drawMethod: 'drawStellar',
      icon: '❅',
      title: 'Stellar'
    },
    hexagon: {
      drawMethod: 'drawHexagon',
      icon: '✦',
      title: 'Hexagon'
    },
    needle: {
      drawMethod: 'drawNeedle',
      icon: '✱',
      title: 'Needle'
    },
    irregular: {
      drawMethod: 'drawIrregular',
      icon: '✻',
      title: 'Irregular'
    },
    crystal: {
      drawMethod: 'drawCrystal',
      icon: '⬡',
      title: 'Crystal'
    },
    standard: {
      drawMethod: 'drawUnicode',
      icon: '❄',
      title: 'Standard',
      unicode: '❄'
    },
    snowflake1: {
      drawMethod: 'drawUnicode',
      icon: '❅',
      title: 'Snowflake 1',
      unicode: '❅'
    },
    snowflake2: {
      drawMethod: 'drawUnicode',
      icon: '❆',
      title: 'Snowflake 2',
      unicode: '❆'
    },
    snowflake3: {
      drawMethod: 'drawUnicode',
      icon: '❈',
      title: 'Snowflake 3',
      unicode: '❈'
    },
    snowflake4: {
      drawMethod: 'drawUnicode',
      icon: '❉',
      title: 'Snowflake 4',
      unicode: '❉'
    },
    snowflakeEmoji: {
      drawMethod: 'drawUnicode',
      icon: '❄️',
      title: 'Snowflake Emoji',
      unicode: '❄️'
    }
  };

  // Get available snowflake type keys as array
  const AVAILABLE_SNOWFLAKE_TYPES = Object.keys(SNOWFLAKE_TYPES);

  // UI Elements
  let controlElement, tipsElement, tipsButton;
  let windSpeedSlider, windDirectionSlider;
  let snowIntensitySlider, blurToggle;
  let windDirectionArrow;
  let hidePanelTimeout = null;

  // Snowflake class with multiple types
  function Snowflake(x, y, layer, type) {
    this.x = x;
    this.y = y;
    this.layer = layer || 'midground';
    this.type = type || 'dendrite';

    // Size varies by layer and user setting
    const baseSize = (config.snowFlakeMaxRadius / 3) + Math.random() * (config.snowFlakeMaxRadius / 2);
    this.size = baseSize * DEPTH_LAYERS[this.layer].size;

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

    // Draw four-pointed star (✦ icon)
    const points = 4;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
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

  Snowflake.prototype.drawNeedle = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw asterisk/star pattern (✱ icon)
    const arms = 8;
    const armLength = size;
    const centerRadius = size * 0.15;

    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw radiating arms
    ctx.beginPath();
    for (let i = 0; i < arms; i++) {
      const angle = (i * Math.PI * 2) / arms;
      const endX = Math.cos(angle) * armLength;
      const endY = Math.sin(angle) * armLength;
      if (i === 0) ctx.moveTo(endX, endY);
      else ctx.lineTo(endX, endY);
      ctx.lineTo(0, 0);
    }
    ctx.stroke();

    ctx.restore();
  };

  Snowflake.prototype.drawIrregular = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw six-pointed sparkle (✻ icon) - multiple layers for sparkle effect
    const points = 6;
    
    // Outer sparkle layer - larger points
    const outerRadius1 = size;
    const innerRadius1 = size * 0.4;
    
    // Inner sparkle layer - smaller points
    const outerRadius2 = size * 0.6;
    const innerRadius2 = size * 0.2;

    // Draw outer six-pointed star
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius1 : innerRadius1;
      const angle = (i * Math.PI) / points;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Draw inner six-pointed star (rotated slightly)
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius2 : innerRadius2;
      const angle = (i * Math.PI) / points + Math.PI / (points * 2);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Crystal snowflake with geometric patterns
  Snowflake.prototype.drawCrystal = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw hexagonal crystal structure
    const hexSize = size * 0.8;
    
    // Outer hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = Math.cos(angle) * hexSize;
      const py = Math.sin(angle) * hexSize;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = Math.cos(angle) * hexSize * 0.5;
      const py = Math.sin(angle) * hexSize * 0.5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw 6 main arms with geometric patterns
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      
      // Main arm
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size);
      ctx.stroke();

      // Geometric patterns along the arm
      const patternCount = 3;
      for (let j = 1; j <= patternCount; j++) {
        const pos = (j / (patternCount + 1)) * size;
        const patternSize = size * 0.15 * (1 - j * 0.2);
        
        // Draw small hexagons
        ctx.save();
        ctx.translate(0, -pos);
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (k * Math.PI) / 3;
          const px = Math.cos(angle) * patternSize;
          const py = Math.sin(angle) * patternSize;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    // Center filled hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = Math.cos(angle) * size * 0.12;
      const py = Math.sin(angle) * size * 0.12;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Google-style simple snowflake (based on &#10052; symbol)
  Snowflake.prototype.drawDefaultStyle = function(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw a simple 6-pointed star/snowflake pattern
    // Main 6 arms
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size);
      ctx.stroke();
      
      // Small side branches on each arm
      const branchY = -size * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, branchY);
      ctx.lineTo(-size * 0.15, branchY - size * 0.1);
      ctx.moveTo(0, branchY);
      ctx.lineTo(size * 0.15, branchY - size * 0.1);
      ctx.stroke();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Generic function to create cached Unicode snowflake shape
  function createUnicodeSnowflakeCache(unicodeChar) {
    // Return existing cache if already created
    if (unicodeSnowflakeCache[unicodeChar]) {
      return unicodeSnowflakeCache[unicodeChar];
    }
    
    // Create offscreen canvas for caching
    const cacheSize = 200; // Large enough for good quality
    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = cacheSize;
    cacheCanvas.height = cacheSize;
    const cacheCtx = cacheCanvas.getContext('2d');
    
    // Draw the Unicode character once
    cacheCtx.textAlign = 'center';
    cacheCtx.textBaseline = 'middle';
    cacheCtx.font = '150px Arial';
    cacheCtx.fillStyle = 'white';
    cacheCtx.fillText(unicodeChar, cacheSize / 2, cacheSize / 2);
    
    // Store in cache
    unicodeSnowflakeCache[unicodeChar] = cacheCanvas;
    return cacheCanvas;
  }

  // Generic Unicode snowflake drawer - accepts any Unicode character
  Snowflake.prototype.drawUnicode = function(x, y, size, rotation) {
    // Get the Unicode character for this snowflake type
    const typeConfig = SNOWFLAKE_TYPES[this.type];
    const unicodeChar = typeConfig && typeConfig.unicode ? typeConfig.unicode : '❄';
    
    // Get or create cache for this Unicode character
    const cachedShape = createUnicodeSnowflakeCache(unicodeChar);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Scale the cached image to match the desired size
    const scale = size / 75; // Adjust based on cache size (200px cache, ~150px character)
    ctx.scale(scale, scale);
    
    // Draw the cached image
    // The fillStyle is already set by the draw() method, so we use multiply to apply color
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(cachedShape, -cachedShape.width / 2, -cachedShape.height / 2);
    
    // Apply color tint using multiply (white * color = color)
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(-cachedShape.width / 2, -cachedShape.height / 2, 
                  cachedShape.width, cachedShape.height);
    
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

    // Draw based on type using configuration
    if (this.type && SNOWFLAKE_TYPES[this.type] && this[SNOWFLAKE_TYPES[this.type].drawMethod]) {
      const drawMethod = SNOWFLAKE_TYPES[this.type].drawMethod;
      this[drawMethod](this.x, this.y, this.size * layer.size, this.rotation);
    } else {
      // Simple circle fallback
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * layer.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  Snowflake.prototype.update = function(deltaTime, currentWind) {
    // Normalize delta time to prevent large jumps
    const normalizedDelta = Math.min(deltaTime, 0.1); // Cap at 100ms

    const layer = DEPTH_LAYERS[this.layer];

    // Apply gravity based on layer (frame-rate independent)
    const gravityEffect = config.gravity * (config.snowSpeed / 100);
    this.vy += gravityEffect * normalizedDelta * 60; // 60 is the baseline FPS

    // Wind effect with turbulence (wind vector passed from animation loop)
    // Apply wind effect more directly, similar to gravity
    const windEffectX = currentWind.speed * Math.cos(currentWind.direction);
    const windEffectY = currentWind.speed * Math.sin(currentWind.direction) * 0.3;

    // Add turbulence
    const time = Date.now() * 0.001;
    const turbulenceX = Math.sin(time + this.phase) * config.turbulence * 50;
    const turbulenceY = Math.abs(Math.sin(time + this.phase)) * 10;

    // Swirling effect
    const swirlX = Math.sin(time + this.phase) * this.swirlAmplitude;
    const swirlY = Math.cos(time + this.phase) * this.swirlAmplitude * 0.5;

    // Combine forces - apply wind effect with proper scaling
    // Wind should be frame-rate independent like gravity
    this.vx += (windEffectX * normalizedDelta * 60) + (turbulenceX + swirlX) * normalizedDelta;
    this.vy += (windEffectY * normalizedDelta * 60) + (turbulenceY + swirlY) * normalizedDelta * 0.3;

    // Apply drag
    this.vx *= (1 - this.drag * normalizedDelta * 60);
    this.vy *= (1 - this.drag * normalizedDelta * 60);

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
    this.rotation += this.rotationSpeed * normalizedDelta * 60;

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
    // Convert slider value (0-100) to wind force
    // Increased multiplier to make wind effect more noticeable
    const windForce = config.windSpeed / 5; // Scale down for reasonable effect
    let totalWindX = windForce * Math.cos(config.windDirection);
    let totalWindY = windForce * Math.sin(config.windDirection);

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

    // Pre-create caches for all Unicode snowflake types
    Object.keys(SNOWFLAKE_TYPES).forEach(function(typeKey) {
      const typeConfig = SNOWFLAKE_TYPES[typeKey];
      if (typeConfig.unicode) {
        createUnicodeSnowflakeCache(typeConfig.unicode);
      }
    });

    // Load saved settings
    loadSettings();

    // Initialize UI
    initializeUI();

    // Create particles
    createParticles();

    // Start animation
    start();
  }

  function showPanel() {
    if (controlElement) {
      // Clear any existing timeout
      if (hidePanelTimeout) {
        clearTimeout(hidePanelTimeout);
        hidePanelTimeout = null;
      }
      controlElement.classList.add('visible');
    }
  }

  function hidePanel() {
    if (controlElement) {
      // Check if tips have been dismissed - if not, keep panel visible
      const tipsClicked = localStorage.getItem("tips-button-clicked");
      if (tipsClicked !== "1") {
        return; // Don't hide if tips haven't been dismissed
      }

      // Clear any existing timeout
      if (hidePanelTimeout) {
        clearTimeout(hidePanelTimeout);
        hidePanelTimeout = null;
      }
      // Hide panel after 2 seconds
      hidePanelTimeout = setTimeout(function() {
        if (controlElement) {
          controlElement.classList.remove('visible');
        }
        hidePanelTimeout = null;
      }, 2000);
    }
  }

  // Generate flake type controls from SNOWFLAKE_TYPES configuration
  function generateFlakeTypeControls() {
    const flakeTypeGroup = document.getElementById("flake-type-group");
    if (!flakeTypeGroup) return;

    // Clear existing content
    flakeTypeGroup.innerHTML = '';

    // Add "All" option
    const currentType = config.snowflakeType || 'dendrite';
    const allOption = document.createElement('label');
    allOption.className = 'flake-type-option';
    const isAllChecked = currentType === 'all';
    allOption.innerHTML = `
      <input type="radio" name="snowflakeType" value="all" ${isAllChecked ? 'checked' : ''}>
      <span class="flake-type-label">All</span>
    `;
    flakeTypeGroup.appendChild(allOption);

    // Add options for each snowflake type from configuration
    AVAILABLE_SNOWFLAKE_TYPES.forEach(function(type) {
      const typeConfig = SNOWFLAKE_TYPES[type];
      if (!typeConfig) return;

      const option = document.createElement('label');
      option.className = 'flake-type-option';
      option.title = typeConfig.title;
      
      const isChecked = currentType === type;
      option.innerHTML = `
        <input type="radio" name="snowflakeType" value="${type}" ${isChecked ? 'checked' : ''}>
        <span class="flake-icon">${typeConfig.icon}</span>
      `;
      
      flakeTypeGroup.appendChild(option);
    });
  }

  function initializeUI() {
    controlElement = document.getElementById("snow-simulation-control-panel");
    tipsElement = document.getElementById("tips");
    tipsButton = document.getElementById("tips-button");

    // Generate flake type controls from configuration
    generateFlakeTypeControls();

    // Setup panel visibility on mouse enter/leave of the panel itself only
    if (controlElement) {
      controlElement.addEventListener("mouseenter", showPanel);
      controlElement.addEventListener("mouseleave", hidePanel);
    }

    // Setup all controls
    setupAllControls();

    // Update UI to reflect loaded settings (after event listeners are attached)
    setTimeout(updateUIFromConfig, 0);

    // Handle tips
    handleTips();

    // Hide panel after page loads (if tips have been dismissed)
    // hidePanel() already has a 2-second delay built in
    hidePanel();
  }

  function setupAllControls() {
    // Get all control elements
    windSpeedSlider = document.getElementById("windSpeedSlider");
    windDirectionSlider = document.getElementById("windDirectionSlider");
    snowIntensitySlider = document.getElementById("snowIntensitySlider");
    blurToggle = document.getElementById("blurToggle");
    

    // Speed slider
    const speedSlider = document.getElementById("snowSpeedSlider");
    const speedValue = document.getElementById("snowSpeedValue");
    if (speedSlider && speedValue) {
      speedSlider.addEventListener("input", function() {
        config.snowSpeed = parseInt(this.value);
        speedValue.textContent = this.value;
        saveSettings();
      });
    }

    // Size slider
    const sizeSlider = document.getElementById("snowFlakeSizeSlider");
    const sizeValue = document.getElementById("snowSizeValue");
    if (sizeSlider && sizeValue) {
      sizeSlider.addEventListener("input", function() {
        config.snowFlakeMaxRadius = parseInt(this.value);
        sizeValue.textContent = this.value;
        recreateParticles(); // Recreate particles with new size
        saveSettings();
      });
    }

    // Wind speed
    const windSpeedValue = document.getElementById("windSpeedValue");
    if (windSpeedSlider && windSpeedValue) {
      windSpeedSlider.addEventListener("input", function() {
        config.windSpeed = parseInt(this.value);
        windSpeedValue.textContent = this.value;
        saveSettings();
      });
    }

    // Wind direction
    windDirectionArrow = document.getElementById("windDirectionArrow");
    const windDirectionValue = document.getElementById("windDirectionValue");
    if (windDirectionSlider && windDirectionValue) {
      windDirectionSlider.addEventListener("input", function() {
        const degrees = parseInt(this.value);
        config.windDirection = (degrees * Math.PI) / 180;
        windDirectionValue.textContent = degrees + "°";
        updateWindArrow(degrees);
        saveSettings();
      });
    }

    // Snow intensity (density)
    const snowDensityValue = document.getElementById("snowDensityValue");
    if (snowIntensitySlider && snowDensityValue) {
      snowIntensitySlider.addEventListener("input", function() {
        config.particleCount = parseInt(this.value);
        snowDensityValue.textContent = this.value;
        recreateParticles();
        saveSettings();
      });
    }

    // Blur toggle
    if (blurToggle) {
      blurToggle.addEventListener("change", function(e) {
        config.blurEnabled = e.target.checked;
        saveSettings();
      });
    }

    // Snowflake type radio buttons
    const snowflakeTypeRadios = document.querySelectorAll('input[name="snowflakeType"]');
    snowflakeTypeRadios.forEach(radio => {
      radio.addEventListener("change", function() {
        if (this.checked) {
          config.snowflakeType = this.value;
          updateSnowflakeTypes();
          saveSettings();
        }
      });
    });

    // Play/Pause button
    const playPauseButton = document.getElementById("playPauseButton");
    if (playPauseButton) {
      updatePlayPauseButton();
      playPauseButton.addEventListener("click", function() {
        if (isRunning) {
          stop();
        } else {
          start();
        }
      });
    }

    // Reset to defaults button
    const resetButton = document.getElementById("resetToDefaultsButton");
    if (resetButton) {
      resetButton.addEventListener("click", function() {
        resetToDefaults();
      });
    }
  }

  function handleTips() {
    if (!tipsElement || !tipsButton) return;

    const tipsClicked = localStorage.getItem("tips-button-clicked");
    if (tipsClicked !== "1") {
      tipsElement.style.visibility = "visible";
      showPanel();
    }

    tipsButton.addEventListener("click", function() {
      localStorage.setItem("tips-button-clicked", "1");
      tipsElement.style.visibility = "hidden";
      hidePanel();
    });
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];

    // Create particles distributed across layers in draw order (avoids sorting every frame)
    LAYER_ORDER.forEach(function(layerName) {
      const layer = DEPTH_LAYERS[layerName];
      const count = Math.floor(config.particleCount * layer.particleRatio);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height - canvas.height;
        const type = config.snowflakeType === 'all' ?
          AVAILABLE_SNOWFLAKE_TYPES[Math.floor(Math.random() * AVAILABLE_SNOWFLAKE_TYPES.length)] :
          config.snowflakeType;

        particles.push(new Snowflake(x, y, layerName, type));
      }
    });
  }

  function updateSnowflakeTypes() {
    particles.forEach(function(particle) {
      if (config.snowflakeType === 'all') {
        // Assign random type to each particle
        particle.type = AVAILABLE_SNOWFLAKE_TYPES[Math.floor(Math.random() * AVAILABLE_SNOWFLAKE_TYPES.length)];
      } else {
        // Assign the specific type to all particles
        particle.type = config.snowflakeType;
      }
    });
  }

  function recreateParticles() {
    createParticles();
  }

  function updateWindArrow(degrees) {
    if (windDirectionArrow) {
      // Rotate arrow to point in wind direction
      // Arrow starts pointing up (north), so we need to adjust:
      // 0° wind = blows right = arrow should point right (90deg rotation)
      // 90° wind = blows down = arrow should point down (180deg rotation)
      // 180° wind = blows left = arrow should point left (270deg rotation)
      // Formula: rotation = degrees + 90 (to convert from wind direction to arrow rotation)
      windDirectionArrow.style.transform = 'rotate(' + (degrees + 90) + 'deg)';
    }
  }


  function loadSettings() {
    try {
      const settings = localStorage.getItem('snowSimulationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.snowSpeed !== undefined) {
          config.snowSpeed = parsed.snowSpeed;
        }
        if (parsed.snowFlakeMaxRadius !== undefined) {
          config.snowFlakeMaxRadius = parsed.snowFlakeMaxRadius;
        }
        if (parsed.windSpeed !== undefined) {
          config.windSpeed = parsed.windSpeed;
        }
        if (parsed.windDirection !== undefined) {
          // Clamp wind direction to 0-180 degrees (0 to π radians)
          let degrees = parsed.windDirection * 180 / Math.PI;
          degrees = Math.max(0, Math.min(180, degrees));
          config.windDirection = (degrees * Math.PI) / 180;
        }
        if (parsed.particleCount !== undefined) {
          config.particleCount = parsed.particleCount;
        }
        if (parsed.blurEnabled !== undefined) {
          config.blurEnabled = parsed.blurEnabled;
        }
        if (parsed.snowflakeType !== undefined) {
          config.snowflakeType = parsed.snowflakeType;
        } else {
          config.snowflakeType = 'all'; // Default to all if not saved
        }
      }
    } catch (e) {
      console.warn('Failed to load snow simulation settings:', e);
    }
  }

  function updateUIFromConfig() {
    // Update speed slider
    const speedSlider = document.getElementById("snowSpeedSlider");
    const speedValue = document.getElementById("snowSpeedValue");
    if (speedSlider && speedValue) {
      speedSlider.value = config.snowSpeed;
      speedValue.textContent = config.snowSpeed;
    }

    // Update size slider
    const sizeSlider = document.getElementById("snowFlakeSizeSlider");
    const sizeValue = document.getElementById("snowSizeValue");
    if (sizeSlider && sizeValue) {
      sizeSlider.value = config.snowFlakeMaxRadius;
      sizeValue.textContent = config.snowFlakeMaxRadius;
    }

    // Update wind speed
    const windSpeedValue = document.getElementById("windSpeedValue");
    if (windSpeedSlider && windSpeedValue) {
      windSpeedSlider.value = config.windSpeed;
      windSpeedValue.textContent = Math.round(config.windSpeed);
    }

    // Update wind direction
    const windDirectionValue = document.getElementById("windDirectionValue");
    if (windDirectionSlider && windDirectionValue) {
      let degrees = Math.round(config.windDirection * 180 / Math.PI);
      // Clamp to 0-180 range
      degrees = Math.max(0, Math.min(180, degrees));
      windDirectionSlider.value = degrees;
      windDirectionValue.textContent = degrees + '°';
      // Update config to match clamped value
      config.windDirection = (degrees * Math.PI) / 180;
      // Update arrow rotation
      updateWindArrow(degrees);
    }

    // Update intensity
    const intensityValue = document.getElementById("snowDensityValue");
    if (snowIntensitySlider && intensityValue) {
      snowIntensitySlider.value = config.particleCount;
      intensityValue.textContent = config.particleCount;
    }

    // Update blur toggle
    if (blurToggle) {
      blurToggle.checked = config.blurEnabled;
    }

    // Update snowflake type radio buttons
    const snowflakeTypeRadiosUpdate = document.querySelectorAll('input[name="snowflakeType"]');
    snowflakeTypeRadiosUpdate.forEach(radio => {
      radio.checked = radio.value === config.snowflakeType;
    });
    // Update snowflake types to match the loaded setting
    updateSnowflakeTypes();

  }

  function resetToDefaults() {
    // Reset config to default values
    config.quality = DEFAULT_CONFIG.quality;
    config.particleCount = DEFAULT_CONFIG.particleCount;
    config.gravity = DEFAULT_CONFIG.gravity;
    config.windSpeed = DEFAULT_CONFIG.windSpeed;
    config.windDirection = DEFAULT_CONFIG.windDirection;
    config.turbulence = DEFAULT_CONFIG.turbulence;
    config.snowSpeed = DEFAULT_CONFIG.snowSpeed;
    config.snowFlakeMaxRadius = DEFAULT_CONFIG.snowFlakeMaxRadius;
    config.blurEnabled = DEFAULT_CONFIG.blurEnabled;
    config.snowColor = DEFAULT_CONFIG.snowColor;
    config.backgroundColor = DEFAULT_CONFIG.backgroundColor;
    config.snowflakeType = DEFAULT_CONFIG.snowflakeType;

    // Recreate particles with new settings
    recreateParticles();

    // Update UI
    updateUIFromConfig();

    // Update arrow
    const degrees = Math.round(config.windDirection * 180 / Math.PI);
    updateWindArrow(degrees);

    // Save settings
    saveSettings();
  }

  function saveSettings() {
    try {
      const settings = {
        windSpeed: config.windSpeed,
        windDirection: config.windDirection,
        particleCount: config.particleCount,
        blurEnabled: config.blurEnabled,
        snowflakeType: config.snowflakeType,
        snowSpeed: config.snowSpeed,
        snowFlakeMaxRadius: config.snowFlakeMaxRadius
      };
      localStorage.setItem('snowSimulationSettings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save snow simulation settings:', e);
    }
  }

  let lastFrameTime = 0;

  function animate(currentTime) {
    if (!isRunning) return;

    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    // Update wind gusts once per frame (not per particle)
    updateWindGusts();
    const currentWind = calculateCurrentWind();

    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Particles are already in draw order (created in LAYER_ORDER sequence)
    // No need to sort every frame - this saves significant CPU time

    // Update and draw particles
    particles.forEach(function(particle) {
      particle.update(deltaTime, currentWind);
      particle.draw();
    });

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    lastFrameTime = performance.now();
    animate(lastFrameTime);
    updatePlayPauseButton();
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    updatePlayPauseButton();
  }

  function updatePlayPauseButton() {
    const playPauseButton = document.getElementById("playPauseButton");
    if (playPauseButton) {
      playPauseButton.textContent = isRunning ? "Stop" : "Start";
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
    saveSettings: saveSettings,
    resetToDefaults: resetToDefaults
  };
})();