import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  RadioGroup,
  Radio,
  ButtonGroup,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import PreviewSVG from './PreviewSVG';
import { ExpandMore, ExpandLess, Refresh, Info, Print } from '@mui/icons-material';

interface CalculatorState {
  quantity: number;
  cavityType: string;
  studSize: string;
  trackType: string;
  jambType: string;
  frontstayOption: string;
  heightCalculationMethod: string;
  widthCalculationMethod: string;
  heightValue: number;
  widthValue: number;
  doorHeight: number;
  doorWidth: number;
  floorClearance: number;
  // Finishing options
  straightline: boolean;
  noClosingJamb: boolean;
  fullHeightDetail: boolean;
  squareStop: boolean;
  plyPanel: boolean;
  braced: boolean;
  plyPanelSide: string;
  bracedSide: string;
  floorType: string;
  cutItems: { [key: string]: boolean };
}

interface CutListItem {
  description: string;
  quantity: number;
  length: number;
  width: number;
  thickness: number;
}

export default function Calculator() {
  // Define initial state
  const defaultState = {
    quantity: 1,
    cavityType: 'Single',
    studSize: '90mm',
    trackType: 'Triumph',
    jambType: 'Flat Pine',
    frontstayOption: 'Heavy Duty',
    heightCalculationMethod: 'doorHeight',
    widthCalculationMethod: 'doorWidth',
    heightValue: 1980,
    widthValue: 760,
    doorHeight: 1980,
    doorWidth: 760,
    floorClearance: 25,
    // Finishing options defaults
    straightline: false,
    noClosingJamb: false,
    fullHeightDetail: false,
    squareStop: false,
    plyPanel: false,
    braced: false,
    plyPanelSide: 'left',
    bracedSide: 'left',
    floorType: 'Concrete',
    cutItems: {},
  } as const;

  const [state, setState] = useState<CalculatorState>(defaultState);

  // Add state for preview collapse
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

  // Handle Square Stop changes
  useEffect(() => {
    if (state.squareStop) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Un-Finned Stabiline'
      }));
    }
  }, [state.squareStop]);

  // Handle Light Duty conditions
  useEffect(() => {
    if (state.frontstayOption === 'Light Duty' && 
        (state.jambType !== 'Grooved Pine' || state.doorHeight > 1980)) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Heavy Duty'
      }));
    }
  }, [state.jambType, state.doorHeight]);

  const handleChange = (event: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState(prev => ({
      ...prev,
      [name]: value,
      // Update doorHeight or doorWidth when their respective values change
      ...(name === 'heightValue' && {
        doorHeight: prev.heightCalculationMethod === 'doorHeight' ? parseInt(value) || 0 : prev.doorHeight,
      }),
      ...(name === 'widthValue' && {
        doorWidth: prev.widthCalculationMethod === 'doorWidth' ? parseInt(value) || 0 : prev.doorWidth,
      }),
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setState(prev => ({
      ...prev,
      [name]: checked,
      // If Square Stop is checked, force Un-Finned Stabiline
      ...(name === 'squareStop' && {
        frontstayOption: checked ? 'Un-Finned Stabiline' : 'Heavy Duty'
      })
    }));
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numValue = parseInt(value) || 0;
    
    // Ensure quantity is at least 1
    if (name === 'quantity' && numValue < 1) {
      setState(prev => ({
        ...prev,
        quantity: 1,
      }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleQuickSelect = (value: number, type: 'height' | 'width') => {
    setState(prev => ({
      ...prev,
      ...(type === 'height' ? {
        heightValue: value,
        doorHeight: value
      } : {
        widthValue: value,
        doorWidth: value
      })
    }));
  };

  const renderHeightQuickSelect = () => {
    if (state.heightCalculationMethod === 'doorHeight') {
      return (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="caption" display="block" gutterBottom>
            Quick Select Height (mm):
          </Typography>
          <ButtonGroup size="small" aria-label="quick select height buttons">
            {[1980, 2200, 2400].map((height) => (
              <Button
                key={height}
                onClick={() => handleQuickSelect(height, 'height')}
                variant={state.heightValue === height ? "contained" : "outlined"}
              >
                {height}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      );
    }
    return null;
  };

  const renderWidthQuickSelect = () => {
    if (state.widthCalculationMethod === 'doorWidth') {
      return (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="caption" display="block" gutterBottom>
            Quick Select Width (mm):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[610, 660, 710, 760, 810, 860, 910, 960, 1000, 1100, 1200].map((width) => (
              <Button
                key={width}
                onClick={() => handleQuickSelect(width, 'width')}
                variant={state.widthValue === width ? "contained" : "outlined"}
                size="small"
              >
                {width}
              </Button>
            ))}
          </Box>
        </Box>
      );
    }
    return null;
  };

  const calculatePineNogs = (): CutListItem | null => {
    // If ply panel or bracing is on both sides, no nogs are needed
    if (state.plyPanelSide === 'both' || (state.braced && state.bracedSide === 'both')) {
      return null;
    }

    // Base quantity based on cavity type
    let baseQuantity = state.cavityType === 'Single' ? 10 : 20;

    // If ply panel or bracing is on one side only, halve the quantity
    if (state.plyPanel || state.braced) {
      baseQuantity = baseQuantity / 2;
    }

    // Calculate length based on stabiline usage
    const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || 
                           state.frontstayOption === 'Un-Finned Stabiline';
    const nogLength = state.doorWidth - (isStabilineUsed ? 49 : 10);

    return {
      description: '85mm x 18mm Pine Nogs',
      quantity: baseQuantity * state.quantity, // Multiply by the overall quantity
      length: nogLength,
      width: 85,
      thickness: 18
    };
  };

  const calculateFrontstays = (): CutListItem | null => {
    // Don't calculate if no frontstay option is selected
    if (!state.frontstayOption) {
      return null;
    }

    // Base quantity based on cavity type
    const baseQuantity = state.cavityType === 'Single' ? 2 : 4;

    // Calculate length based on frontstay type
    const isStabiline = state.frontstayOption === 'Finned Stabiline' || 
                       state.frontstayOption === 'Un-Finned Stabiline';
    const frontstayLength = state.doorHeight + state.floorClearance + (isStabiline ? 9 : 10);

    return {
      description: `${state.frontstayOption} Aluminium Frontstay`,
      quantity: baseQuantity * state.quantity, // Multiply by the overall quantity
      length: frontstayLength,
      width: 0, // Not applicable for frontstays
      thickness: 0 // Not applicable for frontstays
    };
  };

  const calculateClosingJamb = (): CutListItem | null => {
    // Don't show if no closing jamb is selected
    if (state.noClosingJamb) {
      return null;
    }

    // Calculate length based on track type
    const lengthAddition = state.trackType === 'Triumph' ? 40 : 53;
    const jambLength = state.doorHeight + state.floorClearance + lengthAddition;

    // One Piece Closing Jamb conditions:
    // - Stud size must be 90mm AND
    // - Jamb type must be Flat Pine
    const isOnePiece = state.studSize === '90mm' && state.jambType === 'Flat Pine';
    
    if (isOnePiece) {
      return {
        description: '112mm x 19mm Flat Pine One Piece Closing Jamb',
        quantity: state.quantity,
        length: jambLength,
        width: 112,
        thickness: 19
      };
    } else {
      // Three Piece Closing Jamb dimensions based on jamb type
      const width = state.jambType === 'Flat Pine' ? 32 : 44;
      const thickness = state.jambType === 'Flat Pine' ? 18 : 30;
      const jambType = state.jambType === 'Flat Pine' ? 'Flat Pine' : 'Grooved Pine';
      
      return {
        description: `${width}mm x ${thickness}mm ${jambType} Three Piece Closing Jamb`,
        quantity: state.quantity * 3, // 3 pieces per jamb
        length: jambLength,
        width,
        thickness
      };
    }
  };

  const calculateHeadTimber = (): CutListItem | null => {
    // Determine dimensions based on track type and straightline option
    const isTriumph = state.trackType === 'Triumph';
    let width = isTriumph ? 31 : 43;  // Default values
    let thickness = isTriumph ? 29.5 : 28;  // Default values

    if (state.straightline) {
      if (state.trackType === 'Ultra') {
        // Ultra track with straightline
        if (state.jambType === 'Flat Pine') {
          width = 28;
          thickness = 21;
        } else if (state.jambType === 'Grooved Pine') {
          width = 30;
          thickness = 51;
        }
      } else if (isTriumph) {
        // Triumph track with straightline
        if (state.jambType === 'Flat Pine') {
          width = 30;
          thickness = 10;
        } else if (state.jambType === 'Grooved Pine') {
          width = 30;
          thickness = 53;
        }
      }
    }

    const description = `${width}mm x ${thickness}mm Head Timber${state.straightline ? ' <span style="font-weight: bold; font-size: 1.1em;">⊗SL</span>' : ''}`;

    // Calculate quantity based on cavity type
    const baseQuantity = state.cavityType === 'Single' ? 2 : 4;
    const totalQuantity = baseQuantity * state.quantity;

    // Calculate length based on jamb type
    const baseLength = state.doorWidth * 2;
    const length = state.jambType === 'Flat Pine' ? baseLength - 10 : baseLength;

    return {
      description,
      quantity: totalQuantity,
      length,
      width,
      thickness
    };
  };

  const calculateHeadTrack = (): CutListItem | null => {
    // Determine description based on track type
    const description = state.trackType === 'Triumph' 
      ? 'Triumph Aluminium Head Track'
      : 'Ultra Aluminium Head Track';

    // Calculate quantity based on cavity type
    const baseQuantity = state.cavityType === 'Single' ? 1 : 2;
    const totalQuantity = baseQuantity * state.quantity;

    // Calculate length based on cavity type
    const length = state.cavityType === 'Single' 
      ? state.doorWidth * 2 
      : state.doorWidth * 2 - 10;

    return {
      description,
      quantity: totalQuantity,
      length,
      width: 0, // Not applicable for head track
      thickness: 0 // Not applicable for head track
    };
  };

  const calculateBackstay = (): CutListItem | null => {
    // Get the width from the stud size (remove 'mm' and convert to number)
    const width = parseInt(state.studSize.replace('mm', ''));

    // Calculate quantity based on cavity type
    const baseQuantity = state.cavityType === 'Single' ? 1 : 2;
    const totalQuantity = baseQuantity * state.quantity;

    // Calculate length based on track type
    const lengthAddition = state.trackType === 'Triumph' ? 40 : 53;
    const length = state.doorHeight + state.floorClearance + lengthAddition;

    return {
      description: `${width}mm Aluminium Backstay`,
      quantity: totalQuantity,
      length,
      width: 0, // Not applicable for backstay
      thickness: 0 // Not applicable for backstay
    };
  };

  const calculateBaseplate = (): CutListItem | null => {
    // Get the width from the stud size (remove 'mm' and convert to number)
    const width = parseInt(state.studSize.replace('mm', ''));

    // Calculate quantity based on cavity type
    const baseQuantity = state.cavityType === 'Single' ? 1 : 2;
    const totalQuantity = baseQuantity * state.quantity;

    // Calculate length based on stabiline usage
    const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || 
                           state.frontstayOption === 'Un-Finned Stabiline';
    const length = isStabilineUsed 
      ? state.doorWidth + 13 
      : state.doorWidth - 7;

    return {
      description: `${width}mm Aluminium Baseplate`,
      quantity: totalQuantity,
      length,
      width: 0, // Not applicable for baseplate
      thickness: 0 // Not applicable for baseplate
    };
  };

  const calculateVerticalJambs = (): CutListItem | null => {
    // Determine dimensions and description based on jamb type
    const isFlatPine = state.jambType === 'Flat Pine';
    const width = isFlatPine ? 32 : 44;
    const thickness = isFlatPine ? 18 : 30;
    const description = `${width}mm x ${thickness}mm ${state.jambType} Vertical Jambs`;

    // Calculate quantity based on cavity type
    const baseQuantity = state.cavityType === 'Single' ? 2 : 4;
    const totalQuantity = baseQuantity * state.quantity;

    // Calculate length based on jamb type and stabiline usage
    const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || 
                           state.frontstayOption === 'Un-Finned Stabiline';
    
    let lengthAddition;
    if (isFlatPine) {
      lengthAddition = isStabilineUsed ? 9 : 10;
    } else {
      lengthAddition = isStabilineUsed ? 23 : 20;
    }
    
    const length = state.doorHeight + state.floorClearance + lengthAddition;

    return {
      description,
      quantity: totalQuantity,
      length,
      width,
      thickness
    };
  };

  const calculateHeadJamb = (): CutListItem | null => {
    // If straightline with Triumph track and Grooved Pine, no head jamb is required
    if (state.straightline && state.trackType === 'Triumph' && state.jambType === 'Grooved Pine') {
      return null;
    }

    // Determine dimensions based on track type and straightline option
    let width = 32;  // Default width
    let thickness = 18;  // Default thickness
    
    if (state.straightline) {
      if (state.trackType === 'Triumph') {
        // Triumph track with straightline
        if (state.jambType === 'Flat Pine') {
          width = 13;
          thickness = 41;
        }
      } else if (state.trackType === 'Ultra') {
        // Ultra track with straightline
        if (state.jambType === 'Flat Pine') {
          width = 21;
          thickness = 28;
        } else if (state.jambType === 'Grooved Pine') {
          width = 30;
          thickness = 51;
        }
      }
    } else {
      // Non-straightline dimensions
      const isFlatPine = state.jambType === 'Flat Pine';
      width = isFlatPine ? 32 : 44;
      thickness = isFlatPine ? 18 : 30;
    }

    const description = `${width}mm x ${thickness}mm ${state.jambType} Head Jamb${state.straightline ? ' <span style="font-weight: bold; font-size: 1.1em;">⊗SL</span>' : ''}`;

    // Calculate quantity based on cavity type
    const baseQuantity = state.cavityType === 'Single' ? 2 : 4;
    const totalQuantity = baseQuantity * state.quantity;

    // Calculate length based on jamb type, cavity type, and stabiline usage
    const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || 
                           state.frontstayOption === 'Un-Finned Stabiline';
    
    let length;
    if (state.jambType === 'Flat Pine') {
      if (state.cavityType === 'Single') {
        length = isStabilineUsed ? state.doorWidth - 28 : state.doorWidth - 30;
      } else {
        length = state.doorWidth * 2 - 40; // Same for both stabiline and non-stabiline
      }
    } else {
      if (state.cavityType === 'Single') {
        length = state.doorWidth + 30; // Same for both stabiline and non-stabiline
      } else {
        length = state.doorWidth * 2 + 20; // Same for both stabiline and non-stabiline
      }
    }

    return {
      description,
      quantity: totalQuantity,
      length,
      width,
      thickness
    };
  };

  const calculateCutList = (): CutListItem[] => {
    const cutList: CutListItem[] = [];
    
    const pineNogs = calculatePineNogs();
    if (pineNogs) {
      cutList.push(pineNogs);
    }

    const frontstays = calculateFrontstays();
    if (frontstays) {
      cutList.push(frontstays);
    }

    const closingJamb = calculateClosingJamb();
    if (closingJamb) {
      cutList.push(closingJamb);
    }

    const headTimber = calculateHeadTimber();
    if (headTimber) {
      cutList.push(headTimber);
    }

    const headTrack = calculateHeadTrack();
    if (headTrack) {
      cutList.push(headTrack);
    }

    const backstay = calculateBackstay();
    if (backstay) {
      cutList.push(backstay);
    }

    const baseplate = calculateBaseplate();
    if (baseplate) {
      cutList.push(baseplate);
    }

    const verticalJambs = calculateVerticalJambs();
    if (verticalJambs) {
      cutList.push(verticalJambs);
    }

    const headJamb = calculateHeadJamb();
    if (headJamb) {
      cutList.push(headJamb);
    }

    return cutList;
  };

  const generateHeading = (): string => {
    let heading = '';

    // Add "Braced" at the beginning if selected
    if (state.braced) {
      heading += 'Braced ';
    }

    // Add cavity type (remove Biparting)
    const cavityType = state.cavityType.replace(' (Biparting)', '');
    heading += `${cavityType} `;

    // Add "Stabiline" in red if a Stabiline frontstay is selected
    if (state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline') {
      heading += '<span style="color: red; font-weight: bold;">Stabiline</span> ';
    }

    // Add "Straightline" in blue if selected
    if (state.straightline) {
      heading += '<span style="color: blue; font-weight: bold;">Straightline</span> ';
    }

    // Add track type-based text
    heading += state.trackType === 'Triumph' ? 'Optimiser ' : 'Ultra ';

    // Add dimensions
    heading += `${state.doorHeight} x ${state.doorWidth} `;

    // Add stud size
    heading += `${state.studSize} Stud `;

    // Add jamb type
    heading += `${state.jambType} Cavity Slider`;

    // Add ply panel info if selected
    if (state.plyPanel) {
      if (state.plyPanelSide === 'both') {
        heading += ' with Ply on Both Sides';
      } else {
        heading += ` with Ply on ${state.plyPanelSide === 'left' ? 'Left' : 'Right'} Side`;
      }
    }

    return heading;
  };

  const handleCutItemToggle = (description: string) => {
    setState(prev => ({
      ...prev,
      cutItems: {
        ...prev.cutItems,
        [description]: !prev.cutItems[description]
      }
    }));
  };

  const getLengthFormula = (item: CutListItem): string => {
    if (item.description.includes('Frontstay')) {
      const isStabiline = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + ${isStabiline ? '9mm' : '10mm'}`;
    }
    if (item.description.includes('Closing Jamb')) {
      const lengthAddition = state.trackType === 'Triumph' ? 40 : 53;
      return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + ${lengthAddition}mm`;
    }
    if (item.description.includes('Head Timber')) {
      const baseLength = state.doorWidth * 2;
      return state.jambType === 'Flat Pine' ? `(Door Width (${state.doorWidth}mm) * 2) - 10mm` : `Door Width (${state.doorWidth}mm) * 2`;
    }
    if (item.description.includes('Pine Nogs')) {
      const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      return `Door Width (${state.doorWidth}mm) - ${isStabilineUsed ? '49mm' : '10mm'}`;
    }
    if (item.description.includes('Head Track')) {
      return state.cavityType === 'Single' 
        ? `Door Width (${state.doorWidth}mm) * 2`
        : `(Door Width (${state.doorWidth}mm) * 2) - 10mm`;
    }
    if (item.description.includes('Backstay')) {
      const lengthAddition = state.trackType === 'Triumph' ? 40 : 53;
      return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + ${lengthAddition}mm`;
    }
    if (item.description.includes('Baseplate')) {
      const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      return isStabilineUsed 
        ? `Door Width (${state.doorWidth}mm) + 13mm`
        : `Door Width (${state.doorWidth}mm) - 7mm`;
    }
    if (item.description.includes('Vertical Jambs')) {
      const isFlatPine = state.jambType === 'Flat Pine';
      const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      const addition = isFlatPine 
        ? (isStabilineUsed ? 9 : 10)
        : (isStabilineUsed ? 23 : 20);
      return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + ${addition}mm`;
    }
    if (item.description.includes('Head Jamb')) {
      const isFlatPine = state.jambType === 'Flat Pine';
      const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      
      if (isFlatPine) {
        if (state.cavityType === 'Single') {
          return isStabilineUsed 
            ? `Door Width (${state.doorWidth}mm) - 28mm`
            : `Door Width (${state.doorWidth}mm) - 30mm`;
        } else {
          return `(Door Width (${state.doorWidth}mm) * 2) - 40mm`;
        }
      } else {
        if (state.cavityType === 'Single') {
          return `Door Width (${state.doorWidth}mm) + 30mm`;
        } else {
          return `(Door Width (${state.doorWidth}mm) * 2) + 20mm`;
        }
      }
    }
    return '';
  };

  const renderCutList = () => {
    const cutList = calculateCutList();
    
    // Separate items into Cavity Head and Cavity Pocket
    const cavityHeadItems = cutList.filter(item => 
      item.description.includes('Head Track') || 
      item.description.includes('Head Timber') ||
      item.description.includes('Head Jamb')
    );
    
    const cavityPocketItems = cutList.filter(item => 
      !item.description.includes('Head Track') && 
      !item.description.includes('Head Timber') &&
      !item.description.includes('Head Jamb')
    );

    // Further separate each category into timber and aluminium
    const cavityHeadAluminium = cavityHeadItems.filter(item => 
      item.description.includes('Aluminium') || 
      item.description.includes('Track')
    );
    const cavityHeadTimber = cavityHeadItems.filter(item => 
      !item.description.includes('Aluminium') &&
      !item.description.includes('Track')
    );

    const cavityPocketAluminium = cavityPocketItems.filter(item => 
      item.description.includes('Aluminium') || 
      item.description.includes('Frontstay') ||
      item.description.includes('Backstay') ||
      item.description.includes('Baseplate')
    );
    const cavityPocketTimber = cavityPocketItems.filter(item => 
      !item.description.includes('Aluminium') &&
      !item.description.includes('Frontstay') &&
      !item.description.includes('Backstay') &&
      !item.description.includes('Baseplate')
    );

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Cut List
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Length (mm)</TableCell>
                <TableCell align="right">Width (mm)</TableCell>
                <TableCell align="right">Thickness (mm)</TableCell>
                <TableCell align="right">Cut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Cavity Head Section */}
              <TableRow>
                <TableCell colSpan={6} sx={{ 
                  bgcolor: '#f5f5f5', 
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  py: 2,
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  Cavity Head
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} sx={{ 
                  bgcolor: '#f9f9f9', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  pl: 4,
                  py: 1
                }}>
                  Aluminium Components
                </TableCell>
              </TableRow>
              {cavityHeadAluminium.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    bgcolor: state.cutItems[item.description] ? '#e8f5e9' : 'inherit',
                    textDecoration: state.cutItems[item.description] ? 'line-through' : 'none'
                  }}
                >
                  <TableCell dangerouslySetInnerHTML={{ __html: item.description }}></TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {item.length}
                      {getLengthFormula(item) && (
                        <Tooltip title={getLengthFormula(item)} arrow>
                          <IconButton size="small" sx={{ p: 0.5, color: 'primary.main' }}>
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.width}</TableCell>
                  <TableCell align="right">{item.thickness}</TableCell>
                  <TableCell align="right">
                    <Checkbox
                      checked={state.cutItems[item.description] || false}
                      onChange={() => handleCutItemToggle(item.description)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6} sx={{ 
                  bgcolor: '#f9f9f9', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  pl: 4,
                  py: 1
                }}>
                  Timber Components
                </TableCell>
              </TableRow>
              {cavityHeadTimber.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    bgcolor: state.cutItems[item.description] ? '#e8f5e9' : 'inherit',
                    textDecoration: state.cutItems[item.description] ? 'line-through' : 'none'
                  }}
                >
                  <TableCell dangerouslySetInnerHTML={{ __html: item.description }}></TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {item.length}
                      {getLengthFormula(item) && (
                        <Tooltip title={getLengthFormula(item)} arrow>
                          <IconButton size="small" sx={{ p: 0.5, color: 'primary.main' }}>
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.width}</TableCell>
                  <TableCell align="right">{item.thickness}</TableCell>
                  <TableCell align="right">
                    <Checkbox
                      checked={state.cutItems[item.description] || false}
                      onChange={() => handleCutItemToggle(item.description)}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* Divider between sections */}
              <TableRow>
                <TableCell colSpan={6} sx={{ 
                  height: '40px',
                  borderBottom: '4px solid #e0e0e0',
                  bgcolor: '#fafafa'
                }}></TableCell>
              </TableRow>

              {/* Cavity Pocket Section */}
              <TableRow>
                <TableCell colSpan={6} sx={{ 
                  bgcolor: '#f5f5f5', 
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  py: 2,
                  mt: 4,
                  borderTop: '2px solid #e0e0e0',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  Cavity Pocket
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} sx={{ 
                  bgcolor: '#f9f9f9', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  pl: 4,
                  py: 1
                }}>
                  Aluminium Components
                </TableCell>
              </TableRow>
              {cavityPocketAluminium.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    bgcolor: state.cutItems[item.description] ? '#e8f5e9' : 'inherit',
                    textDecoration: state.cutItems[item.description] ? 'line-through' : 'none'
                  }}
                >
                  <TableCell dangerouslySetInnerHTML={{ __html: item.description }}></TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {item.length}
                      {getLengthFormula(item) && (
                        <Tooltip title={getLengthFormula(item)} arrow>
                          <IconButton size="small" sx={{ p: 0.5, color: 'primary.main' }}>
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.width}</TableCell>
                  <TableCell align="right">{item.thickness}</TableCell>
                  <TableCell align="right">
                    <Checkbox
                      checked={state.cutItems[item.description] || false}
                      onChange={() => handleCutItemToggle(item.description)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6} sx={{ 
                  bgcolor: '#f9f9f9', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  pl: 4,
                  py: 1
                }}>
                  Timber Components
                </TableCell>
              </TableRow>
              {cavityPocketTimber.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    bgcolor: state.cutItems[item.description] ? '#e8f5e9' : 'inherit',
                    textDecoration: state.cutItems[item.description] ? 'line-through' : 'none'
                  }}
                >
                  <TableCell dangerouslySetInnerHTML={{ __html: item.description }}></TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {item.length}
                      {getLengthFormula(item) && (
                        <Tooltip title={getLengthFormula(item)} arrow>
                          <IconButton size="small" sx={{ p: 0.5, color: 'primary.main' }}>
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.width}</TableCell>
                  <TableCell align="right">{item.thickness}</TableCell>
                  <TableCell align="right">
                    <Checkbox
                      checked={state.cutItems[item.description] || false}
                      onChange={() => handleCutItemToggle(item.description)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const handlePrint = () => {
    // Get cut list items from the render function since it's already organized
    const cutListData = calculateCutList();
    const headAluminiumItems = cutListData.filter(item => 
      item.description.includes('Head') && !item.description.includes('Timber')
    );
    const headTimberItems = cutListData.filter(item => 
      item.description.includes('Head') && item.description.includes('Timber')
    );
    const pocketAluminiumItems = cutListData.filter(item => 
      !item.description.includes('Head') && !item.description.includes('Timber')
    );
    const pocketTimberItems = cutListData.filter(item => 
      !item.description.includes('Head') && item.description.includes('Timber')
    );
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate the print content
    const content = `
      <html>
        <head>
          <title>Cavity Slider Cut List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .section-header { 
              background-color: #f5f5f5; 
              font-weight: bold; 
              font-size: 1.2rem; 
              padding: 10px;
            }
            .sub-header { 
              background-color: #f9f9f9; 
              font-weight: bold;
              padding: 8px;
              padding-left: 20px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Cavity Slider Cut List</h1>
          <p><strong>${generateHeading()}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Length (mm)</th>
                <th>Width (mm)</th>
                <th>Thickness (mm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="5" class="section-header">Cavity Head</td></tr>
              <tr><td colspan="5" class="sub-header">Aluminium Components</td></tr>
              ${headAluminiumItems.map((item: CutListItem) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.length}</td>
                  <td>${item.width}</td>
                  <td>${item.thickness}</td>
                </tr>
              `).join('')}
              <tr><td colspan="5" class="sub-header">Timber Components</td></tr>
              ${headTimberItems.map((item: CutListItem) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.length}</td>
                  <td>${item.width}</td>
                  <td>${item.thickness}</td>
                </tr>
              `).join('')}
              <tr><td colspan="5" class="section-header">Cavity Pocket</td></tr>
              <tr><td colspan="5" class="sub-header">Aluminium Components</td></tr>
              ${pocketAluminiumItems.map((item: CutListItem) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.length}</td>
                  <td>${item.width}</td>
                  <td>${item.thickness}</td>
                </tr>
              `).join('')}
              <tr><td colspan="5" class="sub-header">Timber Components</td></tr>
              ${pocketTimberItems.map((item: CutListItem) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.length}</td>
                  <td>${item.width}</td>
                  <td>${item.thickness}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Print</button>
        </body>
      </html>
    `;

    // Write the content to the new window and trigger print
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Cavity Slider Calculator
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
        Calculate precise measurements for your cavity sliders
      </Typography>

      {/* Preview Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Preview</Typography>
          <Button
            onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
            startIcon={isPreviewCollapsed ? <ExpandMore /> : <ExpandLess />}
          >
            {isPreviewCollapsed ? 'Show Preview' : 'Hide Preview'}
          </Button>
        </Box>
        <Collapse in={!isPreviewCollapsed}>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PreviewSVG {...state} />
          </Box>
        </Collapse>
      </Box>

      {/* Dynamic Heading */}
      <Typography 
        variant="h5" 
        align="center" 
        sx={{ mb: 4, fontWeight: 'medium' }}
        dangerouslySetInnerHTML={{ __html: generateHeading() }}
      />

      {/* Calculator Form */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Basic Options */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={state.quantity}
              onChange={handleNumberChange}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Cavity Type</InputLabel>
              <Select
                name="cavityType"
                value={state.cavityType}
                label="Cavity Type"
                onChange={handleChange}
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Double (Biparting)">Double (Biparting)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Stud Size</InputLabel>
              <Select
                name="studSize"
                value={state.studSize}
                label="Stud Size"
                onChange={handleChange}
              >
                <MenuItem value="69mm">69mm</MenuItem>
                <MenuItem value="90mm">90mm</MenuItem>
                <MenuItem value="94mm">94mm</MenuItem>
                <MenuItem value="140mm">140mm</MenuItem>
                <MenuItem value="190mm">190mm</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Track Type</InputLabel>
              <Select
                name="trackType"
                value={state.trackType}
                label="Track Type"
                onChange={handleChange}
              >
                <MenuItem value="Triumph">Triumph</MenuItem>
                <MenuItem value="Ultra">Ultra</MenuItem>
                <MenuItem value="Ultra Heavy Duty">Ultra Heavy Duty</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Jamb Type</InputLabel>
              <Select
                name="jambType"
                value={state.jambType}
                label="Jamb Type"
                onChange={(e) => {
                  const newValue = e.target.value;
                  setState(prev => ({
                    ...prev,
                    jambType: newValue,
                    // Set squareStop based on the selected jamb type
                    squareStop: newValue === 'Square Stop',
                    // If square stop is selected, force Un-Finned Stabiline
                    frontstayOption: newValue === 'Square Stop' ? 'Un-Finned Stabiline' : prev.frontstayOption
                  }));
                }}
              >
                <MenuItem value="Flat Pine">Flat Pine</MenuItem>
                <MenuItem value="Grooved Pine">Grooved Pine</MenuItem>
                <MenuItem value="Square Stop">Square Stop</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Frontstay Options</InputLabel>
              <Select
                name="frontstayOption"
                value={state.frontstayOption}
                label="Frontstay Options"
                onChange={handleChange}
                disabled={state.squareStop}
              >
                <MenuItem value="Heavy Duty">Heavy Duty</MenuItem>
                {state.jambType === 'Grooved Pine' && state.doorHeight <= 1980 && (
                  <MenuItem value="Light Duty">Light Duty</MenuItem>
                )}
                <MenuItem value="Finned Stabiline">Finned Stabiline</MenuItem>
                <MenuItem value="Un-Finned Stabiline">Un-Finned Stabiline</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Door Dimensions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Door Dimensions</Typography>
          </Grid>

          {/* Height Section */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Calculate Door Height By</InputLabel>
              <Select
                name="heightCalculationMethod"
                value={state.heightCalculationMethod}
                label="Calculate Door Height By"
                onChange={handleChange}
              >
                <MenuItem value="doorHeight">Door Height</MenuItem>
                <MenuItem value="floorToUnderHeadJamb">Floor to Under Head Jamb</MenuItem>
                <MenuItem value="floorToTopOfHeadJamb">Floor to Top of Head Jamb</MenuItem>
                <MenuItem value="pocketHeight">Pocket Height</MenuItem>
                <MenuItem value="trimHeight">Trim Height</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={`${state.heightCalculationMethod} (mm)`}
                name="heightValue"
                type="number"
                value={state.heightValue}
                onChange={handleNumberChange}
              />
              {renderHeightQuickSelect()}
            </Box>
          </Grid>

          {/* Width Section */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Calculate Door Width By</InputLabel>
              <Select
                name="widthCalculationMethod"
                value={state.widthCalculationMethod}
                label="Calculate Door Width By"
                onChange={handleChange}
              >
                <MenuItem value="doorWidth">Door Width</MenuItem>
                <MenuItem value="betweenJambs">Between Jambs</MenuItem>
                <MenuItem value="overJambs">Over Jambs</MenuItem>
                <MenuItem value="clearOpening">Clear Opening</MenuItem>
                <MenuItem value="pocketWidth">Pocket Width</MenuItem>
                <MenuItem value="trimWidth">Trim Width</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={`${state.widthCalculationMethod} (mm)`}
                name="widthValue"
                type="number"
                value={state.widthValue}
                onChange={handleNumberChange}
              />
              {renderWidthQuickSelect()}
            </Box>
          </Grid>

          {/* Floor Clearance */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Floor Clearance (mm)"
              name="floorClearance"
              type="number"
              value={state.floorClearance}
              onChange={handleNumberChange}
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Quick Select Floor Clearance:
              </Typography>
              <ButtonGroup size="small" aria-label="quick select floor clearance buttons">
                {[10, 15, 20].map((clearance) => (
                  <Button
                    key={clearance}
                    onClick={() => setState(prev => ({ ...prev, floorClearance: clearance }))}
                    variant={state.floorClearance === clearance ? "contained" : "outlined"}
                  >
                    {clearance}mm
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          </Grid>

          {/* Finishing Options */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Finishing Options</Typography>
            <FormGroup row sx={{ gap: 2 }}>
              <FormControlLabel
                control={<Checkbox 
                  checked={state.straightline}
                  onChange={handleCheckboxChange}
                  name="straightline"
                />}
                label="Straightline"
              />
              <FormControlLabel
                control={<Checkbox 
                  checked={state.noClosingJamb}
                  onChange={handleCheckboxChange}
                  name="noClosingJamb"
                />}
                label="No Closing Jamb"
              />
              <FormControlLabel
                control={<Checkbox 
                  checked={state.fullHeightDetail}
                  onChange={handleCheckboxChange}
                  name="fullHeightDetail"
                />}
                label="Full Height Detail"
              />
              <FormControlLabel
                control={<Checkbox 
                  checked={state.plyPanel}
                  onChange={handleCheckboxChange}
                  name="plyPanel"
                />}
                label="Ply Panel"
              />
              {state.plyPanel && (
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    name="plyPanelSide"
                    value={state.plyPanelSide}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="left" control={<Radio />} label="Left Side" />
                    <FormControlLabel value="right" control={<Radio />} label="Right Side" />
                    <FormControlLabel value="both" control={<Radio />} label="Both Sides" />
                  </RadioGroup>
                </FormControl>
              )}
              <FormControlLabel
                control={<Checkbox 
                  checked={state.braced}
                  onChange={handleCheckboxChange}
                  name="braced"
                />}
                label="Braced"
              />
              {state.braced && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 3 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Brace Side</FormLabel>
                    <RadioGroup
                      row
                      name="bracedSide"
                      value={state.bracedSide}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="left" control={<Radio />} label="Left Side" />
                      <FormControlLabel value="right" control={<Radio />} label="Right Side" />
                      <FormControlLabel value="both" control={<Radio />} label="Both Sides" />
                    </RadioGroup>
                  </FormControl>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Floor Type</FormLabel>
                    <RadioGroup
                      row
                      name="floorType"
                      value={state.floorType}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="Concrete" control={<Radio />} label="Concrete Floor" />
                      <FormControlLabel value="Timber" control={<Radio />} label="Timber Floor" />
                    </RadioGroup>
                  </FormControl>
                </Box>
              )}
            </FormGroup>
          </Grid>
        </Grid>
      </Box>

      {/* Reset and Print Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, gap: 2 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => setState(defaultState)}
          startIcon={<Refresh />}
          sx={{
            minWidth: 200,
            py: 1.5,
            fontSize: '1.1rem',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          Reset Form
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handlePrint}
          startIcon={<Print />}
          sx={{
            minWidth: 200,
            py: 1.5,
            fontSize: '1.1rem',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          Print Cut List
        </Button>
      </Box>

      {/* Cut List */}
      {renderCutList()}
    </Box>
  );
} 