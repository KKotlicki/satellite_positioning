import { drawerWidth } from "@/constants/constants";
import useStore from "@/store/store";
import { Box, Drawer, Toolbar } from "@mui/material";
import { useZustand } from "use-zustand";
import SettingsView from "./settings-view";
import SideDrawerSelection from "./side-drawer-selection";
import TimeSlider from "./time-slider";


export default function SideDrawer() {
  const almanacName = useZustand(useStore, (state) => state.almanacName)

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
        {almanacName && (
          <>
            <TimeSlider />
            <SideDrawerSelection />
          </>
        )}
        <SettingsView />
      </Box>
    </Drawer>
  )
}
