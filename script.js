const CLASSES = [
    "Bean (Kacang Koro)", "Bitter Gourd (Pare)", "Bottle Gourd (Labu Air)", "Brinjal (Terong)", "Broccoli (Brokoli)", 
    "Cabbage (Kubis)", "Capsicum (Paprika)", "Carrot (Wortel)", "Cauliflower (Bunga Kol)", "Cucumber (Timun)", 
    "Papaya", "Potato (Kentang)", "Pumpkin", "Radish (Lobak)", "Tomato (Tomat)"
];

const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const dropArea = document.getElementById('drop-area');
const previewContainer = document.getElementById('preview-container');
const resultCard = document.getElementById('result-card');
const errorCard = document.getElementById('error-card');
const loading = document.getElementById('loading');
const resultImgDisplay = document.getElementById('result-img-display');

let model;


async function loadModel() {
    try {
        model = await tf.loadLayersModel('model/model.json');
        imageUpload.disabled = false; 
        console.log("Model loaded successfully");
        
    } catch (error) {
        console.error("Gagal memuat model:", error);
        alert("Gagal memuat model. Pastikan Anda menjalankan ini di Local Server (Live Server).");
    }
}

loadModel();

function handleFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            resultImgDisplay.src = e.target.result; 
            dropArea.classList.add('hidden'); 
            previewContainer.classList.remove('hidden'); 
            resultCard.classList.add('hidden'); 
            errorCard.classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
}

imageUpload.addEventListener('change', function(event) {
    handleFile(event.target.files[0]);
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

dropArea.addEventListener('drop', handleDrop, false);
function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFile(files[0]);
}

document.getElementById('btn-predict').addEventListener('click', async function() {
    previewContainer.classList.add('hidden');
    loading.classList.remove('hidden');
    setTimeout(async () => {
        try {
            await predictAndShowResult(); 
        } catch (err) {
            console.error(err);
            loading.classList.add('hidden');
            errorCard.classList.remove('hidden');
            previewContainer.classList.remove('hidden');
        }
    }, 100);
});

async function predictAndShowResult() {
    if(!model) {
        alert("Model belum siap, harap tunggu sebentar.");
        location.reload();
        return;
    }

    tf.tidy(() => {
        let tensor = tf.browser.fromPixels(imagePreview);
        const resized = tf.image.resizeBilinear(tensor, [128, 128]);
        const normalized = resized.div(255.0); 
        const batched = normalized.expandDims(0);
        const prediction = model.predict(batched);
        const values = prediction.dataSync();
        const maxIndex = values.indexOf(Math.max(...values));
        
        const className = CLASSES[maxIndex];
        const probability = (values[maxIndex] * 100).toFixed(1);

        document.getElementById('prediction-name').innerText = className;
        document.getElementById('prediction-score').innerText = probability + "%";
        
        loading.classList.add('hidden');
        resultCard.classList.remove('hidden');
    });
}