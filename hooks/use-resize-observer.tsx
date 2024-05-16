import { type MutableRefObject, useEffect, useState } from "react";


export const useResizeObserver = (containerRef: MutableRefObject<null>) => {
  const [size, setSize] = useState(0)
  const [margin, setMargin] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const navbar = document.querySelector(".MuiAppBar-root") as HTMLElement
      const navbarHeight = navbar ? navbar.offsetHeight : 0
      const availableHeight = window.innerHeight - navbarHeight
      const drawer = document.querySelector(".MuiDrawer-root") as HTMLElement
      const drawerWidth = drawer ? drawer.offsetWidth : 0
      const availableWidth = window.innerWidth - drawerWidth

      const targetSize = Math.min(availableWidth, availableHeight) * 0.8
      const targetMargin = Math.min(availableWidth, availableHeight) * 0.1

      if (containerRef.current) {
        setSize(targetSize)
        setMargin(targetMargin)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const resizeObserver = new ResizeObserver(handleResize)
    const currentContainerRef = containerRef.current

    if (currentContainerRef) {
      resizeObserver.observe(currentContainerRef)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      if (currentContainerRef) {
        resizeObserver.unobserve(currentContainerRef)
      }
    }
  })

  return { size, margin }
}