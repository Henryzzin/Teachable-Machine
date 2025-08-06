let model, maxPredictions;

// Carrega o modelo ao iniciar
document.addEventListener("DOMContentLoaded", async () => {
  const URL = "/model/";
  try {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();
    document.getElementById("result").innerHTML = "Modelo carregado! Pronto para uso.";
  } catch (err) {
    document.getElementById("result").innerHTML = "Erro ao carregar o modelo: " + err;
    console.error("Erro ao carregar o modelo:", err);
  }
});

// Webcam IA
let webcam;
async function init() {
  if (!model) {
    document.getElementById("result").innerHTML = "O modelo ainda não foi carregado. Aguarde.";
    return;
  }
  webcam = new tmImage.Webcam(224, 224, true);
  await webcam.setup();
  await webcam.play();
  document.getElementById("webcam").style.display = "block";
  document.getElementById("webcam").appendChild(webcam.canvas);
  loop();
}

async function loop() {
  webcam.update();
  await predictWebcam();
  requestAnimationFrame(loop);
}

async function predictWebcam() {
  const prediction = await model.predict(webcam.canvas);
  showResult(prediction);
}

// Imagem Upload
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = document.getElementById("uploadedImage");
    img.src = event.target.result;
    img.style.display = "block";
    img.onload = function() {
      document.getElementById("result").innerHTML = "Imagem carregada! Pronta para classificar.";
    };
  };
  reader.readAsDataURL(file);
});

async function predictImage() {
  const img = document.getElementById("uploadedImage");
  if (!model) {
    document.getElementById("result").innerHTML = "O modelo ainda não foi carregado. Aguarde.";
    return;
  }
  if (!img.src || img.naturalWidth === 0 || img.style.display === "none") {
    document.getElementById("result").innerHTML = "Carregue uma imagem válida antes de classificar.";
    return;
  }
  document.getElementById("result").innerHTML = "Classificando...";
  const prediction = await model.predict(img);
  showResult(prediction);
}

function showResult(prediction) {
  let resultText = "";
  for (let i = 0; i < maxPredictions; i++) {
    resultText += `${prediction[i].className}: ${(prediction[i].probability * 100).toFixed(2)}%<br>`;
  }
  document.getElementById("result").innerHTML = resultText;
}