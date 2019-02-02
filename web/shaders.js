AFRAME.registerShader("uv-show", {
    /*
    A simple debug shader showing UV coordinates as colors
    */
    raw: false,
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        varying vec2 vUv;

        void main () {
            gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
        }
    `
});

AFRAME.registerShader("vr-map", {
    /*
    Shader to display offline VR renders which contain both eyes in one texture (stereo: 1), or only one eye (stereo: 0)
    */
    schema: {
        src:                        {type: "map", is: "uniform"},
        stereo:                     {type: "int", is: "uniform"}, // 0: mono, 1: stereo
        layout:                     {type: "int", is: "uniform"}, //  0: horizontal (left-right), 1: vertical (top-bottom)
        eye:                        {type: "int", is: "uniform"} // 0: left eye, 1: right eye
    },
    raw: true,
    vertexShader: `
        attribute vec2 uv;
        attribute vec3 position;

        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform int stereo;
        uniform int layout;
        uniform int eye;

        varying vec2 vUv;

        void main() {
            float offset = 0.0;
            if (eye == 0)
                offset = 0.0;
            else if (eye == 1)
                offset = 0.5;

            if (stereo == 1)
            {
                if (layout == 0)
                {
                    vUv = vec2(uv.x/2.0+offset, uv.y);
                }
                else if (layout == 1)
                {
                    vUv = vec2(uv.x, uv.y/2.0+(0.5-offset));
                }
            }
            if (stereo == 0)
                vUv = vec2(uv.x, uv.y);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision highp float;
        uniform sampler2D src;
        varying vec2 vUv;

        void main () {
            vec2 uv = vUv;
            vec4 texColor = texture2D(src, uv);
            gl_FragColor = texColor;
        }
    `
});
