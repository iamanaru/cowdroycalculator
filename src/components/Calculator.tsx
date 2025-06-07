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
  packingSlip: string;
  orderNumber: string;
  customerName: string;
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
    packingSlip: '',
    orderNumber: '',
    customerName: '',
  } as const;

  const [state, setState] = useState<CalculatorState>(defaultState);

  // Add state for preview collapse
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(true);

  console.log('Calculator state:', state);

  // Handle Square Stop changes
  useEffect(() => {
    if (state.squareStop) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Un-Finned Stabiline'
      }));
    }
  }, [state.squareStop]);

  // Handle Light Duty for Grooved Pine, Triumph, and doorHeight < 2100
  useEffect(() => {
    if (state.jambType === 'Grooved Pine' && state.trackType === 'Triumph' && state.doorHeight < 2100) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Light Duty',
      }));
    } else if (state.jambType === 'Grooved Pine' && state.trackType === 'Triumph' && state.doorHeight >= 2100) {
      setState(prev => (
        prev.frontstayOption === 'Light Duty'
          ? { ...prev, frontstayOption: 'Heavy Duty' }
          : prev
      ));
    } else if (state.jambType !== 'Grooved Pine' && state.frontstayOption === 'Light Duty') {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Heavy Duty',
      }));
    }
  }, [state.jambType, state.trackType, state.doorHeight]);

  // New useEffect for Ultra track, Single cavity, 90mm stud, and Grooved Pine jamb
  useEffect(() => {
    if (
      state.jambType === 'Grooved Pine' &&
      state.trackType === 'Triumph' &&
      state.cavityType === 'Single' &&
      state.studSize === '90mm' &&
      state.doorHeight < 2100
    ) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Light Duty',
      }));
    } else if (
      state.frontstayOption === 'Light Duty' &&
      (
        state.jambType !== 'Grooved Pine' ||
        state.trackType !== 'Triumph' ||
        state.cavityType !== 'Single' ||
        state.studSize !== '90mm' ||
        state.doorHeight >= 2100
      )
    ) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Heavy Duty',
      }));
    }
  }, [state.jambType, state.trackType, state.cavityType, state.studSize, state.doorHeight]);

  useEffect(() => {
    if (
      state.jambType === 'Grooved Pine' &&
      state.trackType === 'Ultra' &&
      state.cavityType === 'Single' &&
      state.studSize === '90mm' &&
      state.straightline &&
      state.doorHeight < 2100
    ) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Light Duty',
      }));
    } else if (
      state.frontstayOption === 'Light Duty' &&
      (
        state.jambType !== 'Grooved Pine' ||
        state.trackType !== 'Ultra' ||
        state.cavityType !== 'Single' ||
        state.studSize !== '90mm' ||
        !state.straightline ||
        state.doorHeight >= 2100
      )
    ) {
      setState(prev => ({
        ...prev,
        frontstayOption: 'Heavy Duty',
      }));
    }
  }, [state.jambType, state.trackType, state.cavityType, state.studSize, state.straightline, state.doorHeight]);

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;

    setState(prev => {
      let newState: Partial<CalculatorState> = {
        ...prev,
        [name]: value,
      };

      // Special handling for jambType
      if (name === 'jambType') {
        newState.squareStop = value === 'Square Stop';
        if (value === 'Square Stop') {
          newState.frontstayOption = 'Un-Finned Stabiline';
        } else if (prev.squareStop) {
          // If moving away from Square Stop, revert to Heavy Duty unless logic elsewhere overrides
          newState.frontstayOption = 'Heavy Duty';
        }
      }

      // Height/width logic
      if (name === 'heightValue') {
        newState.doorHeight = prev.heightCalculationMethod === 'doorHeight' ? parseInt(value) || 0 : prev.doorHeight;
      }
      if (name === 'widthValue') {
        newState.doorWidth = prev.widthCalculationMethod === 'doorWidth' ? parseInt(value) || 0 : prev.doorWidth;
      }

      return { ...prev, ...newState };
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setState(prev => ({
      ...prev,
      [name]: value,
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
            {[610, 660, 710, 760, 810, 860, 910, 960, 1000, 1100, 1200, 1300].map((width) => (
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
    let frontstayLength;
    let frontstayName = state.frontstayOption;
    if (
      state.cavityType === 'Single' &&
      state.trackType === 'Ultra' &&
      state.straightline &&
      state.jambType === 'Grooved Pine' &&
      state.studSize === '90mm' &&
      state.doorHeight < 2100
    ) {
      frontstayName = 'Light Duty';
      frontstayLength = state.doorHeight + state.floorClearance + 21;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Triumph' &&
      state.straightline &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      frontstayLength = state.doorHeight + state.floorClearance + 16;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Triumph' &&
      state.straightline &&
      state.jambType === 'Grooved Pine' &&
      state.studSize === '90mm'
    ) {
      frontstayLength = state.doorHeight + state.floorClearance + 16;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Ultra' &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      frontstayLength = state.doorHeight + state.floorClearance + 21;
    } else {
    const isStabiline = state.frontstayOption === 'Finned Stabiline' || 
                       state.frontstayOption === 'Un-Finned Stabiline';
      frontstayLength = state.doorHeight + state.floorClearance + (isStabiline ? 9 : 10);
    }

    return {
      description: `${frontstayName} Aluminium Frontstay`,
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

    // Calculate length based on track type and special case
    let jambLength;
    if (
      state.jambType === 'Grooved Pine' &&
      state.trackType === 'Ultra' &&
      state.cavityType === 'Single' &&
      state.studSize === '90mm' &&
      state.straightline
    ) {
      jambLength = state.doorHeight + state.floorClearance + 42;
    } else if (
      state.jambType === 'Grooved Pine' &&
      state.trackType === 'Triumph' &&
      state.cavityType === 'Single' &&
      state.studSize === '90mm' &&
      state.doorHeight < 2100
    ) {
      jambLength = state.doorHeight + state.floorClearance + 26;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Triumph' &&
      state.straightline &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      jambLength = state.doorHeight + state.floorClearance + 26;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Ultra' &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      jambLength = state.doorHeight + state.floorClearance + 42;
    } else {
    const lengthAddition = state.trackType === 'Triumph' ? 40 : 53;
      jambLength = state.doorHeight + state.floorClearance + lengthAddition;
    }

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
          if (
            state.cavityType === 'Single' &&
            state.studSize === '90mm'
          ) {
            width = 30;
            thickness = 3;
          } else if (
            state.cavityType === 'Single' &&
            state.studSize === '140mm'
          ) {
            width = 76;
            thickness = 18;
          } else {
          width = 30;
          thickness = 51;
          }
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
    let length;
    if (isTriumph && state.jambType === 'Grooved Pine') {
      length = state.doorWidth * 2;
    } else if (state.jambType === 'Flat Pine') {
      length = state.doorWidth * 2 - 10;
    } else {
      length = state.doorWidth * 2;
    }

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
    let length;
    if (
      state.cavityType === 'Single' &&
      state.trackType === 'Ultra' &&
      state.straightline &&
      state.jambType === 'Grooved Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorWidth * 2 + 10;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Triumph' &&
      state.straightline &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorWidth * 2;
    } else if (state.trackType === 'Triumph') {
      length = state.cavityType === 'Single'
        ? state.doorWidth * 2 + 10
        : state.doorWidth * 2;
    } else {
      length = state.cavityType === 'Single'
      ? state.doorWidth * 2 
      : state.doorWidth * 2 - 10;
    }

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

    // Calculate length based on track type and special case
    let length;
    if (
      state.jambType === 'Grooved Pine' &&
      state.trackType === 'Ultra' &&
      state.cavityType === 'Single' &&
      state.studSize === '90mm' &&
      state.straightline
    ) {
      length = state.doorHeight + state.floorClearance + 42;
    } else if (
      state.jambType === 'Grooved Pine' &&
      state.trackType === 'Triumph' &&
      state.cavityType === 'Single' &&
      state.studSize === '90mm' &&
      state.doorHeight < 2100
    ) {
      length = state.doorHeight + state.floorClearance + 26;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Triumph' &&
      state.straightline &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorHeight + state.floorClearance + 26;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Ultra' &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorHeight + state.floorClearance + 42;
    } else {
    const lengthAddition = state.trackType === 'Triumph' ? 40 : 53;
      length = state.doorHeight + state.floorClearance + lengthAddition;
    }

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

    // Calculate length based on special case or jamb type and stabiline usage
    let length;
    if (
      state.cavityType === 'Single' &&
      state.trackType === 'Triumph' &&
      state.straightline &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorHeight + state.floorClearance - 2;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Ultra' &&
      state.straightline &&
      state.jambType === 'Grooved Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorHeight + state.floorClearance + 2;
    } else if (
      state.cavityType === 'Single' &&
      state.trackType === 'Ultra' &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorHeight + state.floorClearance + 3;
    } else {
    const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || 
                           state.frontstayOption === 'Un-Finned Stabiline';
    let lengthAddition;
    if (isFlatPine) {
      lengthAddition = isStabilineUsed ? 9 : 10;
    } else {
      lengthAddition = isStabilineUsed ? 23 : 20;
      }
      length = state.doorHeight + state.floorClearance + lengthAddition;
    }

    return {
      description,
      quantity: totalQuantity,
      length,
      width,
      thickness
    };
  };

  const calculateHeadJamb = (): CutListItem | null => {
    console.log('calculateHeadJamb state:', {
      cavityType: state.cavityType,
      studSize: state.studSize,
      trackType: state.trackType,
      jambType: state.jambType,
      straightline: state.straightline,
      doorWidth: state.doorWidth,
      doorHeight: state.doorHeight
    });

    // Special case for Single, Grooved Pine, Straightline, 140mm stud
    if (
      state.cavityType === 'Single' &&
      state.jambType === 'Grooved Pine' &&
      state.straightline &&
      state.studSize === '140mm'
    ) {
      const result = {
        description: '76mm x 18mm Grooved Pine Head Jamb <span style="font-weight: bold; font-size: 1.1em;">⊗SL</span>',
        quantity: 2 * state.quantity,
        length: state.doorWidth + 30,
        width: 76,
        thickness: 18
      };
      console.log('calculateHeadJamb: returning 76x18 for Single/Grooved/Straightline/140mm');
      return result;
    }

    // If straightline with Triumph track and Grooved Pine (except 140mm stud case), no head jamb is required
    if (state.straightline && state.trackType === 'Triumph' && state.jambType === 'Grooved Pine' && state.studSize !== '140mm') {
      console.log('calculateHeadJamb: returning null (Triumph + Grooved Pine + Straightline)');
      return null;
    }

    // Determine dimensions based on track type and straightline option
    let width = 32;  // Default width
    let thickness = 18;  // Default thickness
    
    if (state.straightline) {
      console.log('calculateHeadJamb: straightline is true');
      if (state.trackType === 'Triumph') {
        console.log('calculateHeadJamb: Triumph track');
        // Triumph track with straightline
        if (state.jambType === 'Flat Pine') {
          width = 40;
          thickness = 13;
        }
      } else if (state.trackType === 'Ultra') {
        console.log('calculateHeadJamb: Ultra track');
        // Ultra track with straightline
        if (state.jambType === 'Flat Pine') {
          width = 21;
          thickness = 28;
        } else if (state.jambType === 'Grooved Pine') {
          if (
            state.cavityType === 'Single' &&
            state.studSize === '140mm'
          ) {
            width = 76;
            thickness = 18;
          } else {
            width = 30;
            thickness = 51;
          }
        }
      }
    } else {
      console.log('calculateHeadJamb: straightline is false');
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
    let length;
    let isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
    if (
      state.cavityType === 'Single' &&
      state.trackType === 'Triumph' &&
      state.straightline &&
      state.jambType === 'Flat Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorWidth - 2;
    } else if (
      state.trackType === 'Ultra' &&
      state.cavityType === 'Single' &&
      state.straightline &&
      state.jambType === 'Grooved Pine' &&
      state.studSize === '90mm'
    ) {
      length = state.doorWidth + 66;
    } else if (
      state.trackType === 'Ultra' &&
      state.cavityType === 'Single' &&
      state.studSize === '90mm' &&
      state.jambType === 'Flat Pine'
    ) {
      length = state.doorWidth - 2;
    } else if (state.jambType === 'Flat Pine') {
      if (state.cavityType === 'Single') {
        // Special case for 32mm x 18mm Flat Pine Head Jamb: always subtract 28mm
        if (
          !state.straightline &&
          state.jambType === 'Flat Pine' &&
          state.cavityType === 'Single'
        ) {
          length = state.doorWidth - 28;
        } else {
          length = isStabilineUsed ? state.doorWidth - 28 : state.doorWidth - 30;
        }
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

    const result = {
      description,
      quantity: totalQuantity,
      length,
      width,
      thickness
    };
    console.log('calculateHeadJamb result:', result);
    return result;
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
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Ultra' &&
        state.straightline &&
        state.jambType === 'Grooved Pine' &&
        state.studSize === '90mm' &&
        state.doorHeight < 2100
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 21mm`;
      }
      if (
        (state.cavityType === 'Single' &&
         state.trackType === 'Triumph' &&
         state.straightline &&
         state.studSize === '90mm' &&
         (state.jambType === 'Flat Pine' || state.jambType === 'Grooved Pine'))
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 16mm`;
      }
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Ultra' &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 21mm`;
      }
      const isStabiline = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + ${isStabiline ? '9mm' : '10mm'}`;
    }
    if (item.description.includes('Head Timber')) {
      if (state.trackType === 'Triumph' && state.jambType === 'Grooved Pine') {
        return `(Door Width (${state.doorWidth}mm) * 2)`;
      }
      const baseLength = state.doorWidth * 2;
      return state.jambType === 'Flat Pine' ? `(Door Width (${state.doorWidth}mm) * 2) - 10mm` : `Door Width (${state.doorWidth}mm) * 2`;
    }
    if (item.description.includes('Pine Nogs')) {
      const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      return `Door Width (${state.doorWidth}mm) - ${isStabilineUsed ? '49mm' : '10mm'}`;
    }
    if (item.description === 'Triumph Aluminium Head Track') {
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Triumph' &&
        state.straightline &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `(Door Width (${state.doorWidth}mm) * 2)`;
      }
      return state.cavityType === 'Single'
        ? `(Door Width (${state.doorWidth}mm) * 2) + 10mm`
        : `(Door Width (${state.doorWidth}mm) * 2)`;
    }
    if (item.description === 'Ultra Aluminium Head Track') {
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Ultra' &&
        state.straightline &&
        state.jambType === 'Grooved Pine' &&
        state.studSize === '90mm'
      ) {
        return `(Door Width (${state.doorWidth}mm) * 2) + 10mm`;
      }
      return state.cavityType === 'Single'
        ? `(Door Width (${state.doorWidth}mm) * 2)`
        : `(Door Width (${state.doorWidth}mm) * 2) - 10mm`;
    }
    if (item.description.includes('Head Track')) {
      return state.cavityType === 'Single' 
        ? `Door Width (${state.doorWidth}mm) * 2`
        : `(Door Width (${state.doorWidth}mm) * 2) - 10mm`;
    }
    if (item.description.includes('Backstay')) {
      if (
        state.jambType === 'Grooved Pine' &&
        state.trackType === 'Ultra' &&
        state.cavityType === 'Single' &&
        state.studSize === '90mm' &&
        state.straightline
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 42mm`;
      }
      if (
        state.jambType === 'Grooved Pine' &&
        state.trackType === 'Triumph' &&
        state.cavityType === 'Single' &&
        state.studSize === '90mm' &&
        state.doorHeight < 2100
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 26mm`;
      }
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Triumph' &&
        state.straightline &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 26mm`;
      }
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Ultra' &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 42mm`;
      }
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
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Triumph' &&
        state.straightline &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) - 2mm`;
      }
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Ultra' &&
        state.straightline &&
        state.jambType === 'Grooved Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 2mm`;
      }
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Ultra' &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 3mm`;
      }
      const isFlatPine = state.jambType === 'Flat Pine';
      const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      const addition = isFlatPine 
        ? (isStabilineUsed ? 9 : 10)
        : (isStabilineUsed ? 23 : 20);
      return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + ${addition}mm`;
    }
    if (item.description.includes('Head Jamb')) {
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Triumph' &&
        state.straightline &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Width (${state.doorWidth}mm) - 2mm`;
      }
      if (
        state.trackType === 'Ultra' &&
        state.cavityType === 'Single' &&
        state.straightline &&
        state.jambType === 'Grooved Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Width (${state.doorWidth}mm) + 66mm`;
      }
      if (
        state.trackType === 'Ultra' &&
        state.cavityType === 'Single' &&
        state.studSize === '90mm' &&
        state.jambType === 'Flat Pine'
      ) {
        return `Door Width (${state.doorWidth}mm) - 2mm`;
      }
      const isFlatPine = state.jambType === 'Flat Pine';
      const isStabilineUsed = state.frontstayOption === 'Finned Stabiline' || state.frontstayOption === 'Un-Finned Stabiline';
      // Special case for 32mm x 18mm Flat Pine Head Jamb
      if (item.description.startsWith('32mm x 18mm Flat Pine Head Jamb')) {
        return 'Door Width (' + state.doorWidth + 'mm) - 28mm';
      }
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
    if (item.description.includes('Closing Jamb')) {
      if (
        state.jambType === 'Grooved Pine' &&
        state.trackType === 'Ultra' &&
        state.cavityType === 'Single' &&
        state.studSize === '90mm' &&
        state.straightline
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 42mm`;
      }
      if (
        state.jambType === 'Grooved Pine' &&
        state.trackType === 'Triumph' &&
        state.cavityType === 'Single' &&
        state.studSize === '90mm' &&
        state.doorHeight < 2100
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 26mm`;
      }
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Triumph' &&
        state.straightline &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 26mm`;
      }
      if (
        state.cavityType === 'Single' &&
        state.trackType === 'Ultra' &&
        state.jambType === 'Flat Pine' &&
        state.studSize === '90mm'
      ) {
        return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + 42mm`;
      }
      const lengthAddition = state.trackType === 'Triumph' ? 40 : 53;
      return `Door Height (${state.doorHeight}mm) + Floor Clearance (${state.floorClearance}mm) + ${lengthAddition}mm`;
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
      !item.description.includes('Head') && 
      !item.description.includes('Timber')
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
                <TableCell align="right">Cut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Cavity Head Section */}
              <TableRow>
                <TableCell colSpan={4} sx={{ 
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
                <TableCell colSpan={4} sx={{ 
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
                  <TableCell align="right">
                    <Checkbox
                      checked={state.cutItems[item.description] || false}
                      onChange={() => handleCutItemToggle(item.description)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} sx={{ 
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
                <TableCell colSpan={4} sx={{ 
                  height: '40px',
                  borderBottom: '4px solid #e0e0e0',
                  bgcolor: '#fafafa'
                }}></TableCell>
              </TableRow>
              {/* Cavity Pocket Section */}
              <TableRow>
                <TableCell colSpan={4} sx={{ 
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
                <TableCell colSpan={4} sx={{ 
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
                  <TableCell align="right">
                    <Checkbox
                      checked={state.cutItems[item.description] || false}
                      onChange={() => handleCutItemToggle(item.description)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} sx={{ 
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
    if (!state.packingSlip || !state.orderNumber) {
      alert('Packing Slip Number and Order Number are required.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website');
      return;
    }

    const cutList = calculateCutList();
    // Use the same grouping as renderCutList
    const cavityHeadItems = cutList.filter(item => 
      item.description.includes('Head Track') || 
      item.description.includes('Head Timber') ||
      item.description.includes('Head Jamb')
    );
    const cavityPocketItems = cutList.filter(item => 
      !item.description.includes('Head') && 
      !item.description.includes('Timber')
    );
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
    const heading = generateHeading();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cut List</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .cutlist-container {
              border: 2px solid black;
              min-height: 100vh;
              box-sizing: border-box;
              padding: 40px 20px 20px 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid black;
              padding-bottom: 10px;
            }
            .main-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-top: 20px;
            }
            .cavity-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .order-info {
              margin-bottom: 20px;
              font-size: 14px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              gap: 40px;
              padding: 0 20px;
            }
            .order-info-column {
              text-align: center;
              min-width: 150px;
            }
            .barcode-container {
              margin-top: 5px;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .section-header { 
              background-color: #f5f5f5; 
              font-weight: bold; 
              font-size: 16px;
              padding: 10px;
              border: 1px solid #ddd;
            }
            .sub-header { 
              background-color: #f9f9f9; 
              font-weight: bold;
              font-size: 14px;
              padding: 8px 8px 8px 20px;
              border: 1px solid #ddd;
            }
            .checkbox {
              width: 20px;
              height: 20px;
              border: 1px solid #000;
              display: inline-block;
              margin: 0 auto;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .checkbox {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .cutlist-container {
                border: 2px solid black;
                min-height: 100vh;
              }
            }
          </style>
        </head>
        <body>
          <div class="cutlist-container">
            <div class="header">
              <div class="main-title">Cowdroy Cutlist</div>
              <div class="cavity-title">${heading}</div>
              <div style="font-size: 1.1rem; font-weight: 500; margin-bottom: 12px;">Floor Clearance: ${state.floorClearance}mm</div>
              <div class="order-info">
                <div class="order-info-column">
                  <strong>Customer:</strong><br>
                  ${state.customerName || 'N/A'}
                </div>
                <div class="order-info-column">
                  <strong>Packing Slip:</strong><br>
                  ${state.packingSlip}
                  <div class="barcode-container">
                    <svg id="packingSlipBarcode"></svg>
                  </div>
                </div>
                <div class="order-info-column">
                  <strong>Order Number:</strong><br>
                  ${state.orderNumber}
                  <div class="barcode-container">
                    <svg id="orderNumberBarcode"></svg>
                  </div>
                </div>
              </div>
            </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                  <th style="text-align: center">Quantity</th>
                  <th style="text-align: center">Length (mm)</th>
                  <th style="text-align: center">Cut</th>
              </tr>
            </thead>
            <tbody>
                <tr>
                  <td colspan="4" class="section-header">Cavity Head</td>
                </tr>
                <tr>
                  <td colspan="4" class="sub-header">Aluminium Components</td>
                </tr>
                ${cavityHeadAluminium.map(item => `
                <tr>
                  <td>${item.description}</td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: center">${item.length}</td>
                    <td style="text-align: center"><div class="checkbox"></div></td>
                </tr>
              `).join('')}
                <tr>
                  <td colspan="4" class="sub-header">Timber Components</td>
                </tr>
                ${cavityHeadTimber.map(item => `
                <tr>
                  <td>${item.description}</td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: center">${item.length}</td>
                    <td style="text-align: center"><div class="checkbox"></div></td>
                </tr>
              `).join('')}
                <tr>
                  <td colspan="4" class="section-header">Cavity Pocket</td>
                </tr>
                <tr>
                  <td colspan="4" class="sub-header">Aluminium Components</td>
                </tr>
                ${cavityPocketAluminium.map(item => `
                <tr>
                  <td>${item.description}</td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: center">${item.length}</td>
                    <td style="text-align: center"><div class="checkbox"></div></td>
                </tr>
              `).join('')}
                <tr>
                  <td colspan="4" class="sub-header">Timber Components</td>
                </tr>
                ${cavityPocketTimber.map(item => `
                <tr>
                  <td>${item.description}</td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: center">${item.length}</td>
                    <td style="text-align: center"><div class="checkbox"></div></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          </div>
          <script>
            window.onload = function() {
              JsBarcode("#packingSlipBarcode", "${state.packingSlip}", {
                format: "CODE128",
                width: 1.5,
                height: 40,
                displayValue: false
              });
              JsBarcode("#orderNumberBarcode", "${state.orderNumber}", {
                format: "CODE128",
                width: 1.5,
                height: 40,
                displayValue: false
              });
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintLabel = () => {
    if (!state.customerName || !state.packingSlip || !state.orderNumber) {
      alert('Customer Name, Packing Slip Number, and Order Number are required.');
      return;
    }
    // Create a new window for printing the label
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate the label content
    const content = `
      <html>
        <head>
          <title>Product Label</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .label-main {
              border: 2px solid #111;
              width: 600px;
              margin: 20px auto;
              background: #fff;
              box-sizing: border-box;
              padding: 0;
            }
            .label-header {
              display: flex;
              border-bottom: 2px solid #111;
            }
            .label-header-left {
              flex: 2;
              padding: 20px 20px 10px 20px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .label-header-title {
              font-size: 2.5rem;
              font-weight: bold;
              letter-spacing: 1px;
              margin-bottom: 0.2em;
              display: inline-block;
              line-height: 1.1;
            }
            .label-header-sub {
              font-size: 2.2rem;
              font-weight: 300;
              margin-top: 0.2em;
              color: #222;
              letter-spacing: 1px;
            }
            .label-header-right {
              flex: 1;
              background: #111;
              color: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0 10px;
            }
            .stud-value {
              font-size: 3.5rem;
              font-weight: bold;
              margin: 0;
              line-height: 1.1;
            }
            .stud-label {
              font-size: 1.5rem;
              font-weight: bold;
              letter-spacing: 2px;
              margin: 0;
            }
            .label-row {
              display: flex;
              border-bottom: 2px solid #111;
              align-items: stretch;
            }
            .label-cell {
              flex: 1;
              padding: 0;
              font-size: 1.3rem;
              border-right: 2px solid #111;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              height: 120px;
            }
            .label-cell:last-child {
              border-right: none;
            }
            .label-info-row {
              display: flex;
              justify-content: space-between;
              padding: 18px 24px 0 24px;
              font-size: 1.4rem;
            }
            .label-info-row .label-info {
              flex: 1;
              text-align: left;
            }
            .label-info-row .label-info + .label-info {
              text-align: right;
            }
            .label-info-value {
              font-size: 2.5rem;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 18px;
            }
            .label-footer {
              padding: 18px 24px 18px 24px;
              font-size: 1.4rem;
              border-top: 2px solid #111;
              border-bottom: 2px solid #111;
              margin-bottom: 10px;
            }
            .label-footer-value {
              font-size: 2rem;
              font-weight: bold;
              display: inline-block;
              margin-top: 0.2em;
            }
            .label-footer-company {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 16px;
              gap: 24px;
              padding: 12px 24px 12px 24px;
            }
            .company-info {
              font-size: 1.05rem;
              text-align: left;
              color: #111;
              padding: 8px 0 8px 0;
            }
            .company-logo {
              max-width: 180px;
              max-height: 60px;
              object-fit: contain;
              margin-left: auto;
              display: block;
            }
            @media print {
              .no-print { display: none; }
              @page { margin: 0; }
              body { margin: 0; }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          <div class="label-main">
            <!-- Logo at the very top -->
            <div style="width:100%;background:#fff;text-align:center;padding:12px 0 8px 0;">
              <img src="/logo.png" alt="Cowdroy Logo" style="max-width:320px;max-height:70px;width:auto;height:auto;display:inline-block;" />
            </div>
            <!-- Horizontal line below logo, full width, just above header -->
            <div style="width:100%; height:2px; background:#111; margin:0 0 0 0;"></div>
            <div class="label-header">
              <div class="label-header-left">
                <div class="label-header-title">
                  ${state.cavityType.startsWith('Double') ? 'Double' : 'Single'}
                  ${['Ultra', 'Ultra Heavy Duty'].includes(state.trackType) ? 'Ultra' : 'Optimiser'}
                </div><br/>
                <div class="label-header-sub">Cavity Slider</div>
              </div>
              <div class="label-header-right">
                <div class="stud-value">${state.studSize.replace('mm','')}</div>
                <div class="stud-label">STUD</div>
              </div>
            </div>
            <div class="label-info-row" style="justify-content: center; align-items: center;">
              <div class="label-info" style="text-align:center; width: 50%;">
                <div style="font-size:1.5rem; font-weight:500;">Door Height:</div>
                <div class="label-info-value" style="font-size:2.5rem; font-weight:bold;">${state.doorHeight}mm</div>
              </div>
              <div class="label-info" style="text-align:center; width: 50%;">
                <div style="font-size:1.5rem; font-weight:500;">Door Width:</div>
                <div class="label-info-value" style="font-size:2.5rem; font-weight:bold;">${state.doorWidth}mm</div>
              </div>
            </div>
            <div class="label-footer" style="text-align:center;">
              <div style="font-size:1.5rem; font-weight:500;">Floor Clearance:</div>
              <span class="label-footer-value" style="font-size:2rem; font-weight:bold;">${state.floorClearance}mm</span>
            </div>
            <!-- Selected Options Section at the bottom (only if any selected) -->
            ${
              state.straightline || state.noClosingJamb || state.fullHeightDetail || state.squareStop || state.plyPanel || state.braced
                ? `<div style="padding: 12px 24px 18px 24px;">
                    <div style="font-size: 1.2rem; font-weight: 500; margin-bottom: 4px;">Selected Options:</div>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      ${state.straightline ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; Straightline</li>' : ''}
                      ${state.noClosingJamb ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; No Closing Jamb</li>' : ''}
                      ${state.fullHeightDetail ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; Full Height Detail</li>' : ''}
                      ${state.squareStop ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; Square Stop</li>' : ''}
                      ${state.plyPanel ? `<li style=\\\\"margin-bottom: 4px; font-size: 1.1rem;\\\\">&#x2611; Ply Panel (${state.plyPanelSide} side)</li>` : ''}
                      ${state.braced ? `<li style=\\\\"margin-bottom: 4px; font-size: 1.1rem;\\\\">&#x2611; Braced (${state.bracedSide} side)</li>` : ''}
                    </ul>
                  </div>
                  <div style="width:100%; height:2px; background:#111; margin:0 0 0 0;"></div>`
                : ''
            }
            <!-- Customer Name, Packing Slip, and Order Number with barcodes at the bottom above company info -->
            <div style="padding: 12px 24px 0 24px; text-align:center;">
              <div style="font-size:2rem; font-weight:900; margin-bottom:10px; letter-spacing:1px;">${state.customerName}</div>
              <div style="display:flex; justify-content:center; align-items:flex-end; gap:60px; margin-bottom:8px;">
                <div style="text-align:center;">
                  <div style="font-size:1.1rem; font-weight:500;">Packing Slip:</div>
                  <div style="font-size:1.2rem; font-weight:400;">${state.packingSlip || '&mdash;'}</div>
                  <svg id="packingSlipBarcode" style="display:block; margin:8px auto 0 auto; padding:0;"></svg>
                </div>
                <div style="text-align:center;">
                  <div style="font-size:1.1rem; font-weight:500;">Order Number:</div>
                  <div style="font-size:1.2rem; font-weight:400;">${state.orderNumber || '&mdash;'}</div>
                  <svg id="orderNumberBarcode" style="display:block; margin:8px auto 0 auto; padding:0;"></svg>
                </div>
              </div>
            </div>
            <!-- Manufacture Date and Company Info Footer -->
            <div style="text-align:center; font-size:1.08rem; font-weight:500; margin-top:0; margin-bottom:0;">Manufacture Date: ${new Date().toLocaleDateString('en-NZ')}</div>
            <div style="background:#111;color:#fff;text-align:center;padding:14px 24px 14px 24px;font-size:1.08rem;font-weight:400;letter-spacing:0.5px; border-bottom-left-radius:2px; border-bottom-right-radius:2px; margin-top:0; margin-bottom:0;">
               <div style="font-size:1.08rem; font-weight:400; margin-bottom:4px;">Manufactured in New Zealand By</div>
               <div style="font-size:1.15rem; font-weight:600;">Cowdroy Products LTD - Christchurch</div>
               <div>19 Kilronan Place, Wigram, Christchurch 8042</div>
               <div>Phone 03 943 2060</div>
               <div style="margin-top:6px; font-size:1.08rem; font-weight:400;">www.cowdroy.co.nz</div>
            </div>
+           ${
              state.straightline || state.noClosingJamb || state.fullHeightDetail || state.squareStop || state.plyPanel || state.braced
                ? `<div style="padding: 12px 24px 18px 24px;">
                    <div style="font-size: 1.2rem; font-weight: 500; margin-bottom: 4px;">Selected Options:</div>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      ${state.straightline ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; Straightline</li>' : ''}
                      ${state.noClosingJamb ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; No Closing Jamb</li>' : ''}
                      ${state.fullHeightDetail ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; Full Height Detail</li>' : ''}
                      ${state.squareStop ? '<li style=\\"margin-bottom: 4px; font-size: 1.1rem;\\">&#x2611; Square Stop</li>' : ''}
                      ${state.plyPanel ? `<li style=\\\\"margin-bottom: 4px; font-size: 1.1rem;\\\\">&#x2611; Ply Panel (${state.plyPanelSide} side)</li>` : ''}
                      ${state.braced ? `<li style=\\\\"margin-bottom: 4px; font-size: 1.1rem;\\\\">&#x2611; Braced (${state.bracedSide} side)</li>` : ''}
                    </ul>
                  </div>
                  <div style="width:100%; height:2px; background:#111; margin:0 0 0 0;"></div>`
                : ''
            }
            <!-- Build finishing options list -->
            <div class="finishing-options" style="margin: 28px 0 0 0; text-align: center;">
              <div style="font-size: 1.15rem; font-weight: 600; margin-bottom: 6px;">Finishing Options:</div>
              <ul style="list-style: none; padding: 0; margin: 0; display: inline-block; text-align: left;">
                ${['Straightline', 'No Closing Jamb', 'Full Height Detail', 'Square Stop', `Ply Panel (${state.plyPanelSide === 'both' ? 'Both Sides' : state.plyPanelSide.charAt(0).toUpperCase() + state.plyPanelSide.slice(1) + ' Side'})`, `Braced (${state.bracedSide === 'both' ? 'Both Sides' : state.bracedSide.charAt(0).toUpperCase() + state.bracedSide.slice(1) + ' Side'})`].map(opt => `<li style='font-size: 1.05rem; margin-bottom: 2px;'>${opt}</li>`).join('')}
              </ul>
            </div>
          </div>
          <script>
            window.onload = function() {
              if (window.JsBarcode) {
                JsBarcode('#packingSlipBarcode', '${state.packingSlip || '0'}', { format: 'CODE128', displayValue: false, height: 50, width: 2 });
                JsBarcode('#orderNumberBarcode', '${state.orderNumber || '0'}', { format: 'CODE128', displayValue: false, height: 50, width: 2 });
              }
            };
          </script>
          <button class="no-print" onclick="window.print()" style="margin: 20px auto; display: block; padding: 10px 20px; font-size: 1.2rem;">Print Label</button>
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

      {/* Dynamic Heading */}
      <Typography 
        variant="h5" 
        align="center" 
        sx={{ mb: 4, fontWeight: 'medium' }}
        dangerouslySetInnerHTML={{ __html: generateHeading() }}
      />

      {/* Packing Slip and Order Number Fields (now between heading and main options) */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TextField
          label="Customer Name"
          name="customerName"
          value={state.customerName}
          onChange={handleInputChange}
          sx={{ minWidth: 250 }}
          required
          error={!state.customerName}
          helperText={!state.customerName ? 'Required' : ''}
        />
        <TextField
          label="Packing Slip Number"
          name="packingSlip"
          value={state.packingSlip}
          onChange={handleInputChange}
          sx={{ minWidth: 250 }}
          required
          error={!state.packingSlip}
          helperText={!state.packingSlip ? 'Required' : ''}
        />
        <TextField
          label="Order Number"
          name="orderNumber"
          value={state.orderNumber}
          onChange={handleInputChange}
          sx={{ minWidth: 250 }}
          required
          error={!state.orderNumber}
          helperText={!state.orderNumber ? 'Required' : ''}
        />
      </Box>

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
                onChange={handleSelectChange}
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
                onChange={handleSelectChange}
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
                onChange={handleSelectChange}
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
                onChange={handleSelectChange}
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
                onChange={handleSelectChange}
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
                onChange={handleSelectChange}
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
                onChange={handleSelectChange}
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
                  checked={state.squareStop}
                  onChange={handleCheckboxChange}
                  name="squareStop"
                />}
                label="Square Stop"
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
          color="success"
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

      {/* Print Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrintLabel}
        >
          Print Product Label
        </Button>
      </Box>

      {/* Cut List */}
      {renderCutList()}
    </Box>
  );
} 
