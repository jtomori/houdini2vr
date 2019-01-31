AFRAME.registerComponent("load-map", {
    /*
    Reads img_path parameter from url and sets its value to src property of material component - assigns a texture
    */
    init: function () {
        // get img_path parameter from url
        var img_path = AFRAME.utils.getUrlParameter("img_path");

        // check if img_path parameter was found
        if (img_path === null)
            console.error("img_path parameter not found in url");
        else
        {
            // modify texture path - set src property in material component
            var el = this.el;
            el.setAttribute("material", {src: img_path});
        }
    }
});

AFRAME.registerComponent("vr-material", {
    /*
    Sets entity's shader to vr-map and sets left_right_or_top_bottom and left_or_right properties based on parameters in url
    */
    init: function () {
        // get parameters from url
        var left_right_or_top_bottom = AFRAME.utils.getUrlParameter("left_right_or_top_bottom");
        var left_or_right = AFRAME.utils.getUrlParameter("left_or_right");
        var stereo = AFRAME.utils.getUrlParameter("stereo");
        
        // set shader to vr-map
        var el = this.el;
        el.setAttribute("material", "shader", "vr-map");

        // check if parameters were found and modify material properties
        if (stereo === null)
            console.warn("stereo parameter was not found in url");
        else
            el.setAttribute("material", "stereo", stereo);

        if (stereo === "1" && left_right_or_top_bottom === null)
            console.warn("stereo is enabled and left_right_or_top_bottom parameter was not found in url");
        else
            el.setAttribute("material", "left_right_or_top_bottom", left_right_or_top_bottom);

        // left_or_right is optional and used more for debugging
        if (left_or_right === null)
            console.log("left_or_right parameter was not found in url");
        else
            el.setAttribute("material", "left_or_right", left_or_right);
    }
});
