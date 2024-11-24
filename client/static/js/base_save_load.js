function downloadObjectAsJson(exportTextJSON) {
    var dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(exportTextJSON);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "source.txt");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}



function save_dump() {
    var source_html = document.getElementById("code-contents").innerHTML;
    console.log(source_html);
    downloadObjectAsJson(source_html);
}
function load_file(data) {
    document.getElementById("code-contents").innerHTML = data;
}

document.getElementById('saveFile').addEventListener('click', save_dump);