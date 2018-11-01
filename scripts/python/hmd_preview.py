"""
Preview your Houdini VR renders in HMD

It takes image from displayed image plane in Render View pane and displays it in your HMD
"""
import hou
import logging
import numpy as np

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

def getImageData():
    """
    Returns a dictionary with information about displayed image

    it contains:
        img_plane - string with name of displayed image plane
        res - tuple of two ints for X and Y image resolution
        pixels - tuple of pixel tuples (4 floats, RGBA), in row-major order starting at the bottom left corner of the image
    """

    viewer = hou.ui.paneTabOfType(hou.paneTabType.IPRViewer)
    img_data = {}
    
    if not viewer:
        log.warning("No Render View pane found")
        return None
    else:
        if viewer.planes() == ():
            log.warning("No image planes found, is your scene rendered?")
            return None
        else:
            img_plane = viewer.displayedPlane()
            
            img_data["img_plane"] = img_plane
            img_data["res"] = viewer.imageResolution()
            img_data["pixels"] = viewer.pixels(img_plane)

            return img_data

def plotImage(img_data):
    """
    Plots gama-corrected image using matplotlib
    Depends on matplotlib
    """
    import matplotlib.pyplot as plt

    pixels = img_data["pixels"]
    res = img_data["res"]

    pixels = np.array(pixels)
    pixels = pixels.reshape(res[1], res[0], 4)
    pixels = np.flip(pixels, 0)

    pixels[:,:,:3] = pixels[:,:,:3]**(1/2.2)

    fig2d = plt.figure()
    plot = fig2d.add_subplot(111)
    imgplot = plt.imshow(pixels)
    plot.set_title(img_data["img_plane"])

    plt.show()

    return