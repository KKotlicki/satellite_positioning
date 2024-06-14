import { Box, Typography } from "@mui/material";
import { useRef } from "react";
import { useObservationPath, useTime } from "@/services/store";


const Receiver = () => {
  const containerRef = useRef(null);
  const selectedTimeIndex = useTime();
  const observationPath = useObservationPath();

  if (!observationPath) {
    return <Typography>No observation data available.</Typography>;
  }

  // Assuming selectedTocs is available and mapped correctly
  const selectedTocs = Object.keys(observationPath).map(Number);
  const selectedToc = selectedTocs[selectedTimeIndex];
  if (selectedToc === undefined) {
    return <Typography>No time data available.</Typography>;
  }
  const position = observationPath[selectedToc];

  if (!position) {
    return <Typography>No position data available for the selected time.</Typography>;
  }

  return (
    <Box
      ref={containerRef}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Typography variant="h6">GNSS Receiver Position</Typography>
      <Typography variant="body1">Time (TOC): {selectedToc} seconds</Typography>
      <Typography variant="body1">X: {position.x.toFixed(3)} meters</Typography>
      <Typography variant="body1">Y: {position.y.toFixed(3)} meters</Typography>
      <Typography variant="body1">Z: {position.z.toFixed(3)} meters</Typography>
    </Box>
  );
};

export default Receiver;
