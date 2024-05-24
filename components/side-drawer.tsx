import { drawerWidth } from "@/global/constants";
import { useNavigationFile } from "@/stores/navigation-store";
import { Box, Drawer, Toolbar } from "@mui/material";
import SettingsView from "./settings-view";
import SideDrawerSelection from "./side-drawer-selection";
import DateTimeSlider from "./time-slider";


export default function SideDrawer() {
  const navigationFile = useNavigationFile()

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
        {navigationFile !== null && (
          <>
            <DateTimeSlider />
            <SideDrawerSelection />
          </>
        )}
        <SettingsView />
      </Box>
    </Drawer>
  )
}
