import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  SelectChangeEvent,
} from '@mui/material';

// Define types for our form values
interface CalculatorFormData {
  trackType: string;
  jambType: string;
  heightCalculationMethod: string;
  widthCalculationMethod: string;
}

const CalculatorForm: React.FC = () => {
  // Initialize form state
  const [formData, setFormData] = useState<CalculatorFormData>({
    trackType: '',
    jambType: '',
    heightCalculationMethod: '',
    widthCalculationMethod: '',
  });

  // Handle form changes
  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Door Calculator
      </Typography>
      <Grid container spacing={3}>
        {/* Track Type Selection */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Track Type</InputLabel>
            <Select
              name="trackType"
              value={formData.trackType}
              label="Track Type"
              onChange={handleChange}
            >
              <MenuItem value="triumph">Triumph</MenuItem>
              <MenuItem value="ultra">Ultra</MenuItem>
              <MenuItem value="ultraHeavyDuty">Ultra Heavy Duty</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Jamb Type Selection */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Jamb Type</InputLabel>
            <Select
              name="jambType"
              value={formData.jambType}
              label="Jamb Type"
              onChange={handleChange}
            >
              <MenuItem value="flatPine">Flat Pine</MenuItem>
              <MenuItem value="groovedPine">Grooved Pine</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Height Calculation Method */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Calculate Door Height By</InputLabel>
            <Select
              name="heightCalculationMethod"
              value={formData.heightCalculationMethod}
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
        </Grid>

        {/* Width Calculation Method */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Calculate Door Width By</InputLabel>
            <Select
              name="widthCalculationMethod"
              value={formData.widthCalculationMethod}
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
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CalculatorForm; 