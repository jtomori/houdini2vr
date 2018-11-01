# Preview Houdini VR renders in HMD
It takes image from displayed image plane in Render View pane and displays it in your HMD


### Setup
* Add this repository into **HOUDINI_PATH** environment variable (e.g. in *houdini.env* file)
    ```
    HOUDINI_PATH = &;/home/juraj/Work/houdini_hmd_preview/
    ```
* Enable **HMD VR Preview** shelf

### Usage
* **Reload** - for development purpose only, reimports *hmd_preview* module
* **Plot image** - displays rendered image (requires *matplotlib*)