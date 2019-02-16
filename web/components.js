AFRAME.registerComponent("load-map", {
    /*
    Reads img_path parameter from url and sets its value to src property of material component - assigns a texture
    */
    init: function () {
        // get img_path parameter from url
        var img_path = AFRAME.utils.getUrlParameter("img_path");

        // check if img_path parameter was found
        if (img_path === "")
            console.error("img_path parameter not found in url");
        else
        {
            // modify texture path - set src property in material component
            this.el.setAttribute("material", {src: img_path});
        }
    }
});

AFRAME.registerComponent("vr-material", {
    /*
    Sets entity's shader to vr-map and sets layout and stereo properties on material (used by vr-map shader)
    */
    init: function () {
        // get parameters from url
        var layout = AFRAME.utils.getUrlParameter("layout");
        var stereo = AFRAME.utils.getUrlParameter("stereo");
        
        // set shader to vr-map
        var el = this.el;
        el.setAttribute("material", "shader", "vr-map");

        // check if parameters were found and modify material properties
        if (stereo === "")
        {
            console.warn("stereo parameter was not found in the url, assuming mono mode (the same as stereo=0)");
            el.setAttribute("material", "stereo", 0);
        }
        else
            el.setAttribute("material", "stereo", stereo);

        if (stereo === "1" && layout === "" )
            console.warn("stereo is enabled and layout parameter was not found in the url");
        else
        {
            el.setAttribute("material", "layout", layout);
        }
    }
});

AFRAME.registerComponent("stereo", {
    /*
    Sets eye property on material (used by vr-map shader) for corresponding eye and assigns it to the expected layer (used by stereo camera rig in VR mode)
    */
    schema: {
        eye:    {type: "string", default: "left"}
    },
    update: function (old_data) {
        var data = this.data;
        var el = this.el;
        
        if (data.eye !== old_data.eye)
        {
            var object_3D = this.el.object3D.children[0];
            
            // move (and disable all other layers, e.g. default 0) to layer 1 for left eye and 2 for right eye
            if (data.eye === "left")
            {
                object_3D.layers.set(1);
                el.setAttribute("material", "eye", 0);
            }
            else if (data.eye === "right")
            {
                object_3D.layers.set(2);
                el.setAttribute("material", "eye", 1);
            }
            
            //console.log(`Eye set on "${this.el.id}" to "${this.data.eye}"`);
        }
    }
});

AFRAME.registerComponent("stereo-cam", {
    /*
    Assigns mono camera (in non-VR mode) to layers - lets you enable which objects to see
    */
    init: function () {
        var children_types = [];

        this.el.object3D.children.forEach( function (item, index, array) {
            children_types[index] = item.type;
        });

        var root_index = children_types.indexOf("PerspectiveCamera");
        var rootCam = this.el.object3D.children[root_index];
        
        // add layers 1 and 2 to the camera (0 is on by default)
        rootCam.layers.enable(1);
        rootCam.layers.enable(2);
    }
});

