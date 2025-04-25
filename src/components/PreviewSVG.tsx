interface PreviewSVGProps {
  cavityType: string;
  trackType: string;
  jambType: string;
  studSize: string;
  frontstayOption: string;
  doorHeight: number;
  doorWidth: number;
  floorClearance: number;
  noClosingJamb: boolean;
  straightline: boolean;
  squareStop: boolean;
  widthValue: number;
  widthCalculationMethod: string;
  heightValue: number;
  heightCalculationMethod: string;
}

export default function PreviewSVG(props: PreviewSVGProps) {
  const {
    doorWidth,
    cavityType,
    widthValue,
    widthCalculationMethod,
    doorHeight,
    heightValue,
    heightCalculationMethod,
    trackType,
    jambType,
    frontstayOption,
    noClosingJamb,
    straightline,
  } = props;
  
  // Scale: 1mm = 0.5px for reasonable display size
  const scale = 0.5;
  
  // Base plate dimensions (in mm before scaling)
  const isStabilineUsed = frontstayOption === 'Finned Stabiline' || frontstayOption === 'Un-Finned Stabiline';
  const singleBasePlateLength = isStabilineUsed ? doorWidth + 13 : doorWidth - 7;
  const basePlateLength = singleBasePlateLength; // Keep this as single length, we'll offset for double
  const basePlateHeight = 10; // 10mm height
  
  // Backstay dimensions
  const backstayWidth = 10; // 10mm width
  const backstayHeight = (heightCalculationMethod === 'doorHeight'
    ? heightValue // Use heightValue when calculating by door height
    : doorHeight) - 10; // Subtract 10mm for the miter joint
  const topOffset = 10; // 10mm from top

  // Head timber dimensions
  const isTriumph = trackType === 'Triumph';
  const getHeadTimberDimensions = () => {
    // For Straightline + Triumph track combinations
    if (straightline && isTriumph) {
      if (jambType === 'Flat Pine') {
        return {
          width: 30,  // 30mm for Flat Pine Straightline
          thickness: 10  // 10mm for Flat Pine Straightline
        };
      } else if (jambType === 'Grooved Pine') {
        return {
          width: 30,  // 30mm for Grooved Pine Straightline
          thickness: 53  // 53mm for Grooved Pine Straightline
        };
      }
    }
    
    // Default dimensions for non-Straightline configurations
    return {
      width: isTriumph ? 31 : 43,
      thickness: isTriumph ? 29.5 : 28
    };
  };

  const { width: headTimberWidth, thickness: headTimberThickness } = getHeadTimberDimensions();
  const baseLength = doorWidth;
  const headTimberLength = jambType === 'Flat Pine' ? baseLength - 10 : baseLength;
  const headTimberOffset = 1; // 1mm offset from backstay (real-world measurement)
  const headTimberVisualOffset = 0; // Visual offset (aligned with backstay)

  // Nog dimensions
  const nogWidth = 85; // 85mm width (shown as height when rotated)
  const nogThickness = 18; // 18mm thickness (shown as depth when rotated)
  const nogOffset = 1; // 1mm offset from backstay (real-world measurement)
  const nogVisualOffset = -5; // Move nogs 5mm to the left to sit behind frontstay
  const nogLength = doorWidth - (isStabilineUsed ? 49 : 10);

  // Calculate nog positions (5 visible nogs)
  const bottomNogPosition = backstayHeight + topOffset - basePlateHeight - nogWidth + 1; // 1mm up from baseplate, extending upward
  const topNogPosition = topOffset + headTimberThickness + 1; // 1mm below head timber
  const availableSpace = bottomNogPosition - topNogPosition;
  const nogSpacing = availableSpace / 4; // Space between nogs (4 gaps between 5 nogs)

  // SVG canvas size (add padding around the drawing)
  const padding = 50;
  const svgWidth = (Math.max(basePlateLength, headTimberLength) * scale) + (padding * 2);
  const svgHeight = ((backstayHeight + topOffset) * scale) + (padding * 2);

  // Colors
  const aluminumColor = "#808080"; // Grey color
  const timberColor = "#D2B48C"; // Tan color for timber components

  // Calculate the offset for the right side cavity in double cavity setup
  const rightSideOffset = cavityType === 'Double' ? baseLength + backstayWidth : 0;

  // Function to generate a nog path at a given vertical position
  const renderNog = (verticalPosition: number, isRight: boolean = false) => {
    const xOffset = isRight ? rightSideOffset : 0;
    return (
      <path
        d={`
          M ${(backstayWidth + nogVisualOffset + xOffset) * scale} ${verticalPosition * scale}
          L ${(backstayWidth + nogVisualOffset + nogLength + xOffset) * scale} ${verticalPosition * scale}
          L ${(backstayWidth + nogVisualOffset + nogLength + xOffset) * scale} ${(verticalPosition + nogWidth) * scale}
          L ${(backstayWidth + nogVisualOffset + xOffset) * scale} ${(verticalPosition + nogWidth) * scale}
          Z
        `}
        fill={timberColor}
      />
    );
  };

  // Frontstay dimensions
  const frontstayWidth = 20; // Increased from 12mm to 20mm to cover nog ends
  const frontstayHeight = (() => {
    const baseHeight = heightCalculationMethod === 'doorHeight' ? heightValue : doorHeight;
    switch (frontstayOption) {
      case 'Light Duty':
        return baseHeight - 10; // Standard 10mm deduction
      case 'Heavy Duty':
        return baseHeight - 10; // Standard 10mm deduction
      case 'Finned Stabiline':
        return baseHeight - 9; // 9mm deduction for stabiline
      case 'Un-Finned Stabiline':
        return baseHeight - 9; // 9mm deduction for stabiline
      default:
        return baseHeight - 10; // Default to standard deduction
    }
  })();
  const frontstayOffset = basePlateLength - frontstayWidth; // Positioned at end of baseplate

  // Vertical jamb dimensions
  const verticalJambWidth = jambType === 'Flat Pine' ? 32 : 44; // 32mm for Flat Pine, 44mm for Grooved Pine
  const verticalJambThickness = jambType === 'Flat Pine' ? 18 : 30; // 18mm for Flat Pine, 30mm for Grooved Pine
  const verticalJambOffset = frontstayOffset + frontstayWidth; // Position right after frontstay

  // Closing jamb dimensions (same width as flat pine jamb)
  const closingJambWidth = 18; // Always 18mm wide
  const closingJambRebate = 9; // 9mm rebate into head timber
  const closingJambOffset = headTimberLength - closingJambWidth; // Position at the end of head timber

  // Right side components for double cavity
  const RightSideComponents = () => {
    if (cavityType !== 'Double') return null;
    return null; // Temporarily disable double cavity rendering
  };

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ maxWidth: '100%', height: 'auto', background: 'white' }}
    >
      <g transform={`translate(${padding}, ${padding})`}>
        {/* Head Timber (rendered first, so it appears behind) */}
        <path
          d={`
            M ${(backstayWidth + headTimberVisualOffset) * scale} ${topOffset * scale}
            L ${headTimberLength * scale} ${topOffset * scale}
            L ${headTimberLength * scale} ${(topOffset + headTimberThickness) * scale}
            L ${(backstayWidth + headTimberVisualOffset) * scale} ${(topOffset + headTimberThickness) * scale}
            Z
          `}
          fill={timberColor}
        />

        {/* Left side nogs */}
        {renderNog(topNogPosition)}
        {renderNog(topNogPosition + nogSpacing)}
        {renderNog(topNogPosition + (2 * nogSpacing))}
        {renderNog(topNogPosition + (3 * nogSpacing))}
        {renderNog(bottomNogPosition)}

        {/* Closing Jamb */}
        {!noClosingJamb && cavityType !== 'Double' && (
          <path
            d={`
              M ${closingJambOffset * scale} ${(backstayHeight + topOffset) * scale}
              L ${(closingJambOffset + closingJambWidth) * scale} ${(backstayHeight + topOffset) * scale}
              L ${(closingJambOffset + closingJambWidth) * scale} ${topOffset * scale}
              L ${closingJambOffset * scale} ${topOffset * scale}
              Z
            `}
            fill={timberColor}
          />
        )}

        {/* Left Vertical Jamb */}
        <path
          d={`
            M ${verticalJambOffset * scale} ${(backstayHeight + topOffset) * scale}
            L ${(verticalJambOffset + verticalJambWidth) * scale} ${(backstayHeight + topOffset) * scale}
            L ${(verticalJambOffset + verticalJambWidth) * scale} ${(topOffset + headTimberThickness) * scale}
            L ${verticalJambOffset * scale} ${(topOffset + headTimberThickness) * scale}
            Z
          `}
          fill={timberColor}
        />

        {/* Left Base Plate */}
        <path
          d={`
            M 0 ${(backstayHeight + topOffset) * scale}
            L ${backstayWidth * scale} ${(backstayHeight + topOffset - basePlateHeight) * scale}
            L ${basePlateLength * scale} ${(backstayHeight + topOffset - basePlateHeight) * scale}
            L ${basePlateLength * scale} ${(backstayHeight + topOffset) * scale}
            Z
          `}
          fill={aluminumColor}
        />

        {/* Left Frontstay */}
        <path
          d={`
            M ${frontstayOffset * scale} ${(backstayHeight + topOffset) * scale}
            L ${(frontstayOffset + frontstayWidth) * scale} ${(backstayHeight + topOffset) * scale}
            L ${(frontstayOffset + frontstayWidth) * scale} ${(topOffset + headTimberThickness) * scale}
            L ${frontstayOffset * scale} ${(topOffset + headTimberThickness) * scale}
            Z
          `}
          fill={aluminumColor}
        />

        {/* Left Backstay */}
        <path
          d={`
            M 0 ${topOffset * scale}
            L ${backstayWidth * scale} ${topOffset * scale}
            L ${backstayWidth * scale} ${(backstayHeight + topOffset - basePlateHeight) * scale}
            L 0 ${(backstayHeight + topOffset) * scale}
            Z
          `}
          fill={aluminumColor}
        />

        {/* Right side components for double cavity */}
        <RightSideComponents />
      </g>
    </svg>
  );
} 