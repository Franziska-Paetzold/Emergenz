
//##### ##### ##### ##### video recording ##### #### ##### ##### ##### ##### 

let btn = document.querySelector('button');
let chunks = [];

function record() {
  chunks.length = 0;
  btn = document.querySelector('button');
  let stream = document.querySelector('canvas').captureStream(30),
        recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        if (e.data.size) {
        chunks.push(e.data);
        }
    };
    recorder.onstop = exportVideo;
    btn.onclick = e => {
        recorder.stop();
        btn.textContent = 'start recording';
        btn.onclick = record;
    };
    recorder.start();
    btn.textContent = 'stop recording';
}

function exportVideo(e) {
  var blob = new Blob(chunks);
  //download(blob, "video.mp4");
  var vid = document.createElement('video');
  vid.id = 'recorded'
  vid.controls = true;
  vid.src = URL.createObjectURL(blob);
  document.body.appendChild(vid);
  vid.play();
}