AFRAME.registerComponent("ui", {
    /*
    Displays dat.gui interface which controls shader properties of left and right eye spheres
    */
    init: function () {
        // fetch sphere entities
        var sphere_left = document.querySelector('#sphere_left');
        var sphere_right = document.querySelector('#sphere_right');
        var link = document.querySelector('#refresh_link');

        var gui = new dat.GUI();

        // create controls object containing parameters
        var controls = {
            exposure: 0,
            gamma_correct: true,
            auto_refresh: false,
            reset: function() {
                this.exposure = 0;
                this.gamma_correct = true;
                this.auto_refresh = false;
            }
        };

        // fetch auto_refresh param from url and set initial value in ui
        var auto_refresh_parm = AFRAME.utils.getUrlParameter("auto_refresh");
        if (auto_refresh_parm === "1")
            controls.auto_refresh = true;

        gui.add(controls, "exposure").min(-8).max(8).name("Exposure").step(0.01).onChange(function() {
            sphere_left.setAttribute("material", "exposure", controls.exposure);
            sphere_right.setAttribute("material", "exposure", controls.exposure);
        });

        gui.add(controls, "gamma_correct").name("Gamma Correct").onChange(function() {
            sphere_left.setAttribute("material", "gamma_correct", +controls.gamma_correct);
            sphere_right.setAttribute("material", "gamma_correct", +controls.gamma_correct);
        });

        gui.add(controls, "auto_refresh").name("Auto Refresh").onChange(function() {
            link.setAttribute("auto-refresh", "enabled", controls.auto_refresh);
        });

        gui.add(controls, "reset").name("Reset").onFinishChange(function() {
            // set properties on spheres entities
            sphere_left.setAttribute("material", "exposure", controls.exposure);
            sphere_right.setAttribute("material", "exposure", controls.exposure);
            sphere_left.setAttribute("material", "gamma_correct", +controls.gamma_correct);
            sphere_right.setAttribute("material", "gamma_correct", +controls.gamma_correct);
            link.setAttribute("auto-refresh", "enabled", controls.auto_refresh);
            
            // update ui display
            for (var i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
        });

        // collapse by default
        //gui.close();
    }
});

AFRAME.registerComponent("auto-refresh", {
    /*
    Component to automatically refresh this web page every N seconds (this.refresh_rate)
    */
    schema: {
        enabled:            {type: "boolean", default: "false"},
        save_interval:      {type: "int", default: 5}
    },
    init: function () {
        this.link_comp = this.el.components.link;
        this.link_comp.data.href = window.location.pathname + window.location.search;

        this.last_tick = 0;

        // get auto_refresh, save_interval params from url and set data to it
        var param_enabled = AFRAME.utils.getUrlParameter("auto_refresh");
        if (param_enabled === "1")
            this.data.enabled = true;

        var param_interval = AFRAME.utils.getUrlParameter("save_interval");
        if (param_interval !== "")
            this.data.save_interval = parseInt(param_interval);
        
    },
    update: function (old_data) {
        // update this.link_comp.data.href based on changes (e.g. from UI)
        if (this.data.enabled !== old_data.enabled)
        {
            // set url parm
            var parms = new URLSearchParams(window.location.search);
            parms.set("auto_refresh", +this.data.enabled);
            var parms_string = parms.toString();
            var new_url = window.location.pathname + "?" + decodeURIComponent(parms_string);
            
            // update window url and link data
            window.history.pushState("object or string", "Title", new_url);
            this.link_comp.data.href = new_url;
        }
    },
    tick: function (time, timeDelta) {
        var time_sec = Math.round(time / 1000);

        if (this.data.enabled && time_sec % this.data.save_interval === 0 && this.last_tick !== time_sec)
        {
            this.last_tick = time_sec;
            console.log(`Time: "${time_sec}", refreshing..`);
            this.link_comp.navigate();
        }
    }
});

AFRAME.registerComponent("print-layers", {
    /*
    Prints layer mask, layers numbering is going from right to left
    */
    update: function () {
        var object_3D = this.el.object3D.children[0];
        console.log(`layer mask for "${this.el.id}" is "${(object_3D.layers.mask).toString(2)}"`);
    }
});

AFRAME.registerComponent("set-name", {
    /*
    Sets Object3D name to ID of the entity, used for debugging
    */
    init: function () {
        var object_3D = this.el.object3D.children[0];
        object_3D.name = this.el.id;
    }
});

AFRAME.registerComponent("print-scene-graph", {
    /*
    Prints scene graph
    */
    update: function () {
        print_graph(this.el.object3D);
    }
});

function print_graph(obj) {
    /* 
    Traverses three scene and prints a scene graph
    */
    console.group(obj.name + ' <%o> ', obj);
    obj.children.forEach( print_graph );
    console.groupEnd();
};
