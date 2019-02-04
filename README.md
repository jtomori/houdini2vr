# Houdini 2 VR
## Preview Houdini VR renders in HMD
It takes image from displayed image plane in Render View pane and displays it in your HMD.

<br>

### Setup
* Add this repository into **HOUDINI_PATH** environment variable (e.g. in *houdini.env* file)
    ```
    HOUDINI_PATH = &;/home/juraj/Work/houdini_hmd_preview/
    ```
* Enable **HMD VR Preview** shelf

<br>

### Usage
* **Reload** - for development purpose only, reimports *hmd_preview* module
* **Plot image** - displays rendered image (requires *matplotlib*)
* **Save as PNG** - saves rendered image in *$HIP/tmp/tmp.png*
* **Show in browser** - starts a local web server if not already running, saves currently rendered image to temp directory and opens a web browser with the image

<br>

### Support
This tool can support any renderer plugin, which can render into Houdini's **Render View** pane. It has been tested with the following renderers:
* Mantra
* Arnold
* Redshift
    * *Note: you need to make sure that **Linked ROP** parameter on your **Redshift_IPR** node is pointing to the corresponding **Redshift** node.*

If your renderer is missing, then let me know, it can be easily added.
