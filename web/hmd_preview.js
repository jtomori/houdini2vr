var url_string = window.location.href;
var url = new URL(url_string);
var img_path = url.searchParams.get("img_path");

sky = document.getElementById("map");
sky.setAttribute("material", "src", img_path);
