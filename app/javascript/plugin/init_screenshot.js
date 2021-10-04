const initScreenshot = () => {
  function download(url){
    var a = $("<a style='display:none' id='js-downloder'>")
    .attr("href", url)
    .attr("download", "test.png")
    .appendTo("body");

    a[0].click();

    a.remove();
  }

  function saveCapture(element) {
    html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      ignoreElements: (node) => {
        return node.nodeName === 'IFRAME';
      },
      onrendered: function (canvas) {
        var dataUrl= canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        window.location.href = dataUrl;
    }
    })
    .then(function(canvas) {
      download(canvas.toDataURL("image/png"));
    })
  }


  $('#generateScreenshot').click(function(){
    var element = document.querySelector(".slide_container");
    saveCapture(element)
  })
};

export { initScreenshot };