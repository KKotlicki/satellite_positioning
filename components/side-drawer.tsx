import { drawerWidth } from "@/constants/constants";
import { Box, Drawer, Toolbar } from "@mui/material";
import SettingsView from "./settings-view";
import SideDrawerSelection from "./side-drawer-selection";
import TimeSlider from "./time-slider";


export default function SideDrawer() {

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box"
        }
      }}
      variant='permanent'
      anchor='left'
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <TimeSlider />
        <SideDrawerSelection />
        <SettingsView />
      </Box>
    </Drawer>
  )
}
