const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const renderHotspotMarker = \([\s\S]*?\};\n  \};/m;

const newRenderer = `const renderHotspotMarker = (hotspot: MapHotspot) => {
    const isSelected = selectedHotspotId === hotspot.id;
    const color = getStatusColor(hotspot.status);
    
    // Define shapes based on status
    let shape;
    switch (hotspot.status) {
      case "critical":
        // Octagon
        shape = <polygon points="-10,-24 10,-24 24,-10 24,10 10,24 -10,24 -24,10 -24,-10" fill="none" stroke={color} strokeWidth={isSelected ? "3" : "2"} />;
        break;
      case "warning":
        // Diamond
        shape = <polygon points="0,-20 20,0 0,20 -20,0" fill="none" stroke={color} strokeWidth={isSelected ? "3" : "2"} />;
        break;
      case "offline":
        // Dashed Circle
        shape = <circle r={isSelected ? "14" : "10"} fill="none" stroke={color} strokeWidth={isSelected ? "3" : "2"} strokeDasharray="4 4" />;
        break;
      case "good":
      case "info":
      default:
        // Circle
        shape = <circle r={isSelected ? "14" : "10"} fill="none" stroke={color} strokeWidth={isSelected ? "3" : "2"} />;
        break;
    }

    return (
      <g 
        key={hotspot.id} 
        transform={\`translate(\${hotspot.cx * 16}, \${hotspot.cy * 9})\`} 
        onClick={() => setSelectedHotspotId(hotspot.id)}
        className="cursor-pointer"
        role="button"
        aria-label={\`\${hotspot.status} issue at \${hotspot.title}\`}
      >
        {/* Outer Glow */}
        <circle 
          r={isSelected ? "32" : "24"} 
          fill={color} 
          opacity="0.25" 
          className={hotspot.status === "critical" ? "animate-pulse" : ""}
        />
        {/* Main Shape */}
        {shape}
        {/* Inner Dot */}
        <circle 
          r={isSelected ? "6" : "4"} 
          fill={color} 
        />
      </g>
    );
  };`;

code = code.replace(regex, newRenderer);
fs.writeFileSync('src/App.tsx', code);
